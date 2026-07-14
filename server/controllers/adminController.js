const User = require('../models/User');
const Listing = require('../models/Listing');
const InterestRequest = require('../models/InterestRequest');
const Message = require('../models/Message');
const CompatibilityScore = require('../models/CompatibilityScore');
const ActivityLog = require('../models/ActivityLog');

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private (Admin)
exports.getDashboardStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalTenants = await User.countDocuments({ role: 'tenant' });
    const totalOwners = await User.countDocuments({ role: 'owner' });

    const activeListings = await Listing.countDocuments({ status: 'active' });
    const filledListings = await Listing.countDocuments({ status: 'filled' });

    const pendingInterests = await InterestRequest.countDocuments({ status: 'pending' });
    const acceptedInterests = await InterestRequest.countDocuments({ status: 'accepted' });

    const messagesCount = await Message.countDocuments();

    const llmScores = await CompatibilityScore.countDocuments({ method: 'llm' });
    const fallbackScores = await CompatibilityScore.countDocuments({ method: 'rule-based' });

    res.status(200).json({
      success: true,
      data: {
        users: { total: totalUsers, tenants: totalTenants, owners: totalOwners },
        listings: { active: activeListings, filled: filledListings },
        interests: { pending: pendingInterests, accepted: acceptedInterests },
        messagesCount,
        compatibilityScores: { llm: llmScores, fallback: fallbackScores }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users (paginated)
// @route   GET /api/admin/users
// @access  Private (Admin)
exports.getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    let query = {};
    if (search) {
      query = { $or: [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }] };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const users = await User.find(query)
      .select('-password')
      .sort('-createdAt')
      .skip(skip)
      .limit(Number(limit));

    const total = await User.countDocuments(query);

    res.status(200).json({ success: true, page: Number(page), total, data: users });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user status
// @route   PATCH /api/admin/users/:id/status
// @access  Private (Admin)
exports.updateUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.isActive = req.body.isActive;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.status(200).json({ success: true, message: 'User deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all listings (paginated)
// @route   GET /api/admin/listings
// @access  Private (Admin)
exports.getListings = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    let query = {};
    if (status) query.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const listings = await Listing.find(query)
      .populate('owner', 'name email')
      .sort('-createdAt')
      .skip(skip)
      .limit(Number(limit));
    const total = await Listing.countDocuments(query);

    res.status(200).json({ success: true, page: Number(page), total, data: listings });
  } catch (error) {
    next(error);
  }
};

// @desc    Update listing status
// @route   PATCH /api/admin/listings/:id/status
// @access  Private (Admin)
exports.updateListingStatus = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ success: false, message: 'Listing not found' });

    listing.status = req.body.status;
    await listing.save();
    res.status(200).json({ success: true, data: listing });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete listing
// @route   DELETE /api/admin/listings/:id
// @access  Private (Admin)
exports.deleteListing = async (req, res, next) => {
  try {
    const listing = await Listing.findByIdAndDelete(req.params.id);
    if (!listing) return res.status(404).json({ success: false, message: 'Listing not found' });
    res.status(200).json({ success: true, message: 'Listing deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get interest requests
// @route   GET /api/admin/interests
// @access  Private (Admin)
exports.getInterests = async (req, res, next) => {
  try {
    const interests = await InterestRequest.find()
      .populate('tenant', 'name email')
      .populate('owner', 'name email')
      .populate('listing', 'title status')
      .sort('-createdAt')
      .limit(50);
    res.status(200).json({ success: true, count: interests.length, data: interests });
  } catch (error) {
    next(error);
  }
};

// @desc    Get activity logs
// @route   GET /api/admin/activity
// @access  Private (Admin)
exports.getActivityLogs = async (req, res, next) => {
  try {
    const logs = await ActivityLog.find()
      .populate('actor', 'name role')
      .sort('-createdAt')
      .limit(50);
    res.status(200).json({ success: true, count: logs.length, data: logs });
  } catch (error) {
    next(error);
  }
};
