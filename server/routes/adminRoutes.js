const express = require('express');
const {
  getDashboardStats,
  getUsers,
  updateUserStatus,
  deleteUser,
  getListings,
  updateListingStatus,
  deleteListing,
  getInterests,
  getActivityLogs
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.get('/dashboard', getDashboardStats);

router.route('/users')
  .get(getUsers);
router.route('/users/:id/status')
  .patch(updateUserStatus);
router.route('/users/:id')
  .delete(deleteUser);

router.route('/listings')
  .get(getListings);
router.route('/listings/:id/status')
  .patch(updateListingStatus);
router.route('/listings/:id')
  .delete(deleteListing);

router.get('/interests', getInterests);
router.get('/activity', getActivityLogs);

module.exports = router;
