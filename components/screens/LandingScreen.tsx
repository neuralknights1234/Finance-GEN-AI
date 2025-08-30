import React from 'react';
import LandingIllustration from '../icons/LandingIllustration';
import ImageWithFallback from '../ImageWithFallback';

interface LandingScreenProps {
  onGetStarted: () => void;
  onLogin: () => void;
}

const LandingScreen: React.FC<LandingScreenProps> = ({ onGetStarted, onLogin }) => {
  return (
    <div className="flex flex-col h-full text-brand-text">
      <header className="border-b-4 border-brand-text p-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold">Personal Finance Copilot</h1>
          <div className="flex gap-3">
            <button onClick={onLogin} className="px-4 py-2 text-xs md:text-sm font-bold bg-white text-brand-text border-2 border-brand-text shadow-hard transition-all duration-200 hover:bg-brand-accent active:translate-x-1 active:translate-y-1 active:shadow-none">Log In</button>
            <button onClick={onGetStarted} className="px-4 py-2 text-xs md:text-sm font-bold bg-brand-accent text-brand-text border-2 border-brand-text shadow-hard transition-all duration-200 hover:bg-amber-500 active:translate-x-1 active:translate-y-1 active:shadow-none">Get Started</button>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
        {/* Hero Section */}
        <section className="px-6 py-10">
          <div className="max-w-5xl mx-auto text-center animate-fade-in-up">
            <div className="flex justify-center mb-6">
              <ImageWithFallback
                src="/images/landing-hero.png"
                alt="Finance assistant illustration"
                className="w-48 h-48 md:w-64 md:h-64 object-contain border-2 border-brand-text shadow-hard animate-float-slow bg-white"
                fallback={<LandingIllustration />}
              />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Make smarter money moves, fast</h2>
            <p className="text-brand-text/80 mb-8 text-lg">Chat about budgets, taxes, and investments. Get smart follow-ups, share your data when you want, and see actionable insights.</p>
            <div className="flex gap-4 justify-center">
              <button onClick={onGetStarted} className="px-6 py-3 text-sm font-bold bg-brand-accent text-brand-text border-2 border-brand-text shadow-hard transition-all duration-200 hover:bg-amber-500 active:translate-x-1 active:translate-y-1 active:shadow-none">Start Chatting</button>
              <button onClick={onLogin} className="px-6 py-3 text-sm font-bold bg-white text-brand-text border-2 border-brand-text shadow-hard transition-all duration-200 hover:bg-brand-accent active:translate-x-1 active:translate-y-1 active:shadow-none">I already have an account</button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="px-6 py-12 bg-white border-y-2 border-brand-text">
          <div className="max-w-5xl mx-auto">
            <h3 className="text-2xl font-bold text-center mb-8">🚀 Powerful Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 border-2 border-brand-text shadow-hard text-center">
                <div className="text-4xl mb-4">💬</div>
                <h4 className="text-lg font-bold mb-2">AI Chat Assistant</h4>
                <p className="text-sm text-brand-text/80">Get personalized financial advice through intelligent conversations. Ask about budgeting, investing, taxes, and more.</p>
              </div>
              <div className="p-6 border-2 border-brand-text shadow-hard text-center">
                <div className="text-4xl mb-4">📊</div>
                <h4 className="text-lg font-bold mb-2">Tax Calculator</h4>
                <p className="text-sm text-brand-text/80">Calculate your Indian income tax with step-by-step breakdown and smart deduction suggestions.</p>
              </div>
              <div className="p-6 border-2 border-brand-text shadow-hard text-center">
                <div className="text-4xl mb-4">📸</div>
                <h4 className="text-lg font-bold mb-2">Image Analysis</h4>
                <p className="text-sm text-brand-text/80">Upload receipts and documents for instant text extraction and financial insights.</p>
              </div>
            </div>
          </div>
        </section>

        {/* IBM Granite Integration Section */}
        <section className="px-6 py-12 bg-gradient-to-r from-blue-50 to-purple-50 border-y-2 border-brand-text">
          <div className="max-w-5xl mx-auto">
            <h3 className="text-2xl font-bold text-center mb-8">🤖 IBM Granite AI Integration</h3>
            <div className="text-center mb-8">
              <p className="text-brand-text/80 text-lg mb-6">Experience enterprise-grade AI powered by IBM Granite for advanced financial analysis and insights.</p>
              <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-lg border-2 border-brand-text shadow-hard">
                <span className="text-blue-600 font-bold">Powered by IBM</span>
                <span className="text-purple-600">Granite AI</span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-6 border-2 border-brand-text shadow-hard rounded-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                    <span className="text-white text-2xl">🎮</span>
                  </div>
                  <h4 className="text-xl font-bold text-brand-text">AI Playground</h4>
                </div>
                <p className="text-sm text-brand-text/80 mb-4">Access IBM's advanced AI playground directly within the app for:</p>
                <ul className="text-sm text-brand-text/80 space-y-2">
                  <li>• Advanced financial analysis</li>
                  <li>• Code generation for financial tools</li>
                  <li>• Business intelligence insights</li>
                  <li>• Technical documentation</li>
                </ul>
              </div>
              <div className="bg-white p-6 border-2 border-brand-text shadow-hard rounded-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                    <span className="text-white text-2xl">🏢</span>
                  </div>
                  <h4 className="text-xl font-bold text-brand-text">Enterprise Features</h4>
                </div>
                <p className="text-sm text-brand-text/80 mb-4">Built for business with enterprise-grade capabilities:</p>
                <ul className="text-sm text-brand-text/80 space-y-2">
                  <li>• Trust and security focused</li>
                  <li>• Scalable AI processing</li>
                  <li>• Purpose-built for business</li>
                  <li>• Professional-grade insights</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="px-6 py-12">
          <div className="max-w-5xl mx-auto">
            <h3 className="text-2xl font-bold text-center mb-8">🎯 How It Works</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-brand-accent border-2 border-brand-text shadow-hard rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold">1</span>
                </div>
                <h4 className="text-lg font-bold mb-2">Sign Up & Connect</h4>
                <p className="text-sm text-brand-text/80">Create your account and optionally connect your financial data for personalized insights.</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-brand-accent border-2 border-brand-text shadow-hard rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold">2</span>
                </div>
                <h4 className="text-lg font-bold mb-2">Ask Questions</h4>
                <p className="text-sm text-brand-text/80">Chat with our AI about your finances, taxes, investments, or upload documents for analysis.</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-brand-accent border-2 border-brand-text shadow-hard rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold">3</span>
                </div>
                <h4 className="text-lg font-bold mb-2">Get Insights</h4>
                <p className="text-sm text-brand-text/80">Receive actionable advice, calculations, and smart follow-up questions to guide your decisions.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Screenshots Section */}
        <section className="px-6 py-12 bg-white border-y-2 border-brand-text">
          <div className="max-w-5xl mx-auto">
            <h3 className="text-2xl font-bold text-center mb-8">📱 See It In Action</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="text-center">
                <div className="w-full max-w-sm mx-auto p-4 bg-brand-bg border-2 border-brand-text shadow-hard rounded-lg mb-4">
                  <div className="text-6xl mb-2">💬</div>
                  <h4 className="font-bold mb-2">Smart Chat Interface</h4>
                  <p className="text-sm text-brand-text/80">Intelligent conversations with contextual follow-ups</p>
                </div>
                <p className="text-sm text-brand-text/70">Experience natural conversations about your finances</p>
              </div>
              <div className="text-center">
                <div className="w-full max-w-sm mx-auto p-4 bg-brand-bg border-2 border-brand-text shadow-hard rounded-lg mb-4">
                  <div className="text-6xl mb-2">🧮</div>
                  <h4 className="font-bold mb-2">Tax Calculator</h4>
                  <p className="text-sm text-brand-text/80">Step-by-step Indian tax calculation with deductions</p>
                </div>
                <p className="text-sm text-brand-text/70">Calculate taxes and discover savings opportunities</p>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="px-6 py-12">
          <div className="max-w-5xl mx-auto">
            <h3 className="text-2xl font-bold text-center mb-8">✨ Why Choose Us</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">🔒</div>
                  <div>
                    <h4 className="font-bold">Privacy First</h4>
                    <p className="text-sm text-brand-text/80">Your data stays in your browser. You control what's shared.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="text-2xl">⚡</div>
                  <div>
                    <h4 className="font-bold">Instant Results</h4>
                    <p className="text-sm text-brand-text/80">Get immediate answers and calculations without waiting.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="text-2xl">🎯</div>
                  <div>
                    <h4 className="font-bold">Personalized Advice</h4>
                    <p className="text-sm text-brand-text/80">Tailored recommendations based on your financial situation.</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">📈</div>
                  <div>
                    <h4 className="font-bold">Smart Insights</h4>
                    <p className="text-sm text-brand-text/80">AI-powered analysis of your financial patterns and opportunities.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="text-2xl">🔄</div>
                  <div>
                    <h4 className="font-bold">Continuous Learning</h4>
                    <p className="text-sm text-brand-text/80">The more you use it, the better it understands your needs.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="text-2xl">💰</div>
                  <div>
                    <h4 className="font-bold">Save Money</h4>
                    <p className="text-sm text-brand-text/80">Discover tax savings and investment opportunities you might miss.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-6 py-12 bg-brand-accent border-y-2 border-brand-text">
          <div className="max-w-5xl mx-auto text-center">
            <h3 className="text-2xl font-bold mb-4">Ready to Take Control of Your Finances?</h3>
            <p className="text-brand-text/80 mb-6">Join thousands of users who are making smarter financial decisions with AI assistance.</p>
            <div className="flex gap-4 justify-center">
              <button onClick={onGetStarted} className="px-8 py-4 text-lg font-bold bg-white text-brand-text border-2 border-brand-text shadow-hard transition-all duration-200 hover:bg-brand-bg active:translate-x-1 active:translate-y-1 active:shadow-none">Get Started Free</button>
              <button onClick={onLogin} className="px-8 py-4 text-lg font-bold bg-brand-bg text-brand-text border-2 border-brand-text shadow-hard transition-all duration-200 hover:bg-white active:translate-x-1 active:translate-y-1 active:shadow-none">Sign In</button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default LandingScreen;

