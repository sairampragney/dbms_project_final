const app = require('./app');
const pool = require('./config/db');
const initDb = require('./config/initDb');

const PORT = process.env.PORT || 5000;

// Initialize MySQL database schema & seed data prior to starting the HTTP server
initDb()
  .then(() => {
    console.log('[Server] Database auto-initialization check completed.');
  })
  .catch((err) => {
    console.error('[Server] Non-fatal database initialization warning:', err.message);
  });

const server = app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 Disaster Alert Backend API Server Running`);
  console.log(`📡 Listening on Port: ${PORT}`);
  console.log(`🔗 Primary API Route: http://localhost:${PORT}/api`);
  console.log(`🔗 Versioned API Route: http://localhost:${PORT}/api/v1`);
  console.log(`====================================================`);
});

const gracefulShutdown = (signal) => {
  console.log(`\n[Server] Received ${signal}. Initiating graceful shutdown...`);
  server.close(async () => {
    console.log('[Server] Closed remaining active HTTP connections.');
    try {
      await pool.end();
      console.log('[Server] Closed MySQL database connection pool.');
      process.exit(0);
    } catch (err) {
      console.error('[Server] Error closing MySQL pool:', err);
      process.exit(1);
    }
  });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
