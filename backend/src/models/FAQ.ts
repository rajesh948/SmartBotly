import mongoose, { Schema, Document } from "mongoose";

/**
 * FAQ Model
 * Stores frequently asked questions and answers for each client
 */

export interface IFAQ extends Document {
  clientId: mongoose.Types.ObjectId;
  question: string;
  answer: string;
  category: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const FAQSchema: Schema = new Schema(
  {
    clientId: {
      type: Schema.Types.ObjectId,
      ref: "ClientProfile",
      required: true,
      index: true,
    },
    question: {
      type: String,
      required: true,
    },
    answer: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      default: "General",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Index for searching FAQs by client
FAQSchema.index({ clientId: 1, isActive: 1 });

export default mongoose.model<IFAQ>("FAQ", FAQSchema);
