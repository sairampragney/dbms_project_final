const errorHandler = (err, req, res, next) => {
  // Always log full error details on the server side
  console.error('[SERVER_ERROR]', {
    message: err.message,
    code: err.code,
    stack: process.env.NODE_ENV !== 'production' ? err.stack : undefined,
    path: req.originalUrl,
    method: req.method
  });

  const statusCode = err.statusCode || 500;
  const isProd = process.env.NODE_ENV === 'production';

  // Sanitize error messages in production to prevent leaking SQL or internal details
  let clientMessage = err.message || 'An unexpected error occurred on the server';
  if (isProd && (err.code?.startsWith('ER_') || statusCode === 500)) {
    clientMessage = 'A server error occurred while processing your request';
  }

  res.status(statusCode).json({
    success: false,
    error: {
      code: err.code || 'INTERNAL_SERVER_ERROR',
      message: clientMessage
    }
  });
};

module.exports = errorHandler;
