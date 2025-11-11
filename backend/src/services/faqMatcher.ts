// ============================================
// FAQ Matching Service (Exact + Fuzzy Matching)
// ============================================

import Fuse from 'fuse.js';
import { FAQ } from '../models/FAQ';
import { IFAQ } from '../types';
import { CONSTANTS } from '../config/constants';
import { logger } from '../utils/logger';

// ============================================
// Find Exact or Close FAQ Matches
// ============================================

export const findMatchingFAQ = async (
  clientId: string,
  userQuery: string
): Promise<{ faq: IFAQ; score: number } | null> => {
  try {
    // Fetch all active FAQs for the client
    const faqs = await FAQ.find({
      clientId,
      isActive: true,
    });

    if (faqs.length === 0) {
      logger.info('No FAQs found for client', { clientId });
      return null;
    }

    // Configure Fuse.js for FAQ matching
    const fuse = new Fuse(faqs, {
      keys: [
        { name: 'question', weight: 0.7 },
        { name: 'answer', weight: 0.2 },
        { name: 'tags', weight: 0.1 },
      ],
      threshold: CONSTANTS.THRESHOLDS.FAQ_MATCH, // 0.8 = stricter matching
      includeScore: true,
      minMatchCharLength: 3,
    });

    // Perform search
    const results = fuse.search(userQuery, { limit: 1 });

    if (results.length === 0) {
      logger.info('No FAQ match found', { query: userQuery });
      return null;
    }

    const topMatch = results[0];

    // Fuse.js score: 0 = perfect match, 1 = no match
    // Convert to 0-1 confidence score (1 = perfect match)
    const confidenceScore = 1 - (topMatch.score || 1);

    logger.info('FAQ match found', {
      query: userQuery,
      question: topMatch.item.question,
      score: confidenceScore,
    });

    return {
      faq: topMatch.item,
      score: confidenceScore,
    };
  } catch (error) {
    logger.error('Error finding FAQ match:', error);
    throw error;
  }
};

// ============================================
// Get Multiple FAQ Matches (for context)
// ============================================

export const findTopFAQMatches = async (
  clientId: string,
  userQuery: string,
  limit: number = 3
): Promise<Array<{ faq: IFAQ; score: number }>> => {
  try {
    const faqs = await FAQ.find({
      clientId,
      isActive: true,
    });

    if (faqs.length === 0) {
      return [];
    }

    const fuse = new Fuse(faqs, {
      keys: [
        { name: 'question', weight: 0.7 },
        { name: 'answer', weight: 0.2 },
        { name: 'tags', weight: 0.1 },
      ],
      threshold: 0.7, // More relaxed for multiple matches
      includeScore: true,
    });

    const results = fuse.search(userQuery, { limit });

    return results.map((result) => ({
      faq: result.item,
      score: 1 - (result.score || 1),
    }));
  } catch (error) {
    logger.error('Error finding top FAQ matches:', error);
    throw error;
  }
};

// ============================================
// Get FAQs by Category
// ============================================

export const getFAQsByCategory = async (
  clientId: string,
  category: string
): Promise<IFAQ[]> => {
  try {
    const faqs = await FAQ.find({
      clientId,
      category: new RegExp(category, 'i'),
      isActive: true,
    }).sort({ priority: -1 });

    logger.info('FAQs retrieved by category', {
      category,
      count: faqs.length,
    });

    return faqs;
  } catch (error) {
    logger.error('Error getting FAQs by category:', error);
    throw error;
  }
};

// ============================================
// Check if Query Should Use FAQ (Pre-filter)
// ============================================
// Determines if user query is FAQ-like before doing expensive matching

export const isLikelyFAQQuery = (query: string): boolean => {
  const faqKeywords = [
    'what',
    'how',
    'when',
    'where',
    'why',
    'who',
    'can i',
    'do you',
    'are you',
    'is there',
    'policy',
    'return',
    'refund',
    'shipping',
    'delivery',
    'payment',
    'hours',
    'contact',
    'location',
  ];

  const lowerQuery = query.toLowerCase();
  const hasKeyword = faqKeywords.some((keyword) => lowerQuery.includes(keyword));
  const hasQuestionMark = query.includes('?');

  return hasKeyword || hasQuestionMark;
};

// ============================================
// Phase 2: Semantic FAQ Matching (Placeholder)
// ============================================
/*
TODO: Implement semantic similarity for better FAQ matching

IMPLEMENTATION PLAN:
1. Generate embeddings for FAQ questions:
   - Use sentence-transformers or OpenAI embeddings
   - Store embeddings in FAQ model or vector database

2. Implement cosine similarity search:
   - Generate embedding for user query
   - Find most similar FAQ questions using vector search
   - Combine with keyword-based Fuse.js for hybrid approach

3. Train custom FAQ classification model (optional):
   - Fine-tune BERT/RoBERTa on your FAQ dataset
   - Better accuracy for domain-specific questions

EXAMPLE CODE:

import { OpenAI } from 'openai';
const openai = new OpenAI();

export const generateFAQEmbedding = async (text: string): Promise<number[]> => {
  const response = await openai.embeddings.create({
    model: 'text-embedding-ada-002',
    input: text,
  });
  return response.data[0].embedding;
};

export const findSemanticFAQMatch = async (
  clientId: string,
  userQuery: string
): Promise<{ faq: IFAQ; similarity: number } | null> => {
  // 1. Generate query embedding
  const queryEmbedding = await generateFAQEmbedding(userQuery);

  // 2. Use vector search (MongoDB Atlas Vector Search or Pinecone)
  const results = await FAQ.aggregate([
    {
      $search: {
        cosmosSearch: {
          vector: queryEmbedding,
          path: 'questionEmbedding',
          k: 1,
        },
        filter: { clientId, isActive: true },
      },
    },
  ]);

  if (results.length === 0) return null;

  const topMatch = results[0];
  return {
    faq: topMatch,
    similarity: topMatch.similarity, // Cosine similarity score
  };
};

// Hybrid approach (best of both worlds):
export const findHybridFAQMatch = async (
  clientId: string,
  userQuery: string
): Promise<IFAQ | null> => {
  // 1. Try semantic search
  const semanticMatch = await findSemanticFAQMatch(clientId, userQuery);

  // 2. Try keyword-based search
  const keywordMatch = await findMatchingFAQ(clientId, userQuery);

  // 3. Combine scores and pick best match
  if (semanticMatch && semanticMatch.similarity > 0.85) {
    return semanticMatch.faq;
  }

  if (keywordMatch && keywordMatch.score > 0.8) {
    return keywordMatch.faq;
  }

  return null;
};
*/
