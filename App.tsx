import React, { useEffect, useState } from 'react';
import { Persona, Screen, UserProfile } from './types';
import ChatScreen from './components/screens/ChatScreen';
import TaxesScreen from './components/screens/TaxesScreen';
import InvestmentsScreen from './components/screens/InvestmentsScreen';
import ProfileScreen from './components/screens/ProfileScreen';
import AuthScreen from './components/screens/AuthScreen';
import LandingScreen from './components/screens/LandingScreen';
import ImageToTextScreen from './components/screens/ImageToTextScreen';
import GraniteScreen from './components/screens/GraniteScreen';
import CurrencyConverterScreen from './components/screens/CurrencyConverterScreen';

import BottomNav from './components/BottomNav';
import { supabase } from './services/supabaseClient';
import { loadUserProfile, createProfileIfNotExists } from './services/supabaseData';

function App() {
  const [userProfile, setUserProfile] = useState<UserProfile>({
    persona: Persona.STUDENT,
    age: '',
    income: '',
    goals: '',
    displayName: '',
    avatarDataUrl: '',
    country: '',
    currency: '',
    locale: '',
    riskTolerance: 3,
    timeHorizon: '',
  });
  const [session, setSession] = useState<any>(null);
  const [activeScreen, setActiveScreen] = useState<Screen>(Screen.LANDING);

  // Load profile data from database
  const loadProfileData = async () => {
    try {
      console.log('Loading profile data from database...');
      
      // Ensure profile exists in database
      const profileCreated = await createProfileIfNotExists();
      if (profileCreated) {
        console.log('Profile created/verified in database');
      }
      
      // Load profile data
      const profileData = await loadUserProfile();
      if (profileData) {
        console.log('Profile data loaded successfully:', profileData);
        setUserProfile(profileData);
      } else {
        console.log('No profile data found, using defaults');
        // Set default profile if none exists
        setUserProfile({
          persona: Persona.STUDENT,
          age: '',
          income: '',
          goals: '',
          displayName: '',
          avatarDataUrl: '',
          country: '',
          currency: '',
          locale: '',
          riskTolerance: 3,
          timeHorizon: '',
        });
      }
    } catch (error) {
      console.error('Error loading profile data:', error);
      // Set default profile on error
      setUserProfile({
        persona: Persona.STUDENT,
        age: '',
        income: '',
        goals: '',
        displayName: '',
        avatarDataUrl: '',
        country: '',
        currency: '',
        locale: '',
        riskTolerance: 3,
        timeHorizon: '',
      });
    }
  };

  const renderScreen = () => {
    switch (activeScreen) {
      case Screen.CHAT:
        return <ChatScreen userProfile={userProfile} onBack={() => setActiveScreen(Screen.LANDING)} />;
      case Screen.TAXES:
        return <TaxesScreen onBack={() => setActiveScreen(Screen.LANDING)} />;
      case Screen.INVESTMENTS:
        return <InvestmentsScreen onBack={() => setActiveScreen(Screen.LANDING)} />;
      case Screen.PROFILE:
          return <ProfileScreen 
            userProfile={userProfile} 
            setUserProfile={setUserProfile} 
            onBack={() => setActiveScreen(Screen.LANDING)}
            onProfileUpdate={loadProfileData} // Pass function to refresh profile data
          />;
        case Screen.IMAGE_TO_TEXT:
          return <ImageToTextScreen onBack={() => setActiveScreen(Screen.LANDING)} />;
        case Screen.GRANITE:
          return <GraniteScreen onBack={() => setActiveScreen(Screen.LANDING)} />;
        case Screen.CURRENCY_CONVERTER:
          return <CurrencyConverterScreen onBack={() => setActiveScreen(Screen.LANDING)} />;
      case Screen.AUTH:
        return <AuthScreen onAuthSuccess={() => {}} onBack={() => setActiveScreen(Screen.LANDING)} />;
      case Screen.LANDING:
        return <LandingScreen onGetStarted={() => setActiveScreen(Screen.AUTH)} onLogin={() => setActiveScreen(Screen.AUTH)} />;
      default:
        return <ChatScreen userProfile={userProfile} onBack={() => setActiveScreen(Screen.LANDING)} />;
    }
  };

  // Sync screen with Supabase session
  useEffect(() => {
    let isMounted = true;
    
    const initializeAuth = async () => {
      try {
        console.log('Initializing auth...');
        
        // Check for OAuth redirect parameters
        const urlParams = new URLSearchParams(window.location.search);
        const hasAuthParams = urlParams.has('access_token') || urlParams.has('refresh_token') || urlParams.has('error');
        
        if (hasAuthParams) {
          console.log('OAuth redirect detected, processing...');
          // Clear URL parameters after processing
          window.history.replaceState({}, document.title, window.location.pathname);
        }
        
        const { data } = await supabase.auth.getSession();
        console.log('Initial session:', data.session ? 'Found' : 'None');
        
        if (!isMounted) return;
        setSession(data.session);
        
        if (data.session) {
          console.log('Setting active screen to CHAT');
          setActiveScreen(Screen.CHAT);
          
          // Load profile data when user is authenticated
          await loadProfileData();
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      }
    };

    initializeAuth();
    
    const { data: sub } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event, session ? 'User logged in' : 'User logged out');
      
      if (!isMounted) return;
      
      setSession(session);
      
      if (event === 'SIGNED_IN' && session) {
        console.log('User signed in, navigating to CHAT');
        setActiveScreen(Screen.CHAT);
        
        // Load profile data when user signs in
        await loadProfileData();
      } else if (event === 'TOKEN_REFRESHED' && session) {
        console.log('Token refreshed, ensuring user is on CHAT');
        setActiveScreen(Screen.CHAT);
        
        // Reload profile data on token refresh to ensure consistency
        await loadProfileData();
      } else if (event === 'SIGNED_OUT') {
        console.log('User signed out, navigating to LANDING');
        setActiveScreen(Screen.LANDING);
        
        // Reset profile data when user signs out
        setUserProfile({
          persona: Persona.STUDENT,
          age: '',
          income: '',
          goals: '',
          displayName: '',
          avatarDataUrl: '',
          country: '',
          currency: '',
          locale: '',
          riskTolerance: 3,
          timeHorizon: '',
        });
      } else if (event === 'TOKEN_REFRESHED' && session) {
        console.log('Token refreshed, ensuring user is on CHAT');
        setActiveScreen(Screen.CHAT);
      }
    });
    
    return () => {
      isMounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);



  return (
    <div className="bg-brand-bg text-brand-text flex flex-col h-screen font-mono">
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          {renderScreen()}
        </main>
      </div>
      {session && activeScreen !== Screen.AUTH && (
        <BottomNav activeScreen={activeScreen} onScreenSelect={setActiveScreen} />
      )}
    </div>
  );
}

export default App;