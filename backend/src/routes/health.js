const express = require('express');
const router = express.Router();
const pool = require('../config/db');

router.get('/health', async (req, res, next) => {
  try {
    let dbStatus = 'DISCONNECTED';
    try {
      const [rows] = await pool.query('SELECT 1');
      if (rows) dbStatus = 'CONNECTED';
    } catch (e) {
      dbStatus = 'ERROR: ' + e.message;
    }

    res.status(200).json({
      success: true,
      data: {
        status: 'UP',
        timestamp: new Date().toISOString(),
        database: dbStatus
      }
    });
  } catch (err) {
    next(err);
  }
});

// Production Readiness Endpoint
router.get('/ready', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1');
    if (rows) {
      return res.status(200).json({
        success: true,
        data: { ready: true, database: 'OK', timestamp: new Date().toISOString() }
      });
    }
  } catch (err) {
    return res.status(503).json({
      success: false,
      error: { code: 'NOT_READY', message: 'Database dependency unavailable: ' + err.message }
    });
  }
});

module.exports = router;
