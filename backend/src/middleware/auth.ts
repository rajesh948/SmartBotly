import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

/**
 * JWT Authentication Middleware
 * Verifies JWT token and attaches user info to request
 */

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: "admin" | "client";
    clientId?: string;
  };
  file?: Express.Multer.File;
}

/**
 * Middleware to verify JWT token
 */
export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ message: "Unauthenticated" });
      return;
    }

    const token = authHeader.substring(7);
    const jwtSecret = process.env.JWT_SECRET || "default_secret";

    const decoded = jwt.verify(token, jwtSecret) as any;
    req.user = decoded;

    next();
  } catch (error) {
    res.status(401).json({ message: "Unauthenticated" });
  }
};

/**
 * Middleware to check if user is admin
 */
export const requireAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (req.user?.role !== "admin") {
    res.status(403).json({ error: "Admin access required" });
    return;
  }
  next();
};

/**
 * Middleware to check if user is client
 */
export const requireClient = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (req.user?.role !== "client") {
    res.status(403).json({ error: "Client access required" });
    return;
  }
  next();
};

/**
 * Middleware to check if client account is active
 */
export const checkClientStatus = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (req.user?.role !== "client") {
      next();
      return;
    }

    const ClientUser = require("../models/ClientUser").default;
    const clientUser = await ClientUser.findById(req.user.id).select("status");

    if (!clientUser) {
      res.status(404).json({ message: "Client not found" });
      return;
    }

    if (clientUser.status !== "Active") {
      res.status(403).json({
        message: "Your account has been deactivated. Please contact admin.",
        accountDeactivated: true
      });
      return;
    }

    next();
  } catch (error) {
    console.error("Check client status error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
