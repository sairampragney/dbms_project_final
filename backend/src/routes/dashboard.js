const express = require('express');
const router = express.Router();
const pool = require('../config/db');

router.get('/stats', async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM v_dashboard_summary');
    const stats = rows[0] || {
      active_alerts_count: 0,
      open_incidents_count: 0,
      pending_requests_count: 0,
      open_shelters_count: 0,
      total_shelter_remaining_capacity: 0,
      available_volunteers_count: 0
    };

    res.status(200).json({
      success: true,
      data: {
        activeAlerts: Number(stats.active_alerts_count),
        openIncidents: Number(stats.open_incidents_count),
        pendingRequests: Number(stats.pending_requests_count),
        openShelters: Number(stats.open_shelters_count),
        remainingShelterCapacity: Number(stats.total_shelter_remaining_capacity),
        availableVolunteers: Number(stats.available_volunteers_count)
      }
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
