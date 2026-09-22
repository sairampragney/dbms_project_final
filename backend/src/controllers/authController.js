const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

class AuthModel {
  static async findByEmail(email) {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0] || null;
  }

  static async findById(id) {
    const [rows] = await pool.query(
      'SELECT id, full_name, email, phone, role, is_active, created_at FROM users WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  }

  static async createUser({ fullName, email, passwordHash, phone, role }) {
    const [result] = await pool.query(
      'INSERT INTO users (full_name, email, password_hash, phone, role) VALUES (?, ?, ?, ?, ?)',
      [fullName, email, passwordHash, phone || null, role || 'CITIZEN']
    );
    return result.insertId;
  }
}

class AuthController {
  static async register(req, res, next) {
    try {
      const { fullName, email, password, phone } = req.body;
      const normalizedEmail = (email || '').trim().toLowerCase();

      const existingUser = await AuthModel.findByEmail(normalizedEmail);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'EMAIL_EXISTS',
            message: 'User with this email already exists'
          }
        });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      // Hardened: Public registration ALWAYS assigns CITIZEN role regardless of client payload
      const userId = await AuthModel.createUser({
        fullName,
        email: normalizedEmail,
        passwordHash,
        phone,
        role: 'CITIZEN'
      });

      const user = await AuthModel.findById(userId);
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET || 'supersecretjwtkey_change_in_production',
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user,
          token
        }
      });
    } catch (err) {
      next(err);
    }
  }

  static async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const normalizedEmail = (email || '').trim().toLowerCase();

      const user = await AuthModel.findByEmail(normalizedEmail);
      if (!user) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Invalid email or password'
          }
        });
      }

      // Hardened: Enforce active user status check
      if (user.is_active === false || user.is_active === 0) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'ACCOUNT_DISABLED',
            message: 'Account has been disabled. Please contact system administration.'
          }
        });
      }

      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Invalid email or password'
          }
        });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET || 'supersecretjwtkey_change_in_production',
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      const userProfile = {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isActive: user.is_active,
        createdAt: user.created_at
      };

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          user: userProfile,
          token
        }
      });
    } catch (err) {
      next(err);
    }
  }

  static async getMe(req, res, next) {
    try {
      const user = await AuthModel.findById(req.user.id);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'User not found' }
        });
      }

      res.status(200).json({
        success: true,
        data: user
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = AuthController;
