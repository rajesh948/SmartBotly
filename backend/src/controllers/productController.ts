import { Response } from 'express';
import Product from '../models/Product';
import { AuthRequest } from '../middleware/auth';
import path from 'path';
import fs from 'fs';

/**
 * Get all products (Admin: all products, Client: only their products)
 */
export const getProducts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userRole = req.user?.role;
    const userId = req.user?.id;

    let query: any = {};

    // If client, filter by their clientId
    if (userRole === 'client') {
      const ClientUser = require('../models/ClientUser').default;
      const clientUser = await ClientUser.findById(userId);

      if (!clientUser || !clientUser.clientProfileId) {
        res.status(404).json({ error: 'Client profile not found' });
        return;
      }

      query.clientId = clientUser.clientProfileId;
    }

    // Admin can filter by clientId if provided
    if (userRole === 'admin' && req.query.clientId) {
      query.clientId = req.query.clientId;
    }

    // Filter by category if provided
    if (req.query.category) {
      query.category = req.query.category;
    }

    // Search by product name if provided
    if (req.query.search) {
      query.productName = { $regex: req.query.search, $options: 'i' };
    }

    const products = await Product.find(query)
      .populate('clientId', 'companyName email')
      .sort({ createdAt: -1 });

    res.json({ products });
  } catch (error: any) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};

/**
 * Get single product by ID
 */
export const getProductById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userRole = req.user?.role;
    const userId = req.user?.id;

    const product = await Product.findById(id).populate('clientId', 'companyName email');

    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    // If client, verify they own this product
    if (userRole === 'client') {
      const ClientUser = require('../models/ClientUser').default;
      const clientUser = await ClientUser.findById(userId);

      if (!clientUser || !clientUser.clientProfileId) {
        res.status(404).json({ error: 'Client profile not found' });
        return;
      }

      if (product.clientId._id.toString() !== clientUser.clientProfileId.toString()) {
        res.status(403).json({ error: 'You do not have permission to access this product' });
        return;
      }
    }

    res.json({ product });
  } catch (error: any) {
    console.error('Get product by ID error:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
};

/**
 * Create new product
 */
export const createProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { productName, category, price, description, stock, clientId: requestClientId } = req.body;
    const userRole = req.user?.role;
    const userId = req.user?.id;

    // Validation
    if (!productName || !price || !description) {
      res.status(400).json({ error: 'Product name, price, and description are required' });
      return;
    }

    if (price < 0) {
      res.status(400).json({ error: 'Price must be greater than or equal to 0' });
      return;
    }

    if (stock !== undefined && stock < 0) {
      res.status(400).json({ error: 'Stock must be greater than or equal to 0' });
      return;
    }

    // Check if image was uploaded
    if (!req.file) {
      res.status(400).json({ error: 'Product image is required' });
      return;
    }

    let clientId;

    // Determine clientId based on role
    if (userRole === 'admin') {
      // Admin can create product for any client
      if (!requestClientId) {
        res.status(400).json({ error: 'Client ID is required for admin' });
        return;
      }
      clientId = requestClientId;
    } else if (userRole === 'client') {
      // Client creates product for themselves
      const ClientUser = require('../models/ClientUser').default;
      const clientUser = await ClientUser.findById(userId);

      if (!clientUser || !clientUser.clientProfileId) {
        res.status(404).json({ error: 'Client profile not found' });
        return;
      }

      clientId = clientUser.clientProfileId;
    } else {
      res.status(403).json({ error: 'Unauthorized' });
      return;
    }

    // Generate image URL
    const imageUrl = `/uploads/products/${req.file.filename}`;

    // Create product
    const product = await Product.create({
      productName,
      category,
      price,
      description,
      stock: stock || 0,
      clientId,
      imageUrl,
    });

    const populatedProduct = await Product.findById(product._id).populate('clientId', 'companyName email');

    res.status(201).json({
      message: 'Product created successfully',
      product: populatedProduct,
    });
  } catch (error: any) {
    console.error('Create product error:', error);

    // Delete uploaded image if product creation fails
    if (req.file) {
      const filePath = path.join(__dirname, '../../uploads/products', req.file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    res.status(500).json({ error: 'Failed to create product' });
  }
};

/**
 * Update product
 */
export const updateProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { productName, category, price, description, stock, clientId: requestClientId } = req.body;
    const userRole = req.user?.role;
    const userId = req.user?.id;

    // Find existing product
    const product = await Product.findById(id);

    if (!product) {
      // Delete uploaded image if any
      if (req.file) {
        const filePath = path.join(__dirname, '../../uploads/products', req.file.filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    // Check permissions
    if (userRole === 'client') {
      const ClientUser = require('../models/ClientUser').default;
      const clientUser = await ClientUser.findById(userId);

      if (!clientUser || !clientUser.clientProfileId) {
        res.status(404).json({ error: 'Client profile not found' });
        return;
      }

      if (product.clientId.toString() !== clientUser.clientProfileId.toString()) {
        // Delete uploaded image if any
        if (req.file) {
          const filePath = path.join(__dirname, '../../uploads/products', req.file.filename);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        }
        res.status(403).json({ error: 'You do not have permission to edit this product' });
        return;
      }
    }

    // Validation
    if (price !== undefined && price < 0) {
      res.status(400).json({ error: 'Price must be greater than or equal to 0' });
      return;
    }

    if (stock !== undefined && stock < 0) {
      res.status(400).json({ error: 'Stock must be greater than or equal to 0' });
      return;
    }

    // Update fields
    if (productName) product.productName = productName;
    if (category !== undefined) product.category = category;
    if (price !== undefined) product.price = price;
    if (description) product.description = description;
    if (stock !== undefined) product.stock = stock;

    // Admin can change clientId
    if (userRole === 'admin' && requestClientId) {
      product.clientId = requestClientId;
    }

    // Handle image update
    if (req.file) {
      // Delete old image
      if (product.imageUrl) {
        const oldImagePath = path.join(__dirname, '../..', product.imageUrl);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }

      // Set new image URL
      product.imageUrl = `/uploads/products/${req.file.filename}`;
    }

    await product.save();

    const updatedProduct = await Product.findById(product._id).populate('clientId', 'companyName email');

    res.json({
      message: 'Product updated successfully',
      product: updatedProduct,
    });
  } catch (error: any) {
    console.error('Update product error:', error);

    // Delete uploaded image if update fails
    if (req.file) {
      const filePath = path.join(__dirname, '../../uploads/products', req.file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    res.status(500).json({ error: 'Failed to update product' });
  }
};

/**
 * Delete product
 */
export const deleteProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userRole = req.user?.role;
    const userId = req.user?.id;

    const product = await Product.findById(id);

    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    // Check permissions
    if (userRole === 'client') {
      const ClientUser = require('../models/ClientUser').default;
      const clientUser = await ClientUser.findById(userId);

      if (!clientUser || !clientUser.clientProfileId) {
        res.status(404).json({ error: 'Client profile not found' });
        return;
      }

      if (product.clientId.toString() !== clientUser.clientProfileId.toString()) {
        res.status(403).json({ error: 'You do not have permission to delete this product' });
        return;
      }
    }

    // Delete image file
    if (product.imageUrl) {
      const imagePath = path.join(__dirname, '../..', product.imageUrl);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await Product.findByIdAndDelete(id);

    res.json({ message: 'Product deleted successfully' });
  } catch (error: any) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
};
