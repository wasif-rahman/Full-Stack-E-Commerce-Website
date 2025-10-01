import { z } from 'zod';

// Replicating the Drizzle role enum for Zod
export const ZodRoleEnum = z.enum(["customer", "vendor", "admin"]);

// Schema for the BODY of the create user request
export const createUserSchema = z.object({
  name: z.string()
    .min(3, 'Name must be at least 3 characters long')
    .max(100, 'Name must be at most 100 characters long'),

  email: z.string()
    .email('Invalid email address')
    .max(200, 'Email must be at most 200 characters long'),

  password: z.string()
    .min(8, 'Password must be at least 8 characters long'),

  role: ZodRoleEnum.optional(),
});

// Schema for the BODY of the login request
export const loginUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string(),
});

// Schema for updating user (optional fields)
export const updateUserSchema = z.object({
  name: z.string().min(3).max(100).optional(),
  email: z.string().email().max(200).optional(),
  password: z.string().min(8).optional(),
  role: ZodRoleEnum.optional(),
});

// We can infer the TypeScript types directly from the schemas
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type LoginUserInput = z.infer<typeof loginUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;

