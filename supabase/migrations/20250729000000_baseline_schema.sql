-- Baseline schema for local/dev. Creates core tables and policies expected by the app.
-- This file intentionally precedes other migrations to ensure later updates apply cleanly.

-- Enable required extensions (Supabase usually has these pre-enabled)
create extension if not exists pgcrypto;

-- Utility: updated_at trigger function
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Content posts moved below projects to satisfy FK dependency

-- Profiles
create table if not exists public.profiles (
  id uuid not null references auth.users(id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (id)
);

alter table public.profiles enable row level security;

do $$ begin
  create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Users can create their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);
exception when duplicate_object then null; end $$;

drop trigger if exists update_profiles_updated_at on public.profiles;
create trigger update_profiles_updated_at
  before update on public.profiles
  for each row execute function public.update_updated_at_column();

-- Projects (latest shape: roles removed; add automation fields)
create table if not exists public.projects (
  id uuid not null default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  platforms text[] default '{}',
  brand_voice text,
  target_audience text,
  automation_enabled boolean default false,
  automation_frequency text,
  last_fetched_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.projects enable row level security;

do $$ begin
  create policy "Users can view their own projects"
  on public.projects for select
  using (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Users can create their own projects"
  on public.projects for insert
  with check (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Users can update their own projects"
  on public.projects for update
  using (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Users can delete their own projects"
  on public.projects for delete
  using (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

drop trigger if exists update_projects_updated_at on public.projects;
create trigger update_projects_updated_at
  before update on public.projects
  for each row execute function public.update_updated_at_column();

-- Content posts (moved below projects to satisfy FK dependency)
create table if not exists public.content_posts (
  id uuid not null default gen_random_uuid() primary key,
  project_id uuid not null references public.projects(id) on delete cascade,
  content text not null,
  platform text not null,
  status text not null default 'draft' check (status in ('draft','scheduled','posted','archived')),
  scheduled_at date null,
  posted_at timestamptz null,
  engagement jsonb null default '{"likes": 0, "shares": 0, "comments": 0}'::jsonb,
  metadata jsonb null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.content_posts enable row level security;

-- Policies: a user can only access posts for their projects
do $$ begin
  create policy "Users can view content posts for their projects"
  on public.content_posts for select
  to authenticated
  using (exists (
    select 1 from public.projects p where p.id = content_posts.project_id and p.user_id = auth.uid()
  ));
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Users can create content posts for their projects"
  on public.content_posts for insert
  to authenticated
  with check (exists (
    select 1 from public.projects p where p.id = content_posts.project_id and p.user_id = auth.uid()
  ));
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Users can update content posts for their projects"
  on public.content_posts for update
  to authenticated
  using (exists (
    select 1 from public.projects p where p.id = content_posts.project_id and p.user_id = auth.uid()
  ));
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Users can delete content posts for their projects"
  on public.content_posts for delete
  to authenticated
  using (exists (
    select 1 from public.projects p where p.id = content_posts.project_id and p.user_id = auth.uid()
  ));
exception when duplicate_object then null; end $$;

drop trigger if exists update_content_posts_updated_at on public.content_posts;
create trigger update_content_posts_updated_at
  before update on public.content_posts
  for each row execute function public.update_updated_at_column();

-- Integrations (latest: config_public + secrets)
create table if not exists public.integrations (
  id uuid not null default gen_random_uuid() primary key,
  name text not null,
  provider text not null,
  type text not null,
  icon text,
  description text,
  config_public jsonb not null default '{}',
  secrets jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.integrations enable row level security;

-- Allow authenticated users to read integrations
do $$ begin
  create policy "Authenticated users can view integrations"
  on public.integrations for select
  to authenticated
  using (true);
exception when duplicate_object then null; end $$;

-- Allow service role to manage integrations
do $$ begin
  create policy "Service role can manage integrations"
  on public.integrations for all
  to service_role
  using (true) with check (true);
exception when duplicate_object then null; end $$;

drop trigger if exists update_integrations_updated_at on public.integrations;
create trigger update_integrations_updated_at
  before update on public.integrations
  for each row execute function public.update_updated_at_column();

-- Connections
create table if not exists public.connections (
  id uuid not null default gen_random_uuid() primary key,
  project_id uuid not null references public.projects(id) on delete cascade,
  integration_id uuid not null references public.integrations(id) on delete cascade,
  config_public jsonb not null default '{}',
  secrets jsonb,
  account_identifier text,
  is_active boolean not null default true,
  status text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.connections enable row level security;

-- Policies: only project owner can manage/read their connections
do $$ begin
  create policy "Users can view their project connections"
  on public.connections for select
  to authenticated
  using (exists (
    select 1 from public.projects p
    where p.id = connections.project_id and p.user_id = auth.uid()
  ));
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Users can create connections for their projects"
  on public.connections for insert
  to authenticated
  with check (exists (
    select 1 from public.projects p
    where p.id = connections.project_id and p.user_id = auth.uid()
  ));
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Users can update their project connections"
  on public.connections for update
  to authenticated
  using (exists (
    select 1 from public.projects p
    where p.id = connections.project_id and p.user_id = auth.uid()
  ));
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Users can delete their project connections"
  on public.connections for delete
  to authenticated
  using (exists (
    select 1 from public.projects p
    where p.id = connections.project_id and p.user_id = auth.uid()
  ));
exception when duplicate_object then null; end $$;

drop trigger if exists update_connections_updated_at on public.connections;
create trigger update_connections_updated_at
  before update on public.connections
  for each row execute function public.update_updated_at_column();

-- OAuth state storage
create table if not exists public.oauth_states (
  id uuid not null default gen_random_uuid() primary key,
  state_hash text not null unique,
  state_data jsonb not null,
  pkce_verifier text,
  user_id uuid references auth.users(id) on delete cascade,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_oauth_states_state_hash on public.oauth_states(state_hash);
create index if not exists idx_oauth_states_expires_at on public.oauth_states(expires_at);
create index if not exists idx_oauth_states_user_id on public.oauth_states(user_id);

alter table public.oauth_states enable row level security;

do $$ begin
  create policy "Users can manage their own OAuth states"
  on public.oauth_states for all
  to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

-- Views: public surfaces without secrets
create or replace view public.connections_public as
select
  id,
  project_id,
  integration_id,
  account_identifier,
  config_public,
  is_active,
  created_at,
  updated_at,
  coalesce(
    (config_public ->> 'access_expires_at')::bigint,
    (config_public ->> 'access_token_expires_at')::bigint
  ) as access_expires_at,
  status,
  ((config_public ->> 'refresh_token_expires_at')::bigint) as refresh_token_expires_at
from public.connections;

create or replace view public.integrations_public as
select
  id,
  name,
  provider,
  type,
  icon,
  description,
  config_public,
  is_active,
  created_at,
  updated_at
from public.integrations;

-- View: projects with aggregated connections
create or replace view public.projects_with_connections as
select
  p.id as project_id,
  p.name as project_name,
  coalesce(
    json_agg(
      distinct jsonb_build_object(
        'connection_id', c.id,
        'name', i.name,
        'provider', i.provider,
        'status', c.status
      )
    ) filter (where c.id is not null),
    '[]'::json
  ) as connections
from public.projects p
left join public.connections c on c.project_id = p.id
left join public.integrations i on i.id = c.integration_id
group by p.id, p.name;

-- Seed integrations (GitHub, LinkedIn, Twitter)
insert into public.integrations (id, name, type, icon, description, config_public, is_active, created_at, updated_at, provider)
values
  ('65a4e59a-53c4-4535-8193-99987bb88419', 'GitHub', 'data_source', 'github-icon', 'Connect to GitHub for repository insights and commit tracking', '{
    "scopes": ["read:user", "repo"],
    "auth_url": "https://github.com/login/oauth/authorize",
    "client_id": "Ov23liyZCbdFErDkZ9Du",
    "token_url": "https://github.com/login/oauth/access_token",
    "redirect_url": "https://localhost:8080/oauth/callback",
    "required_parameters": [],
    "code_challenge_required": false
  }'::jsonb, true, now(), now(), 'github'),
  ('af31491e-2b45-41bb-bd1e-da9a0758f5b5', 'LinkedIn', 'publishing_platform', 'linkedin-icon', 'Connect to LinkedIn for professional updates and articles', '{
    "scopes": ["openid", "profile", "w_member_social"],
    "auth_url": "https://www.linkedin.com/oauth/v2/authorization",
    "client_id": "78s04ouxsitjj9",
    "token_url": "https://www.linkedin.com/oauth/v2/accessToken",
    "redirect_url": "https://localhost:8080/oauth/callback",
    "required_parameters": [],
    "code_challenge_required": false
  }'::jsonb, true, now(), now(), 'linkedin'),
  ('dc01ceea-e28c-45d0-a801-d82b8aa31624', 'Twitter', 'publishing_platform', 'twitter-icon', 'Connect to Twitter/X for posting updates and threads', '{
    "scopes": ["tweet.read", "tweet.write", "users.read", "offline.access"],
    "auth_url": "https://twitter.com/i/oauth2/authorize",
    "client_id": "LUpvV1ZfNFVOTGstSzhxbDJfZDU6MTpjaQ",
    "token_url": "https://api.twitter.com/2/oauth2/token",
    "redirect_url": "https://localhost:8080/oauth/callback",
    "required_parameters": [],
    "code_challenge_required": true
  }'::jsonb, true, now(), now(), 'twitter')
on conflict (id) do update set
  name = excluded.name,
  type = excluded.type,
  icon = excluded.icon,
  description = excluded.description,
  config_public = excluded.config_public,
  is_active = excluded.is_active,
  provider = excluded.provider,
  updated_at = now();


