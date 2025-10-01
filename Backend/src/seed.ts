import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { users } from "./models/user.js";
import { categories } from "./models/category.js";
import { products } from "./models/product.js";
import { productImages } from "./models/productImage.js";
import bcrypt from "bcrypt";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool);

async function seedDatabase() {
  console.log("🌱 Starting database seeding...");

  try {
    // 1. Check existing categories
    const existingCategories = await db.select().from(categories);
    console.log(`📂 Found ${existingCategories.length} existing categories`);

    let insertedCategories = existingCategories;

    if (existingCategories.length === 0) {
      console.log("📂 Creating categories...");
      const categoryData = [
        { name: "Electronics" },
        { name: "Clothing" },
        { name: "Books" },
        { name: "Home & Garden" },
        { name: "Sports" },
        { name: "Beauty" },
        { name: "Toys" },
        { name: "Automotive" },
      ];

      insertedCategories = await db.insert(categories).values(categoryData).returning();
      console.log(`✅ Created ${insertedCategories.length} categories`);
    } else {
      console.log("📂 Using existing categories");
    }

    // 2. Check existing users
    const existingUsers = await db.select().from(users);
    console.log(`👥 Found ${existingUsers.length} existing users`);

    let insertedUsers = existingUsers;

    if (existingUsers.length === 0) {
      console.log("👥 Creating users...");
      const hashedPassword = await bcrypt.hash("password123", 10);

      const userData = [
        {
          name: "John Vendor",
          email: "john@vendor.com",
          password: hashedPassword,
          role: "vendor" as const,
        },
        {
          name: "Sarah Vendor",
          email: "sarah@vendor.com",
          password: hashedPassword,
          role: "vendor" as const,
        },
        {
          name: "Mike Customer",
          email: "mike@customer.com",
          password: hashedPassword,
          role: "customer" as const,
        },
        {
          name: "Admin User",
          email: "admin@store.com",
          password: hashedPassword,
          role: "admin" as const,
        },
      ];

      insertedUsers = await db.insert(users).values(userData).returning();
      console.log(`✅ Created ${insertedUsers.length} users`);
    } else {
      console.log("👥 Using existing users");
    }

    // Get vendor IDs for products
    const vendors = insertedUsers.filter(user => user.role === "vendor");

    if (vendors.length === 0) {
      console.log("❌ No vendors found. Please ensure vendor users exist.");
      return;
    }

    // 3. Check existing products
    const existingProducts = await db.select().from(products);
    console.log(`📦 Found ${existingProducts.length} existing products`);

    // Always add more products for testing, regardless of existing count
    if (true) { // Force add products for demo
      console.log("📦 Creating products...");

      // Helper function to get category ID safely
      const getCategoryId = (name: string) => insertedCategories.find(c => c.name === name)?.id;
      const vendor1Id = vendors[0]?.id;
      const vendor2Id = vendors[1]?.id;

      if (!vendor1Id || !vendor2Id) {
        console.log("❌ Vendor IDs not found. Skipping product creation.");
        return;
      }

      const productData = [
        // Electronics
        { name: "Wireless Bluetooth Headphones", price: "89.99", stock: 50, categoryId: getCategoryId("Electronics"), brand: "TechSound", vendorId: vendor1Id, imageUrl: "/placeholder.svg" },
        { name: "Smartphone 128GB", price: "699.99", stock: 25, categoryId: getCategoryId("Electronics"), brand: "PhoneCorp", vendorId: vendor1Id, imageUrl: "/placeholder.svg" },
        { name: "Laptop 16GB RAM", price: "1299.99", stock: 15, categoryId: getCategoryId("Electronics"), brand: "ComputeMax", vendorId: vendor2Id, imageUrl: "https://picsum.photos/400/400?random=3" },
        { name: "Wireless Mouse", price: "29.99", stock: 100, categoryId: getCategoryId("Electronics"), brand: "TechSound", vendorId: vendor1Id, imageUrl: "https://picsum.photos/400/400?random=4" },

        // Clothing
        { name: "Cotton T-Shirt", price: "19.99", stock: 200, categoryId: getCategoryId("Clothing"), brand: "ComfortWear", vendorId: vendor2Id, imageUrl: "https://picsum.photos/400/400?random=5" },
        { name: "Denim Jeans", price: "79.99", stock: 80, categoryId: getCategoryId("Clothing"), brand: "StyleFit", vendorId: vendor2Id, imageUrl: "https://picsum.photos/400/400?random=6" },
        { name: "Winter Jacket", price: "149.99", stock: 40, categoryId: getCategoryId("Clothing"), brand: "WarmCo", vendorId: vendor1Id, imageUrl: "https://picsum.photos/400/400?random=7" },

        // Books
        { name: "JavaScript Guide", price: "39.99", stock: 75, categoryId: getCategoryId("Books"), brand: "TechBooks", vendorId: vendor1Id, imageUrl: "https://picsum.photos/400/400?random=8" },
        { name: "React Handbook", price: "49.99", stock: 60, categoryId: getCategoryId("Books"), brand: "DevPress", vendorId: vendor2Id, imageUrl: "https://picsum.photos/400/400?random=9" },
        { name: "Database Design", price: "59.99", stock: 45, categoryId: getCategoryId("Books"), brand: "DataBooks", vendorId: vendor1Id, imageUrl: "https://picsum.photos/400/400?random=10" },

        // Home & Garden
        { name: "Garden Hose 50ft", price: "34.99", stock: 30, categoryId: getCategoryId("Home & Garden"), brand: "GardenPro", vendorId: vendor2Id, imageUrl: "https://picsum.photos/400/400?random=11" },
        { name: "Indoor Plant Set", price: "24.99", stock: 90, categoryId: getCategoryId("Home & Garden"), brand: "GreenLife", vendorId: vendor1Id, imageUrl: "https://picsum.photos/400/400?random=12" },

        // Sports
        { name: "Yoga Mat", price: "29.99", stock: 120, categoryId: getCategoryId("Sports"), brand: "FitLife", vendorId: vendor2Id, imageUrl: "https://picsum.photos/400/400?random=13" },
        { name: "Dumbbell Set 20lbs", price: "89.99", stock: 35, categoryId: getCategoryId("Sports"), brand: "StrengthPro", vendorId: vendor1Id, imageUrl: "https://picsum.photos/400/400?random=14" },

        // Beauty
        { name: "Face Moisturizer", price: "19.99", stock: 150, categoryId: getCategoryId("Beauty"), brand: "GlowBeauty", vendorId: vendor2Id, imageUrl: "https://picsum.photos/400/400?random=15" },
        { name: "Hair Shampoo 500ml", price: "14.99", stock: 200, categoryId: getCategoryId("Beauty"), brand: "PureCare", vendorId: vendor1Id, imageUrl: "https://picsum.photos/400/400?random=16" },

        // Toys
        { name: "Building Blocks Set", price: "39.99", stock: 85, categoryId: getCategoryId("Toys"), brand: "PlayTime", vendorId: vendor2Id, imageUrl: "https://picsum.photos/400/400?random=17" },
        { name: "Puzzle 500 Pieces", price: "24.99", stock: 95, categoryId: getCategoryId("Toys"), brand: "BrainGames", vendorId: vendor1Id, imageUrl: "https://picsum.photos/400/400?random=18" },

        // Automotive
        { name: "Car Air Freshener", price: "9.99", stock: 300, categoryId: getCategoryId("Automotive"), brand: "DriveFresh", vendorId: vendor1Id, imageUrl: "https://picsum.photos/400/400?random=19" },
        { name: "Tire Pressure Gauge", price: "12.99", stock: 180, categoryId: getCategoryId("Automotive"), brand: "AutoTools", vendorId: vendor2Id, imageUrl: "https://picsum.photos/400/400?random=20" },

        // More products for pagination testing
        { name: "LED Desk Lamp", price: "45.99", stock: 65, categoryId: getCategoryId("Home & Garden"), brand: "LightPro", vendorId: vendor1Id, imageUrl: "https://picsum.photos/400/400?random=21" },
        { name: "Coffee Mug Set", price: "16.99", stock: 140, categoryId: getCategoryId("Home & Garden"), brand: "HomeStyle", vendorId: vendor2Id, imageUrl: "https://picsum.photos/400/400?random=22" },
        { name: "Wireless Charger", price: "25.99", stock: 110, categoryId: getCategoryId("Electronics"), brand: "TechSound", vendorId: vendor1Id, imageUrl: "https://picsum.photos/400/400?random=23" },
        { name: "Notebook Set", price: "12.99", stock: 250, categoryId: getCategoryId("Books"), brand: "WriteWell", vendorId: vendor2Id, imageUrl: "https://picsum.photos/400/400?random=24" },
      ];

      // Filter out products with undefined categoryId
      const validProducts = productData.filter(product => product.categoryId !== undefined);

      let insertedProducts: any[] = [];
      if (validProducts.length > 0) {
        insertedProducts = await db.insert(products).values(validProducts).returning();
        console.log(`✅ Created ${insertedProducts.length} products`);
      } else {
        console.log("❌ No valid products to create");
      }

      // 4. Add product images for some products
      if (insertedProducts && insertedProducts.length > 0) {
        console.log("📸 Adding product images...");

        const productImagesData = [
          // Images for Wireless Bluetooth Headphones
          { productId: insertedProducts[0].id, imageUrl: "/placeholder.svg", altText: "Wireless Bluetooth Headphones - Front View", sortOrder: 1 },
          { productId: insertedProducts[0].id, imageUrl: "https://picsum.photos/400/400?random=101", altText: "Wireless Bluetooth Headphones - Side View", sortOrder: 2 },
          { productId: insertedProducts[0].id, imageUrl: "https://picsum.photos/400/400?random=102", altText: "Wireless Bluetooth Headphones - Back View", sortOrder: 3 },
          { productId: insertedProducts[0].id, imageUrl: "https://picsum.photos/400/400?random=103", altText: "Wireless Bluetooth Headphones - Package", sortOrder: 4 },
          { productId: insertedProducts[0].id, imageUrl: "https://picsum.photos/400/400?random=104", altText: "Wireless Bluetooth Headphones - In Use", sortOrder: 5 },

          // Images for Smartphone 128GB
          { productId: insertedProducts[1].id, imageUrl: "/placeholder.svg", altText: "Smartphone 128GB - Front View", sortOrder: 1 },
          { productId: insertedProducts[1].id, imageUrl: "https://picsum.photos/400/400?random=201", altText: "Smartphone 128GB - Back View", sortOrder: 2 },
          { productId: insertedProducts[1].id, imageUrl: "https://picsum.photos/400/400?random=202", altText: "Smartphone 128GB - Side Profile", sortOrder: 3 },
          { productId: insertedProducts[1].id, imageUrl: "https://picsum.photos/400/400?random=203", altText: "Smartphone 128GB - Screen", sortOrder: 4 },
          { productId: insertedProducts[1].id, imageUrl: "https://picsum.photos/400/400?random=204", altText: "Smartphone 128GB - Accessories", sortOrder: 5 },

          // Images for Laptop 16GB RAM
          { productId: insertedProducts[2].id, imageUrl: "https://picsum.photos/400/400?random=301", altText: "Laptop 16GB RAM - Open View", sortOrder: 1 },
          { productId: insertedProducts[2].id, imageUrl: "https://picsum.photos/400/400?random=302", altText: "Laptop 16GB RAM - Keyboard", sortOrder: 2 },
          { productId: insertedProducts[2].id, imageUrl: "https://picsum.photos/400/400?random=303", altText: "Laptop 16GB RAM - Ports", sortOrder: 3 },
          { productId: insertedProducts[2].id, imageUrl: "https://picsum.photos/400/400?random=304", altText: "Laptop 16GB RAM - Closed", sortOrder: 4 },
          { productId: insertedProducts[2].id, imageUrl: "https://picsum.photos/400/400?random=305", altText: "Laptop 16GB RAM - Package", sortOrder: 5 },
        ];

        const insertedProductImages = await db.insert(productImages).values(productImagesData).returning();
        console.log(`✅ Created ${insertedProductImages.length} product images`);
      }

      console.log("\n🎉 Database seeding completed successfully!");
      console.log("\n📋 Sample Data Summary:");
      console.log(`   Categories: ${insertedCategories.length}`);
      console.log(`   Users: ${insertedUsers.length} (${vendors.length} vendors, ${insertedUsers.filter(u => u.role === 'customer').length} customers, ${insertedUsers.filter(u => u.role === 'admin').length} admins)`);
      console.log(`   Products: ${insertedProducts.length}`);
      console.log(`   Product Images: ${insertedProducts ? insertedProducts.length * 5 : 0}`);

      console.log("\n🔑 Test Accounts:");
      console.log("   Vendor: john@vendor.com / password123");
      console.log("   Customer: mike@customer.com / password123");
      console.log("   Admin: admin@store.com / password123");

    } else {
      console.log("📦 Using existing products");
    }

  } catch (error) {
    console.error("❌ Error seeding database:", error);
  } finally {
    await pool.end();
  }
}

// Run the seeding
seedDatabase();