-- Create user_usage table for tracking feature usage
CREATE TABLE IF NOT EXISTS user_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    feature VARCHAR(50) NOT NULL, -- "aiGenerations", "scheduledPosts", "projects"
    used INT DEFAULT 0,
    period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_user_usage_user_id ON user_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_user_usage_feature ON user_usage(feature);
CREATE INDEX IF NOT EXISTS idx_user_usage_period ON user_usage(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_user_usage_user_feature_period ON user_usage(user_id, feature, period_start, period_end);

-- Add unique constraint to prevent duplicate usage records for same user/feature/period
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_usage_unique ON user_usage(user_id, feature, period_start, period_end);
