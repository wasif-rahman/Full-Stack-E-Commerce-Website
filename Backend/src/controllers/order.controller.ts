import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  createOrderFromCart,
  getOrdersByRole,
  getOrderById,
  updateOrderStatus,
  OrderStatus,
} from "../services/order.services.js";
import AppError from "../utils/AppError.js";

// ====== Create Order ======
export const createOrder = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    throw new AppError(401, "User not authenticated");
  }

  const order = await createOrderFromCart(userId);

  res.status(201).json({
    success: true,
    message: "Order created successfully",
    data: order,
  });
});

// ====== Get Orders by Role ======
export const getOrders = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const userRole = req.user?.role;
  const { sort } = req.query;

  if (!userId || !userRole) {
    throw new AppError(401, "User not authenticated");
  }

  const orders = await getOrdersByRole(userId, userRole, sort as string);

  res.status(200).json({
    success: true,
    message: "Orders retrieved successfully",
    data: orders,
  });
});

// ====== Get Single Order ======
export const getOrder = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const userRole = req.user?.role;
  const { id: orderId } = req.params;

  if (!userId || !userRole) {
    throw new AppError(401, "User not authenticated");
  }

  if (!orderId) {
    throw new AppError(400, "Order ID is required");
  }

  const order = await getOrderById(orderId, userId);
  if (!order) {
    throw new AppError(404, "Order not found");
  }

  // ===== Role-based access =====
  if (userRole === "customer" && order.userId !== userId) {
    throw new AppError(403, "Customers can only access their own orders");
  }

  if (userRole === "vendor") {
    // Vendor can only access orders containing their products
    // Ensure order.items has at least one product owned by vendor
    const vendorOwnsProduct = order.items.some(
      (item: any) => item.vendorId === userId
    );

    if (!vendorOwnsProduct) {
      throw new AppError(403, "Vendors can only access their own product orders");
    }
  }

  // Admin can access any order

  res.status(200).json({
    success: true,
    message: "Order retrieved successfully",
    data: order,
  });
});

// ====== Update Order Status (Admin Only) ======
export const updateOrder = asyncHandler(async (req: Request, res: Response) => {
  const { id: orderId } = req.params;
  const { status } = req.body;

  if (!orderId) {
    throw new AppError(400, "Order ID is required");
  }

  if (!status) {
    throw new AppError(400, "Status is required");
  }

  // Validate against enum
  if (!Object.values(OrderStatus).includes(status)) {
    throw new AppError(
      400,
      `Invalid status. Valid statuses: ${Object.values(OrderStatus).join(", ")}`
    );
  }

  const updatedOrder = await updateOrderStatus(orderId, status);

  res.status(200).json({
    success: true,
    message: "Order status updated successfully",
    data: updatedOrder,
  });
});
