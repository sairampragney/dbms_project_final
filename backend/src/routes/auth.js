const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const AuthController = require('../controllers/authController');
const { validateRequest } = require('../middleware/validate');
const { authenticateToken } = require('../middleware/auth');

router.post(
  '/register',
  [
    body('fullName').notEmpty().withMessage('Full name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').optional().isIn(['CITIZEN', 'VOLUNTEER', 'ADMIN']).withMessage('Invalid role'),
    validateRequest
  ],
  AuthController.register
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
    validateRequest
  ],
  AuthController.login
);

router.get('/me', authenticateToken, AuthController.getMe);

module.exports = router;
