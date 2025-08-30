// Financial Data Service - Provides comprehensive access to user's financial data
// This service aggregates data from all sources for the chatbot to use

import { supabase } from './supabaseClient';
import { loadUserProfile } from './supabaseData';

export interface FinancialSummary {
  // User Profile Data
  userProfile: {
    persona: string;
    age?: number;
    income?: string;
    goals: string;
    riskTolerance?: number;
    timeHorizon?: string;
    country?: string;
    currency?: string;
  };
  
  // Investment Data
  investments: {
    totalPortfolioValue: number;
    totalGain: number;
    totalGainPercent: number;
    holdings: Array<{
      ticker: string;
      value: number;
      gain: number;
      gainPercent: number;
    }>;
    assetAllocation: {
      stocks: number;
      bonds: number;
      cash: number;
      other: number;
    };
  };
  
  // Transaction Data
  transactions: {
    totalIncome: number;
    totalExpenses: number;
    netCashFlow: number;
    monthlyBreakdown: Array<{
      month: string;
      income: number;
      expenses: number;
      netFlow: number;
    }>;
    topIncomeSources: Array<{
      category: string;
      amount: number;
      percentage: number;
    }>;
    topExpenseCategories: Array<{
      category: string;
      amount: number;
      percentage: number;
    }>;
  };
  
  // Tax Data
  taxes: {
    totalTaxableIncome: number;
    estimatedTaxLiability: number;
    taxRate: number;
    deductions: Array<{
      category: string;
      amount: number;
    }>;
  };
  
  // Financial Health Metrics
  financialHealth: {
    emergencyFundRatio: number;
    debtToIncomeRatio: number;
    savingsRate: number;
    investmentRatio: number;
    creditScore?: number;
  };
  
  // Goals Progress
  goalsProgress: Array<{
    goal: string;
    targetAmount: number;
    currentAmount: number;
    progressPercent: number;
    timeline: string;
  }>;
}

export interface ChatbotContext {
  financialSummary: FinancialSummary;
  userPreferences: {
    riskTolerance: string;
    investmentStyle: string;
    financialGoals: string[];
    preferredAdviceType: string;
  };
  marketContext: {
    currentDate: string;
    marketTrend: string;
    interestRates: {
      savings: number;
      mortgage: number;
      creditCard: number;
    };
  };
}

/**
 * Get comprehensive financial summary for the current user
 */
export async function getFinancialSummary(): Promise<FinancialSummary | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('No authenticated user found');
      return null;
    }

    // Load user profile
    const userProfile = await loadUserProfile();
    if (!userProfile) {
      console.error('No user profile found');
      return null;
    }

    // Load transactions
    const { data: transactions, error: transactionsError } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false });

    if (transactionsError) {
      console.error('Error loading transactions:', transactionsError);
    }

    // Load holdings
    const { data: holdings, error: holdingsError } = await supabase
      .from('holdings')
      .select('*')
      .eq('user_id', user.id);

    if (holdingsError) {
      console.error('Error loading holdings:', holdingsError);
    }

    // Calculate financial metrics
    const summary = await calculateFinancialMetrics(
      userProfile,
      transactions || [],
      holdings || []
    );

    return summary;
  } catch (error) {
    console.error('Error getting financial summary:', error);
    return null;
  }
}

/**
 * Calculate comprehensive financial metrics
 */
async function calculateFinancialMetrics(
  userProfile: any,
  transactions: any[],
  holdings: any[]
): Promise<FinancialSummary> {
  // Calculate transaction metrics
  const transactionMetrics = calculateTransactionMetrics(transactions);
  
  // Calculate investment metrics
  const investmentMetrics = calculateInvestmentMetrics(holdings);
  
  // Calculate tax metrics
  const taxMetrics = calculateTaxMetrics(transactions, userProfile);
  
  // Calculate financial health metrics
  const healthMetrics = calculateFinancialHealthMetrics(
    transactionMetrics,
    investmentMetrics,
    userProfile
  );
  
  // Calculate goals progress
  const goalsProgress = calculateGoalsProgress(
    userProfile.goals,
    transactionMetrics,
    investmentMetrics
  );

  return {
    userProfile: {
      persona: userProfile.persona,
      age: userProfile.age,
      income: userProfile.income,
      goals: userProfile.goals,
      riskTolerance: userProfile.riskTolerance,
      timeHorizon: userProfile.timeHorizon,
      country: userProfile.country,
      currency: userProfile.currency,
    },
    investments: investmentMetrics,
    transactions: transactionMetrics,
    taxes: taxMetrics,
    financialHealth: healthMetrics,
    goalsProgress,
  };
}

/**
 * Calculate transaction-related metrics
 */
