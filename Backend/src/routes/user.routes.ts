import { Router } from "express";
import { validateBody } from "../middlewares/validate.js";
import { createUserSchema, loginUserSchema } from "../schemas/user.schema.js";
import { registerUser, loginUser, getCurrentUser, logoutUser } from "../controllers/user.controller.js";
import { authenticate } from "../middlewares/authMiddleware.js";

export const userRouter = Router();

userRouter.post("/register", validateBody(createUserSchema), registerUser);
userRouter.post("/login", validateBody(loginUserSchema), loginUser);
userRouter.get("/profile", authenticate, getCurrentUser);
userRouter.post("/logout", authenticate, logoutUser);

export default userRouter;