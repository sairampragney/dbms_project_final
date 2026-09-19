const pool = require('../config/db');

class LocationController {
  static async getLocations(req, res, next) {
    try {
      const { status, search, page = 1, limit = 20, sortBy = 'created_at', order = 'DESC' } = req.query;

      let whereClause = ' WHERE 1=1';
      const params = [];

      if (status) {
        whereClause += ' AND status = ?';
        params.push(status);
      }
      if (search) {
        whereClause += ' AND (name LIKE ? OR address LIKE ? OR facilities LIKE ?)';
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm, searchTerm);
      }

      const [countResult] = await pool.query(`SELECT COUNT(*) as total FROM safe_locations${whereClause}`, params);
      const total = countResult[0].total;

      const pageNum = Math.max(1, parseInt(page, 10));
      const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
      const offset = (pageNum - 1) * limitNum;

      const validSortColumns = ['created_at', 'name', 'capacity', 'current_occupancy', 'status'];
      const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'created_at';
      const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

      const querySql = `SELECT * FROM safe_locations${whereClause} ORDER BY ${sortColumn} ${sortOrder} LIMIT ? OFFSET ?`;
      const queryParams = [...params, limitNum, offset];

      const [rows] = await pool.query(querySql, queryParams);

      res.status(200).json({
        success: true,
        data: rows.map(r => ({
          id: r.id,
          name: r.name,
          address: r.address,
          capacity: r.capacity,
          currentOccupancy: r.current_occupancy,
          facilities: r.facilities,
          status: r.status,
          contactPhone: r.contact_phone,
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

  static async getLocationById(req, res, next) {
    try {
      const { id } = req.params;
      const [rows] = await pool.query('SELECT * FROM safe_locations WHERE id = ?', [id]);
      if (rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Safe location shelter not found' }
        });
      }

      const r = rows[0];
      res.status(200).json({
        success: true,
        data: {
          id: r.id,
          name: r.name,
          address: r.address,
          capacity: r.capacity,
          currentOccupancy: r.current_occupancy,
          facilities: r.facilities,
          status: r.status,
          contactPhone: r.contact_phone,
          createdBy: r.created_by,
          createdAt: r.created_at,
          updatedAt: r.updated_at
        }
      });
    } catch (err) {
      next(err);
    }
  }

  static async createLocation(req, res, next) {
    try {
      const { name, address, capacity, currentOccupancy, facilities, contactPhone, status } = req.body;
      const createdBy = req.user ? req.user.id : 1;

      const [result] = await pool.query(
        `INSERT INTO safe_locations (name, address, capacity, current_occupancy, facilities, contact_phone, status, created_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          name,
          address,
          capacity,
          currentOccupancy || 0,
          facilities || null,
          contactPhone || null,
          status || 'OPEN',
          createdBy
        ]
      );

      res.status(201).json({
        success: true,
        message: 'Safe location registered successfully',
        data: {
          id: result.insertId,
          name,
          status: status || 'OPEN'
        }
      });
    } catch (err) {
      next(err);
    }
  }

  static async updateLocation(req, res, next) {
    try {
      const { id } = req.params;
      const { name, address, capacity, currentOccupancy, facilities, contactPhone, status } = req.body;

      const [rows] = await pool.query('SELECT * FROM safe_locations WHERE id = ?', [id]);
      if (rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Safe location shelter not found' }
        });
      }

      const existing = rows[0];
      await pool.query(
        `UPDATE safe_locations SET
           name = ?, address = ?, capacity = ?, current_occupancy = ?, facilities = ?, contact_phone = ?, status = ?
         WHERE id = ?`,
        [
          name !== undefined ? name : existing.name,
          address !== undefined ? address : existing.address,
          capacity !== undefined ? capacity : existing.capacity,
          currentOccupancy !== undefined ? currentOccupancy : existing.current_occupancy,
          facilities !== undefined ? facilities : existing.facilities,
          contactPhone !== undefined ? contactPhone : existing.contact_phone,
          status !== undefined ? status : existing.status,
          id
        ]
      );

      const [updatedRows] = await pool.query('SELECT * FROM safe_locations WHERE id = ?', [id]);
      const updated = updatedRows[0];

      res.status(200).json({
        success: true,
        message: 'Safe location updated successfully',
        data: {
          id: updated.id,
          name: updated.name,
          currentOccupancy: updated.current_occupancy,
          status: updated.status
        }
      });
    } catch (err) {
      next(err);
    }
  }

  static async deleteLocation(req, res, next) {
    try {
      const { id } = req.params;
      const [result] = await pool.query('DELETE FROM safe_locations WHERE id = ?', [id]);

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Safe location shelter not found' }
        });
      }

      res.status(200).json({
        success: true,
        message: 'Safe location shelter deleted successfully'
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = LocationController;
