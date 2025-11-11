// ============================================
// Input Validation Utilities
// ============================================

import { body, param, query, ValidationChain } from 'express-validator';

// ============================================
// Auth Validators
// ============================================

export const loginValidator = (): ValidationChain[] => [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

export const registerValidator = (): ValidationChain[] => [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('role').isIn(['ADMIN', 'CLIENT']).withMessage('Valid role is required'),
];

// ============================================
// Client Validators
// ============================================

export const createClientValidator = (): ValidationChain[] => [
  body('businessName').trim().notEmpty().withMessage('Business name is required'),
  body('industry').trim().notEmpty().withMessage('Industry is required'),
  body('whatsappPhoneNumber').isMobilePhone('any').withMessage('Valid phone number is required'),
  body('description').optional().trim(),
  body('website').optional().isURL().withMessage('Valid URL required'),
];

// ============================================
// Product Validators
// ============================================

export const createProductValidator = (): ValidationChain[] => [
  body('name').trim().notEmpty().withMessage('Product name is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('price').isFloat({ min: 0 }).withMessage('Valid price is required'),
  body('currency').isLength({ min: 3, max: 3 }).withMessage('Valid currency code required (e.g., USD, INR)'),
  body('category').optional().trim(),
  body('stock').optional().isInt({ min: 0 }).withMessage('Stock must be non-negative'),
  body('sku').optional().trim(),
  body('tags').optional().isArray(),
];

// ============================================
// FAQ Validators
// ============================================

export const createFAQValidator = (): ValidationChain[] => [
  body('question').trim().notEmpty().withMessage('Question is required'),
  body('answer').trim().notEmpty().withMessage('Answer is required'),
  body('category').optional().trim(),
  body('tags').optional().isArray(),
  body('priority').optional().isInt({ min: 1, max: 10 }),
];

// ============================================
// Prompt Validators
// ============================================

export const createPromptValidator = (): ValidationChain[] => [
  body('name').trim().notEmpty().withMessage('Prompt name is required'),
  body('type').isIn(['system', 'snippet']).withMessage('Type must be system or snippet'),
  body('content').trim().notEmpty().withMessage('Content is required'),
  body('variables').optional().isArray(),
];

// ============================================
// ID Validators
// ============================================

export const mongoIdValidator = (paramName: string = 'id'): ValidationChain =>
  param(paramName).isMongoId().withMessage('Invalid ID format');

// ============================================
// Query Validators
// ============================================

export const paginationValidator = (): ValidationChain[] => [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
];
