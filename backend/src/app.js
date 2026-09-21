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

// Disable X-Powered-By header to prevent technology exposure
app.disable('x-powered-by');

// Security Header Middlewares via Helmet
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// CORS Configuration
const allowedOrigins = [
  process.env.CORS_ORIGIN,
  process.env.FRONTEND_URL,
  'https://dbms-project-final.vercel.app',
  'http://localhost:3000',
  'http://localhost:5173'
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      const isAllowed = allowedOrigins.some(allowed => {
        if (allowed === origin) return true;
        // Allow Vercel preview/deployment subdomains if matching project name pattern
        if (origin.endsWith('.vercel.app') && origin.includes('dbms-project-final')) return true;
        return false;
      });

      if (isAllowed || process.env.NODE_ENV !== 'production') {
        callback(null, true);
      } else {
        console.warn(`[CORS Blocked] Origin: ${origin}. Allowed Origins: ${allowedOrigins.join(', ')}`);
        callback(null, false);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// Global API Rate Limiter
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many requests from this IP, please try again after 15 minutes'
    }
  }
});
app.use(globalLimiter);

// Body Parsing
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Express Router Setup
const createApiRouter = () => {
  const router = express.Router();
  router.use('/', healthRoutes);
  router.use('/health', healthRoutes);
  router.use('/auth', authRoutes);
  router.use('/dashboard', dashboardRoutes);

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

// Centralized Error Handler Middleware
app.use(errorHandler);

module.exports = app;
