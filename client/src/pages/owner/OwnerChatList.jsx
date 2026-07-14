import React from 'react';
import ChatLayout from '../../components/chat/ChatLayout';

const OwnerChatList = () => {
  return (
    <div className="animate-fadeIn">
      <ChatLayout currentUserRole="owner" />
    </div>
  );
};

export default OwnerChatList;
