const express = require('express');
const router = express.Router();
const interactionController = require('../controllers/interactionController');
const { verifyToken } = require('../middlewares/auth');

router.get('/batch', interactionController.getBatchInteractions);
router.post('/:id/like', verifyToken, interactionController.toggleLike);
router.post('/:id/repost', verifyToken, interactionController.toggleRepost);

module.exports = router;
