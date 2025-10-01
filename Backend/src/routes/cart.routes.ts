import { Router } from "express";
import { authenticate } from "../middlewares/authMiddleware.js";
import { validateBody } from "../middlewares/validate.js";
import { addCartItemSchema, updateCartItemSchema, removeCartItemSchema } from "../schemas/cart.schema.js";
import { addItemToCart, updateCartItem,removeCartItem, clearUserCart, getUserCart } from "../controllers/cart.controller.js";

const cartRouter = Router();
cartRouter.post("/add", validateBody(addCartItemSchema), authenticate, addItemToCart);
cartRouter.post("/update", validateBody(updateCartItemSchema), authenticate, updateCartItem);
cartRouter.delete("/remove", validateBody(removeCartItemSchema), authenticate, removeCartItem);
cartRouter.delete("/clear", authenticate, clearUserCart);
cartRouter.get("/", authenticate, getUserCart);

export default cartRouter;
