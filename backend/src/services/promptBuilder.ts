// ============================================
// Dynamic Prompt Builder with Context Injection
// ============================================

import { Client } from '../models/Client';
import { Product } from '../models/Product';
import { FAQ } from '../models/FAQ';
import { Message } from '../models/Message';
import { Prompt } from '../models/Prompt';
import { CONSTANTS, SYSTEM_PROMPT_TEMPLATE } from '../config/constants';
import { PromptContext } from '../types';
import { logger } from '../utils/logger';

// ============================================
// Build Complete Prompt with Context
// ============================================

export const buildPromptWithContext = async (
  clientId: string,
  conversationId: string,
  userQuery: string
): Promise<{
  systemPrompt: string;
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
}> => {
  try {
    logger.info('Building prompt with context', { clientId, conversationId });

    // 1. Fetch client profile
    const client = await Client.findById(clientId);
    if (!client) {
      throw new Error('Client not found');
    }

    // 2. Fetch custom system prompt if exists, else use default
    const customPrompt = await Prompt.findOne({
      clientId,
      type: 'system',
      isActive: true,
    }).sort({ createdAt: -1 });

    // 3. Fetch top N products (configurable)
    const products = await Product.find({
      clientId,
      isAvailable: true,
    })
      .sort({ createdAt: -1 })
      .limit(CONSTANTS.CONTEXT.PRODUCT_LIMIT)
      .select('name description price currency sku');

    // 4. Fetch top M FAQs by priority
    const faqs = await FAQ.find({
      clientId,
      isActive: true,
    })
      .sort({ priority: -1 })
      .limit(CONSTANTS.CONTEXT.FAQ_LIMIT)
      .select('question answer');

    // 5. Fetch last K messages from conversation
    const conversationHistory = await Message.find({
      conversationId,
    })
      .sort({ timestamp: -1 })
      .limit(CONSTANTS.CONTEXT.CONVERSATION_LIMIT)
      .select('direction content timestamp');

    // Reverse to get chronological order
    conversationHistory.reverse();

    // 6. Assemble context
    const context: PromptContext = {
      clientProfile: {
        businessName: client.businessName,
        industry: client.industry,
        description: client.description || '',
      },
      products: products.map((p) => ({
        name: p.name,
        description: p.description,
        price: p.price,
        currency: p.currency,
        sku: p.sku,
      })),
      faqs: faqs.map((f) => ({
        question: f.question,
        answer: f.answer,
      })),
      conversationHistory: conversationHistory.map((m) => ({
        role: m.direction === 'inbound' ? ('user' as const) : ('assistant' as const),
        content: m.content,
      })),
    };

    // 7. Build system prompt
    const systemPrompt = buildSystemPrompt(client, customPrompt?.content, context);

    // 8. Build message history
    const messages = [
      ...context.conversationHistory,
      {
        role: 'user' as const,
        content: userQuery,
      },
    ];

    logger.info('Prompt built successfully', {
      productCount: products.length,
      faqCount: faqs.length,
      historyCount: conversationHistory.length,
    });

    return { systemPrompt, messages };
  } catch (error) {
    logger.error('Error building prompt:', error);
    throw error;
  }
};

// ============================================
// Build System Prompt
// ============================================

const buildSystemPrompt = (
  client: any,
  customPromptContent: string | undefined,
  context: PromptContext
): string => {
  // Start with custom prompt or default template
  let basePrompt = customPromptContent || SYSTEM_PROMPT_TEMPLATE;

  // Replace variables in template
  basePrompt = basePrompt
    .replace(/{{businessName}}/g, context.clientProfile.businessName)
    .replace(/{{industry}}/g, context.clientProfile.industry);

  // Add client description if available
  let fullPrompt = basePrompt;

  if (context.clientProfile.description) {
    fullPrompt += `\n\nABOUT ${context.clientProfile.businessName}:\n${context.clientProfile.description}`;
  }

  // Add product catalog
  if (context.products.length > 0) {
    fullPrompt += '\n\n=== AVAILABLE PRODUCTS ===\n';
    context.products.forEach((product, index) => {
      fullPrompt += `\n${index + 1}. ${product.name}`;
      if (product.sku) {
        fullPrompt += ` (SKU: ${product.sku})`;
      }
      fullPrompt += `\n   Price: ${product.currency} ${product.price}`;
      fullPrompt += `\n   Description: ${product.description}\n`;
    });
  } else {
    fullPrompt += '\n\nNote: No products are currently available in the catalog.';
  }

  // Add FAQs
  if (context.faqs.length > 0) {
    fullPrompt += '\n\n=== FREQUENTLY ASKED QUESTIONS ===\n';
    context.faqs.forEach((faq, index) => {
      fullPrompt += `\nQ${index + 1}: ${faq.question}`;
      fullPrompt += `\nA${index + 1}: ${faq.answer}\n`;
    });
  }

  // Add business hours if configured
  if (client.settings?.businessHours) {
    const { start, end, timezone } = client.settings.businessHours;
    fullPrompt += `\n\n=== BUSINESS HOURS ===\n${start} - ${end} (${timezone})`;
  }

  // Add instructions for when to escalate
  if (client.settings?.escalationPhoneNumber) {
    fullPrompt += `\n\nESCALATION: If customer needs human assistance or has complex issues, use ESCALATE action. Escalation phone: ${client.settings.escalationPhoneNumber}`;
  }

  return fullPrompt;
};

