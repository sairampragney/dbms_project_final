const pool = require('../config/db');

class IncidentController {
  static async getIncidents(req, res, next) {
    try {
      const { status, disasterType, severity, search, page = 1, limit = 20, sortBy = 'created_at', order = 'DESC' } = req.query;

      let whereClause = ' WHERE 1=1';
      const params = [];

      if (status) {
        whereClause += ' AND status = ?';
        params.push(status);
      }
      if (disasterType) {
        whereClause += ' AND disaster_type = ?';
        params.push(disasterType);
      }
      if (severity) {
        whereClause += ' AND severity = ?';
        params.push(severity);
      }
      if (search) {
        whereClause += ' AND (location LIKE ? OR description LIKE ?)';
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm);
      }

      const [countResult] = await pool.query(`SELECT COUNT(*) as total FROM incidents${whereClause}`, params);
      const total = countResult[0].total;

      const pageNum = Math.max(1, parseInt(page, 10));
      const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
      const offset = (pageNum - 1) * limitNum;

      const validSortColumns = ['created_at', 'severity', 'status', 'disaster_type'];
      const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'created_at';
      const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

      const querySql = `SELECT * FROM incidents${whereClause} ORDER BY ${sortColumn} ${sortOrder} LIMIT ? OFFSET ?`;
      const queryParams = [...params, limitNum, offset];

      const [rows] = await pool.query(querySql, queryParams);

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
        })),
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum) || 1
        }
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

  static async updateIncident(req, res, next) {
    try {
      const { id } = req.params;
      const { disasterType, location, latitude, longitude, severity, description, status } = req.body;

      const [rows] = await pool.query('SELECT * FROM incidents WHERE id = ?', [id]);
      if (rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Incident not found' }
        });
      }

      const existing = rows[0];
      await pool.query(
        `UPDATE incidents SET
           disaster_type = ?, location = ?, latitude = ?, longitude = ?, severity = ?, description = ?, status = ?
         WHERE id = ?`,
        [
          disasterType !== undefined ? disasterType : existing.disaster_type,
          location !== undefined ? location : existing.location,
          latitude !== undefined ? latitude : existing.latitude,
          longitude !== undefined ? longitude : existing.longitude,
          severity !== undefined ? severity : existing.severity,
          description !== undefined ? description : existing.description,
          status !== undefined ? status : existing.status,
          id
        ]
      );

      res.status(200).json({
        success: true,
        message: 'Incident updated successfully',
        data: { id, status: status !== undefined ? status : existing.status }
      });
    } catch (err) {
      next(err);
    }
  }

  static async deleteIncident(req, res, next) {
    try {
      const { id } = req.params;
      const [result] = await pool.query('DELETE FROM incidents WHERE id = ?', [id]);

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Incident not found' }
        });
      }

      res.status(200).json({
        success: true,
        message: 'Incident record deleted successfully'
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = IncidentController;
