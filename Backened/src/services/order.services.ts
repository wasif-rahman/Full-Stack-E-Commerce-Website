import db from "../config/db.js";
import { cartItems } from "../models/cart.js";
import { products } from "../models/product.js";
import { orders, orderItems } from "../models/order.js";
import AppError from "../utils/AppError.js";
import { eq, inArray, asc, desc } from "drizzle-orm";

// ====== Types & Constants ======
export const OrderStatus = {
  Pending: "pending",
  Processing: "processing",
  Shipped: "shipped",
  Delivered: "delivered",
  Cancelled: "cancelled",
} as const;

export type OrderStatusType = (typeof OrderStatus)[keyof typeof OrderStatus];

export interface Order {
  id: string;
  userId: string;
  total: string;
  status: OrderStatusType;
  createdAt: Date;
}

export interface OrderItem {
  id: number;
  orderId: string;
  productId: string;
  quantity: number;
  price: string;
}

// ====== Helpers ======
const getOrderItems = async (orderIds: string[]) => {
  if (orderIds.length === 0) return [];
  return db
    .select()
    .from(orderItems)
    .where(inArray(orderItems.orderId, orderIds));
};

// ====== Services ======

export const createOrderFromCart = async (userId: string) => {
  return await db.transaction(async (transaction) => {
    // Fetch cart items
    const cart = await transaction
      .select()
      .from(cartItems)
      .where(eq(cartItems.userId, userId));

    if (cart.length === 0) throw new AppError(400, "Your cart is empty");

    // Fetch products
    const productIds = cart.map((item) => item.productId);
    const productList = await transaction
      .select()
      .from(products)
      .where(inArray(products.id, productIds));

    const productMap = new Map(productList.map((p) => [p.id, p]));

    // Prepare order items & total
    let total = 0;
    const orderItemsData = cart.map((item) => {
      const prod = productMap.get(item.productId);
      if (!prod) {
        throw new AppError(404, `Product with id ${item.productId} not found`);
      }

      const priceCents = Math.round(Number(prod.price) * 100);
      total += priceCents * item.quantity;

      return {
        productId: item.productId,
        quantity: item.quantity,
        price: (priceCents / 100).toFixed(2),
      };
    });

    // Insert order
    const [newOrder] = await transaction
      .insert(orders)
      .values({
        userId,
        total: (total / 100).toFixed(2),
        status: OrderStatus.Pending,
      })
      .returning();

    if (!newOrder) throw new AppError(500, "Failed to create order");

    // Insert order items
    await transaction.insert(orderItems).values(
      orderItemsData.map((oi) => ({
        orderId: newOrder.id,
        ...oi,
      }))
    );

    // Clear cart
    await transaction.delete(cartItems).where(eq(cartItems.userId, userId));

    return {
      ...newOrder,
      status: newOrder.status as OrderStatusType,
      total: newOrder.total as string,
    };
  });
};

export const getOrdersByRole = async (
  userId: string,
  userRole: string,
  sort?: string
) => {
  let userOrders: Order[] = [];

  if (userRole === "customer") {
    userOrders = (
      await db.select().from(orders).where(eq(orders.userId, userId))
    ).map((order) => ({
      ...order,
      status: order.status as OrderStatusType,
      total: order.total as string,
    }));
  } else if (userRole === "vendor") {
    const vendorProducts = await db
      .select({ id: products.id })
      .from(products)
      .where(eq(products.vendorId, userId));

    const productIds = vendorProducts.map((p) => p.id);

    if (productIds.length === 0) return [];

    const vendorOrderItems = await db
      .select({ orderId: orderItems.orderId })
      .from(orderItems)
      .where(inArray(orderItems.productId, productIds));

    const orderIds = [...new Set(vendorOrderItems.map((item) => item.orderId))];

    userOrders = (
      await db.select().from(orders).where(inArray(orders.id, orderIds))
    ).map((order) => ({
      ...order,
      status: order.status as OrderStatusType,
      total: order.total as string,
    }));
  } else if (userRole === "admin") {
    userOrders = (await db.select().from(orders)).map((order) => ({
      ...order,
      status: order.status as OrderStatusType,
      total: order.total as string,
    }));
  } else {
    throw new AppError(403, "Access denied: Invalid role");
  }

  // Sorting logic
  if (sort) {
    userOrders.sort((a, b) => {
      switch (sort) {
        case "total":
          return Number(a.total) - Number(b.total);
        case "-total":
          return Number(b.total) - Number(a.total);
        case "createdAt":
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        case "-createdAt":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case "status":
          return a.status.localeCompare(b.status);
        case "-status":
          return b.status.localeCompare(a.status);
        default:
          return 0;
      }
    });
  } else {
    // Default sort by createdAt descending (newest first)
    userOrders.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  const orderIds = userOrders.map((o) => o.id);
  const allOrderItems = await getOrderItems(orderIds);

  // Attach items
  const itemsByOrder: Record<string, OrderItem[]> = {};
  allOrderItems.forEach((item) => {
    const orderId = item.orderId;
    if (!itemsByOrder[orderId]) {
      itemsByOrder[orderId] = [];
    }
    itemsByOrder[orderId].push(item);
  });

  return userOrders.map((order) => ({
    ...order,
    items: itemsByOrder[order.id] || [],
  }));
};

/**
 * Retrieves a specific order by ID (customer only).
 */
export const getOrderById = async (orderId: string, userId: string) => {
  const [order] = await db.select().from(orders).where(eq(orders.id, orderId));
  if (!order || order.userId !== userId) {
    return null;
  }

  const orderItemsList = await getOrderItems([orderId]);

  return {
    ...order,
    status: order.status as OrderStatusType,
    total: order.total as string,
    items: orderItemsList,
  };
};

/**
 * Updates the status of an order (admin only).
 */
export const updateOrderStatus = async (
  orderId: string,
  newStatus: OrderStatusType
) => {
  if (!Object.values(OrderStatus).includes(newStatus)) {
    throw new AppError(
      400,
      `Invalid status. Valid statuses: ${Object.values(OrderStatus).join(", ")}`
    );
  }

  const [updatedOrder] = await db
    .update(orders)
    .set({ status: newStatus })
    .where(eq(orders.id, orderId))
    .returning();

  if (!updatedOrder) throw new AppError(404, "Order not found");

  return {
    ...updatedOrder,
    status: updatedOrder.status as OrderStatusType,
    total: updatedOrder.total as string,
  };
};
