import express from "express";
import {
  getAllClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getFAQs,
  createFAQ,
  updateFAQ,
  deleteFAQ,
} from "../controllers/clientController";
import { authenticate, requireAdmin } from "../middleware/auth";

/**
 * Client Routes
 * Handles client, product, and FAQ management
 */

const router = express.Router();

// Client routes (Admin only)
router.get("/", authenticate, requireAdmin, getAllClients);
router.get("/:id", authenticate, getClientById);
router.post("/", authenticate, requireAdmin, createClient);
router.put("/:id", authenticate, requireAdmin, updateClient);
router.delete("/:id", authenticate, requireAdmin, deleteClient);

// Product routes
router.get("/:clientId/products", authenticate, getProducts);
router.post("/:clientId/products", authenticate, createProduct);
router.put("/:clientId/products/:productId", authenticate, updateProduct);
router.delete("/:clientId/products/:productId", authenticate, deleteProduct);

// FAQ routes
router.get("/:clientId/faqs", authenticate, getFAQs);
router.post("/:clientId/faqs", authenticate, createFAQ);
router.put("/:clientId/faqs/:faqId", authenticate, updateFAQ);
router.delete("/:clientId/faqs/:faqId", authenticate, deleteFAQ);

export default router;
