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
  process.env.FRONTEND_URL || 'http://localhost:3000',
  'http://localhost:5173'
];
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // Allow during dev/testing
      }
    },
    credentials: true
  })
);

// Rate Limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false
});
app.use(limiter);

// Body Parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API v1 Router Registration
const apiRouter = express.Router();

apiRouter.use('/', healthRoutes);
apiRouter.use('/auth', authRoutes);
apiRouter.use('/dashboard', dashboardRoutes);
apiRouter.use('/alerts', alertRoutes);
apiRouter.use('/incidents', incidentRoutes);
apiRouter.use('/requests', requestRoutes);
apiRouter.use('/locations', locationRoutes);
apiRouter.use('/volunteers', volunteerRoutes);
apiRouter.use('/responses', responseRoutes);

app.use('/api/v1', apiRouter);

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
