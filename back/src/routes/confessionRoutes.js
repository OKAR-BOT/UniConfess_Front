const express = require('express');
const router = express.Router();
const confessionController = require('../controllers/confessionController');
const { verifyToken, optionalAuth } = require('../middlewares/auth');

router.get('/', optionalAuth, confessionController.getAllConfessions);
router.post('/', verifyToken, confessionController.createConfession);
router.delete('/:id', verifyToken, confessionController.deleteConfession);
router.put('/:id/pin', verifyToken, confessionController.togglePin);
router.put('/:id', verifyToken, confessionController.updateConfession);

module.exports = router;
