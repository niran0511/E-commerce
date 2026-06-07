const { processChat } = require('../services/aiService');

/**
 * @desc    Process a chat message via AI
 * @route   POST /api/chat
 * @access  Private
 */
const processMessage = async (req, res, next) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message is required',
      });
    }

    const response = await processChat(message.trim(), req.user._id);

    res.status(200).json({
      success: true,
      data: {
        reply: response,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get chat history (session-based – returns empty)
 * @route   GET /api/chat/history
 * @access  Private
 */
const getChatHistory = async (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      messages: [],
      note: 'Chat is session-based. History is managed on the client side.',
    },
  });
};

module.exports = {
  processMessage,
  getChatHistory,
};
