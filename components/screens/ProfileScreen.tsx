import React, { useEffect, useMemo, useState } from 'react';
import { Persona, UserProfile, IncomeRange } from '../../types';
import PersonaSelector from '../PersonaSelector';
import { supabase } from '../../services/supabaseClient';
import { saveUserProfile, loadUserProfile, createProfileIfNotExists } from '../../services/supabaseData';
import { analyzeProfile } from '../../services/simpleAnalysisService';
import { getFinancialSummary } from '../../services/financialDataService';

interface ProfileScreenProps {
  userProfile: UserProfile;
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  onBack?: () => void;
  onProfileUpdate?: () => Promise<void>;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ userProfile, setUserProfile, onBack, onProfileUpdate }) => {
  const [isSaved, setIsSaved] = useState(false);

  const [user, setUser] = useState<any>(null);
  const [sessionDuration, setSessionDuration] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string>('');
  const [showAnalysis, setShowAnalysis] = useState(false);

  // Calculate and update session duration every minute
  useEffect(() => {
    if (!user?.last_sign_in_at) return;

    const updateSessionDuration = () => {
      const lastSignIn = new Date(user.last_sign_in_at).getTime();
      const now = Date.now();
      const diffMs = now - lastSignIn;
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      
      if (diffHours > 0) {
        setSessionDuration(`${diffHours}h ${diffMinutes}m`);
      } else {
        setSessionDuration(`${diffMinutes}m`);
      }
    };

    updateSessionDuration();
    const interval = setInterval(updateSessionDuration, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [user?.last_sign_in_at]);

  // Get current user data
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  // Load profile data from database when component mounts
  useEffect(() => {
    const loadProfile = async () => {
      try {
        // Ensure profile exists in database
        await createProfileIfNotExists();
        
        // Load profile data
        const profileData = await loadUserProfile();
        if (profileData) {
          setUserProfile(profileData);
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      }
    };

    loadProfile();
  }, [setUserProfile]);

  // Function to refresh profile data from database
  const refreshProfileData = async () => {
    try {
      const profileData = await loadUserProfile();
      if (profileData) {
        setUserProfile(profileData);
        console.log('Profile data refreshed from database');
      }
    } catch (error) {
      console.error('Error refreshing profile:', error);
      alert('Error refreshing profile data. Please try again.');
    }
  };

  const handleProfileAnalysis = async () => {
    setIsAnalyzing(true);
    setAnalysisResult('');
    setShowAnalysis(true);

    try {
      // IBM Granite AI is currently disabled - using offline analysis only
      console.log('IBM Granite AI analysis is disabled - using offline analysis');

      // Get financial data for comprehensive analysis
      let financialData = null;
      try {
        financialData = await getFinancialSummary();
      } catch (error) {
        console.warn('Could not load financial data for analysis:', error);
      }

      // Perform offline analysis
      const analysis = await analyzeProfile({
        userProfile,
        financialData,
        analysisType: 'comprehensive'
      });

      setAnalysisResult(analysis);

    } catch (error) {
      console.error('Error during profile analysis:', error);
      setAnalysisResult('Error: Failed to analyze profile. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handlePersonaChange = (persona: Persona) => {
    setUserProfile(prev => ({ ...prev, persona }));
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setUserProfile(prev => ({
      ...prev,
      [name]: name === 'age' ? (value === '' ? '' : parseInt(value, 10)) : value,
    }));
  };
  
  const handleSave = async () => {
    console.log('handleSave called with profile:', userProfile);
    try {
      console.log('Starting to save profile...');
      
      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      console.log('Current user:', user?.id);
      
      if (!user) {
        alert('You must be logged in to save your profile.');
        return;
      }
      
      // Save to database
      const success = await saveUserProfile(userProfile);
      console.log('saveUserProfile result:', success);
      
      if (success) {
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 3000);
        
        // Also update local state to ensure consistency
        setUserProfile(prev => ({ ...prev }));
        
        // Notify parent component to refresh profile data
        if (onProfileUpdate) {
          console.log('Calling onProfileUpdate...');
          await onProfileUpdate();
        }
        
        // Show success message
        console.log('Profile saved successfully to database');
        alert('Profile saved successfully!');
      } else {
        // Show error message
        console.error('Failed to save profile to database');
        alert('Failed to save profile. Please try again.');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Error saving profile. Please check your connection and try again.');
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setUserProfile(prev => ({ ...prev, avatarDataUrl: dataUrl }));
    };
    reader.readAsDataURL(file);
  };

  const localeOptions = useMemo(() => [
    'en-US','en-GB','en-IN','hi-IN','ar-SA','fr-FR','de-DE','es-ES','ja-JP','zh-CN'
  ], []);

  const currencyOptions = useMemo(() => [
    'INR'
  ], []);

  const countryOptions = useMemo(() => [
    'United States','India','United Kingdom','Germany','France','Spain','Japan','China','Canada','Australia'
  ], []);

  return (
    <div className="p-4 md:p-6 text-brand-text max-w-4xl mx-auto">
      <header className="mb-8 border-b-4 border-brand-text pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {onBack && (
              <button onClick={onBack} className="px-3 py-2 text-sm font-bold bg-white text-brand-text border-2 border-brand-text shadow-hard hover:bg-brand-accent" aria-label="Back to landing">Back</button>
            )}
            <h1 className="text-2xl md:text-3xl font-bold">Profile & Settings</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={refreshProfileData}
              className="px-3 py-2 text-sm font-bold bg-brand-accent hover:bg-amber-500 text-brand-text border-2 border-brand-text shadow-hard transition-all"
              title="Refresh profile data from database"
            >
              Refresh
            </button>
          </div>
        </div>
        <p className="text-brand-text/80 mt-1">Personalize your experience for tailored financial advice.</p>
      </header>

      {/* Account Information Section */}
      {user && (
        <div className="bg-white p-6 border-2 border-brand-text shadow-hard mb-6">
          <h2 className="text-xl font-bold mb-4">Login Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-1">Email Address</label>
              <input
                value={user.email || ''}
                disabled
                className="w-full bg-gray-100 border-2 border-gray-300 p-3 text-gray-600 cursor-not-allowed"
                placeholder="No email available"
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Account Type</label>
              <input
                value={user.app_metadata?.provider || 'Email'}
                disabled
                className="w-full bg-gray-100 border-2 border-gray-300 p-3 text-gray-600 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Account Created</label>
              <input
                value={user.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                }) : 'Unknown'}
                disabled
                className="w-full bg-gray-100 border-2 border-gray-300 p-3 text-gray-600 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Last Sign In</label>
              <input
                value={user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                }) : 'Never'}
                disabled
                className="w-full bg-gray-100 border-2 border-gray-300 p-3 text-gray-600 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Email Confirmed</label>
              <input
                value={user.email_confirmed_at ? 'Yes' : 'No'}
                disabled
                className={`w-full border-2 p-3 cursor-not-allowed font-bold ${
                  user.email_confirmed_at 
                    ? 'bg-green-100 border-green-300 text-green-700' 
                    : 'bg-red-100 border-red-300 text-red-700'
                }`}
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Session Duration</label>
              <input
                value={sessionDuration || 'Calculating...'}
                disabled
                className="w-full bg-gray-100 border-2 border-gray-300 p-3 text-gray-600 cursor-not-allowed"
              />
            </div>
          </div>
          
          {/* Account Actions */}
          <div className="mt-6 pt-4 border-t-2 border-brand-text">
            <h3 className="text-lg font-bold mb-3">Account Actions</h3>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={async () => {
                  try {
                    await supabase.auth.signOut();
                    // The App.tsx will handle the redirect
                  } catch (error) {
                    console.error('Error signing out:', error);
                  }
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold border-2 border-red-700 shadow-hard transition-all active:translate-x-1 active:translate-y-1 active:shadow-none"
              >
                Sign Out
              </button>
              <button
                onClick={async () => {
                  try {
                    await supabase.auth.resetPasswordForEmail(user.email || '', {
                      redirectTo: window.location.origin,
                    });
                    alert('Password reset email sent! Check your inbox.');
                  } catch (error) {
                    console.error('Error sending reset email:', error);
                    alert('Failed to send reset email. Please try again.');
                  }
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold border-2 border-blue-700 shadow-hard transition-all active:translate-x-1 active:translate-y-1 active:shadow-none"
              >
                Reset Password
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white p-6 border-2 border-brand-text shadow-hard">
        <h2 className="text-xl font-bold mb-4">Account Status</h2>
        <div className="text-center">
          <p className="text-brand-text/80 mb-4">
            Your account is active and ready to use. You can access all features including the chatbot, 
            currency converter, and financial tools.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-brand-bg p-4 border-2 border-brand-text">
              <div className="text-2xl mb-2">💬</div>
              <div className="font-bold">Chatbot</div>
              <div className="text-sm text-brand-text/70">AI-powered financial advice</div>
            </div>
            <div className="bg-brand-bg p-4 border-2 border-brand-text">
              <div className="text-2xl mb-2">💱</div>
              <div className="font-bold">Currency Converter</div>
              <div className="text-sm text-brand-text/70">Real-time exchange rates</div>
            </div>
            <div className="bg-brand-bg p-4 border-2 border-brand-text">
              <div className="text-2xl mb-2">📊</div>
              <div className="font-bold">Financial Tools</div>
              <div className="text-sm text-brand-text/70">Taxes, investments & more</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileScreen;