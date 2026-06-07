const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');

dotenv.config();

const shuffleDates = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected. Shuffling products to fix pagination clustering...');

    const products = await Product.find({}, { _id: 1 });
    console.log(`Found ${products.length} products. Updating...`);

    // Bulk operation for performance
    const bulkOps = products.map((p) => {
      // Generate a random date within the last 30 days
      const randomOffset = Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000);
      const randomDate = new Date(Date.now() - randomOffset);

      return {
        updateOne: {
          filter: { _id: p._id },
          update: { $set: { createdAt: randomDate } },
        },
      };
    });

    const BATCH_SIZE = 1000;
    for (let i = 0; i < bulkOps.length; i += BATCH_SIZE) {
      const batch = bulkOps.slice(i, i + BATCH_SIZE);
      await Product.bulkWrite(batch);
      console.log(`Shuffled batch ${Math.floor(i / BATCH_SIZE) + 1} of ${Math.ceil(bulkOps.length / BATCH_SIZE)}...`);
    }

    console.log('✅ All products have been shuffled successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shuffling: ', error);
    process.exit(1);
  }
};

shuffleDates();
