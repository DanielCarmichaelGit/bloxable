-- Verify and fix RLS policies for contact_submissions table
-- This script checks current policies and ensures public insert is allowed

-- First, let's see what policies exist
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd, 
  qual, 
  with_check 
FROM pg_policies 
WHERE tablename = 'contact_submissions';

-- Drop ALL existing policies to start fresh
DROP POLICY IF EXISTS "Anyone can submit contact form" ON contact_submissions;
DROP POLICY IF EXISTS "Authenticated users can view contact submissions" ON contact_submissions;
DROP POLICY IF EXISTS "Authenticated users can update contact submissions" ON contact_submissions;

-- Ensure RLS is enabled
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- Create INSERT policy for anonymous users (most permissive)
-- This MUST use WITH CHECK (true) for INSERT operations
CREATE POLICY "Allow public insert" ON contact_submissions
  FOR INSERT
  TO anon, authenticated, public
  WITH CHECK (true);

-- Create SELECT policy for authenticated users only
CREATE POLICY "Authenticated users can view" ON contact_submissions
  FOR SELECT
  TO authenticated
  USING (true);

-- Create UPDATE policy for authenticated users only
CREATE POLICY "Authenticated users can update" ON contact_submissions
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Explicitly grant table permissions
GRANT INSERT ON contact_submissions TO anon;
GRANT INSERT ON contact_submissions TO authenticated;
GRANT SELECT ON contact_submissions TO authenticated;
GRANT UPDATE ON contact_submissions TO authenticated;

-- Verify the policies were created
SELECT 
  policyname, 
  cmd, 
  roles,
  with_check
FROM pg_policies 
WHERE tablename = 'contact_submissions'
ORDER BY cmd;

