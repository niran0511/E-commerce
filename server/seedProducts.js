const mongoose = require('mongoose');
const dotenv = require('dotenv');
const axios = require('axios');
const Product = require('./models/Product');
const Category = require('./models/Category');

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected for Seeding...');
  } catch (error) {
    console.error('MongoDB Connection Error: ', error);
    process.exit(1);
  }
};

const slugify = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const seedData = async () => {
  try {
    console.log('Fetching products from DummyJSON...');
    const { data: dummyData } = await axios.get('https://dummyjson.com/products?limit=0');
    
    console.log('Fetching products from FakeStoreAPI...');
    const { data: fakeStoreData } = await axios.get('https://fakestoreapi.com/products');

    console.log(`Fetched ${dummyData.products.length + fakeStoreData.length} total products. Mapping to DB...`);

    // Extract unique categories
    const categoryNames = new Set([
      ...dummyData.products.map(p => p.category),
      ...fakeStoreData.map(p => p.category)
    ]);

    const categoryMap = {};

    console.log('Creating categories...');
    for (const catName of categoryNames) {
      // Check if exists
      const slug = slugify(catName);
      let category = await Category.findOne({ slug });
      
      if (!category) {
        category = await Category.create({
          name: catName.charAt(0).toUpperCase() + catName.slice(1).replace('-', ' '),
          slug,
          description: `${catName} products`,
        });
      }
      categoryMap[catName] = category._id;
    }

    // Map DummyJSON products
    const mappedDummyProducts = dummyData.products.map(p => {
      // Convert price from USD to INR (approx x80)
      const priceINR = Math.round(p.price * 80);
      const discount = Math.round(p.discountPercentage || 0);
      const mrpINR = Math.round(priceINR / (1 - (discount / 100)));

      return {
        name: p.title,
        description: p.description,
        price: priceINR,
        mrp: mrpINR,
        discount,
        brand: p.brand || 'Generic',
        category: categoryMap[p.category],
        images: p.images && p.images.length > 0 ? p.images : [p.thumbnail],
        stock: p.stock || 50,
        sold: Math.floor(Math.random() * 500),
        avgRating: p.rating || 4.0,
        numReviews: Math.floor(Math.random() * 200) + 10,
        isFeatured: p.rating > 4.5,
        isBestSeller: p.rating > 4.7 && p.stock > 10,
      };
    });

    // Map FakeStore products
    const mappedFakeStoreProducts = fakeStoreData.map(p => {
      const priceINR = Math.round(p.price * 80);
      const discount = Math.floor(Math.random() * 30) + 10; // Random 10-40% discount
      const mrpINR = Math.round(priceINR / (1 - (discount / 100)));

      return {
        name: p.title,
        description: p.description,
        price: priceINR,
        mrp: mrpINR,
        discount,
        brand: 'Generic',
        category: categoryMap[p.category],
        images: [p.image],
        stock: Math.floor(Math.random() * 100) + 10,
        sold: Math.floor(Math.random() * 300),
        avgRating: p.rating?.rate || 4.0,
        numReviews: p.rating?.count || Math.floor(Math.random() * 100),
        isFeatured: Math.random() > 0.8,
        isBestSeller: Math.random() > 0.9,
      };
    });

    const allProducts = [...mappedDummyProducts, ...mappedFakeStoreProducts];

    // Delete existing dummy products if needed? Let's just insert them.
    // To prevent duplicate massive insertion, we might want to clear products first? 
    // It's safer to just insert.
    console.log(`Inserting ${allProducts.length} products into the database...`);
    
    await Product.insertMany(allProducts);

    console.log('✅ Data imported successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during seeding: ', error);
    process.exit(1);
  }
};

connectDB().then(seedData);
