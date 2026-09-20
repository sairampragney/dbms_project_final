const pool = require('../config/db');

class ResponseController {
  static async getResponses(req, res, next) {
    try {
      const { status, volunteerId, page = 1, limit = 20, sortBy = 'assigned_at', order = 'DESC' } = req.query;

      let whereClause = ' WHERE 1=1';
      const params = [];

      if (status) {
        whereClause += ' AND r.status = ?';
        params.push(status);
      }
      if (volunteerId) {
        whereClause += ' AND r.volunteer_id = ?';
        params.push(volunteerId);
      }

      const countSql = `SELECT COUNT(*) as total FROM response_records r ${whereClause}`;
      const [countResult] = await pool.query(countSql, params);
      const total = countResult[0].total;

      const pageNum = Math.max(1, parseInt(page, 10));
      const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
      const offset = (pageNum - 1) * limitNum;

      const validSortColumns = ['assigned_at', 'completed_at', 'status'];
      const sortColumn = validSortColumns.includes(sortBy) ? `r.${sortBy}` : 'r.assigned_at';
      const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

      const querySql = `
        SELECT r.*, v.user_id, u.full_name AS volunteer_name, u.phone AS volunteer_phone
        FROM response_records r
        JOIN volunteers v ON r.volunteer_id = v.id
        JOIN users u ON v.user_id = u.id
        ${whereClause}
        ORDER BY ${sortColumn} ${sortOrder}
        LIMIT ? OFFSET ?
      `;
      const queryParams = [...params, limitNum, offset];

      const [rows] = await pool.query(querySql, queryParams);

      res.status(200).json({
        success: true,
        data: rows.map(r => ({
          id: r.id,
          volunteerId: r.volunteer_id,
          volunteerName: r.volunteer_name,
          volunteerPhone: r.volunteer_phone,
          incidentId: r.incident_id,
          requestId: r.request_id,
          actionTaken: r.action_taken,
          status: r.status,
          assignedAt: r.assigned_at,
          completedAt: r.completed_at
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

  static async getResponseById(req, res, next) {
    try {
      const { id } = req.params;
      const [rows] = await pool.query(
        `SELECT r.*, v.user_id, u.full_name AS volunteer_name, u.phone AS volunteer_phone
         FROM response_records r
         JOIN volunteers v ON r.volunteer_id = v.id
         JOIN users u ON v.user_id = u.id
         WHERE r.id = ?`,
        [id]
      );

      if (rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Response record not found' }
        });
      }

      const r = rows[0];
      res.status(200).json({
        success: true,
        data: {
          id: r.id,
          volunteerId: r.volunteer_id,
          volunteerName: r.volunteer_name,
          volunteerPhone: r.volunteer_phone,
          incidentId: r.incident_id,
          requestId: r.request_id,
          actionTaken: r.action_taken,
          status: r.status,
          assignedAt: r.assigned_at,
          completedAt: r.completed_at
        }
      });
    } catch (err) {
      next(err);
    }
  }

  static async assignResponse(req, res, next) {
    try {
      const { volunteerId, incidentId, requestId, actionTaken } = req.body;

      if (!incidentId && !requestId) {
        return res.status(400).json({
          success: false,
          error: { code: 'INVALID_TARGET', message: 'Either incidentId or requestId must be provided' }
        });
      }

      const connection = await pool.getConnection();
      try {
        await connection.beginTransaction();

        const [result] = await connection.query(
          `INSERT INTO response_records (volunteer_id, incident_id, request_id, action_taken, status)
           VALUES (?, ?, ?, ?, 'ASSIGNED')`,
          [volunteerId, incidentId || null, requestId || null, actionTaken || null]
        );

        await connection.query('UPDATE volunteers SET availability_status = "BUSY" WHERE id = ?', [volunteerId]);

        if (requestId) {
          await connection.query('UPDATE emergency_requests SET status = "ASSIGNED" WHERE id = ?', [requestId]);
        }
        if (incidentId) {
          await connection.query('UPDATE incidents SET status = "IN_PROGRESS" WHERE id = ?', [incidentId]);
        }

        await connection.commit();

        res.status(201).json({
          success: true,
          message: 'Volunteer response assigned successfully',
          data: {
            id: result.insertId,
            volunteerId,
            incidentId,
            requestId,
            status: 'ASSIGNED'
          }
        });
      } catch (e) {
        await connection.rollback();
        throw e;
      } finally {
        connection.release();
      }
    } catch (err) {
      next(err);
    }
  }

  static async updateResponse(req, res, next) {
    try {
      const { id } = req.params;
      const { status, actionTaken } = req.body;

      const [rows] = await pool.query('SELECT * FROM response_records WHERE id = ?', [id]);
      if (rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Response record not found' }
        });
      }

      const rec = rows[0];
      const newStatus = status !== undefined ? status : rec.status;
      const completedAt = (newStatus === 'COMPLETED') ? new Date() : rec.completed_at;

      const connection = await pool.getConnection();
      try {
        await connection.beginTransaction();

        await connection.query(
          `UPDATE response_records SET status = ?, action_taken = ?, completed_at = ? WHERE id = ?`,
          [newStatus, actionTaken !== undefined ? actionTaken : rec.action_taken, completedAt, id]
        );

        if (newStatus === 'COMPLETED' || newStatus === 'ABANDONED') {
          await connection.query('UPDATE volunteers SET availability_status = "AVAILABLE" WHERE id = ?', [rec.volunteer_id]);

          if (newStatus === 'COMPLETED' && rec.request_id) {
            await connection.query('UPDATE emergency_requests SET status = "FULFILLED" WHERE id = ?', [rec.request_id]);
          }
          if (newStatus === 'COMPLETED' && rec.incident_id) {
            await connection.query('UPDATE incidents SET status = "RESOLVED" WHERE id = ?', [rec.incident_id]);
          }
        }

        await connection.commit();

        res.status(200).json({
          success: true,
          message: 'Response record updated successfully',
          data: { id, status: newStatus }
        });
      } catch (e) {
        await connection.rollback();
        throw e;
      } finally {
        connection.release();
      }
    } catch (err) {
      next(err);
    }
  }

  static async deleteResponse(req, res, next) {
    try {
      const { id } = req.params;
      const [result] = await pool.query('DELETE FROM response_records WHERE id = ?', [id]);

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Response record not found' }
        });
      }

      res.status(200).json({
        success: true,
        message: 'Response record deleted successfully'
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = ResponseController;
