const express = require('express');
const router = express.Router();
const blockController = require('../controllers/blockController');
const { verifyToken } = require('../middlewares/auth');

router.get('/', verifyToken, blockController.getBlockedUsers);
router.post('/', verifyToken, blockController.blockUser);
router.delete('/:blockedId', verifyToken, blockController.unblockUser);

module.exports = router;
