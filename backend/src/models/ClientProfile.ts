import mongoose, { Schema, Document } from "mongoose";

/**
 * ClientProfile Model
 * Stores business information for each client using the SaaS
 */

export interface IClientProfile extends Document {
  businessName: string;
  industry: string;
  whatsappPhoneNumber: string;
  whatsappBusinessAccountId: string;
  aiProvider: "claude" | "openai";
  systemPrompt: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ClientProfileSchema: Schema = new Schema(
  {
    businessName: {
      type: String,
      required: true,
    },
    industry: {
      type: String,
      required: true,
    },
    whatsappPhoneNumber: {
      type: String,
      required: true,
      unique: true,
    },
    whatsappBusinessAccountId: {
      type: String,
      required: true,
    },
    aiProvider: {
      type: String,
      enum: ["claude", "openai"],
      default: "claude",
    },
    systemPrompt: {
      type: String,
      default: "You are a helpful business assistant.",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IClientProfile>("ClientProfile", ClientProfileSchema);
