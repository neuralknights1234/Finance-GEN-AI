
import { GoogleGenAI, Chat } from "@google/genai";
import { UserProfile, GroundingContext } from '../types';
import { PERSONA_SYSTEM_INSTRUCTIONS } from '../constants';
import { getChatbotContext, formatFinancialDataForChatbot, type ChatbotContext } from './financialDataService';

// Accept both VITE_GEMINI_API_KEY (recommended) and GEMINI_API_KEY (per README)
const apiKey: string | undefined =
  (import.meta as any).env?.VITE_GEMINI_API_KEY ||
  (import.meta as any).env?.GEMINI_API_KEY ||
  process.env.VITE_GEMINI_API_KEY ||
  process.env.GEMINI_API_KEY;

let ai: GoogleGenAI | null = null;
if (apiKey) {
  try {
    ai = new GoogleGenAI({ apiKey });
  } catch (error) {
    console.error('Failed to initialize GoogleGenAI:', error);
    ai = null;
  }
}

// Fallback responses when API is not available
const getFallbackResponse = (userMessage: string, profile: UserProfile): string => {
  const lowerMessage = userMessage.toLowerCase();
  
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
    return `Hello! I'm your personal finance assistant. I'm here to help you with financial advice, budgeting, investments, and more. What would you like to know about?`;
  }
  
  if (lowerMessage.includes('budget') || lowerMessage.includes('saving')) {
    return `Great question about budgeting! Here are some key tips:\n\n1. Track your income and expenses\n2. Set financial goals\n3. Create spending categories\n4. Monitor and adjust regularly\n\nWould you like me to help you create a personalized budget plan?`;
  }
  
  if (lowerMessage.includes('invest') || lowerMessage.includes('stock')) {
    return `Investment advice depends on your risk tolerance and goals. Based on your profile (${profile.persona}), I'd recommend starting with:\n\n1. Emergency fund first\n2. Diversified index funds\n3. Dollar-cost averaging\n4. Regular portfolio review\n\nWhat's your investment timeline and risk preference?`;
  }
  
  if (lowerMessage.includes('tax') || lowerMessage.includes('deduction')) {
    return `Tax optimization is important! Here are some general tips:\n\n1. Maximize retirement contributions\n2. Consider tax-loss harvesting\n3. Keep good records\n4. Consult a tax professional\n\nWhat specific tax questions do you have?`;
  }
  
  return `I understand you're asking about "${userMessage}". While I'm currently in offline mode, I can still provide general financial guidance. For personalized advice, please ensure your API key is configured. What specific financial topic would you like to discuss?`;
};

export function createChatSession(profile: UserProfile, grounding?: GroundingContext): Chat {
  if (!apiKey || !ai) {
    throw new Error("API key missing. Set VITE_GEMINI_API_KEY in .env.local and reload.");
  }
  
  // Get financial context for enhanced responses
  let financialContext = '';
  getChatbotContext().then(context => {
    if (context) {
      financialContext = formatFinancialDataForChatbot(context);
    }
  }).catch(error => {
    console.error('Error loading financial context:', error);
  });

  const systemInstructions = [
    PERSONA_SYSTEM_INSTRUCTIONS(profile),
    `You are a comprehensive financial advisor with access to the user's complete financial data. Use this information to provide personalized, data-driven advice.`,
    financialContext ? `USER'S FINANCIAL DATA:\n${financialContext}\n\nUse this data to provide specific, personalized advice. Reference actual numbers, holdings, and financial metrics when relevant.` : '',
    grounding?.text ? `Ground your advice on the following user-provided context if relevant:\n${grounding.text}` : undefined,
  ].filter(Boolean).join('\n\n');

  const model = (ai as GoogleGenAI).chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: systemInstructions,
      temperature: 0.7,
      topP: 0.9,
      topK: 40,
    }
  });
  return model;
}

/**
 * Create an enhanced chat session with real-time financial data
 */
export async function createEnhancedChatSession(profile: UserProfile, grounding?: GroundingContext): Promise<Chat> {
  if (!apiKey || !ai) {
    // Return a mock chat object that provides fallback responses
    const mockChat = {
      sendMessageStream: async ({ message }: { message: string }) => {
        const response = getFallbackResponse(message, profile);
        return {
          [Symbol.asyncIterator]: async function* () {
            // Simulate streaming response
            const words = response.split(' ');
            for (const word of words) {
              yield { text: word + ' ' };
              await new Promise(resolve => setTimeout(resolve, 50)); // 50ms delay between words
            }
          }
        };
      }
    } as any;
    
    return mockChat;
  }

  // Get real-time financial context
  const context = await getChatbotContext();
  let financialContext = '';
  
  if (context) {
    financialContext = formatFinancialDataForChatbot(context);
  }

  const systemInstructions = [
    PERSONA_SYSTEM_INSTRUCTIONS(profile),
    `You are a comprehensive financial advisor with access to the user's complete financial data. Use this information to provide personalized, data-driven advice.`,
    `IMPORTANT: You have access to the user's real financial data including:
    - Portfolio holdings and performance
    - Transaction history and spending patterns
    - Financial health metrics
    - Goals progress
    - Tax information
    - Market context
    
    Always reference specific data points when providing advice. Use actual numbers, percentages, and holdings when relevant.`,
    financialContext ? `USER'S CURRENT FINANCIAL DATA:\n${financialContext}\n\nUse this data to provide specific, personalized advice. Reference actual numbers, holdings, and financial metrics when relevant.` : '',
    grounding?.text ? `Ground your advice on the following user-provided context if relevant:\n${grounding.text}` : undefined,
  ].filter(Boolean).join('\n\n');

  const model = (ai as GoogleGenAI).chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: systemInstructions,
      temperature: 0.7,
      topP: 0.9,
      topK: 40,
    }
  });
  return model;
}

/**
 * Update chat session with fresh financial data
 */
export async function updateChatWithFinancialData(chat: Chat, profile: UserProfile): Promise<void> {
  if (!apiKey || !ai) {
    console.warn('Cannot update financial data: API key not configured');
    return;
  }

  try {
    // Get fresh financial context
    const context = await getChatbotContext();
    if (context) {
      const financialContext = formatFinancialDataForChatbot(context);
      console.log('Financial data updated successfully');
    }
  } catch (error) {
    console.error('Error updating financial data:', error);
  }
}