// Stock data service for real-time investment data
// Using Alpha Vantage API (free tier) for stock quotes

interface StockQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: number;
}

interface HistoricalData {
  date: string;
  value: number;
}

export interface PortfolioHistory {
  date: string;
  totalValue: number;
  totalGain: number;
  totalGainPercent: number;
}

// Free API key - you can get one from https://www.alphavantage.co/support/#api-key
const ALPHA_VANTAGE_API_KEY = (import.meta as any).env?.VITE_ALPHA_VANTAGE_API_KEY || 'demo';
const ALPHA_VANTAGE_BASE_URL = 'https://www.alphavantage.co/query';

// Cache for API responses to avoid hitting rate limits
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

async function fetchWithCache(url: string): Promise<any> {
  const cacheKey = url;
  const cached = cache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    
    cache.set(cacheKey, { data, timestamp: Date.now() });
    return data;
  } catch (error) {
    console.error('Error fetching stock data:', error);
    throw error;
  }
}

export async function getStockQuote(symbol: string): Promise<StockQuote | null> {
  try {
    const url = `${ALPHA_VANTAGE_BASE_URL}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`;
    const data = await fetchWithCache(url);
    
    if (data['Error Message']) {
      console.error('API Error:', data['Error Message']);
      return null;
    }
    
    const quote = data['Global Quote'];
    if (!quote || !quote['05. price']) {
      return null;
    }
    
    return {
      symbol: quote['01. symbol'],
      price: parseFloat(quote['05. price']),
      change: parseFloat(quote['09. change']),
      changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
      volume: parseInt(quote['06. volume']),
    };
  } catch (error) {
    console.error(`Error fetching quote for ${symbol}:`, error);
    return null;
  }
}

export async function getStockHistory(symbol: string, days: number = 30): Promise<HistoricalData[]> {
  try {
    const url = `${ALPHA_VANTAGE_BASE_URL}?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`;
    const data = await fetchWithCache(url);
    
    if (data['Error Message']) {
      console.error('API Error:', data['Error Message']);
      return [];
    }
    
    const timeSeries = data['Time Series (Daily)'];
    if (!timeSeries) {
      return [];
    }
    
    const dates = Object.keys(timeSeries).sort().slice(-days);
    return dates.map(date => ({
      date,
      value: parseFloat(timeSeries[date]['4. close'])
    }));
  } catch (error) {
    console.error(`Error fetching history for ${symbol}:`, error);
    return [];
  }
}

export async function calculatePortfolioHistory(
  holdings: Array<{ ticker: string; value: number; gain: number }>,
  days: number = 30
): Promise<PortfolioHistory[]> {
  try {
    if (holdings.length === 0) {
      return [];
    }
    
    // Get historical data for all holdings
    const historicalData = await Promise.all(
      holdings.map(async (holding) => {
        const history = await getStockHistory(holding.ticker, days);
        return { ticker: holding.ticker, history, currentValue: holding.value, gain: holding.gain };
      })
    );
    
    // Calculate portfolio value for each date
    const portfolioHistory: PortfolioHistory[] = [];
    const dates = historicalData[0]?.history.map(h => h.date) || [];
    
    for (const date of dates) {
      let totalValue = 0;
      let totalGain = 0;
      
      for (const holding of historicalData) {
        const historicalPrice = holding.history.find(h => h.date === date);
        if (historicalPrice) {
          // Calculate what the holding was worth on this date
          const currentPrice = holding.history[holding.history.length - 1]?.value || 1;
          const historicalValue = (holding.currentValue / currentPrice) * historicalPrice.value;
          totalValue += historicalValue;
          
          // Estimate historical gain (this is approximate)
          const historicalGain = (historicalValue * holding.gain) / holding.currentValue;
          totalGain += historicalGain;
        }
      }
      
      const totalGainPercent = totalValue > 0 ? (totalGain / (totalValue - totalGain)) * 100 : 0;
      
      portfolioHistory.push({
        date,
        totalValue: Math.round(totalValue * 100) / 100,
        totalGain: Math.round(totalGain * 100) / 100,
        totalGainPercent: Math.round(totalGainPercent * 100) / 100
      });
    }
    
    return portfolioHistory;
  } catch (error) {
    console.error('Error calculating portfolio history:', error);
    return [];
  }
}

// Fallback data when API is not available or fails
export function getFallbackPortfolioHistory(): PortfolioHistory[] {
  const today = new Date();
  const history: PortfolioHistory[] = [];
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    // Generate realistic-looking data
    const baseValue = 100000 + (Math.random() - 0.5) * 20000;
    const gain = (Math.random() - 0.5) * 5000;
    const gainPercent = (gain / (baseValue - gain)) * 100;
    
    history.push({
      date: date.toISOString().split('T')[0],
      totalValue: Math.round(baseValue * 100) / 100,
      totalGain: Math.round(gain * 100) / 100,
      totalGainPercent: Math.round(gainPercent * 100) / 100
    });
  }
  
  return history;
}

// Update portfolio values with real-time data
export async function updatePortfolioValues(
  holdings: Array<{ id: number; ticker: string; value: number; gain: number }>
): Promise<Array<{ id: number; ticker: string; value: number; gain: number; newValue?: number; newGain?: number }>> {
  try {
    const updatedHoldings = await Promise.all(
      holdings.map(async (holding) => {
        const quote = await getStockQuote(holding.ticker);
        if (quote) {
          // Calculate new value and gain based on current price
          const priceChange = quote.changePercent / 100;
          const newValue = holding.value * (1 + priceChange);
          const newGain = holding.gain + (newValue - holding.value);
          
          return {
            ...holding,
            newValue: Math.round(newValue * 100) / 100,
            newGain: Math.round(newGain * 100) / 100
          };
        }
        return holding;
      })
    );
    
    return updatedHoldings;
  } catch (error) {
    console.error('Error updating portfolio values:', error);
    return holdings;
  }
}
