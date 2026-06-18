/**
 * CSV Product Importer for ShopSmart AI
 * 
 * USAGE:
 *   1. Download dataset from Kaggle (see links below)
 *   2. Place the CSV file in this folder as "products.csv"
 *   3. Run: node importCSV.js
 * 
 * RECOMMENDED DATASETS (Kaggle):
 *   - Flipkart Products:  https://www.kaggle.com/datasets/PromptCloudHQ/flipkart-products
 *   - Amazon Products:    https://www.kaggle.com/datasets/karkavelrajaj/amazon-sales-dataset
 *   - E-Commerce Dataset: https://www.kaggle.com/datasets/lakshmi25npathi/online-retail-dataset
 * 
 * The script auto-maps CSV columns to our Product schema.
 * Edit the COLUMN_MAP below to match your CSV headers.
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Product = require('../models/Product');
const Category = require('../models/Category');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ecommerce';
const CSV_FILE = path.join(__dirname, 'products.csv');

// ═══════════════════════════════════════════════════════════════
// COLUMN MAPPING — Edit these to match YOUR CSV column headers
// Set to null if the column doesn't exist in your CSV
// ═══════════════════════════════════════════════════════════════
const COLUMN_MAP = {
  name:        'product_name',        // Product title/name
  description: 'about_product',       // Product description
  price:       'discounted_price',    // Selling price
  mrp:         'actual_price',        // Original MRP
  discount:    'discount_percentage', // Discount %
  category:    'category',            // Category name
  brand:       'brand',               // Brand name (null if not present)
  image:       'img_link',            // Image URL
  rating:      'rating',              // Average rating
  numReviews:  'rating_count',        // Number of reviews
};

// ═══════════════════════════════════════════════════════════════

function parseCSV(text) {
  const lines = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '"') {
      if (inQuotes && text[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      lines.push(current.trim());
      current = '';
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (current.trim() || lines.length > 0) {
        lines.push(current.trim());
        current = '';
      }
      if (lines.length > 0) {
        // Yield the row
        const row = [...lines];
        lines.length = 0;
        // We'll collect rows below
        if (!parseCSV._rows) parseCSV._rows = [];
        parseCSV._rows.push(row);
      }
    } else {
      current += char;
    }
  }
  // Last field
  if (current.trim() || lines.length > 0) {
    lines.push(current.trim());
    if (!parseCSV._rows) parseCSV._rows = [];
    parseCSV._rows.push([...lines]);
  }

  return parseCSV._rows || [];
}

function parseCSVFile(filePath) {
  const text = fs.readFileSync(filePath, 'utf-8');
  parseCSV._rows = [];

  const rows = parseCSV(text);
  if (rows.length < 2) throw new Error('CSV has less than 2 rows');

  const headers = rows[0].map(h => h.replace(/^"|"$/g, '').trim());
  const data = [];

  for (let i = 1; i < rows.length; i++) {
    const obj = {};
    rows[i].forEach((val, idx) => {
      if (headers[idx]) {
        obj[headers[idx]] = val.replace(/^"|"$/g, '').trim();
      }
    });
    data.push(obj);
  }

  return { headers, data };
}

function cleanPrice(str) {
  if (!str) return 0;
  // Remove currency symbols, commas, and non-numeric characters except dots
  const cleaned = str.replace(/[₹$€£,\s]/g, '').trim();
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : Math.round(num);
}

function cleanDiscount(str) {
  if (!str) return 0;
  const num = parseFloat(str.replace(/[^0-9.]/g, ''));
  return isNaN(num) ? 0 : Math.min(Math.round(num), 99);
}

function cleanRating(str) {
  if (!str) return 0;
  const num = parseFloat(str);
  return isNaN(num) ? 0 : Math.min(Math.max(num, 0), 5);
}

function cleanReviewCount(str) {
  if (!str) return 0;
  const num = parseInt(str.replace(/[^0-9]/g, ''), 10);
  return isNaN(num) ? 0 : num;
}

async function importProducts() {
  try {
    console.log('\n═══════════════════════════════════════════════');
    console.log('  📦  ShopSmart AI — CSV Product Importer');
    console.log('═══════════════════════════════════════════════\n');

    // Check CSV exists
    if (!fs.existsSync(CSV_FILE)) {
      console.error(`❌ CSV file not found at: ${CSV_FILE}`);
      console.log('\nPlease download a dataset and save it as "products.csv" in the seed/ folder.');
      console.log('\nRecommended datasets:');
      console.log('  1. Amazon Sales: https://www.kaggle.com/datasets/karkavelrajaj/amazon-sales-dataset');
      console.log('  2. Flipkart:     https://www.kaggle.com/datasets/PromptCloudHQ/flipkart-products');
      process.exit(1);
    }

    // Connect to DB
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected!\n');

    // Parse CSV
    console.log(`📄 Reading CSV: ${CSV_FILE}`);
    const { headers, data } = parseCSVFile(CSV_FILE);
    console.log(`   Found ${data.length} rows`);
    console.log(`   Columns: ${headers.join(', ')}\n`);

    // Validate column mapping
    console.log('🔍 Column Mapping:');
    Object.entries(COLUMN_MAP).forEach(([field, csvCol]) => {
      if (!csvCol) {
        console.log(`   ${field}: ⏭️  skipped (not mapped)`);
      } else if (headers.includes(csvCol)) {
        console.log(`   ${field}: ✅ "${csvCol}"`);
      } else {
        console.log(`   ${field}: ❌ "${csvCol}" NOT FOUND in CSV!`);
      }
    });
    console.log('');

    // Get or create categories
    const categoryCache = {};
    const existingCategories = await Category.find({});
    existingCategories.forEach(c => {
      categoryCache[c.name.toLowerCase()] = c._id;
      categoryCache[c.slug] = c._id;
    });

    let imported = 0;
    let skipped = 0;
    let errors = 0;

    for (const row of data) {
      try {
        const name = row[COLUMN_MAP.name];
        if (!name || name.length < 3) { skipped++; continue; }

        // Check duplicate
        const exists = await Product.findOne({ name: name.substring(0, 100) });
        if (exists) { skipped++; continue; }

        const price = cleanPrice(row[COLUMN_MAP.price]);
        const mrp = cleanPrice(row[COLUMN_MAP.mrp]) || price;
        if (price <= 0) { skipped++; continue; }

        // Resolve category
        let categoryName = row[COLUMN_MAP.category] || 'Electronics';
        // Take first part if it's a path like "Electronics|Mobiles|Smartphones"
        categoryName = categoryName.split('|')[0].split('>')[0].split('/')[0].trim();

        let categoryId = categoryCache[categoryName.toLowerCase()];
        if (!categoryId) {
          // Try partial match
          const match = Object.keys(categoryCache).find(k =>
            k.includes(categoryName.toLowerCase()) || categoryName.toLowerCase().includes(k)
          );
          if (match) {
            categoryId = categoryCache[match];
          } else {
            // Create new category
            const slug = categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
            const newCat = await Category.create({
              name: categoryName,
              slug: slug,
              description: `${categoryName} products`,
              image: `https://picsum.photos/seed/${slug}/400/400`,
            });
            categoryId = newCat._id;
            categoryCache[categoryName.toLowerCase()] = categoryId;
            categoryCache[slug] = categoryId;
            console.log(`   📁 New category created: ${categoryName}`);
          }
        }

        // Build image array
        let images = [];
        const imgField = row[COLUMN_MAP.image];
        if (imgField) {
          images = imgField.split('|').map(u => u.trim()).filter(u => u.startsWith('http'));
        }
        if (images.length === 0) {
          images = [`https://picsum.photos/seed/${imported + 1}/400/400`];
        }

        // Build product
        const product = {
          name: name.substring(0, 200),
          description: (row[COLUMN_MAP.description] || name).substring(0, 2000),
          price,
          mrp,
          discount: COLUMN_MAP.discount ? cleanDiscount(row[COLUMN_MAP.discount]) : (mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0),
          images,
          category: categoryId,
          brand: COLUMN_MAP.brand ? (row[COLUMN_MAP.brand] || '').substring(0, 50) : '',
          stock: Math.floor(Math.random() * 100) + 10,
          sold: Math.floor(Math.random() * 50),
          avgRating: COLUMN_MAP.rating ? cleanRating(row[COLUMN_MAP.rating]) : (3.5 + Math.random() * 1.5),
          numReviews: COLUMN_MAP.numReviews ? cleanReviewCount(row[COLUMN_MAP.numReviews]) : Math.floor(Math.random() * 100),
          tags: name.toLowerCase().split(/\s+/).slice(0, 5),
          isFeatured: Math.random() > 0.8,
          isNewArrival: Math.random() > 0.7,
          isBestSeller: Math.random() > 0.75,
        };

        await Product.create(product);
        imported++;

        if (imported % 50 === 0) {
          console.log(`   ✅ ${imported} products imported...`);
        }
      } catch (err) {
        errors++;
        if (errors <= 5) console.log(`   ⚠️  Error: ${err.message}`);
      }
    }

    console.log('\n═══════════════════════════════════════════════');
    console.log(`  ✅ Imported: ${imported} products`);
    console.log(`  ⏭️  Skipped:  ${skipped} (duplicates/invalid)`);
    console.log(`  ❌ Errors:   ${errors}`);
    console.log('═══════════════════════════════════════════════\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Fatal error:', err);
    process.exit(1);
  }
}

importProducts();
