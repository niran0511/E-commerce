require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Product = require('../models/Product');
const Category = require('../models/Category');

const realisticProducts = [
  {
    name: "Apple MacBook Pro 16-inch M3 Max",
    brand: "Apple",
    price: 349900,
    mrp: 359900,
    discount: 3,
    images: [
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=1000",
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=1000"
    ],
    categoryName: "Electronics",
    description: "Experience mind-blowing performance with the Apple MacBook Pro 16-inch featuring the M3 Max chip. Designed for professionals who demand the utmost power, this laptop handles complex 3D rendering, massive video edits, and advanced AI models with ease. The breathtaking Liquid Retina XDR display offers extreme dynamic range, bringing your content to life with vibrant colors and deep blacks. With up to 22 hours of battery life, a studio-quality three-mic array, and a six-speaker sound system with Spatial Audio, it's the ultimate mobile workstation.",
    stock: 25,
    isFeatured: true,
    isBestSeller: true
  },
  {
    name: "Sony WH-1000XM5 Noise Cancelling Headphones",
    brand: "Sony",
    price: 26990,
    mrp: 34990,
    discount: 23,
    images: [
      "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&q=80&w=1000",
      "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&q=80&w=1000"
    ],
    categoryName: "Electronics",
    description: "Rewrite the rules of listening with the Sony WH-1000XM5. These industry-leading noise-canceling headphones feature two processors controlling eight microphones for unprecedented noise cancellation and exceptional call quality. The newly developed 30mm precision-engineered driver unit delivers magnificent, high-resolution audio. With a lightweight, incredibly comfortable 'noiseless design', up to 30 hours of battery life, and intuitive touch controls, these headphones provide a truly immersive, uninterrupted listening experience.",
    stock: 50,
    isFeatured: true,
    isBestSeller: true
  },
  {
    name: "Samsung Galaxy S24 Ultra 5G",
    brand: "Samsung",
    price: 129999,
    mrp: 134999,
    discount: 4,
    images: [
      "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&q=80&w=1000",
      "https://images.unsplash.com/photo-1598327105666-5b89351cb31b?auto=format&fit=crop&q=80&w=1000"
    ],
    categoryName: "Electronics",
    description: "Welcome to the era of mobile AI. The Samsung Galaxy S24 Ultra unleashes new levels of creativity, productivity, and possibility. Featuring a stunning 6.8-inch Dynamic AMOLED 2X flat display with reduced glare and a durable titanium exterior. Capture jaw-dropping details with the 200MP main camera and the new 50MP 5x optical zoom. The built-in S Pen offers precision writing and drawing. Powered by the Snapdragon 8 Gen 3 for Galaxy, it delivers unparalleled gaming performance and all-day battery life.",
    stock: 40,
    isFeatured: true,
    isBestSeller: false
  },
  {
    name: "Levi's Men's 501 Original Fit Jeans",
    brand: "Levi's",
    price: 2999,
    mrp: 3999,
    discount: 25,
    images: [
      "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&q=80&w=1000",
      "https://images.unsplash.com/photo-1604176354204-9268737828e4?auto=format&fit=crop&q=80&w=1000"
    ],
    categoryName: "Fashion",
    description: "Close your eyes and think of 'jeans'. You just thought of the 501 Original, right? It's the classic straight leg with a button fly—the blueprint for every pair of jeans in existence since Levi Strauss invented them in 1873. Woven with a touch of stretch for all-day comfort and easy movement, these jeans offer a regular fit through the thigh with a classic straight leg. A timeless wardrobe staple that looks great with everything from graphic tees to crisp button-downs.",
    stock: 120,
    isFeatured: false,
    isBestSeller: true
  },
  {
    name: "Nike Air Force 1 '07 Sneakers",
    brand: "Nike",
    price: 8495,
    mrp: 8495,
    discount: 0,
    images: [
      "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&q=80&w=1000",
      "https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&q=80&w=1000"
    ],
    categoryName: "Fashion",
    description: "The radiance lives on in the Nike Air Force 1 '07, the b-ball icon that puts a fresh spin on what you know best. Featuring crisp leather, bold colors, and the perfect amount of flash to make you shine. Originally designed for performance hoops, the Nike Air cushioning adds lightweight, all-day comfort. The low-cut silhouette adds a clean, streamlined look, while the padded collar feels soft and comfortable. It's a legendary shoe that has transitioned seamlessly from the court to the streets.",
    stock: 80,
    isFeatured: true,
    isBestSeller: true
  },
  {
    name: "Minimalist Solid Wood Dining Table",
    brand: "UrbanLadder",
    price: 24500,
    mrp: 32000,
    discount: 23,
    images: [
      "https://images.unsplash.com/photo-1604578762246-41134e37f9cc?auto=format&fit=crop&q=80&w=1000",
      "https://images.unsplash.com/photo-1577140917170-285929fb55b7?auto=format&fit=crop&q=80&w=1000"
    ],
    categoryName: "Home & Kitchen",
    description: "Gather around the heart of your home with this exquisite Minimalist Solid Wood Dining Table. Crafted from premium, sustainably sourced Sheesham wood, this table boasts a rich, natural grain pattern that brings warmth and character to any dining space. Its clean lines and sturdy construction ensure both aesthetic appeal and long-lasting durability. Comfortably seating up to six people, it's perfect for intimate family dinners or entertaining guests. The protective, water-resistant finish makes it easy to clean and maintain.",
    stock: 15,
    isFeatured: true,
    isBestSeller: false
  },
  {
    name: "Dyson V15 Detect Absolute Vacuum",
    brand: "Dyson",
    price: 64900,
    mrp: 74900,
    discount: 13,
    images: [
      "https://images.unsplash.com/photo-1558317374-067fb5f30001?auto=format&fit=crop&q=80&w=1000",
      "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&q=80&w=1000"
    ],
    categoryName: "Home & Kitchen",
    description: "Experience the ultimate in deep cleaning with the Dyson V15 Detect Absolute. This intelligent cordless vacuum reveals invisible dust on hard floors using a precisely angled laser. An acoustic piezo sensor continuously sizes and counts dust particles, automatically increasing suction power when needed. The LCD screen displays scientific proof of a deep clean in real-time. With up to 60 minutes of fade-free power, a hyperdymium motor spinning at up to 125,000rpm, and advanced whole-machine filtration, it ensures a healthier home environment.",
    stock: 20,
    isFeatured: true,
    isBestSeller: true
  },
  {
    name: "Spalding NBA Official Game Basketball",
    brand: "Spalding",
    price: 4500,
    mrp: 5500,
    discount: 18,
    images: [
      "https://images.unsplash.com/photo-1519861531473-9200262188bf?auto=format&fit=crop&q=80&w=1000",
      "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&q=80&w=1000"
    ],
    categoryName: "Sports",
    description: "Take your game to the next level with the Spalding NBA Official Game Basketball. As the official basketball of the NBA for over 30 years, this ball sets the standard for performance and playability. Crafted with a premium full-grain leather cover that turns butter-soft once broken in, it offers unparalleled grip, feel, and durability. The optimized deep channel design provides excellent control for shooting and passing. Whether you're playing a high-stakes indoor game or practicing your free throws, this ball delivers a pro-level experience.",
    stock: 60,
    isFeatured: false,
    isBestSeller: true
  },
  {
    name: "Rolex Submariner Date Watch",
    brand: "Rolex",
    price: 850000,
    mrp: 850000,
    discount: 0,
    images: [
      "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&q=80&w=1000",
      "https://images.unsplash.com/photo-1587836374828-cb4387df3eb7?auto=format&fit=crop&q=80&w=1000"
    ],
    categoryName: "Fashion",
    description: "The Rolex Submariner Date is the quintessential divers' watch, the benchmark in its genre. It features a unidirectional rotatable bezel with a Cerachrom insert and a solid-link Oyster bracelet. The luminescent Chromalight display ensures legibility in dark environments. Waterproof to a depth of 300 meters (1,000 feet), this iconic timepiece combines robust functionality with timeless elegance. Equipped with the self-winding calibre 3235 movement, it offers exceptional precision, a power reserve of approximately 70 hours, and resistance to shocks and magnetic fields.",
    stock: 5,
    isFeatured: true,
    isBestSeller: false
  },
  {
    name: "Yeti Rambler 20 oz Tumbler",
    brand: "Yeti",
    price: 3500,
    mrp: 3500,
    discount: 0,
    images: [
      "https://images.unsplash.com/photo-1614806687038-d698e6ebc245?auto=format&fit=crop&q=80&w=1000",
      "https://images.unsplash.com/photo-1580915159040-5e5da4ec9a26?auto=format&fit=crop&q=80&w=1000"
    ],
    categoryName: "Sports",
    description: "Any tumbler that's coming along for the ride needs to be tough enough to keep up. The YETI Rambler 20 oz. Tumbler is made from durable stainless steel with double-wall vacuum insulation to protect your hot or cold beverage at all costs. While the magnet on the included MagSlider Lid adds an additional barrier of protection for keeping drinks contained and preventing heat or cold from escaping, please note—this magnet component is not leakproof and will not prevent spills. BPA-free, dishwasher safe, and featuring a No Sweat Design.",
    stock: 150,
    isFeatured: false,
    isBestSeller: true
  }
];

