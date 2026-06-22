const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middlewares/auth');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/otp/verify', authController.verifyOtp);
router.get('/me', verifyToken, authController.getMe);

module.exports = router;
