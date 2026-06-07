const mongoose = require('mongoose');
const Product = require('./models/Product');
const Category = require('./models/Category');
require('dotenv').config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    
    // Find Electronics category or create it
    let category = await Category.findOne({ name: 'Electronics' });
    if (!category) {
      category = await Category.create({ name: 'Electronics', slug: 'electronics', description: 'Electronics' });
    }

    // Delete existing IQOO if any
    await Product.deleteMany({ name: { $regex: /IQOO Neo 7/i } });

    // Create the IQOO Neo 7 5G
    const iqoo = new Product({
      name: "IQOO Neo 7 5G",
      description: "Experience the ultimate speed and power with the IQOO Neo 7 5G. Featuring a stunning 6.78-inch display, a massive 5000mAh battery, and a pro-grade 64MP DSLR-like camera.",
      price: 38990,
      mrp: 49348,
      discount: 21,
      brand: "IQOO",
      category: category._id,
      images: [
        "https://images.unsplash.com/photo-1598327105666-5b89351cb315?auto=format&fit=crop&q=80&w=1000", // Placeholder for front
        "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=1000", // Placeholder for back
      ],
      highlights: [
        "12 GB RAM | 256 GB ROM | Store upto 6000 photos",
        "3.1 GHz Clock Speed | Superfast Multitasking. Extensive Gaming",
        "64MP Rear Camera | DSLR Like Pictures & Great Zoom",
        "6.78 inch | Immersive Display. Enhanced Viewing Experience",
        "5000 mAh Battery | Charging that can last up to 2 days"
      ],
      warranty: "12 Months domestic warranty",
      variants: [
        {
          color: "Frost Blue",
          colorHex: "#a0b6d4",
          imageIndex: 0,
          memory: "128 GB + 8 GB",
          price: 34990,
          mrp: 44990,
          stock: 0
        },
        {
          color: "Frost Blue",
          colorHex: "#a0b6d4",
          imageIndex: 0,
          memory: "256 GB + 12 GB",
          price: 38990,
          mrp: 49348,
          stock: 1
        },
        {
          color: "Interstellar Black",
          colorHex: "#222222",
          imageIndex: 1,
          memory: "256 GB + 12 GB",
          price: 38990,
          mrp: 49348,
          stock: 15
        }
      ],
      stock: 16,
      detailedSpecs: [
        {
          group: "General",
          attributes: [
            { key: "Brand", value: "IQOO" },
            { key: "In The Box", value: "Cell phone, Charger, USB cable, Earphone jack adapter, Eject tool, Quick start guide, Warranty card, Phone case." },
            { key: "Model Number", value: "I2214" },
            { key: "Model Name", value: "Neo 7 5G" },
            { key: "Color", value: "Frost Blue" },
            { key: "Browse Type", value: "Smartphones" },
            { key: "SIM Type", value: "Dual Sim" },
            { key: "Hybrid Sim Slot", value: "No" },
            { key: "Touchscreen", value: "Yes" },
            { key: "OTG Compatible", value: "Yes" }
          ]
        },
        {
          group: "Display Features",
          attributes: [
            { key: "Display Size", value: "17.22 cm (6.78 inch)" },
            { key: "Resolution", value: "2400 x 1080" }
          ]
        },
        {
          group: "OS & Processor Features",
          attributes: [
            { key: "Operating System", value: "Android 13" },
            { key: "Processor Brand", value: "Mediatek" },
            { key: "Processor Core", value: "Octa Core" },
            { key: "Primary Clock Speed", value: "3.1 GHz" }
          ]
        },
        {
          group: "Memory & Storage Features",
          attributes: [
            { key: "Internal Storage", value: "256 GB" },
            { key: "RAM", value: "12 GB" }
          ]
        },
        {
          group: "Camera Features",
          attributes: [
            { key: "Primary Camera", value: "64MP Rear Camera" },
            { key: "Dual Camera Lens", value: "Primary Camera" }
          ]
        },
        {
          group: "Connectivity Features",
          attributes: [
            { key: "Network Type", value: "5G, 4G VOLTE" },
            { key: "Supported Networks", value: "5G, 4G LTE" }
          ]
        }
      ]
    });

    await iqoo.save();
    console.log("IQOO Neo 7 5G has been seeded to DB!");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedData();
