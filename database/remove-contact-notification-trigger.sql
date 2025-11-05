-- Remove notification trigger and function for contact submissions
-- This removes the email notification functionality

-- Drop the trigger first
DROP TRIGGER IF EXISTS contact_submission_notification ON contact_submissions;

-- Drop the function
DROP FUNCTION IF EXISTS notify_contact_submission();

