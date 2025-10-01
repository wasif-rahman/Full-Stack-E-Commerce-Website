import db from "../config/db.js";
import { cartItems } from "../models/cart.js";
import { eq, and } from "drizzle-orm";
import { products } from "../models/product.js";
import { users} from "../models/user.js";
import AppError from "../utils/AppError.js";

export const addItemToCartService = async (
  userId: string,
  productId: string,
  quantity: number
) => {
  // Validate that user exists
  const [user] = await db.select().from(users).where(eq(users.id, userId));
  if (!user) {
    throw new AppError(404, "User not found");
  }

  // Validate that product exists
  const [product] = await db.select().from(products).where(eq(products.id, productId));
  if (!product) {
    throw new AppError(404, "Product not found");
  }

  // Validate quantity
  if (quantity <= 0) {
    throw new AppError(400, "Quantity must be greater than 0");
  }

  // Check if product is in stock
  if (product.stock < quantity) {
    throw new AppError(400, `Insufficient stock. Available: ${product.stock}, Requested: ${quantity}`);
  }

  const existing = await db
    .select()
    .from(cartItems)
    .where(
      and(eq(cartItems.userId, userId), eq(cartItems.productId, productId))
    );

  let cartItem;
  if (existing.length > 0) {
    const item = existing[0]!;
    const newQuantity = item.quantity + quantity;

    // Check if new total quantity exceeds available stock
    if (newQuantity > product.stock) {
      throw new AppError(400, `Insufficient stock. Available: ${product.stock}, Current in cart: ${item.quantity}, Requested additional: ${quantity}`);
    }

    const updated = await db
      .update(cartItems)
      .set({ quantity: newQuantity })
      .where(eq(cartItems.id, item.id))
      .returning();
    cartItem = updated[0];
  } else {
    const newItem = await db
      .insert(cartItems)
      .values({ userId, productId, quantity })
      .returning();
    cartItem = newItem[0];
  }

  // Return in the format expected by frontend
  if (!cartItem) {
    throw new AppError(404, "Cart item not found");
  }

  if (!product) {
    throw new AppError(404, "Product not found");
  }

  return {
    id: cartItem.id,
    productId: cartItem.productId,
    quantity: cartItem.quantity,
    userId: cartItem.userId,
    product: {
      id: product.id,
      name: product.name,
      price: product.price,
      stock: product.stock,
      categoryId: product.categoryId,
      brand: product.brand,
      vendorId: product.vendorId,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    }
  };
};
export const updateCartItemService = async (
  userId: string,
  productId: string,
  quantity: number
) => {
  const updated = await db
    .update(cartItems)
    .set({ quantity })
    .where(
      and(eq(cartItems.userId, userId), eq(cartItems.productId, productId))
    )
    .returning();

  if (updated.length === 0) return null;

  const cartItem = updated[0];

  // Get the product information
  const [product] = await db.select().from(products).where(eq(products.id, productId));

  // Return in the format expected by frontend
  if (!cartItem) {
    throw new AppError(404, "Cart item not found");
  }

  if (!product) {
    throw new AppError(404, "Product not found");
  }

  return {
    id: cartItem.id,
    productId: cartItem.productId,
    quantity: cartItem.quantity,
    userId: cartItem.userId,
    product: {
      id: product.id,
      name: product.name,
      price: product.price,
      stock: product.stock,
      categoryId: product.categoryId,
      brand: product.brand,
      vendorId: product.vendorId,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    }
  };
};
export const removeCartItemsService = async (userId: string, productId: string) => {
  const deleted = await db
    .delete(cartItems)
    .where(
      and(eq(cartItems.userId, userId), eq(cartItems.productId, productId))
    )
    .returning();
  return deleted.length > 0 ? deleted[0] : null;
};
export const getUserCartService = async (userId: string) => {
  const cartData = await db
    .select({
      id: cartItems.id,
      quantity: cartItems.quantity,
      productId: products.id,
      userId: cartItems.userId,
      name: products.name,
      price: products.price,
      brand: products.brand,
      stock: products.stock,
      categoryId: products.categoryId,
      vendorId: products.vendorId,
      createdAt: products.createdAt,
      updatedAt: products.updatedAt,
    })
    .from(cartItems)
    .innerJoin(products, eq(cartItems.productId, products.id))
    .where(eq(cartItems.userId, userId));

  // Transform to match frontend CartItem interface
  return cartData.map(item => ({
    id: item.id,
    productId: item.productId,
    quantity: item.quantity,
    userId: item.userId,
    product: {
      id: item.productId,
      name: item.name,
      price: item.price,
      stock: item.stock,
      categoryId: item.categoryId,
      brand: item.brand,
      vendorId: item.vendorId,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }
  }));
};

export const clearUserCartService = async (
  userId: string,
) => {
  const deleted = await db
    .delete(cartItems)
    .where(eq(cartItems.userId, userId))
    .returning();
  return deleted;
};

