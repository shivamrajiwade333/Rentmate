
const axios = require('axios');
const test = async () => {
  try {
    const resReg = await axios.post('http://localhost:5000/api/auth/register', {
      name: 'Test Owner',
      email: 'testowner123456@example.com',
      password: 'password123',
      role: 'owner'
    });
    const token = resReg.data.token;
    
    const payload = {
        title: 'Test Listing',
        description: 'Test Description',
        location: {
          locality: 'Test Locality',
          address: 'Test Locality, Test City',
          city: 'Pune',
          state: 'Maharashtra'
        },
        rent: 25000,
        deposit: 75000,
        maintenance: 2000,
        availableFrom: new Date(),
        roomType: 'entire-place',
        furnishingStatus: 'furnished',
        bhk: 1,
        bathrooms: 1,
        balconies: 0,
        areaSqft: 1200,
        floorNumber: 4,
        totalFloors: 10,
        propertyAge: 'New',
        waterSupply: '24/7 Corporation',
        parking: 'None',
        nonVegAllowed: true,
        amenities: [],
        photos: [{ url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&auto=format&fit=crop&q=60', publicId: 'demo_photo' }],
        videos: []
      };
      
    const resListing = await axios.post('http://localhost:5000/api/listings', payload, {
      headers: { Authorization: 'Bearer ' + token }
    });
    console.log('Success:', resListing.data);
  } catch (err) {
    console.error('Error:', err.response ? err.response.data : err.message);
  }
}
test();
