const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken, optionalAuth } = require('../middlewares/auth');
const { authorize } = require('../middlewares/roles');
const upload = require('../middlewares/upload');

router.get('/', verifyToken, authorize('admin'), userController.getAllUsers);
router.post('/', userController.createUser);
router.post('/login', userController.loginUser);
router.post('/:userId/confessions', verifyToken, userController.postConfession);
router.get('/confessions', userController.getAllConfessions);
router.get('/profile/:handle', optionalAuth, userController.getProfileByHandle);
router.get('/profile/:handle/confessions', optionalAuth, userController.getUserConfessions);
router.put('/profile/:handle', verifyToken, userController.updateProfile);
router.put('/:id/role', verifyToken, authorize('admin'), userController.updateUserRole);
router.put('/:id/ban', verifyToken, authorize('admin'), userController.toggleUserBan);
router.put('/:id/premium', verifyToken, authorize('admin'), userController.setUserPremium);
router.post('/profile/:handle/avatar', verifyToken, upload.single('avatar'), userController.uploadAvatar);

module.exports = router;
