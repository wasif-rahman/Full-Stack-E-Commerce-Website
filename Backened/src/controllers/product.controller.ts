import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { createProductService, getProductsService, getProductByIdService, updateProductService, deleteProductService, getProductRecommendationsService } from "../services/product.services.js";

export const createProduct = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { name, price, stock, categoryId, brand, imageUrl } = req.body;

  const newProduct = await createProductService(user.id, name, Number(price), Number(stock), Number(categoryId), brand, imageUrl);

  res.status(201).json({
    success: true,
    data: newProduct,
  });
});

export const getProducts = asyncHandler(async (req: Request, res: Response) => {
  const { search, categoryId, brand, sort, minPrice, maxPrice, inStock } = req.query;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 12;

  const products = await getProductsService(
    search as string,
    categoryId as string,
    brand as string,
    sort as string,
    minPrice as string,
    maxPrice as string,
    inStock as string,
    page,
    limit
  );

  res.json({
    success: true,
    data: products,
  });
});

export const getProductById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ success: false, error: "Product ID is required" });
  }

  const product = await getProductByIdService(id);

  res.json({
    success: true,
    data: product,
  });
});

export const updateProduct = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = (req as any).user;
  const { name, price, stock, categoryId, brand, imageUrl } = req.body;

  if (!id) {
    return res.status(400).json({ success: false, error: "Product ID is required" });
  }

  const updatedProduct = await updateProductService(id, user.id, user.role, {
    ...(name && { name }),
    ...(price && { price: Number(price) }),
    ...(stock && { stock: Number(stock) }),
    ...(categoryId && { categoryId: Number(categoryId) }),
    ...(brand && { brand }),
    ...(imageUrl && { imageUrl }),
  });

  res.json({
    success: true,
    data: updatedProduct,
  });
});

export const deleteProduct = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = (req as any).user;

  if (!id) {
    return res.status(400).json({ success: false, error: "Product ID is required" });
  }

  const result = await deleteProductService(id, user.id, user.role);

  res.json({
    success: true,
    ...result,
  });
});

export const getProductRecommendations = asyncHandler(async (req: Request, res: Response) => {
  const { search } = req.query;
  const limit = Number(req.query.limit) || 12;

  const searchQuery = typeof search === 'string' ? search : '';

  const recommendations = await getProductRecommendationsService(searchQuery, limit);

  res.json({
    success: true,
    data: recommendations,
  });
});
