const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Rutas para usuarios
router.get('/', userController.getAllUsers);
router.post('/', userController.createUser);
router.post('/login', userController.loginUser);
router.post('/Cconfessions', userController.postConfession);
router.get('/confessions', userController.getAllConfessions);
module.exports = router;
