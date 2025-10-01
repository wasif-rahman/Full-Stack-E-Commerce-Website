import { z } from 'zod';

// Schema for creating a product
export const createProductSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  price: z.number().positive('Price must be positive'),
  stock: z.number().int().min(0, 'Stock must be non-negative'),
  categoryId: z.number().int().optional(),
  brand: z.string().max(100).optional(),
  imageUrl: z.string().url('Invalid image URL').optional(),
});

// Schema for updating a product
export const updateProductSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  price: z.number().positive().optional(),
  stock: z.number().int().min(0).optional(),
  categoryId: z.number().int().optional(),
  brand: z.string().max(100).optional(),
  imageUrl: z.string().url().optional(),
});

// Schema for product query parameters
export const getProductsQuerySchema = z.object({
  search: z.string().optional(),
  categoryId: z.string().optional(),
  brand: z.string().optional(),
  sort: z.string().optional(),
  minPrice: z.string().optional(),
  maxPrice: z.string().optional(),
  inStock: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});

// Schema for product ID parameter
export const productIdSchema = z.object({
  id: z.string().uuid('Invalid product ID'),
});