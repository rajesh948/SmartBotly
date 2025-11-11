import express from "express";
import { verifyWebhook, receiveWebhook } from "../controllers/whatsappController";

/**
 * Webhook Routes
 * /api/webhook - GET - Verify webhook
 * /api/webhook - POST - Receive messages
 */

const router = express.Router();

router.get("/", verifyWebhook);
router.post("/", receiveWebhook);

export default router;
