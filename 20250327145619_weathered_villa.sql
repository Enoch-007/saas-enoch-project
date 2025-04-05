/*
  # Add onboarding fields to profiles and organizations

  1. Changes
    - Add onboarding fields to profiles table for individual users
    - Add onboarding fields to organizations table
    - Add RLS policies for new fields

  2. New Columns (profiles)
    - interests (text[])
    - goals (text)
    - role_title (text) - Current role/position
    - years_experience (integer)
    - school_type (text)
    - challenges (text)

  3. New Columns (organizations)
    - org_type (text)
    - location (text)
    - team_size (text)
    - leadership_roles (text[])
    - development_areas (text[])
    - goals (text)
    - timeline (text)
    - additional_info (text)
*/

-- Add onboarding fields to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS interests text[],
ADD COLUMN IF NOT EXISTS goals text,
ADD COLUMN IF NOT EXISTS role_title text,
ADD COLUMN IF NOT EXISTS years_experience integer,
ADD COLUMN IF NOT EXISTS school_type text,
ADD COLUMN IF NOT EXISTS challenges text;

-- Add onboarding fields to organizations table
ALTER TABLE organizations
ADD COLUMN IF NOT EXISTS org_type text,
ADD COLUMN IF NOT EXISTS location text,
ADD COLUMN IF NOT EXISTS team_size text,
ADD COLUMN IF NOT EXISTS leadership_roles text[],
ADD COLUMN IF NOT EXISTS development_areas text[],
ADD COLUMN IF NOT EXISTS goals text,
ADD COLUMN IF NOT EXISTS timeline text,
ADD COLUMN IF NOT EXISTS additional_info text;

-- Update RLS policies for profiles
CREATE POLICY "Users can update their own onboarding fields"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Update RLS policies for organizations
CREATE POLICY "Organization owners can update onboarding fields"
  ON organizations
  FOR UPDATE
  TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());