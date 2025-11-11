import mongoose, { Schema, Document } from "mongoose";

/**
 * Product Model
 * Stores products for each client's catalog
 */

export interface IProduct extends Document {
  clientId: mongoose.Types.ObjectId;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  imageUrl?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema: Schema = new Schema(
  {
    clientId: {
      type: Schema.Types.ObjectId,
      ref: "ClientProfile",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    category: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Index for searching products by client
ProductSchema.index({ clientId: 1, isActive: 1 });

export default mongoose.model<IProduct>("Product", ProductSchema);
