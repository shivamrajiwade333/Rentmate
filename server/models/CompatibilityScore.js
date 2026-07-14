const mongoose = require('mongoose');

const compatibilityScoreSchema = new mongoose.Schema(
  {
    tenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Listing',
      required: true,
    },
    score: {
      type: Number,
      min: 0,
      max: 100,
      required: true,
    },
    explanation: {
      type: String,
      required: true,
    },
    breakdown: {
      locationScore: Number,
      budgetScore: Number,
      moveInScore: Number,
      roomTypeScore: Number,
      furnishingScore: Number,
      lifestyleScore: Number,
    },
    method: {
      type: String,
      enum: ['llm', 'rule-based'],
      required: true,
    },
    promptVersion: {
      type: String,
    },
    tenantProfileVersion: {
      type: Date,
      required: true, // stores the updatedAt of the tenant profile
    },
    listingVersion: {
      type: Date,
      required: true, // stores the updatedAt of the listing
    },
    rawProviderResponse: {
      type: mongoose.Schema.Types.Mixed, // optional for debugging, avoid secrets
    },
    calculatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure uniqueness per tenant-listing pair
compatibilityScoreSchema.index({ tenant: 1, listing: 1 }, { unique: true });

const CompatibilityScore = mongoose.model('CompatibilityScore', compatibilityScoreSchema);

module.exports = CompatibilityScore;
