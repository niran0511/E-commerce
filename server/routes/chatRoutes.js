const express = require('express');
const router = express.Router();
const { processMessage, getChatHistory } = require('../controllers/chatController');
const { protect } = require('../middleware/auth');

// All chat routes are protected
router.use(protect);

router.post('/', processMessage);
router.get('/history', getChatHistory);

module.exports = router;
