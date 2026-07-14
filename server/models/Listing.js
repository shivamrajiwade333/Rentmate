const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    location: {
      city: { type: String, required: true },
      locality: { type: String, required: true },
      address: { type: String, required: true },
      latitude: { type: Number },
      longitude: { type: Number },
    },
    normalizedLocation: {
      type: String,
      required: true,
    },
    rent: {
      type: Number,
      required: true,
      min: 0,
    },
    deposit: {
      type: Number,
      min: 0,
    },
    maintenance: {
      type: Number,
      default: 0,
    },
    availableFrom: {
      type: Date,
      required: true,
    },
    roomType: {
      type: String,
      enum: ['private', 'shared', 'entire-place', 'pg'],
      required: true,
    },
    furnishingStatus: {
      type: String,
      enum: ['furnished', 'semi-furnished', 'unfurnished'],
      required: true,
    },
    bhk: { type: Number },
    bathrooms: { type: Number },
    balconies: { type: Number },
    areaSqft: { type: Number },
    floorNumber: { type: Number },
    totalFloors: { type: Number },
    propertyAge: { type: String },
    waterSupply: { type: String },
    parking: { type: String },
    nonVegAllowed: { type: Boolean, default: true },
    amenities: {
      type: [String],
      default: [],
    },
    preferredTenantType: {
      type: String,
      enum: ['any', 'student', 'working-professional', 'family'],
      default: 'any',
    },
    photos: [
      {
        url: { type: String, required: true },
        publicId: { type: String, required: true },
      },
    ],
    videos: [
      {
        url: { type: String, required: true },
        publicId: { type: String, required: false },
      },
    ],
    status: {
      type: String,
      enum: ['active', 'filled', 'hidden'],
      default: 'active',
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
listingSchema.index({ owner: 1 });
listingSchema.index({ status: 1 });
listingSchema.index({ rent: 1 });
listingSchema.index({ normalizedLocation: 1 });
listingSchema.index({ 'location.city': 1, 'location.locality': 1 });

const Listing = mongoose.model('Listing', listingSchema);

module.exports = Listing;
