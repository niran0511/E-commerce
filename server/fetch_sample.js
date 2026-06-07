const mongoose = require('mongoose');
const Product = require('./models/Product');
require('./models/Category'); // Load Category schema
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    const product = await Product.findOne().populate('category');
    console.log(JSON.stringify(product, null, 2));
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
