import React from 'react';
import { ChatListItem } from '../services/supabaseData';

interface ChatHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  chats: ChatListItem[];
  onSelectChat: (chatId: string) => void;
  onDeleteChat?: (chatId: string) => void;
  onClearAll?: () => void;
}

const ChatHistoryDrawer: React.FC<ChatHistoryDrawerProps> = ({ isOpen, onClose, chats, onSelectChat, onDeleteChat, onClearAll }) => {
  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onClose} aria-hidden="true" />
      )}
      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-80 max-w-[85%] bg-white border-l-2 border-brand-text shadow-hard z-50 transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Chat history"
      >
        <div className="p-4 border-b-2 border-brand-text flex items-center justify-between">
          <h2 className="text-lg font-bold">Chat History</h2>
          <div className="flex items-center gap-2">
            {onClearAll && (
              <button onClick={onClearAll} className="px-2 py-1 text-sm font-bold bg-white text-brand-text border-2 border-brand-text shadow-hard hover:bg-brand-accent" aria-label="Clear all chats">
                Clear All
              </button>
            )}
            <button onClick={onClose} className="px-2 py-1 text-sm font-bold bg-brand-accent text-brand-text border-2 border-brand-text shadow-hard hover:bg-amber-500">
              Close
            </button>
          </div>
        </div>
        <div className="p-3 overflow-y-auto h-[calc(100%-56px)] space-y-2">
          {chats.length === 0 && (
            <p className="text-sm text-brand-text/70">No chats yet. Start a conversation to see your chat history here.</p>
          )}
          {chats.map((c) => (
            <div key={c.id} className="w-full p-3 bg-brand-bg border-2 border-brand-text hover:bg-brand-accent transition-colors">
              <div className="flex items-start justify-between gap-2">
                <button 
                  onClick={() => onSelectChat(c.id)} 
                  className="text-left flex-1 min-w-0"
                  aria-label={`Open chat: ${c.title || 'Untitled chat'}`}
                >
                  <div className="font-bold truncate max-w-[12rem]">{c.title || 'Untitled chat'}</div>
                  <div className="text-xs text-brand-text/70">
                    {c.last_message_at 
                      ? `Updated ${new Date(c.last_message_at).toLocaleString()}` 
                      : `Created ${new Date(c.created_at).toLocaleString()}`
                    }
                  </div>
                </button>
                {onDeleteChat && (
                  <button 
                    onClick={() => onDeleteChat(c.id)} 
                    className="px-2 py-1 text-xs font-bold bg-white text-brand-text border-2 border-brand-text shadow-hard hover:bg-red-500 hover:text-white transition-colors flex-shrink-0" 
                    aria-label={`Delete chat: ${c.title || 'Untitled chat'}`}
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default ChatHistoryDrawer;


