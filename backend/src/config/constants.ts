// ============================================
// Application Constants
// ============================================

export const CONSTANTS = {
  // Queue names
  QUEUE: {
    MESSAGE_QUEUE: process.env.MESSAGE_QUEUE_NAME || 'whatsapp-messages',
  },

  // Context limits for LLM prompts
  CONTEXT: {
    CONVERSATION_LIMIT: parseInt(process.env.CONVERSATION_CONTEXT_LIMIT || '10', 10),
    PRODUCT_LIMIT: parseInt(process.env.PRODUCT_CONTEXT_LIMIT || '5', 10),
    FAQ_LIMIT: parseInt(process.env.FAQ_CONTEXT_LIMIT || '3', 10),
  },

  // Matching thresholds
  THRESHOLDS: {
    FAQ_MATCH: parseFloat(process.env.FAQ_MATCH_THRESHOLD || '0.8'),
    PRODUCT_MATCH: parseFloat(process.env.PRODUCT_MATCH_THRESHOLD || '0.6'),
  },

  // LLM Configuration
  LLM: {
    PROVIDER: process.env.LLM_PROVIDER || 'claude',
    CLAUDE_MODEL: 'claude-3-5-sonnet-20241022',
    OPENAI_MODEL: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
    MAX_TOKENS: 2000,
    TEMPERATURE: 0.7,
  },

  // WhatsApp
  WHATSAPP: {
    API_VERSION: 'v18.0',
    BASE_URL: 'https://graph.facebook.com',
  },

  // Rate limiting
  RATE_LIMIT: {
    WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },

  // Queue settings
  QUEUE_SETTINGS: {
    CONCURRENCY: parseInt(process.env.QUEUE_CONCURRENCY || '5', 10),
    ATTEMPTS: 3,
    BACKOFF: {
      type: 'exponential' as const,
      delay: 2000,
    },
  },

  // Data retention (in days)
  RETENTION: {
    MESSAGES: parseInt(process.env.MESSAGE_RETENTION_DAYS || '90', 10),
    CONVERSATIONS: parseInt(process.env.CONVERSATION_RETENTION_DAYS || '365', 10),
  },
};

// LLM System Prompt Template
export const SYSTEM_PROMPT_TEMPLATE = `You are an AI assistant for {{businessName}}, a business in the {{industry}} industry.

Your role is to help customers by:
1. Answering questions about products and services
2. Helping customers find what they're looking for
3. Processing orders when customers are ready to buy
4. Escalating to a human agent when necessary

IMPORTANT RESPONSE RULES:
- You MUST respond ONLY with valid JSON in the exact format specified below
- Do NOT include any text outside the JSON structure
- Be friendly, helpful, and professional
- Keep responses concise and clear
- If you're unsure or the customer needs human assistance, use the ESCALATE action

REQUIRED JSON RESPONSE FORMAT:
{
  "reply": "Your message to the customer",
  "action": "SEND_TEXT|SEND_MEDIA|ESCALATE|CREATE_ORDER|RESERVE_STOCK|NONE",
  "mediaKey": "optional-product-sku-or-media-id",
  "followUpHours": 24,
  "metadata": {
    "productIds": ["id1", "id2"],
    "confidence": 0.95,
    "reasoning": "Brief explanation of your decision"
  }
}

ACTIONS EXPLAINED:
- SEND_TEXT: Simple text response
- SEND_MEDIA: Send product image (include product SKU in mediaKey)
- ESCALATE: Customer needs human assistance
- CREATE_ORDER: Customer confirmed order (include product IDs in metadata.productIds)
- RESERVE_STOCK: Customer wants to reserve items
- NONE: Acknowledgment, no action needed`;
