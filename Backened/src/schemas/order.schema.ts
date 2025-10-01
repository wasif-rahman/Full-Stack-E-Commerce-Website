import { z } from 'zod';

// Schema for getting orders query
export const getOrdersQuerySchema = z.object({
  sort: z.string().optional(),
});

// Schema for order ID parameter
export const orderIdSchema = z.object({
  id: z.string().uuid('Invalid order ID'),
});

// Schema for updating order status
export const updateOrderSchema = z.object({
  status: z.string().min(1, 'Status is required'),
});

// Types
export type GetOrdersQueryInput = z.infer<typeof getOrdersQuerySchema>;
export type OrderIdInput = z.infer<typeof orderIdSchema>;
export type UpdateOrderInput = z.infer<typeof updateOrderSchema>;