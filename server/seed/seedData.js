require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Coupon = require('../models/Coupon');
const Review = require('../models/Review');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Wishlist = require('../models/Wishlist');
const Notification = require('../models/Notification');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ecommerce';

async function seed() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected. Seeding database...\n');

    // ── Clear all collections ──────────────────────────────────────────────────
    await Promise.all([
      User.deleteMany({}),
      Product.deleteMany({}),
      Category.deleteMany({}),
      Coupon.deleteMany({}),
      Review.deleteMany({}),
      Order.deleteMany({}),
      Cart.deleteMany({}),
      Wishlist.deleteMany({}),
      Notification.deleteMany({}),
    ]);
    console.log('✓ All collections cleared');

    // ── Create Categories ──────────────────────────────────────────────────────
    const categoriesData = [
      { name: 'Electronics', slug: 'electronics', description: 'Latest gadgets, phones, laptops and electronic accessories', image: 'https://picsum.photos/seed/13/400/400' },
      { name: 'Fashion', slug: 'fashion', description: 'Trendy clothing, footwear and accessories for men and women', image: 'https://picsum.photos/seed/26/400/400' },
      { name: 'Home & Kitchen', slug: 'home-kitchen', description: 'Home appliances, kitchenware and furnishings', image: 'https://picsum.photos/seed/39/400/400' },
      { name: 'Books', slug: 'books', description: 'Bestselling books across fiction, non-fiction and academic', image: 'https://picsum.photos/seed/52/400/400' },
      { name: 'Sports & Fitness', slug: 'sports-fitness', description: 'Sports equipment, gym accessories and fitness gear', image: 'https://picsum.photos/seed/65/400/400' },
      { name: 'Beauty & Personal Care', slug: 'beauty-personal-care', description: 'Skincare, haircare, makeup and grooming products', image: 'https://picsum.photos/seed/78/400/400' },
      { name: 'Toys & Games', slug: 'toys-games', description: 'Toys, board games and educational kits for kids', image: 'https://picsum.photos/seed/91/400/400' },
      { name: 'Groceries', slug: 'groceries', description: 'Daily essentials, snacks, beverages and pantry staples', image: 'https://picsum.photos/seed/104/400/400' },
    ];

    const categories = await Category.insertMany(categoriesData);
    const catMap = {};
    categories.forEach((c) => { catMap[c.slug] = c._id; });
    console.log(`✓ ${categories.length} categories created`);

    // ── Create Users ───────────────────────────────────────────────────────────
    const adminUser = await User.create({
      name: 'Admin',
      email: 'admin@shop.com',
      password: 'admin123',
      role: 'admin',
      phone: '9876543210',
      addresses: [
        { street: '123 Admin Street', city: 'Mumbai', state: 'Maharashtra', zipCode: '400001', country: 'India', isDefault: true },
      ],
    });

    const demoUser = await User.create({
      name: 'John Doe',
      email: 'user@shop.com',
      password: 'user123',
      role: 'user',
      phone: '9876543211',
      addresses: [
        { street: '456 Main Road', city: 'Bangalore', state: 'Karnataka', zipCode: '560001', country: 'India', isDefault: true },
        { street: '789 Work Avenue', city: 'Bangalore', state: 'Karnataka', zipCode: '560002', country: 'India', isDefault: false },
      ],
    });
    console.log('✓ Admin and demo users created');

    // ── Create Products (50+) ──────────────────────────────────────────────────
    const productsData = [
      // ─── Electronics (12) ──────────────────────────────────────────────────
      {
        name: 'Samsung Galaxy S24 Ultra',
        description: 'The Samsung Galaxy S24 Ultra features a stunning 6.8-inch Dynamic AMOLED display, Snapdragon 8 Gen 3 processor, 200MP camera system, and built-in S Pen. Experience the future of smartphones with Galaxy AI features.',
        price: 129999, mrp: 134999, discount: 4,
        images: ['https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400&h=400&fit=crop'],
        category: catMap['electronics'], brand: 'Samsung',
        specifications: new Map([['Display', '6.8 inch Dynamic AMOLED'], ['Processor', 'Snapdragon 8 Gen 3'], ['RAM', '12 GB'], ['Storage', '256 GB'], ['Camera', '200MP + 12MP + 50MP + 10MP'], ['Battery', '5000 mAh']]),
        stock: 50, sold: 120, avgRating: 4.6, numReviews: 85,
        tags: ['smartphone', 'samsung', 'flagship', '5g'],
        isFeatured: true, isBestSeller: true,
      },
      {
        name: 'iPhone 15 Pro Max',
        description: 'iPhone 15 Pro Max with A17 Pro chip, titanium design, 48MP camera system with 5x optical zoom, and Action Button. The most powerful iPhone ever with USB-C connectivity.',
        price: 159900, mrp: 159900, discount: 0,
        images: ['https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400&h=400&fit=crop'],
        category: catMap['electronics'], brand: 'Apple',
        specifications: new Map([['Display', '6.7 inch Super Retina XDR'], ['Processor', 'A17 Pro'], ['RAM', '8 GB'], ['Storage', '256 GB'], ['Camera', '48MP + 12MP + 12MP'], ['Battery', '4441 mAh']]),
        stock: 35, sold: 200, avgRating: 4.8, numReviews: 150,
        tags: ['smartphone', 'apple', 'iphone', 'flagship'],
        isFeatured: true, isBestSeller: true,
      },
      {
        name: 'OnePlus 12',
        description: 'OnePlus 12 with Snapdragon 8 Gen 3, 50MP Hasselblad camera, 100W SUPERVOOC charging, and 5400mAh battery. Flagship performance at a competitive price.',
        price: 64999, mrp: 69999, discount: 7,
        images: ['https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=400&h=400&fit=crop'],
        category: catMap['electronics'], brand: 'OnePlus',
        specifications: new Map([['Display', '6.82 inch LTPO AMOLED'], ['Processor', 'Snapdragon 8 Gen 3'], ['RAM', '12 GB'], ['Storage', '256 GB'], ['Camera', '50MP + 48MP + 64MP'], ['Battery', '5400 mAh']]),
        stock: 80, sold: 95, avgRating: 4.5, numReviews: 60,
        tags: ['smartphone', 'oneplus', 'flagship'],
        isFeatured: true, isNewArrival: true,
      },
      {
        name: 'MacBook Air M3',
        description: 'MacBook Air with M3 chip, 13.6-inch Liquid Retina display, up to 18 hours of battery life, and fanless design. Perfect for students and professionals.',
        price: 114900, mrp: 119900, discount: 4,
        images: ['https://images.unsplash.com/photo-1611186871525-a2f23c04b9be?w=400&h=400&fit=crop'],
        category: catMap['electronics'], brand: 'Apple',
        specifications: new Map([['Display', '13.6 inch Liquid Retina'], ['Processor', 'Apple M3'], ['RAM', '8 GB'], ['Storage', '256 GB SSD'], ['Battery', '18 hours'], ['Weight', '1.24 kg']]),
        stock: 25, sold: 75, avgRating: 4.7, numReviews: 45,
        tags: ['laptop', 'apple', 'macbook', 'ultrabook'],
        isFeatured: true, isBestSeller: true,
      },
      {
        name: 'HP Pavilion 15 Laptop',
        description: 'HP Pavilion 15 with 12th Gen Intel Core i5, 16GB RAM, 512GB SSD, and 15.6-inch FHD display. Ideal for work and entertainment.',
        price: 56990, mrp: 65999, discount: 14,
        images: ['https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=400&fit=crop'],
        category: catMap['electronics'], brand: 'HP',
        specifications: new Map([['Display', '15.6 inch FHD IPS'], ['Processor', 'Intel Core i5-1235U'], ['RAM', '16 GB'], ['Storage', '512 GB SSD'], ['Graphics', 'Intel Iris Xe'], ['OS', 'Windows 11']]),
        stock: 40, sold: 60, avgRating: 4.3, numReviews: 35,
        tags: ['laptop', 'hp', 'work', 'student'],
        isBestSeller: true,
      },
      {
        name: 'Sony WH-1000XM5 Headphones',
        description: 'Industry-leading noise cancellation headphones with 30-hour battery, LDAC Hi-Res Audio, and multipoint connection. Supremely comfortable with ultra-soft ear cushions.',
        price: 26990, mrp: 34990, discount: 23,
        images: ['https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400&h=400&fit=crop'],
        category: catMap['electronics'], brand: 'Sony',
        specifications: new Map([['Type', 'Over-Ear Wireless'], ['Driver', '30mm'], ['Battery', '30 hours'], ['ANC', 'Yes – Industry Leading'], ['Bluetooth', '5.2'], ['Weight', '250g']]),
        stock: 60, sold: 110, avgRating: 4.7, numReviews: 90,
        tags: ['headphones', 'sony', 'wireless', 'noise-cancelling'],
        isFeatured: true, isBestSeller: true,
      },
      {
        name: 'boAt Airdopes 141 Earbuds',
        description: 'boAt Airdopes 141 with 42H playtime, ENx low latency, IPX4 water resistance, and IWP technology. Budget-friendly TWS earbuds with punchy bass.',
        price: 1299, mrp: 4490, discount: 71,
        images: ['https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&h=400&fit=crop'],
        category: catMap['electronics'], brand: 'boAt',
        specifications: new Map([['Type', 'TWS Earbuds'], ['Battery', '42 hours total'], ['Driver', '8mm'], ['Bluetooth', '5.1'], ['Water Resistance', 'IPX4'], ['Weight', '4.5g per earbud']]),
        stock: 200, sold: 500, avgRating: 4.1, numReviews: 320,
        tags: ['earbuds', 'boat', 'wireless', 'budget'],
        isBestSeller: true,
      },
      {
        name: 'Samsung 55-inch Crystal 4K Smart TV',
        description: 'Samsung Crystal 4K UHD Smart TV with Dynamic Crystal Color, HDR, built-in Alexa, and Tizen OS. Breathtaking 4K picture quality for immersive entertainment.',
        price: 42990, mrp: 61990, discount: 31,
        images: ['https://images.unsplash.com/photo-1593359677879-a4bb92f4834c?w=400&h=400&fit=crop'],
        category: catMap['electronics'], brand: 'Samsung',
        specifications: new Map([['Size', '55 inches'], ['Resolution', '4K UHD 3840x2160'], ['Panel', 'LED'], ['HDR', 'HDR10+'], ['Smart TV', 'Tizen OS'], ['Connectivity', '3 HDMI, 1 USB']]),
        stock: 20, sold: 30, avgRating: 4.4, numReviews: 25,
        tags: ['tv', 'samsung', '4k', 'smart-tv'],
        isNewArrival: true,
      },
      {
        name: 'Realme Narzo 60X 5G',
        description: 'Realme Narzo 60X 5G with Dimensity 6100+, 64MP AI camera, 5000mAh battery, and 33W fast charging. Best 5G phone under ₹12000.',
        price: 10999, mrp: 14999, discount: 27,
        images: ['https://picsum.photos/seed/117/400/400'],
        category: catMap['electronics'], brand: 'Realme',
        specifications: new Map([['Display', '6.72 inch FHD+ IPS'], ['Processor', 'Dimensity 6100+'], ['RAM', '4 GB'], ['Storage', '128 GB'], ['Camera', '64MP + 2MP'], ['Battery', '5000 mAh']]),
        stock: 100, sold: 180, avgRating: 4.2, numReviews: 120,
        tags: ['smartphone', 'realme', 'budget', '5g'],
        isBestSeller: true,
      },
      {
        name: 'JBL Flip 6 Bluetooth Speaker',
        description: 'JBL Flip 6 portable Bluetooth speaker with powerful JBL Original Pro Sound, IP67 waterproof, 12-hour battery, and PartyBoost for pairing multiple speakers.',
        price: 9999, mrp: 14999, discount: 33,
        images: ['https://picsum.photos/seed/130/400/400'],
        category: catMap['electronics'], brand: 'JBL',
        specifications: new Map([['Output', '30W'], ['Battery', '12 hours'], ['Waterproof', 'IP67'], ['Bluetooth', '5.1'], ['Weight', '550g'], ['Feature', 'PartyBoost']]),
        stock: 45, sold: 70, avgRating: 4.5, numReviews: 55,
        tags: ['speaker', 'jbl', 'bluetooth', 'portable'],
        isNewArrival: true,
      },
      {
        name: 'Canon EOS R50 Mirrorless Camera',
        description: 'Canon EOS R50 mirrorless camera with 24.2MP APS-C sensor, 4K video, subject detection AF, and built-in stabilization. Perfect entry-level camera for content creators.',
        price: 68990, mrp: 75990, discount: 9,
        images: ['https://picsum.photos/seed/143/400/400'],
        category: catMap['electronics'], brand: 'Canon',
        specifications: new Map([['Sensor', '24.2MP APS-C CMOS'], ['Video', '4K 30fps'], ['AF Points', '651'], ['ISO', '100-32000'], ['Screen', '3 inch Touchscreen'], ['Weight', '375g']]),
        stock: 15, sold: 20, avgRating: 4.6, numReviews: 18,
        tags: ['camera', 'canon', 'mirrorless', 'photography'],
        isNewArrival: true,
      },
      {
        name: 'Apple iPad 10th Gen',
        description: 'iPad 10th generation with A14 Bionic chip, 10.9-inch Liquid Retina display, 12MP cameras, USB-C, and support for Apple Pencil. Your versatile companion.',
        price: 39900, mrp: 44900, discount: 11,
        images: ['https://picsum.photos/seed/156/400/400'],
        category: catMap['electronics'], brand: 'Apple',
        specifications: new Map([['Display', '10.9 inch Liquid Retina'], ['Processor', 'A14 Bionic'], ['Storage', '64 GB'], ['Camera', '12MP rear + 12MP front'], ['Battery', '10 hours'], ['Connectivity', 'WiFi 6']]),
        stock: 30, sold: 55, avgRating: 4.5, numReviews: 40,
        tags: ['tablet', 'apple', 'ipad'],
        isFeatured: true,
      },

      // ─── Fashion (8) ──────────────────────────────────────────────────────
      {
        name: 'Levi\'s Men\'s 511 Slim Fit Jeans',
        description: 'Classic Levi\'s 511 slim fit jeans in indigo wash. Made with stretch denim for comfortable all-day wear. Sits below waist, slim through hip and thigh.',
        price: 2499, mrp: 4599, discount: 46,
        images: ['https://picsum.photos/seed/169/400/400'],
        category: catMap['fashion'], brand: "Levi's",
        specifications: new Map([['Fit', 'Slim'], ['Material', '98% Cotton, 2% Elastane'], ['Rise', 'Mid Rise'], ['Closure', 'Zip Fly'], ['Care', 'Machine Wash']]),
        stock: 120, sold: 200, avgRating: 4.4, numReviews: 150,
        tags: ['jeans', 'levis', 'men', 'slim-fit'],
        isBestSeller: true,
      },
      {
        name: 'Nike Air Max 270 Running Shoes',
        description: 'Nike Air Max 270 with the largest Air unit yet for a supremely soft ride. Mesh upper for breathability, foam midsole, and durable rubber outsole.',
        price: 8995, mrp: 13995, discount: 36,
        images: ['https://picsum.photos/seed/182/400/400'],
        category: catMap['fashion'], brand: 'Nike',
        specifications: new Map([['Type', 'Running Shoes'], ['Upper', 'Mesh + Synthetic'], ['Sole', 'Rubber'], ['Air Unit', '270 degrees'], ['Closure', 'Lace-Up']]),
        stock: 75, sold: 130, avgRating: 4.5, numReviews: 95,
        tags: ['shoes', 'nike', 'running', 'air-max'],
        isFeatured: true, isBestSeller: true,
      },
      {
        name: 'Allen Solly Men\'s Formal Shirt',
        description: 'Allen Solly slim fit formal shirt in crisp cotton. Perfect for office wear with a modern spread collar and single-button barrel cuffs.',
        price: 1199, mrp: 1999, discount: 40,
        images: ['https://picsum.photos/seed/195/400/400'],
        category: catMap['fashion'], brand: 'Allen Solly',
        specifications: new Map([['Fit', 'Slim'], ['Material', '100% Cotton'], ['Collar', 'Spread'], ['Sleeve', 'Full Sleeve'], ['Pattern', 'Solid']]),
        stock: 150, sold: 180, avgRating: 4.2, numReviews: 80,
        tags: ['shirt', 'formal', 'men', 'office'],
        isBestSeller: true,
      },
      {
        name: 'Fastrack Analog Watch for Men',
        description: 'Fastrack casual analog watch with round dial, leather strap, and water-resistant design. Sleek and stylish timepiece for everyday wear.',
        price: 1495, mrp: 2495, discount: 40,
        images: ['https://picsum.photos/seed/208/400/400'],
        category: catMap['fashion'], brand: 'Fastrack',
        specifications: new Map([['Dial Shape', 'Round'], ['Strap', 'Leather'], ['Movement', 'Quartz'], ['Water Resistant', '50 meters'], ['Warranty', '2 years']]),
        stock: 90, sold: 100, avgRating: 4.1, numReviews: 65,
        tags: ['watch', 'fastrack', 'men', 'analog'],
        isNewArrival: true,
      },
      {
        name: 'Wildcraft Unisex Backpack 35L',
        description: 'Wildcraft 35L backpack with padded laptop compartment, multiple organizer pockets, and adjustable straps. Ideal for college, travel, and daily commute.',
        price: 1599, mrp: 2999, discount: 47,
        images: ['https://picsum.photos/seed/221/400/400'],
        category: catMap['fashion'], brand: 'Wildcraft',
        specifications: new Map([['Capacity', '35 Liters'], ['Material', 'Polyester'], ['Laptop Fit', 'Up to 15.6 inch'], ['Compartments', '3 Main + Side'], ['Weight', '600g']]),
        stock: 80, sold: 120, avgRating: 4.3, numReviews: 70,
        tags: ['backpack', 'wildcraft', 'laptop-bag', 'travel'],
        isBestSeller: true,
      },
      {
        name: 'W Women\'s Anarkali Kurta',
        description: 'Beautiful floral printed Anarkali kurta from W with mandarin collar, three-quarter sleeves, and flared hem. Perfect for festive and casual occasions.',
        price: 1799, mrp: 2999, discount: 40,
        images: ['https://picsum.photos/seed/234/400/400'],
        category: catMap['fashion'], brand: 'W',
        specifications: new Map([['Fit', 'Flared'], ['Material', 'Viscose Rayon'], ['Sleeve', '3/4 Sleeve'], ['Neck', 'Mandarin Collar'], ['Occasion', 'Festive/Casual']]),
        stock: 60, sold: 85, avgRating: 4.4, numReviews: 55,
        tags: ['kurta', 'women', 'ethnic', 'anarkali'],
        isNewArrival: true,
      },
      {
        name: 'Puma Men\'s Polo T-Shirt',
        description: 'Puma essential polo t-shirt with classic fit, ribbed collar, and iconic Puma cat logo. Made with moisture-wicking dryCELL technology.',
        price: 899, mrp: 1799, discount: 50,
        images: ['https://picsum.photos/seed/247/400/400'],
        category: catMap['fashion'], brand: 'Puma',
        specifications: new Map([['Fit', 'Regular'], ['Material', '100% Cotton'], ['Collar', 'Polo/Ribbed'], ['Sleeve', 'Short Sleeve'], ['Technology', 'dryCELL']]),
        stock: 200, sold: 300, avgRating: 4.3, numReviews: 130,
        tags: ['tshirt', 'polo', 'puma', 'men'],
        isBestSeller: true,
      },
      {
        name: 'Bata Women\'s Sneakers',
        description: 'Bata comfortable women\'s sneakers with cushioned insole, lightweight build, and trendy design. Great for daily wear and light walks.',
        price: 1299, mrp: 1999, discount: 35,
        images: ['https://picsum.photos/seed/260/400/400'],
        category: catMap['fashion'], brand: 'Bata',
        specifications: new Map([['Type', 'Sneakers'], ['Upper', 'Synthetic'], ['Sole', 'PVC'], ['Closure', 'Lace-Up'], ['Occasion', 'Casual']]),
        stock: 100, sold: 140, avgRating: 4.0, numReviews: 60,
        tags: ['shoes', 'sneakers', 'women', 'bata'],
        isNewArrival: true,
      },

      // ─── Home & Kitchen (7) ───────────────────────────────────────────────
      {
        name: 'Prestige Iris 750W Mixer Grinder',
        description: 'Prestige Iris 750 Watt mixer grinder with 3 stainless steel jars, powerful motor, and multi-purpose blades. Perfect for grinding, mixing, and blending.',
        price: 3299, mrp: 5495, discount: 40,
        images: ['https://picsum.photos/seed/273/400/400'],
        category: catMap['home-kitchen'], brand: 'Prestige',
        specifications: new Map([['Wattage', '750W'], ['Jars', '3 Stainless Steel'], ['Speed', '3 Speed + Pulse'], ['Blade', 'Multi-purpose SS'], ['Warranty', '2 years']]),
        stock: 50, sold: 80, avgRating: 4.3, numReviews: 55,
        tags: ['mixer', 'grinder', 'prestige', 'kitchen'],
        isBestSeller: true,
      },
      {
        name: 'Pigeon Stovekraft Air Fryer 3.2L',
        description: 'Pigeon air fryer with 3.2L capacity, 360° rapid air technology, adjustable temperature, and timer. Cook crispy food with up to 90% less oil.',
        price: 2999, mrp: 5990, discount: 50,
        images: ['https://picsum.photos/seed/286/400/400'],
        category: catMap['home-kitchen'], brand: 'Pigeon',
        specifications: new Map([['Capacity', '3.2 Liters'], ['Wattage', '1200W'], ['Temperature', '80-200°C'], ['Timer', '30 minutes'], ['Technology', '360° Rapid Air']]),
        stock: 35, sold: 65, avgRating: 4.2, numReviews: 42,
        tags: ['air-fryer', 'pigeon', 'healthy-cooking', 'kitchen'],
        isFeatured: true, isNewArrival: true,
      },
      {
        name: 'Milton Thermosteel Flask 1L',
        description: 'Milton Thermosteel 24-hour hot and cold vacuum insulated flask. 1 litre capacity with leak-proof lid and durable stainless steel body.',
        price: 799, mrp: 1340, discount: 40,
        images: ['https://picsum.photos/seed/299/400/400'],
        category: catMap['home-kitchen'], brand: 'Milton',
        specifications: new Map([['Capacity', '1 Litre'], ['Material', 'Stainless Steel'], ['Insulation', '24 Hours'], ['Lid', 'Leak-Proof'], ['Weight', '380g']]),
        stock: 100, sold: 200, avgRating: 4.4, numReviews: 130,
        tags: ['flask', 'milton', 'thermos', 'water-bottle'],
        isBestSeller: true,
      },
      {
        name: 'Havells Instanio 3L Instant Water Heater',
        description: 'Havells 3-litre instant water heater with heavy-duty heating element, ISI marked, and multiple safety systems. Quick heating for kitchen and bathroom.',
        price: 3499, mrp: 4800, discount: 27,
        images: ['https://picsum.photos/seed/312/400/400'],
        category: catMap['home-kitchen'], brand: 'Havells',
        specifications: new Map([['Capacity', '3 Litres'], ['Wattage', '3000W'], ['Body', 'ABS Outer Body'], ['Element', 'Ultra Thick SS'], ['Safety', '4 Level'], ['Warranty', '5 years']]),
        stock: 25, sold: 40, avgRating: 4.3, numReviews: 28,
        tags: ['geyser', 'water-heater', 'havells', 'instant'],
        isNewArrival: true,
      },
      {
        name: 'Cello Opalware Dinner Set 19 Pcs',
        description: 'Cello Opalware dinner set with 19 pieces – plates, bowls, and serving pieces. Lightweight, chip-resistant, and microwave safe. Elegant floral design.',
        price: 1499, mrp: 2999, discount: 50,
        images: ['https://picsum.photos/seed/325/400/400'],
        category: catMap['home-kitchen'], brand: 'Cello',
        specifications: new Map([['Pieces', '19'], ['Material', 'Opalware'], ['Microwave Safe', 'Yes'], ['Dishwasher Safe', 'Yes'], ['Pattern', 'Floral']]),
        stock: 40, sold: 70, avgRating: 4.3, numReviews: 48,
        tags: ['dinner-set', 'cello', 'opalware', 'crockery'],
        isBestSeller: true,
      },
      {
        name: 'Wipro 9W LED Bulb Pack of 4',
        description: 'Wipro Garnet 9W LED bulb pack with 810 lumens, cool daylight, B22 base. Energy efficient with 25,000 hours lifespan.',
        price: 349, mrp: 580, discount: 40,
        images: ['https://picsum.photos/seed/338/400/400'],
        category: catMap['home-kitchen'], brand: 'Wipro',
        specifications: new Map([['Wattage', '9W'], ['Lumens', '810'], ['Base', 'B22'], ['Color', 'Cool Daylight 6500K'], ['Life', '25000 hours'], ['Pack', '4 Bulbs']]),
        stock: 300, sold: 500, avgRating: 4.2, numReviews: 200,
        tags: ['bulb', 'led', 'wipro', 'lighting'],
        isBestSeller: true,
      },
      {
        name: 'Urban Ladder Engineered Wood TV Unit',
        description: 'Modern TV unit in walnut finish with ample storage, cable management, and sturdy engineered wood construction. Fits TVs up to 55 inches.',
        price: 8999, mrp: 14999, discount: 40,
        images: ['https://picsum.photos/seed/351/400/400'],
        category: catMap['home-kitchen'], brand: 'Urban Ladder',
        specifications: new Map([['Material', 'Engineered Wood'], ['Finish', 'Walnut'], ['Fits TV', 'Up to 55 inch'], ['Storage', '2 Drawers + 2 Shelves'], ['Dimensions', '140x40x45 cm']]),
        stock: 10, sold: 15, avgRating: 4.1, numReviews: 12,
        tags: ['furniture', 'tv-unit', 'living-room'],
        isNewArrival: true,
      },

      // ─── Books (6) ────────────────────────────────────────────────────────
      {
        name: 'Atomic Habits by James Clear',
        description: 'The #1 New York Times bestseller. Atomic Habits offers a proven framework for improving every day. Learn how tiny changes in behaviour can lead to remarkable results.',
        price: 399, mrp: 799, discount: 50,
        images: ['https://picsum.photos/seed/364/400/400'],
        category: catMap['books'], brand: 'Penguin',
        specifications: new Map([['Author', 'James Clear'], ['Pages', '320'], ['Language', 'English'], ['Format', 'Paperback'], ['ISBN', '978-0735211292']]),
        stock: 200, sold: 500, avgRating: 4.7, numReviews: 350,
        tags: ['self-help', 'habits', 'bestseller', 'non-fiction'],
        isBestSeller: true, isFeatured: true,
      },
      {
        name: 'The Psychology of Money by Morgan Housel',
        description: 'Timeless lessons on wealth, greed, and happiness. Morgan Housel shares 19 short stories exploring the strange ways people think about money.',
        price: 299, mrp: 399, discount: 25,
        images: ['https://picsum.photos/seed/377/400/400'],
        category: catMap['books'], brand: 'Jaico Publishing',
        specifications: new Map([['Author', 'Morgan Housel'], ['Pages', '256'], ['Language', 'English'], ['Format', 'Paperback'], ['ISBN', '978-9390166268']]),
        stock: 180, sold: 420, avgRating: 4.6, numReviews: 280,
        tags: ['finance', 'money', 'bestseller', 'non-fiction'],
        isBestSeller: true,
      },
      {
        name: 'Ikigai: The Japanese Secret to a Long and Happy Life',
        description: 'Discover the Japanese concept of ikigai – your reason for being. This international bestseller reveals the secrets of centenarians in Okinawa.',
        price: 249, mrp: 599, discount: 58,
        images: ['https://picsum.photos/seed/390/400/400'],
        category: catMap['books'], brand: 'Penguin',
        specifications: new Map([['Author', 'Héctor García & Francesc Miralles'], ['Pages', '208'], ['Language', 'English'], ['Format', 'Paperback'], ['ISBN', '978-0143130727']]),
        stock: 150, sold: 380, avgRating: 4.5, numReviews: 240,
        tags: ['self-help', 'japanese', 'happiness', 'bestseller'],
        isBestSeller: true,
      },
      {
        name: 'Rich Dad Poor Dad by Robert Kiyosaki',
        description: 'The #1 personal finance book of all time. Robert Kiyosaki shares lessons about money, investing, and financial independence learned from two fathers.',
        price: 299, mrp: 499, discount: 40,
        images: ['https://picsum.photos/seed/403/400/400'],
        category: catMap['books'], brand: 'Plata Publishing',
        specifications: new Map([['Author', 'Robert T. Kiyosaki'], ['Pages', '336'], ['Language', 'English'], ['Format', 'Paperback'], ['ISBN', '978-1612681139']]),
        stock: 160, sold: 450, avgRating: 4.5, numReviews: 300,
        tags: ['finance', 'investing', 'bestseller', 'self-help'],
        isBestSeller: true,
      },
      {
        name: 'The Alchemist by Paulo Coelho',
        description: 'A magical tale of Santiago, an Andalusian shepherd boy, on his quest to find a worldly treasure. An inspiring story about following your dreams.',
        price: 199, mrp: 350, discount: 43,
        images: ['https://picsum.photos/seed/416/400/400'],
        category: catMap['books'], brand: 'HarperCollins',
        specifications: new Map([['Author', 'Paulo Coelho'], ['Pages', '172'], ['Language', 'English'], ['Format', 'Paperback'], ['ISBN', '978-0062315007']]),
        stock: 140, sold: 350, avgRating: 4.6, numReviews: 260,
        tags: ['fiction', 'classic', 'bestseller', 'philosophy'],
        isFeatured: true,
      },
      {
        name: 'Wings of Fire by A.P.J. Abdul Kalam',
        description: 'The autobiography of Dr. A.P.J. Abdul Kalam – former President of India. An inspiring journey from a small town to becoming the Missile Man of India.',
        price: 199, mrp: 350, discount: 43,
        images: ['https://picsum.photos/seed/429/400/400'],
        category: catMap['books'], brand: 'Universities Press',
        specifications: new Map([['Author', 'A.P.J. Abdul Kalam'], ['Pages', '180'], ['Language', 'English'], ['Format', 'Paperback'], ['ISBN', '978-8173711466']]),
        stock: 120, sold: 280, avgRating: 4.7, numReviews: 200,
        tags: ['autobiography', 'indian', 'inspiration', 'bestseller'],
        isNewArrival: false,
      },

      // ─── Sports & Fitness (6) ─────────────────────────────────────────────
      {
        name: 'Cockatoo 20kg Dumbbell Set',
        description: 'Cockatoo adjustable dumbbell set with 20kg PVC weight plates, chrome rods, and spin-lock collars. Perfect for home gym workouts.',
        price: 1899, mrp: 3500, discount: 46,
        images: ['https://picsum.photos/seed/442/400/400'],
        category: catMap['sports-fitness'], brand: 'Cockatoo',
        specifications: new Map([['Total Weight', '20 kg'], ['Plates', 'PVC Coated'], ['Rod', 'Chrome'], ['Grip', 'Textured'], ['Collar', 'Spin Lock']]),
        stock: 40, sold: 75, avgRating: 4.2, numReviews: 50,
        tags: ['dumbbell', 'gym', 'home-gym', 'weights'],
        isBestSeller: true,
      },
      {
        name: 'Boldfit Yoga Mat 6mm',
        description: 'Boldfit premium yoga mat with 6mm thickness, anti-slip texture, and carrying strap. Extra long for tall users. Eco-friendly TPE material.',
        price: 599, mrp: 1499, discount: 60,
        images: ['https://picsum.photos/seed/455/400/400'],
        category: catMap['sports-fitness'], brand: 'Boldfit',
        specifications: new Map([['Thickness', '6mm'], ['Material', 'TPE Eco-Friendly'], ['Length', '183cm'], ['Width', '61cm'], ['Anti-Slip', 'Both Sides']]),
        stock: 100, sold: 200, avgRating: 4.3, numReviews: 120,
        tags: ['yoga', 'mat', 'fitness', 'exercise'],
        isBestSeller: true,
      },
      {
        name: 'Yonex Nanoray Light 18i Badminton Racket',
        description: 'Yonex Nanoray Light 18i with isometric head shape, nanomesh and carbon nanotube construction. Lightweight at 77g for quick swings.',
        price: 1690, mrp: 2490, discount: 32,
        images: ['https://picsum.photos/seed/468/400/400'],
        category: catMap['sports-fitness'], brand: 'Yonex',
        specifications: new Map([['Weight', '77g (5U)'], ['Balance', 'Head Light'], ['Shaft', 'Hi-flex'], ['Material', 'Graphite'], ['String Tension', '20-28 lbs']]),
        stock: 30, sold: 55, avgRating: 4.4, numReviews: 40,
        tags: ['badminton', 'yonex', 'racket', 'sports'],
        isNewArrival: true,
      },
      {
        name: 'Nivia Storm Football Size 5',
        description: 'Nivia Storm football with hand-stitched panels, PU cover, and latex bladder. FIFA approved size and weight for practice and matches.',
        price: 549, mrp: 899, discount: 39,
        images: ['https://picsum.photos/seed/481/400/400'],
        category: catMap['sports-fitness'], brand: 'Nivia',
        specifications: new Map([['Size', '5'], ['Material', 'PU'], ['Stitching', 'Hand Stitched'], ['Bladder', 'Latex'], ['Panels', '32']]),
        stock: 60, sold: 100, avgRating: 4.2, numReviews: 65,
        tags: ['football', 'nivia', 'soccer', 'sports'],
        isBestSeller: true,
      },
      {
        name: 'JELEX Resistance Bands Set',
        description: 'Set of 5 resistance bands with different resistance levels. Includes carry bag, door anchor, and handles. Perfect for strength training and rehab.',
        price: 699, mrp: 1499, discount: 53,
        images: ['https://picsum.photos/seed/494/400/400'],
        category: catMap['sports-fitness'], brand: 'JELEX',
        specifications: new Map([['Bands', '5 Levels'], ['Material', 'Natural Latex'], ['Includes', 'Door Anchor + 2 Handles + Ankle Straps'], ['Max Resistance', '150 lbs combined'], ['Carry Bag', 'Yes']]),
        stock: 80, sold: 130, avgRating: 4.1, numReviews: 75,
        tags: ['resistance-bands', 'workout', 'strength-training'],
        isNewArrival: true,
      },
      {
        name: 'Fitbit Inspire 3 Fitness Tracker',
        description: 'Fitbit Inspire 3 with heart rate tracking, sleep analysis, stress management, and 10-day battery. Swim-proof design with color AMOLED display.',
        price: 7999, mrp: 10999, discount: 27,
        images: ['https://picsum.photos/seed/507/400/400'],
        category: catMap['sports-fitness'], brand: 'Fitbit',
        specifications: new Map([['Display', 'Color AMOLED'], ['Battery', '10 days'], ['Heart Rate', 'Yes, 24/7'], ['Water Resistant', '50m'], ['Sensors', 'SpO2, Skin Temperature'], ['Compatibility', 'Android + iOS']]),
        stock: 25, sold: 45, avgRating: 4.3, numReviews: 32,
        tags: ['fitness-tracker', 'fitbit', 'smartwatch', 'health'],
        isFeatured: true,
      },

      // ─── Beauty & Personal Care (6) ────────────────────────────────────────
      {
        name: 'Mamaearth Vitamin C Face Serum',
        description: 'Mamaearth Vitamin C face serum with turmeric for skin illumination. Helps reduce dark spots, hyperpigmentation, and gives a natural glow.',
        price: 499, mrp: 799, discount: 38,
        images: ['https://picsum.photos/seed/520/400/400'],
        category: catMap['beauty-personal-care'], brand: 'Mamaearth',
        specifications: new Map([['Volume', '30ml'], ['Key Ingredient', 'Vitamin C + Turmeric'], ['Skin Type', 'All'], ['Paraben Free', 'Yes'], ['Cruelty Free', 'Yes']]),
        stock: 150, sold: 300, avgRating: 4.2, numReviews: 200,
        tags: ['serum', 'vitamin-c', 'skincare', 'face'],
        isBestSeller: true,
      },
      {
        name: 'Philips BT1233 Beard Trimmer',
        description: 'Philips beard trimmer with DuraPower technology for 4x longer usage. USB charging, cordless use, and stainless steel blades for precise trimming.',
        price: 999, mrp: 1495, discount: 33,
        images: ['https://picsum.photos/seed/533/400/400'],
        category: catMap['beauty-personal-care'], brand: 'Philips',
        specifications: new Map([['Battery', 'USB Rechargeable'], ['Runtime', '60 min'], ['Blades', 'Stainless Steel'], ['Settings', '10 Length'], ['Washable', 'Yes']]),
        stock: 80, sold: 150, avgRating: 4.3, numReviews: 110,
        tags: ['trimmer', 'philips', 'grooming', 'men'],
        isBestSeller: true,
      },
      {
        name: 'L\'Oreal Paris Total Repair 5 Shampoo 640ml',
        description: 'L\'Oreal Total Repair 5 shampoo with ceramide and pro-keratin. Fights 5 signs of damage – fall, rough, dry, dull, and split ends.',
        price: 399, mrp: 575, discount: 31,
        images: ['https://picsum.photos/seed/546/400/400'],
        category: catMap['beauty-personal-care'], brand: "L'Oreal Paris",
        specifications: new Map([['Volume', '640ml'], ['Hair Type', 'Damaged'], ['Key Ingredient', 'Ceramide + Pro-Keratin'], ['Sulphate', 'Contains SLS'], ['For', 'Men & Women']]),
        stock: 120, sold: 220, avgRating: 4.3, numReviews: 150,
        tags: ['shampoo', 'loreal', 'haircare', 'repair'],
        isBestSeller: true,
      },
      {
        name: 'Lakme 9to5 Primer + Matte Lipstick',
        description: 'Lakme 9to5 primer + matte lip color with built-in primer for smooth application. Long-lasting color that stays through your workday.',
        price: 299, mrp: 550, discount: 46,
        images: ['https://picsum.photos/seed/559/400/400'],
        category: catMap['beauty-personal-care'], brand: 'Lakme',
        specifications: new Map([['Finish', 'Matte'], ['Built-in', 'Primer'], ['Weight', '3.6g'], ['Shade', 'MR9 Ruby Rush'], ['Cruelty Free', 'Yes']]),
        stock: 100, sold: 180, avgRating: 4.1, numReviews: 95,
        tags: ['lipstick', 'lakme', 'makeup', 'matte'],
        isNewArrival: true,
      },
      {
        name: 'Biotique Bio Morning Nectar Sunscreen SPF 30',
        description: 'Biotique morning nectar sunscreen with SPF 30 PA++ protection. Enriched with wheatgerm and morning nectar for nourished, protected skin.',
        price: 249, mrp: 399, discount: 38,
        images: ['https://picsum.photos/seed/572/400/400'],
        category: catMap['beauty-personal-care'], brand: 'Biotique',
        specifications: new Map([['SPF', '30 PA++'], ['Volume', '120ml'], ['Key Ingredient', 'Morning Nectar + Wheatgerm'], ['Skin Type', 'All'], ['Chemical Free', 'Yes']]),
        stock: 90, sold: 170, avgRating: 4.0, numReviews: 80,
        tags: ['sunscreen', 'biotique', 'skincare', 'spf'],
        isNewArrival: true,
      },
      {
        name: 'Dove Deeply Nourishing Body Wash 800ml',
        description: 'Dove body wash with NutriumMoisture technology that nourishes skin deep. Gives softer, smoother skin after just one shower.',
        price: 359, mrp: 499, discount: 28,
        images: ['https://picsum.photos/seed/585/400/400'],
        category: catMap['beauty-personal-care'], brand: 'Dove',
        specifications: new Map([['Volume', '800ml'], ['Scent', 'Deeply Nourishing'], ['Technology', 'NutriumMoisture'], ['Skin Type', 'All'], ['pH Balanced', 'Yes']]),
        stock: 110, sold: 200, avgRating: 4.4, numReviews: 130,
        tags: ['body-wash', 'dove', 'bath', 'skincare'],
        isBestSeller: true,
      },

      // ─── Toys & Games (5) ─────────────────────────────────────────────────
      {
        name: 'LEGO Classic Creative Bricks 484 Pcs',
        description: 'LEGO Classic creative building set with 484 pieces in 35 colors. Includes ideas booklet with building instructions. Endless creative possibilities.',
        price: 2499, mrp: 3499, discount: 29,
        images: ['https://picsum.photos/seed/598/400/400'],
        category: catMap['toys-games'], brand: 'LEGO',
        specifications: new Map([['Pieces', '484'], ['Age', '4+ years'], ['Colors', '35'], ['Theme', 'Classic/Creative'], ['Box Size', '36x19x18 cm']]),
        stock: 30, sold: 50, avgRating: 4.8, numReviews: 35,
        tags: ['lego', 'building', 'creative', 'kids'],
        isFeatured: true, isBestSeller: true,
      },
      {
        name: 'Funskool Monopoly Board Game',
        description: 'The classic Monopoly board game – buy, sell, and trade properties to bankrupt your opponents. Includes updated tokens, money, and game board.',
        price: 799, mrp: 1199, discount: 33,
        images: ['https://picsum.photos/seed/611/400/400'],
        category: catMap['toys-games'], brand: 'Funskool',
        specifications: new Map([['Players', '2-8'], ['Age', '8+ years'], ['Play Time', '60-180 min'], ['Contents', 'Board, Tokens, Money, Cards, Houses, Hotels'], ['Type', 'Strategy']]),
        stock: 50, sold: 85, avgRating: 4.5, numReviews: 60,
        tags: ['monopoly', 'board-game', 'family', 'strategy'],
        isBestSeller: true,
      },
      {
        name: 'Hot Wheels 10-Car Gift Pack',
        description: 'Hot Wheels 10-car pack featuring a variety of die-cast vehicles. Each car has detailed design and rolling wheels. Great collector starter set.',
        price: 899, mrp: 1299, discount: 31,
        images: ['https://picsum.photos/seed/624/400/400'],
        category: catMap['toys-games'], brand: 'Hot Wheels',
        specifications: new Map([['Cars', '10'], ['Scale', '1:64'], ['Age', '3+ years'], ['Material', 'Die-Cast Metal'], ['Type', 'Vehicle Set']]),
        stock: 40, sold: 70, avgRating: 4.4, numReviews: 45,
        tags: ['hot-wheels', 'cars', 'toys', 'die-cast'],
        isNewArrival: true,
      },
      {
        name: 'Smartivity DIY Hydraulic Crane STEM Toy',
        description: 'Build your own hydraulic crane with this Smartivity STEM kit. Learn about hydraulics, engineering, and mechanics through hands-on play. Made in India.',
        price: 799, mrp: 1199, discount: 33,
        images: ['https://picsum.photos/seed/637/400/400'],
        category: catMap['toys-games'], brand: 'Smartivity',
        specifications: new Map([['Age', '6-14 years'], ['Material', 'Engineered Wood'], ['STEM', 'Hydraulics + Engineering'], ['Pieces', '100+'], ['Made In', 'India']]),
        stock: 25, sold: 35, avgRating: 4.5, numReviews: 22,
        tags: ['stem', 'educational', 'diy', 'engineering'],
        isNewArrival: true, isFeatured: true,
      },
      {
        name: 'Carrom Board Full Size 32 inch',
        description: 'Full-size 32-inch carrom board with smooth playing surface, sturdy frame, and coin striker set. Family entertainment for all ages.',
        price: 1499, mrp: 2499, discount: 40,
        images: ['https://picsum.photos/seed/650/400/400'],
        category: catMap['toys-games'], brand: 'GSI',
        specifications: new Map([['Size', '32 x 32 inches'], ['Surface', 'Ply'], ['Frame', 'Hardwood'], ['Includes', 'Coins + Striker + Powder'], ['Players', '2-4']]),
        stock: 20, sold: 30, avgRating: 4.2, numReviews: 18,
        tags: ['carrom', 'indoor-game', 'family', 'traditional'],
        isBestSeller: true,
      },

      // ─── Groceries (5) ────────────────────────────────────────────────────
      {
        name: 'Tata Sampann Unpolished Toor Dal 1kg',
        description: 'Tata Sampann unpolished toor dal sourced from the best farms. Rich in protein and fiber. No preservatives, no artificial polishing.',
        price: 169, mrp: 209, discount: 19,
        images: ['https://picsum.photos/seed/663/400/400'],
        category: catMap['groceries'], brand: 'Tata Sampann',
        specifications: new Map([['Weight', '1 kg'], ['Type', 'Toor Dal (Arhar)'], ['Polished', 'No – Unpolished'], ['Preservatives', 'None'], ['Source', 'Farm Fresh']]),
        stock: 500, sold: 800, avgRating: 4.4, numReviews: 200,
        tags: ['dal', 'toor', 'pulses', 'tata', 'staples'],
        isBestSeller: true,
      },
      {
        name: 'Saffola Gold Blended Oil 5L',
        description: 'Saffola Gold dual-seed cooking oil with rice bran and sunflower oils. Rich in LOSORB technology, oryzanol, and Vitamin E for heart health.',
        price: 849, mrp: 999, discount: 15,
        images: ['https://picsum.photos/seed/676/400/400'],
        category: catMap['groceries'], brand: 'Saffola',
        specifications: new Map([['Volume', '5 Litres'], ['Oils', 'Rice Bran + Sunflower'], ['Technology', 'LOSORB'], ['Enriched', 'Vitamin E + Oryzanol'], ['Packaging', 'Jar']]),
        stock: 100, sold: 250, avgRating: 4.3, numReviews: 130,
        tags: ['cooking-oil', 'saffola', 'heart-healthy', 'kitchen'],
        isBestSeller: true,
      },
      {
        name: 'Cadbury Bournvita Health Drink 1kg',
        description: 'Cadbury Bournvita with Vitamins D, B2, B9, B12, Iron, and Calcium. Chocolate flavored health drink mix for children and adults.',
        price: 399, mrp: 480, discount: 17,
        images: ['https://picsum.photos/seed/689/400/400'],
        category: catMap['groceries'], brand: 'Cadbury',
        specifications: new Map([['Weight', '1 kg'], ['Flavor', 'Chocolate'], ['Vitamins', 'D, B2, B9, B12'], ['Minerals', 'Iron, Calcium'], ['Age', 'All Ages']]),
        stock: 200, sold: 350, avgRating: 4.4, numReviews: 180,
        tags: ['health-drink', 'bournvita', 'chocolate', 'nutrition'],
        isBestSeller: true,
      },
      {
        name: 'Aashirvaad Whole Wheat Atta 10kg',
        description: 'Aashirvaad atta made from 100% whole wheat with 0% maida. Soft rotis every time with balanced protein and fiber content.',
        price: 449, mrp: 520, discount: 14,
        images: ['https://picsum.photos/seed/702/400/400'],
        category: catMap['groceries'], brand: 'Aashirvaad',
        specifications: new Map([['Weight', '10 kg'], ['Type', '100% Whole Wheat'], ['Maida', '0%'], ['Protein', '12g per 100g'], ['Packaging', 'Pack']]),
        stock: 300, sold: 600, avgRating: 4.5, numReviews: 300,
        tags: ['atta', 'wheat', 'flour', 'staples', 'aashirvaad'],
        isBestSeller: true,
      },
      {
        name: 'Lay\'s Classic Salted Chips 235g',
        description: 'Lay\'s classic salted potato chips – thinly sliced and perfectly seasoned. The ultimate crispy snack for any occasion.',
        price: 99, mrp: 120, discount: 18,
        images: ['https://picsum.photos/seed/715/400/400'],
        category: catMap['groceries'], brand: "Lay's",
        specifications: new Map([['Weight', '235g'], ['Flavor', 'Classic Salted'], ['Type', 'Potato Chips'], ['Vegetarian', 'Yes'], ['Pack', 'Family Pack']]),
        stock: 400, sold: 700, avgRating: 4.3, numReviews: 150,
        tags: ['chips', 'snacks', 'lays', 'party'],
        isBestSeller: true,
      },
    ];

    const products = await Product.insertMany(productsData);
    console.log(`✓ ${products.length} products created`);

    // ── Create Coupons ─────────────────────────────────────────────────────────
    const now = new Date();
    const oneYearLater = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);

    const couponsData = [
      {
        code: 'WELCOME10',
        discountType: 'percentage',
        discountValue: 10,
        minPurchase: 500,
        maxDiscount: 200,
        validFrom: now,
        validUntil: oneYearLater,
        usageLimit: 1000,
      },
      {
        code: 'FLAT200',
        discountType: 'fixed',
        discountValue: 200,
        minPurchase: 1000,
        validFrom: now,
        validUntil: oneYearLater,
        usageLimit: 500,
      },
      {
        code: 'SUMMER25',
        discountType: 'percentage',
        discountValue: 25,
        minPurchase: 1500,
        maxDiscount: 500,
        validFrom: now,
        validUntil: oneYearLater,
        usageLimit: 300,
      },
      {
        code: 'FIRST50',
        discountType: 'percentage',
        discountValue: 50,
        minPurchase: 500,
        maxDiscount: 300,
        validFrom: now,
        validUntil: oneYearLater,
        usageLimit: 200,
      },
      {
        code: 'FREESHIPPING',
        discountType: 'fixed',
        discountValue: 50,
        minPurchase: 0,
        validFrom: now,
        validUntil: oneYearLater,
        usageLimit: 1000,
      },
    ];

    const coupons = await Coupon.insertMany(couponsData);
    console.log(`✓ ${coupons.length} coupons created`);

    // ── Create Sample Reviews ──────────────────────────────────────────────────
    const reviewsData = [
      { user: demoUser._id, product: products[0]._id, rating: 5, title: 'Best Phone Ever!', comment: 'Amazing camera and performance. The S Pen is incredibly useful for note-taking.', isVerifiedPurchase: true },
      { user: demoUser._id, product: products[1]._id, rating: 5, title: 'Worth Every Rupee', comment: 'iPhone 15 Pro Max is simply the best phone. Camera quality is unmatched.', isVerifiedPurchase: true },
      { user: demoUser._id, product: products[3]._id, rating: 5, title: 'Perfect Laptop', comment: 'MacBook Air M3 is incredibly fast and the battery lasts all day. Silent operation!', isVerifiedPurchase: true },
      { user: demoUser._id, product: products[5]._id, rating: 4, title: 'Great Noise Cancellation', comment: 'Sony XM5 blocks out everything. Very comfortable for long listening sessions.', isVerifiedPurchase: true },
      { user: demoUser._id, product: products[25]._id, rating: 5, title: 'Life Changing Book', comment: 'Atomic Habits completely changed how I approach building habits. A must-read!', isVerifiedPurchase: true },
      { user: adminUser._id, product: products[0]._id, rating: 4, title: 'Great flagship', comment: 'Excellent phone overall. Camera is fantastic but the phone is a bit heavy.', isVerifiedPurchase: false },
      { user: adminUser._id, product: products[6]._id, rating: 4, title: 'Best budget earbuds', comment: 'Amazing battery life and decent sound quality for the price. Bass is good.', isVerifiedPurchase: false },
      { user: adminUser._id, product: products[13]._id, rating: 5, title: 'Nike quality!', comment: 'Super comfortable and stylish. The Air Max 270 cushioning is incredible.', isVerifiedPurchase: false },
    ];

    const reviews = await Review.insertMany(reviewsData);
    console.log(`✓ ${reviews.length} sample reviews created`);

    // ── Create Sample Orders for Demo User ────────────────────────────────────
    const ordersData = [
      {
        user: demoUser._id,
        items: [
          { product: products[0]._id, name: products[0].name, price: products[0].price, quantity: 1, image: products[0].images[0] },
          { product: products[5]._id, name: products[5].name, price: products[5].price, quantity: 1, image: products[5].images[0] },
        ],
        shippingAddress: { street: '456 Main Road', city: 'Bangalore', state: 'Karnataka', zipCode: '560001', country: 'India', phone: '9876543211' },
        billingAddress: { street: '456 Main Road', city: 'Bangalore', state: 'Karnataka', zipCode: '560001', country: 'India', phone: '9876543211' },
        paymentMethod: 'Card',
        paymentStatus: 'Paid',
        orderStatus: 'Delivered',
        subtotal: 156989,
        tax: 28258.02,
        shippingCharges: 0,
        discount: 0,
        totalAmount: 185247.02,
        deliveredAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      },
      {
        user: demoUser._id,
        items: [
          { product: products[25]._id, name: products[25].name, price: products[25].price, quantity: 2, image: products[25].images[0] },
          { product: products[26]._id, name: products[26].name, price: products[26].price, quantity: 1, image: products[26].images[0] },
        ],
        shippingAddress: { street: '456 Main Road', city: 'Bangalore', state: 'Karnataka', zipCode: '560001', country: 'India', phone: '9876543211' },
        billingAddress: { street: '456 Main Road', city: 'Bangalore', state: 'Karnataka', zipCode: '560001', country: 'India', phone: '9876543211' },
        paymentMethod: 'UPI',
        paymentStatus: 'Paid',
        orderStatus: 'Shipped',
        subtotal: 1097,
        tax: 197.46,
        shippingCharges: 0,
        discount: 0,
        totalAmount: 1294.46,
        trackingInfo: {
          carrier: 'BlueDart',
          trackingNumber: 'BD123456789',
          estimatedDelivery: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
          updates: [
            { status: 'Processing', location: 'Warehouse', timestamp: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000) },
            { status: 'Shipped', location: 'Mumbai Hub', timestamp: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000) },
          ],
        },
      },
      {
        user: demoUser._id,
        items: [
          { product: products[13]._id, name: products[13].name, price: products[13].price, quantity: 1, image: products[13].images[0] },
        ],
        shippingAddress: { street: '456 Main Road', city: 'Bangalore', state: 'Karnataka', zipCode: '560001', country: 'India', phone: '9876543211' },
        billingAddress: { street: '456 Main Road', city: 'Bangalore', state: 'Karnataka', zipCode: '560001', country: 'India', phone: '9876543211' },
        paymentMethod: 'COD',
        paymentStatus: 'Pending',
        orderStatus: 'Processing',
        subtotal: 8995,
        tax: 1619.1,
        shippingCharges: 0,
        discount: 0,
        totalAmount: 10614.1,
      },
    ];

    const orders = await Order.insertMany(ordersData);
    console.log(`✓ ${orders.length} sample orders created`);

    // ── Summary ────────────────────────────────────────────────────────────────
    console.log('\n═══════════════════════════════════════');
    console.log('  DATABASE SEEDED SUCCESSFULLY');
    console.log('═══════════════════════════════════════');
    console.log(`  Categories: ${categories.length}`);
    console.log(`  Products:   ${products.length}`);
    console.log(`  Users:      2 (admin + demo)`);
    console.log(`  Coupons:    ${coupons.length}`);
    console.log(`  Reviews:    ${reviews.length}`);
    console.log(`  Orders:     ${orders.length}`);
    console.log('───────────────────────────────────────');
    console.log('  Admin login:  admin@shop.com / admin123');
    console.log('  User login:   user@shop.com / user123');
    console.log('═══════════════════════════════════════\n');

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seed();

