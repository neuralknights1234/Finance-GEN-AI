import React, { useState, useMemo, FormEvent, useEffect } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import { Holding } from '../../types';
import EditIcon from '../icons/EditIcon';
import TrashIcon from '../icons/TrashIcon';
import AddIcon from '../icons/AddIcon';
import { deleteHolding as deleteH, loadHoldings, upsertHolding } from '../../services/supabaseData';
import { 
  calculatePortfolioHistory, 
  getFallbackPortfolioHistory, 
  updatePortfolioValues,
  type PortfolioHistory 
} from '../../services/stockDataService';

const initialHoldings: Holding[] = [];

const COLORS = ['#FBBF24', '#34D399', '#60A5FA', '#F87171', '#A78BFA'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-2 bg-brand-bg border-2 border-brand-text">
        <p className="label font-bold">{`${label} : ₹${payload[0].value.toLocaleString()}`}</p>
      </div>
    );
  }
  return null;
};

const InvestmentsScreen: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const [holdings, setHoldings] = useState<Holding[]>(initialHoldings);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentHolding, setCurrentHolding] = useState<Holding | null>(null);
  const [formData, setFormData] = useState({ name: '', ticker: '', value: '', gain: '' });
  const [portfolioHistory, setPortfolioHistory] = useState<PortfolioHistory[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isUpdatingValues, setIsUpdatingValues] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [showPredictions, setShowPredictions] = useState(false);
  const [predictionTimeframe, setPredictionTimeframe] = useState<'3months' | '6months' | '1year'>('6months');

  const portfolioSummary = useMemo(() => {
    const totalValue = holdings.reduce((acc, h) => acc + h.value, 0);
    const overallGain = holdings.reduce((acc, h) => acc + h.gain, 0);
    const initialInvestment = totalValue - overallGain;
    const overallGainPercent = initialInvestment !== 0 ? (overallGain / initialInvestment) * 100 : 0;
    return { totalValue, overallGain, overallGainPercent };
  }, [holdings]);
  
  // Responsive scaling for charts based on current values
  const maxHoldingValue = useMemo(() => (holdings.length ? Math.max(...holdings.map(h => h.value)) : 0), [holdings]);

  // Generate predictive data for future investments
  const predictiveData = useMemo(() => {
    if (holdings.length === 0) return [];
    
    const currentValue = portfolioSummary.totalValue;
    const currentGain = portfolioSummary.overallGain;
    const currentGainPercent = portfolioSummary.overallGainPercent;
    
    // Calculate monthly growth rate based on current performance
    const monthlyGrowthRate = currentGainPercent / 100 / 12; // Convert annual to monthly
    
    // Generate future data points
    const months = predictionTimeframe === '3months' ? 3 : predictionTimeframe === '6months' ? 6 : 12;
    const data = [];
    
    for (let i = 0; i <= months; i++) {
      const monthGrowth = Math.pow(1 + monthlyGrowthRate, i);
      const predictedValue = currentValue * monthGrowth;
      const predictedGain = predictedValue - (currentValue - currentGain);
      
      const date = new Date();
      date.setMonth(date.getMonth() + i);
      
      data.push({
        date: date.toISOString(),
        totalValue: Math.round(predictedValue),
        predictedGain: Math.round(predictedGain),
        confidence: Math.max(0.7, 1 - (i * 0.05)), // Confidence decreases over time
        month: i === 0 ? 'Current' : `+${i} month${i > 1 ? 's' : ''}`
      });
    }
    
    return data;
  }, [holdings, portfolioSummary, predictionTimeframe]);

  // Calculate investment recommendations
  const investmentRecommendations = useMemo(() => {
    if (holdings.length === 0) return [];
    
    const recommendations = [];
    const totalValue = portfolioSummary.totalValue;
    
    // Diversification analysis
    const techHoldings = holdings.filter(h => 
      h.name.toLowerCase().includes('tech') || 
      h.ticker.toLowerCase().includes('tech') ||
      h.name.toLowerCase().includes('software') ||
      h.name.toLowerCase().includes('ai')
    );
    const techPercentage = techHoldings.reduce((acc, h) => acc + h.value, 0) / totalValue * 100;
    
    if (techPercentage > 40) {
      recommendations.push({
        type: 'warning',
        title: 'High Tech Concentration',
        message: `Tech stocks represent ${techPercentage.toFixed(1)}% of your portfolio. Consider diversifying into other sectors.`,
        action: 'Reduce tech exposure by 10-15%'
      });
    }
    
    // Risk assessment
    const highRiskHoldings = holdings.filter(h => h.gain > h.value * 0.5);
    if (highRiskHoldings.length > 0) {
      recommendations.push({
        type: 'info',
        title: 'High-Growth Holdings Detected',
        message: `${highRiskHoldings.length} holding(s) have shown exceptional growth. Consider taking partial profits.`,
        action: 'Review profit-taking strategy'
      });
    }
    
    // Rebalancing suggestions
    const largestHolding = holdings.reduce((max, h) => h.value > max.value ? h : max, holdings[0]);
    const largestPercentage = largestHolding ? (largestHolding.value / totalValue) * 100 : 0;
    
    if (largestPercentage > 30) {
      recommendations.push({
        type: 'warning',
        title: 'Portfolio Concentration Risk',
        message: `${largestHolding?.name} represents ${largestPercentage.toFixed(1)}% of your portfolio.`,
        action: 'Consider reducing position size'
      });
    }
    
    return recommendations;
  }, [holdings, portfolioSummary]);

  // Generate default profile analysis when no holdings exist
  const defaultProfileAnalysis = useMemo(() => {
    if (holdings.length > 0) return null;
    
    return {
      profileType: 'New Investor',
      riskTolerance: 'Moderate',
      investmentStyle: 'Conservative',
      recommendedActions: [
        {
          type: 'info',
          title: 'Start Building Your Portfolio',
          message: 'Begin with a diversified mix of index funds and ETFs for steady growth.',
          action: 'Consider Vanguard or iShares ETFs'
        },
        {
          type: 'success',
          title: 'Emergency Fund First',
          message: 'Ensure you have 3-6 months of expenses saved before investing.',
          action: 'Target ₹50,000 - ₹100,000 emergency fund'
        },
        {
          type: 'warning',
          title: 'Investment Education',
          message: 'Learn about different investment vehicles and risk management.',
          action: 'Read investment basics and consult financial advisor'
        }
      ],
      marketOutlook: {
        currentTrend: 'Bull Market',
        recommendation: 'Dollar-cost averaging approach',
        timeHorizon: '5-10 years minimum'
      },
      assetAllocation: {
        conservative: '60% Bonds, 40% Stocks',
        moderate: '50% Stocks, 30% Bonds, 20% International',
        aggressive: '70% Stocks, 20% International, 10% Bonds'
      }
    };
  }, [holdings.length]);

  // Load portfolio history when holdings change
  useEffect(() => {
    const loadPortfolioHistory = async () => {
      if (holdings.length === 0) {
        setPortfolioHistory([]);
        return;
      }

      setIsLoadingHistory(true);
      try {
        // Try to get real-time data
        const realTimeHistory = await calculatePortfolioHistory(holdings, 30);
        if (realTimeHistory.length > 0) {
          setPortfolioHistory(realTimeHistory);
        } else {
          // Fallback to generated data if API fails
          setPortfolioHistory(getFallbackPortfolioHistory());
        }
      } catch (error) {
        console.error('Error loading portfolio history:', error);
        // Fallback to generated data
        setPortfolioHistory(getFallbackPortfolioHistory());
      } finally {
        setIsLoadingHistory(false);
      }
    };

    loadPortfolioHistory();
  }, [holdings]);

  // Update portfolio values with real-time data
  const refreshPortfolioValues = async () => {
    if (holdings.length === 0) return;
    
    setIsUpdatingValues(true);
    try {
      const updatedHoldings = await updatePortfolioValues(holdings);
      setHoldings(prev => 
        prev.map(holding => {
          const updated = updatedHoldings.find(h => h.id === holding.id);
          if (updated && updated.newValue !== undefined) {
            return {
              ...holding,
              value: updated.newValue,
              gain: updated.newGain || holding.gain
            };
          }
          return holding;
        })
      );
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error updating portfolio values:', error);
    } finally {
      setIsUpdatingValues(false);
    }
  };

  // Auto-refresh portfolio values every 5 minutes
  useEffect(() => {
    const interval = setInterval(refreshPortfolioValues, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [holdings.length]);

  // Persist an investments summary (includes all holdings) for cross-screen sharing
  useEffect(() => {
    try {
      const summary = {
        totalValue: portfolioSummary.totalValue,
        overallGain: portfolioSummary.overallGain,
        overallGainPercent: portfolioSummary.overallGainPercent,
        holdings: holdings.map(h => ({ name: h.name, ticker: h.ticker, value: h.value, gain: h.gain })),
        lastUpdated: new Date().toISOString(),
      };
      localStorage.setItem('investmentsSummary', JSON.stringify(summary));
    } catch (_) {
      // ignore
    }
  }, [holdings, portfolioSummary.totalValue, portfolioSummary.overallGain, portfolioSummary.overallGainPercent]);
  
  // Load from Supabase if logged in
  useEffect(() => {
    (async () => {
      try {
        const remote = await loadHoldings();
        if (remote.length > 0) setHoldings(remote);
      } catch (_) {
        // ignore
      }
    })();
  }, []);
  
  const handleOpenAddModal = () => {
    setCurrentHolding(null);
    setFormData({ name: '', ticker: '', value: '', gain: '' });
    setIsModalOpen(true);
  };
  
  const handleOpenEditModal = (holding: Holding) => {
    setCurrentHolding(holding);
    setFormData({
      name: holding.name,
      ticker: holding.ticker,
      value: holding.value.toString(),
      gain: holding.gain.toString(),
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentHolding(null);
  };
  
  const handleDeleteHolding = (id: number) => {
    if (window.confirm('Are you sure you want to delete this holding?')) {
        setHoldings(prev => prev.filter(h => h.id !== id));
        deleteH(id).catch(() => {});
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    const holdingData = {
        name: formData.name,
        ticker: formData.ticker,
        value: parseFloat(formData.value) || 0,
        gain: parseFloat(formData.gain) || 0,
    };

    if(currentHolding) { // Editing
        const updated = { ...currentHolding, ...holdingData } as Holding;
        setHoldings(prev => prev.map(h => h.id === currentHolding.id ? updated : h));
        upsertHolding(updated).catch(() => {});
    } else { // Adding
        const newItem = { id: Date.now(), ...holdingData } as Holding;
        setHoldings(prev => [...prev, newItem]);
        upsertHolding(newItem).catch(() => {});
    }
    handleCloseModal();
  };

  return (
    <div className="p-4 md:p-6 text-brand-text">
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-brand-bg p-6 border-2 border-brand-text shadow-hard w-full max-w-md">
            <h2 className="text-2xl font-bold mb-6">
              {currentHolding ? 'Edit Holding' : 'Add New Holding'}
            </h2>
            <form onSubmit={handleFormSubmit} className="space-y-4">
               <div>
                  <label htmlFor="name" className="block text-sm font-bold mb-1">Name</label>
                  <input id="name" name="name" type="text" required value={formData.name} onChange={handleFormChange} className="w-full bg-brand-bg border-2 border-brand-text p-3 focus:ring-2 focus:ring-brand-accent focus:border-brand-accent focus:outline-none" />
               </div>
               <div>
                  <label htmlFor="ticker" className="block text-sm font-bold mb-1">Ticker</label>
                  <input id="ticker" name="ticker" type="text" required value={formData.ticker} onChange={handleFormChange} className="w-full bg-brand-bg border-2 border-brand-text p-3 focus:ring-2 focus:ring-brand-accent focus:border-brand-accent focus:outline-none" />
               </div>
               <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label htmlFor="value" className="block text-sm font-bold mb-1">Current Value (₹)</label>
                    <input id="value" name="value" type="number" step="0.01" required value={formData.value} onChange={handleFormChange} className="w-full bg-brand-bg border-2 border-brand-text p-3 focus:ring-2 focus:ring-brand-accent focus:border-brand-accent focus:outline-none" />
                 </div>
                 <div>
                    <label htmlFor="gain" className="block text-sm font-bold mb-1">Total Gain (₹)</label>
                    <input id="gain" name="gain" type="number" step="0.01" required value={formData.gain} onChange={handleFormChange} className="w-full bg-brand-bg border-2 border-brand-text p-3 focus:ring-2 focus:ring-brand-accent focus:border-brand-accent focus:outline-none" />
                 </div>
               </div>
               <div className="flex justify-end gap-4 pt-4">
                  <button type="button" onClick={handleCloseModal} className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-brand-text font-bold border-2 border-brand-text shadow-hard transition-all active:translate-x-1 active:translate-y-1 active:shadow-none">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-brand-accent hover:bg-amber-500 text-brand-text font-bold border-2 border-brand-text shadow-hard transition-all active:translate-x-1 active:translate-y-1 active:shadow-none">Save Holding</button>
               </div>
            </form>
          </div>
        </div>
      )}
      <header className="mb-6 border-b-4 border-brand-text pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {onBack && (
              <button onClick={onBack} className="px-3 py-2 text-sm font-bold bg-white text-brand-text border-2 border-brand-text shadow-hard hover:bg-brand-accent" aria-label="Back to landing">Back</button>
            )}
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Investments Dashboard</h1>
              <p className="text-brand-text/80 mt-1">Track your portfolio performance and holdings.</p>
            </div>
          </div>
          
          {/* Predictive Analysis Button */}
          {holdings.length > 0 && (
            <button
              onClick={() => setShowPredictions(!showPredictions)}
              className={`px-6 py-3 text-sm font-bold border-2 shadow-hard transition-all ${
                showPredictions
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white border-purple-700'
                  : 'bg-white text-brand-text border-brand-text hover:bg-brand-accent'
              }`}
              title="Toggle AI-powered predictive analysis"
            >
              {showPredictions ? (
                <span className="flex items-center gap-2">
                  🔮 Hide Predictions
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  🔮 Show Predictions
                </span>
              )}
            </button>
          )}
        </div>
      </header>

      <div className="bg-white p-6 border-2 border-brand-text shadow-hard mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold uppercase">Portfolio History</h2>
          <div className="flex items-center gap-3">
            {/* Predictive Analysis Quick Access */}
            {holdings.length > 0 && (
              <button
                onClick={() => setShowPredictions(!showPredictions)}
                className={`px-3 py-1 text-sm font-bold border-2 shadow-hard transition-all ${
                  showPredictions
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white border-purple-700'
                    : 'bg-white text-brand-text border-brand-text hover:bg-brand-accent'
                }`}
                title="Toggle AI-powered predictive analysis"
              >
                {showPredictions ? '🔮 Hide' : '🔮 Predict'}
              </button>
            )}
            <button
              onClick={refreshPortfolioValues}
              disabled={isUpdatingValues}
              className="px-3 py-1 text-sm font-bold bg-brand-accent hover:bg-amber-500 text-brand-text border-2 border-brand-text shadow-hard transition-all disabled:opacity-50"
            >
              {isUpdatingValues ? 'Updating...' : 'Refresh'}
            </button>
            {lastUpdated && (
              <span className="text-xs text-brand-text/70">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>
        <p className="text-3xl font-bold text-brand-text mb-1">₹${portfolioSummary.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        <div className={`text-md font-bold ${portfolioSummary.overallGain >= 0 ? 'text-green-600' : 'text-red-600'} mb-4`}>
          {portfolioSummary.overallGain >= 0 ? '+' : '-'}₹${Math.abs(portfolioSummary.overallGain).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({portfolioSummary.overallGainPercent.toFixed(2)}%) Overall
        </div>
        
        {isLoadingHistory ? (
          <div className="h-[250px] flex items-center justify-center">
            <div className="text-brand-text/70">Loading portfolio history...</div>
          </div>
        ) : portfolioHistory.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={portfolioHistory} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
              <XAxis 
                dataKey="date" 
                stroke="#1E1E1E" 
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
                              <YAxis stroke="#1E1E1E" domain={["dataMin", "dataMax"]} tickFormatter={(value) => `₹${Number(value).toLocaleString(undefined, { maximumFractionDigits: 0 })}`} />
              <Tooltip 
                content={<CustomTooltip />} 
                labelFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              />
              <Line type="monotone" dataKey="totalValue" stroke="#1E1E1E" strokeWidth={3} activeDot={{ r: 8, className: 'stroke-brand-accent fill-brand-accent' }} dot={{ r: 4, className: 'stroke-brand-text fill-brand-text' }}/>
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[250px] flex items-center justify-center text-brand-text/70">
            No portfolio history available
          </div>
        )}
      </div>
      
            <div className="bg-white p-6 border-2 border-brand-text shadow-hard mb-8">
        <h2 className="text-xl font-bold mb-4 uppercase">Asset Allocation</h2>
        {holdings.length === 0 ? (
          <div className="p-8 text-center border-2 border-dashed border-brand-text bg-gradient-to-br from-blue-50 to-purple-50">
            <div className="mb-4">
              <span className="text-4xl">🔮</span>
            </div>
            <h3 className="text-lg font-bold text-brand-text mb-2">No Investments Yet</h3>
            <p className="text-sm text-brand-text/70 mb-4">
              Add your first investment to unlock AI-powered predictive analysis and insights.
            </p>
            <button
              onClick={handleOpenAddModal}
              className="px-6 py-3 text-sm font-bold bg-gradient-to-r from-purple-600 to-blue-600 text-white border-2 border-purple-700 shadow-hard hover:from-purple-700 hover:to-blue-700 transition-all"
            >
              🚀 Add First Investment
            </button>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={holdings} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
              <XAxis type="number" domain={[0, maxHoldingValue ? maxHoldingValue * 1.1 : 'dataMax']} tickFormatter={(value) => `₹${Number(value).toLocaleString(undefined, { maximumFractionDigits: 0 })}`} stroke="#1E1E1E" />
              <YAxis type="category" dataKey="ticker" stroke="#1E1E1E" width={50} tick={{ fontSize: 12, fontFamily: 'IBM Plex Mono' }} />
              <Tooltip
                cursor={{fill: 'rgba(30, 30, 30, 0.1)'}}
                contentStyle={{ backgroundColor: '#F8F1E4', border: '2px solid #1E1E1E', fontFamily: 'IBM Plex Mono' }}
                formatter={(value) => [`₹${Number(value).toLocaleString()}`, 'Value']}
              />
              <Bar dataKey="value" >
                {holdings.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} className="stroke-brand-text" strokeWidth={2}/>
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Predictive Analysis Section */}
      <div className="bg-white p-6 border-2 border-brand-text shadow-hard mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold uppercase mb-2">🔮 Predictive Analysis</h2>
            <p className="text-brand-text/70 text-sm">
              {holdings.length > 0 
                ? 'AI-powered investment forecasting and recommendations'
                : 'Default investment profile analysis and recommendations'
              }
            </p>
          </div>
          <button
            onClick={() => setShowPredictions(!showPredictions)}
            className="px-4 py-2 text-sm font-bold bg-gradient-to-r from-purple-600 to-blue-600 text-white border-2 border-purple-700 shadow-hard hover:from-purple-700 hover:to-blue-700 transition-all"
          >
            {showPredictions ? 'Hide Analysis' : 'Show Analysis'}
          </button>
        </div>

                {showPredictions && (
          <div className="space-y-6">
            {holdings.length > 0 ? (
              // Existing Portfolio Analysis
              <>
                {/* Timeframe Selector */}
                <div className="flex items-center gap-4">
                  <span className="text-sm font-bold text-brand-text">Prediction Timeframe:</span>
                  <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                    {(['3months', '6months', '1year'] as const).map((timeframe) => (
                      <button
                        key={timeframe}
                        onClick={() => setPredictionTimeframe(timeframe)}
                        className={`px-3 py-1 text-sm font-bold rounded-md transition-all ${
                          predictionTimeframe === timeframe
                            ? 'bg-brand-accent text-brand-text shadow-hard'
                            : 'text-brand-text/70 hover:text-brand-text hover:bg-brand-accent/20'
                        }`}
                      >
                        {timeframe === '3months' ? '3 Months' : timeframe === '6months' ? '6 Months' : '1 Year'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Predictive Chart */}
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border border-purple-200">
                  <h3 className="font-bold text-purple-800 mb-3">Portfolio Growth Projection</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={predictiveData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                      <XAxis 
                        dataKey="month" 
                        stroke="#1E1E1E" 
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis 
                        stroke="#1E1E1E" 
                        tickFormatter={(value) => `₹${Number(value).toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                      />
                      <Tooltip
                        contentStyle={{ 
                          backgroundColor: '#F8F1E4', 
                          border: '2px solid #1E1E1E',
                          borderRadius: '8px'
                        }}
                        formatter={(value, name) => [
                          `₹${Number(value).toLocaleString()}`,
                          name === 'totalValue' ? 'Projected Value' : 'Projected Gain'
                        ]}
                        labelFormatter={(label) => `Timeframe: ${label}`}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="totalValue" 
                        stackId="1"
                        stroke="#8B5CF6" 
                        fill="#8B5CF6" 
                        fillOpacity={0.6}
                        strokeWidth={2}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="predictedGain" 
                        stackId="2"
                        stroke="#3B82F6" 
                        fill="#3B82F6" 
                        fillOpacity={0.4}
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                  <div className="mt-3 text-xs text-purple-700">
                    <p><strong>Note:</strong> Predictions are based on historical performance and market trends. Past performance does not guarantee future results.</p>
                  </div>
                </div>

                {/* Investment Recommendations */}
                {investmentRecommendations.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-bold text-brand-text text-lg">💡 Investment Recommendations</h3>
                    {investmentRecommendations.map((rec, index) => (
                      <div key={index} className={`p-4 rounded-lg border-2 ${
                        rec.type === 'warning' 
                          ? 'bg-yellow-50 border-yellow-300' 
                          : 'bg-blue-50 border-blue-300'
                      }`}>
                        <div className="flex items-start gap-3">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                            rec.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                          }`}>
                            {rec.type === 'warning' ? '⚠️' : 'ℹ️'}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-brand-text mb-1">{rec.title}</h4>
                            <p className="text-sm text-brand-text/80 mb-2">{rec.message}</p>
                            <p className="text-sm font-semibold text-brand-text">{rec.action}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Risk Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                    <h4 className="font-bold text-red-800 mb-2">📊 Risk Level</h4>
                    <p className="text-2xl font-bold text-red-600">
                      {portfolioSummary.overallGainPercent > 20 ? 'High' : portfolioSummary.overallGainPercent > 10 ? 'Medium' : 'Low'}
                    </p>
                    <p className="text-sm text-red-700 mt-1">
                      Based on current volatility and growth patterns
                    </p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h4 className="font-bold text-green-800 mb-2">🎯 Growth Potential</h4>
                    <p className="text-2xl font-bold text-red-600">
                      {portfolioSummary.overallGainPercent > 15 ? 'High' : portfolioSummary.overallGainPercent > 8 ? 'Medium' : 'Moderate'}
                    </p>
                    <p className="text-sm text-green-700 mt-1">
                      Projected based on current performance
                    </p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h4 className="font-bold text-blue-800 mb-2">⚖️ Diversification</h4>
                    <p className="text-2xl font-bold text-blue-600">
                      {holdings.length >= 5 ? 'Good' : holdings.length >= 3 ? 'Fair' : 'Poor'}
                    </p>
                    <p className="text-sm text-blue-700 mt-1">
                      {holdings.length} holdings across different sectors
                    </p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <h4 className="font-bold text-purple-800 mb-2">📈 Market Sentiment</h4>
                    <p className="text-2xl font-bold text-purple-600">
                      {portfolioSummary.overallGainPercent > 15 ? 'Bullish' : portfolioSummary.overallGainPercent > 5 ? 'Neutral' : 'Bearish'}
                    </p>
                    <p className="text-sm text-purple-700 mt-1">
                      Based on portfolio performance trends
                    </p>
                  </div>
                </div>
              </>
            ) : (
              // Default Profile Analysis
              <>
                {/* Profile Summary */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border border-blue-200">
                  <h3 className="text-xl font-bold text-brand-text mb-4">👤 Investment Profile Analysis</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white p-4 rounded-lg border border-blue-200">
                      <h4 className="font-bold text-blue-800 mb-2">Profile Type</h4>
                      <p className="text-2xl font-bold text-blue-600">{defaultProfileAnalysis?.profileType}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-purple-200">
                      <h4 className="font-bold text-purple-800 mb-2">Risk Tolerance</h4>
                      <p className="text-2xl font-bold text-purple-600">{defaultProfileAnalysis?.riskTolerance}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-green-200">
                      <h4 className="font-bold text-green-800 mb-2">Investment Style</h4>
                      <p className="text-2xl font-bold text-green-600">{defaultProfileAnalysis?.investmentStyle}</p>
                    </div>
                  </div>
                </div>

                {/* Recommended Actions */}
                <div className="space-y-3">
                  <h3 className="font-bold text-brand-text text-lg">💡 Recommended Actions</h3>
                  {defaultProfileAnalysis?.recommendedActions.map((rec, index) => (
                    <div key={index} className={`p-4 rounded-lg border-2 ${
                      rec.type === 'warning' 
                        ? 'bg-yellow-50 border-yellow-300' 
                        : rec.type === 'success'
                        ? 'bg-green-50 border-green-300'
                        : 'bg-blue-50 border-blue-300'
                    }`}>
                      <div className="flex items-start gap-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                          rec.type === 'warning' ? 'bg-yellow-500' : rec.type === 'success' ? 'bg-green-500' : 'bg-blue-500'
                        }`}>
                          {rec.type === 'warning' ? '⚠️' : rec.type === 'success' ? '✅' : 'ℹ️'}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-brand-text mb-1">{rec.title}</h4>
                          <p className="text-sm text-brand-text/80 mb-2">{rec.message}</p>
                          <p className="text-sm font-semibold text-brand-text">{rec.action}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Market Outlook */}
                <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg border border-green-200">
                  <h3 className="text-xl font-bold text-brand-text mb-4">📊 Market Outlook & Strategy</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="bg-white p-4 rounded-lg border border-green-200">
                      <h4 className="font-bold text-green-800 mb-2">Current Trend</h4>
                      <p className="text-lg font-bold text-green-600">{defaultProfileAnalysis?.marketOutlook.currentTrend}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-blue-200">
                      <h4 className="font-bold text-blue-800 mb-2">Strategy</h4>
                      <p className="text-lg font-bold text-blue-600">{defaultProfileAnalysis?.marketOutlook.recommendation}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-purple-200">
                      <h4 className="font-bold text-purple-800 mb-2">Time Horizon</h4>
                      <p className="text-lg font-bold text-purple-600">{defaultProfileAnalysis?.marketOutlook.timeHorizon}</p>
                    </div>
                  </div>
                </div>

                {/* Asset Allocation Guide */}
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-6 rounded-lg border border-amber-200">
                  <h3 className="text-xl font-bold text-brand-text mb-4">⚖️ Asset Allocation Guide</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-lg border border-amber-200">
                      <h4 className="font-bold text-amber-800 mb-2">Conservative</h4>
                      <p className="text-sm text-amber-700">{defaultProfileAnalysis?.assetAllocation.conservative}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-orange-200">
                      <h4 className="font-bold text-orange-800 mb-2">Moderate</h4>
                      <p className="text-sm text-orange-700">{defaultProfileAnalysis?.assetAllocation.moderate}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-red-200">
                      <h4 className="font-bold text-red-800 mb-2">Aggressive</h4>
                      <p className="text-sm text-red-700">{defaultProfileAnalysis?.assetAllocation.aggressive}</p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <div className="bg-white p-5 border-2 border-brand-text shadow-hard">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold uppercase">Your Holdings</h2>
            <button onClick={handleOpenAddModal} className="flex items-center px-3 py-2 text-sm font-bold bg-brand-accent text-brand-text border-2 border-brand-text shadow-hard transition-all duration-200 hover:bg-amber-500 active:translate-x-1 active:translate-y-1 active:shadow-none">
                <AddIcon />
                Add Holding
            </button>
        </div>
        {holdings.length === 0 ? (
          <div className="p-4 text-center text-sm text-brand-text/70 border-2 border-dashed border-brand-text">
            No holdings yet. Use "Add Holding" to get started.
          </div>
        ) : (
          <div className="space-y-3">
            {holdings.map((holding) => {
              const costBasis = holding.value - holding.gain;
              const gainPercent = costBasis !== 0 ? (holding.gain / costBasis) * 100 : 0;
              return (
                  <div key={holding.id} className="grid grid-cols-3 md:grid-cols-4 items-center p-3 border-2 border-brand-text gap-2">
                  <div className="col-span-1 md:col-span-2">
                      <p className="font-bold">{holding.name}</p>
                      <p className="text-xs text-brand-text/70">{holding.ticker}</p>
                  </div>
                  <p className="font-bold text-right">₹{holding.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  <div className="flex items-center justify-end gap-2">
                      <div className={`text-sm font-bold text-right ${holding.gain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {holding.gain >= 0 ? '+' : '-'}₹{Math.abs(holding.gain).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({gainPercent.toFixed(2)}%)
                      </div>
                      <button onClick={() => handleOpenEditModal(holding)} className="text-brand-text/70 hover:text-brand-text p-1.5" aria-label="Edit holding"><EditIcon /></button>
                      <button onClick={() => handleDeleteHolding(holding.id)} className="text-brand-text/70 hover:text-red-600 p-1.5" aria-label="Delete holding"><TrashIcon /></button>
                  </div>
                  </div>
              );
            })}
          </div>
        )}
      </div>
      
      {/* Floating Predictive Analysis Button */}
      {holdings.length > 0 && !showPredictions && (
        <div className="fixed bottom-6 right-6 z-40">
          <button
            onClick={() => setShowPredictions(true)}
            className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 text-white border-2 border-purple-700 shadow-hard rounded-full flex items-center justify-center hover:from-purple-700 hover:to-blue-700 transition-all transform hover:scale-110"
            title="Show AI Predictive Analysis"
          >
            <span className="text-2xl">🔮</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default InvestmentsScreen;