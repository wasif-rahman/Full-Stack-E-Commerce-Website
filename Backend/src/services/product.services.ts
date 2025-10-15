import db from "../config/db.js";
import { products } from "../models/product.js";
import { productImages } from "../models/productImage.js";
import { cartItems } from "../models/cart.js";
import { orderItems } from "../models/order.js";
import AppError from "../utils/AppError.js";
import { eq, and, gte, lte, ilike, asc, desc, sql } from "drizzle-orm";
import { categories } from "../models/category.js";

export const createProductService = async (
  userId: string,
  name: string,
  price: number,
  stock: number,
  categoryId: number,
  brand: string,
  imageUrl?: string
) => {
  if (!name || !price || !stock || !categoryId || !brand) {
    throw new AppError(400, "All fields (name, price, stock, categoryId, brand) are required");
  }

  const newProduct = await db
    .insert(products)
    .values({
      name ,
      price: price.toString(),
      stock: Number(stock),
      categoryId: categoryId,
      brand,
      vendorId: userId,
      ...(imageUrl && { imageUrl }),
    })
    .returning();

  return newProduct[0];
};

export const getProductsService = async (
  search?: string,
  categoryId?: string,
  brand?: string,
  sort?: string,
  minPrice?: string,
  maxPrice?: string,
  inStock?: string,
  page: number = 1,
  limit: number = 10
) => {
  const safePage = Math.max(1, page);
  const safeLimit = Math.max(1, limit);

  let conditions: any[] = [];

  if (search) conditions.push(ilike(products.name, `%${search}%`));
  if (categoryId) conditions.push(eq(products.categoryId, Number(categoryId)));
  if (brand) conditions.push(eq(products.brand, brand));
  if (inStock) conditions.push(gte(products.stock, 1));

  if (minPrice || maxPrice) {
    if (minPrice) conditions.push(gte(products.price, minPrice));
    if (maxPrice) conditions.push(lte(products.price, maxPrice));
  }

  // Sorting
  let orderBy = desc(products.createdAt);
  if (sort === "price") orderBy = asc(products.price);
  else if (sort === "-price") orderBy = desc(products.price);
  else if (sort === "name") orderBy = asc(products.name);
  else if (sort === "-name") orderBy = desc(products.name);

  // Calculate offset for pagination
  const offset = (safePage - 1) * safeLimit;

  // First, get paginated product IDs to ensure we limit by products, not joined rows
  const paginatedProducts = await db
    .select({
      id: products.id,
      name: products.name,
      price: products.price,
      stock: products.stock,
      categoryId: products.categoryId,
      brand: products.brand,
      imageUrl: products.imageUrl,
      vendorId: products.vendorId,
      createdAt: products.createdAt,
      updatedAt: products.updatedAt,
    })
    .from(products)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(orderBy)
    .limit(safeLimit)
    .offset(offset);

  // Get all images for these products
  const productIds = paginatedProducts.map(p => p.id);
  let images: any[] = [];
  if (productIds.length > 0) {
    // Use a simpler approach - get images for each product individually
    const imagePromises = productIds.map(id =>
      db.select().from(productImages).where(eq(productImages.productId, id))
    );
    const imageResults = await Promise.all(imagePromises);
    images = imageResults.flat().sort((a, b) => {
      if (a.productId !== b.productId) return a.productId.localeCompare(b.productId);
      return (a.sortOrder || 0) - (b.sortOrder || 0);
    });
  }

  // Group products with their images
  const finalProductsMap = new Map();
  paginatedProducts.forEach(product => {
    finalProductsMap.set(product.id, {
      ...product,
      images: [],
    });
  });

  images.forEach(image => {
    if (finalProductsMap.has(image.productId)) {
      finalProductsMap.get(image.productId).images.push(image);
    }
  });

  const paginatedData = Array.from(finalProductsMap.values());

  // Count total
  const totalResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(products)
    .where(conditions.length ? and(...conditions) : undefined);

  const total = Number(totalResult[0]?.count ?? 0);

  return {
    total,
    page: safePage,
    totalPages: Math.ceil(total / safeLimit),
    data: paginatedData,
  };
};

export const getProductByIdService = async (productId: string) => {
  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(productId)) {
    throw new AppError(400, "Invalid product ID format. Expected UUID.");
  }

  // Get product with images
  const data = await db
    .select({
      product: products,
      image: productImages,
    })
    .from(products)
    .leftJoin(productImages, eq(products.id, productImages.productId))
    .where(eq(products.id, productId));

  console.log('Raw data from DB:', data);

  if (data.length === 0) {
    throw new AppError(404, "Product not found");
  }

  // Group product with its images
  const product = data[0]?.product;
  const images = data.filter(row => row.image).map(row => row.image);

  console.log('Product:', product);
  console.log('Images:', images);

  if (!product) {
    throw new AppError(404, "Product not found");
  }

  const result = {
    ...product,
    images,
  };

  console.log('Final result:', result);

  return result;
};

