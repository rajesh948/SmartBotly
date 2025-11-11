// ============================================
// WhatsApp Webhook Controller
// ============================================

import { Request, Response } from 'express';
import { messageQueue } from '../workers/messageWorker';
import { Client } from '../models/Client';
import { validateWebhookSignature } from '../services/whatsappService';
import { logger } from '../utils/logger';
import { WhatsAppWebhookPayload, MessageJobData, MessageType } from '../types';

// ============================================
// Webhook Verification (GET)
// ============================================
// WhatsApp will send a verification request when you configure the webhook

export const verifyWebhook = (req: Request, res: Response): void => {
  try {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    const verifyToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;

    if (mode === 'subscribe' && token === verifyToken) {
      logger.info('Webhook verified successfully');
      res.status(200).send(challenge);
    } else {
      logger.warn('Webhook verification failed', { mode, token });
      res.sendStatus(403);
    }
  } catch (error) {
    logger.error('Error verifying webhook:', error);
    res.sendStatus(500);
  }
};

// ============================================
// Webhook Handler (POST)
// ============================================
// Receives incoming WhatsApp messages

export const handleWebhook = async (req: Request, res: Response): Promise<void> => {
  try {
    // IMPORTANT: Respond 200 immediately to acknowledge receipt
    // Process message asynchronously via queue
    res.sendStatus(200);

    const body: WhatsAppWebhookPayload = req.body;

    // Validate signature if enabled
    if (process.env.ENABLE_WEBHOOK_SIGNATURE_VALIDATION === 'true') {
      const signature = req.headers['x-hub-signature-256'] as string;
      const rawBody = JSON.stringify(req.body);

      if (!signature || !validateWebhookSignature(rawBody, signature)) {
        logger.error('Invalid webhook signature');
        return;
      }
    }

    logger.info('Webhook received', {
      object: body.object,
      entryCount: body.entry?.length,
    });

    // Validate webhook object
    if (body.object !== 'whatsapp_business_account') {
      logger.warn('Unknown webhook object', { object: body.object });
      return;
    }

    // Process each entry
    for (const entry of body.entry) {
      for (const change of entry.changes) {
        const { value } = change;

        // Handle incoming messages
        if (value.messages && value.messages.length > 0) {
          for (const message of value.messages) {
            await handleIncomingMessage(message, value.metadata.phone_number_id, value.contacts?.[0]?.profile?.name);
          }
        }

        // Handle message status updates (delivered, read, etc.)
        if (value.statuses && value.statuses.length > 0) {
          for (const status of value.statuses) {
            logger.debug('Message status update', {
              messageId: status.id,
              status: status.status,
            });
            // TODO: Update message status in database
          }
        }
      }
    }

  } catch (error) {
    logger.error('Error handling webhook:', error);
    // Note: We already sent 200 response, so this error is logged only
  }
};

// ============================================
// Handle Incoming Message
// ============================================

async function handleIncomingMessage(
  message: any,
  phoneNumberId: string,
  customerName?: string
): Promise<void> {
  try {
    const { from, id: whatsappMessageId, type, timestamp } = message;

    logger.info('Processing incoming message', {
      from,
      type,
      messageId: whatsappMessageId,
    });

    // Find client by phone number ID
    // NOTE: In production, you'd map phoneNumberId to clientId
    // For now, we'll use the whatsappPhoneNumber field
    const client = await Client.findOne({
      isActive: true,
      // TODO: Implement proper phone number ID mapping
      // For MVP, we can use the first active client or require phone number match
    });

    if (!client) {
      logger.warn('No client found for phone number', { phoneNumberId });
      return;
    }

    // Extract message content based on type
    let messageContent = '';
    let mediaId: string | undefined;
    let messageType: MessageType = MessageType.TEXT;

    switch (type) {
      case 'text':
        messageContent = message.text?.body || '';
        messageType = MessageType.TEXT;
        break;

      case 'image':
        messageContent = message.image?.caption || '[Image received]';
        mediaId = message.image?.id;
        messageType = MessageType.IMAGE;
        break;

      case 'audio':
        messageContent = '[Audio message]';
        mediaId = message.audio?.id;
        messageType = MessageType.AUDIO;
        break;

      case 'video':
        messageContent = message.video?.caption || '[Video received]';
        mediaId = message.video?.id;
        messageType = MessageType.VIDEO;
        break;

      case 'document':
        messageContent = message.document?.filename || '[Document received]';
        mediaId = message.document?.id;
        messageType = MessageType.DOCUMENT;
        break;

      default:
        logger.warn('Unsupported message type', { type });
        messageContent = '[Unsupported message type]';
    }

    // Enqueue message for processing
    const jobData: MessageJobData = {
      clientId: client._id.toString(),
      customerPhone: from,
      customerName,
      messageType,
      messageContent,
      mediaId,
      whatsappMessageId,
      timestamp,
    };

    await messageQueue.add('process-message', jobData, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
      removeOnComplete: {
        age: 86400, // Keep completed jobs for 24 hours
        count: 1000,
      },
      removeOnFail: {
        age: 604800, // Keep failed jobs for 7 days
      },
    });

    logger.info('Message enqueued for processing', {
      jobId: jobData.whatsappMessageId,
      clientId: client._id,
    });

  } catch (error) {
    logger.error('Error handling incoming message:', error);
  }
}
