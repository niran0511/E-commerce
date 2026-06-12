const { auth: firebaseAuth } = require('../config/firebaseAdmin');
const User = require('../models/User');

/**
 * Protect routes – verifies Firebase ID token from Authorization header.
 * Finds or creates the user in MongoDB and attaches to req.user.
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

    // Verify Firebase ID token
    const decoded = await firebaseAuth.verifyIdToken(token);

    // Find user by Firebase UID
    const user = await User.findOne({ firebaseUid: decoded.uid });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized – user not found. Please sign in again.',
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
    console.error('Auth middleware error:', error.message);

    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired. Please log in again.',
      });
    }
    if (error.code === 'auth/argument-error' || error.code === 'auth/id-token-revoked') {
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
