const express = require('express');
const {
  register,
  login,
  getMe,
  updateDetails,
  updatePassword
} = require('../controllers/authController');

const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);

router.use(protect); // All routes below this will be protected

router.get('/me', getMe);
router.patch('/me', updateDetails);
router.patch('/change-password', updatePassword);

module.exports = router;
