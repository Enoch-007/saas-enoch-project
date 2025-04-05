/*
  # Fix profiles table schema

  1. Changes
    - Add missing columns for user profiles
    - Update profile trigger to handle role assignment
    - Add RLS policies for profile access

  2. New Columns
    - headline (text)
    - detailed_bio (text)
    - avatar_url (text)
    - mentor_experience (text[])
    - expertise_areas (text[])
    - languages_spoken (text[])
    - years_of_experience (integer)
    - session_rate (integer)
    - education (text[])
    - certifications (text[])
    - time_zone (text)
    - role (text)
*/

-- Add missing columns to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS headline text,
ADD COLUMN IF NOT EXISTS detailed_bio text,
ADD COLUMN IF NOT EXISTS avatar_url text,
ADD COLUMN IF NOT EXISTS mentor_experience text[],
ADD COLUMN IF NOT EXISTS expertise_areas text[],
ADD COLUMN IF NOT EXISTS languages_spoken text[],
ADD COLUMN IF NOT EXISTS years_of_experience integer,
ADD COLUMN IF NOT EXISTS session_rate integer,
ADD COLUMN IF NOT EXISTS education text[],
ADD COLUMN IF NOT EXISTS certifications text[],
ADD COLUMN IF NOT EXISTS time_zone text,
ADD COLUMN IF NOT EXISTS role text;

-- Update handle_new_user function to include role
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Set role from auth.users metadata
  NEW.role := (
    SELECT raw_user_meta_data->>'role'
    FROM auth.users
    WHERE id = NEW.id
  );

  -- Create initial subscription for Hall Pass (free tier)
  INSERT INTO subscriptions (profile_id, tier_id, status)
  VALUES (
    NEW.id,
    (SELECT id FROM subscription_tiers WHERE name = 'Hall Pass'),
    'active'
  )
  RETURNING id INTO NEW.subscription_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for profiles
CREATE POLICY "Users can read their own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create mentor_calendars table if it doesn't exist
CREATE TABLE IF NOT EXISTS mentor_calendars (
  mentor_id uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  cal_username text,
  meeting_platform text DEFAULT 'zoom',
  meeting_link text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE mentor_calendars ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Mentors can manage their calendar"
  ON mentor_calendars
  FOR ALL
  TO authenticated
  USING (auth.uid() = mentor_id);

CREATE POLICY "Anyone can view mentor calendars"
  ON mentor_calendars
  FOR SELECT
  TO authenticated
  USING (true);