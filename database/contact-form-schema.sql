-- Contact Form Submissions Schema
-- This schema stores contact form submissions from customers

-- Create contact_submissions table
CREATE TABLE IF NOT EXISTS contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company_name TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied', 'archived')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on email for quick lookups
CREATE INDEX IF NOT EXISTS idx_contact_submissions_email ON contact_submissions(email);
-- Create index on status for filtering
CREATE INDEX IF NOT EXISTS idx_contact_submissions_status ON contact_submissions(status);
-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at ON contact_submissions(created_at DESC);

-- Enable RLS (Row Level Security)
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anyone to insert contact submissions (for public contact form)
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

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_contact_submissions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_contact_submissions_updated_at
  BEFORE UPDATE ON contact_submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_contact_submissions_updated_at();

-- Note: Email notifications are not configured by default
-- If you want to add email notifications later, you can:
-- 1. Set up a database webhook to call an Edge Function
-- 2. Or use the pg_notify function to trigger external services

-- Grant necessary permissions
GRANT INSERT ON contact_submissions TO anon, authenticated;
GRANT SELECT, UPDATE ON contact_submissions TO authenticated;

-- Comments for documentation
COMMENT ON TABLE contact_submissions IS 'Stores contact form submissions from the website';
COMMENT ON COLUMN contact_submissions.status IS 'Status: new, read, replied, archived';
COMMENT ON COLUMN contact_submissions.email IS 'Customer email address for follow-up';

