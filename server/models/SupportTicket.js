const mongoose = require('mongoose');

const supportTicketSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    issueType: {
      type: String,
      required: true,
      enum: ['Order Mistake', 'Payment Issue', 'Delivery Delay', 'Product Quality', 'Other'],
    },
    phone: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['Open', 'Resolved'],
      default: 'Open',
    },
    adminReply: {
      type: String,
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('SupportTicket', supportTicketSchema);
