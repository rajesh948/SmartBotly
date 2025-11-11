import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/User";
import dotenv from "dotenv";

/**
 * Script to create a default admin user
 * Run with: npx ts-node src/scripts/createAdmin.ts
 */

dotenv.config();

const ADMIN_EMAIL = "admin@smartbotly.com";
const ADMIN_PASSWORD = "admin123";

async function createAdmin() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/smartbotly";
    await mongoose.connect(mongoUri);
    console.log("✅ Connected to MongoDB");

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: ADMIN_EMAIL });

    if (existingAdmin) {
      console.log(`ℹ️  Admin user already exists: ${ADMIN_EMAIL}`);
      console.log("No changes made.");
    } else {
      // Create admin user
      const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
      const admin = new User({
        email: ADMIN_EMAIL,
        password: hashedPassword,
        role: "admin",
      });

      await admin.save();
      console.log("✅ Admin user created successfully!");
      console.log("\n📋 Admin Credentials:");
      console.log(`   Email: ${ADMIN_EMAIL}`);
      console.log(`   Password: ${ADMIN_PASSWORD}`);
      console.log("\n⚠️  Please change the password after first login!\n");
    }

    await mongoose.disconnect();
    console.log("✅ Disconnected from MongoDB");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating admin:", error);
    process.exit(1);
  }
}

createAdmin();
