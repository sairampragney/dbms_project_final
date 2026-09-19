const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const IncidentController = require('../controllers/incidentController');
const { validateRequest } = require('../middleware/validate');
const { authenticateToken, requireRole } = require('../middleware/auth');

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

router.put(
  '/:id',
  authenticateToken,
  requireRole('ADMIN', 'VOLUNTEER'),
  IncidentController.updateIncident
);

router.delete(
  '/:id',
  authenticateToken,
  requireRole('ADMIN'),
  IncidentController.deleteIncident
);

module.exports = router;
