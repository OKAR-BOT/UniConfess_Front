const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const { verifyToken } = require('../middlewares/auth');

router.get('/:id/comments', commentController.getComments);
router.post('/:id/comments', verifyToken, commentController.createComment);
router.delete('/:id/comments/:commentId', verifyToken, commentController.deleteComment);

module.exports = router;