async function seedRealisticData() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ecommerce');
    console.log('MongoDB connected...');

    // Clear existing products
    console.log('Clearing existing products...');
    await Product.deleteMany({});
    
    // Get existing categories to map
    const categories = await Category.find();
    const categoryMap = {};
    categories.forEach(c => {
      categoryMap[c.name] = c._id;
    });

    // Create categories if they don't exist
    const uniqueCategoryNames = [...new Set(realisticProducts.map(p => p.categoryName))];
    for (const name of uniqueCategoryNames) {
      if (!categoryMap[name]) {
        const newCat = await Category.create({ name, slug: name.toLowerCase().replace(/ /g, '-') });
        categoryMap[name] = newCat._id;
      }
    }

    console.log('Inserting realistic products...');
    const productsToInsert = realisticProducts.map(p => {
      const { categoryName, ...rest } = p;
      return {
        ...rest,
        category: categoryMap[categoryName],
        avgRating: Math.round((4.0 + Math.random() * 1.0) * 10) / 10,
        numReviews: Math.floor(Math.random() * 100) + 10
      };
    });

    await Product.insertMany(productsToInsert);
    console.log(`Successfully added ${productsToInsert.length} realistic products.`);

  } catch (err) {
    console.error('Seeding error:', err);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB disconnected.');
  }
}

seedRealisticData();
