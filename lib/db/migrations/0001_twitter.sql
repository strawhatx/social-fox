
-- 1. Users (Clerk + App users)
create table users (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text not null unique,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. Twitter Accounts
create table twitter_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  twitter_user_id text not null unique,
  handle text not null,
  name text,
  description text,
  profile_image_url text,
  followers_count int default 0,
  following_count int default 0,
  tweet_count int default 0,
  listed_count int default 0,
  last_synced_at timestamptz
);