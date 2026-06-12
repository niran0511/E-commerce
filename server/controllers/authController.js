const User = require('../models/User');
const { auth: firebaseAuth } = require('../config/firebaseAdmin');

/**
 * @desc    Sync Firebase user with MongoDB (find or create)
 * @route   POST /api/auth/firebase-sync
 * @access  Public (but requires valid Firebase ID token in header)
 */
const firebaseSync = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    // Verify the Firebase ID token
    const decoded = await firebaseAuth.verifyIdToken(token);

    const { uid, email, name, picture } = decoded;
    const displayName = name || decoded.displayName || email.split('@')[0];

    // Find existing user by Firebase UID or email
    let user = await User.findOne({ $or: [{ firebaseUid: uid }, { email: email.toLowerCase() }] });

    if (user) {
      // Link existing user to Firebase if not already linked
      if (!user.firebaseUid) {
        user.firebaseUid = uid;
        if (picture && user.avatar === 'https://via.placeholder.com/150x150.png?text=User') {
          user.avatar = picture;
        }
        await user.save({ validateBeforeSave: false });
      }
    } else {
      // Create new user
      user = await User.create({
        firebaseUid: uid,
        name: displayName,
        email: email.toLowerCase(),
        avatar: picture || 'https://via.placeholder.com/150x150.png?text=User',
        role: 'user',
      });
    }

    if (user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been blocked. Please contact support.',
      });
    }

    const userObj = user.toObject();
    delete userObj.password;

    res.status(200).json({
      success: true,
      message: 'User synced successfully',
      data: { user: userObj },
    });
  } catch (error) {
    console.error('Firebase sync error:', error);
    next(error);
  }
};

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/profile
 * @access  Private
 */
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update current user profile
 * @route   PUT /api/auth/profile
 * @access  Private
 */
const updateProfile = async (req, res, next) => {
  try {
    const allowedFields = ['name', 'email', 'phone', 'avatar', 'addresses'];
    const updates = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Logout (client-side token removal)
 * @route   POST /api/auth/logout
 * @access  Private
 */
const logout = async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
};

module.exports = {
  firebaseSync,
  getProfile,
  updateProfile,
  logout,
};
