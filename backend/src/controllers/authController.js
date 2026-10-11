const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { get, run, query } = require('../config/db');
const { JWT_SECRET } = require('../middleware/authMiddleware');
const { saveBase64Image } = require('../middleware/uploadMiddleware');

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    const user = await get(
      `SELECT id, name, email, password_hash, role, department, employee_id_code, signature_url FROM users WHERE LOWER(email) = LOWER(?)`,
      [email.trim()]
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role,
        name: user.name,
      },
      JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    const userPayload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      employee_id_code: user.employee_id_code,
      signature_url: user.signature_url,
    };

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: userPayload,
    });
  } catch (err) {
    next(err);
  }
};

const getMe = async (req, res, next) => {
  try {
    return res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (err) {
    next(err);
  }
};

const updateProfileSignature = async (req, res, next) => {
  try {
    let signatureUrl = null;

    if (req.file) {
      signatureUrl = `/uploads/signatures/${req.file.filename}`;
    } else if (req.body.signatureData) {
      signatureUrl = saveBase64Image(req.body.signatureData, `user-${req.user.id}`);
    } else if (req.body.signatureUrl) {
      signatureUrl = req.body.signatureUrl;
    }

    if (!signatureUrl) {
      return res.status(400).json({
        success: false,
        message: 'No signature image provided.',
      });
    }

    await run(`UPDATE users SET signature_url = ? WHERE id = ?`, [signatureUrl, req.user.id]);

    const updatedUser = await get(
      `SELECT id, name, email, role, department, employee_id_code, signature_url FROM users WHERE id = ?`,
      [req.user.id]
    );

    return res.status(200).json({
      success: true,
      message: 'Signature updated successfully',
      user: updatedUser,
    });
  } catch (err) {
    next(err);
  }
};

// Helpful endpoint to get demo accounts list for evaluation convenience
const getDemoAccounts = async (req, res, next) => {
  try {
    const users = await query(
      `SELECT id, name, email, role, department, employee_id_code FROM users ORDER BY id ASC`
    );
    return res.status(200).json({
      success: true,
      demoUsers: users,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  login,
  getMe,
  updateProfileSignature,
  getDemoAccounts,
};
