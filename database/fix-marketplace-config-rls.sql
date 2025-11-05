-- Fix RLS policies for marketplace_item_configs table
-- The current policies are too restrictive and don't account for the relationship with marketplace_items

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own marketplace item configs" ON marketplace_item_configs;
DROP POLICY IF EXISTS "Users can insert their own marketplace item configs" ON marketplace_item_configs;
DROP POLICY IF EXISTS "Users can update their own marketplace item configs" ON marketplace_item_configs;
DROP POLICY IF EXISTS "Users can delete their own marketplace item configs" ON marketplace_item_configs;

-- Create new RLS policies that check ownership through marketplace_items table
-- Users can view configs for items they own
CREATE POLICY "Users can view configs for their own items"
  ON marketplace_item_configs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM marketplace_items 
      WHERE marketplace_items.id = marketplace_item_configs.marketplace_item_id 
      AND marketplace_items.seller_id = auth.uid()
    )
  );

-- Users can insert configs for items they own
CREATE POLICY "Users can insert configs for their own items"
  ON marketplace_item_configs
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM marketplace_items 
      WHERE marketplace_items.id = marketplace_item_configs.marketplace_item_id 
      AND marketplace_items.seller_id = auth.uid()
    )
  );

-- Users can update configs for items they own
CREATE POLICY "Users can update configs for their own items"
  ON marketplace_item_configs
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM marketplace_items 
      WHERE marketplace_items.id = marketplace_item_configs.marketplace_item_id 
      AND marketplace_items.seller_id = auth.uid()
    )
  );

-- Users can delete configs for items they own
CREATE POLICY "Users can delete configs for their own items"
  ON marketplace_item_configs
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM marketplace_items 
      WHERE marketplace_items.id = marketplace_item_configs.marketplace_item_id 
      AND marketplace_items.seller_id = auth.uid()
    )
  );

-- Create a function to automatically set created_by on insert
CREATE OR REPLACE FUNCTION set_marketplace_config_created_by()
RETURNS TRIGGER AS $$
BEGIN
  -- Set created_by to the current user
  NEW.created_by = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically set created_by
DROP TRIGGER IF EXISTS set_marketplace_config_created_by_trigger ON marketplace_item_configs;
CREATE TRIGGER set_marketplace_config_created_by_trigger
  BEFORE INSERT ON marketplace_item_configs
  FOR EACH ROW
  EXECUTE FUNCTION set_marketplace_config_created_by();

-- Also create a function to handle upsert operations properly
CREATE OR REPLACE FUNCTION upsert_marketplace_item_config(
  p_marketplace_item_id UUID,
  p_platform platform_type DEFAULT 'n8n',
  p_trigger_type trigger_type DEFAULT 'manual',
  p_trigger_config JSONB DEFAULT '{}',
  p_connection_keys JSONB DEFAULT '[]',
  p_environment_variables JSONB DEFAULT '[]',
  p_reporting_webhook TEXT DEFAULT NULL,
  p_execution_timeout INTEGER DEFAULT 300,
  p_retry_config JSONB DEFAULT '{
    "max_retries": 3,
    "retry_delay": 1000,
    "exponential_backoff": true,
    "debounce_enabled": false,
    "debounce_value": 1,
    "debounce_unit": "minutes"
  }'
)
RETURNS BOOLEAN AS $$
DECLARE
  item_seller_id UUID;
BEGIN
  -- Check if the user owns the marketplace item
  SELECT seller_id INTO item_seller_id
  FROM marketplace_items
  WHERE id = p_marketplace_item_id;
  
  -- If item doesn't exist or user doesn't own it, return false
  IF item_seller_id IS NULL OR item_seller_id != auth.uid() THEN
    RETURN FALSE;
  END IF;
  
  -- Perform upsert
  INSERT INTO marketplace_item_configs (
    marketplace_item_id,
    platform,
    trigger_type,
    trigger_config,
    connection_keys,
    environment_variables,
    reporting_webhook,
    execution_timeout,
    retry_config,
    created_by
  ) VALUES (
    p_marketplace_item_id,
    p_platform,
    p_trigger_type,
    p_trigger_config,
    p_connection_keys,
    p_environment_variables,
    p_reporting_webhook,
    p_execution_timeout,
    p_retry_config,
    auth.uid()
  )
  ON CONFLICT (marketplace_item_id) 
  DO UPDATE SET
    platform = EXCLUDED.platform,
    trigger_type = EXCLUDED.trigger_type,
    trigger_config = EXCLUDED.trigger_config,
    connection_keys = EXCLUDED.connection_keys,
    environment_variables = EXCLUDED.environment_variables,
    reporting_webhook = EXCLUDED.reporting_webhook,
    execution_timeout = EXCLUDED.execution_timeout,
    retry_config = EXCLUDED.retry_config,
    updated_at = NOW();
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION upsert_marketplace_item_config(UUID, platform_type, trigger_type, JSONB, JSONB, JSONB, TEXT, INTEGER, JSONB) TO authenticated;
