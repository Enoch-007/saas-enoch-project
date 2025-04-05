/*
  # Add community tables and relationships

  1. New Tables
    - `masterclasses`
      - Stores masterclass information
    - `masterclass_registrations`
      - Tracks user registrations for masterclasses
    - `fireside_chats`
      - Stores fireside chat information
    - `fireside_chat_registrations`
      - Tracks user registrations for fireside chats
    - `discussions`
      - Stores community discussions
    - `discussion_replies`
      - Stores replies to discussions
    - `product_directory`
      - Stores educational product directory

  2. Security
    - Enable RLS on all tables
    - Add appropriate access policies
*/

-- Create masterclasses table
CREATE TABLE IF NOT EXISTS masterclasses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id uuid REFERENCES profiles(id),
  title text,
  description text,
  scheduled_for timestamptz,
  meeting_link text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  type text DEFAULT 'live',
  video_url text,
  max_seats integer
);

-- Create masterclass registrations table
CREATE TABLE IF NOT EXISTS masterclass_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  masterclass_id uuid REFERENCES masterclasses(id) ON DELETE CASCADE,
  profile_id uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now()
);

-- Create fireside chats table
CREATE TABLE IF NOT EXISTS fireside_chats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id uuid REFERENCES profiles(id),
  title text,
  description text,
  scheduled_for timestamptz,
  meeting_link text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  max_seats integer
);

-- Create fireside chat registrations table
CREATE TABLE IF NOT EXISTS fireside_chat_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fireside_chat_id uuid REFERENCES fireside_chats(id) ON DELETE CASCADE,
  profile_id uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now()
);

-- Create discussions table
CREATE TABLE IF NOT EXISTS discussions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  author_id uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create discussion replies table
CREATE TABLE IF NOT EXISTS discussion_replies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  discussion_id uuid REFERENCES discussions(id) ON DELETE CASCADE,
  author_id uuid REFERENCES profiles(id),
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create product directory table
CREATE TABLE IF NOT EXISTS product_directory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  website_url text,
  submitted_by uuid REFERENCES profiles(id),
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE masterclasses ENABLE ROW LEVEL SECURITY;
ALTER TABLE masterclass_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE fireside_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE fireside_chat_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE discussions ENABLE ROW LEVEL SECURITY;
ALTER TABLE discussion_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_directory ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for masterclasses
CREATE POLICY "Anyone can view masterclasses"
  ON masterclasses
  FOR SELECT
  TO authenticated
  USING (true);

-- Add RLS policies for masterclass registrations
CREATE POLICY "Users can view their registrations"
  ON masterclass_registrations
  FOR SELECT
  TO authenticated
  USING (profile_id = auth.uid());

CREATE POLICY "Users can register for masterclasses"
  ON masterclass_registrations
  FOR INSERT
  TO authenticated
  WITH CHECK (profile_id = auth.uid());

-- Add RLS policies for fireside chats
CREATE POLICY "Anyone can view fireside chats"
  ON fireside_chats
  FOR SELECT
  TO authenticated
  USING (true);

-- Add RLS policies for fireside chat registrations
CREATE POLICY "Users can view their chat registrations"
  ON fireside_chat_registrations
  FOR SELECT
  TO authenticated
  USING (profile_id = auth.uid());

CREATE POLICY "Users can register for chats"
  ON fireside_chat_registrations
  FOR INSERT
  TO authenticated
  WITH CHECK (profile_id = auth.uid());

-- Add RLS policies for discussions
CREATE POLICY "Anyone can view discussions"
  ON discussions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create discussions"
  ON discussions
  FOR INSERT
  TO authenticated
  WITH CHECK (author_id = auth.uid());

-- Add RLS policies for discussion replies
CREATE POLICY "Anyone can view replies"
  ON discussion_replies
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create replies"
  ON discussion_replies
  FOR INSERT
  TO authenticated
  WITH CHECK (author_id = auth.uid());

-- Add RLS policies for product directory
CREATE POLICY "Anyone can view approved products"
  ON product_directory
  FOR SELECT
  TO authenticated
  USING (status = 'approved');

CREATE POLICY "Users can submit products"
  ON product_directory
  FOR INSERT
  TO authenticated
  WITH CHECK (submitted_by = auth.uid());