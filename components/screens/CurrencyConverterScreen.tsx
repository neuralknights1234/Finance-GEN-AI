import React, { useState, useEffect } from 'react';

interface CurrencyConverterScreenProps {
  onBack?: () => void;
}

interface ExchangeRate {
  currency: string;
  rate: number;
  name: string;
}

const CurrencyConverterScreen: React.FC<CurrencyConverterScreenProps> = ({ onBack }) => {
  const [amount, setAmount] = useState<string>('1');
  const [fromCurrency, setFromCurrency] = useState<string>('USD');
  const [toCurrency, setToCurrency] = useState<string>('INR');
  const [result, setResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // Popular currencies with their names
  const currencies: ExchangeRate[] = [
    { currency: 'USD', rate: 1, name: 'US Dollar' },
    { currency: 'INR', rate: 83.5, name: 'Indian Rupee' },
    { currency: 'EUR', rate: 0.92, name: 'Euro' },
    { currency: 'GBP', rate: 0.79, name: 'British Pound' },
    { currency: 'JPY', rate: 150.5, name: 'Japanese Yen' },
    { currency: 'CAD', rate: 1.35, name: 'Canadian Dollar' },
    { currency: 'AUD', rate: 1.52, name: 'Australian Dollar' },
    { currency: 'CHF', rate: 0.88, name: 'Swiss Franc' },
    { currency: 'CNY', rate: 7.23, name: 'Chinese Yuan' },
    { currency: 'SGD', rate: 1.34, name: 'Singapore Dollar' },
    { currency: 'AED', rate: 3.67, name: 'UAE Dirham' },
    { currency: 'SAR', rate: 3.75, name: 'Saudi Riyal' },
  ];

  // Calculate conversion
  const calculateConversion = () => {
    if (!amount || isNaN(Number(amount))) {
      setResult('');
      return;
    }

    const fromRate = currencies.find(c => c.currency === fromCurrency)?.rate || 1;
    const toRate = currencies.find(c => c.currency === toCurrency)?.rate || 1;
    
    const convertedAmount = (Number(amount) / fromRate) * toRate;
    setResult(convertedAmount.toFixed(2));
  };

  // Convert currencies when inputs change
  useEffect(() => {
    calculateConversion();
  }, [amount, fromCurrency, toCurrency]);

  // Swap currencies
  const swapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  // Format number with commas
  const formatNumber = (num: string) => {
    const number = parseFloat(num);
    if (isNaN(number)) return num;
    return number.toLocaleString();
  };

  return (
    <div className="p-4 md:p-6 text-brand-text max-w-4xl mx-auto">
      <header className="mb-8 border-b-4 border-brand-text pb-4">
        <div className="flex items-center gap-2">
          {onBack && (
            <button 
              onClick={onBack} 
              className="px-3 py-2 text-sm font-bold bg-white text-brand-text border-2 border-brand-text shadow-hard hover:bg-brand-accent"
              aria-label="Back to main menu"
            >
              Back
            </button>
          )}
          <h1 className="text-2xl md:text-3xl font-bold">Currency Converter</h1>
        </div>
        <p className="text-brand-text/80 mt-1">Convert between different currencies with real-time rates.</p>
      </header>

      <div className="bg-white p-6 border-2 border-brand-text shadow-hard mb-6">
        <h2 className="text-xl font-bold mb-6">Exchange Rates</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {currencies.map((currency) => (
            <div key={currency.currency} className="bg-brand-bg p-4 border-2 border-brand-text">
              <div className="font-bold text-lg">{currency.currency}</div>
              <div className="text-sm text-brand-text/70">{currency.name}</div>
              <div className="text-sm font-bold mt-1">
                1 USD = {currency.rate.toFixed(2)} {currency.currency}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white p-6 border-2 border-brand-text shadow-hard mb-6">
        <h2 className="text-xl font-bold mb-6">Convert Currency</h2>
        
        <div className="space-y-6">
          {/* Amount Input */}
          <div>
            <label className="block text-sm font-bold mb-2">Amount</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-brand-bg border-2 border-brand-text p-3 focus:ring-2 focus:ring-brand-accent focus:border-brand-accent focus:outline-none"
              placeholder="Enter amount"
              min="0"
              step="0.01"
            />
          </div>

          {/* Currency Selection */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-sm font-bold mb-2">From</label>
              <select
                value={fromCurrency}
                onChange={(e) => setFromCurrency(e.target.value)}
                className="w-full bg-brand-bg border-2 border-brand-text p-3 focus:ring-2 focus:ring-brand-accent focus:border-brand-accent focus:outline-none appearance-none"
              >
                {currencies.map((currency) => (
                  <option key={currency.currency} value={currency.currency}>
                    {currency.currency} - {currency.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Swap Button */}
            <div className="flex justify-center">
              <button
                onClick={swapCurrencies}
                className="px-4 py-3 bg-brand-accent hover:bg-amber-500 text-brand-text font-bold border-2 border-brand-text shadow-hard transition-all active:translate-x-1 active:translate-y-1 active:shadow-none"
                aria-label="Swap currencies"
              >
                ⇄
              </button>
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">To</label>
              <select
                value={toCurrency}
                onChange={(e) => setToCurrency(e.target.value)}
                className="w-full bg-brand-bg border-2 border-brand-text p-3 focus:ring-2 focus:ring-brand-accent focus:border-brand-accent focus:outline-none appearance-none"
              >
                {currencies.map((currency) => (
                  <option key={currency.currency} value={currency.currency}>
                    {currency.currency} - {currency.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Result */}
          {result && (
            <div className="bg-brand-bg p-6 border-2 border-brand-text text-center">
              <div className="text-2xl font-bold text-brand-text">
                {formatNumber(amount)} {fromCurrency} = {formatNumber(result)} {toCurrency}
              </div>
              <div className="text-sm text-brand-text/70 mt-2">
                Exchange Rate: 1 {fromCurrency} = {(parseFloat(result) / parseFloat(amount)).toFixed(4)} {toCurrency}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Conversions */}
      <div className="bg-white p-6 border-2 border-brand-text shadow-hard">
        <h2 className="text-xl font-bold mb-6">Quick Conversions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { from: 'USD', to: 'INR', amount: '100' },
            { from: 'EUR', to: 'USD', amount: '50' },
            { from: 'GBP', to: 'INR', amount: '25' },
            { from: 'JPY', to: 'USD', amount: '1000' },
            { from: 'CAD', to: 'EUR', amount: '75' },
            { from: 'AUD', to: 'USD', amount: '60' },
          ].map((conversion, index) => {
            const fromRate = currencies.find(c => c.currency === conversion.from)?.rate || 1;
            const toRate = currencies.find(c => c.currency === conversion.to)?.rate || 1;
            const result = (parseFloat(conversion.amount) / fromRate) * toRate;
            
            return (
              <div key={index} className="bg-brand-bg p-4 border-2 border-brand-text">
                <div className="text-sm text-brand-text/70">Quick Convert</div>
                <div className="font-bold text-lg">
                  {conversion.amount} {conversion.from} = {result.toFixed(2)} {conversion.to}
                </div>
                <button
                  onClick={() => {
                    setAmount(conversion.amount);
                    setFromCurrency(conversion.from);
                    setToCurrency(conversion.to);
                  }}
                  className="mt-2 px-3 py-1 text-xs bg-brand-accent hover:bg-amber-500 text-brand-text font-bold border-2 border-brand-text shadow-hard transition-all"
                >
                  Use This
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-6 p-4 bg-yellow-50 border-2 border-yellow-300">
        <p className="text-sm text-yellow-800">
          <strong>Disclaimer:</strong> Exchange rates are approximate and may not reflect real-time market conditions. 
          For accurate rates, please consult your bank or financial institution.
        </p>
      </div>
    </div>
  );
};

export default CurrencyConverterScreen;
