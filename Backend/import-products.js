// import-products.js
import fs from 'fs';
import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { products } from "./src/models/product.ts";
import { productImages } from "./src/models/productImage.ts";
import { categories } from "./src/models/category.ts";
import { users } from "./src/models/user.ts";
import { eq } from "drizzle-orm";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const db = drizzle(pool);

async function importProducts() {
  try {
    console.log('🚀 Starting product import...');
    
    // Read transformed data
    const data = JSON.parse(fs.readFileSync('products-transformed.json', 'utf8'));
    
    // Get existing vendors
    const existingVendors = await db.select().from(users).where(eq(users.role, 'vendor'));
    
    if (existingVendors.length === 0) {
      throw new Error('No vendors found. Please run the seed script first.');
    }
    
    const vendorId = existingVendors[0].id;
    console.log(`👤 Using vendor: ${existingVendors[0].name}`);
    
    let importedCount = 0;
    
    for (const productData of data.products.slice(0, 10)) { // Import first 10 products
      console.log(`📦 Importing: ${productData.name}`);
      
      // Find or create category
      const existingCategories = await db.select().from(categories);
      let category = existingCategories.find(c => c.name === productData.categoryName);
      
      if (!category) {
        const newCategory = await db.insert(categories)
          .values({ name: productData.categoryName })
          .returning();
        category = newCategory[0];
        console.log(`   📁 Created category: ${category.name}`);
      }
      
      // Create product
      const newProduct = await db.insert(products).values({
        name: productData.name,
        price: productData.price.toString(),
        stock: productData.stock,
        categoryId: category.id,
        brand: productData.brand,
        vendorId: vendorId,
        imageUrl: productData.mainImage
      }).returning();
      
      const productId = newProduct[0].id;
      
      // Create product images
      if (productData.images && productData.images.length > 0) {
        const imageData = productData.images.map(img => ({
          productId: productId,
          imageUrl: img.url,
          altText: img.altText,
          sortOrder: img.sortOrder
        }));
        
        await db.insert(productImages).values(imageData);
        console.log(`   🖼️  Added ${imageData.length} images`);
      }
      
      importedCount++;
    }
    
    console.log(`\n🎉 Successfully imported ${importedCount} products!`);
    console.log('🔍 Check your frontend at http://localhost:8080 to see the products');
    
  } catch (error) {
    console.error('❌ Import failed:', error.message);
  } finally {
    await pool.end();
  }
}

importProducts();
