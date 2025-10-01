import { Router } from "express";
import { createOrder, getOrders, getOrder, updateOrder } from "../controllers/order.controller.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import { authorizeRoles } from "../middlewares/roleMiddleware.js";
import { validateQuery, validateParams, validateBody } from "../middlewares/validate.js";
import { getOrdersQuerySchema, orderIdSchema, updateOrderSchema } from "../schemas/order.schema.js";

const orderRouter = Router();

orderRouter.post("/", authenticate, createOrder);
orderRouter.get("/", validateQuery(getOrdersQuerySchema), authenticate, getOrders);
orderRouter.get("/:id", validateParams(orderIdSchema), authenticate, getOrder);
orderRouter.put("/:id", validateParams(orderIdSchema), validateBody(updateOrderSchema), authenticate, authorizeRoles("admin"), updateOrder);

export default orderRouter;
