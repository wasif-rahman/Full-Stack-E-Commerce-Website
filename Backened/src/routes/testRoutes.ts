// src/routes/testRoutes.ts
import { Router } from "express";
import { authenticate } from "../middlewares/authMiddleware.js";
import { authorizeRoles } from "../middlewares/roleMiddleware.js";

const testRouter = Router();

// open to all logged-in users
testRouter.get("/profile", authenticate, (req, res) => {
  res.json({ message: "Profile access granted", user: (req as any).user });
});

// only vendors or admins can access
testRouter.post("/vendor-zone", authenticate, authorizeRoles("vendor", "admin"), (req, res) => {
  res.json({ message: "Vendor/Admin access granted" });
});

// only admins
testRouter.delete("/admin-zone", authenticate, authorizeRoles("admin"), (req, res) => {
  res.json({ message: "Admin access granted" });
});

export default testRouter;
