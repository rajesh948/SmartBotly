// ============================================
// Client Model (Business Profile)
// ============================================

import mongoose, { Schema } from 'mongoose';
import { IClient } from '../types';

const clientSchema = new Schema<IClient>(
  {
    businessName: {
      type: String,
      required: true,
      trim: true,
    },
    industry: {
      type: String,
      required: true,
      trim: true,
    },
    whatsappPhoneNumber: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      trim: true,
    },
    website: {
      type: String,
      trim: true,
    },
    logoUrl: {
      type: String,
      trim: true,
    },
    settings: {
      enableAutoResponses: {
        type: Boolean,
        default: true,
      },
      businessHours: {
        start: { type: String, default: '09:00' },
        end: { type: String, default: '18:00' },
        timezone: { type: String, default: 'UTC' },
      },
      fallbackMessage: {
        type: String,
        default: 'Thank you for contacting us. Our team will get back to you shortly.',
      },
      escalationPhoneNumber: {
        type: String,
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster lookups
clientSchema.index({ whatsappPhoneNumber: 1 });
clientSchema.index({ isActive: 1 });

export const Client = mongoose.model<IClient>('Client', clientSchema);
