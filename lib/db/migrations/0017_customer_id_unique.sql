-- Ensure customer_id is unique per user (allows multiple NULLs in Postgres)
ALTER TABLE users
  ADD CONSTRAINT IF NOT EXISTS users_customer_id_key UNIQUE (customer_id);

-- Drop redundant non-unique index if it exists
DROP INDEX IF EXISTS idx_users_customer_id;

