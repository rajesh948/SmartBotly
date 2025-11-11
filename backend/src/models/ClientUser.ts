import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";

/**
 * ClientUser Model
 * Represents client accounts created by admin
 * Separate from User model which is for admin users
 */

export interface IClientUser extends Document {
  name: string;
  email: string;
  password: string;
  company: string;
  phone?: string;
  status: "Active" | "Inactive";
  clientProfileId: mongoose.Types.ObjectId; // Reference to ClientProfile
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const ClientUserSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
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
    company: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
    clientProfileId: {
      type: Schema.Types.ObjectId,
      ref: "ClientProfile",
      required: true,
    },
  },
  { timestamps: true }
);

// Hash password before saving
ClientUserSchema.pre<IClientUser>("save", async function (next) {
  if (!this.isModified("password")) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Method to compare password
ClientUserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IClientUser>("ClientUser", ClientUserSchema);
