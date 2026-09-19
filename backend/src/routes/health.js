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

module.exports = router;
