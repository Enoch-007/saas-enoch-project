/*
  # Debug queries for user creation process
  
  These queries will help trace the user creation process through the logs
*/

-- Get all logs for a specific user creation attempt, ordered chronologically
CREATE OR REPLACE FUNCTION debug_user_creation(user_id uuid)
RETURNS TABLE (
  log_time timestamptz,
  log_step text,
  log_details jsonb,
  log_error text
) AS $$
BEGIN
  RETURN QUERY
  WITH log_entries AS (
    SELECT
      created_at,
      message as step,
      data,
      CASE 
        WHEN data->>'error' IS NOT NULL THEN data->>'error'
        ELSE NULL
      END as error_message
    FROM function_logs
    WHERE 
      function_name = 'handle_new_user'
      AND (data->>'user_id')::uuid = user_id
    ORDER BY created_at ASC
  )
  SELECT 
    created_at as log_time,
    step as log_step,
    data as log_details,
    error_message as log_error
  FROM log_entries;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get the most recent failed user creation attempts
CREATE OR REPLACE FUNCTION get_recent_failures()
RETURNS TABLE (
  user_id uuid,
  failure_time timestamptz,
  error_message text,
  metadata jsonb
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (data->>'user_id')::uuid,
    created_at,
    data->>'error',
    data
  FROM function_logs
  WHERE 
    function_name = 'handle_new_user'
    AND data->>'error' IS NOT NULL
  ORDER BY created_at DESC
  LIMIT 10;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Example usage:
-- SELECT * FROM debug_user_creation('user-id-here');
-- SELECT * FROM get_recent_failures();