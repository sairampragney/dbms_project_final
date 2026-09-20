const pool = require('../config/db');

class VolunteerController {
  static async getVolunteers(req, res, next) {
    try {
      const { availabilityStatus, search, page = 1, limit = 20, sortBy = 'created_at', order = 'DESC' } = req.query;

      let whereClause = ' WHERE 1=1';
      const params = [];

      if (availabilityStatus) {
        whereClause += ' AND v.availability_status = ?';
        params.push(availabilityStatus);
      }
      if (search) {
        whereClause += ' AND (v.skills LIKE ? OR v.operating_area LIKE ? OR u.full_name LIKE ? OR u.email LIKE ?)';
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm, searchTerm, searchTerm);
      }

      const countSql = `
        SELECT COUNT(*) as total
        FROM volunteers v
        JOIN users u ON v.user_id = u.id
        ${whereClause}
      `;
      const [countResult] = await pool.query(countSql, params);
      const total = countResult[0].total;

      const pageNum = Math.max(1, parseInt(page, 10));
      const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
      const offset = (pageNum - 1) * limitNum;

      const validSortColumns = ['created_at', 'availability_status', 'operating_area'];
      const sortColumn = validSortColumns.includes(sortBy) ? `v.${sortBy}` : 'v.created_at';
      const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

      const querySql = `
        SELECT v.*, u.full_name, u.email, u.phone
        FROM volunteers v
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
          userId: r.user_id,
          fullName: r.full_name,
          email: r.email,
          phone: r.phone,
          skills: r.skills,
          operatingArea: r.operating_area,
          availabilityStatus: r.availability_status,
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

  static async getVolunteerById(req, res, next) {
    try {
      const { id } = req.params;
      const [rows] = await pool.query(
        `SELECT v.*, u.full_name, u.email, u.phone
         FROM volunteers v
         JOIN users u ON v.user_id = u.id
         WHERE v.id = ?`,
        [id]
      );

      if (rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Volunteer profile not found' }
        });
      }

      const r = rows[0];
      res.status(200).json({
        success: true,
        data: {
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
        }
      });
    } catch (err) {
      next(err);
    }
  }

  static async registerVolunteer(req, res, next) {
    try {
      const { skills, operatingArea, availabilityStatus } = req.body;
      const userId = req.user ? req.user.id : 1;

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

  static async updateVolunteer(req, res, next) {
    try {
      const { id } = req.params;
      const { skills, operatingArea, availabilityStatus } = req.body;

      const [rows] = await pool.query('SELECT * FROM volunteers WHERE id = ?', [id]);
      if (rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Volunteer profile not found' }
        });
      }

      const existing = rows[0];
      await pool.query(
        `UPDATE volunteers SET skills = ?, operating_area = ?, availability_status = ? WHERE id = ?`,
        [
          skills !== undefined ? skills : existing.skills,
          operatingArea !== undefined ? operatingArea : existing.operating_area,
          availabilityStatus !== undefined ? availabilityStatus : existing.availability_status,
          id
        ]
      );

      res.status(200).json({
        success: true,
        message: 'Volunteer profile updated successfully',
        data: {
          id,
          availabilityStatus: availabilityStatus !== undefined ? availabilityStatus : existing.availability_status
        }
      });
    } catch (err) {
      next(err);
    }
  }

  static async deleteVolunteer(req, res, next) {
    try {
      const { id } = req.params;
      const [result] = await pool.query('DELETE FROM volunteers WHERE id = ?', [id]);

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Volunteer profile not found' }
        });
      }

      res.status(200).json({
        success: true,
        message: 'Volunteer profile deleted successfully'
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = VolunteerController;
