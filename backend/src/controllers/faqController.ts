import { Response } from "express";
import FAQ from "../models/FAQ";
import { AuthRequest } from "../middleware/auth";

/**
 * FAQ Controller
 * Handles CRUD operations for FAQs (both admin and client)
 */

/**
 * Get all FAQs (Admin: all FAQs with filter, Client: only their FAQs)
 */
export const getFAQs = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userRole = req.user?.role;
    const userId = req.user?.id;

    let query: any = { isActive: true };

    // If client, filter by their clientId
    if (userRole === "client") {
      const ClientUser = require("../models/ClientUser").default;
      const clientUser = await ClientUser.findById(userId);

      if (!clientUser || !clientUser.clientProfileId) {
        res.status(404).json({ error: "Client profile not found" });
        return;
      }

      query.clientId = clientUser.clientProfileId;
    }

    // Admin can filter by clientId if provided
    if (userRole === "admin" && req.query.clientId) {
      query.clientId = req.query.clientId;
    }

    // Filter by category if provided
    if (req.query.category) {
      query.category = req.query.category;
    }

    // Search by question if provided
    if (req.query.search) {
      query.question = { $regex: req.query.search, $options: "i" };
    }

    const faqs = await FAQ.find(query)
      .populate("clientId", "businessName email")
      .sort({ createdAt: -1 });

    res.json({ faqs });
  } catch (error: any) {
    console.error("Get FAQs error:", error);
    res.status(500).json({ error: "Failed to fetch FAQs" });
  }
};

/**
 * Get single FAQ by ID
 */
export const getFAQById = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const userRole = req.user?.role;
    const userId = req.user?.id;

    const faq = await FAQ.findById(id).populate("clientId", "businessName email");

    if (!faq) {
      res.status(404).json({ error: "FAQ not found" });
      return;
    }

    // If client, verify they own this FAQ
    if (userRole === "client") {
      const ClientUser = require("../models/ClientUser").default;
      const clientUser = await ClientUser.findById(userId);

      if (!clientUser || !clientUser.clientProfileId) {
        res.status(404).json({ error: "Client profile not found" });
        return;
      }

      if (faq.clientId._id.toString() !== clientUser.clientProfileId.toString()) {
        res.status(403).json({ error: "Access denied" });
        return;
      }
    }

    res.json({ faq });
  } catch (error: any) {
    console.error("Get FAQ error:", error);
    res.status(500).json({ error: "Failed to fetch FAQ" });
  }
};

/**
 * Create new FAQ
 */
export const createFAQ = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { question, answer, category, clientId: requestClientId } = req.body;
    const userRole = req.user?.role;
    const userId = req.user?.id;

    // Validation
    if (!question || !answer) {
      res.status(400).json({ error: "Question and answer are required" });
      return;
    }

    // Determine clientId based on role
    let clientId;
    if (userRole === "admin") {
      if (!requestClientId) {
        res.status(400).json({ error: "Client ID is required for admin" });
        return;
      }
      clientId = requestClientId;
    } else if (userRole === "client") {
      const ClientUser = require("../models/ClientUser").default;
      const clientUser = await ClientUser.findById(userId);

      if (!clientUser || !clientUser.clientProfileId) {
        res.status(404).json({ error: "Client profile not found" });
        return;
      }

      clientId = clientUser.clientProfileId;
    }

    const faq = await FAQ.create({
      question: question.trim(),
      answer: answer.trim(),
      category: category || "General",
      clientId,
      isActive: true,
    });

    const populatedFAQ = await FAQ.findById(faq._id).populate(
      "clientId",
      "businessName email"
    );

    res.status(201).json({
      message: "FAQ created successfully",
      faq: populatedFAQ,
    });
  } catch (error: any) {
    console.error("Create FAQ error:", error);
    res.status(500).json({ error: "Failed to create FAQ" });
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
    const { id } = req.params;
    const { question, answer, category } = req.body;
    const userRole = req.user?.role;
    const userId = req.user?.id;

    // Validation
    if (!question || !answer) {
      res.status(400).json({ error: "Question and answer are required" });
      return;
    }

    const faq = await FAQ.findById(id);

    if (!faq) {
      res.status(404).json({ error: "FAQ not found" });
      return;
    }

    // If client, verify they own this FAQ
    if (userRole === "client") {
      const ClientUser = require("../models/ClientUser").default;
      const clientUser = await ClientUser.findById(userId);

      if (!clientUser || !clientUser.clientProfileId) {
        res.status(404).json({ error: "Client profile not found" });
        return;
      }

      if (faq.clientId.toString() !== clientUser.clientProfileId.toString()) {
        res.status(403).json({ error: "Access denied" });
        return;
      }
    }

    // Update FAQ
    faq.question = question.trim();
    faq.answer = answer.trim();
    faq.category = category || faq.category;
    await faq.save();

    const updatedFAQ = await FAQ.findById(id).populate(
      "clientId",
      "businessName email"
    );

    res.json({
      message: "FAQ updated successfully",
      faq: updatedFAQ,
    });
  } catch (error: any) {
    console.error("Update FAQ error:", error);
    res.status(500).json({ error: "Failed to update FAQ" });
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
    const { id } = req.params;
    const userRole = req.user?.role;
    const userId = req.user?.id;

    const faq = await FAQ.findById(id);

    if (!faq) {
      res.status(404).json({ error: "FAQ not found" });
      return;
    }

    // If client, verify they own this FAQ
    if (userRole === "client") {
      const ClientUser = require("../models/ClientUser").default;
      const clientUser = await ClientUser.findById(userId);

      if (!clientUser || !clientUser.clientProfileId) {
        res.status(404).json({ error: "Client profile not found" });
        return;
      }

      if (faq.clientId.toString() !== clientUser.clientProfileId.toString()) {
        res.status(403).json({ error: "Access denied" });
        return;
      }
    }

    // Soft delete by setting isActive to false
    faq.isActive = false;
    await faq.save();

    res.json({ message: "FAQ deleted successfully" });
  } catch (error: any) {
    console.error("Delete FAQ error:", error);
    res.status(500).json({ error: "Failed to delete FAQ" });
  }
};

/**
 * Get FAQ categories for a client
 */
export const getFAQCategories = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userRole = req.user?.role;
    const userId = req.user?.id;

    let clientId;

    if (userRole === "admin" && req.query.clientId) {
      clientId = req.query.clientId;
    } else if (userRole === "client") {
      const ClientUser = require("../models/ClientUser").default;
      const clientUser = await ClientUser.findById(userId);

      if (!clientUser || !clientUser.clientProfileId) {
        res.status(404).json({ error: "Client profile not found" });
        return;
      }

      clientId = clientUser.clientProfileId;
    }

    const query: any = { isActive: true };
    if (clientId) {
      query.clientId = clientId;
    }

    const categories = await FAQ.distinct("category", query);

    res.json({ categories });
  } catch (error: any) {
    console.error("Get categories error:", error);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
};
