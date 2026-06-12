const mongoose = require('mongoose');
const config = require('./config/config');
const Product = require('./models/Product');

async function test() {
  await mongoose.connect(config.mongoUri);
  console.log('Connected to DB');
  
  const products = await Product.find().limit(3);
  const productIds = products.map(p => p._id.toString());
  console.log('Testing with IDs:', productIds);

  try {
    await Product.updateMany({}, { $set: { isHero: false } });
    const res = await Product.updateMany(
      { _id: { $in: productIds } },
      { $set: { isHero: true } }
    );
    console.log('Update result:', res);
  } catch (err) {
    console.error('Error:', err);
  }
  
  mongoose.disconnect();
}
test();
