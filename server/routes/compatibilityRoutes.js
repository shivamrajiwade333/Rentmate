const express = require('express');
const { getListingCompatibility, recalculateListingCompatibility } = require('../controllers/compatibilityController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.use(authorize('tenant'));

router.get('/listing/:listingId', getListingCompatibility);
router.post('/listing/:listingId/recalculate', recalculateListingCompatibility);

module.exports = router;
