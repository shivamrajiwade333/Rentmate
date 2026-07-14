const express = require('express');
const { getMe, upsertMe, getAllProfiles, getProfileById, toggleSaveProfile } = require('../controllers/tenantProfileController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Public / Optional Auth Routes
const optionalProtect = (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    return protect(req, res, next);
  }
  next();
};

router.get('/public', optionalProtect, getAllProfiles);
router.get('/public/:id', getProfileById);

// Protected Routes
router.use(protect);
router.use(authorize('tenant', 'admin'));

router.route('/me')
  .get(getMe)
  .put(upsertMe);

router.post('/save/:id', toggleSaveProfile);

module.exports = router;
