import { z } from 'zod';

// Schema for creating a category
export const createCategorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be at most 100 characters'),
});

// Schema for updating a category
export const updateCategorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be at most 100 characters'),
});

// Schema for category ID parameter
export const categoryIdSchema = z.object({
  id: z.string().regex(/^\d+$/, 'Invalid category ID').transform(val => parseInt(val)),
});

// Types
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type CategoryIdInput = z.infer<typeof categoryIdSchema>;