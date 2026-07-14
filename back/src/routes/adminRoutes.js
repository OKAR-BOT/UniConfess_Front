const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken } = require('../middlewares/auth');

router.get('/stats', verifyToken, (req, res, next) => {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ message: 'Solo administradores.' });
  }
  next();
}, adminController.getStats);

module.exports = router;
