const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { protect } = require('../middleware/auth');
const { admin } = require('../middleware/admin');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer config for local storage
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadDir);
  },
  filename(req, file, cb) {
    // Generate unique filename: fieldname-timestamp.ext
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

// Check file type
function checkFileType(file, cb) {
  const filetypes = /jpg|jpeg|png|webp|gif/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Images only! (jpg, jpeg, png, webp, gif)'));
  }
}

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit per file
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

// @route   POST /api/upload
// @desc    Upload multiple image files
// @access  Private/Admin
router.post('/', protect, admin, upload.array('images', 10), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No files were uploaded.' });
    }

    const fileUrls = req.files.map(file => `/uploads/${file.filename}`);

    res.status(200).json({
      success: true,
      message: 'Images uploaded successfully',
      data: {
        urls: fileUrls
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server error during upload' });
  }
});

module.exports = router;
