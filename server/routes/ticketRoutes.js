const express = require('express');
const { createTicket, getAdminTickets } = require('../controllers/ticketController');
const { protect } = require('../middleware/auth');
const { admin } = require('../middleware/admin');

const router = express.Router();

// User routes
router.post('/', protect, createTicket);

// Admin routes
router.get('/admin', protect, admin, getAdminTickets);

module.exports = router;
