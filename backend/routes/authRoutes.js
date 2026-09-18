const express = require('express');
const { loginWithGoogle, refresh, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/google', loginWithGoogle);
router.post('/refresh', refresh);
router.get('/me', protect, getMe);

module.exports = router;