/**
 * Admin authorization middleware.
 * Must be used AFTER the protect middleware.
 */
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: 'Forbidden – admin access required',
  });
};

module.exports = { admin };
