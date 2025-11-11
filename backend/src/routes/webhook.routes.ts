// ============================================
// Webhook Routes
// ============================================

import { Router } from 'express';
import { verifyWebhook, handleWebhook } from '../controllers/webhookController';

const router = Router();

// GET /api/webhook/whatsapp - Webhook verification
router.get('/whatsapp', verifyWebhook);

// POST /api/webhook/whatsapp - Receive messages
router.post('/whatsapp', handleWebhook);

export default router;
