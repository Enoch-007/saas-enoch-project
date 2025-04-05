/*
  # Add foreign key relationship between vault_resources and profiles

  1. Changes
    - Add foreign key constraint from vault_resources.uploaded_by to profiles.id
    - Enable RLS on vault_resources table
    - Add policies for resource access

  2. Security
    - Enable RLS
    - Add policies for authenticated users
*/

-- Add foreign key constraint
ALTER TABLE vault_resources
ADD CONSTRAINT vault_resources_uploaded_by_fkey
FOREIGN KEY (uploaded_by) REFERENCES profiles(id);

-- Enable RLS
ALTER TABLE vault_resources ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
CREATE POLICY "Anyone can view resources"
  ON vault_resources
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can upload resources"
  ON vault_resources
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = uploaded_by);

CREATE POLICY "Users can update their own resources"
  ON vault_resources
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = uploaded_by)
  WITH CHECK (auth.uid() = uploaded_by);

CREATE POLICY "Users can delete their own resources"
  ON vault_resources
  FOR DELETE
  TO authenticated
  USING (auth.uid() = uploaded_by);