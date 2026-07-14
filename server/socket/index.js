const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

let io;

exports.initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      credentials: true,
    },
  });

  // Authentication middleware for socket
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
      
      if (!token) {
        return next(new Error('Authentication error: No token'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }

      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.id}`);

    // Join a conversation room
    socket.on('join_conversation', async (conversationId) => {
      try {
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
          socket.emit('message_error', 'Conversation not found');
          return;
        }

        // Verify membership
        if (!conversation.participants.includes(socket.user.id)) {
          socket.emit('message_error', 'Not authorized to join this conversation');
          return;
        }

        socket.join(conversationId);
        socket.emit('conversation_joined', conversationId);
      } catch (err) {
        socket.emit('message_error', 'Error joining conversation');
      }
    });

    socket.on('leave_conversation', (conversationId) => {
      socket.leave(conversationId);
    });

    socket.on('send_message', async (data) => {
      try {
        const { conversationId, text } = data;
        
        if (!text || text.trim() === '') return;

        const conversation = await Conversation.findById(conversationId);
        if (!conversation || !conversation.participants.includes(socket.user.id)) {
          return socket.emit('message_error', 'Not authorized');
        }

        const message = await Message.create({
          conversation: conversationId,
          sender: socket.user.id,
          text: text.trim(),
          readBy: [socket.user.id]
        });

        conversation.lastMessage = text.trim();
        conversation.lastMessageAt = new Date();
        await conversation.save();

        io.to(conversationId).emit('new_message', {
          _id: message._id,
          conversation: conversationId,
          sender: socket.user.id,
          text: message.text,
          createdAt: message.createdAt
        });
      } catch (err) {
        socket.emit('message_error', 'Failed to send message');
      }
    });

    socket.on('typing_start', (conversationId) => {
      socket.to(conversationId).emit('user_typing', { userId: socket.user.id, typing: true });
    });

    socket.on('typing_stop', (conversationId) => {
      socket.to(conversationId).emit('user_typing', { userId: socket.user.id, typing: false });
    });

    socket.on('mark_read', async (data) => {
      try {
        const { conversationId } = data;
        await Message.updateMany(
          { conversation: conversationId, readBy: { $ne: socket.user.id } },
          { $push: { readBy: socket.user.id } }
        );
        
        socket.to(conversationId).emit('messages_read', { conversationId, userId: socket.user.id });
      } catch (err) {
        console.error('Error marking messages as read', err);
      }
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user.id}`);
    });
  });
};

exports.getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};
