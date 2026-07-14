const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const performSeed = async () => {
  await User.deleteMany({});
  const hashedPassword = await bcrypt.hash('password123', 10);
  const users = [
    { name: 'Admin User', email: 'admin@rentmate.com', password: hashedPassword, role: 'admin' },
    { name: 'Demo Owner', email: 'owner@rentmate.com', password: hashedPassword, role: 'owner' },
    { name: 'Demo Tenant', email: 'tenant@rentmate.com', password: hashedPassword, role: 'tenant' },
  ];
  await User.insertMany(users);
  console.log('Database Seeded Successfully');
};

const seedDatabase = async () => {
  try {
    dotenv.config({ path: '../.env' });
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/rentmate';
    await mongoose.connect(mongoUri);
    console.log('MongoDB Connected for Seeding');
    await performSeed();
    process.exit(0);
  } catch (error) {
    console.error('Seeding Error:', error);
    process.exit(1);
  }
};

const seedMemoryDB = async () => {
  console.log('Seeding memory DB...');
  await performSeed();
};

if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase, seedMemoryDB };
