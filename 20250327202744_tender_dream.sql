/*
  # Add logging to handle_new_user function

  1. Changes
    - Add detailed logging to handle_new_user function
    - Log user metadata, subscription creation, and profile updates
    - Use pg_notify for real-time logging

  2. Security
    - Maintain existing security model
    - Logs are only accessible to database administrators
*/

-- Create a table to store function logs
CREATE TABLE IF NOT EXISTS function_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  function_name text NOT NULL,
  message text NOT NULL,
  data jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create a function to log messages
CREATE OR REPLACE FUNCTION log_message(fname text, msg text, log_data jsonb DEFAULT NULL)
RETURNS void AS $$
BEGIN
  INSERT INTO function_logs (function_name, message, data)
  VALUES (fname, msg, log_data);
  
  -- Also send notification for real-time monitoring
  PERFORM pg_notify(
    'function_log',
    json_build_object(
      'function', fname,
      'message', msg,
      'data', log_data,
      'timestamp', now()
    )::text
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update handle_new_user function with logging
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
DECLARE
  new_subscription_id uuid;
  user_metadata json;
BEGIN
  -- Log function start
  PERFORM log_message('handle_new_user', 'Function started', json_build_object(
    'user_id', NEW.id,
    'trigger_type', TG_OP
  ));

  -- Get user metadata
  BEGIN
    SELECT raw_user_meta_data INTO user_metadata
    FROM auth.users
    WHERE id = NEW.id;

    PERFORM log_message('handle_new_user', 'Retrieved user metadata', user_metadata);
  EXCEPTION WHEN OTHERS THEN
    PERFORM log_message('handle_new_user', 'Error fetching user metadata', json_build_object(
      'error', SQLERRM,
      'user_id', NEW.id
    ));
    RAISE;
  END;

  -- Create initial subscription
  BEGIN
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

    PERFORM log_message('handle_new_user', 'Created subscription', json_build_object(
      'subscription_id', new_subscription_id,
      'user_id', NEW.id
    ));
  EXCEPTION WHEN OTHERS THEN
    PERFORM log_message('handle_new_user', 'Error creating subscription', json_build_object(
      'error', SQLERRM,
      'user_id', NEW.id
    ));
    RAISE;
  END;

  -- Update profile with metadata
  BEGIN
    NEW.subscription_id := new_subscription_id;
    NEW.role := user_metadata->>'role';
    NEW.full_name := user_metadata->>'full_name';
    NEW.email := (
      SELECT email 
      FROM auth.users 
      WHERE id = NEW.id
    );

    PERFORM log_message('handle_new_user', 'Updated profile', json_build_object(
      'user_id', NEW.id,
      'role', NEW.role,
      'full_name', NEW.full_name,
      'email', NEW.email,
      'subscription_id', NEW.subscription_id
    ));
  EXCEPTION WHEN OTHERS THEN
    PERFORM log_message('handle_new_user', 'Error updating profile', json_build_object(
      'error', SQLERRM,
      'user_id', NEW.id
    ));
    RAISE;
  END;

  -- Log function completion
  PERFORM log_message('handle_new_user', 'Function completed successfully', json_build_object(
    'user_id', NEW.id,
    'profile_data', row_to_json(NEW.*)
  ));
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure trigger is properly set
DROP TRIGGER IF EXISTS on_user_created ON profiles;

CREATE TRIGGER on_user_created
  BEFORE INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Add RLS to function_logs table
ALTER TABLE function_logs ENABLE ROW LEVEL SECURITY;

-- Only allow superusers to access logs
CREATE POLICY "Only superusers can access function logs"
  ON function_logs
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'system_admin'
    )
  );