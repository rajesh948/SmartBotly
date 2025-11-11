// ============================================
// BullMQ Message Worker
// ============================================
// This worker processes WhatsApp messages asynchronously
// Run separately with: npm run worker

import { Worker, Queue } from 'bullmq';
import dotenv from 'dotenv';
import { connectDatabase } from '../config/database';
import { bullMQConnection } from '../config/redis';
import { CONSTANTS } from '../config/constants';
import { logger } from '../utils/logger';
import { MessageJobData, LLMAction, MessageDirection, MessageType } from '../types';
import { Conversation } from '../models/Conversation';
import { Message } from '../models/Message';
import { Order, OrderStatus } from '../models/Order';
import { Product } from '../models/Product';
import { findMatchingFAQ, isLikelyFAQQuery } from '../services/faqMatcher';
import { buildPromptWithContext } from '../services/promptBuilder';
import { callLLM, parseLLMResponse } from '../services/aiClient';
import { sendTextMessage, sendMediaMessage, downloadMedia } from '../services/whatsappService';
import { uploadMedia } from '../services/mediaService';
import { findProductBySKU } from '../services/productMatcher';

dotenv.config();

// ============================================
// Initialize Queue (for job status)
// ============================================

const messageQueue = new Queue(CONSTANTS.QUEUE.MESSAGE_QUEUE, {
  connection: bullMQConnection,
});

// ============================================
// Message Processing Logic
// ============================================

async function processMessage(jobData: MessageJobData): Promise<void> {
  const { clientId, customerPhone, customerName, messageType, messageContent, mediaId, whatsappMessageId, timestamp } = jobData;

  logger.info('Processing message job', {
    clientId,
    customerPhone,
    messageType,
  });

  try {
    // STEP 1: Find or create conversation
    let conversation = await Conversation.findOne({
      clientId,
      customerPhone,
    });

    if (!conversation) {
      conversation = await Conversation.create({
        clientId,
        customerPhone,
        customerName: customerName || customerPhone,
        status: 'active',
        lastMessageAt: new Date(timestamp),
      });

      logger.info('New conversation created', {
        conversationId: conversation._id,
      });
    } else {
      // Update last message time
      conversation.lastMessageAt = new Date(timestamp);
      await conversation.save();
    }

    // STEP 2: Handle media if present
    let mediaUrl: string | undefined;
    let finalMessageContent = messageContent;

    if (mediaId && messageType !== 'text') {
      logger.info('Downloading media from WhatsApp', { mediaId });

      const mediaData = await downloadMedia(mediaId);

      if (mediaData) {
        // Upload to Cloudinary/S3
        const uploadResult = await uploadMedia(mediaData.buffer, {
          folder: `clients/${clientId}/media`,
          resourceType: messageType === 'image' ? 'image' : 'auto',
        });

        mediaUrl = uploadResult.url;

        logger.info('Media uploaded successfully', { mediaUrl });

        // For images, we could implement image recognition here (Phase 2)
        // TODO: Add image recognition for product matching
        // const recognizedProduct = await recognizeProductFromImage(mediaData.buffer, clientId);
      }
    }

    // STEP 3: Save incoming message to DB
    const inboundMessage = await Message.create({
      conversationId: conversation._id,
      clientId,
      direction: MessageDirection.INBOUND,
      type: messageType,
      content: finalMessageContent,
      mediaUrl,
      whatsappMessageId,
      timestamp: new Date(timestamp),
    });

    logger.info('Inbound message saved', {
      messageId: inboundMessage._id,
    });

    // STEP 4: Check for exact FAQ match (fast path)
    if (isLikelyFAQQuery(finalMessageContent)) {
      logger.info('Query appears to be FAQ-like, checking matches');

      const faqMatch = await findMatchingFAQ(clientId, finalMessageContent);

      if (faqMatch && faqMatch.score > CONSTANTS.THRESHOLDS.FAQ_MATCH) {
        logger.info('High-confidence FAQ match found', {
          question: faqMatch.faq.question,
          score: faqMatch.score,
        });

        // Send FAQ answer directly
        await sendTextMessage(customerPhone, faqMatch.faq.answer);

        // Save outbound message
        await Message.create({
          conversationId: conversation._id,
          clientId,
          direction: MessageDirection.OUTBOUND,
          type: MessageType.TEXT,
          content: faqMatch.faq.answer,
          timestamp: new Date(),
          metadata: {
            source: 'FAQ',
            faqId: faqMatch.faq._id,
            matchScore: faqMatch.score,
          },
        });

        logger.info('FAQ answer sent successfully');
        return; // Early exit - no need for LLM
      }
    }

    // STEP 5: Build dynamic prompt with context
    logger.info('Building dynamic prompt with context');

    const { systemPrompt, messages } = await buildPromptWithContext(
      clientId,
      conversation._id.toString(),
      finalMessageContent
    );

    logger.debug('Prompt built', {
      systemPromptLength: systemPrompt.length,
      messageCount: messages.length,
    });

    // STEP 6: Call LLM (Claude or OpenAI)
    logger.info('Calling LLM for response');

    const llmRawResponse = await callLLM({
      systemPrompt,
      messages,
    });

    // STEP 7: Parse JSON response
    const llmResponse = parseLLMResponse(llmRawResponse);

    logger.info('LLM response parsed', {
      action: llmResponse.action,
      hasReply: !!llmResponse.reply,
    });

    // STEP 8: Execute action based on LLM response
    await executeAction(llmResponse, {
      clientId,
      conversationId: conversation._id.toString(),
      customerPhone,
      customerName: customerName || conversation.customerName,
    });

    logger.info('Message processed successfully', {
      conversationId: conversation._id,
    });

  } catch (error) {
    logger.error('Error processing message:', error);
    throw error; // Re-throw for BullMQ retry mechanism
  }
}

