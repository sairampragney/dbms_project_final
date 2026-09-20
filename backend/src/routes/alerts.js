const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const AlertController = require('../controllers/alertController');
const { validateRequest } = require('../middleware/validate');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.get('/', AlertController.getAlerts);
router.get('/:id', AlertController.getAlertById);

router.post(
  '/',
  authenticateToken,
  requireRole('ADMIN'),
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('disasterType').isIn(['FLOOD', 'FIRE', 'EARTHQUAKE', 'STORM', 'CHEMICAL', 'OTHER']).withMessage('Invalid disaster type'),
    body('severity').isIn(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).withMessage('Invalid severity level'),
    body('affectedLocation').notEmpty().withMessage('Affected location is required'),
    body('description').notEmpty().withMessage('Description is required'),
    validateRequest
  ],
  AlertController.createAlert
);

router.put(
  '/:id',
  authenticateToken,
  requireRole('ADMIN'),
  AlertController.updateAlert
);

router.delete(
  '/:id',
  authenticateToken,
  requireRole('ADMIN'),
  AlertController.deleteAlert
);

module.exports = router;
