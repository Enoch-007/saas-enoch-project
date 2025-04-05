/*
  # Fix profiles table schema and user creation

  1. Changes
    - Drop and recreate profiles table with correct schema
    - Update handle_new_user function to properly handle metadata
    - Add missing RLS policies

  2. Security
    - Enable RLS on profiles table
    - Add policies for profile access
*/

-- Drop existing trigger first
DROP TRIGGER IF EXISTS on_user_created ON profiles;

-- Drop and recreate profiles table
DROP TABLE IF EXISTS profiles CASCADE;

CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email text,
  full_name text,
  avatar_url text,
  role text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  subscription_id uuid REFERENCES subscriptions(id),
  organization_id uuid REFERENCES organizations(id),
  headline text,
  detailed_bio text,
  mentor_experience text[],
  expertise_areas text[],
  languages_spoken text[],
  years_of_experience integer,
  session_rate integer,
  education text[],
  certifications text[],
  time_zone text,
  interests text[],
  goals text,
  role_title text,
  years_experience integer,
  school_type text,
  challenges text
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Update handle_new_user function
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
DECLARE
  new_subscription_id uuid;
  user_metadata json;
BEGIN
  -- Get user metadata
  SELECT raw_user_meta_data INTO user_metadata
  FROM auth.users
  WHERE id = NEW.id;

  -- Create initial subscription for Hall Pass (free tier)
  INSERT INTO subscriptions (
    profile_id,
    tier_id,
    status
  )
  VALUES (
    NEW.id,
    (SELECT id FROM subscription_tiers WHERE name = 'Hall Pass'),
    'active'
  )
  RETURNING id INTO new_subscription_id;

  -- Update profile with subscription and metadata
  NEW.subscription_id := new_subscription_id;
  NEW.role := user_metadata->>'role';
  NEW.full_name := user_metadata->>'full_name';
  NEW.email := (
    SELECT email 
    FROM auth.users 
    WHERE id = NEW.id
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger
CREATE TRIGGER on_user_created
  BEFORE INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Add RLS policies
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

CREATE POLICY "Users can insert their own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);