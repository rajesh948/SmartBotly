import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import ClientProfile from "../models/ClientProfile";
import Product from "../models/Product";
import FAQ from "../models/FAQ";
import User from "../models/User";
import bcrypt from "bcryptjs";

/**
 * Client Controller
 * Handles CRUD operations for client profiles, products, and FAQs
 */

/**
 * Get all clients (Admin only)
 */
export const getAllClients = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const clients = await ClientProfile.find().sort({ createdAt: -1 });
    res.json({ clients });
  } catch (error: any) {
    console.error("Get clients error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * Get single client by ID
 */
export const getClientById = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const client = await ClientProfile.findById(req.params.id);
    
    if (!client) {
      res.status(404).json({ error: "Client not found" });
      return;
    }

    res.json({ client });
  } catch (error: any) {
    console.error("Get client error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * Create new client (Admin only)
 */
export const createClient = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const {
      businessName,
      industry,
      whatsappPhoneNumber,
      whatsappBusinessAccountId,
      aiProvider,
      systemPrompt,
      ownerEmail,
      ownerPassword,
    } = req.body;

    // Create client profile
    const client = new ClientProfile({
      businessName,
      industry,
      whatsappPhoneNumber,
      whatsappBusinessAccountId,
      aiProvider: aiProvider || "claude",
      systemPrompt:
        systemPrompt || "You are a helpful business assistant.",
    });

    await client.save();

    // Create user account for the client
    if (ownerEmail && ownerPassword) {
      const hashedPassword = await bcrypt.hash(ownerPassword, 10);
      const user = new User({
        email: ownerEmail,
        password: hashedPassword,
        role: "client",
        clientId: client._id,
      });
      await user.save();
    }

    res.status(201).json({
      message: "Client created successfully",
      client,
    });
  } catch (error: any) {
    console.error("Create client error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * Update client
 */
export const updateClient = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const client = await ClientProfile.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!client) {
      res.status(404).json({ error: "Client not found" });
      return;
    }

    res.json({
      message: "Client updated successfully",
      client,
    });
  } catch (error: any) {
    console.error("Update client error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * Delete client
 */
export const deleteClient = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const client = await ClientProfile.findByIdAndDelete(req.params.id);

    if (!client) {
      res.status(404).json({ error: "Client not found" });
      return;
    }

    // Also delete associated user
    await User.deleteMany({ clientId: client._id });

    res.json({ message: "Client deleted successfully" });
  } catch (error: any) {
    console.error("Delete client error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * Get products for a client
 */
export const getProducts = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const clientId = req.params.clientId || req.user?.clientId;
    const products = await Product.find({ clientId, isActive: true });
    
    res.json({ products });
  } catch (error: any) {
    console.error("Get products error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * Create product
 */
export const createProduct = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const clientId = req.params.clientId || req.user?.clientId;
    
    const product = new Product({
      clientId,
      ...req.body,
    });

    await product.save();

    res.status(201).json({
      message: "Product created successfully",
      product,
    });
  } catch (error: any) {
    console.error("Create product error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * Update product
 */
export const updateProduct = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.productId,
      req.body,
      { new: true }
    );

    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    res.json({
      message: "Product updated successfully",
      product,
    });
  } catch (error: any) {
    console.error("Update product error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * Delete product
 */
export const deleteProduct = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const product = await Product.findByIdAndDelete(req.params.productId);

    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    res.json({ message: "Product deleted successfully" });
  } catch (error: any) {
    console.error("Delete product error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * Get FAQs for a client
 */
export const getFAQs = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const clientId = req.params.clientId || req.user?.clientId;
    const faqs = await FAQ.find({ clientId, isActive: true });
    
    res.json({ faqs });
  } catch (error: any) {
    console.error("Get FAQs error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * Create FAQ
 */
export const createFAQ = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const clientId = req.params.clientId || req.user?.clientId;
    
    const faq = new FAQ({
      clientId,
      ...req.body,
    });

    await faq.save();

    res.status(201).json({
      message: "FAQ created successfully",
      faq,
    });
  } catch (error: any) {
    console.error("Create FAQ error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * Update FAQ
 */
export const updateFAQ = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const faq = await FAQ.findByIdAndUpdate(
      req.params.faqId,
      req.body,
      { new: true }
    );

    if (!faq) {
      res.status(404).json({ error: "FAQ not found" });
      return;
    }

    res.json({
      message: "FAQ updated successfully",
      faq,
    });
  } catch (error: any) {
    console.error("Update FAQ error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * Delete FAQ
 */
export const deleteFAQ = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const faq = await FAQ.findByIdAndDelete(req.params.faqId);

    if (!faq) {
      res.status(404).json({ error: "FAQ not found" });
      return;
    }

    res.json({ message: "FAQ deleted successfully" });
  } catch (error: any) {
    console.error("Delete FAQ error:", error);
    res.status(500).json({ error: "Server error" });
  }
};
