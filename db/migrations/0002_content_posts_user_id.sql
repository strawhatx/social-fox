-- Migration 0002: swap workspace_id -> user_id
alter table public.content_posts add column if not exists user_id text;

-- Backfill from workspace_id if needed (optional noop here)
-- update public.content_posts set user_id = workspace_id where user_id is null;

-- Make user_id required going forward
alter table public.content_posts alter column user_id set not null;

-- Drop old indexes and column
drop index if exists idx_content_posts_workspace_scheduled;
drop index if exists idx_content_posts_workspace_posted;

alter table public.content_posts drop column if exists workspace_id;

-- New indexes
create index if not exists idx_content_posts_user_scheduled on public.content_posts(user_id, scheduled_at);
create index if not exists idx_content_posts_user_posted on public.content_posts(user_id, posted_at);
