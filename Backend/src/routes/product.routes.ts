// src/routes/productRoutes.ts
import { Router } from "express";
import { authenticate } from  "../middlewares/authMiddleware.js";
import { authorizeRoles } from "../middlewares/roleMiddleware.js";
import { validateBody, validateQuery, validateParams } from "../middlewares/validate.js";
import { createProductSchema, updateProductSchema, getProductsQuerySchema, productIdSchema } from "../schemas/product.schema.js";
import { createProduct, getProducts, getProductById, updateProduct, deleteProduct, getProductRecommendations } from "../controllers/product.controller.js";

const productRouter = Router();

productRouter.get("/recommendations/search", getProductRecommendations); // open for everyone - search recommendations
productRouter.get("/", validateQuery(getProductsQuerySchema), getProducts); // open for everyone
productRouter.get("/:id", validateParams(productIdSchema), getProductById); // open for everyone
productRouter.post("/", validateBody(createProductSchema), authenticate, authorizeRoles("vendor", "admin"), createProduct);
productRouter.put("/:id", validateParams(productIdSchema), validateBody(updateProductSchema), authenticate, authorizeRoles("vendor", "admin"), updateProduct);
productRouter.delete("/:id", validateParams(productIdSchema), authenticate, authorizeRoles("vendor", "admin"), deleteProduct);

export default productRouter;
