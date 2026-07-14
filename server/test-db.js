const mongoose = require('mongoose');
require('dotenv').config();
const Listing = require('./models/Listing');

const test = async () => {
  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected successfully!');
    
    // Create a mock listing
    console.log('Creating a test listing...');
    const newListing = await Listing.create({
      title: 'AI Automated Test Property',
      description: 'This is a test property created by the AI assistant to verify MongoDB Atlas connection.',
      location: { city: 'Pune', locality: 'Test Area', address: '123 Test St', coordinates: [73.8567, 18.5204] },
      rent: 15000,
      securityDeposit: 45000,
      bhk: 2,
      roomType: 'entire-place',
      furnishingStatus: 'semi-furnished',
      propertyType: 'apartment',
      areaSqft: 1000,
      floorNumber: 2,
      totalFloors: 5,
      waterSupply: '24/7 Corporation',
      nonVegAllowed: true,
      photos: [{ url: 'https://via.placeholder.com/150' }],
      status: 'active',
      owner: new mongoose.Types.ObjectId() // Fake owner ID
    });
    
    console.log('✅ Listing successfully saved directly to your MongoDB Atlas Cloud database!');
    console.log('Listing Title:', newListing.title);
    
    // Cleanup
    console.log('Cleaning up test data...');
    await Listing.findByIdAndDelete(newListing._id);
    console.log('✅ Cleanup complete. System is 100% operational.');
    
    process.exit(0);
  } catch (err) {
    console.error('❌ ERROR:', err.message);
    process.exit(1);
  }
};

test();
