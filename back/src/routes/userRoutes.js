const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken } = require('../middlewares/auth');
const { authorize } = require('../middlewares/roles');

router.get('/', verifyToken, authorize('admin'), userController.getAllUsers);
router.post('/', userController.createUser);
router.post('/login', userController.loginUser);
router.post('/:userId/confessions', verifyToken, userController.postConfession);
router.get('/confessions', userController.getAllConfessions);
router.put('/:id/role', verifyToken, authorize('admin'), userController.updateUserRole);
router.put('/:id/ban', verifyToken, authorize('admin'), userController.toggleUserBan);
router.put('/:id/premium', verifyToken, authorize('admin'), userController.setUserPremium);

module.exports = router;
