import React, { useState, useEffect, useCallback } from 'react';
import SendIcon from './icons/SendIcon';
import Loader from './Loader';

interface MessageInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  onAutoSubmit?: (text: string) => void; // New prop for automatic submission
}

const MessageInput: React.FC<MessageInputProps> = ({
  value,
  onChange,
  onSubmit,
  isLoading,
  onAutoSubmit,
}) => {
  return (
    <div className="space-y-2">
      {/* Main input form */}
      <form onSubmit={onSubmit} className="flex items-center bg-brand-bg border-2 border-brand-text p-2 shadow-hard">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Ask about savings, taxes, or investments..."
          className="flex-1 bg-transparent border-none focus:ring-0 text-brand-text placeholder-brand-text/60 px-3 py-2"
          disabled={isLoading}
          maxLength={1000}
          aria-label="Message input"
        />
        
        {/* Send Button */}
        <button
          type="submit"
          disabled={isLoading || !value.trim()}
          className="bg-brand-accent text-brand-text p-2.5 ml-2 border-2 border-brand-text shadow-hard transition-all duration-200 enabled:hover:bg-amber-500 enabled:active:translate-x-1 enabled:active:translate-y-1 enabled:active:shadow-none disabled:bg-gray-400 disabled:cursor-not-allowed disabled:shadow-none focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-accent"
          aria-label="Send message"
        >
          {isLoading ? <Loader size="sm" /> : <SendIcon />}
        </button>
      </form>
    </div>
  );
};

export default MessageInput;