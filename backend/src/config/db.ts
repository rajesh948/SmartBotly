import mongoose from "mongoose";

/**
 * Database Connection Configuration
 * Connects to MongoDB using Mongoose
 */

export const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGO_URI || "mongodb://localhost:27017/smartbotly";
    
    await mongoose.connect(mongoURI);
    
    console.log("✅ MongoDB connected successfully");
    console.log(`📊 Database: ${mongoose.connection.name}`);
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
};

// Handle connection events
mongoose.connection.on("disconnected", () => {
  console.log("⚠️  MongoDB disconnected");
});

mongoose.connection.on("error", (err) => {
  console.error("❌ MongoDB error:", err);
});
