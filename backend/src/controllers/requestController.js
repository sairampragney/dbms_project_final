const pool = require('../config/db');

class RequestController {
  static async getRequests(req, res, next) {
    try {
      const { status, priority, requestType, search, page = 1, limit = 20, sortBy = 'created_at', order = 'DESC' } = req.query;

      let whereClause = ' WHERE 1=1';
      const params = [];

      if (status) {
        whereClause += ' AND status = ?';
        params.push(status);
      }
      if (priority) {
        whereClause += ' AND priority = ?';
        params.push(priority);
      }
      if (requestType) {
        whereClause += ' AND request_type = ?';
        params.push(requestType);
      }
      if (search) {
        whereClause += ' AND (location LIKE ? OR description LIKE ? OR contact_phone LIKE ?)';
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm, searchTerm);
      }

      const [countResult] = await pool.query(`SELECT COUNT(*) as total FROM emergency_requests${whereClause}`, params);
      const total = countResult[0].total;

      const pageNum = Math.max(1, parseInt(page, 10));
      const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
      const offset = (pageNum - 1) * limitNum;

      const validSortColumns = ['created_at', 'priority', 'status', 'request_type', 'people_affected'];
      const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'created_at';
      const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

      const querySql = `SELECT * FROM emergency_requests${whereClause} ORDER BY ${sortColumn} ${sortOrder} LIMIT ? OFFSET ?`;
      const queryParams = [...params, limitNum, offset];

      const [rows] = await pool.query(querySql, queryParams);

      res.status(200).json({
        success: true,
        data: rows.map(r => ({
          id: r.id,
          requesterId: r.requester_id,
          requestType: r.request_type,
          priority: r.priority,
          location: r.location,
          peopleAffected: r.people_affected,
          contactPhone: r.contact_phone,
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

  static async getRequestById(req, res, next) {
    try {
      const { id } = req.params;
      const [rows] = await pool.query('SELECT * FROM emergency_requests WHERE id = ?', [id]);
      if (rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Emergency request not found' }
        });
      }

      const r = rows[0];
      res.status(200).json({
        success: true,
        data: {
          id: r.id,
          requesterId: r.requester_id,
          requestType: r.request_type,
          priority: r.priority,
          location: r.location,
          peopleAffected: r.people_affected,
          contactPhone: r.contact_phone,
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

  static async createRequest(req, res, next) {
    try {
      const { requestType, priority, location, peopleAffected, contactPhone, description } = req.body;
      const requesterId = req.user ? req.user.id : null;

      const [result] = await pool.query(
        `INSERT INTO emergency_requests
           (requester_id, request_type, priority, location, people_affected, contact_phone, description)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          requesterId,
          requestType,
          priority || 'MEDIUM',
          location,
          peopleAffected || 1,
          contactPhone,
          description
        ]
      );

      res.status(201).json({
        success: true,
        message: 'Emergency request submitted successfully',
        data: {
          id: result.insertId,
          status: 'PENDING'
        }
      });
    } catch (err) {
      next(err);
    }
  }

  static async updateRequest(req, res, next) {
    try {
      const { id } = req.params;
      const { requestType, priority, location, peopleAffected, contactPhone, description, status } = req.body;

      const [rows] = await pool.query('SELECT * FROM emergency_requests WHERE id = ?', [id]);
      if (rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Emergency request not found' }
        });
      }

      const existing = rows[0];
      await pool.query(
        `UPDATE emergency_requests SET
           request_type = ?, priority = ?, location = ?, people_affected = ?, contact_phone = ?, description = ?, status = ?
         WHERE id = ?`,
        [
          requestType !== undefined ? requestType : existing.request_type,
          priority !== undefined ? priority : existing.priority,
          location !== undefined ? location : existing.location,
          peopleAffected !== undefined ? peopleAffected : existing.people_affected,
          contactPhone !== undefined ? contactPhone : existing.contact_phone,
          description !== undefined ? description : existing.description,
          status !== undefined ? status : existing.status,
          id
        ]
      );

      res.status(200).json({
        success: true,
        message: 'Emergency request updated successfully',
        data: { id, status: status !== undefined ? status : existing.status }
      });
    } catch (err) {
      next(err);
    }
  }

  static async deleteRequest(req, res, next) {
    try {
      const { id } = req.params;
      const [result] = await pool.query('DELETE FROM emergency_requests WHERE id = ?', [id]);

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Emergency request not found' }
        });
      }

      res.status(200).json({
        success: true,
        message: 'Emergency request deleted successfully'
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = RequestController;
