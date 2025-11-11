import mongoose, { Schema, Document } from "mongoose";

/**
 * Product Model
 * Stores products for each client's catalog
 */

export interface IProduct extends Document {
  clientId: mongoose.Types.ObjectId;
  productName: string;
  description: string;
  price: number;
  stock: number;
  category?: string;
  imageUrl: string;
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
    productName: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price must be greater than or equal to 0'],
    },
    stock: {
      type: Number,
      default: 0,
      min: [0, 'Stock must be greater than or equal to 0'],
    },
    category: {
      type: String,
      trim: true,
    },
    imageUrl: {
      type: String,
      required: [true, 'Image is required'],
    },
  },
  { timestamps: true }
);

// Index for searching products by client
ProductSchema.index({ clientId: 1 });
ProductSchema.index({ productName: 1 });

export default mongoose.model<IProduct>("Product", ProductSchema);
