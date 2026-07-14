const Listing = require('../models/Listing');
const { uploadImage } = require('../services/cloudinary/upload');

// @desc    Create a listing
// @route   POST /api/listings
// @access  Private (Owner)
exports.createListing = async (req, res, next) => {
  try {
    const {
      title,
      description,
      location,
      rent,
      deposit,
      maintenance,
      availableFrom,
      roomType,
      furnishingStatus,
      bhk,
      bathrooms,
      balconies,
      areaSqft,
      floorNumber,
      totalFloors,
      propertyAge,
      waterSupply,
      parking,
      nonVegAllowed,
      amenities,
      preferredTenantType,
      photos,
      videos
    } = req.body;

    const normalizedLocation = `${location.locality}, ${location.city}`.toLowerCase().replace(/\s+/g, ' ').trim();

    let uploadedPhotos = [];
    if (photos && Array.isArray(photos)) {
      for (const photoData of photos) {
        if (typeof photoData === 'string' && photoData.startsWith('data:')) {
          const result = await uploadImage(photoData);
          uploadedPhotos.push(result);
        } else if (photoData.url) {
          uploadedPhotos.push(photoData);
        }
      }
    }

    let uploadedVideos = [];
    if (videos && Array.isArray(videos)) {
      for (const videoData of videos) {
        if (typeof videoData === 'string' && videoData.startsWith('data:')) {
          const result = await uploadImage(videoData);
          uploadedVideos.push(result);
        } else if (videoData.url) {
          uploadedVideos.push(videoData);
        }
      }
    }

    const listing = await Listing.create({
      owner: req.user.id,
      title,
      description,
      location,
      normalizedLocation,
      rent,
      deposit,
      maintenance,
      availableFrom,
      roomType,
      furnishingStatus,
      bhk,
      bathrooms,
      balconies,
      areaSqft,
      floorNumber,
      totalFloors,
      propertyAge,
      waterSupply,
      parking,
      nonVegAllowed,
      amenities,
      preferredTenantType,
      photos: uploadedPhotos,
      videos: uploadedVideos
    });

    res.status(201).json({
      success: true,
      message: 'Listing created successfully',
      data: listing
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get owner's listings
// @route   GET /api/listings/mine
// @access  Private (Owner)
exports.getMyListings = async (req, res, next) => {
  try {
    const listings = await Listing.find({ owner: req.user.id }).sort('-createdAt');

    res.status(200).json({
      success: true,
      count: listings.length,
      data: listings
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all active listings with pagination and filters
// @route   GET /api/listings
// @access  Public / Private (Tenant)
exports.getListings = async (req, res, next) => {
  try {
    const {
      city,
      locality,
      minRent,
      maxRent,
      roomType,
      furnishingStatus,
      page = 1,
      limit = 10,
    } = req.query;

    let query = { status: 'active' };

    if (city) query['location.city'] = { $regex: city, $options: 'i' };
    if (locality) query['location.locality'] = { $regex: locality, $options: 'i' };
    
    if (minRent || maxRent) {
      query.rent = {};
      if (minRent) query.rent.$gte = Number(minRent);
      if (maxRent) query.rent.$lte = Number(maxRent);
    }

    if (roomType) {
      if (roomType.includes(',')) {
        query.roomType = { $in: roomType.split(',') };
      } else {
        query.roomType = roomType;
      }
    }
    if (furnishingStatus) query.furnishingStatus = furnishingStatus;

    const skip = (Number(page) - 1) * Number(limit);

    // Note: AI compatibility scoring integration will be done in Phase 5 here or via a separate wrapper
    
    const listings = await Listing.find(query)
      .sort('-createdAt')
      .skip(skip)
      .limit(Number(limit))
      .populate('owner', 'name profileImage');

    const total = await Listing.countDocuments(query);

    res.status(200).json({
      success: true,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      total,
      results: listings.map(l => ({ listing: l })) // Wrapped structure for future compatibility injection
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single listing
// @route   GET /api/listings/:id
// @access  Public
exports.getListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id).populate('owner', 'name profileImage');

    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }

    res.status(200).json({
      success: true,
      data: listing
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a listing
// @route   PATCH /api/listings/:id
// @access  Private (Owner)
exports.updateListing = async (req, res, next) => {
  try {
    let listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }

    if (listing.owner.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this listing' });
    }

    const { location, ...otherFields } = req.body;
    let updateData = { ...otherFields };
    
    if (location) {
      updateData.location = { ...listing.location, ...location };
      updateData.normalizedLocation = `${updateData.location.locality}, ${updateData.location.city}`.toLowerCase().replace(/\s+/g, ' ').trim();
    }

    listing = await Listing.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      message: 'Listing updated successfully',
      data: listing
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update listing status
// @route   PATCH /api/listings/:id/status
// @access  Private (Owner)
exports.updateListingStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!['active', 'filled', 'hidden'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    let listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }

    if (listing.owner.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this listing' });
    }

    listing.status = status;
    await listing.save();

    res.status(200).json({
      success: true,
      message: 'Listing status updated',
      data: listing
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a listing
// @route   DELETE /api/listings/:id
// @access  Private (Owner)
exports.deleteListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }

    if (listing.owner.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this listing' });
    }

    await listing.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Listing deleted'
    });
  } catch (error) {
    next(error);
  }
};
