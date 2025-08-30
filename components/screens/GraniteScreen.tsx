import React, { useState, useEffect } from 'react';
import { Screen } from '../../types';
import { createGoalsFromScreenContent, type Goal } from '../../services/goalsService';

interface GraniteScreenProps {
  onBack: () => void;
}



const GraniteScreen: React.FC<GraniteScreenProps> = ({ onBack }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'playground' | 'info'>('playground');
  const [isCreatingGoals, setIsCreatingGoals] = useState(false);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [showGoals, setShowGoals] = useState(false);
  const [focusMode, setFocusMode] = useState(true);
  const [iframeStyle, setIframeStyle] = useState({
    filter: 'contrast(1.1) brightness(1.05)',
    transform: 'scale(1.02)',
  });

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  const toggleFocusMode = () => {
    setFocusMode(!focusMode);
    if (!focusMode) {
      // Enable focus mode
      setIframeStyle({
        filter: 'contrast(1.1) brightness(1.05)',
        transform: 'scale(1.02)',
      });
    } else {
      // Disable focus mode
      setIframeStyle({
        filter: 'none',
        transform: 'scale(1)',
      });
    }
  };

  // Inject CSS to hide navigation elements when focus mode is enabled
  useEffect(() => {
    if (focusMode && !isLoading) {
      const iframe = document.querySelector('iframe');
      if (iframe) {
        try {
          const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
          if (iframeDoc) {
            const style = iframeDoc.createElement('style');
            style.textContent = `
              /* Hide navigation and distracting elements */
              nav, .navigation, .header, .sidebar, .menu, .breadcrumb,
              .footer, .footer-nav, .social-links, .advertisement,
              .banner, .promo, .cookie-notice, .newsletter-signup {
                display: none !important;
              }
              
              /* Focus on main content */
              .main-content, .content, .playground, .chat-interface {
                margin: 0 !important;
                padding: 20px !important;
                max-width: none !important;
              }
              
              /* Enhance readability */
              body {
                font-size: 16px !important;
                line-height: 1.6 !important;
              }
            `;
            iframeDoc.head.appendChild(style);
          }
        } catch (error) {
          // Cross-origin restrictions may prevent CSS injection
          console.log('CSS injection not possible due to cross-origin restrictions');
        }
      }
    }
  }, [focusMode, isLoading]);

  const createGoalsFromScreen = async () => {
    setIsCreatingGoals(true);
    
    try {
      // Call the goals service to create goals based on screen content
      const response = await createGoalsFromScreenContent({
        screenContent: 'IBM Granite AI Integration',
        context: 'Financial application with AI capabilities',
        userPreferences: {
          currency: 'INR',
          focus: 'financial planning and AI assistance'
        }
      });

      if (response.success) {
        setGoals(response.goals);
        setShowGoals(true);
        console.log('Goals created successfully:', response.message);
        console.log('AI Analysis:', response.analysis);
      } else {
        console.warn('Goals creation returned success: false');
        setGoals(response.goals);
        setShowGoals(true);
      }
      
    } catch (error) {
      console.error('Error creating goals:', error);
      // The service will handle fallback goals automatically
      setGoals([]);
      setShowGoals(false);
    } finally {
      setIsCreatingGoals(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500 text-white';
      case 'in-progress':
        return 'bg-blue-500 text-white';
      case 'pending':
        return 'bg-yellow-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return '✅';
      case 'in-progress':
        return '🔄';
      case 'pending':
        return '⏳';
      default:
        return '📋';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white border-b-4 border-brand-text shadow-hard">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="px-4 py-2 text-sm font-bold bg-white text-brand-text border-2 border-brand-text shadow-hard hover:bg-brand-accent transition-all"
                aria-label="Back to main menu"
              >
                ← Back
              </button>
              <div>
                <h1 className="text-3xl font-bold text-brand-text">IBM Granite AI</h1>
                <p className="text-brand-text/70 mt-1">Advanced AI-powered financial analysis and insights</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={toggleFocusMode}
                className={`px-3 py-2 text-sm font-bold border-2 shadow-hard transition-all ${
                  focusMode
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white border-purple-700'
                    : 'bg-white text-brand-text border-brand-text hover:bg-brand-accent'
                }`}
                title="Toggle focus mode for better content visibility"
              >
                {focusMode ? '🔍 Focus On' : '👁️ Focus Off'}
              </button>
              <button
                onClick={createGoalsFromScreen}
                disabled={isCreatingGoals}
                className="px-4 py-2 text-sm font-bold bg-gradient-to-r from-green-600 to-emerald-600 text-white border-2 border-green-700 shadow-hard hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                title="Create AI-powered goals based on screen content"
              >
                {isCreatingGoals ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span className="animate-pulse">AI Analyzing...</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    🎯 Create Goals
                  </span>
                )}
              </button>
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg font-bold">
                Powered by IBM
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex space-x-1 bg-white p-1 rounded-xl border-2 border-brand-text shadow-hard">
          <button
            onClick={() => setActiveTab('playground')}
            className={`flex-1 px-6 py-3 rounded-lg font-bold transition-all ${
              activeTab === 'playground'
                ? 'bg-brand-accent text-brand-text shadow-hard'
                : 'text-brand-text/70 hover:text-brand-text hover:bg-brand-accent/20'
            }`}
          >
            🎮 AI Playground
          </button>
          <button
            onClick={() => setActiveTab('info')}
            className={`flex-1 px-6 py-3 rounded-lg font-bold transition-all ${
              activeTab === 'info'
                ? 'bg-brand-accent text-brand-text shadow-hard'
                : 'text-brand-text/70 hover:text-brand-text hover:bg-brand-accent/20'
            }`}
          >
            ℹ️ About Granite
          </button>
        </div>
      </div>

      {/* Goals Section */}
      {showGoals && (
        <div className="max-w-7xl mx-auto px-4 pb-6">
          <div className="bg-white p-6 border-2 border-brand-text shadow-hard rounded-xl mb-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-2xl">🎯</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-brand-text">AI-Generated Goals</h2>
                  <p className="text-brand-text/70">Goals created based on IBM Granite AI analysis</p>
                </div>
              </div>
              <button
                onClick={() => setShowGoals(false)}
                className="px-3 py-2 text-sm font-bold bg-gray-100 text-gray-600 border-2 border-gray-300 rounded-lg hover:bg-gray-200 transition-all"
              >
                ✕ Hide
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {goals.map((goal) => (
                <div key={goal.id} className="border-2 border-brand-text shadow-hard rounded-lg p-4 bg-gradient-to-br from-white to-gray-50">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-bold text-brand-text text-lg">{goal.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusColor(goal.status)}`}>
                      {getStatusIcon(goal.status)} {goal.status}
                    </span>
                  </div>
                  
                  <p className="text-brand-text/70 text-sm mb-3">{goal.description}</p>
                  
                  <div className="space-y-2 mb-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-brand-text/70">Category:</span>
                      <span className="font-semibold text-brand-text">{goal.category}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-brand-text/70">Progress:</span>
                      <span className="font-semibold text-brand-text">
                        ₹{goal.currentAmount.toLocaleString()} / ₹{goal.targetAmount.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-brand-text/70">Deadline:</span>
                      <span className="font-semibold text-brand-text">
                        {new Date(goal.deadline).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ${
                        goal.status === 'completed' 
                          ? 'bg-green-500' 
                          : goal.status === 'in-progress' 
                          ? 'bg-blue-500' 
                          : 'bg-yellow-500'
                      }`}
                      style={{ 
                        width: `${Math.min((goal.currentAmount / goal.targetAmount) * 100, 100)}%` 
                      }}
                    ></div>
                  </div>

                  <div className="text-xs text-brand-text/50">
                    Created: {new Date(goal.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
              <h4 className="font-bold text-green-800 mb-2">🎉 Goal Creation Complete!</h4>
              <p className="text-green-700 text-sm">
                IBM Granite AI has analyzed your screen content and created personalized goals. 
                Track your progress and complete these objectives to enhance your financial planning skills.
              </p>
              <div className="mt-3 p-3 bg-white rounded-lg border border-green-200">
                <h5 className="font-bold text-green-800 mb-2">🤖 AI Analysis Summary</h5>
                <div className="text-sm text-green-700 space-y-1">
                  <p><strong>Estimated Time:</strong> 3-6 months for basic proficiency</p>
                  <p><strong>Focus Area:</strong> AI-powered financial planning</p>
                  <p><strong>Currency:</strong> Indian Rupees (₹)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 pb-8">
        {activeTab === 'playground' ? (
          <div className="space-y-6">
            {/* AI Playground Section */}
            <div className="bg-white p-6 border-2 border-brand-text shadow-hard rounded-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-2xl">🤖</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-brand-text">AI Playground</h2>
                  <p className="text-brand-text/70">Experience IBM Granite's advanced AI capabilities</p>
                </div>
              </div>

              {/* Loading State */}
              {isLoading && (
                <div className="flex items-center justify-center py-20">
                  <div className="text-center">
                    <div className="w-16 h-16 border-4 border-brand-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-brand-text/70 font-semibold">Loading IBM Granite Playground...</p>
                    <p className="text-sm text-brand-text/50 mt-2">This may take a few moments</p>
                  </div>
                </div>
              )}

                                                  {/* IBM Granite Playground iframe */}
               <div className="relative">
                 <iframe
                   src="https://www.ibm.com/granite/playground/"
                   title="IBM Granite AI Playground"
                   className="w-full h-[800px] border-2 border-brand-text rounded-lg shadow-hard"
                   onLoad={handleIframeLoad}
                   sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
                   style={iframeStyle}
                 />
                 
                 {/* Enhanced overlay for better UX and content focus */}
                 {!isLoading && focusMode && (
                   <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md px-4 py-2 rounded-lg border-2 border-brand-text shadow-hard">
                     <div className="text-center">
                       <p className="text-sm text-brand-text font-bold">IBM Granite AI</p>
                       <p className="text-xs text-brand-text/70">Focus Mode Enabled</p>
                     </div>
                   </div>
                 )}
                 
                 {/* Focus mode instructions */}
                 {!isLoading && focusMode && (
                   <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-md px-4 py-2 rounded-lg border-2 border-brand-text shadow-hard max-w-xs">
                     <p className="text-xs text-brand-text/80">
                       <strong>💡 Tip:</strong> Use the playground interface directly. Navigation elements are minimized for better focus.
                     </p>
                   </div>
                 )}
               </div>

              {/* Quick Actions */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h3 className="font-bold text-blue-800 mb-2">💡 Try These Prompts</h3>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• "Explain quantum computing"</li>
                    <li>• "What is Openshift?"</li>
                    <li>• "Generate Java code"</li>
                  </ul>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <h3 className="font-bold text-purple-800 mb-2">🚀 Features</h3>
                  <ul className="text-sm text-purple-700 space-y-1">
                    <li>• Advanced AI responses</li>
                    <li>• Code generation</li>
                    <li>• Business insights</li>
                  </ul>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h3 className="font-bold text-green-800 mb-2">🔒 Secure</h3>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• Enterprise-grade AI</li>
                    <li>• Trusted by IBM</li>
                    <li>• Business-focused</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* About Granite Section */}
            <div className="bg-white p-6 border-2 border-brand-text shadow-hard rounded-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-2xl">ℹ️</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-brand-text">About IBM Granite</h2>
                  <p className="text-brand-text/70">Understanding the power behind IBM's AI technology</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-bold text-brand-text mb-4">What is IBM Granite?</h3>
                  <p className="text-brand-text/80 mb-4">
                    IBM Granite is a family of AI models purpose-built for business, engineered from the ground up to ensure trust and scalability in AI-driven applications.
                  </p>
                  <p className="text-brand-text/80 mb-4">
                    These models are designed to handle complex business tasks, provide accurate insights, and generate high-quality content while maintaining enterprise-grade security and reliability.
                  </p>
                  
                  <h4 className="font-bold text-brand-text mb-2">Key Capabilities:</h4>
                  <ul className="text-brand-text/80 space-y-2 mb-4">
                    <li>• <strong>Code Generation:</strong> Generate Java, Python, and other programming languages</li>
                    <li>• <strong>Business Analysis:</strong> Explain complex concepts like quantum computing</li>
                    <li>• <strong>Technical Documentation:</strong> Create comprehensive technical explanations</li>
                    <li>• <strong>Productivity Enhancement:</strong> Boost productivity habits and workflows</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-brand-text mb-4">Why Choose Granite?</h3>
                  <div className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <h4 className="font-bold text-blue-800 mb-2">🏢 Enterprise-Grade</h4>
                      <p className="text-blue-700 text-sm">
                        Built specifically for business use cases with enterprise-level security and reliability.
                      </p>
                    </div>
                    
                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                      <h4 className="font-bold text-purple-800 mb-2">🔒 Trust & Security</h4>
                      <p className="text-purple-700 text-sm">
                        Engineered with trust and security as core principles for business applications.
                      </p>
                    </div>
                    
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <h4 className="font-bold text-green-800 mb-2">📈 Scalability</h4>
                      <p className="text-green-700 text-sm">
                        Designed to scale with your business needs and handle complex workloads.
                      </p>
                    </div>
                    
                    <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                      <h4 className="font-bold text-amber-800 mb-2">🎯 Purpose-Built</h4>
                      <p className="text-amber-700 text-sm">
                        Created specifically for business applications, not adapted from general-purpose models.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Integration Benefits */}
              <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border border-blue-200">
                <h3 className="text-xl font-bold text-brand-text mb-4">💼 Integration Benefits for Your Finance App</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-bold text-brand-text mb-2">Financial Analysis</h4>
                    <ul className="text-brand-text/80 text-sm space-y-1">
                      <li>• Advanced portfolio analysis</li>
                      <li>• Risk assessment algorithms</li>
                      <li>• Investment strategy recommendations</li>
                      <li>• Market trend analysis</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-bold text-brand-text mb-2">Business Intelligence</h4>
                    <ul className="text-brand-text/80 text-sm space-y-1">
                      <li>• Financial report generation</li>
                      <li>• Data visualization insights</li>
                      <li>• Predictive analytics</li>
                      <li>• Compliance documentation</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GraniteScreen;
