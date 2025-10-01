import { Router } from "express";
import {
  createCategoryController,
  getCategoriesController,
  getCategoryController,
  updateCategoryController,
  deleteCategoryController
} from "../controllers/category.controller.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import { authorizeRoles } from "../middlewares/roleMiddleware.js";
import { validateBody, validateParams } from "../middlewares/validate.js";
import { createCategorySchema, updateCategorySchema, categoryIdSchema } from "../schemas/category.schema.js";

const categoryRouter = Router();

// Public: get categories
categoryRouter.get("/", getCategoriesController);
categoryRouter.get("/:id", getCategoryController);

// Admin only: create, update, delete
categoryRouter.post("/", validateBody(createCategorySchema), authenticate, authorizeRoles("admin"), createCategoryController);
categoryRouter.put("/:id", validateParams(categoryIdSchema), validateBody(updateCategorySchema), authenticate, authorizeRoles("admin"), updateCategoryController);
categoryRouter.delete("/:id", validateParams(categoryIdSchema), authenticate, authorizeRoles("admin"), deleteCategoryController);

export default categoryRouter;
