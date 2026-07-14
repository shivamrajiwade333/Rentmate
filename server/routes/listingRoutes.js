const express = require('express');
const {
  createListing,
  getMyListings,
  getListings,
  getListing,
  updateListing,
  updateListingStatus,
  deleteListing
} = require('../controllers/listingController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
  .get(getListings)
  .post(protect, authorize('owner'), createListing);

router.route('/mine')
  .get(protect, authorize('owner'), getMyListings);

router.route('/:id')
  .get(getListing)
  .patch(protect, authorize('owner'), updateListing)
  .delete(protect, authorize('owner'), deleteListing);

router.route('/:id/status')
  .patch(protect, authorize('owner'), updateListingStatus);

module.exports = router;
