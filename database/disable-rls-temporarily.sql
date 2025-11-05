-- TEMPORARY FIX: Disable RLS to test if policies are the issue
-- This will allow inserts to work immediately

ALTER TABLE contact_submissions DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'contact_submissions';

-- Grant all permissions
GRANT ALL ON contact_submissions TO anon;
GRANT ALL ON contact_submissions TO authenticated;
GRANT ALL ON contact_submissions TO public;

