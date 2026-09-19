const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const IncidentController = require('../controllers/incidentController');
const { validateRequest } = require('../middleware/validate');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Optional auth helper middleware for public reporting
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (authHeader) {
    return authenticateToken(req, res, next);
  }
  next();
};

router.get('/', IncidentController.getIncidents);
router.get('/:id', IncidentController.getIncidentById);

router.post(
  '/',
  optionalAuth,
  [
    body('disasterType').isIn(['FLOOD', 'FIRE', 'EARTHQUAKE', 'STORM', 'CHEMICAL', 'OTHER']).withMessage('Invalid disaster type'),
    body('location').notEmpty().withMessage('Location description is required'),
    body('severity').isIn(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).withMessage('Invalid severity level'),
    body('description').notEmpty().withMessage('Description is required'),
    validateRequest
  ],
  IncidentController.createIncident
);

router.patch(
  '/:id/status',
  authenticateToken,
  requireRole('ADMIN', 'VOLUNTEER'),
  [
    body('status').isIn(['REPORTED', 'VERIFIED', 'IN_PROGRESS', 'RESOLVED', 'DISMISSED']).withMessage('Invalid status'),
    validateRequest
  ],
  IncidentController.updateStatus
);

module.exports = router;
