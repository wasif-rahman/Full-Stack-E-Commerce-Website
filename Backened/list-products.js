// list-products.js - List all products in the database
import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { eq } from "drizzle-orm";
import { products } from "./dist/models/product.js";
import { categories } from "./dist/models/category.js";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const db = drizzle(pool);

async function listProducts() {
  console.log('📋 Listing all products in database...\n');

  try {
    // Get products with category information
    const allProducts = await db
      .select({
        id: products.id,
        name: products.name,
        price: products.price,
        stock: products.stock,
        brand: products.brand,
        categoryId: products.categoryId,
        vendorId: products.vendorId,
        createdAt: products.createdAt,
        categoryName: categories.name,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .orderBy(products.createdAt);

    if (allProducts.length === 0) {
      console.log('❌ No products found in database');
      return;
    }

    console.log(`📊 Found ${allProducts.length} products:\n`);

    allProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name}`);
      console.log(`   ID: ${product.id}`);
      console.log(`   Price: $${product.price}`);
      console.log(`   Stock: ${product.stock}`);
      console.log(`   Brand: ${product.brand}`);
      console.log(`   Category: ${product.categoryName || 'N/A'}`);
      console.log(`   Vendor ID: ${product.vendorId}`);
      console.log(`   Created: ${new Date(product.createdAt).toLocaleString()}`);
      console.log('');
    });

    console.log(`📈 Total products: ${allProducts.length}`);

  } catch (error) {
    console.error('❌ Error listing products:', error.message);
  } finally {
    await pool.end();
  }
}

// Execute the function
listProducts();