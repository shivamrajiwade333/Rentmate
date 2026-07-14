const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

// @desc    Get user's conversations
// @route   GET /api/conversations
// @access  Private
exports.getConversations = async (req, res, next) => {
  try {
    const conversations = await Conversation.find({ participants: req.user.id })
      .populate('participants', 'name profileImage role')
      .populate('listing', 'title photos')
      .sort('-lastMessageAt');

    res.status(200).json({ success: true, count: conversations.length, data: conversations });
  } catch (error) {
    next(error);
  }
};

// @desc    Get messages for a conversation
// @route   GET /api/conversations/:id/messages
// @access  Private
exports.getMessages = async (req, res, next) => {
  try {
    const { page = 1, limit = 30 } = req.query;
    
    const conversation = await Conversation.findById(req.params.id);
    
    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    if (!conversation.participants.includes(req.user.id)) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this conversation' });
    }

    const skip = (Number(page) - 1) * Number(limit);

    const messages = await Message.find({ conversation: req.params.id })
      .sort('-createdAt')
      .skip(skip)
      .limit(Number(limit));

    // Reverse messages for frontend display (oldest first if desired, or frontend handles it)
    
    res.status(200).json({
      success: true,
      page: Number(page),
      data: messages
    });
  } catch (error) {
    next(error);
  }
};
