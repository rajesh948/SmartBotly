import mongoose, { Schema, Document } from "mongoose";

/**
 * Order Model
 * Stores orders created through WhatsApp conversations
 */

export interface IOrder extends Document {
  clientId: mongoose.Types.ObjectId;
  conversationId: mongoose.Types.ObjectId;
  customerPhone: string;
  customerName?: string;
  items: {
    productId: mongoose.Types.ObjectId;
    name: string;
    quantity: number;
    price: number;
  }[];
  totalAmount: number;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  deliveryAddress?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema: Schema = new Schema(
  {
    clientId: {
      type: Schema.Types.ObjectId,
      ref: "ClientProfile",
      required: true,
      index: true,
    },
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    customerPhone: {
      type: String,
      required: true,
    },
    customerName: {
      type: String,
    },
    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        name: String,
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        price: {
          type: Number,
          required: true,
        },
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed"],
      default: "pending",
    },
    deliveryAddress: {
      type: String,
    },
    notes: {
      type: String,
    },
  },
  { timestamps: true }
);

// Index for retrieving client orders
OrderSchema.index({ clientId: 1, status: 1, createdAt: -1 });

export default mongoose.model<IOrder>("Order", OrderSchema);
