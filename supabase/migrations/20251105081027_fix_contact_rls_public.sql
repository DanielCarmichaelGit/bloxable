-- Fix RLS policies using PUBLIC role (Supabase uses PUBLIC instead of anon)
-- This is the correct way to allow anonymous/public inserts

-- Drop ALL existing policies
DROP POLICY IF EXISTS "Allow public insert" ON contact_submissions;
DROP POLICY IF EXISTS "Anyone can submit contact form" ON contact_submissions;
DROP POLICY IF EXISTS "Authenticated users can view" ON contact_submissions;
DROP POLICY IF EXISTS "Authenticated users can update" ON contact_submissions;
DROP POLICY IF EXISTS "Authenticated users can view contact submissions" ON contact_submissions;
DROP POLICY IF EXISTS "Authenticated users can update contact submissions" ON contact_submissions;

-- Ensure RLS is enabled
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- Create INSERT policy for PUBLIC (includes anonymous users)
-- This is the key fix - PUBLIC role includes both authenticated and anonymous users
CREATE POLICY "Allow public insert" ON contact_submissions
  FOR INSERT
  TO PUBLIC
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

-- Explicitly grant permissions (PUBLIC includes anon)
GRANT INSERT ON contact_submissions TO PUBLIC;
GRANT SELECT ON contact_submissions TO authenticated;
GRANT UPDATE ON contact_submissions TO authenticated;

