-- Marketplace Item Configuration Schema
-- This schema stores the configuration data for marketplace items

-- Create enum types
CREATE TYPE platform_type AS ENUM ('n8n', 'make', 'zapier', 'contextual');
CREATE TYPE trigger_type AS ENUM ('webhook', 'cron', 'event', 'manual');
CREATE TYPE webhook_method_type AS ENUM ('GET', 'POST');
CREATE TYPE connection_key_type AS ENUM ('api_key', 'oauth', 'basic_auth', 'custom');
CREATE TYPE debounce_unit_type AS ENUM ('seconds', 'minutes', 'hours', 'days');

-- Main marketplace item configurations table
CREATE TABLE marketplace_item_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  marketplace_item_id UUID NOT NULL REFERENCES marketplace_items(id) ON DELETE CASCADE,
  platform platform_type NOT NULL DEFAULT 'n8n',
  trigger_type trigger_type NOT NULL DEFAULT 'manual',
  
  -- Trigger configuration (JSONB for flexibility)
  trigger_config JSONB NOT NULL DEFAULT '{}',
  
  -- Connection keys (stored as JSONB array)
  connection_keys JSONB NOT NULL DEFAULT '[]',
  
  -- Environment variables (stored as JSONB array)
  environment_variables JSONB NOT NULL DEFAULT '[]',
  
  -- Reporting configuration
  reporting_webhook TEXT,
  execution_timeout INTEGER DEFAULT 300,
  
  -- Retry configuration (stored as JSONB)
  retry_config JSONB NOT NULL DEFAULT '{
    "max_retries": 3,
    "retry_delay": 1000,
    "exponential_backoff": true,
    "debounce_enabled": false,
    "debounce_value": 1,
    "debounce_unit": "minutes"
  }',
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Ensure one config per marketplace item
  UNIQUE(marketplace_item_id)
);

-- Create indexes for better performance
CREATE INDEX idx_marketplace_item_configs_item_id ON marketplace_item_configs(marketplace_item_id);
CREATE INDEX idx_marketplace_item_configs_platform ON marketplace_item_configs(platform);
CREATE INDEX idx_marketplace_item_configs_trigger_type ON marketplace_item_configs(trigger_type);
CREATE INDEX idx_marketplace_item_configs_created_by ON marketplace_item_configs(created_by);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_marketplace_item_configs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_marketplace_item_configs_updated_at
  BEFORE UPDATE ON marketplace_item_configs
  FOR EACH ROW
  EXECUTE FUNCTION update_marketplace_item_configs_updated_at();

-- Enable RLS (Row Level Security)
ALTER TABLE marketplace_item_configs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only access configs for items they created
CREATE POLICY "Users can view their own marketplace item configs"
  ON marketplace_item_configs
  FOR SELECT
  USING (created_by = auth.uid());

CREATE POLICY "Users can insert their own marketplace item configs"
  ON marketplace_item_configs
  FOR INSERT
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update their own marketplace item configs"
  ON marketplace_item_configs
  FOR UPDATE
  USING (created_by = auth.uid());

CREATE POLICY "Users can delete their own marketplace item configs"
  ON marketplace_item_configs
  FOR DELETE
  USING (created_by = auth.uid());

-- Grant necessary permissions
GRANT ALL ON marketplace_item_configs TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Add comments for documentation
COMMENT ON TABLE marketplace_item_configs IS 'Stores configuration data for marketplace items including triggers, connection keys, and environment variables';
COMMENT ON COLUMN marketplace_item_configs.platform IS 'The automation platform (n8n, make, zapier, contextual)';
COMMENT ON COLUMN marketplace_item_configs.trigger_type IS 'How the workflow is triggered (webhook, cron, event, manual)';
COMMENT ON COLUMN marketplace_item_configs.trigger_config IS 'Platform-specific trigger configuration as JSON';
COMMENT ON COLUMN marketplace_item_configs.connection_keys IS 'Array of connection keys/credentials needed by users';
COMMENT ON COLUMN marketplace_item_configs.environment_variables IS 'Array of environment variables users can configure';
COMMENT ON COLUMN marketplace_item_configs.retry_config IS 'Retry and debounce configuration as JSON';
