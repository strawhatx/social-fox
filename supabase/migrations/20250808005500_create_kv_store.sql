-- Drop legacy OAuth state table (state now stored in public.kv_store)
drop table if exists public.oauth_states cascade;

-- Create a simple key/value store for ephemeral state like OAuth state & PKCE
create table if not exists public.kv_store (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

-- Helpful index for updated_at queries (cleanup)
create index if not exists kv_store_updated_at_idx on public.kv_store(updated_at);

-- Ensure RLS is enabled on all relevant tables
alter table if exists public.kv_store enable row level security;
