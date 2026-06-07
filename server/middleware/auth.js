const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config/config');

/**
 * Protect routes – verifies JWT from Authorization header.
 * Attaches the authenticated user to req.user.
 */
const protect = async (req, res, next) => {
  try {
    let token;

    // Extract token from "Bearer <token>" header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized – no token provided',
      });
    }

    // Verify token
    const decoded = jwt.verify(token, config.jwtSecret);

    // Find the user and attach to request
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized – user no longer exists',
      });
    }

    if (user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been blocked. Please contact support.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired. Please log in again.',
      });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. Please log in again.',
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Not authorized',
    });
  }
};

/**
 * userOnly – Blocks admin accounts from customer actions.
 * Used on cart, checkout, and order creation routes.
 */
const userOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admins cannot perform customer actions. Use the admin panel to manage orders.',
    });
  }
  next();
};

module.exports = { protect, userOnly };
