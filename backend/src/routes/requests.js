const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const RequestController = require('../controllers/requestController');
const { validateRequest } = require('../middleware/validate');
const { authenticateToken, requireRole } = require('../middleware/auth');

const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (authHeader) {
    return authenticateToken(req, res, next);
  }
  next();
};

router.get('/', RequestController.getRequests);
router.get('/:id', RequestController.getRequestById);

router.post(
  '/',
  optionalAuth,
  [
    body('requestType').isIn(['RESCUE', 'MEDICAL', 'FOOD_WATER', 'SHELTER', 'EVACUATION', 'OTHER']).withMessage('Invalid request type'),
    body('location').notEmpty().withMessage('Location is required'),
    body('contactPhone').notEmpty().withMessage('Contact phone is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('peopleAffected').optional().isInt({ min: 1 }).withMessage('People affected must be a positive integer'),
    validateRequest
  ],
  RequestController.createRequest
);

router.put(
  '/:id',
  authenticateToken,
  requireRole('ADMIN', 'VOLUNTEER'),
  RequestController.updateRequest
);

router.patch(
  '/:id/status',
  authenticateToken,
  requireRole('ADMIN', 'VOLUNTEER'),
  RequestController.updateRequest
);

router.delete(
  '/:id',
  authenticateToken,
  requireRole('ADMIN'),
  RequestController.deleteRequest
);

module.exports = router;
