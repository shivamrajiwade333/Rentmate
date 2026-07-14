const InterestRequest = require('../models/InterestRequest');
const Listing = require('../models/Listing');
const CompatibilityScore = require('../models/CompatibilityScore');
const Notification = require('../models/Notification');
const User = require('../models/User');
const Conversation = require('../models/Conversation');
const { getCompatibility } = require('../services/compatibility');
const { sendEmail } = require('../services/email');

// @desc    Express interest in a listing
// @route   POST /api/interests
// @access  Private (Tenant)
exports.createInterest = async (req, res, next) => {
  try {
    const { listingId, message } = req.body;
    const tenantId = req.user.id;

    const listing = await Listing.findById(listingId);
    if (!listing || listing.status !== 'active') {
      return res.status(404).json({ success: false, message: 'Active listing not found' });
    }

    if (listing.owner.toString() === tenantId) {
      return res.status(400).json({ success: false, message: 'Cannot express interest in your own listing' });
    }

    // Check duplicate
    const existing = await InterestRequest.findOne({
      tenant: tenantId,
      listing: listingId,
      status: { $in: ['pending', 'accepted'] }
    });

    if (existing) {
      return res.status(400).json({ success: false, message: 'You already have an active request for this listing' });
    }

    // Get compatibility score
    const scoreDoc = await getCompatibility(tenantId, listingId);

    const interest = await InterestRequest.create({
      tenant: tenantId,
      owner: listing.owner,
      listing: listingId,
      compatibilityScore: scoreDoc._id,
      scoreSnapshot: scoreDoc.score,
      explanationSnapshot: scoreDoc.explanation,
      message
    });

    // Notify owner if high match
    const threshold = parseInt(process.env.COMPATIBILITY_HIGH_MATCH_THRESHOLD) || 80;
    
    // Always notify in-app
    await Notification.create({
      user: listing.owner,
      type: 'high_match_interest',
      title: 'New Interest Request',
      message: `A tenant with a ${scoreDoc.score}% compatibility score is interested in your listing: ${listing.title}`,
      relatedListing: listingId,
      relatedInterest: interest._id
    });

    if (scoreDoc.score >= threshold) {
      const owner = await User.findById(listing.owner);
      const tenant = await User.findById(tenantId);
      
      await sendEmail({
        to: owner.email,
        subject: 'High Compatibility Match - RentMate',
        text: `Hello ${owner.name},\n\nA tenant (${tenant.name}) with a ${scoreDoc.score}% compatibility score has expressed interest in your listing "${listing.title}".\n\nLogin to RentMate to review the request.`
      });
    }

    res.status(201).json({
      success: true,
      data: interest
    });
  } catch (error) {
    if (error.message.includes('Tenant profile must be completed')) {
      return res.status(400).json({ success: false, message: error.message });
    }
    next(error);
  }
};

// @desc    Get tenant's interest requests
// @route   GET /api/interests/mine
// @access  Private (Tenant)
exports.getMyInterests = async (req, res, next) => {
  try {
    const interests = await InterestRequest.find({ tenant: req.user.id })
      .populate('listing', 'title location rent status photos')
      .sort('-createdAt');

    res.status(200).json({ success: true, count: interests.length, data: interests });
  } catch (error) {
    next(error);
  }
};

// @desc    Get owner's received interests
// @route   GET /api/interests/received
// @access  Private (Owner)
exports.getReceivedInterests = async (req, res, next) => {
  try {
    const interests = await InterestRequest.find({ owner: req.user.id })
      .populate('listing', 'title')
      .populate('tenant', 'name profileImage email phone')
      .sort('-createdAt');

    res.status(200).json({ success: true, count: interests.length, data: interests });
  } catch (error) {
    next(error);
  }
};

// @desc    Withdraw a pending request
// @route   PATCH /api/interests/:id/withdraw
// @access  Private (Tenant)
exports.withdrawInterest = async (req, res, next) => {
  try {
    const interest = await InterestRequest.findById(req.params.id);

    if (!interest || interest.tenant.toString() !== req.user.id) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    if (interest.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Can only withdraw pending requests' });
    }

    interest.status = 'withdrawn';
    await interest.save();

    res.status(200).json({ success: true, data: interest });
  } catch (error) {
    next(error);
  }
};

// @desc    Accept interest request
// @route   PATCH /api/interests/:id/accept
// @access  Private (Owner)
exports.acceptInterest = async (req, res, next) => {
  try {
    const interest = await InterestRequest.findById(req.params.id).populate('listing');

    if (!interest || interest.owner.toString() !== req.user.id) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    if (interest.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Request is not pending' });
    }

    interest.status = 'accepted';
    interest.respondedAt = new Date();
    await interest.save();

    // Create or find conversation
    let conversation = await Conversation.findOne({ interestRequest: interest._id });
    if (!conversation) {
      conversation = await Conversation.create({
        interestRequest: interest._id,
        listing: interest.listing._id,
        participants: [interest.tenant, interest.owner]
      });
    }

    // Notify tenant
    const tenant = await User.findById(interest.tenant);
    
    await Notification.create({
      user: interest.tenant,
      type: 'interest_accepted',
      title: 'Interest Accepted!',
      message: `Your interest in "${interest.listing.title}" was accepted. You can now chat with the owner.`,
      relatedListing: interest.listing._id,
      relatedInterest: interest._id
    });

    await sendEmail({
      to: tenant.email,
      subject: 'Interest Request Accepted - RentMate',
      text: `Great news! Your request for "${interest.listing.title}" has been accepted. Log in to chat with the owner.`
    });

    res.status(200).json({ success: true, data: interest, conversationId: conversation._id });
  } catch (error) {
    next(error);
  }
};

// @desc    Decline interest request
// @route   PATCH /api/interests/:id/decline
// @access  Private (Owner)
exports.declineInterest = async (req, res, next) => {
  try {
    const interest = await InterestRequest.findById(req.params.id).populate('listing');

    if (!interest || interest.owner.toString() !== req.user.id) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    if (interest.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Request is not pending' });
    }

    interest.status = 'declined';
    interest.respondedAt = new Date();
    await interest.save();

    // Notify tenant
    const tenant = await User.findById(interest.tenant);
    
    await Notification.create({
      user: interest.tenant,
      type: 'interest_declined',
      title: 'Interest Declined',
      message: `Your interest in "${interest.listing.title}" was declined.`,
      relatedListing: interest.listing._id,
      relatedInterest: interest._id
    });

    await sendEmail({
      to: tenant.email,
      subject: 'Interest Request Update - RentMate',
      text: `Your request for "${interest.listing.title}" has been declined by the owner.`
    });

    res.status(200).json({ success: true, data: interest });
  } catch (error) {
    next(error);
  }
};
