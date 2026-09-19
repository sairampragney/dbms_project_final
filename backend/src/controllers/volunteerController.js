const pool = require('../config/db');

class VolunteerController {
  static async getVolunteers(req, res, next) {
    try {
      const { availabilityStatus } = req.query;
      let sql = `
        SELECT v.*, u.full_name, u.email, u.phone
        FROM volunteers v
        JOIN users u ON v.user_id = u.id
        WHERE 1=1
      `;
      const params = [];

      if (availabilityStatus) {
        sql += ' AND v.availability_status = ?';
        params.push(availabilityStatus);
      }

      sql += ' ORDER BY v.created_at DESC';
      const [rows] = await pool.query(sql, params);

      res.status(200).json({
        success: true,
        data: rows.map(r => ({
          id: r.id,
          userId: r.user_id,
          fullName: r.full_name,
          email: r.email,
          phone: r.phone,
          skills: r.skills,
          operatingArea: r.operating_area,
          availabilityStatus: r.availability_status,
          createdAt: r.created_at,
          updatedAt: r.updated_at
        }))
      });
    } catch (err) {
      next(err);
    }
  }

  static async registerVolunteer(req, res, next) {
    try {
      const { skills, operatingArea, availabilityStatus } = req.body;
      const userId = req.user.id;

      const [existing] = await pool.query('SELECT * FROM volunteers WHERE user_id = ?', [userId]);
      if (existing.length > 0) {
        return res.status(400).json({
          success: false,
          error: { code: 'ALREADY_REGISTERED', message: 'User is already registered as a volunteer' }
        });
      }

      const connection = await pool.getConnection();
      try {
        await connection.beginTransaction();

        const [result] = await connection.query(
          `INSERT INTO volunteers (user_id, skills, operating_area, availability_status)
           VALUES (?, ?, ?, ?)`,
          [userId, skills, operatingArea, availabilityStatus || 'AVAILABLE']
        );

        // Update user's system role to VOLUNTEER
        await connection.query('UPDATE users SET role = "VOLUNTEER" WHERE id = ? AND role = "CITIZEN"', [userId]);

        await connection.commit();

        res.status(201).json({
          success: true,
          message: 'Registered as volunteer responder successfully',
          data: {
            id: result.insertId,
            userId,
            availabilityStatus: availabilityStatus || 'AVAILABLE'
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

  static async updateAvailability(req, res, next) {
    try {
      const { id } = req.params;
      const { availabilityStatus } = req.body;

      const [result] = await pool.query(
        'UPDATE volunteers SET availability_status = ? WHERE id = ?',
        [availabilityStatus, id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Volunteer profile not found' }
        });
      }

      res.status(200).json({
        success: true,
        message: 'Volunteer availability updated',
        data: { id, availabilityStatus }
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = VolunteerController;
