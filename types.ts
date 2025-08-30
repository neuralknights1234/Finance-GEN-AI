export enum Sender {
  USER = 'user',
  BOT = 'bot',
}

export interface Message {
  id: string;
  text: string;
  sender: Sender;
}

export enum Persona {
  STUDENT = 'Student',
  PROFESSIONAL = 'Professional',
}

export enum Screen {
  LANDING = 'Landing',
  CHAT = 'Chat',
  TAXES = 'Taxes',
  INVESTMENTS = 'Investments',
  PROFILE = 'Profile',
  AUTH = 'Auth',
  IMAGE_TO_TEXT = 'ImageToText',
  GRANITE = 'Granite',
  CURRENCY_CONVERTER = 'CurrencyConverter',
}

export enum IncomeRange {
  LT_30K = '< ₹30,000',
  '30K_50K' = '₹30,000 - ₹50,000',
  '50K_100K' = '₹50,000 - ₹100,000',
  '100K_200K' = '₹100,000 - ₹200,000',
  GT_200K = '> ₹200,000',
}

export interface UserProfile {
  persona: Persona;
  age: number | string; // Use string to allow empty input field
  income: IncomeRange | '';
  goals: string;
  displayName?: string;
  avatarDataUrl?: string; // stored as data URL for simplicity
  country?: string;
  currency?: string;
  locale?: string;
  riskTolerance?: number; // 1-5
  timeHorizon?: 'short' | 'medium' | 'long' | '';
}

export interface GroundingContext {
  text?: string;
}

export interface Transaction {
  id: number;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  date: string;
}

export interface Holding {
  id: number;
  name: string;
  ticker: string;
  value: number;
  gain: number;
}
