import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { registerUserService, loginUserService, getCurrentUserService, logoutUserService } from "../services/user.services.js";

export const registerUser = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password, role } = req.body;
  const result = await registerUserService(name, email, password, role);
  res.status(201).json({ success: true, data: result });
});

export const loginUser = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const result = await loginUserService(email, password);
  res.json({ success: true, data: result });
});

export const getCurrentUser = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ success: false, error: "Unauthorized" });
  }
  const result = await getCurrentUserService(userId);
  res.json({ success: true, data: result });
});

export const logoutUser = asyncHandler(async (req: Request, res: Response) => {
  const result = await logoutUserService();
  res.json({ success: true, data: result });
});
