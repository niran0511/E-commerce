const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');

dotenv.config();

const removeDuplicates = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected. Removing duplicate variants...');

    // Delete all products where the name contains " - Model V"
    const result = await Product.deleteMany({ name: { $regex: / - Model V/ } });
    
    console.log(`✅ Successfully deleted ${result.deletedCount} duplicate variants.`);
    
    const remaining = await Product.countDocuments();
    console.log(`🛒 You now have ${remaining} unique, high-quality products in your store.`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during deletion: ', error);
    process.exit(1);
  }
};

removeDuplicates();
