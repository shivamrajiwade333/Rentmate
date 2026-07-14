import React from 'react';
import ChatLayout from '../../components/chat/ChatLayout';

const ChatList = () => {
  return (
    <div className="animate-fadeIn">
      <ChatLayout currentUserRole="tenant" />
    </div>
  );
};

export default ChatList;
