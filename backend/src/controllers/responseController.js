const pool = require('../config/db');

class ResponseController {
  static async getResponses(req, res, next) {
    try {
      const { status, volunteerId } = req.query;
      let sql = `
        SELECT r.*, v.user_id, u.full_name AS volunteer_name, u.phone AS volunteer_phone
        FROM response_records r
        JOIN volunteers v ON r.volunteer_id = v.id
        JOIN users u ON v.user_id = u.id
        WHERE 1=1
      `;
      const params = [];

      if (status) {
        sql += ' AND r.status = ?';
        params.push(status);
      }
      if (volunteerId) {
        sql += ' AND r.volunteer_id = ?';
        params.push(volunteerId);
      }

      sql += ' ORDER BY r.assigned_at DESC';
      const [rows] = await pool.query(sql, params);

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
        }))
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

        // Set volunteer availability to BUSY
        await connection.query('UPDATE volunteers SET availability_status = "BUSY" WHERE id = ?', [volunteerId]);

        // If emergency request, set request status to ASSIGNED
        if (requestId) {
          await connection.query('UPDATE emergency_requests SET status = "ASSIGNED" WHERE id = ?', [requestId]);
        }
        // If incident, set incident status to IN_PROGRESS
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

  static async updateResponseStatus(req, res, next) {
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
      const completedAt = (status === 'COMPLETED') ? new Date() : rec.completed_at;

      const connection = await pool.getConnection();
      try {
        await connection.beginTransaction();

        await connection.query(
          `UPDATE response_records SET status = ?, action_taken = ?, completed_at = ? WHERE id = ?`,
          [status, actionTaken || rec.action_taken, completedAt, id]
        );

        // If COMPLETED or ABANDONED, free up volunteer
        if (status === 'COMPLETED' || status === 'ABANDONED') {
          await connection.query('UPDATE volunteers SET availability_status = "AVAILABLE" WHERE id = ?', [rec.volunteer_id]);

          if (status === 'COMPLETED' && rec.request_id) {
            await connection.query('UPDATE emergency_requests SET status = "FULFILLED" WHERE id = ?', [rec.request_id]);
          }
          if (status === 'COMPLETED' && rec.incident_id) {
            await connection.query('UPDATE incidents SET status = "RESOLVED" WHERE id = ?', [rec.incident_id]);
          }
        }

        await connection.commit();

        res.status(200).json({
          success: true,
          message: 'Response activity updated successfully',
          data: { id, status }
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
}

module.exports = ResponseController;
