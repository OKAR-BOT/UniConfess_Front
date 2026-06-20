const express = require('express');
const router = express.Router();
const confessionController = require('../controllers/confessionController');

router.get('/', confessionController.getAllConfessions);
router.post('/', confessionController.createConfession);

module.exports = router;
