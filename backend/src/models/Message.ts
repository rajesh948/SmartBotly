import mongoose, { Schema, Document } from "mongoose";

/**
 * Message Model
 * Stores individual WhatsApp messages
 */

export interface IMessage extends Document {
  conversationId: mongoose.Types.ObjectId;
  clientId: mongoose.Types.ObjectId;
  sender: "customer" | "bot" | "agent";
  content: string;
  messageType: "text" | "image" | "document" | "audio";
  whatsappMessageId?: string;
  metadata?: any;
  createdAt: Date;
}

const MessageSchema: Schema = new Schema(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true,
    },
    clientId: {
      type: Schema.Types.ObjectId,
      ref: "ClientProfile",
      required: true,
      index: true,
    },
    sender: {
      type: String,
      enum: ["customer", "bot", "agent"],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    messageType: {
      type: String,
      enum: ["text", "image", "document", "audio"],
      default: "text",
    },
    whatsappMessageId: {
      type: String,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  { timestamps: true }
);

// Index for retrieving conversation history
MessageSchema.index({ conversationId: 1, createdAt: -1 });

export default mongoose.model<IMessage>("Message", MessageSchema);
