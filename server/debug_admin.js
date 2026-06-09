require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function debug() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const user = await User.findOne({ email: 'admin@shopsmartai.com' }).select('+password');
    if (!user) {
      console.log('User not found in DB!');
      return;
    }
    console.log('User found in DB:', user.email);
    console.log('Hashed Password:', user.password);
    
    const isMatch = await user.comparePassword('password123');
    console.log('Does password123 match?', isMatch);
  } catch (e) {
    console.error(e);
  } finally {
    mongoose.connection.close();
  }
}
debug();
