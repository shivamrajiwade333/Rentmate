const { getCompatibility } = require('../services/compatibility');

// @desc    Get compatibility score for a listing
// @route   GET /api/compatibility/listing/:listingId
// @access  Private (Tenant)
exports.getListingCompatibility = async (req, res, next) => {
  try {
    const score = await getCompatibility(req.user.id, req.params.listingId, false);
    
    res.status(200).json({
      success: true,
      data: score
    });
  } catch (error) {
    if (error.message.includes('Tenant profile must be completed')) {
      return res.status(400).json({ success: false, message: error.message });
    }
    next(error);
  }
};

// @desc    Recalculate compatibility score for a listing
// @route   POST /api/compatibility/listing/:listingId/recalculate
// @access  Private (Tenant)
exports.recalculateListingCompatibility = async (req, res, next) => {
  try {
    const score = await getCompatibility(req.user.id, req.params.listingId, true);
    
    res.status(200).json({
      success: true,
      data: score
    });
  } catch (error) {
    if (error.message.includes('Tenant profile must be completed')) {
      return res.status(400).json({ success: false, message: error.message });
    }
    next(error);
  }
};
