import express from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/productController';
import { authenticate, checkClientStatus } from '../middleware/auth';
import { uploadProductImage } from '../config/multer';

const router = express.Router();

/**
 * Product Routes
 * All routes require authentication
 * Admin can manage all products
 * Clients can only manage their own products
 */

// Get all products (with optional filters)
// Admin: gets all products (optionally filtered by clientId)
// Client: gets only their products
router.get('/', authenticate, checkClientStatus, getProducts);

// Get single product by ID
router.get('/:id', authenticate, checkClientStatus, getProductById);

// Create new product
// Admin: can create for any client (requires clientId in body)
// Client: creates for themselves (clientId auto-assigned)
router.post(
  '/',
  authenticate,
  checkClientStatus,
  uploadProductImage.single('image'),
  createProduct
);

// Update product
// Admin: can update any product
// Client: can only update their own products
router.put(
  '/:id',
  authenticate,
  checkClientStatus,
  uploadProductImage.single('image'),
  updateProduct
);

// Delete product
// Admin: can delete any product
// Client: can only delete their own products
router.delete('/:id', authenticate, checkClientStatus, deleteProduct);

export default router;