export const updateProductService = async (
  productId: string,
  userId: string,
  userRole: string,
  updates: {
    name?: string;
    price?: number;
    stock?: number;
    categoryId?: number;
    brand?: string;
    imageUrl?: string;
  }
) => {
  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(productId)) {
    throw new AppError(400, "Invalid product ID format. Expected UUID.");
  }

  // Check if product exists and user has permission
  const [product] = await db.select().from(products).where(eq(products.id, productId));

  if (!product) {
    throw new AppError(404, "Product not found");
  }

  // Check permissions: vendor can only update their own products, admin can update any
  if (userRole === "vendor" && product.vendorId !== userId) {
    throw new AppError(403, "You can only update your own products");
  }

  if (userRole !== "vendor" && userRole !== "admin") {
    throw new AppError(403, "Insufficient permissions");
  }

  const updateData: any = {};

  if (updates.name !== undefined) updateData.name = updates.name;
  if (updates.price !== undefined) updateData.price = updates.price.toString();
  if (updates.stock !== undefined) updateData.stock = Number(updates.stock);
  if (updates.categoryId !== undefined) updateData.categoryId = Number(updates.categoryId);
  if (updates.brand !== undefined) updateData.brand = updates.brand;
  if (updates.imageUrl !== undefined) updateData.imageUrl = updates.imageUrl;

  updateData.updatedAt = new Date();

  const [updatedProduct] = await db
    .update(products)
    .set(updateData)
    .where(eq(products.id, productId))
    .returning();

  return updatedProduct;
};

export const deleteProductService = async (
  productId: string,
  userId: string,
  userRole: string
) => {
  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(productId)) {
    throw new AppError(400, "Invalid product ID format. Expected UUID.");
  }

  // Check if product exists and user has permission
  const [product] = await db.select().from(products).where(eq(products.id, productId));

  if (!product) {
    throw new AppError(404, "Product not found");
  }

  // Check permissions: vendor can only delete their own products, admin can delete any
  if (userRole === "vendor" && product.vendorId !== userId) {
    throw new AppError(403, "You can only delete your own products");
  }

  if (userRole !== "vendor" && userRole !== "admin") {
    throw new AppError(403, "Insufficient permissions");
  }

  // Delete related cart items first
  await db.delete(cartItems).where(eq(cartItems.productId, productId));

  // Delete related order items first
  await db.delete(orderItems).where(eq(orderItems.productId, productId));

  // Now delete the product
  await db.delete(products).where(eq(products.id, productId));

  return { message: "Product deleted successfully" };
};

export const getProductRecommendationsService = async (
  searchQuery: string,
  limit: number = 10
) => {
  if (!searchQuery || searchQuery.trim().length < 3) {
    return [];
  }

  const queryWords = searchQuery.trim().toLowerCase().split(/\s+/);
  const wordCount = queryWords.length;

  // Only provide recommendations for 3-4 word queries
  if (wordCount < 3 || wordCount > 4) {
    return [];
  }

  // Get all products for similarity calculation
  const allProducts = await db.select().from(products);

  // Calculate similarity scores
  const recommendations = allProducts
    .map(product => {
      const productName = product.name.toLowerCase();
      let similarityScore = 0;

      // Count matching words
      const matchingWords = queryWords.filter(word =>
        productName.includes(word)
      ).length;

      // Calculate similarity based on:
      // 1. Number of matching words
      // 2. Word order (bonus for consecutive matches)
      // 3. Exact phrase matches
      similarityScore += matchingWords * 10;

      // Check for consecutive word matches
      for (let i = 0; i < queryWords.length - 1; i++) {
        const phrase = `${queryWords[i]} ${queryWords[i + 1]}`;
        if (productName.includes(phrase)) {
          similarityScore += 15;
        }
      }

      // Check for exact query match
      if (productName.includes(searchQuery.toLowerCase())) {
        similarityScore += 25;
      }

      // Boost score for products with more matching words
      if (matchingWords === wordCount) {
        similarityScore += 20;
      }

      return {
        ...product,
        similarityScore
      };
    })
    .filter(product => product.similarityScore > 0) // Only include products with some similarity
    .sort((a, b) => b.similarityScore - a.similarityScore) // Sort by similarity score descending
    .slice(0, limit); // Limit results

  return recommendations;
};