// ============================================
// Execute Action from LLM Response
// ============================================

async function executeAction(
  llmResponse: any,
  context: {
    clientId: string;
    conversationId: string;
    customerPhone: string;
    customerName?: string;
  }
): Promise<void> {
  const { action, reply, mediaKey, metadata } = llmResponse;
  const { clientId, conversationId, customerPhone, customerName } = context;

  logger.info('Executing action', { action, hasReply: !!reply });

  switch (action) {
    case LLMAction.SEND_TEXT:
    case LLMAction.NONE:
      // Simple text response
      if (reply) {
        await sendTextMessage(customerPhone, reply);

        await Message.create({
          conversationId,
          clientId,
          direction: MessageDirection.OUTBOUND,
          type: MessageType.TEXT,
          content: reply,
          timestamp: new Date(),
          metadata: { action, ...metadata },
        });
      }
      break;

    case LLMAction.SEND_MEDIA:
      // Send product image
      if (mediaKey) {
        const product = await findProductBySKU(clientId, mediaKey);

        if (product && product.imageUrls.length > 0) {
          await sendMediaMessage(
            customerPhone,
            product.imageUrls[0],
            reply || `Here's ${product.name} - ${product.currency} ${product.price}`
          );

          await Message.create({
            conversationId,
            clientId,
            direction: MessageDirection.OUTBOUND,
            type: MessageType.IMAGE,
            content: reply || product.name,
            mediaUrl: product.imageUrls[0],
            timestamp: new Date(),
            metadata: { action, productId: product._id, ...metadata },
          });
        } else {
          // Fallback to text if product not found
          await sendTextMessage(customerPhone, reply || 'Product image not available');
        }
      }
      break;

    case LLMAction.CREATE_ORDER:
      // Create order from LLM metadata
      if (metadata?.productIds && metadata.productIds.length > 0) {
        logger.info('Creating order', { productIds: metadata.productIds });

        const products = await Product.find({
          _id: { $in: metadata.productIds },
          clientId,
        });

        if (products.length > 0) {
          const items = products.map((p) => ({
            productId: p._id.toString(),
            productName: p.name,
            quantity: 1, // TODO: Extract quantity from conversation
            price: p.price,
          }));

          const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

          const order = await Order.create({
            clientId,
            conversationId,
            customerPhone,
            customerName,
            items,
            totalAmount,
            currency: products[0].currency,
            status: OrderStatus.PENDING,
            notes: metadata.notes || '',
          });

          logger.info('Order created successfully', { orderId: order._id });

          // Send confirmation
          const confirmationMessage = `${reply}\n\nOrder ID: ${order._id}\nTotal: ${order.currency} ${totalAmount}\n\nWe'll contact you shortly to confirm!`;

          await sendTextMessage(customerPhone, confirmationMessage);

          await Message.create({
            conversationId,
            clientId,
            direction: MessageDirection.OUTBOUND,
            type: MessageType.TEXT,
            content: confirmationMessage,
            timestamp: new Date(),
            metadata: { action, orderId: order._id, ...metadata },
          });
        } else {
          await sendTextMessage(customerPhone, 'Sorry, the products you selected are no longer available.');
        }
      }
      break;

    case LLMAction.ESCALATE:
      // Mark conversation as escalated
      await Conversation.findByIdAndUpdate(conversationId, {
        status: 'escalated',
      });

      const escalationMessage = `${reply}\n\nYour query has been escalated to our team. We'll get back to you shortly!`;

      await sendTextMessage(customerPhone, escalationMessage);

      await Message.create({
        conversationId,
        clientId,
        direction: MessageDirection.OUTBOUND,
        type: MessageType.TEXT,
        content: escalationMessage,
        timestamp: new Date(),
        metadata: { action, ...metadata },
      });

      logger.info('Conversation escalated', { conversationId });
      break;

    case LLMAction.RESERVE_STOCK:
      // TODO: Implement stock reservation
      logger.info('Stock reservation requested', { metadata });

      await sendTextMessage(customerPhone, reply || 'Items reserved! Please complete your order within 24 hours.');

      await Message.create({
        conversationId,
        clientId,
        direction: MessageDirection.OUTBOUND,
        type: MessageType.TEXT,
        content: reply || 'Items reserved',
        timestamp: new Date(),
        metadata: { action, ...metadata },
      });
      break;

    default:
      logger.warn('Unknown action type', { action });
      break;
  }
}

