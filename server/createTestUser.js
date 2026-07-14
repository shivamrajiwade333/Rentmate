const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  try {
    const existing = await User.findOne({ email: 'test@example.com' });
    if (!existing) {
      await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'tenant',
        phone: '1234567890'
      });
      console.log('Created test user: test@example.com / password123');
    } else {
      console.log('Test user already exists: test@example.com / password123');
    }
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
});
