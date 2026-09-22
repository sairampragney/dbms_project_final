const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Access token missing or invalid'
      }
    });
  }

  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('[FATAL] JWT_SECRET environment variable is missing');
      return res.status(500).json({
        success: false,
        error: { code: 'SERVER_CONFIG_ERROR', message: 'Authentication server misconfiguration: JWT_SECRET environment variable missing' }
      });
    }

    const decoded = jwt.verify(
      token,
      jwtSecret,
      { algorithms: ['HS256'] }
    );

    if (!decoded || !decoded.id || !decoded.role) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN_CLAIMS',
          message: 'Access token contains invalid user payload'
        }
      });
    }

    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: err.name === 'TokenExpiredError' ? 'Access token has expired' : 'Invalid access token'
      }
    });
  }
};

const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'User authentication required'
        }
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Access denied: insufficient role permissions'
        }
      });
    }

    next();
  };
};

module.exports = {
  authenticateToken,
  requireRole
};
