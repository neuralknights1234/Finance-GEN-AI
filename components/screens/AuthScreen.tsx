import React, { useState } from 'react';
import { supabase } from '../../services/supabaseClient';
import { createProfileIfNotExists } from '../../services/supabaseData';

const AuthScreen: React.FC<{ onAuthSuccess: () => void; onBack?: () => void }> = ({ onAuthSuccess, onBack }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Please enter your email address first');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin,
      });
      if (error) throw error;
      setError('Password reset email sent! Check your inbox.');
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === 'signup') {
        if (!email || !password || !name) throw new Error('All fields are required');
        
        console.log('Creating new account...');
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { name } },
        });
        if (signUpError) throw signUpError;
        
        console.log('Account created, signing in...');
        // Some projects require email confirmation; proceed to login for dev UX
        const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password });
        if (signInErr) throw signInErr;
        
        console.log('Signed in, updating user metadata...');
        // Ensure name is persisted on the authenticated user metadata
        await supabase.auth.updateUser({ data: { name } });
        
        console.log('Creating default profile in database...');
        // Create default profile in database
        const profileCreated = await createProfileIfNotExists();
        if (profileCreated) {
          console.log('Default profile created successfully');
        }
        
        console.log('Signup process completed');
      } else {
        if (!email || !password) throw new Error('Email and password required');
        
        console.log('Logging in existing user...');
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
        
        console.log('Login successful, profile data will be loaded automatically');
      }
      // Auth state change will handle navigation
    } catch (err: any) {
      console.error('Authentication error:', err);
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto text-brand-text">
      <header className="mb-6 border-b-4 border-brand-text pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onBack && (
            <button onClick={onBack} className="px-3 py-1.5 text-xs font-bold bg-white text-brand-text border-2 border-brand-text shadow-hard transition-all duration-200 hover:bg-brand-accent active:translate-x-1 active:translate-y-1 active:shadow-none" aria-label="Go back">
              Back
            </button>
          )}
          <h1 className="text-2xl font-bold">{mode === 'login' ? 'Login' : 'Sign Up'}</h1>
        </div>
      </header>
      
      <div className="bg-white p-5 border-2 border-brand-text shadow-hard">
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-sm font-bold mb-1">Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-brand-bg border-2 border-brand-text p-3 focus:ring-2 focus:ring-brand-accent focus:border-brand-accent focus:outline-none" />
            </div>
          )}
          <div>
            <label className="block text-sm font-bold mb-1">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-brand-bg border-2 border-brand-text p-3 focus:ring-2 focus:ring-brand-accent focus:border-brand-accent focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-brand-bg border-2 border-brand-text p-3 focus:ring-2 focus:ring-brand-accent focus:border-brand-accent focus:outline-none" />
          </div>
          {error && <p className="text-red-600 text-sm font-bold">{error}</p>}
          <button type="submit" disabled={loading} className="w-full bg-brand-accent hover:bg-amber-500 text-brand-text font-bold py-3 px-4 border-2 border-brand-text shadow-hard transition-all active:translate-x-1 active:translate-y-1 active:shadow-none disabled:opacity-50">
            {loading ? 'Please wait…' : (mode === 'login' ? 'Login' : 'Create Account')}
          </button>
        </form>
        
        <div className="text-center mt-4 space-y-2">
          {mode === 'login' && (
            <button 
              onClick={handleForgotPassword}
              className="text-sm text-brand-text/70 hover:text-brand-text underline block"
            >
              Forgot password?
            </button>
          )}
          <button onClick={() => setMode(mode === 'login' ? 'signup' : 'login')} className="text-sm underline">
            {mode === 'login' ? "Don't have an account? Sign up" : 'Have an account? Log in'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;

