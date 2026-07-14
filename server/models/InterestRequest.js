const mongoose = require('mongoose');

const interestRequestSchema = new mongoose.Schema(
  {
    tenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Listing',
      required: true,
    },
    compatibilityScore: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CompatibilityScore',
    },
    scoreSnapshot: {
      type: Number,
    },
    explanationSnapshot: {
      type: String,
    },
    message: {
      type: String,
      trim: true,
      maxLength: 500,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined', 'withdrawn'],
      default: 'pending',
    },
    respondedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate pending/accepted requests for the same tenant-listing pair
interestRequestSchema.index({ tenant: 1, listing: 1 });

const InterestRequest = mongoose.model('InterestRequest', interestRequestSchema);

module.exports = InterestRequest;
