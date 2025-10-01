import db from "../config/db.js";
import { categories } from "../models/category.js";
import { eq } from "drizzle-orm";
import AppError from "../utils/AppError.js";

// Create
export const createCategory = async (name: string) => {
  try {
    const result = await db.insert(categories).values({ name }).returning();
    return result[0] || null;
  } catch (error: any) {
    if (error.code === "23505") { // PostgreSQL unique_violation
      throw new AppError(400, "Category name must be unique");
    }
    throw error;
  }
};

// Read
export const getCategories = async () => {
  return await db.select().from(categories);
};

export const getCategory = async (id: number) => {
  const result = await db
    .select()
    .from(categories)
    .where(eq(categories.id, id));

  return result[0] || null;
};

// Update
export const updateCategory = async (id: number, name: string) => {
  const result = await db
    .update(categories)
    .set({ name })
    .where(eq(categories.id, id))
    .returning();

  return result[0] || null;
};

// Delete
export const deleteCategory = async (id: number) => {
  const result = await db
    .delete(categories)
    .where(eq(categories.id, id))
    .returning();

  return result[0] || null;
};
 
