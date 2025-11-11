import express from "express";
import {
  clientLogin,
  getClientProfile,
  updateClientProfile,
} from "../controllers/clientAuthController";
import { authenticate, requireClient } from "../middleware/auth";

/**
 * Client Authentication Routes
 * /api/client/login - POST - Client login
 * /api/client/me - GET - Get current client profile
 * /api/client/profile - PUT - Update client profile
 */

const router = express.Router();

// Public routes
router.post("/login", clientLogin);

// Protected routes (require authentication + client role)
router.get("/me", authenticate, requireClient, getClientProfile);
router.put("/profile", authenticate, requireClient, updateClientProfile);

export default router;
