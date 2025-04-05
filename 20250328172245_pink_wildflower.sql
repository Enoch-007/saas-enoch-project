/*
  # Add resource requests functionality

  1. New Tables
    - `resource_requests`
      - Stores user requests for resources
    - `resource_responses`
      - Links vault resources to requests

  2. Security
    - Enable RLS on new tables
    - Add policies for authenticated users
*/

-- Create resource requests table
CREATE TABLE resource_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  requested_by uuid REFERENCES profiles(id) NOT NULL,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'fulfilled', 'closed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create resource responses table
CREATE TABLE resource_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid REFERENCES resource_requests(id) ON DELETE CASCADE NOT NULL,
  resource_id uuid REFERENCES vault_resources(id) ON DELETE CASCADE,
  responder_id uuid REFERENCES profiles(id) NOT NULL,
  comment text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE resource_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_responses ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for resource requests
CREATE POLICY "Anyone can view resource requests"
  ON resource_requests
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create resource requests"
  ON resource_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = requested_by);

CREATE POLICY "Users can update their own requests"
  ON resource_requests
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = requested_by);

-- Add RLS policies for resource responses
CREATE POLICY "Anyone can view resource responses"
  ON resource_responses
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create resource responses"
  ON resource_responses
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = responder_id);

CREATE POLICY "Users can update their own responses"
  ON resource_responses
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = responder_id);