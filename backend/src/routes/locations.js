const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const LocationController = require('../controllers/locationController');
const { validateRequest } = require('../middleware/validate');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.get('/', LocationController.getLocations);
router.get('/:id', LocationController.getLocationById);

router.post(
  '/',
  authenticateToken,
  requireRole('ADMIN'),
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('address').notEmpty().withMessage('Address is required'),
    body('capacity').isInt({ min: 1 }).withMessage('Capacity must be at least 1'),
    validateRequest
  ],
  LocationController.createLocation
);

router.patch(
  '/:id/occupancy',
  authenticateToken,
  requireRole('ADMIN'),
  [
    body('currentOccupancy').optional().isInt({ min: 0 }).withMessage('Current occupancy must be a non-negative integer'),
    validateRequest
  ],
  LocationController.updateOccupancy
);

module.exports = router;