// ============================================
// Build Simple Prompt (without conversation history)
// ============================================
// Useful for one-off queries or testing

export const buildSimplePrompt = async (
  clientId: string,
  userQuery: string
): Promise<{
  systemPrompt: string;
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
}> => {
  try {
    const client = await Client.findById(clientId);
    if (!client) {
      throw new Error('Client not found');
    }

    const products = await Product.find({ clientId, isAvailable: true })
      .limit(CONSTANTS.CONTEXT.PRODUCT_LIMIT)
      .select('name description price currency sku');

    const faqs = await FAQ.find({ clientId, isActive: true })
      .sort({ priority: -1 })
      .limit(CONSTANTS.CONTEXT.FAQ_LIMIT)
      .select('question answer');

    const context: PromptContext = {
      clientProfile: {
        businessName: client.businessName,
        industry: client.industry,
        description: client.description,
      },
      products: products.map((p) => ({
        name: p.name,
        description: p.description,
        price: p.price,
        currency: p.currency,
        sku: p.sku,
      })),
      faqs: faqs.map((f) => ({
        question: f.question,
        answer: f.answer,
      })),
      conversationHistory: [],
    };

    const systemPrompt = buildSystemPrompt(client, undefined, context);

    return {
      systemPrompt,
      messages: [{ role: 'user', content: userQuery }],
    };
  } catch (error) {
    logger.error('Error building simple prompt:', error);
    throw error;
  }
};

// ============================================
// EXAMPLE FULL PROMPT OUTPUT
// ============================================
/*
This is what a complete assembled prompt looks like:

SYSTEM PROMPT:
---------------
You are an AI assistant for Elegant Threads, a business in the Fashion & Apparel industry.

Your role is to help customers by:
1. Answering questions about products and services
2. Helping customers find what they're looking for
3. Processing orders when customers are ready to buy
4. Escalating to a human agent when necessary

IMPORTANT RESPONSE RULES:
- You MUST respond ONLY with valid JSON in the exact format specified below
- Do NOT include any text outside the JSON structure
[... rest of template ...]

ABOUT Elegant Threads:
Premium fashion boutique offering handcrafted ethnic wear and contemporary fusion styles.

=== AVAILABLE PRODUCTS ===

1. Silk Saree - Royal Blue (SKU: SS001)
   Price: INR 8500
   Description: Handwoven pure silk saree with intricate gold zari work

2. Cotton Kurta Set (SKU: CK002)
   Price: INR 2499
   Description: Comfortable cotton kurta with matching palazzo pants

[... more products ...]

=== FREQUENTLY ASKED QUESTIONS ===

Q1: What is your return policy?
A1: We accept returns within 7 days of delivery if the item is unused with tags attached.

Q2: Do you offer custom sizing?
A2: Yes! We offer custom sizing for an additional fee of INR 500.

[... more FAQs ...]

=== BUSINESS HOURS ===
09:00 - 18:00 (Asia/Kolkata)

MESSAGES:
---------
user: Hi, I'm looking for a saree for a wedding
assistant: Hello! I'd be happy to help you find the perfect saree for the wedding. We have beautiful options. Are you looking for silk, georgette, or another fabric?
user: Silk would be great
assistant: [JSON response with product recommendations]

CURRENT USER QUERY:
-------------------
What colors do you have in silk sarees?

This structured format gives the LLM all the context it needs to provide accurate,
business-specific responses while maintaining conversation continuity.
*/
