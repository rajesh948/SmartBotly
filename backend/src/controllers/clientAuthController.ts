import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import ClientUser from "../models/ClientUser";
import ClientProfile from "../models/ClientProfile";
import { AuthRequest } from "../middleware/auth";

/**
 * Client Authentication Controller
 * Handles client login and profile management
 */

/**
 * Client Login
 */
export const clientLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Find client user
    const clientUser = await ClientUser.findOne({ email }).populate("clientProfileId");
    
    if (!clientUser) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    // Check if client is active
    if (clientUser.status !== "Active") {
      res.status(403).json({ error: "Your account has been deactivated. Please contact admin." });
      return;
    }

    // Verify password
    const isPasswordValid = await clientUser.comparePassword(password);
    if (!isPasswordValid) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    // Generate JWT token with 24-hour expiry
    const jwtSecret = process.env.JWT_SECRET || "default_secret";
    const token = jwt.sign(
      {
        userId: clientUser._id,
        id: clientUser._id, // Keep for backward compatibility
        email: clientUser.email,
        role: "client",
        clientId: clientUser.clientProfileId._id,
        clientProfileId: clientUser.clientProfileId._id,
      },
      jwtSecret,
      { expiresIn: "24h" }
    );

    res.json({
      token,
      user: {
        id: clientUser._id,
        name: clientUser.name,
        email: clientUser.email,
        company: clientUser.company,
        phone: clientUser.phone,
        role: "client",
        clientId: clientUser.clientProfileId._id,
        clientProfile: clientUser.clientProfileId,
      },
    });
  } catch (error: any) {
    console.error("Client login error:", error);
    res.status(500).json({ error: "Server error during login" });
  }
};

/**
 * Get current client profile
 */
export const getClientProfile = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const clientUser = await ClientUser.findById(req.user?.id)
      .select("-password")
      .populate("clientProfileId");

    if (!clientUser) {
      res.status(404).json({ error: "Client not found" });
      return;
    }

    res.json({
      user: {
        id: clientUser._id,
        name: clientUser.name,
        email: clientUser.email,
        company: clientUser.company,
        phone: clientUser.phone,
        status: clientUser.status,
        clientProfile: clientUser.clientProfileId,
        createdAt: clientUser.createdAt,
      },
    });
  } catch (error: any) {
    console.error("Get client profile error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * Update client profile
 */
export const updateClientProfile = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { name, phone, company } = req.body;

    const clientUser = await ClientUser.findByIdAndUpdate(
      req.user?.id,
      { name, phone, company },
      { new: true }
    ).select("-password");

    if (!clientUser) {
      res.status(404).json({ error: "Client not found" });
      return;
    }

    res.json({
      message: "Profile updated successfully",
      user: clientUser,
    });
  } catch (error: any) {
    console.error("Update client profile error:", error);
    res.status(500).json({ error: "Server error" });
  }
};
