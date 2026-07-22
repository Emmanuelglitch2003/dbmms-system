// backend/routes/memberRoutes.js
const express = require('express');
const router = express.Router();
const memberController = require('../controllers/memberController');
const { authenticate } = require('../middleware/auth');
const { validateMember, handleValidationErrors } = require('../middleware/validation');

router.use(authenticate);

router.get('/stats', memberController.getMemberStats);
router.get('/', memberController.getMembers);
router.get('/:id', memberController.getMember);
router.post('/', validateMember, handleValidationErrors, memberController.createMember);
router.put('/:id', validateMember, handleValidationErrors, memberController.updateMember);
router.delete('/:id', memberController.deleteMember);

module.exports = router;