
import React, { useEffect, useRef } from 'react';
import { Message } from '../types';
import ChatMessage from './ChatMessage';

interface ChatWindowProps {
  messages: Message[];
}

const ChatWindow: React.FC<ChatWindowProps> = ({ messages }) => {
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only auto-scroll if we're near the bottom or if it's a new message
    const chatContainer = chatEndRef.current?.parentElement;
    if (chatContainer) {
      const isNearBottom = chatContainer.scrollHeight - chatContainer.scrollTop - chatContainer.clientHeight < 100;
      if (isNearBottom || messages.length <= 2) {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [messages]);

  return (
    <div className="flex-1 min-h-0 overflow-y-auto pr-4 -mr-4 space-y-6">
      {messages.map((msg) => (
        <ChatMessage key={msg.id} message={msg} />
      ))}
      <div ref={chatEndRef} />
    </div>
  );
};

export default ChatWindow;
