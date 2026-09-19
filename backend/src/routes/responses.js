const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const ResponseController = require('../controllers/responseController');
const { validateRequest } = require('../middleware/validate');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.get(
  '/',
  authenticateToken,
  requireRole('ADMIN', 'VOLUNTEER'),
  ResponseController.getResponses
);

router.post(
  '/',
  authenticateToken,
  requireRole('ADMIN', 'VOLUNTEER'),
  [
    body('volunteerId').isInt({ min: 1 }).withMessage('Valid volunteer ID is required'),
    body('incidentId').optional().isInt({ min: 1 }),
    body('requestId').optional().isInt({ min: 1 }),
    validateRequest
  ],
  ResponseController.assignResponse
);

router.patch(
  '/:id',
  authenticateToken,
  requireRole('ADMIN', 'VOLUNTEER'),
  [
    body('status').isIn(['ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'ABANDONED']).withMessage('Invalid status'),
    validateRequest
  ],
  ResponseController.updateResponseStatus
);

module.exports = router;
