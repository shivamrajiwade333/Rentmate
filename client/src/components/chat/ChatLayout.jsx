import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { Send, User as UserIcon, Loader2, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import api from '../../services/api';

const ChatLayout = ({ currentUserRole }) => {
  const [conversations, setConversations] = parseInt([]) || useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const [loadingChats, setLoadingChats] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const messagesEndRef = useRef(null);
  
  // Connect to Socket.io
  useEffect(() => {
    const token = localStorage.getItem('token');
    const newSocket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000', {
      auth: { token }
    });

    newSocket.on('connect', () => {
      console.log('Connected to chat server');
    });

    newSocket.on('new_message', (message) => {
      setMessages((prev) => [...prev, message]);
      
      // Update last message in conversation list
      setConversations((prev) => prev.map(conv => {
        if (conv._id === message.conversation) {
          return { ...conv, lastMessage: message.text, lastMessageAt: message.createdAt };
        }
        return conv;
      }));
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Fetch Conversations
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await api.get('/conversations');
        setConversations(res.data.data);
      } catch (error) {
        console.error('Error fetching conversations:', error);
      } finally {
        setLoadingChats(false);
      }
    };
    fetchConversations();
  }, []);

  // Join active chat room and fetch messages
  useEffect(() => {
    if (activeChat && socket) {
      socket.emit('join_conversation', activeChat._id);
      
      const fetchMessages = async () => {
        setLoadingMessages(true);
        try {
          const res = await api.get(`/conversations/${activeChat._id}/messages?limit=100`);
          // Backend returns newest first or oldest first. Let's assume we need to reverse if it's newest first.
          // The backend controller says: sort('-createdAt')
          setMessages(res.data.data.reverse());
        } catch (error) {
          console.error('Error fetching messages:', error);
        } finally {
          setLoadingMessages(false);
        }
      };
      
      fetchMessages();

      return () => {
        socket.emit('leave_conversation', activeChat._id);
      };
    }
  }, [activeChat, socket]);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat || !socket) return;

    socket.emit('send_message', {
      conversationId: activeChat._id,
      text: newMessage
    });
    
    setNewMessage('');
  };

  const getOtherParticipant = (participants) => {
    // Current user's ID can be parsed from JWT, but we can just filter by role.
    // If we are owner, other is tenant. If we are tenant, other is owner.
    return participants.find(p => p.role !== currentUserRole) || participants[0];
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-[600px] flex overflow-hidden">
      
      {/* Sidebar: Conversation List */}
      <div className={`w-full md:w-1/3 border-r border-gray-200 flex flex-col ${activeChat ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-bold text-gray-900">Conversations</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {loadingChats ? (
            <div className="flex justify-center items-center h-full">
              <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p>No active conversations yet.</p>
            </div>
          ) : (
            conversations.map((conv) => {
              const otherUser = getOtherParticipant(conv.participants);
              return (
                <div 
                  key={conv._id}
                  onClick={() => setActiveChat(conv)}
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition ${activeChat?._id === conv._id ? 'bg-primary-50 border-l-4 border-primary-500' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center overflow-hidden">
                      {otherUser?.profileImage ? (
                        <img src={otherUser.profileImage} alt={otherUser.name} className="w-full h-full object-cover" />
                      ) : (
                        <UserIcon className="w-5 h-5 text-gray-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-0.5">
                        <h3 className="text-sm font-semibold text-gray-900 truncate">{otherUser?.name}</h3>
                        {conv.lastMessageAt && (
                          <span className="text-xs text-gray-500">
                            {format(new Date(conv.lastMessageAt), 'MMM d')}
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-medium text-primary-600 truncate mb-1">{conv.listing?.title}</p>
                      <p className="text-sm text-gray-500 truncate">{conv.lastMessage || 'No messages yet'}</p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Main Area: Active Chat */}
      <div className={`flex-1 flex flex-col ${!activeChat ? 'hidden md:flex' : 'flex'}`}>
        {!activeChat ? (
          <div className="flex-1 flex items-center justify-center bg-gray-50 text-gray-400 flex-col gap-4">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
              <UserIcon className="w-8 h-8 text-gray-300" />
            </div>
            <p>Select a conversation to start chatting</p>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 bg-white flex items-center gap-4 shadow-sm z-10">
              <button 
                onClick={() => setActiveChat(null)}
                className="md:hidden p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-lg"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
                  {getOtherParticipant(activeChat.participants)?.profileImage ? (
                    <img src={getOtherParticipant(activeChat.participants).profileImage} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon className="w-5 h-5 text-gray-500" />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{getOtherParticipant(activeChat.participants)?.name}</h3>
                  <p className="text-xs text-gray-500 truncate max-w-xs">{activeChat.listing?.title}</p>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
              {loadingMessages ? (
                <div className="flex justify-center items-center h-full">
                  <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center text-gray-400 mt-10">
                  <p>Send a message to start the conversation.</p>
                </div>
              ) : (
                messages.map((msg, idx) => {
                  // If current user is not sender, they receive it. We can check by role match on the participant.
                  // Wait, message has sender ID. Let's compare sender ID with other user ID.
                  const otherUser = getOtherParticipant(activeChat.participants);
                  const isMe = msg.sender !== otherUser?._id;
                  
                  return (
                    <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                        isMe 
                          ? 'bg-primary-600 text-white rounded-br-none' 
                          : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm'
                      }`}>
                        <p className="text-sm">{msg.text}</p>
                        <p className={`text-[10px] mt-1 text-right ${isMe ? 'text-primary-200' : 'text-gray-400'}`}>
                          {format(new Date(msg.createdAt), 'h:mm a')}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 bg-white border-t border-gray-200">
              <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-gray-100 border-transparent rounded-full px-4 py-2.5 focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="p-2.5 bg-primary-600 text-white rounded-full hover:bg-primary-700 disabled:opacity-50 transition shadow-sm"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ChatLayout;
