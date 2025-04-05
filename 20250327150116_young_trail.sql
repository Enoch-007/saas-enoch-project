/*
  # Fix profiles table schema and user creation

  1. Changes
    - Drop and recreate profiles table with all required columns
    - Update handle_new_user function
    - Add RLS policies if they don't exist

  2. Security
    - Enable RLS on profiles table
    - Add policies for profile access
*/

-- Drop existing trigger first
DROP TRIGGER IF EXISTS on_user_created ON profiles;

-- Recreate profiles table with all required columns
CREATE TABLE IF NOT EXISTS profiles (
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
BEGIN
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
  NEW.role := (
    SELECT raw_user_meta_data->>'role'
    FROM auth.users
    WHERE id = NEW.id
  );
  NEW.full_name := (
    SELECT raw_user_meta_data->>'full_name'
    FROM auth.users
    WHERE id = NEW.id
  );
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
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Add RLS policies if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' 
        AND policyname = 'Users can read their own profile'
    ) THEN
        CREATE POLICY "Users can read their own profile"
          ON profiles
          FOR SELECT
          TO authenticated
          USING (auth.uid() = id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' 
        AND policyname = 'Users can update their own profile'
    ) THEN
        CREATE POLICY "Users can update their own profile"
          ON profiles
          FOR UPDATE
          TO authenticated
          USING (auth.uid() = id)
          WITH CHECK (auth.uid() = id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' 
        AND policyname = 'Users can insert their own profile'
    ) THEN
        CREATE POLICY "Users can insert their own profile"
          ON profiles
          FOR INSERT
          TO authenticated
          WITH CHECK (auth.uid() = id);
    END IF;
END
$$;