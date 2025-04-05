/*
  # Update mentor calendar schema

  1. Changes
    - Add calendar_30min and calendar_60min fields to mentor_calendars
    - Add meeting_password field to mentor_calendars
    - Remove old cal_username field

  2. Security
    - Maintain existing RLS policies
*/

-- Update mentor_calendars table
ALTER TABLE mentor_calendars
  -- Add new calendar fields
  ADD COLUMN calendar_30min text,
  ADD COLUMN calendar_60min text,
  ADD COLUMN meeting_password text,
  -- Drop old field
  DROP COLUMN cal_username;