import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
// --- FIX: Corrected the import paths to match your exact model filenames ---
import { users } from "./models/user.js";
import { categories } from "./models/category.js";
import { products } from "./models/product.js";
import { productImages } from "./models/productImage.js";
import bcrypt from "bcrypt";

// --- Main Seeding Function ---
async function seedDatabase() {
  console.log("🌱 Starting database seeding for a professional demo...");

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }, // Required for Railway connections
  });
  const db = drizzle(pool);

  try {
    // Clear existing data for a clean slate
    console.log("🧹 Clearing existing data...");
    await db.delete(productImages);
    await db.delete(products);
    await db.delete(categories);
    await db.delete(users);

    // 1. Create a Sample Vendor
    console.log("👥 Creating a sample vendor...");
    const hashedPassword = await bcrypt.hash("vendorpass123", 10);
    const [vendor] = await db
      .insert(users)
      .values({
        name: "ShopHub Official Store",
        email: "vendor@shophub.com",
        password: hashedPassword,
        role: "vendor" as const,
      })
      .returning();

    if (!vendor) {
      throw new Error("Failed to create the sample vendor. Aborting seed.");
    }
    
    console.log(`✅ Created vendor: ${vendor.name}`);

    // 2. Create Categories
    console.log("📂 Creating categories...");
    const insertedCategories = await db
      .insert(categories)
      .values([
        { name: "Electronics" },
        { name: "Books" },
        { name: "Apparel" },
        { name: "Home & Kitchen" },
      ])
      .returning();
    console.log(`✅ Created ${insertedCategories.length} categories.`);

    const getCategoryId = (name: string) =>
      insertedCategories.find((c) => c.name === name)?.id;

    // 3. Create 10 Products with Static, Professional Images
    console.log("📦 Creating 10 sample products...");
    const productData = [
      { name: "Air Pro Wireless Headphones", price: "249.99", stock: 50, categoryId: getCategoryId("Electronics"), brand: "AudioPhile", vendorId: vendor.id, imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=2070" },
      { name: "4K Quantum Dot Smart TV", price: "899.00", stock: 20, categoryId: getCategoryId("Electronics"), brand: "VisionSync", vendorId: vendor.id, imageUrl: "https://images.unsplash.com/photo-1593784944039-b0f3404c118c?q=80&w=2070" },
      { name: "Mechanical RGB Keyboard", price: "129.99", stock: 75, categoryId: getCategoryId("Electronics"), brand: "GamerGear", vendorId: vendor.id, imageUrl: "https://images.unsplash.com/photo-1618384887924-2c8ab63a68aa?q=80&w=2070" },
      { name: "The Pragmatic Programmer", price: "45.50", stock: 100, categoryId: getCategoryId("Books"), brand: "Tech Reads", vendorId: vendor.id, imageUrl: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=1887" },
      { name: "Sapiens: A Brief History of Humankind", price: "24.99", stock: 150, categoryId: getCategoryId("Books"), brand: "History Press", vendorId: vendor.id, imageUrl: "https://images.unsplash.com/photo-1589998059171-988d887df646?q=80&w=2076" },
      { name: "Classic Denim Jacket", price: "89.99", stock: 80, categoryId: getCategoryId("Apparel"), brand: "Urban Threads", vendorId: vendor.id, imageUrl: "https://images.unsplash.com/photo-1604176354204-926873782855?q=80&w=1887" },
      { name: "Men's Leather Oxford Shoes", price: "150.00", stock: 40, categoryId: getCategoryId("Apparel"), brand: "Gentleman's Fit", vendorId: vendor.id, imageUrl: "https://images.unsplash.com/photo-1589256463832-4a0e37813c48?q=80&w=1887" },
      { name: "Modern Ceramic Dinnerware Set", price: "120.00", stock: 60, categoryId: getCategoryId("Home & Kitchen"), brand: "Cuisine Art", vendorId: vendor.id, imageUrl: "https://images.unsplash.com/photo-1622979215989-8a35c593a54b?q=80&w=1887" },
      { name: "Professional Espresso Machine", price: "499.00", stock: 30, categoryId: getCategoryId("Home & Kitchen"), brand: "BaristaPro", vendorId: vendor.id, imageUrl: "https://images.unsplash.com/photo-1565557623262-afdc9fa4a2a4?q=80&w=1887" },
      { name: "Scented Soy Wax Candle", price: "22.50", stock: 120, categoryId: getCategoryId("Home & Kitchen"), brand: "Aura Scents", vendorId: vendor.id, imageUrl: "https://images.unsplash.com/photo-1614301934272-1329528d2d0c?q=80&w=1887" },
      { name: "Wireless Gaming Mouse", price: "79.99", stock: 85, categoryId: getCategoryId("Electronics"), brand: "GamePro", vendorId: vendor.id, imageUrl: "https://images.unsplash.com/photo-1527814050087-3793815479db?q=80&w=1922" },
    ];

    const insertedProducts = await db.insert(products).values(productData).returning();
    console.log(`✅ Created ${insertedProducts.length} products.`);

    // 4. Create 2 Professional Images for Each Product
    console.log("📸 Adding product images...");
    const imageDataForProducts = [
        ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=2070", "https://images.unsplash.com/photo-1546435770-a3e426bf4022?q=80&w=2070"], // Headphones
        ["https://images.unsplash.com/photo-1593784944039-b0f3404c118c?q=80&w=2070", "https://images.unsplash.com/photo-1601944177324-f236eace2485?q=80&w=1935"], // TV
        ["https://images.unsplash.com/photo-1618384887924-2c8ab63a68aa?q=80&w=2070", "https://images.unsplash.com/photo-1595225476474-875a3833b355?q=80&w=1974"], // Keyboard
        ["https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=1887", "https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=1887"], // Book 1
        ["https://images.unsplash.com/photo-1589998059171-988d887df646?q=80&w=2076", "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?q=80&w=2070"], // Book 2
        ["https://images.unsplash.com/photo-1604176354204-926873782855?q=80&w=1887", "https://images.unsplash.com/photo-1596489675077-d13d31061f64?q=80&w=1887"], // Jacket
        ["https://images.unsplash.com/photo-1589256463832-4a0e37813c48?q=80&w=1887", "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=2080"], // Shoes
        ["https://images.unsplash.com/photo-1622979215989-8a35c593a54b?q=80&w=1887", "https://images.unsplash.com/photo-1556911220-bff31c812dba?q=80&w=1936"], // Dinnerware
        ["https://images.unsplash.com/photo-1565557623262-afdc9fa4a2a4?q=80&w=1887", "https://images.unsplash.com/photo-1511920183353-30b523f0a6d7?q=80&w=1887"], // Espresso Machine
        ["https://images.unsplash.com/photo-1614301934272-1329528d2d0c?q=80&w=1887", "https://images.unsplash.com/photo-1593531123023-e4a129188a1f?q=80&w=1887"], // Candle
        ["https://images.unsplash.com/photo-1527814050087-3793815479db?q=80&w=1922", "https://images.unsplash.com/photo-1591905523172-55cdc73c4fc3?q=80&w=1915"], // Gaming Mouse
    ];

    const allProductImages: any[] = [];
    insertedProducts.forEach((product, index) => {
        const images = imageDataForProducts[index];
        if (product && images) {
            allProductImages.push({
                productId: product.id,
                imageUrl: images[0],
                altText: `${product.name} - Main View`,
                sortOrder: 1,
            });
            allProductImages.push({
                productId: product.id,
                imageUrl: images[1],
                altText: `${product.name} - Detail View`,
                sortOrder: 2,
            });
        }
    });
    
    const insertedImages = await db.insert(productImages).values(allProductImages).returning();
    console.log(`✅ Created ${insertedImages.length} product images.`);

    console.log("\n🎉 Professional demo database seeding completed successfully!");

  } catch (error) {
    console.error("❌ Error seeding database:", error);
  } finally {
    await pool.end();
    console.log("👋 Database connection closed.");
  }
}

// Run the seeding function
seedDatabase();

