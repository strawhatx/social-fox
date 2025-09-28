-- Add subscription tracking fields to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS plan VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS customer_id VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(50) DEFAULT 'inactive';
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_id VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_expiry TIMESTAMP WITH TIME ZONE;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_customer_id ON users(customer_id);
CREATE INDEX IF NOT EXISTS idx_users_plan ON users(plan);

-- Update existing users to have default values
UPDATE users SET 
  plan = 'explore',
  subscription_status = 'inactive'
WHERE plan IS NULL OR subscription_status IS NULL;
