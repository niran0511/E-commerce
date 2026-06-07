require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    const email = 'admin@shopsmartai.com';
    let user = await User.findOne({ email });

    if (!user) {
      user = new User({
        name: 'Admin User',
        email: email,
        password: 'password123',
        role: 'admin'
      });
      await user.save();
      console.log('Created new Admin user:', email);
    } else {
      user.role = 'admin';
      await user.save();
      console.log('Updated existing user to Admin:', email);
    }

  } catch (e) {
    console.error(e);
  } finally {
    mongoose.connection.close();
  }
}
createAdmin();
