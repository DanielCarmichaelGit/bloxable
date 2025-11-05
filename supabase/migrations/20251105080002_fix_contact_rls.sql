-- Fix RLS policies for contact_submissions table
-- Allow anyone (anon) to insert contact form submissions

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can submit contact form" ON contact_submissions;
DROP POLICY IF EXISTS "Authenticated users can view contact submissions" ON contact_submissions;
DROP POLICY IF EXISTS "Authenticated users can update contact submissions" ON contact_submissions;

-- Policy: Allow anyone (including anonymous users) to insert contact submissions
CREATE POLICY "Anyone can submit contact form" ON contact_submissions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Policy: Only authenticated users can view contact submissions
CREATE POLICY "Authenticated users can view contact submissions" ON contact_submissions
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Only authenticated users can update contact submissions
CREATE POLICY "Authenticated users can update contact submissions" ON contact_submissions
  FOR UPDATE
  TO authenticated
  USING (true);

-- Ensure RLS is enabled
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions explicitly
GRANT INSERT ON contact_submissions TO anon, authenticated;
GRANT SELECT, UPDATE ON contact_submissions TO authenticated;

