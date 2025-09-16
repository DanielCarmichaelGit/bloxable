-- Marketplace Items Table Schema
-- This table stores all marketplace items/workflows that sellers can create and buyers can purchase

-- Create the marketplace_items table
CREATE TABLE IF NOT EXISTS marketplace_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Basic item information
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  
  -- Pricing information
  price DECIMAL(10,2) DEFAULT 0.00, -- 0.00 for free items
  is_free BOOLEAN GENERATED ALWAYS AS (price = 0.00) STORED,
  billing_period TEXT CHECK (billing_period IN ('one_time', 'monthly', 'yearly', 'lifetime')) DEFAULT 'one_time',
  
  -- Source code information (for future implementation)
  source_code_price DECIMAL(10,2) DEFAULT NULL, -- Optional additional price for source code
  source_code_format TEXT CHECK (source_code_format IN ('json', 'provided_in_chat', 'url')) DEFAULT NULL,
  source_code_url TEXT DEFAULT NULL, -- URL to source code if format is 'url'
  
  -- Item metadata
  rating DECIMAL(3,2) DEFAULT 0.00 CHECK (rating >= 0.00 AND rating <= 5.00),
  setup_time TEXT DEFAULT NULL, -- e.g., "30min", "1hr", "2hr"
  tags TEXT[] DEFAULT '{}', -- Array of tags for categorization
  demo_link TEXT DEFAULT NULL, -- Optional demo URL
  
  -- Stripe integration fields (for future implementation)
  stripe_product_id TEXT DEFAULT NULL, -- Stripe product ID
  stripe_price_id TEXT DEFAULT NULL, -- Stripe price ID
  stripe_customer_id TEXT DEFAULT NULL, -- Stripe customer ID for seller
  
  -- Status and visibility
  status TEXT CHECK (status IN ('draft', 'pending_review', 'active', 'inactive', 'rejected')) DEFAULT 'draft',
  is_public BOOLEAN DEFAULT FALSE, -- Whether item is visible to public
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  
  -- Additional metadata for future extensibility
  metadata JSONB DEFAULT '{}',
  
  -- Constraints
  CONSTRAINT valid_price CHECK (price >= 0.00),
  CONSTRAINT valid_source_code_price CHECK (source_code_price IS NULL OR source_code_price >= 0.00),
  CONSTRAINT valid_rating CHECK (rating >= 0.00 AND rating <= 5.00)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_marketplace_items_seller_id ON marketplace_items(seller_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_items_status ON marketplace_items(status);
CREATE INDEX IF NOT EXISTS idx_marketplace_items_is_public ON marketplace_items(is_public);
CREATE INDEX IF NOT EXISTS idx_marketplace_items_price ON marketplace_items(price);
CREATE INDEX IF NOT EXISTS idx_marketplace_items_rating ON marketplace_items(rating);
CREATE INDEX IF NOT EXISTS idx_marketplace_items_tags ON marketplace_items USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_marketplace_items_created_at ON marketplace_items(created_at);
CREATE INDEX IF NOT EXISTS idx_marketplace_items_published_at ON marketplace_items(published_at);

-- Create composite index for public active items (most common query)
CREATE INDEX IF NOT EXISTS idx_marketplace_items_public_active ON marketplace_items(is_public, status) 
  WHERE is_public = TRUE AND status = 'active';

-- Enable Row Level Security (RLS)
ALTER TABLE marketplace_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DO $$
BEGIN
  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "Public can view active items" ON marketplace_items;
  DROP POLICY IF EXISTS "Sellers can view their own items" ON marketplace_items;
  DROP POLICY IF EXISTS "Sellers can insert their own items" ON marketplace_items;
  DROP POLICY IF EXISTS "Sellers can update their own items" ON marketplace_items;
  DROP POLICY IF EXISTS "Sellers can delete their own items" ON marketplace_items;
  
  -- Public can view active, public items
  CREATE POLICY "Public can view active items" ON marketplace_items
    FOR SELECT USING (is_public = TRUE AND status = 'active');
  
  -- Sellers can view their own items (regardless of status)
  CREATE POLICY "Sellers can view their own items" ON marketplace_items
    FOR SELECT USING (auth.uid() = seller_id);
  
  -- Sellers can insert their own items
  CREATE POLICY "Sellers can insert their own items" ON marketplace_items
    FOR INSERT WITH CHECK (auth.uid() = seller_id);
  
  -- Sellers can update their own items
  CREATE POLICY "Sellers can update their own items" ON marketplace_items
    FOR UPDATE USING (auth.uid() = seller_id);
  
  -- Sellers can delete their own items
  CREATE POLICY "Sellers can delete their own items" ON marketplace_items
    FOR DELETE USING (auth.uid() = seller_id);
END $$;

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_marketplace_items_updated_at ON marketplace_items;
CREATE TRIGGER update_marketplace_items_updated_at
  BEFORE UPDATE ON marketplace_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to publish an item (set status to active and is_public to true)
CREATE OR REPLACE FUNCTION publish_marketplace_item(item_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  item_seller_id UUID;
BEGIN
  -- Get the seller_id for the item
  SELECT seller_id INTO item_seller_id
  FROM marketplace_items
  WHERE id = item_id;
  
  -- Check if item exists and user owns it
  IF item_seller_id IS NULL OR item_seller_id != auth.uid() THEN
    RETURN FALSE;
  END IF;
  
  -- Update the item to published status
  UPDATE marketplace_items
  SET 
    status = 'active',
    is_public = TRUE,
    published_at = NOW(),
    updated_at = NOW()
  WHERE id = item_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to unpublish an item
CREATE OR REPLACE FUNCTION unpublish_marketplace_item(item_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  item_seller_id UUID;
BEGIN
  -- Get the seller_id for the item
  SELECT seller_id INTO item_seller_id
  FROM marketplace_items
  WHERE id = item_id;
  
  -- Check if item exists and user owns it
  IF item_seller_id IS NULL OR item_seller_id != auth.uid() THEN
    RETURN FALSE;
  END IF;
  
  -- Update the item to inactive status
  UPDATE marketplace_items
  SET 
    status = 'inactive',
    is_public = FALSE,
    updated_at = NOW()
  WHERE id = item_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON marketplace_items TO authenticated;
GRANT EXECUTE ON FUNCTION publish_marketplace_item(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION unpublish_marketplace_item(UUID) TO authenticated;

-- Grant public read access to active items
GRANT SELECT ON marketplace_items TO anon;
