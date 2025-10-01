import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import AppError from "../utils/AppError.js";
import {
  createCategory, getCategories, getCategory, updateCategory, deleteCategory
} from "../services/category.services.js";

// Create new category
export const createCategoryController = asyncHandler(async (req: Request, res: Response) => {
  const { name } = req.body;

  if (!name) {
    throw new AppError(400, "Category name is required");
  }

  // Check for duplicates inside service or here
  const newCategory = await createCategory(name);

  if (!newCategory) {
    throw new AppError(500, "Failed to create category");
  }

  res.status(201).json({
    success: true,
    message: "Category created successfully",
    data: newCategory,
  });
});

// Get all categories
export const getCategoriesController = asyncHandler(async (_req: Request, res: Response) => {
  const categories = await getCategories();

  res.status(200).json({
    success: true,
    data: categories,
  });
});

// Get single category
export const getCategoryController = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) throw new AppError(400, "Category ID is required");

  const category = await getCategory(Number(id));

  if (!category) {
    throw new AppError(404, "Category not found");
  }

  res.status(200).json({
    success: true,
    message: "Category retrieved successfully",
    data: category,
  });
});

// Update category
export const updateCategoryController = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name } = req.body;

  if (!id) throw new AppError(400, "Category ID is required");
  if (!name) throw new AppError(400, "Category name is required");

  const updatedCategory = await updateCategory(Number(id), name);

  if (!updatedCategory) {
    throw new AppError(404, "Category not found");
  }

  res.status(200).json({
    success: true,
    message: "Category updated successfully",
    data: updatedCategory,
  });
});

// Delete category
export const deleteCategoryController = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) throw new AppError(400, "Category ID is required");

  const deletedCategory = await deleteCategory(Number(id));

  if (!deletedCategory) {
    throw new AppError(404, "Category not found");
  }

  res.status(200).json({
    success: true,
    message: "Category deleted successfully",
    data: deletedCategory,
  });
});
