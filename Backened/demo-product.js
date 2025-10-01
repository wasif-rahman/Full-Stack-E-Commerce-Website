// demo-product.js - Add 10 demo products with 5 images each
import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { eq, sql } from "drizzle-orm";
import bcrypt from "bcrypt";
import { products } from "./src/models/product.ts";
import { categories } from "./src/models/category.ts";
import { users } from "./src/models/user.ts";
import { productImages } from "./src/models/productImage.ts";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const db = drizzle(pool);

async function createDemoProducts() {
  console.log('🌱 STARTING: Seeding 10 demo products...');

  try {
    // Get existing vendor or create a new one
    const existingVendors = await db.select().from(users).where(sql`${users.role} = 'vendor'`);

    let vendorId;
    if (existingVendors.length === 0) {
      console.log('❌ No vendors found. Creating a demo vendor first...');
      const hashedPassword = await bcrypt.hash("password123", 10);
      const newVendor = await db.insert(users).values({
        name: "Demo Vendor",
        email: "demo@vendor.com",
        password: hashedPassword,
        role: "vendor"
      }).returning({ id: users.id });
      vendorId = newVendor[0].id;
      console.log('✅ Demo vendor created.');
    } else {
      vendorId = existingVendors[0].id;
      console.log(`✅ Using existing vendor with ID: ${vendorId}`);
    }

    // --- Product Creation Starts Here ---

    // 1. iPhone 15 Pro (Electronics, categoryId: 1)
    let productData = await db.insert(products).values({
      name: "iPhone 15 Pro",
      price: "1199.99",
      stock: 15,
      categoryId: 1,
      brand: "Apple",
      vendorId: vendorId,
      imageUrl: "https://m.media-amazon.com/images/I/81fxjeu8fdL._AC_SX679_.jpg"
    }).returning();
    let productId = productData[0].id;
    await db.insert(productImages).values([
      { productId, imageUrl: "https://m.media-amazon.com/images/I/81fxjeu8fdL._AC_SX679_.jpg", altText: "iPhone 15 Pro - Front", sortOrder: 1 },
      { productId, imageUrl: "https://m.media-amazon.com/images/I/71ZDY57yTQL._AC_SX679_.jpg", altText: "iPhone 15 Pro - Back", sortOrder: 2 },
      { productId, imageUrl: "https://m.media-amazon.com/images/I/71yzJoE7WlL._AC_SX679_.jpg", altText: "iPhone 15 Pro - Side", sortOrder: 3 },
      { productId, imageUrl: "https://m.media-amazon.com/images/I/61PDbUd1VaL._AC_SX679_.jpg", altText: "iPhone 15 Pro - Camera", sortOrder: 4 },
      { productId, imageUrl: "https://m.media-amazon.com/images/I/71r5eUoW0jL._AC_SX679_.jpg", altText: "iPhone 15 Pro - Box", sortOrder: 5 },
    ]);
    console.log(`- Created: ${productData[0].name}`);

    // 2. Kids T-Shirt (Kids Wear, categoryId: 2)
    productData = await db.insert(products).values({
      name: "Cartoon Print Kids T-Shirt",
      price: "19.99",
      stock: 50,
      categoryId: 2,
      brand: "Disney",
      vendorId: vendorId,
      imageUrl: "https://m.media-amazon.com/images/I/71gVwWxYVhL._AC_SX679_.jpg"
    }).returning();
    productId = productData[0].id;
    await db.insert(productImages).values([
      { productId, imageUrl: "https://m.media-amazon.com/images/I/71gVwWxYVhL._AC_SX679_.jpg", altText: "Kids T-Shirt - Front", sortOrder: 1 },
      { productId, imageUrl: "https://m.media-amazon.com/images/I/81nJK8Wq1lL._AC_SX679_.jpg", altText: "Kids T-Shirt - Back", sortOrder: 2 },
      { productId, imageUrl: "https://m.media-amazon.com/images/I/81BQYHL0LqL._AC_SX679_.jpg", altText: "Kids T-Shirt - Model", sortOrder: 3 },
      { productId, imageUrl: "https://m.media-amazon.com/images/I/81W+XwIMZWL._AC_SX679_.jpg", altText: "Kids T-Shirt - Detail", sortOrder: 4 },
      { productId, imageUrl: "https://m.media-amazon.com/images/I/81d90wscqkL._AC_SX679_.jpg", altText: "Kids T-Shirt - Pack", sortOrder: 5 },
    ]);
    console.log(`- Created: ${productData[0].name}`);

    // 3. Winter Jacket (Winter Collection, categoryId: 3)
    productData = await db.insert(products).values({
      name: "Men's Winter Puffer Jacket",
      price: "89.99",
      stock: 20,
      categoryId: 3,
      brand: "Columbia",
      vendorId: vendorId,
      imageUrl: "https://m.media-amazon.com/images/I/71Q2mhAeTtL._AC_SX679_.jpg"
    }).returning();
    productId = productData[0].id;
    await db.insert(productImages).values([
      { productId, imageUrl: "https://m.media-amazon.com/images/I/71Q2mhAeTtL._AC_SX679_.jpg", altText: "Winter Jacket - Front", sortOrder: 1 },
      { productId, imageUrl: "https://m.media-amazon.com/images/I/81Qxbl8rVYL._AC_SX679_.jpg", altText: "Winter Jacket - Back", sortOrder: 2 },
      { productId, imageUrl: "https://m.media-amazon.com/images/I/81mr3uErCWL._AC_SX679_.jpg", altText: "Winter Jacket - Hood", sortOrder: 3 },
      { productId, imageUrl: "https://m.media-amazon.com/images/I/81FeWw1WimL._AC_SX679_.jpg", altText: "Winter Jacket - Zipper", sortOrder: 4 },
      { productId, imageUrl: "https://m.media-amazon.com/images/I/81ksZr0ZFnL._AC_SX679_.jpg", altText: "Winter Jacket - Model", sortOrder: 5 },
    ]);
    console.log(`- Created: ${productData[0].name}`);

    // 4. Novel Book (Books, categoryId: 5)
    productData = await db.insert(products).values({
      name: "The Midnight Library",
      price: "14.99",
      stock: 100,
      categoryId: 5,
      brand: "Penguin",
      vendorId: vendorId,
      imageUrl: "https://m.media-amazon.com/images/I/81j5L7Y0Q+L._AC_UY436_.jpg"
    }).returning();
    productId = productData[0].id;
    await db.insert(productImages).values([
      { productId, imageUrl: "https://m.media-amazon.com/images/I/81j5L7Y0Q+L._AC_UY436_.jpg", altText: "Book - Cover", sortOrder: 1 },
      { productId, imageUrl: "https://m.media-amazon.com/images/I/71dX-9tGp+L._AC_UY436_.jpg", altText: "Book - Spine", sortOrder: 2 },
      { productId, imageUrl: "https://m.media-amazon.com/images/I/71mYhRtFzDL._AC_UY436_.jpg", altText: "Book - Pages", sortOrder: 3 },
      { productId, imageUrl: "https://m.media-amazon.com/images/I/71eh4N0zLNL._AC_UY436_.jpg", altText: "Book - Back", sortOrder: 4 },
      { productId, imageUrl: "https://m.media-amazon.com/images/I/71eLHTvYtuL._AC_UY436_.jpg", altText: "Book - Inside", sortOrder: 5 },
    ]);
    console.log(`- Created: ${productData[0].name}`);

    // 5. Football (Sports & Outdoors, categoryId: 6)
    productData = await db.insert(products).values({
      name: "Adidas World Cup Football",
      price: "39.99",
      stock: 40,
      categoryId: 6,
      brand: "Adidas",
      vendorId: vendorId,
      imageUrl: "https://m.media-amazon.com/images/I/61HfA63JTTL._AC_SX679_.jpg"
    }).returning();
    productId = productData[0].id;
    await db.insert(productImages).values([
      { productId, imageUrl: "https://m.media-amazon.com/images/I/61HfA63JTTL._AC_SX679_.jpg", altText: "Football - Main", sortOrder: 1 },
      { productId, imageUrl: "https://m.media-amazon.com/images/I/71v7q3Kz8DL._AC_SX679_.jpg", altText: "Football - Side", sortOrder: 2 },
      { productId, imageUrl: "https://m.media-amazon.com/images/I/61o6HgmPZNL._AC_SX679_.jpg", altText: "Football - Box", sortOrder: 3 },
      { productId, imageUrl: "https://m.media-amazon.com/images/I/71d+omxN6gL._AC_SX679_.jpg", altText: "Football - Grip", sortOrder: 4 },
      { productId, imageUrl: "https://m.media-amazon.com/images/I/61EdV4n4B0L._AC_SX679_.jpg", altText: "Football - Ground", sortOrder: 5 },
    ]);
    console.log(`- Created: ${productData[0].name}`);

    // 6. Smartwatch (Fashion, categoryId: 7)
    productData = await db.insert(products).values({
      name: "Samsung Galaxy Watch 6",
      price: "299.99",
      stock: 25,
      categoryId: 7,
      brand: "Samsung",
      vendorId: vendorId,
      imageUrl: "https://m.media-amazon.com/images/I/61Wc3OZQzNL._AC_SX679_.jpg"
    }).returning();
    productId = productData[0].id;
    await db.insert(productImages).values([
      { productId, imageUrl: "https://m.media-amazon.com/images/I/61Wc3OZQzNL._AC_SX679_.jpg", altText: "Watch - Front", sortOrder: 1 },
      { productId, imageUrl: "https://m.media-amazon.com/images/I/61H1KqzM9pL._AC_SX679_.jpg", altText: "Watch - Strap", sortOrder: 2 },
      { productId, imageUrl: "https://m.media-amazon.com/images/I/61fNh0b+YUL._AC_SX679_.jpg", altText: "Watch - Back", sortOrder: 3 },
      { productId, imageUrl: "https://m.media-amazon.com/images/I/61LgDzV6EnL._AC_SX679_.jpg", altText: "Watch - Charging", sortOrder: 4 },
      { productId, imageUrl: "https://m.media-amazon.com/images/I/61xKxd8yO0L._AC_SX679_.jpg", altText: "Watch - Model", sortOrder: 5 },
    ]);
    console.log(`- Created: ${productData[0].name}`);

    // 7. Sofa (Home & Living, categoryId: 8)
    productData = await db.insert(products).values({
      name: "3-Seater Fabric Sofa",
      price: "499.99",
      stock: 5,
      categoryId: 8,
      brand: "Ikea",
      vendorId: vendorId,
      imageUrl: "https://m.media-amazon.com/images/I/81wnWCe7aJL._AC_SX679_.jpg"
    }).returning();
    productId = productData[0].id;
    await db.insert(productImages).values([
      { productId, imageUrl: "https://m.media-amazon.com/images/I/81wnWCe7aJL._AC_SX679_.jpg", altText: "Sofa - Main", sortOrder: 1 },
      { productId, imageUrl: "https://m.media-amazon.com/images/I/81yqKDbv34L._AC_SX679_.jpg", altText: "Sofa - Side", sortOrder: 2 },
      { productId, imageUrl: "https://m.media-amazon.com/images/I/81M0JX8R+OL._AC_SX679_.jpg", altText: "Sofa - Cushions", sortOrder: 3 },
      { productId, imageUrl: "https://m.media-amazon.com/images/I/81qfRvnQkBL._AC_SX679_.jpg", altText: "Sofa - Back", sortOrder: 4 },
      { productId, imageUrl: "https://m.media-amazon.com/images/I/81Hv3W7UzDL._AC_SX679_.jpg", altText: "Sofa - Living Room", sortOrder: 5 },
    ]);
    console.log(`- Created: ${productData[0].name}`);

    // 8. Face Cream (Beauty & Personal Care, categoryId: 9)
    productData = await db.insert(products).values({
      name: "Olay Regenerist Face Cream",
      price: "29.99",
      stock: 60,
      categoryId: 9,
      brand: "Olay",
      vendorId: vendorId,
      imageUrl: "https://m.media-amazon.com/images/I/71VGsXn3nBL._AC_SX679_.jpg"
    }).returning();
    productId = productData[0].id;
    await db.insert(productImages).values([
      { productId, imageUrl: "https://m.media-amazon.com/images/I/71VGsXn3nBL._AC_SX679_.jpg", altText: "Cream - Main", sortOrder: 1 },
      { productId, imageUrl: "https://m.media-amazon.com/images/I/71wZqV1E6CL._AC_SX679_.jpg", altText: "Cream - Jar", sortOrder: 2 },
      { productId, imageUrl: "https://m.media-amazon.com/images/I/71Nfho2xjYL._AC_SX679_.jpg", altText: "Cream - Side", sortOrder: 3 },
      { productId, imageUrl: "https://m.media-amazon.com/images/I/71zL7S1WqGL._AC_SX679_.jpg", altText: "Cream - Open", sortOrder: 4 },
      { productId, imageUrl: "https://m.media-amazon.com/images/I/71jXqqeZYnL._AC_SX679_.jpg", altText: "Cream - Pack", sortOrder: 5 },
    ]);
    console.log(`- Created: ${productData[0].name}`);

    // 9. Yoga Mat (Health & Fitness, categoryId: 10)
    productData = await db.insert(products).values({
      name: "Non-Slip Yoga Mat",
      price: "24.99",
      stock: 70,
      categoryId: 10,
      brand: "Gaiam",
      vendorId: vendorId,
      imageUrl: "https://m.media-amazon.com/images/I/81gSz2bkVjL._AC_SX679_.jpg"
    }).returning();
    productId = productData[0].id;
    await db.insert(productImages).values([
      { productId, imageUrl: "https://m.media-amazon.com/images/I/81gSz2bkVjL._AC_SX679_.jpg", altText: "Yoga Mat - Main", sortOrder: 1 },
      { productId, imageUrl: "https://m.media-amazon.com/images/I/81zvOecJjTL._AC_SX679_.jpg", altText: "Yoga Mat - Roll", sortOrder: 2 },
      { productId, imageUrl: "https://m.media-amazon.com/images/I/81kPjPpMeRL._AC_SX679_.jpg", altText: "Yoga Mat - Texture", sortOrder: 3 },
      { productId, imageUrl: "https://m.media-amazon.com/images/I/81MQHqFQGWL._AC_SX679_.jpg", altText: "Yoga Mat - Thickness", sortOrder: 4 },
      { productId, imageUrl: "https://m.media-amazon.com/images/I/81J3Xz1Mi5L._AC_SX679_.jpg", altText: "Yoga Mat - Use", sortOrder: 5 },
    ]);
    console.log(`- Created: ${productData[0].name}`);

    // 10. Grocery Rice Pack (Groceries & Food, categoryId: 11)
    productData = await db.insert(products).values({
      name: "Basmati Rice 10kg",
      price: "49.99",
      stock: 80,
      categoryId: 11,
      brand: "Tilda",
      vendorId: vendorId,
      imageUrl: "https://m.media-amazon.com/images/I/81zYFUR3TgL._AC_SX679_.jpg"
    }).returning();
    productId = productData[0].id;
    await db.insert(productImages).values([
      { productId, imageUrl: "https://m.media-amazon.com/images/I/81zYFUR3TgL._AC_SX679_.jpg", altText: "Rice - Pack", sortOrder: 1 },
      { productId, imageUrl: "https://m.media-amazon.com/images/I/81F+YFv5DgL._AC_SX679_.jpg", altText: "Rice - Bag", sortOrder: 2 },
      { productId, imageUrl: "https://m.media-amazon.com/images/I/81vB4Wz9K2L._AC_SX679_.jpg", altText: "Rice - Grain", sortOrder: 3 },
      { productId, imageUrl: "https://m.media-amazon.com/images/I/81c6zYxX3bL._AC_SX679_.jpg", altText: "Rice - Kitchen", sortOrder: 4 },
      { productId, imageUrl: "https://m.media-amazon.com/images/I/81Hw9gv+K3L._AC_SX679_.jpg", altText: "Rice - Bowl", sortOrder: 5 },
    ]);
    console.log(`- Created: ${productData[0].name}`);

    console.log("\n🎉 10 demo products created successfully!");

  } catch (error) {
    console.error("❌ Error creating demo products:", error.message);
  } finally {
    await pool.end();
    console.log("✔️ Script finished and connection closed.");
  }
}

createDemoProducts();