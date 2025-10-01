// delete-products.js - Delete products from database
import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { eq, desc, sql } from "drizzle-orm";
import { products } from "./dist/models/product.js";
import { productImages } from "./dist/models/productImage.js";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const db = drizzle(pool);

// Number of products to delete (most recently created)
const PRODUCTS_TO_DELETE = 10;

async function deleteProducts() {
  console.log(`🗑️  Starting to delete ${PRODUCTS_TO_DELETE} most recently created products...\n`);

  try {
    // Get the most recently created products
    const productsToDelete = await db
      .select({
        id: products.id,
        name: products.name,
        createdAt: products.createdAt,
      })
      .from(products)
      .orderBy(desc(products.createdAt))
      .limit(PRODUCTS_TO_DELETE);

    if (productsToDelete.length === 0) {
      console.log('❌ No products found to delete');
      return;
    }

    console.log('📋 Products to be deleted:');
    productsToDelete.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name}`);
      console.log(`   ID: ${product.id}`);
      console.log(`   Created: ${new Date(product.createdAt).toLocaleString()}`);
      console.log('');
    });

    // Confirm deletion
    console.log(`⚠️  This will permanently delete ${productsToDelete.length} products and their associated images.`);
    console.log('🔄 Starting deletion process...\n');

    let deletedCount = 0;
    let imageDeletedCount = 0;

    for (const product of productsToDelete) {
      try {
        // First delete associated product images
        const imagesDeleted = await db
          .delete(productImages)
          .where(eq(productImages.productId, product.id));

        if (imagesDeleted.rowCount > 0) {
          imageDeletedCount += imagesDeleted.rowCount;
          console.log(`🖼️  Deleted ${imagesDeleted.rowCount} images for "${product.name}"`);
        }

        // Then delete the product
        const productDeleted = await db
          .delete(products)
          .where(eq(products.id, product.id));

        if (productDeleted.rowCount > 0) {
          deletedCount++;
          console.log(`✅ Deleted product: "${product.name}"`);
        }

      } catch (error) {
        console.error(`❌ Error deleting product "${product.name}":`, error.message);
      }
    }

    console.log('\n📊 Deletion Summary:');
    console.log(`   Products deleted: ${deletedCount}`);
    console.log(`   Images deleted: ${imageDeletedCount}`);
    console.log(`   Total items removed: ${deletedCount + imageDeletedCount}`);

    // Show remaining products count
    const remainingCount = await db
      .select({ count: sql`count(*)` })
      .from(products);

    console.log(`   Products remaining: ${remainingCount[0]?.count || 0}`);

  } catch (error) {
    console.error('❌ Error during deletion process:', error.message);
  } finally {
    await pool.end();
  }
}

// Execute the function
deleteProducts();