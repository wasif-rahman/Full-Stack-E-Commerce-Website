import "dotenv/config";
import express from "express";
import cors from "cors";
import userRouter from "./routes/user.routes.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import testRoutes from "./routes/testRoutes.js";
import productRouter from "./routes/product.routes.js";
import cartRouter from "./routes/cart.routes.js";
import { notFound } from "./middlewares/notFound.js";
import { errorConverter } from "./middlewares/errorConverter.js";
import orderRouter from "./routes/order.routes.js";
import categoryRouter from "./routes/category.routes.js";

const app = express();
app.use(cors());
app.use(express.json());

// Health check
app.get("/health", (_req, res) => {
  console.log('Health check called');
  res.json({ ok: true, timestamp: new Date().toISOString() });
});

// Test route
app.get("/test", (_req, res) => {
  console.log('Test route called');
  res.json({ message: "Test route works", timestamp: new Date().toISOString() });
});

// Routes
app.use("/users", userRouter);
app.use("/tests", testRoutes);
app.use("/products", productRouter);
app.use("/carts", cartRouter);
app.use("/orders", orderRouter);
app.use("/categories", categoryRouter);

app.use(notFound);

app.use(errorConverter);
app.use(errorHandler);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check available at http://localhost:${PORT}/health`);
  console.log(`Test route available at http://localhost:${PORT}/test`);
// Trigger restart
}).on('error', (err) => {
  console.error('Server failed to start:', err);
  process.exit(1);
});

