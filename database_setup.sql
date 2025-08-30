-- Create profiles table for storing user profile data
-- Run this in your Supabase SQL editor

-- Enable Row Level Security (RLS)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  persona TEXT NOT NULL DEFAULT 'Student',
  age INTEGER,
  income TEXT,
  goals TEXT DEFAULT '',
  display_name TEXT DEFAULT '',
  avatar_data_url TEXT DEFAULT '',
  country TEXT DEFAULT '',
  currency TEXT DEFAULT '',
  locale TEXT DEFAULT '',
  risk_tolerance INTEGER DEFAULT 3 CHECK (risk_tolerance >= 1 AND risk_tolerance <= 5),
  time_horizon TEXT CHECK (time_horizon IN ('short', 'medium', 'long', '')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to read and update only their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own profile" ON profiles
  FOR DELETE USING (auth.uid() = user_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON profiles 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default profile for existing users (optional)
-- This will create a default profile for any existing authenticated users
INSERT INTO profiles (user_id, persona, age, income, goals, display_name, avatar_data_url, country, currency, locale, risk_tolerance, time_horizon)
SELECT 
  id as user_id,
  'Student' as persona,
  NULL as age,
  NULL as income,
  '' as goals,
  '' as display_name,
  '' as avatar_data_url,
  '' as country,
  '' as currency,
  '' as locale,
  3 as risk_tolerance,
  '' as time_horizon
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM profiles)
ON CONFLICT (user_id) DO NOTHING;
