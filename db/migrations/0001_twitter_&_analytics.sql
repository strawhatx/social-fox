
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
  last_synced_at timestamptz,
  
  backfill_status TEXT DEFAULT 'pending', -- 'pending' | 'in_progress' | 'done'
  backfill_started_at TIMESTAMP NULL,
  backfill_completed_at TIMESTAMP NULL
);

-- 3. Audience Metrics (growth snapshots)
create table audience_metrics (
  id uuid primary key default gen_random_uuid(),
  twitter_account_id uuid references twitter_accounts(id) on delete cascade,
  date date not null,
  followers_count int default 0,
  following_count int default 0,
  new_followers int default 0
);

-- 4. Tweets (store raw tweets + metrics)
create table tweets (
  id uuid primary key default gen_random_uuid(),
  twitter_account_id uuid references twitter_accounts(id) on delete cascade,
  tweet_id text not null unique,
  text text,
  created_at timestamptz not null,
  like_count int default 0,
  retweet_count int default 0,
  reply_count int default 0,
  quote_count int default 0,
  impression_count int default 0
);

-- 5. Content Performance (aggregated metrics per period)
create table content_performance (
  id uuid primary key default gen_random_uuid(),
  twitter_account_id uuid references twitter_accounts(id) on delete cascade,
  period text not null, -- 'weekly' | 'monthly'
  start_date date not null,
  end_date date not null,
  avg_engagement_rate numeric(6,4),
  top_tweet_id uuid references tweets(id),
  tweets_posted int default 0
);

-- 6. Account Analysis (AI or heuristic insights)
create table account_analysis (
  id uuid primary key default gen_random_uuid(),
  twitter_account_id uuid references twitter_accounts(id) on delete cascade,
  period text not null, -- 'last_30_days', 'last_7_days'
  best_posting_time text,
  best_tweet_type text,
  engagement_summary jsonb
);
