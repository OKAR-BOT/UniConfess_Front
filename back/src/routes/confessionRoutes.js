const express = require('express');
const router = express.Router();
const confessionController = require('../controllers/confessionController');
const { verifyToken } = require('../middlewares/auth');
const { authorize } = require('../middlewares/roles');

router.get('/', confessionController.getAllConfessions);
router.post('/', verifyToken, confessionController.createConfession);
router.delete('/:id', verifyToken, authorize('admin'), confessionController.deleteConfession);
router.put('/:id/pin', verifyToken, confessionController.togglePin);

module.exports = router;
