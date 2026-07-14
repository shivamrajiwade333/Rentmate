const mongoose = require('mongoose');

const tenantProfileSchema = new mongoose.Schema(
  {
    tenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    preferredLocations: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ['looking-for-room', 'have-flat-need-flatmate'],
      default: 'looking-for-room'
    },
    minBudget: {
      type: Number,
      min: 0,
    },
    maxBudget: {
      type: Number,
      min: 0,
    },
    moveInDate: {
      type: Date,
    },
    preferredRoomTypes: {
      type: [String],
      enum: ['private', 'shared', 'entire-place', 'pg'],
      default: [],
    },
    furnishingPreference: {
      type: String,
      enum: ['any', 'furnished', 'semi-furnished', 'unfurnished'],
      default: 'any',
    },
    bio: {
      type: String,
      trim: true,
      maxLength: 500,
    },
    age: {
      type: Number,
      min: 16,
      max: 100,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other', 'any'],
      default: 'any',
    },
    interests: {
      type: [String],
      default: [],
    },
    languages: {
      type: [String],
      default: [],
    },
    guestPolicy: {
      type: String,
      enum: ['any', 'strict', 'moderate', 'relaxed'],
      default: 'any',
    },
    leaseDuration: {
      type: String,
      enum: ['any', 'short-term', 'long-term', 'month-to-month'],
      default: 'any',
    },
    savedProfiles: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TenantProfile'
    }],
    lifestyle: {
      occupation: {
        type: String,
        enum: ['student', 'working-professional', 'other'],
      },
      smokingPreference: {
        type: String,
        enum: ['any', 'non-smoking', 'smoking'],
        default: 'any',
      },
      foodPreference: {
        type: String,
        enum: ['any', 'veg', 'non-veg', 'vegan'],
        default: 'any',
      },
      petsPreference: {
        type: String,
        enum: ['any', 'no-pets', 'pets-allowed'],
        default: 'any',
      },
      cleanlinessLevel: {
        type: String,
        enum: ['any', 'strict', 'moderate', 'relaxed'],
        default: 'any',
      },
      sleepSchedule: {
        type: String,
        enum: ['any', 'early-bird', 'night-owl'],
        default: 'any',
      },
    },
    profileCompleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Add index
tenantProfileSchema.index({ tenant: 1 });

const TenantProfile = mongoose.model('TenantProfile', tenantProfileSchema);

module.exports = TenantProfile;
