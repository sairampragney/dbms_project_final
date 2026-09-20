const express = require('express');
const { body } = require('express-validator');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const AuthController = require('../controllers/authController');
const { validateRequest } = require('../middleware/validate');
const { authenticateToken } = require('../middleware/auth');

// Strict Auth Rate Limiter for Login/Register to prevent brute-force attacks
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // max 20 requests per 15 minutes per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_AUTH_ATTEMPTS',
      message: 'Too many authentication attempts from this IP, please try again after 15 minutes'
    }
  }
});

router.post(
  '/register',
  authLimiter,
  [
    body('fullName').trim().notEmpty().withMessage('Full name is required').escape(),
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').optional().isIn(['CITIZEN', 'VOLUNTEER', 'ADMIN']).withMessage('Invalid role'),
    validateRequest
  ],
  AuthController.register
);

router.post(
  '/login',
  authLimiter,
  [
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
    validateRequest
  ],
  AuthController.login
);

router.get('/me', authenticateToken, AuthController.getMe);

module.exports = router;
