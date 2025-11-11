import express from "express";
import { register, login, getMe, validateToken } from "../controllers/authController";
import { authenticate } from "../middleware/auth";

/**
 * Auth Routes
 * /api/auth/register - POST - Register new user
 * /api/auth/login - POST - Login user
 * /api/auth/me - GET - Get current user (protected)
 * /api/auth/validate - GET - Validate token and return user data (works for both admin and client)
 */

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", authenticate, getMe);
router.get("/validate", authenticate, validateToken);

export default router;
