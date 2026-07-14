const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { verifyToken } = require('../middlewares/auth');

router.post('/', verifyToken, reportController.createReport);
router.get('/', verifyToken, reportController.getReports);
router.put('/:id/review', verifyToken, reportController.reviewReport);

module.exports = router;
