import express from "express";
import {
  getAllClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
  resetClientPassword,
  toggleClientStatus,
} from "../controllers/adminClientController";
import { authenticate, requireAdmin } from "../middleware/auth";

/**
 * Admin Client Management Routes
 * All routes require admin authentication
 */

const router = express.Router();

// All routes require admin authentication
router.use(authenticate);
router.use(requireAdmin);

// Client CRUD operations
router.get("/", getAllClients);
router.get("/:id", getClientById);
router.post("/", createClient);
router.put("/:id", updateClient);
router.delete("/:id", deleteClient);

// Additional operations
router.patch("/:id/toggle-status", toggleClientStatus);
router.post("/:id/reset-password", resetClientPassword);

export default router;
