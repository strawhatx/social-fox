-- Add status field to conversations table
ALTER TABLE conversations ADD COLUMN status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('draft', 'active', 'archived'));

-- Create index for status queries
CREATE INDEX idx_conversations_status ON conversations(status);

-- Update existing conversations to be active
UPDATE conversations SET status = 'active' WHERE status IS NULL;
