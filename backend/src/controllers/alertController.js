const pool = require('../config/db');

class AlertController {
  static async getAlerts(req, res, next) {
    try {
      const { status, severity, disasterType, search, page = 1, limit = 20, sortBy = 'created_at', order = 'DESC' } = req.query;

      let whereClause = ' WHERE 1=1';
      const params = [];

      if (status) {
        whereClause += ' AND status = ?';
        params.push(status);
      }
      if (severity) {
        whereClause += ' AND severity = ?';
        params.push(severity);
      }
      if (disasterType) {
        whereClause += ' AND disaster_type = ?';
        params.push(disasterType);
      }
      if (search) {
        whereClause += ' AND (title LIKE ? OR affected_location LIKE ? OR description LIKE ?)';
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm, searchTerm);
      }

      // Count total records
      const [countResult] = await pool.query(`SELECT COUNT(*) as total FROM disaster_alerts${whereClause}`, params);
      const total = countResult[0].total;

      // Pagination calculation
      const pageNum = Math.max(1, parseInt(page, 10));
      const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
      const offset = (pageNum - 1) * limitNum;

      // Sorting
      const validSortColumns = ['created_at', 'title', 'severity', 'status', 'disaster_type'];
      const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'created_at';
      const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

      const querySql = `SELECT * FROM disaster_alerts${whereClause} ORDER BY ${sortColumn} ${sortOrder} LIMIT ? OFFSET ?`;
      const queryParams = [...params, limitNum, offset];

      const [rows] = await pool.query(querySql, queryParams);

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
      const createdBy = req.user ? req.user.id : 1;

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
          title !== undefined ? title : existing.title,
          disasterType !== undefined ? disasterType : existing.disaster_type,
          severity !== undefined ? severity : existing.severity,
          affectedLocation !== undefined ? affectedLocation : existing.affected_location,
          description !== undefined ? description : existing.description,
          status !== undefined ? status : existing.status,
          id
        ]
      );

      res.status(200).json({
        success: true,
        message: 'Disaster alert updated successfully',
        data: { id, status: status !== undefined ? status : existing.status }
      });
    } catch (err) {
      next(err);
    }
  }

  static async deleteAlert(req, res, next) {
    try {
      const { id } = req.params;
      const [result] = await pool.query('DELETE FROM disaster_alerts WHERE id = ?', [id]);

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Alert not found' }
        });
      }

      res.status(200).json({
        success: true,
        message: 'Disaster alert deleted successfully'
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = AlertController;
