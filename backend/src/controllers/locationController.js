const pool = require('../config/db');

class LocationController {
  static async getLocations(req, res, next) {
    try {
      const { status } = req.query;
      let sql = 'SELECT * FROM safe_locations WHERE 1=1';
      const params = [];

      if (status) {
        sql += ' AND status = ?';
        params.push(status);
      }

      sql += ' ORDER BY created_at DESC';
      const [rows] = await pool.query(sql, params);

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
        }))
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
      const createdBy = req.user.id;

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

  static async updateOccupancy(req, res, next) {
    try {
      const { id } = req.params;
      const { currentOccupancy, status } = req.body;

      const [rows] = await pool.query('SELECT * FROM safe_locations WHERE id = ?', [id]);
      if (rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Safe location shelter not found' }
        });
      }

      const existing = rows[0];
      const newOccupancy = currentOccupancy !== undefined ? currentOccupancy : existing.current_occupancy;
      const newStatus = status !== undefined ? status : existing.status;

      await pool.query(
        'UPDATE safe_locations SET current_occupancy = ?, status = ? WHERE id = ?',
        [newOccupancy, newStatus, id]
      );

      // Re-fetch updated shelter record to get trigger-computed status
      const [updatedRows] = await pool.query('SELECT * FROM safe_locations WHERE id = ?', [id]);
      const updated = updatedRows[0];

      res.status(200).json({
        success: true,
        message: 'Shelter occupancy updated',
        data: {
          id: updated.id,
          currentOccupancy: updated.current_occupancy,
          status: updated.status
        }
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = LocationController;
