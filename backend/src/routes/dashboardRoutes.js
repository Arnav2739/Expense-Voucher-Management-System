const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authenticate } = require('../middleware/authMiddleware');

router.use(authenticate);

// Get role-tailored dashboard stats
router.get('/stats', dashboardController.getDashboardStats);

module.exports = router;
