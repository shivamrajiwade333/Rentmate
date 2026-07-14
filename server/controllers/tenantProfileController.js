const TenantProfile = require('../models/TenantProfile');

// @desc    Get current tenant profile
// @route   GET /api/tenant-profile/me
// @access  Private (Tenant)
exports.getMe = async (req, res, next) => {
  try {
    const profile = await TenantProfile.findOne({ tenant: req.user.id });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Tenant profile not found'
      });
    }

    res.status(200).json({
      success: true,
      data: profile
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create or Update tenant profile
// @route   PUT /api/tenant-profile/me
// @access  Private (Tenant)
exports.upsertMe = async (req, res, next) => {
  try {
    const {
      preferredLocations, minBudget, maxBudget, moveInDate, preferredRoomTypes,
      furnishingPreference, bio, lifestyle, age, gender, interests, 
      languages, guestPolicy, leaseDuration
    } = req.body;

    if (minBudget !== undefined && maxBudget !== undefined && minBudget > maxBudget) {
      return res.status(400).json({ success: false, message: 'minBudget cannot be greater than maxBudget' });
    }

    let profile = await TenantProfile.findOne({ tenant: req.user.id });

    if (profile) {
      profile.preferredLocations = preferredLocations || profile.preferredLocations;
      profile.minBudget = minBudget !== undefined ? minBudget : profile.minBudget;
      profile.maxBudget = maxBudget !== undefined ? maxBudget : profile.maxBudget;
      profile.moveInDate = moveInDate || profile.moveInDate;
      profile.preferredRoomTypes = preferredRoomTypes || profile.preferredRoomTypes;
      profile.furnishingPreference = furnishingPreference || profile.furnishingPreference;
      profile.bio = bio || profile.bio;
      profile.age = age || profile.age;
      profile.gender = gender || profile.gender;
      profile.interests = interests || profile.interests;
      profile.languages = languages || profile.languages;
      profile.guestPolicy = guestPolicy || profile.guestPolicy;
      profile.leaseDuration = leaseDuration || profile.leaseDuration;
      
      if (lifestyle) {
        profile.lifestyle = { ...profile.lifestyle, ...lifestyle };
      }

      profile.profileCompleted = !!(profile.preferredLocations.length && profile.minBudget && profile.maxBudget && profile.moveInDate);
      await profile.save();
    } else {
      profile = await TenantProfile.create({
        tenant: req.user.id,
        preferredLocations: preferredLocations || [],
        minBudget, maxBudget, moveInDate,
        preferredRoomTypes: preferredRoomTypes || [],
        furnishingPreference: furnishingPreference || 'any',
        bio: bio || '',
        age, gender, interests: interests || [], languages: languages || [],
        guestPolicy: guestPolicy || 'any', leaseDuration: leaseDuration || 'any',
        lifestyle: lifestyle || {},
        profileCompleted: !!(preferredLocations?.length && minBudget && maxBudget && moveInDate)
      });
    }

    res.status(200).json({ success: true, data: profile });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all public tenant profiles
// @route   GET /api/tenant-profile/public
// @access  Public / Private
exports.getAllProfiles = async (req, res, next) => {
  try {
    const {
      city, minBudget, maxBudget, gender, roomType, occupation, smokingPreference, petsPreference, page = 1, limit = 12
    } = req.query;

    let query = { profileCompleted: true };

    if (city) {
      query.preferredLocations = { $regex: city, $options: 'i' };
    }
    if (minBudget || maxBudget) {
      query.maxBudget = {};
      if (minBudget) query.maxBudget.$gte = Number(minBudget);
    }
    if (gender && gender !== 'any') query.gender = gender;
    if (roomType && roomType !== 'any') query.preferredRoomTypes = roomType;
    if (occupation && occupation !== 'any') query['lifestyle.occupation'] = occupation;
    if (smokingPreference && smokingPreference !== 'any') query['lifestyle.smokingPreference'] = smokingPreference;
    if (petsPreference && petsPreference !== 'any') query['lifestyle.petsPreference'] = petsPreference;

    // Don't show current user's profile in the search
    if (req.user) {
      query.tenant = { $ne: req.user.id };
    }

    const skip = (Number(page) - 1) * Number(limit);
    
    const profiles = await TenantProfile.find(query)
      .populate('tenant', 'name profileImage isVerified createdAt')
      .sort('-createdAt')
      .skip(skip)
      .limit(Number(limit));

    const total = await TenantProfile.countDocuments(query);

    res.status(200).json({
      success: true,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      total,
      data: profiles
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single tenant profile by ID
// @route   GET /api/tenant-profile/public/:id
// @access  Public / Private
exports.getProfileById = async (req, res, next) => {
  try {
    const profile = await TenantProfile.findById(req.params.id)
      .populate('tenant', 'name profileImage isVerified createdAt');

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    res.status(200).json({ success: true, data: profile });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle save profile
// @route   POST /api/tenant-profile/save/:id
// @access  Private (Tenant)
exports.toggleSaveProfile = async (req, res, next) => {
  try {
    const profileToSaveId = req.params.id;
    const myProfile = await TenantProfile.findOne({ tenant: req.user.id });

    if (!myProfile) {
      return res.status(404).json({ success: false, message: 'Your tenant profile not found' });
    }

    const index = myProfile.savedProfiles.indexOf(profileToSaveId);
    if (index === -1) {
      myProfile.savedProfiles.push(profileToSaveId);
    } else {
      myProfile.savedProfiles.splice(index, 1);
    }

    await myProfile.save();
    res.status(200).json({ success: true, savedProfiles: myProfile.savedProfiles });
  } catch (error) {
    next(error);
  }
};
