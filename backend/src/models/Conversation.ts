import mongoose, { Schema, Document } from "mongoose";

/**
 * Conversation Model
 * Tracks WhatsApp conversations with customers
 */

export interface IConversation extends Document {
  clientId: mongoose.Types.ObjectId;
  customerPhone: string;
  customerName?: string;
  status: "active" | "resolved" | "escalated";
  lastMessageAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ConversationSchema: Schema = new Schema(
  {
    clientId: {
      type: Schema.Types.ObjectId,
      ref: "ClientProfile",
      required: true,
      index: true,
    },
    customerPhone: {
      type: String,
      required: true,
    },
    customerName: {
      type: String,
    },
    status: {
      type: String,
      enum: ["active", "resolved", "escalated"],
      default: "active",
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Compound index for finding conversations
ConversationSchema.index({ clientId: 1, customerPhone: 1 });

export default mongoose.model<IConversation>("Conversation", ConversationSchema);
