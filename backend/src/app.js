const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');

dotenv.config();

const healthRoutes = require('./routes/health');
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const alertRoutes = require('./routes/alerts');
const incidentRoutes = require('./routes/incidents');
const requestRoutes = require('./routes/requests');
const locationRoutes = require('./routes/locations');
const volunteerRoutes = require('./routes/volunteers');
const responseRoutes = require('./routes/responses');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Security Header Middlewares
app.use(helmet());

// CORS Configuration
const allowedOrigins = [
  process.env.CORS_ORIGIN || process.env.FRONTEND_URL || 'http://localhost:3000',
  'http://localhost:5173'
];
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else if (process.env.NODE_ENV !== 'production') {
        callback(null, true); // Allow non-whitelisted origins in dev/testing mode
      } else {
        callback(new Error('Not allowed by CORS origin restriction'));
      }
    },
    credentials: true
  })
);

// Rate Limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false
});
app.use(limiter);

// Body Parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Express Router Setup
const createApiRouter = () => {
  const router = express.Router();
  router.use('/', healthRoutes);
  router.use('/health', healthRoutes);
  router.use('/auth', authRoutes);
  router.use('/dashboard', dashboardRoutes);

  // Resource routes (Plural & Hyphenated Aliases)
  router.use('/alerts', alertRoutes);
  router.use('/incidents', incidentRoutes);
  router.use('/requests', requestRoutes);
  router.use('/emergency-requests', requestRoutes);
  router.use('/locations', locationRoutes);
  router.use('/safe-locations', locationRoutes);
  router.use('/volunteers', volunteerRoutes);
  router.use('/responses', responseRoutes);
  router.use('/response-records', responseRoutes);
  return router;
};

// Mount API router on both /api and /api/v1 prefixes
app.use('/api', createApiRouter());
app.use('/api/v1', createApiRouter());

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Cannot ${req.method} ${req.originalUrl}`
    }
  });
});

// Global Error Handler Middleware
app.use(errorHandler);

module.exports = app;
