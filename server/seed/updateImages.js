require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Product = require('../models/Product');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ecommerce';

// Beautiful Unsplash image URLs by product category keywords
const IMAGE_MAP = [
  // Electronics - phones
  { keywords: ['samsung', 'galaxy', 's24'], url: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=500&q=80' },
  { keywords: ['iphone', '15', 'pro'], url: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500&q=80' },
  { keywords: ['oneplus'], url: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=500&q=80' },
  // Laptops
  { keywords: ['macbook'], url: 'https://images.unsplash.com/photo-1611186871525-a2f23c04b9be?w=500&q=80' },
  { keywords: ['hp', 'pavilion'], url: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&q=80' },
  { keywords: ['dell'], url: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=500&q=80' },
  { keywords: ['lenovo'], url: 'https://images.unsplash.com/photo-1593642634367-d91a135587b5?w=500&q=80' },
  // Audio
  { keywords: ['sony', 'headphone', 'wh'], url: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=500&q=80' },
  { keywords: ['boat', 'airpod', 'earbud', 'tws', 'airdopes'], url: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500&q=80' },
  { keywords: ['jbl'], url: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500&q=80' },
  // TV
  { keywords: ['tv', 'television', 'crystal', '4k', 'smart tv'], url: 'https://images.unsplash.com/photo-1593359677879-a4bb92f4834c?w=500&q=80' },
  // Camera
  { keywords: ['camera', 'canon', 'nikon', 'dslr'], url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500&q=80' },
  // Watch/Smartwatch
  { keywords: ['watch', 'smartwatch', 'apple watch', 'noise', 'fitbit'], url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80' },
  // Fashion - Men's clothing
  { keywords: ['shirt', 'polo', 'men', 't-shirt', 'tshirt'], url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&q=80' },
  { keywords: ['jeans', 'denim', 'trouser', 'pant'], url: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=500&q=80' },
  { keywords: ['jacket', 'coat', 'hoodie', 'sweatshirt'], url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&q=80' },
  // Fashion - Women's
  { keywords: ['dress', 'kurti', 'saree', 'women', 'kurta'], url: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=500&q=80' },
  // Shoes
  { keywords: ['shoe', 'sneaker', 'nike', 'adidas', 'running', 'sport shoe'], url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80' },
  // Kitchen
  { keywords: ['mixer', 'grinder', 'blender', 'juicer'], url: 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=500&q=80' },
  { keywords: ['pressure cooker', 'cooker', 'instant pot'], url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500&q=80' },
  { keywords: ['coffee', 'maker', 'espresso'], url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=500&q=80' },
  { keywords: ['air fryer', 'oven', 'microwave'], url: 'https://images.unsplash.com/photo-1585515320310-259814833e62?w=500&q=80' },
  // Books
  { keywords: ['book', 'novel', 'fiction', 'non-fiction'], url: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=500&q=80' },
  // Sports & Fitness
  { keywords: ['yoga', 'mat', 'exercise', 'gym'], url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&q=80' },
  { keywords: ['dumbbell', 'weight', 'kettlebell'], url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&q=80' },
  { keywords: ['cycle', 'bicycle', 'treadmill'], url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&q=80' },
  // Beauty
  { keywords: ['skincare', 'serum', 'moisturizer', 'face wash', 'cream'], url: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=500&q=80' },
  { keywords: ['shampoo', 'hair', 'conditioner'], url: 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=500&q=80' },
  { keywords: ['perfume', 'fragrance', 'cologne'], url: 'https://images.unsplash.com/photo-1541643600914-78b084683702?w=500&q=80' },
  // Toys
  { keywords: ['toy', 'lego', 'puzzle', 'game', 'board game'], url: 'https://images.unsplash.com/photo-1558877385-81a1c7e67d72?w=500&q=80' },
  // Groceries / Food
  { keywords: ['grocery', 'food', 'snack', 'dry fruit', 'nut'], url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&q=80' },
];

// Fallback seeds for variety
const FALLBACK_SEEDS = [
  'product1', 'product2', 'product3', 'product4', 'product5',
  'item1', 'item2', 'item3', 'item4', 'item5',
  'shop1', 'shop2', 'shop3', 'shop4', 'shop5',
];

function getBestImage(name, idx) {
  const lower = name.toLowerCase();
  for (const { keywords, url } of IMAGE_MAP) {
    if (keywords.some(k => lower.includes(k))) return url;
  }
  // fallback to varied picsum
  const seed = FALLBACK_SEEDS[idx % FALLBACK_SEEDS.length] + Math.floor(idx / FALLBACK_SEEDS.length);
  return `https://picsum.photos/seed/${seed}/400/400`;
}

async function updateImages() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  const products = await Product.find({});
  console.log(`Found ${products.length} products to update`);

  let updated = 0;
  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    const needsUpdate = !p.images || p.images.length === 0 ||
      p.images.some(img => img.includes('placeholder') || img.includes('via.placeholder') || img.includes('placehold.co'));

    if (needsUpdate) {
      const newImg = getBestImage(p.name, i);
      await Product.findByIdAndUpdate(p._id, {
        images: [newImg, getBestImage(p.name + '_alt', i + 50)],
      });
      updated++;
      console.log(`✓ Updated: ${p.name} → ${newImg}`);
    }
  }
  console.log(`\n✅ Updated ${updated} products with real images`);
  await mongoose.disconnect();
}

updateImages().catch(e => { console.error(e); process.exit(1); });
