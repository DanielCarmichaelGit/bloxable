-- Add phone number column to contact_submissions table

ALTER TABLE contact_submissions 
ADD COLUMN IF NOT EXISTS phone TEXT NOT NULL DEFAULT '';

-- Update the default to allow existing rows (then remove default)
ALTER TABLE contact_submissions 
ALTER COLUMN phone DROP DEFAULT;

-- Add index for phone lookups
CREATE INDEX IF NOT EXISTS idx_contact_submissions_phone ON contact_submissions(phone);

-- Update comments
COMMENT ON COLUMN contact_submissions.phone IS 'Customer phone number with country code';

