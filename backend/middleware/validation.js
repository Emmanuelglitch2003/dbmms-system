// backend/middleware/validation.js
const { body, validationResult } = require('express-validator');

// Validate member registration
const validateMember = [
    body('full_name').notEmpty().withMessage('Full name is required'),
    body('date_of_birth').notEmpty().withMessage('Date of birth is required')
        .isISO8601().withMessage('Invalid date format'),
    body('gender').isIn(['Male', 'Female', 'Other']).withMessage('Invalid gender'),
    body('nationality').notEmpty().withMessage('Nationality is required'),
    body('phone_call').notEmpty().withMessage('Phone number is required'),
    body('whatsapp').notEmpty().withMessage('WhatsApp number is required'),
    body('instrument').notEmpty().withMessage('Instrument is required'),
    body('emergency_name').notEmpty().withMessage('Emergency contact name is required'),
    body('emergency_relationship').notEmpty().withMessage('Emergency relationship is required'),
    body('emergency_phone').notEmpty().withMessage('Emergency phone is required'),
    body('date_received').notEmpty().withMessage('Date received is required'),
    body('status').isIn(['pending', 'approved', 'rejected']).withMessage('Invalid status')
];

// Validate login
const validateLogin = [
    body('username').notEmpty().withMessage('Username is required'),
    body('password').notEmpty().withMessage('Password is required')
];

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array().map(err => ({
                field: err.path,
                message: err.msg
            }))
        });
    }
    next();
};

module.exports = {
    validateMember,
    validateLogin,
    handleValidationErrors
};