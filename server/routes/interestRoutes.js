const express = require('express');
const {
  createInterest,
  getMyInterests,
  getReceivedInterests,
  withdrawInterest,
  acceptInterest,
  declineInterest
} = require('../controllers/interestController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

// Tenant routes
router.post('/', authorize('tenant'), createInterest);
router.get('/mine', authorize('tenant'), getMyInterests);
router.patch('/:id/withdraw', authorize('tenant'), withdrawInterest);

// Owner routes
router.get('/received', authorize('owner'), getReceivedInterests);
router.patch('/:id/accept', authorize('owner'), acceptInterest);
router.patch('/:id/decline', authorize('owner'), declineInterest);

module.exports = router;
