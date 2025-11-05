-- FORCE FIX: Remove RLS entirely or create a policy that definitely works
-- This will fix the contact form RLS issue once and for all

-- First, let's see the current state
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'contact_submissions';

-- Option 1: Temporarily disable RLS to test
-- ALTER TABLE contact_submissions DISABLE ROW LEVEL SECURITY;

-- Option 2: Create a policy that definitely works (using service_role bypass)
-- Actually, let's create the simplest possible policy

-- Drop everything
DROP POLICY IF EXISTS "Allow public insert" ON contact_submissions;
DROP POLICY IF EXISTS "Anyone can submit contact form" ON contact_submissions;
DROP POLICY IF EXISTS "Authenticated users can view" ON contact_submissions;
DROP POLICY IF EXISTS "Authenticated users can update" ON contact_submissions;

-- Create the absolute simplest INSERT policy
CREATE POLICY "contact_submissions_insert_policy" 
ON contact_submissions 
FOR INSERT 
TO public 
WITH CHECK (true);

-- Create SELECT policy
CREATE POLICY "contact_submissions_select_policy" 
ON contact_submissions 
FOR SELECT 
TO authenticated 
USING (true);

-- Create UPDATE policy  
CREATE POLICY "contact_submissions_update_policy" 
ON contact_submissions 
FOR UPDATE 
TO authenticated 
USING (true)
WITH CHECK (true);

-- Ensure RLS is enabled
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- Grant permissions explicitly
GRANT ALL ON contact_submissions TO anon;
GRANT ALL ON contact_submissions TO authenticated;
GRANT ALL ON contact_submissions TO public;

-- Verify
SELECT policyname, cmd, roles, qual, with_check 
FROM pg_policies 
WHERE tablename = 'contact_submissions';

