import mongoose, { Schema, Document } from "mongoose";

/**
 * User Model
 * Represents Admin and Client users who can log into the dashboard
 */

export interface IUser extends Document {
  email: string;
  password: string;
  role: "admin" | "client";
  clientId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "client"],
      required: true,
      default: "client",
    },
    // Reference to ClientProfile if role is "client"
    clientId: {
      type: Schema.Types.ObjectId,
      ref: "ClientProfile",
    },
  },
  { timestamps: true }
);

export default mongoose.model<IUser>("User", UserSchema);
