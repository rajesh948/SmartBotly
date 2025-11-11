import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { connectDB } from "../config/db";
import User from "../models/User";
import ClientProfile from "../models/ClientProfile";
import Product from "../models/Product";
import FAQ from "../models/FAQ";

dotenv.config();

/**
 * Database Seed Script
 * Creates sample admin user, client, products, and FAQs for testing
 */

async function seedDatabase() {
  try {
    console.log("?? Starting database seed...");

    // Connect to MongoDB
    await connectDB();

    // Clear existing data
    console.log("???  Clearing existing data...");
    await User.deleteMany({});
    await ClientProfile.deleteMany({});
    await Product.deleteMany({});
    await FAQ.deleteMany({});

    // Create Admin User
    console.log("?? Creating admin user...");
    const adminPassword = await bcrypt.hash("admin123", 10);
    const admin = await User.create({
      email: "admin@smartbotly.com",
      password: adminPassword,
      role: "admin",
    });
    console.log("? Admin created: admin@smartbotly.com / admin123");

    // Create Sample Client
    console.log("?? Creating sample client...");
    const client = await ClientProfile.create({
      businessName: "Elegant Threads",
      industry: "Fashion & Apparel",
      whatsappPhoneNumber: "+1234567890",
      whatsappBusinessAccountId: "123456789",
      aiProvider: "claude",
      systemPrompt: ,
      isActive: true,
    });

    // Create Client User
    const clientPassword = await bcrypt.hash("client123", 10);
    await User.create({
      email: "owner@elegantthreads.com",
      password: clientPassword,
      role: "client",
      clientId: client._id,
    });
    console.log("? Client created: owner@elegantthreads.com / client123");

    // Create Sample Products
    console.log("?? Creating sample products...");
    const products = await Product.insertMany([
      {
        clientId: client._id,
        name: "Classic White Shirt",
        description: "Premium cotton white shirt with elegant design",
        price: 49.99,
        stock: 50,
        category: "Shirts",
        imageUrl: "https://via.placeholder.com/300x400?text=White+Shirt",
        isActive: true,
      },
      {
        clientId: client._id,
        name: "Blue Denim Jeans",
        description: "Comfortable slim-fit blue denim jeans",
        price: 79.99,
        stock: 30,
        category: "Pants",
        imageUrl: "https://via.placeholder.com/300x400?text=Blue+Jeans",
        isActive: true,
      },
      {
        clientId: client._id,
        name: "Leather Jacket",
        description: "Genuine leather jacket with modern design",
        price: 199.99,
        stock: 15,
        category: "Jackets",
        imageUrl: "https://via.placeholder.com/300x400?text=Leather+Jacket",
        isActive: true,
      },
      {
        clientId: client._id,
        name: "Summer Dress",
        description: "Floral pattern summer dress, perfect for warm weather",
        price: 69.99,
        stock: 25,
        category: "Dresses",
        imageUrl: "https://via.placeholder.com/300x400?text=Summer+Dress",
        isActive: true,
      },
      {
        clientId: client._id,
        name: "Wool Sweater",
        description: "Cozy wool sweater for cold days",
        price: 89.99,
        stock: 20,
        category: "Sweaters",
        imageUrl: "https://via.placeholder.com/300x400?text=Wool+Sweater",
        isActive: true,
      },
    ]);
    console.log();

    // Create Sample FAQs
    console.log("? Creating sample FAQs...");
    const faqs = await FAQ.insertMany([
      {
        clientId: client._id,
        question: "What are your store hours?",
        answer: "We're open Monday-Saturday from 10 AM to 8 PM, and Sunday from 12 PM to 6 PM.",
        category: "General",
        isActive: true,
      },
      {
        clientId: client._id,
        question: "Do you offer free shipping?",
        answer: "Yes! We offer free shipping on all orders over 00. For orders under 00, shipping is 0.",
        category: "Shipping",
        isActive: true,
      },
      {
        clientId: client._id,
        question: "What is your return policy?",
        answer: "We accept returns within 30 days of purchase. Items must be unworn with tags attached. Refunds are processed within 5-7 business days.",
        category: "Returns",
        isActive: true,
      },
      {
        clientId: client._id,
        question: "Do you have a size guide?",
        answer: "Yes! Please check our website for detailed size charts. If you need help choosing a size, feel free to ask!",
        category: "Sizing",
        isActive: true,
      },
      {
        clientId: client._id,
        question: "How can I track my order?",
        answer: "Once your order ships, you'll receive a tracking number via email. You can also check your order status by logging into your account.",
        category: "Orders",
        isActive: true,
      },
    ]);
    console.log();

    console.log();

    process.exit(0);
  } catch (error) {
    console.error("? Seed error:", error);
    process.exit(1);
  }
}

// Run seed
seedDatabase();
