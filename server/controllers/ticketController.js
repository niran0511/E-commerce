const SupportTicket = require('../models/SupportTicket');

// @desc    Create a new support ticket
// @route   POST /api/tickets
// @access  Private
const createTicket = async (req, res, next) => {
  try {
    const { issueType, message } = req.body;

    if (!issueType || !message) {
      return res.status(400).json({ success: false, message: 'Please provide issueType and message' });
    }

    const ticket = await SupportTicket.create({
      user: req.user._id,
      issueType,
      message,
    });

    res.status(201).json({ success: true, data: { ticket } });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all tickets for admin
// @route   GET /api/tickets/admin
// @access  Private/Admin
const getAdminTickets = async (req, res, next) => {
  try {
    const tickets = await SupportTicket.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: { tickets } });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTicket,
  getAdminTickets,
};
