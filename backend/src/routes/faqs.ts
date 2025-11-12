import express from "express";
import {
  getFAQs,
  getFAQById,
  createFAQ,
  updateFAQ,
  deleteFAQ,
  getFAQCategories,
} from "../controllers/faqController";
import { authenticate, checkClientStatus } from "../middleware/auth";

/**
 * FAQ Routes
 * Protected routes for FAQ management (both admin and client)
 */

const router = express.Router();

// All routes require authentication
router.use(authenticate);
router.use(checkClientStatus);

// FAQ CRUD operations
router.get("/", getFAQs);
router.get("/categories", getFAQCategories);
router.get("/:id", getFAQById);
router.post("/", createFAQ);
router.put("/:id", updateFAQ);
router.delete("/:id", deleteFAQ);

export default router;
