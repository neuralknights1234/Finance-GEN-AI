import React from 'react';
import { Message, Sender } from '../types';
import BotIcon from './icons/BotIcon';
import UserIcon from './icons/UserIcon';

interface ChatMessageProps {
  message: Message;
}

// Helper component defined outside ChatMessage to prevent re-creation on re-renders
const TypingIndicator: React.FC = () => (
  <div className="flex items-center space-x-1">
    <span className="w-2 h-2 bg-brand-text/50 rounded-full animate-pulse" style={{animationDelay: '-0.3s'}}></span>
    <span className="w-2 h-2 bg-brand-text/50 rounded-full animate-pulse" style={{animationDelay: '-0.15s'}}></span>
    <span className="w-2 h-2 bg-brand-text/50 rounded-full animate-pulse"></span>
  </div>
);


const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.sender === Sender.USER;
  const isEmptyBotMessage = message.sender === Sender.BOT && !message.text;

  const containerClasses = `flex items-start gap-4 ${isUser ? 'justify-end' : 'justify-start'}`;
  const bubbleClasses = `max-w-lg px-5 py-3 break-words border-2 border-brand-text shadow-hard ${
    isUser
      ? 'bg-brand-accent text-brand-text'
      : 'bg-white text-brand-text'
  }`;
  
  const sanitizedText = isUser ? message.text : message.text.replace(/\*/g, '');
  const textWithLineBreaks = sanitizedText.split('\n').map((line, index) => (
    <React.Fragment key={index}>
      {line}
      <br />
    </React.Fragment>
  ));

  return (
    <div className={containerClasses}>
      {!isUser && (
        <div className="flex-shrink-0 w-10 h-10 border-2 border-brand-text bg-white flex items-center justify-center">
          <BotIcon />
        </div>
      )}
      <div
        className={bubbleClasses}
        style={
          isUser
            ? undefined
            : {
                fontFamily:
                  '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "San Francisco", "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
              }
        }
      >
        {isEmptyBotMessage ? <TypingIndicator /> : textWithLineBreaks}
      </div>
      {isUser && (
        <div className="flex-shrink-0 w-10 h-10 border-2 border-brand-text bg-brand-text flex items-center justify-center">
          <UserIcon />
        </div>
      )}
    </div>
  );
};

export default ChatMessage;