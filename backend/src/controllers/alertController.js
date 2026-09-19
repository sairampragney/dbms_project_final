const pool = require('../config/db');

class AlertController {
  static async getAlerts(req, res, next) {
    try {
      const { status, severity, disasterType } = req.query;
      let sql = 'SELECT * FROM disaster_alerts WHERE 1=1';
      const params = [];

      if (status) {
        sql += ' AND status = ?';
        params.push(status);
      }
      if (severity) {
        sql += ' AND severity = ?';
        params.push(severity);
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
          title: r.title,
          disasterType: r.disaster_type,
          severity: r.severity,
          affectedLocation: r.affected_location,
          description: r.description,
          status: r.status,
          createdBy: r.created_by,
          createdAt: r.created_at,
          updatedAt: r.updated_at
        }))
      });
    } catch (err) {
      next(err);
    }
  }

  static async getAlertById(req, res, next) {
    try {
      const { id } = req.params;
      const [rows] = await pool.query('SELECT * FROM disaster_alerts WHERE id = ?', [id]);
      if (rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Disaster alert not found' }
        });
      }

      const r = rows[0];
      res.status(200).json({
        success: true,
        data: {
          id: r.id,
          title: r.title,
          disasterType: r.disaster_type,
          severity: r.severity,
          affectedLocation: r.affected_location,
          description: r.description,
          status: r.status,
          createdBy: r.created_by,
          createdAt: r.created_at,
          updatedAt: r.updated_at
        }
      });
    } catch (err) {
      next(err);
    }
  }

  static async createAlert(req, res, next) {
    try {
      const { title, disasterType, severity, affectedLocation, description } = req.body;
      const createdBy = req.user.id;

      const [result] = await pool.query(
        `INSERT INTO disaster_alerts (title, disaster_type, severity, affected_location, description, created_by)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [title, disasterType, severity, affectedLocation, description, createdBy]
      );

      res.status(201).json({
        success: true,
        message: 'Disaster alert published successfully',
        data: {
          id: result.insertId,
          title,
          disasterType,
          severity,
          affectedLocation,
          status: 'ACTIVE'
        }
      });
    } catch (err) {
      next(err);
    }
  }

  static async updateAlert(req, res, next) {
    try {
      const { id } = req.params;
      const { title, disasterType, severity, affectedLocation, description, status } = req.body;

      const [rows] = await pool.query('SELECT * FROM disaster_alerts WHERE id = ?', [id]);
      if (rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Alert not found' }
        });
      }

      const existing = rows[0];
      await pool.query(
        `UPDATE disaster_alerts SET
           title = ?, disaster_type = ?, severity = ?, affected_location = ?, description = ?, status = ?
         WHERE id = ?`,
        [
          title || existing.title,
          disasterType || existing.disaster_type,
          severity || existing.severity,
          affectedLocation || existing.affected_location,
          description || existing.description,
          status || existing.status,
          id
        ]
      );

      res.status(200).json({
        success: true,
        message: 'Disaster alert updated successfully'
      });
    } catch (err) {
      next(err);
    }
  }

  static async deleteAlert(req, res, next) {
    try {
      const { id } = req.params;
      const [result] = await pool.query('UPDATE disaster_alerts SET status = "CANCELLED" WHERE id = ?', [id]);

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Alert not found' }
        });
      }

      res.status(200).json({
        success: true,
        message: 'Alert status set to CANCELLED'
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = AlertController;
