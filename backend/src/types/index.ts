// ============================================
// TypeScript Type Definitions
// ============================================

import { Request } from 'express';
import { Document } from 'mongoose';

// ============================================
// User & Authentication
// ============================================

export enum UserRole {
  ADMIN = 'ADMIN',
  CLIENT = 'CLIENT',
}

export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  clientId?: string; // Reference to Client if role is CLIENT
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: UserRole;
    clientId?: string;
  };
}

// ============================================
// Client (Business Owner)
// ============================================

export interface IClient extends Document {
  businessName: string;
  industry: string;
  whatsappPhoneNumber: string; // Client's WhatsApp Business number
  description?: string;
  website?: string;
  logoUrl?: string;
  settings: {
    enableAutoResponses: boolean;
    businessHours?: {
      start: string; // e.g., "09:00"
      end: string; // e.g., "18:00"
      timezone: string;
    };
    fallbackMessage?: string;
    escalationPhoneNumber?: string;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// Product
// ============================================

export interface IProduct extends Document {
  clientId: string;
  name: string;
  description: string;
  category?: string;
  price: number;
  currency: string;
  stock?: number;
  sku?: string;
  imageUrls: string[];
  tags: string[];
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// FAQ
// ============================================

export interface IFAQ extends Document {
  clientId: string;
  question: string;
  answer: string;
  category?: string;
  tags: string[];
  priority: number; // Higher = more important
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// Conversation & Message
// ============================================

export interface IConversation extends Document {
  clientId: string;
  customerPhone: string;
  customerName?: string;
  status: 'active' | 'resolved' | 'escalated';
  lastMessageAt: Date;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export enum MessageDirection {
  INBOUND = 'inbound',
  OUTBOUND = 'outbound',
}

export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  AUDIO = 'audio',
  VIDEO = 'video',
  DOCUMENT = 'document',
}

export interface IMessage extends Document {
  conversationId: string;
  clientId: string;
  direction: MessageDirection;
  type: MessageType;
  content: string; // Text content or media caption
  mediaUrl?: string; // Cloudinary/S3 URL
  whatsappMessageId?: string;
  timestamp: Date;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// Order
// ============================================

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

export interface IOrder extends Document {
  clientId: string;
  conversationId: string;
  customerPhone: string;
  customerName?: string;
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  currency: string;
  status: OrderStatus;
  shippingAddress?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// Prompt Template
// ============================================

export interface IPrompt extends Document {
  clientId: string;
  name: string;
  type: 'system' | 'snippet'; // system = base instruction, snippet = reusable piece
  content: string;
  variables: string[]; // e.g., ['businessName', 'productCount']
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// LLM Response Schema
// ============================================

export enum LLMAction {
  SEND_TEXT = 'SEND_TEXT',
  SEND_MEDIA = 'SEND_MEDIA',
  ESCALATE = 'ESCALATE',
  CREATE_ORDER = 'CREATE_ORDER',
  RESERVE_STOCK = 'RESERVE_STOCK',
  NONE = 'NONE',
}

export interface LLMResponse {
  reply: string; // The text message to send
  action: LLMAction;
  mediaKey?: string; // Product SKU or media identifier
  followUpHours?: number; // Schedule follow-up
  metadata?: {
    productIds?: string[];
    confidence?: number;
    reasoning?: string;
    [key: string]: any;
  };
}

// ============================================
// WhatsApp Webhook Payload
// ============================================

export interface WhatsAppWebhookPayload {
  object: string;
  entry: Array<{
    id: string;
    changes: Array<{
      value: {
        messaging_product: string;
        metadata: {
          display_phone_number: string;
          phone_number_id: string;
        };
        contacts?: Array<{
          profile: { name: string };
          wa_id: string;
        }>;
        messages?: Array<{
          from: string;
          id: string;
          timestamp: string;
          type: 'text' | 'image' | 'audio' | 'video' | 'document';
          text?: { body: string };
          image?: { id: string; mime_type: string; sha256: string };
          audio?: { id: string; mime_type: string; sha256: string };
          video?: { id: string; mime_type: string; sha256: string };
          document?: { id: string; mime_type: string; sha256: string; filename: string };
        }>;
        statuses?: Array<{
          id: string;
          status: string;
          timestamp: string;
          recipient_id: string;
        }>;
      };
      field: string;
    }>;
  }>;
}

// ============================================
// BullMQ Job Data
// ============================================

export interface MessageJobData {
  clientId: string;
  customerPhone: string;
  customerName?: string;
  messageType: MessageType;
  messageContent: string;
  mediaId?: string; // WhatsApp media ID
  whatsappMessageId: string;
  timestamp: string;
}

// ============================================
// Dynamic Prompt Context
// ============================================

export interface PromptContext {
  clientProfile: {
    businessName: string;
    industry: string;
    description?: string;
  };
  products: Array<{
    name: string;
    description: string;
    price: number;
    currency: string;
    sku?: string;
  }>;
  faqs: Array<{
    question: string;
    answer: string;
  }>;
  conversationHistory: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
}
