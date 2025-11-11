import { Request, Response } from "express";
import { Queue } from "bullmq";
import redisConnection from "../config/redis";
import ClientProfile from "../models/ClientProfile";
import Conversation from "../models/Conversation";
import Message from "../models/Message";

/**
 * WhatsApp Webhook Controller
 * Handles incoming WhatsApp messages and webhook verification
 */

// Create BullMQ queue for message processing
export const messageQueue = new Queue("whatsapp-messages", {
  connection: redisConnection,
});

/**
 * Webhook verification (GET request from WhatsApp)
 */
export const verifyWebhook = (req: Request, res: Response): void => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || "your_verify_token";

  if (mode === "subscribe" && token === verifyToken) {
    console.log("✅ Webhook verified");
    res.status(200).send(challenge);
  } else {
    res.status(403).send("Forbidden");
  }
};

/**
 * Receive webhook messages (POST request from WhatsApp)
 */
export const receiveWebhook = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Respond immediately to WhatsApp (required within 20 seconds)
    res.status(200).send("EVENT_RECEIVED");

    const body = req.body;

    // Check if it's a WhatsApp message
    if (body.object === "whatsapp_business_account") {
      for (const entry of body.entry) {
        for (const change of entry.changes) {
          if (change.field === "messages") {
            const value = change.value;

            // Extract message data
            if (value.messages && value.messages.length > 0) {
              const message = value.messages[0];
              const from = message.from; // Customer phone number
              const messageId = message.id;
              const messageType = message.type;
              const timestamp = message.timestamp;

              // Get message content based on type
              let content = "";
              if (messageType === "text") {
                content = message.text.body;
              } else if (messageType === "image") {
                content = message.image.caption || "[Image]";
              }

              // Get business phone number ID
              const businessPhoneNumberId = value.metadata.phone_number_id;

              // Find client by phone number
              const client = await ClientProfile.findOne({
                whatsappBusinessAccountId: businessPhoneNumberId,
                isActive: true,
              });

              if (!client) {
                console.log("⚠️  Client not found for phone:", businessPhoneNumberId);
                return;
              }

              // Find or create conversation
              let conversation = await Conversation.findOne({
                clientId: client._id,
                customerPhone: from,
              });

              if (!conversation) {
                conversation = new Conversation({
                  clientId: client._id,
                  customerPhone: from,
                  status: "active",
                });
                await conversation.save();
              } else {
                conversation.lastMessageAt = new Date();
                await conversation.save();
              }

              // Save incoming message
              const newMessage = new Message({
                conversationId: conversation._id,
                clientId: client._id,
                sender: "customer",
                content,
                messageType,
                whatsappMessageId: messageId,
                metadata: { timestamp },
              });
              await newMessage.save();

              // Add message to processing queue
              await messageQueue.add("process-message", {
                clientId: String(client._id),
                conversationId: String(conversation._id),
                messageId: String(newMessage._id),
                customerPhone: from,
                content,
                messageType,
              });

              console.log("✅ Message queued for processing:", messageId);
            }
          }
        }
      }
    }
  } catch (error: any) {
    console.error("❌ Webhook error:", error);
  }
};

/**
 * Send WhatsApp message (used by services)
 */
export const sendMessage = async (
  phoneNumberId: string,
  to: string,
  message: string
): Promise<boolean> => {
  try {
    const token = process.env.WHATSAPP_TOKEN;
    const url = `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: { body: message },
      }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log("✅ Message sent:", data.messages[0].id);
      return true;
    } else {
      console.error("❌ Failed to send message:", data);
      return false;
    }
  } catch (error) {
    console.error("❌ Send message error:", error);
    return false;
  }
};
