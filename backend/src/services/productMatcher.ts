// ============================================
// Product Matching Service (Fuse.js + MongoDB Text Search)
// ============================================

import Fuse from 'fuse.js';
import { Product } from '../models/Product';
import { IProduct } from '../types';
import { CONSTANTS } from '../config/constants';
import { logger } from '../utils/logger';

// ============================================
// Search Products using Fuse.js
// ============================================

export const searchProducts = async (
  clientId: string,
  query: string,
  limit: number = 5
): Promise<IProduct[]> => {
  try {
    // Fetch all available products for the client
    const products = await Product.find({
      clientId,
      isAvailable: true,
    });

    if (products.length === 0) {
      logger.info('No products found for client', { clientId });
      return [];
    }

    // Configure Fuse.js for fuzzy search
    const fuse = new Fuse(products, {
      keys: [
        { name: 'name', weight: 0.4 },
        { name: 'description', weight: 0.3 },
        { name: 'category', weight: 0.2 },
        { name: 'tags', weight: 0.1 },
      ],
      threshold: CONSTANTS.THRESHOLDS.PRODUCT_MATCH, // 0.6 = flexible matching
      includeScore: true,
      minMatchCharLength: 2,
    });

    // Perform search
    const results = fuse.search(query, { limit });

    logger.info('Product search completed', {
      query,
      matchCount: results.length,
    });

    // Return matched products
    return results.map((result) => result.item);
  } catch (error) {
    logger.error('Error searching products:', error);
    throw error;
  }
};

// ============================================
// Search Products by Category
// ============================================

export const searchProductsByCategory = async (
  clientId: string,
  category: string,
  limit: number = 5
): Promise<IProduct[]> => {
  try {
    const products = await Product.find({
      clientId,
      isAvailable: true,
      category: new RegExp(category, 'i'), // Case-insensitive
    })
      .limit(limit)
      .sort({ createdAt: -1 });

    logger.info('Category search completed', {
      category,
      matchCount: products.length,
    });

    return products;
  } catch (error) {
    logger.error('Error searching by category:', error);
    throw error;
  }
};

// ============================================
// Find Product by SKU
// ============================================

export const findProductBySKU = async (
  clientId: string,
  sku: string
): Promise<IProduct | null> => {
  try {
    const product = await Product.findOne({
      clientId,
      sku: sku.toUpperCase(),
      isAvailable: true,
    });

    if (!product) {
      logger.warn('Product not found by SKU', { sku });
    }

    return product;
  } catch (error) {
    logger.error('Error finding product by SKU:', error);
    throw error;
  }
};

// ============================================
// Get Product Recommendations
// ============================================
// Returns top products based on various criteria

export const getProductRecommendations = async (
  clientId: string,
  options: {
    category?: string;
    maxPrice?: number;
    tags?: string[];
    limit?: number;
  } = {}
): Promise<IProduct[]> => {
  try {
    const { category, maxPrice, tags, limit = 5 } = options;

    const query: any = {
      clientId,
      isAvailable: true,
    };

    if (category) {
      query.category = new RegExp(category, 'i');
    }

    if (maxPrice) {
      query.price = { $lte: maxPrice };
    }

    if (tags && tags.length > 0) {
      query.tags = { $in: tags };
    }

    const products = await Product.find(query)
      .limit(limit)
      .sort({ createdAt: -1 });

    logger.info('Product recommendations generated', {
      filters: options,
      matchCount: products.length,
    });

    return products;
  } catch (error) {
    logger.error('Error getting recommendations:', error);
    throw error;
  }
};

// ============================================
// Phase 2: Vector Similarity Search (Placeholder)
// ============================================
/*
TODO: Implement vector-based product matching for semantic search

IMPLEMENTATION PLAN:
1. Add vector embedding field to Product model:
   embeddings: { type: [Number], index: true }

2. Generate embeddings using OpenAI or open-source models:
   - On product creation/update, generate embedding from name + description
   - Use OpenAI's text-embedding-ada-002 or open-source alternatives

3. Store embeddings in vector database (Pinecone, Weaviate, or MongoDB Atlas Vector Search)

4. Implement similarity search:
   - Generate embedding for user query
   - Find top-K similar products using cosine similarity
   - Combine with Fuse.js results for hybrid search

5. Image-based search:
   - Add image embedding using CLIP or similar models
   - Allow customers to send product images via WhatsApp
   - Match against product image embeddings

EXAMPLE CODE:

import { OpenAI } from 'openai';
const openai = new OpenAI();

export const generateProductEmbedding = async (text: string): Promise<number[]> => {
  const response = await openai.embeddings.create({
    model: 'text-embedding-ada-002',
    input: text,
  });
  return response.data[0].embedding;
};

export const searchProductsByVector = async (
  clientId: string,
  queryEmbedding: number[],
  limit: number = 5
): Promise<IProduct[]> => {
  // Use MongoDB Atlas Vector Search or external vector DB
  const products = await Product.aggregate([
    {
      $search: {
        cosmosSearch: {
          vector: queryEmbedding,
          path: 'embeddings',
          k: limit,
        },
        filter: { clientId, isAvailable: true },
      },
    },
  ]);

  return products;
};

// For image search:
export const searchProductsByImage = async (
  clientId: string,
  imageBuffer: Buffer
): Promise<IProduct[]> => {
  // 1. Generate image embedding using CLIP
  const imageEmbedding = await generateImageEmbedding(imageBuffer);

  // 2. Search products by image embedding
  return searchProductsByVector(clientId, imageEmbedding);
};
*/
