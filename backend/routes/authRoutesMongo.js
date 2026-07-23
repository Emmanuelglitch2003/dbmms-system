// backend/routes/authRoutesMongo.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authControllerMongo');
const { validateLogin, handleValidationErrors } = require('../middleware/validation');

router.post('/login', validateLogin, handleValidationErrors, authController.login);
router.get('/check', authController.checkAuth);

module.exports = router;