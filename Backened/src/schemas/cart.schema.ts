import { z } from 'zod';

// Schema for adding item to cart
export const addCartItemSchema = z.object({
  productId: z.string().uuid('Invalid product ID'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1').optional().default(1),
});

// Schema for updating cart item
export const updateCartItemSchema = z.object({
  productId: z.string().uuid('Invalid product ID'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
});

// Schema for removing cart item
export const removeCartItemSchema = z.object({
  productId: z.string().uuid('Invalid product ID'),
});

// Types
export type AddCartItemInput = z.infer<typeof addCartItemSchema>;
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;
export type RemoveCartItemInput = z.infer<typeof removeCartItemSchema>;