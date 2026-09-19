const pool = require('../config/db');

class IncidentController {
  static async getIncidents(req, res, next) {
    try {
      const { status, disasterType } = req.query;
      let sql = 'SELECT * FROM incidents WHERE 1=1';
      const params = [];

      if (status) {
        sql += ' AND status = ?';
        params.push(status);
      }
      if (disasterType) {
        sql += ' AND disaster_type = ?';
        params.push(disasterType);
      }

      sql += ' ORDER BY created_at DESC';
      const [rows] = await pool.query(sql, params);

      res.status(200).json({
        success: true,
        data: rows.map(r => ({
          id: r.id,
          reporterId: r.reporter_id,
          disasterType: r.disaster_type,
          location: r.location,
          latitude: r.latitude ? Number(r.latitude) : null,
          longitude: r.longitude ? Number(r.longitude) : null,
          severity: r.severity,
          description: r.description,
          status: r.status,
          createdAt: r.created_at,
          updatedAt: r.updated_at
        }))
      });
    } catch (err) {
      next(err);
    }
  }

  static async getIncidentById(req, res, next) {
    try {
      const { id } = req.params;
      const [rows] = await pool.query('SELECT * FROM incidents WHERE id = ?', [id]);
      if (rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Incident not found' }
        });
      }

      const r = rows[0];
      res.status(200).json({
        success: true,
        data: {
          id: r.id,
          reporterId: r.reporter_id,
          disasterType: r.disaster_type,
          location: r.location,
          latitude: r.latitude ? Number(r.latitude) : null,
          longitude: r.longitude ? Number(r.longitude) : null,
          severity: r.severity,
          description: r.description,
          status: r.status,
          createdAt: r.created_at,
          updatedAt: r.updated_at
        }
      });
    } catch (err) {
      next(err);
    }
  }

  static async createIncident(req, res, next) {
    try {
      const { disasterType, location, latitude, longitude, severity, description } = req.body;
      const reporterId = req.user ? req.user.id : null;

      const [result] = await pool.query(
        `INSERT INTO incidents (reporter_id, disaster_type, location, latitude, longitude, severity, description)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          reporterId,
          disasterType,
          location,
          latitude !== undefined ? latitude : null,
          longitude !== undefined ? longitude : null,
          severity,
          description
        ]
      );

      res.status(201).json({
        success: true,
        message: 'Incident reported successfully',
        data: {
          id: result.insertId,
          status: 'REPORTED'
        }
      });
    } catch (err) {
      next(err);
    }
  }

  static async updateStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const [result] = await pool.query('UPDATE incidents SET status = ? WHERE id = ?', [status, id]);
      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Incident not found' }
        });
      }

      res.status(200).json({
        success: true,
        message: 'Incident status updated successfully',
        data: { id, status }
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = IncidentController;
