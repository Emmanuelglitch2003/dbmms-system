// backend/routes/reportRoutes.js
const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authenticate } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// Get report data
router.get('/data', reportController.getReportData);

module.exports = router;