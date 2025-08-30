import React, { useState, useEffect } from 'react';
import { Chat } from '@google/genai';
import { Message, UserProfile, Sender } from '../../types';
import { createEnhancedChatSession, updateChatWithFinancialData } from '../../services/geminiService';
import ChatWindow from '../ChatWindow';
import MessageInput from '../MessageInput';
import SuggestedTopics from '../SuggestedTopics';
import NewChatIcon from '../icons/NewChatIcon';
import { createChat, loadLatestChatMessages, saveChatMessages } from '../../services/supabaseData';
import ChatHistoryDrawer from '../ChatHistoryDrawer';
import { ChatListItem, listChats, loadChatMessagesById, updateChatTitle, deleteChat, clearAllChats } from '../../services/supabaseData';


import ChatHeaderSparkle from '../icons/ChatHeaderSparkle';

interface ChatScreenProps {
  userProfile: UserProfile;
  onBack?: () => void;
}

const ChatScreen: React.FC<ChatScreenProps> = ({ userProfile, onBack }) => {
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [followups, setFollowups] = useState<string[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [chatList, setChatList] = useState<ChatListItem[]>([]);


  const startNewChat = async (profile: UserProfile) => {
    try {
      const newChat = await createEnhancedChatSession(profile);
      setChat(newChat);
      setMessages([]);
      // Create a Supabase chat row if logged in
      const newId = await createChat();
      setActiveChatId(newId);
      setInputValue('');
      setIsLoading(false);
      setError(null);
    } catch (e) {
      console.error('Error starting new chat:', e);
      setChat(null);
      setMessages([]);
      setIsLoading(false);
      setError('Failed to start chat. Please try again.');
    }
  };

  // Reset chat only when persona changes, to avoid losing history on other profile edits
  useEffect(() => {
    startNewChat(userProfile);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userProfile.persona]);

  // Load last chat if available
  useEffect(() => {
    (async () => {
      try {
        const { chatId, messages: persisted } = await loadLatestChatMessages(1);
        if (persisted.length > 0) {
          setMessages(persisted);
          setActiveChatId(chatId);
        }
        const list = await listChats();
        setChatList(list);
      } catch (_) {
        // ignore
      }
    })();
  }, []);

  const handleNewChat = () => {
    // Starts a new chat with the LATEST profile info
    startNewChat(userProfile);
  };

  const openHistory = async () => {
    try { setChatList(await listChats()); } catch {}
    setIsHistoryOpen(true);
  };

  const handleSelectChat = async (chatId: string) => {
    try {
      const msgs = await loadChatMessagesById(chatId);
      if (msgs.length > 0) {
        setMessages(msgs);
        setActiveChatId(chatId);
      }
    } catch (_) {}
    setIsHistoryOpen(false);
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || !chat) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: Sender.USER,
    };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setIsLoading(true);
    setError(null);

    const botMessageId = (Date.now() + 1).toString();
    const botMessagePlaceholder: Message = {
      id: botMessageId,
      text: '',
      sender: Sender.BOT,
    };
    setMessages((prevMessages) => [...prevMessages, botMessagePlaceholder]);
    
    try {
      const stream = await chat.sendMessageStream({ message: text });
      
      let accumulatedText = '';
      for await (const chunk of stream) {
        if (chunk.text) {
          accumulatedText += chunk.text;
          setMessages((prevMessages) =>
            prevMessages.map((msg) =>
              msg.id === botMessageId ? { ...msg, text: accumulatedText } : msg
            )
          );
        }
      }

      // Persist the full exchange for authenticated users
      try {
        if (activeChatId) {
          await saveChatMessages(activeChatId, [userMessage, { id: botMessageId, text: accumulatedText, sender: Sender.BOT }]);
        }
      } catch (persistError) {
        console.error('Failed to persist messages:', persistError);
        // Don't show error to user for persistence issues
      }

      // Generate follow-ups based on last bot message and user input
      const nextSteps: string[] = generateFollowups(text, accumulatedText);
      setFollowups(nextSteps);
      
      try {
        // Generate concise title from first user message
        if (activeChatId) {
          const concise = text.trim().slice(0, 40) + (text.trim().length > 40 ? '…' : '');
          await updateChatTitle(activeChatId, concise);
        }
        setChatList(await listChats());
      } catch (updateError) {
        console.error('Failed to update chat title:', updateError);
        // Don't show error to user for title update issues
      }
    } catch (err) {
      console.error('Chat error:', err);
      const errorMessage = err instanceof Error && err.message.includes('API key') 
        ? 'API key missing or invalid. Please check your configuration.'
        : 'Sorry, I encountered an error. Please try again.';
      setError(errorMessage);
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === botMessageId ? { ...msg, text: errorMessage } : msg
        )
      );
      setFollowups([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteChat = async (chatId: string) => {
    try {
      await deleteChat(chatId);
      setChatList(await listChats());
      if (activeChatId === chatId) {
        // If current chat deleted, start a fresh one
        startNewChat(userProfile);
      }
    } catch (_) {}
  };

  const handleClearAll = async () => {
    try {
      await clearAllChats();
      setChatList([]);
      startNewChat(userProfile);
    } catch (_) {}
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      handleSendMessage(inputValue);
      setInputValue('');
    }
  };

  const handleTopicSelect = (topic: string) => {
    if (isLoading) return;
    handleSendMessage(topic);
    setInputValue('');
  };

  const handleFollowupClick = (suggestion: string) => {
    if (isLoading) return;
    handleSendMessage(suggestion);
  };

  const handleShareData = async () => {
    if (isLoading) return;
    
    try {
      // Update chat with fresh financial data
      if (chat) {
        await updateChatWithFinancialData(chat, userProfile);
        console.log('Financial data updated with AI for enhanced context...');
        alert('Financial data refreshed! AI now has access to your latest financial information.');
      }
    } catch (error) {
      console.error('Error updating financial data:', error);
      alert('Error updating financial data. Please try again.');
    }
  };

  return (
    <div className="flex flex-col h-full bg-brand-bg">
       <header className="bg-brand-bg border-b-4 border-brand-text p-4">
        <div className="max-w-4xl mx-auto flex items-center">
          <div className="flex items-center gap-2">
            {onBack && (
              <button onClick={onBack} className="px-3 py-2 text-sm font-bold bg-white text-brand-text border-2 border-brand-text shadow-hard hover:bg-brand-accent" aria-label="Back to landing">Back</button>
            )}
            <h1 className="text-xl md:text-2xl font-bold flex items-center">Personal Finance Chatbot <ChatHeaderSparkle /></h1>
          </div>
          <div className="ml-auto flex items-center gap-4">
            <button
              onClick={openHistory}
              className="flex items-center px-3 py-2 text-sm font-bold bg-white text-brand-text border-2 border-brand-text shadow-hard transition-all duration-200 hover:bg-brand-accent"
              aria-label="Open chat history"
            >
              History
            </button>
            <button
              onClick={handleShareData}
              disabled={isLoading}
              className="flex items-center px-3 py-2 text-sm font-bold bg-white text-brand-text border-2 border-brand-text shadow-hard transition-all duration-200 hover:bg-brand-accent disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-accent hover:translate-y-[-1px]"
              aria-label="Share my data"
            >
              Share Data
            </button>
            <button
              onClick={handleNewChat}
              className="flex items-center px-3 py-2 text-sm font-bold bg-white text-brand-text border-2 border-brand-text shadow-hard transition-all duration-200 hover:bg-brand-accent active:translate-x-1 active:translate-y-1 active:shadow-none focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-accent"
              aria-label="Start a new chat"
            >
              <NewChatIcon />
              <span>New Chat</span>
            </button>

          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col p-4 overflow-hidden min-h-0">
        <div className="max-w-4xl w-full mx-auto flex-1 flex flex-col min-h-0">
          <ChatWindow messages={messages} />
          <div className="mt-4">
             <MessageInput
               value={inputValue}
               onChange={setInputValue}
               onSubmit={handleSubmit}
               isLoading={isLoading}
               onAutoSubmit={handleSendMessage}
             />
             <SuggestedTopics persona={userProfile.persona} onSelectTopic={handleTopicSelect} isLoading={isLoading} />
             {/* Smart follow-ups */}
             {followups.length > 0 && (
               <div className="mt-3 flex flex-wrap gap-2">
                 {followups.map((s) => (
                   <button
                     key={s}
                     onClick={() => handleFollowupClick(s)}
                     disabled={isLoading}
                     className="px-3 py-1.5 text-xs font-bold bg-white text-brand-text border-2 border-brand-text shadow-hard transition-all duration-200 ease-in-out hover:bg-brand-accent disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                   >
                     {s}
                   </button>
                 ))}
               </div>
             )}
             {error && <p className="text-red-500 text-center mt-2 text-sm font-bold">{error}</p>}
          </div>
        </div>
      </div>
      <ChatHistoryDrawer isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} chats={chatList} onSelectChat={handleSelectChat} onDeleteChat={handleDeleteChat} onClearAll={handleClearAll} />
    </div>
  );
}

function generateFollowups(userText: string, botText: string): string[] {
  const suggestions: string[] = [];
  const lower = (userText + ' ' + botText).toLowerCase();
  if (lower.includes('budget')) {
    suggestions.push('Can you build a monthly budget template for me?');
    suggestions.push('What 3 changes would save me the most next month?');
  }
  if (lower.includes('invest') || lower.includes('portfolio')) {
    suggestions.push('What is a simple diversified plan for my risk level?');
    suggestions.push('Explain dollar-cost averaging for my situation.');
  }
  if (lower.includes('tax')) {
    suggestions.push('Which deductions might apply to me?');
    suggestions.push('How can I reduce my taxable income legally?');
  }
  if (suggestions.length === 0) {
    suggestions.push('What should I do next to reach my goal?');
    suggestions.push('Summarize my options and trade-offs.');
  }
  // De-duplicate and cap to 3
  return Array.from(new Set(suggestions)).slice(0, 3);
}

export default ChatScreen;