// ============================================
// Initialize Worker
// ============================================

async function startWorker() {
  try {
    // Connect to database
    await connectDatabase();

    logger.info('Starting BullMQ worker...');

    // Create worker
    const worker = new Worker(
      CONSTANTS.QUEUE.MESSAGE_QUEUE,
      async (job) => {
        await processMessage(job.data);
      },
      {
        connection: bullMQConnection,
        concurrency: CONSTANTS.QUEUE_SETTINGS.CONCURRENCY,
        limiter: {
          max: 10, // Max 10 jobs per duration
          duration: 1000, // Per second
        },
        settings: {
          backoffStrategy: (attemptsMade) => {
            return Math.min(attemptsMade * 2000, 10000); // Exponential backoff, max 10s
          },
        },
      }
    );

    // Worker event handlers
    worker.on('completed', (job) => {
      logger.info('Job completed', { jobId: job.id });
    });

    worker.on('failed', (job, err) => {
      logger.error('Job failed', {
        jobId: job?.id,
        error: err.message,
        attempts: job?.attemptsMade,
      });
    });

    worker.on('error', (err) => {
      logger.error('Worker error:', err);
    });

    logger.info('✅ BullMQ worker started successfully', {
      queue: CONSTANTS.QUEUE.MESSAGE_QUEUE,
      concurrency: CONSTANTS.QUEUE_SETTINGS.CONCURRENCY,
    });

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      logger.info('SIGTERM received, closing worker...');
      await worker.close();
      process.exit(0);
    });

  } catch (error) {
    logger.error('Failed to start worker:', error);
    process.exit(1);
  }
}

// Start worker if this file is run directly
if (require.main === module) {
  startWorker();
}

export { messageQueue, processMessage };
