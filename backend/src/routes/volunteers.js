const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const VolunteerController = require('../controllers/volunteerController');
const { validateRequest } = require('../middleware/validate');
const { authenticateToken } = require('../middleware/auth');

router.get('/', VolunteerController.getVolunteers);

router.post(
  '/',
  authenticateToken,
  [
    body('skills').notEmpty().withMessage('Skills description is required'),
    body('operatingArea').notEmpty().withMessage('Operating area is required'),
    body('availabilityStatus').optional().isIn(['AVAILABLE', 'BUSY', 'UNAVAILABLE']).withMessage('Invalid availability status'),
    validateRequest
  ],
  VolunteerController.registerVolunteer
);

router.patch(
  '/:id/status',
  authenticateToken,
  [
    body('availabilityStatus').isIn(['AVAILABLE', 'BUSY', 'UNAVAILABLE']).withMessage('Invalid availability status'),
    validateRequest
  ],
  VolunteerController.updateAvailability
);

module.exports = router;
