-- drop the old table
DROP TABLE IF EXISTS user_quotas;

-- Create single quota table for all features
CREATE TABLE IF NOT EXISTS user_quotas (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    posts_used INTEGER DEFAULT 0,
    posts_limit INTEGER DEFAULT 0,
    ai_posts_used INTEGER DEFAULT 0,
    ai_posts_limit INTEGER DEFAULT 0,
    ai_rewrites_used INTEGER DEFAULT 0,
    ai_rewrites_limit INTEGER DEFAULT 0,
    reset_date TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_quotas_user_id ON user_quotas(user_id);
CREATE INDEX IF NOT EXISTS idx_user_quotas_reset_date ON user_quotas(reset_date);
