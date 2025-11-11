// ============================================
// Prompt Template Model
// ============================================

import mongoose, { Schema } from 'mongoose';
import { IPrompt } from '../types';

const promptSchema = new Schema<IPrompt>(
  {
    clientId: {
      type: String,
      ref: 'Client',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['system', 'snippet'],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    variables: {
      type: [String],
      default: [],
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

// Compound indexes
promptSchema.index({ clientId: 1, type: 1, isActive: 1 });

export const Prompt = mongoose.model<IPrompt>('Prompt', promptSchema);
