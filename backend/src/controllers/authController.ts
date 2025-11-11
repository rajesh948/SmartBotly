import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User";

/**
 * Auth Controller
 * Handles user registration and login
 */

/**
 * Register a new user
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, role, clientId } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ error: "User already exists" });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = new User({
      email,
      password: hashedPassword,
      role: role || "client",
      clientId: clientId || null,
    });

    await user.save();

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Server error during registration" });
  }
};

/**
 * Login user and return JWT token (24-hour expiry)
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email }).populate("clientId");
    if (!user) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    // Generate JWT token with 24-hour expiry
    const jwtSecret = process.env.JWT_SECRET || "default_secret";
    const token = jwt.sign(
      {
        userId: user._id,
        id: user._id, // Keep for backward compatibility
        email: user.email,
        role: user.role,
        clientId: user.clientId,
      },
      jwtSecret,
      { expiresIn: "24h" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        clientId: user.clientId,
      },
    });
  } catch (error: any) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Server error during login" });
  }
};

/**
 * Get current user info
 */
export const getMe = async (req: any, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user.id)
      .select("-password")
      .populate("clientId");

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json({ user });
  } catch (error: any) {
    console.error("Get user error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * Validate token and return user data (works for both admin and client)
 */
export const validateToken = async (req: any, res: Response): Promise<void> => {
  try {
    const userRole = req.user.role;
    const userId = req.user.userId || req.user.id;

    if (userRole === "client") {
      // Fetch client user
      const ClientUser = require("../models/ClientUser").default;
      const clientUser = await ClientUser.findById(userId)
        .select("-password")
        .populate("clientProfileId");

      if (!clientUser) {
        res.status(404).json({ message: "Unauthenticated" });
        return;
      }

      res.json({
        user: {
          id: clientUser._id,
          name: clientUser.name,
          email: clientUser.email,
          company: clientUser.company,
          phone: clientUser.phone,
          role: "client",
          status: clientUser.status,
          clientId: clientUser.clientProfileId?._id,
          clientProfile: clientUser.clientProfileId,
          createdAt: clientUser.createdAt,
        },
      });
    } else {
      // Fetch admin user
      const user = await User.findById(userId)
        .select("-password")
        .populate("clientId");

      if (!user) {
        res.status(404).json({ message: "Unauthenticated" });
        return;
      }

      res.json({
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          clientId: user.clientId,
        },
      });
    }
  } catch (error: any) {
    console.error("Token validation error:", error);
    res.status(401).json({ message: "Unauthenticated" });
  }
};
