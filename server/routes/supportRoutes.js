const express = require('express');
const { chat } = require('../controllers/supportController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Allow public access to support chat so it works even if the token expires or DB resets
router.post('/chat', chat);

module.exports = router;
