import { Response } from "express";
import bcrypt from "bcryptjs";
import ClientUser from "../models/ClientUser";
import ClientProfile from "../models/ClientProfile";
import Product from "../models/Product";
import FAQ from "../models/FAQ";
import { AuthRequest } from "../middleware/auth";

/**
 * Admin Client Management Controller
 * Handles CRUD operations for client accounts
 */

/**
 * Get all clients (Admin only)
 */
export const getAllClients = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const clients = await ClientUser.find()
      .populate("clientProfileId")
      .select("-password")
      .sort({ createdAt: -1 });

    res.json({
      clients,
      total: clients.length,
    });
  } catch (error: any) {
    console.error("Get all clients error:", error);
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
    const client = await ClientUser.findById(req.params.id)
      .populate("clientProfileId")
      .select("-password");

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
    const { name, email, password, company, phone, status } = req.body;

    // Validation
    if (!name || !email || !company) {
      res.status(400).json({ error: "Name, email, and company are required" });
      return;
    }

    // Check if email already exists
    const existingClient = await ClientUser.findOne({ email });
    if (existingClient) {
      res.status(400).json({ error: "Email already exists" });
      return;
    }

    // Auto-generate password if not provided
    const generatedPassword = password || `${company.toLowerCase().replace(/\s+/g, '')}123`;

    // Create client profile first
    const clientProfile = new ClientProfile({
      businessName: company,
      industry: "General",
      whatsappPhoneNumber: phone || "+0000000000",
      whatsappBusinessAccountId: `client_${Date.now()}`,
      aiProvider: "claude",
      systemPrompt: `You are a helpful assistant for ${company}.`,
      isActive: status === "Active",
    });
    await clientProfile.save();

    // Create client user
    const clientUser = new ClientUser({
      name,
      email,
      password: generatedPassword,
      company,
      phone,
      status: status || "Active",
      clientProfileId: clientProfile._id,
    });

    await clientUser.save();

    const clientData = await ClientUser.findById(clientUser._id)
      .populate("clientProfileId")
      .select("-password");

    res.status(201).json({
      message: "Client created successfully",
      client: clientData,
      credentials: {
        email,
        password: generatedPassword,
      },
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
    const { name, email, company, phone, status, password } = req.body;

    const updateData: any = { name, email, company, phone, status };

    // If password is provided, hash it
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    const client = await ClientUser.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    )
      .populate("clientProfileId")
      .select("-password");

    if (!client) {
      res.status(404).json({ error: "Client not found" });
      return;
    }

    // Update client profile status
    if (client.clientProfileId) {
      await ClientProfile.findByIdAndUpdate(client.clientProfileId._id, {
        isActive: status === "Active",
        businessName: company,
      });
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
 * Delete client (and all related data)
 */
export const deleteClient = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const client = await ClientUser.findById(req.params.id);

    if (!client) {
      res.status(404).json({ error: "Client not found" });
      return;
    }

    const clientProfileId = client.clientProfileId;

    // Delete all related data
    await Product.deleteMany({ clientId: clientProfileId });
    await FAQ.deleteMany({ clientId: clientProfileId });
    await ClientProfile.findByIdAndDelete(clientProfileId);
    await ClientUser.findByIdAndDelete(req.params.id);

    res.json({
      message: "Client and all related data deleted successfully",
    });
  } catch (error: any) {
    console.error("Delete client error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * Reset client password
 */
export const resetClientPassword = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { newPassword } = req.body;

    if (!newPassword) {
      res.status(400).json({ error: "New password is required" });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    const client = await ClientUser.findByIdAndUpdate(
      req.params.id,
      { password: hashedPassword },
      { new: true }
    ).select("-password");

    if (!client) {
      res.status(404).json({ error: "Client not found" });
      return;
    }

    res.json({
      message: "Password reset successfully",
      newPassword,
    });
  } catch (error: any) {
    console.error("Reset password error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * Toggle client status
 */
export const toggleClientStatus = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const client = await ClientUser.findById(req.params.id);

    if (!client) {
      res.status(404).json({ error: "Client not found" });
      return;
    }

    client.status = client.status === "Active" ? "Inactive" : "Active";
    await client.save();

    // Update client profile status
    await ClientProfile.findByIdAndUpdate(client.clientProfileId, {
      isActive: client.status === "Active",
    });

    res.json({
      message: `Client ${client.status === "Active" ? "activated" : "deactivated"} successfully`,
      status: client.status,
    });
  } catch (error: any) {
    console.error("Toggle status error:", error);
    res.status(500).json({ error: "Server error" });
  }
};
