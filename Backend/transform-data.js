// transform-data.js
import fs from 'fs';

try {
  console.log('🔄 Transforming product data...');
  
  // Read the raw data from DummyJSON API
  const rawData = JSON.parse(fs.readFileSync('products-raw.json', 'utf8'));
  
  // Transform to your database format
  const transformedData = {
    products: rawData.products.map(product => ({
      name: product.title,
      price: product.price,
      stock: product.stock,
      categoryName: product.category,
      brand: product.brand,
      description: product.description,
      mainImage: product.thumbnail,
      images: [
        {
          url: product.thumbnail,
          altText: `${product.title} - Main View`,
          sortOrder: 1
        },
        ...product.images.map((img, index) => ({
          url: img,
          altText: `${product.title} - View ${index + 2}`,
          sortOrder: index + 2
        }))
      ]
    }))
  };
  
  // Save transformed data
  fs.writeFileSync('products-transformed.json', JSON.stringify(transformedData, null, 2));
  
  console.log('✅ Data transformation completed!');
  console.log(`📊 Transformed ${transformedData.products.length} products`);
  
} catch (error) {
  console.error('❌ Error transforming data:', error.message);
}
