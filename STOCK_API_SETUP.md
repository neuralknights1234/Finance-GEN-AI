# Stock API Setup Guide

This guide will help you set up real-time stock data for your investments dashboard.

## Prerequisites

- Internet connection
- Alpha Vantage API key (free)

## Step 1: Get Alpha Vantage API Key

1. Go to [Alpha Vantage](https://www.alphavantage.co/support/#api-key)
2. Sign up for a free account
3. Get your API key (free tier allows 5 API calls per minute and 500 per day)

## Step 2: Update API Key

1. Open `services/stockDataService.ts`
2. Find this line:
   ```typescript
   const ALPHA_VANTAGE_API_KEY = 'demo'; // Replace with your actual API key
   ```
3. Replace `'demo'` with your actual API key:
   ```typescript
   const ALPHA_VANTAGE_API_KEY = 'YOUR_ACTUAL_API_KEY_HERE';
   ```

## Step 3: Test the Setup

1. Start your application
2. Go to the Investments screen
3. Add a holding with a valid stock ticker (e.g., AAPL, MSFT, GOOGL)
4. The portfolio history chart should now show real data
5. Click "Refresh" to update current values

## What You Get

### Real-Time Data
- **Live stock quotes**: Current prices and daily changes
- **Historical data**: 30-day price history for portfolio tracking
- **Automatic updates**: Portfolio values refresh every 5 minutes
- **Manual refresh**: Click refresh button for immediate updates

### Portfolio History Chart
- **30-day timeline**: Shows portfolio value changes over time
- **Real calculations**: Based on actual stock price movements
- **Interactive tooltips**: Hover for detailed information
- **Responsive design**: Adapts to different screen sizes

### Asset Allocation
- **Live values**: Current market values for all holdings
- **Performance tracking**: Real-time gains and losses
- **Visual representation**: Color-coded bar chart

## API Limits (Free Tier)

- **Rate limit**: 5 API calls per minute
- **Daily limit**: 500 API calls per day
- **Cache duration**: 5 minutes (to respect rate limits)

## Troubleshooting

### No Data Loading
- Check your API key is correct
- Verify internet connection
- Check browser console for errors
- Ensure ticker symbols are valid (e.g., AAPL not APPLE)

### Rate Limit Errors
- Wait a few minutes before making more requests
- Reduce the number of holdings
- Check your daily API usage

### Fallback Data
If the API fails, the system will:
1. Show fallback generated data
2. Display a loading message
3. Log errors to console
4. Continue working with cached data

## Alternative APIs

If you need different data sources, you can modify `stockDataService.ts` to use:

- **Yahoo Finance API**: More comprehensive data
- **IEX Cloud**: Real-time and historical data
- **Finnhub**: Real-time stock data
- **Polygon.io**: Market data and news

## Security Notes

- **Never commit API keys** to version control
- **Use environment variables** for production
- **Monitor API usage** to avoid exceeding limits
- **Cache responses** to minimize API calls

## Example Environment Variable Setup

Create a `.env.local` file:
```env
VITE_ALPHA_VANTAGE_API_KEY=your_api_key_here
```

Then update the service:
```typescript
const ALPHA_VANTAGE_API_KEY = import.meta.env.VITE_ALPHA_VANTAGE_API_KEY || 'demo';
```

## Performance Tips

- **Limit holdings**: Keep under 20 for best performance
- **Use common tickers**: Major stocks have better data availability
- **Enable caching**: Data is cached for 5 minutes
- **Auto-refresh**: Set to reasonable intervals (5+ minutes)
