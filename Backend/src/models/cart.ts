import { pgTable, serial, uuid, integer, timestamp } from "drizzle-orm/pg-core";
import { users } from "./user.js";
import { products } from "./product.js";
export const cartItems = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  productId: uuid("product_id")
    .references(() => products.id)
    .notNull(),
  quantity: integer("quantity").default(1).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
