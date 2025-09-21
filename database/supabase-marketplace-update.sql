-- Update marketplace_items table to support new UI features
-- This migration adds support for usage-based pricing, webhooks, and other new features

-- Add new columns for usage-based pricing
ALTER TABLE marketplace_items 
ADD COLUMN IF NOT EXISTS usage_pricing_type text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS usage_tiers jsonb DEFAULT NULL,
ADD COLUMN IF NOT EXISTS flat_usage_price numeric DEFAULT NULL,
ADD COLUMN IF NOT EXISTS usage_test_completed boolean DEFAULT false;

-- Add webhook and installation URL support
ALTER TABLE marketplace_items 
ADD COLUMN IF NOT EXISTS webhook_url text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS installation_url text DEFAULT NULL;

-- Update source code columns (rename existing ones to match our UI)
ALTER TABLE marketplace_items 
RENAME COLUMN source_code_r TO source_code_price;

ALTER TABLE marketplace_items 
RENAME COLUMN source_code_f TO source_code_format;

ALTER TABLE marketplace_items 
RENAME COLUMN source_code_l TO source_code_url;

-- Add constraints for usage pricing
ALTER TABLE marketplace_items 
ADD CONSTRAINT check_usage_pricing_type 
CHECK (usage_pricing_type IS NULL OR usage_pricing_type IN ('flat_rate', 'tiered'));

ALTER TABLE marketplace_items 
ADD CONSTRAINT check_source_code_format 
CHECK (source_code_format IS NULL OR source_code_format IN ('json', 'provided_in_chat', 'url'));

-- Add constraint for billing period to include usage_based
ALTER TABLE marketplace_items 
DROP CONSTRAINT IF EXISTS check_billing_period;

ALTER TABLE marketplace_items 
ADD CONSTRAINT check_billing_period 
CHECK (billing_period IN ('one_time', 'monthly', 'yearly', 'lifetime', 'usage_based'));

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_marketplace_items_seller_id ON marketplace_items(seller_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_items_status ON marketplace_items(status);
CREATE INDEX IF NOT EXISTS idx_marketplace_items_is_public ON marketplace_items(is_public);
CREATE INDEX IF NOT EXISTS idx_marketplace_items_created_at ON marketplace_items(created_at);

-- Create RLS (Row Level Security) policies
-- Enable RLS on the table
ALTER TABLE marketplace_items ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read public items
CREATE POLICY "Public items are viewable by everyone" ON marketplace_items
FOR SELECT USING (is_public = true);

-- Policy: Sellers can read their own items (public or private)
CREATE POLICY "Sellers can view their own items" ON marketplace_items
FOR SELECT USING (auth.uid() = seller_id);

-- Policy: Only item owners can update their items
CREATE POLICY "Sellers can update their own items" ON marketplace_items
FOR UPDATE USING (auth.uid() = seller_id);

-- Policy: Only item owners can delete their items
CREATE POLICY "Sellers can delete their own items" ON marketplace_items
FOR DELETE USING (auth.uid() = seller_id);

-- Policy: Only authenticated users can insert items
CREATE POLICY "Authenticated users can create items" ON marketplace_items
FOR INSERT WITH CHECK (auth.uid() = seller_id);

-- Create a function to automatically set seller_id on insert
CREATE OR REPLACE FUNCTION set_seller_id()
RETURNS TRIGGER AS $$
BEGIN
  NEW.seller_id = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically set seller_id
DROP TRIGGER IF EXISTS set_seller_id_trigger ON marketplace_items;
CREATE TRIGGER set_seller_id_trigger
  BEFORE INSERT ON marketplace_items
  FOR EACH ROW
  EXECUTE FUNCTION set_seller_id();

-- Create a function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_marketplace_items_updated_at ON marketplace_items;
CREATE TRIGGER update_marketplace_items_updated_at
  BEFORE UPDATE ON marketplace_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comments to document the new columns
COMMENT ON COLUMN marketplace_items.usage_pricing_type IS 'Type of usage-based pricing: flat_rate or tiered';
COMMENT ON COLUMN marketplace_items.usage_tiers IS 'JSON array of usage tiers for tiered pricing';
COMMENT ON COLUMN marketplace_items.flat_usage_price IS 'Price per execution for flat rate usage pricing';
COMMENT ON COLUMN marketplace_items.usage_test_completed IS 'Whether usage test has been completed for usage-based pricing';
COMMENT ON COLUMN marketplace_items.webhook_url IS 'Webhook URL for self-service items';
COMMENT ON COLUMN marketplace_items.installation_url IS 'Installation URL for self-service items';
COMMENT ON COLUMN marketplace_items.source_code_price IS 'Additional price for source code access';
COMMENT ON COLUMN marketplace_items.source_code_format IS 'Format of source code: json, provided_in_chat, or url';
COMMENT ON COLUMN marketplace_items.source_code_url IS 'URL to source code when format is url';

-- Update existing data to have proper defaults
UPDATE marketplace_items 
SET 
  usage_pricing_type = NULL,
  usage_tiers = NULL,
  flat_usage_price = NULL,
  usage_test_completed = false,
  webhook_url = NULL,
  installation_url = NULL
WHERE 
  usage_pricing_type IS NULL 
  OR usage_tiers IS NULL 
  OR flat_usage_price IS NULL 
  OR usage_test_completed IS NULL 
  OR webhook_url IS NULL 
  OR installation_url IS NULL;
