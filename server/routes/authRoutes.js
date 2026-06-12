const express = require('express');
const router = express.Router();
const {
  firebaseSync,
  getProfile,
  updateProfile,
  logout,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Public route — syncs Firebase user with MongoDB
router.post('/firebase-sync', firebaseSync);

// Protected routes
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.post('/logout', protect, logout);

module.exports = router;
