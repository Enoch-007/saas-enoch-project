/*
  # Create mentor search view and supporting tables

  1. New Tables
    - `mentor_reviews`
      - Stores mentor ratings and reviews
    - `sessions`
      - Tracks mentoring sessions

  2. New Views
    - `mentor_search`
      - Combines profile data with ratings and session counts
      - Used for searching and filtering mentors

  3. Security
    - Enable RLS on all tables
    - Add appropriate access policies
*/

-- Create mentor reviews table first
CREATE TABLE IF NOT EXISTS mentor_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id uuid REFERENCES profiles(id) NOT NULL,
  reviewer_id uuid REFERENCES profiles(id) NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text text,
  created_at timestamptz DEFAULT now()
);

-- Create sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id uuid REFERENCES profiles(id) NOT NULL,
  mentee_id uuid REFERENCES profiles(id) NOT NULL,
  duration_minutes integer,
  credits_amount integer,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'scheduled', 'completed', 'cancelled')),
  created_at timestamptz DEFAULT now(),
  scheduled_for timestamptz
);

-- Enable RLS on tables
ALTER TABLE mentor_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for mentor reviews
CREATE POLICY "Anyone can view mentor reviews"
  ON mentor_reviews
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create reviews"
  ON mentor_reviews
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = reviewer_id);

CREATE POLICY "Users can update their own reviews"
  ON mentor_reviews
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = reviewer_id);

-- Add RLS policies for sessions
CREATE POLICY "Users can view their own sessions"
  ON sessions
  FOR SELECT
  TO authenticated
  USING (auth.uid() IN (mentor_id, mentee_id));

CREATE POLICY "Users can create sessions"
  ON sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = mentee_id);

CREATE POLICY "Users can update their own sessions"
  ON sessions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() IN (mentor_id, mentee_id));

-- Create a function to get mentor stats
CREATE OR REPLACE FUNCTION get_mentor_stats(mentor_id uuid)
RETURNS TABLE (
  average_rating numeric,
  total_reviews bigint,
  completed_sessions bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(AVG(mr.rating)::numeric(2,1), 0) as average_rating,
    COALESCE(COUNT(DISTINCT mr.id), 0) as total_reviews,
    COALESCE(COUNT(DISTINCT CASE WHEN s.status = 'completed' THEN s.id END), 0) as completed_sessions
  FROM profiles p
  LEFT JOIN mentor_reviews mr ON mr.mentor_id = p.id
  LEFT JOIN sessions s ON s.mentor_id = p.id
  WHERE p.id = mentor_id
  GROUP BY p.id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the mentor search view using the function
CREATE OR REPLACE VIEW mentor_search AS
SELECT
  p.id,
  p.full_name,
  p.headline,
  p.avatar_url,
  p.expertise_areas,
  p.mentor_experience,
  p.languages_spoken,
  p.years_of_experience,
  p.session_rate,
  p.time_zone,
  stats.average_rating,
  stats.total_reviews,
  stats.completed_sessions
FROM profiles p
CROSS JOIN LATERAL get_mentor_stats(p.id) stats
WHERE p.role = 'mentor';

-- Grant access to the view
GRANT SELECT ON mentor_search TO authenticated;