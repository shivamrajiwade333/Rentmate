const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

const connectDatabase = async () => {
  try {
    const connection = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected: ${connection.connection.host}`);
  } catch (error) {
    console.log("Real MongoDB connection failed. Falling back to In-Memory Database for Hackathon...");
    const mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
    console.log(`In-Memory MongoDB connected at ${uri}`);

    try {
      const seedData = require('../utils/seed');
      await seedData.seedMemoryDB();
    } catch (e) {
      console.log('Error seeding memory DB:', e);
    }
  }
};

module.exports = connectDatabase;