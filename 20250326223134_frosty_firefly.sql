/*
  # Create subscription and organization tables

  1. New Tables
    - `subscription_tiers`
      - Stores available subscription plans
    - `subscriptions`
      - Tracks user subscriptions
    - `organizations`
      - Stores organization information
    - `organization_members`
      - Links users to organizations

  2. Changes
    - Add subscription_id to profiles table
    - Add organization_id to profiles table
    
  3. Security
    - Enable RLS on all new tables
    - Add policies for authenticated users
*/

-- Create subscription_tiers table
CREATE TABLE IF NOT EXISTS subscription_tiers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price numeric NOT NULL,
  credits integer NOT NULL,
  features jsonb NOT NULL,
  stripe_price_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE subscription_tiers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view subscription tiers"
  ON subscription_tiers
  FOR SELECT
  TO public
  USING (true);

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  tier_id uuid REFERENCES subscription_tiers(id),
  status text NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'incomplete')),
  stripe_subscription_id text,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at timestamptz,
  canceled_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own subscriptions"
  ON subscriptions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = profile_id);

-- Create organizations table
CREATE TABLE IF NOT EXISTS organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  subscription_id uuid REFERENCES subscriptions(id),
  stripe_customer_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Organization members can view their organizations"
  ON organizations
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_id = organizations.id
      AND profile_id = auth.uid()
    )
  );

-- Create organization_members table
CREATE TABLE IF NOT EXISTS organization_members (
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('admin', 'member')),
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (organization_id, profile_id)
);

ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Organization admins can manage members"
  ON organization_members
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_id = organization_members.organization_id
      AND profile_id = auth.uid()
      AND role = 'admin'
    )
  );

CREATE POLICY "Users can view their own memberships"
  ON organization_members
  FOR SELECT
  TO authenticated
  USING (profile_id = auth.uid());

-- Add subscription and organization references to profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS subscription_id uuid REFERENCES subscriptions(id),
ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES organizations(id);

-- Insert default subscription tiers
INSERT INTO subscription_tiers (name, description, price, credits, features, stripe_price_id) VALUES
('Hall Pass', 'Free tier with limited access', 0, 1, '{"features": ["1 Hr of 1:1 mentoring", "Access to Coffee Talk", "Full access to all mentors"]}', NULL),
('Study Hall', 'Individual premium access', 499, 6, '{"features": ["6+ Hrs of 1:1 mentoring", "Access to Coffee Talk", "Access to Fireside Chats", "Live and On-demand masterclasses", "Access to Resource Vault", "Access to Product Directory"]}', 'price_study_hall'),
('Honor Roll', 'Organization-wide access', 1399, 20, '{"features": ["20+ Hrs of 1:1 mentoring", "Team-wide access", "Dedicated success manager", "Priority support", "Analytics and reporting"]}', 'price_honor_roll');

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
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

-- Create trigger for new user registration
DROP TRIGGER IF EXISTS on_user_created ON profiles;
CREATE TRIGGER on_user_created
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();