function calculateTransactionMetrics(transactions: any[]) {
  const totalIncome = transactions
    .filter(t => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);
    
  const totalExpenses = transactions
    .filter(t => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
  const netCashFlow = totalIncome - totalExpenses;

  // Monthly breakdown
  const monthlyData = new Map<string, { income: number; expenses: number; netFlow: number }>();
  
  transactions.forEach(t => {
    const month = new Date(t.date).toISOString().slice(0, 7); // YYYY-MM
    const current = monthlyData.get(month) || { income: 0, expenses: 0, netFlow: 0 };
    
    if (t.amount > 0) {
      current.income += t.amount;
    } else {
      current.expenses += Math.abs(t.amount);
    }
    current.netFlow = current.income - current.expenses;
    
    monthlyData.set(month, current);
  });

  const monthlyBreakdown = Array.from(monthlyData.entries())
    .map(([month, data]) => ({
      month,
      ...data,
    }))
    .sort((a, b) => b.month.localeCompare(a.month))
    .slice(0, 12); // Last 12 months

  // Top income sources
  const incomeByCategory = new Map<string, number>();
  transactions
    .filter(t => t.amount > 0)
    .forEach(t => {
      const current = incomeByCategory.get(t.category) || 0;
      incomeByCategory.set(t.category, current + t.amount);
    });

  const topIncomeSources = Array.from(incomeByCategory.entries())
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: (amount / totalIncome) * 100,
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  // Top expense categories
  const expensesByCategory = new Map<string, number>();
  transactions
    .filter(t => t.amount < 0)
    .forEach(t => {
      const current = expensesByCategory.get(t.category) || 0;
      expensesByCategory.set(t.category, current + Math.abs(t.amount));
    });

  const topExpenseCategories = Array.from(expensesByCategory.entries())
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: (amount / totalExpenses) * 100,
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  return {
    totalIncome,
    totalExpenses,
    netCashFlow,
    monthlyBreakdown,
    topIncomeSources,
    topExpenseCategories,
  };
}

/**
 * Calculate investment-related metrics
 */
function calculateInvestmentMetrics(holdings: any[]) {
  const totalPortfolioValue = holdings.reduce((sum, h) => sum + h.value, 0);
  const totalGain = holdings.reduce((sum, h) => sum + h.gain, 0);
  const totalGainPercent = totalPortfolioValue > 0 ? (totalGain / (totalPortfolioValue - totalGain)) * 100 : 0;

  // Asset allocation (simplified - you can enhance this based on your data structure)
  const assetAllocation = {
    stocks: 70, // Default allocation - you can calculate based on actual holdings
    bonds: 20,
    cash: 5,
    other: 5,
  };

  return {
    totalPortfolioValue,
    totalGain,
    totalGainPercent,
    holdings: holdings.map(h => ({
      ticker: h.ticker,
      value: h.value,
      gain: h.gain,
      gainPercent: h.value > 0 ? (h.gain / (h.value - h.gain)) * 100 : 0,
    })),
    assetAllocation,
  };
}

/**
 * Calculate tax-related metrics
 */
function calculateTaxMetrics(transactions: any[], userProfile: any) {
  const totalTaxableIncome = transactions
    .filter(t => t.amount > 0 && t.category !== 'Tax Refund')
    .reduce((sum, t) => sum + t.amount, 0);

  // Simplified tax calculation - you can enhance this based on your tax logic
  const estimatedTaxLiability = totalTaxableIncome * 0.25; // 25% tax rate
  const taxRate = 25;

  const deductions = [
    { category: 'Standard Deduction', amount: 12950 },
    { category: 'Retirement Contributions', amount: 6000 },
    { category: 'Health Savings Account', amount: 3650 },
  ];

  return {
    totalTaxableIncome,
    estimatedTaxLiability,
    taxRate,
    deductions,
  };
}

/**
 * Calculate financial health metrics
 */
function calculateFinancialHealthMetrics(
  transactionMetrics: any,
  investmentMetrics: any,
  userProfile: any
) {
  const monthlyExpenses = transactionMetrics.totalExpenses / 12;
  const emergencyFundRatio = monthlyExpenses > 0 ? 3 : 0; // Assuming 3 months emergency fund
  
  const debtToIncomeRatio = 0.15; // Simplified - you can calculate based on actual debt data
  const savingsRate = transactionMetrics.totalIncome > 0 
    ? (transactionMetrics.netCashFlow / transactionMetrics.totalIncome) * 100 
    : 0;
  
  const investmentRatio = transactionMetrics.totalIncome > 0
    ? (investmentMetrics.totalPortfolioValue / transactionMetrics.totalIncome) * 100
    : 0;

  return {
    emergencyFundRatio,
    debtToIncomeRatio,
    savingsRate,
    investmentRatio,
    creditScore: 750, // Placeholder - you can integrate with credit score APIs
  };
}

/**
 * Calculate goals progress
 */
function calculateGoalsProgress(
  goals: string,
  transactionMetrics: any,
  investmentMetrics: any
) {
  // Parse goals from user profile and calculate progress
  const goalsList = goals.split(',').map(g => g.trim()).filter(g => g.length > 0);
  
  return goalsList.map(goal => {
    // Simplified goal progress calculation
    const targetAmount = 50000; // You can enhance this based on goal type
    const currentAmount = investmentMetrics.totalPortfolioValue;
    const progressPercent = (currentAmount / targetAmount) * 100;
    
    return {
      goal,
      targetAmount,
      currentAmount,
      progressPercent: Math.min(progressPercent, 100),
      timeline: '5 years',
    };
  });
}

/**
 * Get chatbot context with financial data and market context
 */
export async function getChatbotContext(): Promise<ChatbotContext | null> {
  const financialSummary = await getFinancialSummary();
  if (!financialSummary) return null;

  const userPreferences = {
    riskTolerance: getRiskToleranceDescription(financialSummary.userProfile.riskTolerance),
    investmentStyle: getInvestmentStyle(financialSummary.userProfile.persona),
    financialGoals: financialSummary.userProfile.goals.split(',').map(g => g.trim()),
    preferredAdviceType: 'comprehensive',
  };

  const marketContext = {
    currentDate: new Date().toISOString().split('T')[0],
    marketTrend: 'bullish', // You can integrate with market data APIs
    interestRates: {
      savings: 4.5,
      mortgage: 7.2,
      creditCard: 18.5,
    },
  };

  return {
    financialSummary,
    userPreferences,
    marketContext,
  };
}

/**
 * Helper function to get risk tolerance description
 */
function getRiskToleranceDescription(riskTolerance?: number): string {
  switch (riskTolerance) {
    case 1: return 'Conservative';
    case 2: return 'Cautious';
    case 3: return 'Balanced';
    case 4: return 'Growth';
    case 5: return 'Aggressive';
    default: return 'Balanced';
  }
}

/**
 * Helper function to get investment style based on persona
 */
function getInvestmentStyle(persona: string): string {
  switch (persona) {
    case 'Student': return 'Learning and conservative';
    case 'Young Professional': return 'Growth-oriented';
    case 'Family': return 'Balanced and diversified';
    case 'Retiree': return 'Income-focused and conservative';
    default: return 'Balanced';
  }
}

/**
 * Format financial data for chatbot consumption
 */
export function formatFinancialDataForChatbot(context: ChatbotContext): string {
  const { financialSummary, userPreferences, marketContext } = context;
  
  return `
USER FINANCIAL PROFILE:
- Persona: ${financialSummary.userProfile.persona}
- Age: ${financialSummary.userProfile.age || 'Not specified'}
- Income Range: ${financialSummary.userProfile.income || 'Not specified'}
- Risk Tolerance: ${userPreferences.riskTolerance}
- Financial Goals: ${userPreferences.financialGoals.join(', ')}

CURRENT FINANCIAL STATUS:
- Total Portfolio Value: ₹${financialSummary.investments.totalPortfolioValue.toLocaleString()}
- Portfolio Gain: ₹${financialSummary.investments.totalGain.toLocaleString()} (${financialSummary.investments.totalGainPercent.toFixed(1)}%)
- Monthly Income: ₹${financialSummary.transactions.totalIncome.toLocaleString()}
- Monthly Expenses: ₹${financialSummary.transactions.totalExpenses.toLocaleString()}
- Net Cash Flow: ₹${financialSummary.transactions.netCashFlow.toLocaleString()}
- Savings Rate: ${financialSummary.financialHealth.savingsRate.toFixed(1)}%

INVESTMENT HOLDINGS:
${financialSummary.investments.holdings.map(h => 
  `- ${h.ticker}: ₹${h.value.toLocaleString()} (${h.gainPercent.toFixed(1)}% gain)`
).join('\n')}

TOP EXPENSE CATEGORIES:
${financialSummary.transactions.topExpenseCategories.map(e => 
  `- ${e.category}: ₹${e.amount.toLocaleString()} (${e.percentage.toFixed(1)}%)`
).join('\n')}

FINANCIAL HEALTH METRICS:
- Emergency Fund: ${financialSummary.financialHealth.emergencyFundRatio} months of expenses
- Debt-to-Income Ratio: ${(financialSummary.financialHealth.debtToIncomeRatio * 100).toFixed(1)}%
- Investment Ratio: ${financialSummary.financialHealth.investmentRatio.toFixed(1)}%

GOALS PROGRESS:
${financialSummary.goalsProgress.map(g => 
  `- ${g.goal}: ${g.progressPercent.toFixed(1)}% complete (₹${g.currentAmount.toLocaleString()} / ₹${g.targetAmount.toLocaleString()})`
).join('\n')}

MARKET CONTEXT:
- Current Date: ${marketContext.currentDate}
- Market Trend: ${marketContext.marketTrend}
- Savings Rate: ${marketContext.interestRates.savings}%
- Mortgage Rate: ${marketContext.interestRates.mortgage}%
- Credit Card Rate: ${marketContext.interestRates.creditCard}%
`.trim();
}
