const pool = require('../config/db');

class RequestController {
  static async getRequests(req, res, next) {
    try {
      const { status, priority, requestType } = req.query;
      let sql = 'SELECT * FROM emergency_requests WHERE 1=1';
      const params = [];

      if (status) {
        sql += ' AND status = ?';
        params.push(status);
      }
      if (priority) {
        sql += ' AND priority = ?';
        params.push(priority);
      }
      if (requestType) {
        sql += ' AND request_type = ?';
        params.push(requestType);
      }

      sql += ' ORDER BY created_at DESC';
      const [rows] = await pool.query(sql, params);

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
        }))
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

  static async updateStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status, priority } = req.body;

      const [rows] = await pool.query('SELECT * FROM emergency_requests WHERE id = ?', [id]);
      if (rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Emergency request not found' }
        });
      }

      const existing = rows[0];
      await pool.query(
        'UPDATE emergency_requests SET status = ?, priority = ? WHERE id = ?',
        [status || existing.status, priority || existing.priority, id]
      );

      res.status(200).json({
        success: true,
        message: 'Emergency request status updated successfully',
        data: { id, status: status || existing.status }
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = RequestController;
