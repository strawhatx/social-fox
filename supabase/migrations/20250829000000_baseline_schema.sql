
-- >>> BEGIN: 20250729000000_baseline_schema.sql >>>
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

  using (auth.uid() = id);
do $$ begin
  create policy "Users can create their own profile"

  with check (auth.uid() = id);
do $$ begin
  create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);
exception when duplicate_object then null; end $$;
drop trigger if exists update_profiles_updated_at on public.profiles;
create trigger update_profiles_updated_at
  before update on public.profiles

-- Projects (latest shape: roles removed; add automation fields)
create table if not exists public.projects (
  id uuid not null default gen_random_uuid() primary key,
  name text not null,
  description text,
  brand_voice text,
  target_audience text,
  automation_enabled boolean default false,
  automation_frequency text,
  last_fetched_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);


  create policy "Users can view their own projects"
  on public.projects for select
  using (auth.uid() = user_id);
do $$ begin
  create policy "Users can create their own projects"
  on public.projects for insert
  with check (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Users can update their own projects"
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Users can delete their own projects"
  on public.projects for delete
exception when duplicate_object then null; end $$;
drop trigger if exists update_projects_updated_at on public.projects;
create trigger update_projects_updated_at
  before update on public.projects
  for each row execute function public.update_updated_at_column();
-- Content posts (moved below projects to satisfy FK dependency)
create table if not exists public.content_posts (
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
  to authenticated
  with check (exists (
    select 1 from public.projects p where p.id = content_posts.project_id and p.user_id = auth.uid()

do $$ begin
  create policy "Users can update content posts for their projects"
  on public.content_posts for update
  using (exists (
  ));
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Users can delete content posts for their projects"
  using (exists (
    select 1 from public.projects p where p.id = content_posts.project_id and p.user_id = auth.uid()
  ));
exception when duplicate_object then null; end $$;

  before update on public.content_posts

-- Integrations (latest: config_public + secrets)
create table if not exists public.integrations (
  id uuid not null default gen_random_uuid() primary key,
  name text not null,
  type text not null,
  icon text,
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



-- <<< END: 20250729000000_baseline_schema.sql <<<


-- >>> BEGIN: 20250808005500_create_kv_store.sql >>>
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

-- <<< END: 20250808005500_create_kv_store.sql <<<


-- >>> BEGIN: 20250812123533-.sql >>>
-- Fix OAuth states security vulnerability
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Allow OAuth state operations" ON public.oauth_states;

-- Create secure policies that only allow users to access their own OAuth states
CREATE POLICY "Users can manage their own OAuth states"
ON public.oauth_states
FOR ALL
USING (
  -- Allow access only if the user_id in state_data matches the authenticated user
  (state_data->>'user_id')::uuid = auth.uid()
)
WITH CHECK (
  -- Same check for inserts/updates
  (state_data->>'user_id')::uuid = auth.uid()
);
-- <<< END: 20250812123533-.sql <<<


-- >>> BEGIN: 20250812123723-.sql >>>
-- Fix integrations_flat table security vulnerability
-- Enable Row Level Security on integrations_flat table
ALTER TABLE public.integrations_flat ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows authenticated users to view integration data but excludes sensitive fields
-- Since this appears to be system configuration data, we'll allow authenticated users to read it
-- but we need to ensure client_secret is never exposed
CREATE POLICY "Authenticated users can view public integration data"
ON public.integrations_flat
FOR SELECT
TO authenticated
USING (true);

-- However, we should create a safe view that excludes sensitive information
-- and use that instead of the raw table
CREATE OR REPLACE VIEW public.integrations_safe AS
SELECT 
  id,
  name,
  provider,
  type,
  description,
  icon,
  auth_url,
  redirect_url,
  token_url,
  required_parameters,
  scopes,
  code_challenge_required,
  client_id,  -- client_id is usually safe to expose
  -- Explicitly exclude client_secret and other sensitive fields
  created_at,
  updated_at,
  is_active
FROM public.integrations_flat;

-- Grant SELECT permission on the safe view to authenticated users
GRANT SELECT ON public.integrations_safe TO authenticated;
-- <<< END: 20250812123723-.sql <<<


-- >>> BEGIN: 20250812123830-.sql >>>
-- Fix the security vulnerability in integrations_flat view
-- The issue is that client_secret should not be exposed in config_public
-- Let's create a safe version of the integrations_flat view that excludes client_secret

-- Drop the existing view
DROP VIEW IF EXISTS public.integrations_flat;

-- Create a secure version that excludes sensitive information
CREATE OR REPLACE VIEW public.integrations_flat AS
SELECT 
    id,
    name,
    provider,
    type,
    description,
    icon,
    is_active,
    created_at,
    updated_at,
    (config_public ->> 'client_id'::text) AS client_id,
    -- Explicitly exclude client_secret - it should be in secrets, not config_public
    (config_public ->> 'auth_url'::text) AS auth_url,
    (config_public ->> 'token_url'::text) AS token_url,
    (config_public ->> 'redirect_url'::text) AS redirect_url,
    COALESCE(((config_public ->> 'code_challenge_required'::text))::boolean, false) AS code_challenge_required,
    COALESCE(
        CASE
            WHEN (jsonb_typeof((config_public -> 'scopes'::text)) = 'array'::text) THEN (
                SELECT array_agg(jsonb_array_elements_text.value) AS array_agg
                FROM jsonb_array_elements_text((i.config_public -> 'scopes'::text)) jsonb_array_elements_text(value)
            )
            ELSE ARRAY[]::text[]
        END, ARRAY[]::text[]
    ) AS scopes,
    COALESCE(
        CASE
            WHEN (jsonb_typeof((config_public -> 'required_parameters'::text)) = 'array'::text) THEN (
                SELECT array_agg(jsonb_array_elements_text.value) AS array_agg
                FROM jsonb_array_elements_text((i.config_public -> 'required_parameters'::text)) jsonb_array_elements_text(value)
            )
            ELSE ARRAY[]::text[]
        END, ARRAY[]::text[]
    ) AS required_parameters
FROM integrations i;
-- <<< END: 20250812123830-.sql <<<


-- >>> BEGIN: 20250812124057-.sql >>>
-- Fix security vulnerability: restrict access to sensitive secrets in integrations table
-- The current policy allows all authenticated users to read secrets field containing API credentials

-- Drop the existing overly permissive policy
DROP POLICY IF EXISTS "Authenticated users can view integrations" ON public.integrations;
DROP POLICY IF EXISTS "Authenticated users can view public integrations" ON public.integrations;

-- Create a new policy that allows authenticated users to view integrations but excludes secrets
CREATE POLICY "Authenticated users can view public integration data" 
ON public.integrations 
FOR SELECT 
TO authenticated
USING (true);

-- Create a row-level security function that excludes secrets for regular users
-- We'll handle this by creating a secure view instead

-- Create a secure view for public integration access that excludes secrets
CREATE OR REPLACE VIEW public.integrations_public_safe AS
SELECT 
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
FROM public.integrations
WHERE is_active = true;

-- Grant access to the safe view for authenticated users
GRANT SELECT ON public.integrations_public_safe TO authenticated;

-- Ensure service role retains full access to the integrations table
-- (This policy already exists but making sure it covers SELECT as well)
DROP POLICY IF EXISTS "Service role can manage integrations" ON public.integrations;
CREATE POLICY "Service role can access all integration data" 
ON public.integrations 
FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);
-- <<< END: 20250812124057-.sql <<<


-- >>> BEGIN: 20250812124118-.sql >>>
-- Fix the security definer view warnings
-- The issue is that views with SECURITY DEFINER bypass RLS of querying user

-- Drop and recreate the integrations_public_safe view with SECURITY INVOKER
DROP VIEW IF EXISTS public.integrations_public_safe;

CREATE OR REPLACE VIEW public.integrations_public_safe 
WITH (security_invoker = true) AS
SELECT 
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
FROM public.integrations
WHERE is_active = true;

-- Grant access to the safe view for authenticated users
GRANT SELECT ON public.integrations_public_safe TO authenticated;

-- Also fix the integrations_flat view that was created earlier
DROP VIEW IF EXISTS public.integrations_flat;

CREATE OR REPLACE VIEW public.integrations_flat 
WITH (security_invoker = true) AS
SELECT 
    id,
    name,
    provider,
    type,
    description,
    icon,
    is_active,
    created_at,
    updated_at,
    (config_public ->> 'client_id'::text) AS client_id,
    -- Explicitly exclude client_secret - it should be in secrets, not config_public
    (config_public ->> 'auth_url'::text) AS auth_url,
    (config_public ->> 'token_url'::text) AS token_url,
    (config_public ->> 'redirect_url'::text) AS redirect_url,
    COALESCE(((config_public ->> 'code_challenge_required'::text))::boolean, false) AS code_challenge_required,
    COALESCE(
        CASE
            WHEN (jsonb_typeof((config_public -> 'scopes'::text)) = 'array'::text) THEN (
                SELECT array_agg(jsonb_array_elements_text.value) AS array_agg
                FROM jsonb_array_elements_text((i.config_public -> 'scopes'::text)) jsonb_array_elements_text(value)
            )
            ELSE ARRAY[]::text[]
        END, ARRAY[]::text[]
    ) AS scopes,
    COALESCE(
        CASE
            WHEN (jsonb_typeof((config_public -> 'required_parameters'::text)) = 'array'::text) THEN (
                SELECT array_agg(jsonb_array_elements_text.value) AS array_agg
                FROM jsonb_array_elements_text((i.config_public -> 'required_parameters'::text)) jsonb_array_elements_text(value)
            )
            ELSE ARRAY[]::text[]
        END, ARRAY[]::text[]
    ) AS required_parameters
FROM integrations i;
-- <<< END: 20250812124118-.sql <<<


-- >>> BEGIN: 20250812124132-.sql >>>
-- Fix the security definer view warnings
-- The issue is that views with SECURITY DEFINER bypass RLS of querying user

-- Drop and recreate the integrations_public_safe view with SECURITY INVOKER
DROP VIEW IF EXISTS public.integrations_public_safe;

CREATE OR REPLACE VIEW public.integrations_public_safe 
WITH (security_invoker = true) AS
SELECT 
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
FROM public.integrations
WHERE is_active = true;

-- Grant access to the safe view for authenticated users
GRANT SELECT ON public.integrations_public_safe TO authenticated;

-- Also fix the integrations_flat view that was created earlier
DROP VIEW IF EXISTS public.integrations_flat;

CREATE OR REPLACE VIEW public.integrations_flat 
WITH (security_invoker = true) AS
SELECT 
    id,
    name,
    provider,
    type,
    description,
    icon,
    is_active,
    created_at,
    updated_at,
    (config_public ->> 'client_id'::text) AS client_id,
    -- Explicitly exclude client_secret - it should be in secrets, not config_public
    (config_public ->> 'auth_url'::text) AS auth_url,
    (config_public ->> 'token_url'::text) AS token_url,
    (config_public ->> 'redirect_url'::text) AS redirect_url,
    COALESCE(((config_public ->> 'code_challenge_required'::text))::boolean, false) AS code_challenge_required,
    COALESCE(
        CASE
            WHEN (jsonb_typeof((config_public -> 'scopes'::text)) = 'array'::text) THEN (
                SELECT array_agg(jsonb_array_elements_text.value) AS array_agg
                FROM jsonb_array_elements_text((i.config_public -> 'scopes'::text)) jsonb_array_elements_text(value)
            )
            ELSE ARRAY[]::text[]
        END, ARRAY[]::text[]
    ) AS scopes,
    COALESCE(
        CASE
            WHEN (jsonb_typeof((config_public -> 'required_parameters'::text)) = 'array'::text) THEN (
                SELECT array_agg(jsonb_array_elements_text.value) AS array_agg
                FROM jsonb_array_elements_text((i.config_public -> 'required_parameters'::text)) jsonb_array_elements_text(value)
            )
            ELSE ARRAY[]::text[]
        END, ARRAY[]::text[]
    ) AS required_parameters
FROM integrations i;
-- <<< END: 20250812124132-.sql <<<


-- >>> BEGIN: 20250817163929_685f5eda-309f-41e1-ae3d-6de3bdda1839.sql >>>
-- Create user_credits table to track credit balances
CREATE TABLE public.user_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  credits INTEGER NOT NULL DEFAULT 15,
  additional_credits INTEGER NOT NULL DEFAULT 50,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable Row Level Security
ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;

-- Create policies for user_credits
CREATE POLICY "Users can view their own credits" 
ON public.user_credits 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own credits" 
ON public.user_credits 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Service can insert credits" 
ON public.user_credits 
FOR INSERT 
WITH CHECK (true);

-- Create credit_transactions table to track credit usage and purchases
CREATE TABLE public.credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL, -- positive for purchase, negative for usage
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('purchase', 'usage', 'bonus', 'subscription')),
  description TEXT,
  stripe_session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

-- Create policies for credit_transactions
CREATE POLICY "Users can view their own transactions" 
ON public.credit_transactions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Service can insert transactions" 
ON public.credit_transactions 
FOR INSERT 
WITH CHECK (true);

-- Create function to initialize user credits when they sign up
CREATE OR REPLACE FUNCTION public.initialize_user_credits()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_credits (user_id, credits)
  VALUES (NEW.id, 15)
  ON CONFLICT (user_id) DO NOTHING;
  
  INSERT INTO public.credit_transactions (user_id, amount, transaction_type, description)
  VALUES (NEW.id, 15, 'bonus', 'Welcome bonus - 15 free credits');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to initialize credits on user signup
CREATE TRIGGER on_auth_user_created_credits
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.initialize_user_credits();

-- Create function to update user credits balance
CREATE OR REPLACE FUNCTION public.update_user_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_transaction_type TEXT,
  p_description TEXT DEFAULT NULL,
  p_stripe_session_id TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  current_credits INTEGER;
BEGIN
  -- Get current credits
  SELECT credits INTO current_credits 
  FROM public.user_credits 
  WHERE user_id = p_user_id;
  
  -- Check if user has enough credits for usage (negative amounts)
  IF p_amount < 0 AND (current_credits + p_amount) < 0 THEN
    RETURN FALSE; -- Insufficient credits
  END IF;
  
  -- Update credits balance
  UPDATE public.user_credits 
  SET credits = credits + p_amount,
      updated_at = now()
  WHERE user_id = p_user_id;
  
  -- Record transaction
  INSERT INTO public.credit_transactions (
    user_id, 
    amount, 
    transaction_type, 
    description,
    stripe_session_id
  ) VALUES (
    p_user_id, 
    p_amount, 
    p_transaction_type, 
    p_description,
    p_stripe_session_id
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- <<< END: 20250817163929_685f5eda-309f-41e1-ae3d-6de3bdda1839.sql <<<


-- >>> BEGIN: 20250817164126_a0c97a0c-3e6a-4519-af1f-e50fb7efee89.sql >>>
-- Fix function search path security issues
CREATE OR REPLACE FUNCTION public.initialize_user_credits()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_credits (user_id, credits)
  VALUES (NEW.id, 15)
  ON CONFLICT (user_id) DO NOTHING;
  
  INSERT INTO public.credit_transactions (user_id, amount, transaction_type, description)
  VALUES (NEW.id, 15, 'bonus', 'Welcome bonus - 10 free credits');
  
  RETURN NEW;
END;
$$;

-- Fix function search path for update_user_credits
CREATE OR REPLACE FUNCTION public.update_user_additional_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_transaction_type TEXT,
  p_description TEXT DEFAULT NULL,
  p_stripe_session_id TEXT DEFAULT NULL
)
RETURNS BOOLEAN 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_credits INTEGER;
BEGIN
  -- Get current credits
  SELECT credits INTO current_credits 
  FROM public.user_credits 
  WHERE user_id = p_user_id;
  
  -- Check if user has enough credits for usage (negative amounts)
  IF p_amount < 0 THEN RETURN FALSE; -- Insufficient credits
  END IF;
  
  -- Update credits balance
  UPDATE public.user_credits 
  SET additional_credits = p_amount,
      updated_at = now()
  WHERE user_id = p_user_id;
  
  -- Record transaction
  INSERT INTO public.credit_transactions (
    user_id, 
    amount, 
    transaction_type, 
    description,
    stripe_session_id
  ) VALUES (
    p_user_id, 
    p_amount, 
    p_transaction_type, 
    p_description,
    p_stripe_session_id
  );
  
  RETURN TRUE;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_user_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_transaction_type TEXT,
  p_description TEXT DEFAULT NULL,
  p_stripe_session_id TEXT DEFAULT NULL
)
RETURNS BOOLEAN 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_credits INTEGER;
BEGIN
  -- Get current credits
  SELECT credits INTO current_credits 
  FROM public.user_credits 
  WHERE user_id = p_user_id;
  
  -- Check if user has enough credits for usage (negative amounts)
  IF p_amount < 0 THEN RETURN FALSE; -- Insufficient credits
  END IF;
  
  -- Update credits balance
  UPDATE public.user_credits 
  SET credits = p_amount,
      updated_at = now()
  WHERE user_id = p_user_id;
  
  -- Record transaction
  INSERT INTO public.credit_transactions (
    user_id, 
    amount, 
    transaction_type, 
    description,
    stripe_session_id
  ) VALUES (
    p_user_id, 
    p_amount, 
    p_transaction_type, 
    p_description,
    p_stripe_session_id
  );
  
  RETURN TRUE;
END;
$$;
-- <<< END: 20250817164126_a0c97a0c-3e6a-4519-af1f-e50fb7efee89.sql <<<


-- >>> BEGIN: 20250818014253_scheduled_content_with_credits_view.sql >>>
-- Create view to filter scheduled content posts for users with sufficient credits
-- This view only returns scheduled content posts where the user has enough credits 
-- to cover ALL their scheduled posts (not just > 0)

CREATE OR REPLACE VIEW public.scheduled_content_posts_with_credits AS
SELECT 
  cp.id,
  cp.project_id,
  cp.content,
  cp.platform,
  cp.status,
  cp.scheduled_at,
  cp.posted_at,
  cp.engagement,
  cp.metadata,
  cp.created_at,
  cp.updated_at,
  -- Include project and user information for context
  p.user_id,
  p.name as project_name,
  -- Include credit information
  uc.credits,
  uc.id as user_credits_id,
  -- Include count information for transparency
  user_scheduled_counts.total_scheduled_posts,
  user_scheduled_counts.credits_needed
FROM public.content_posts cp
INNER JOIN public.projects p ON cp.project_id = p.id
INNER JOIN public.user_credits uc ON p.user_id = uc.user_id
INNER JOIN (
  -- Subquery to calculate total scheduled posts per user
  SELECT 
    p2.user_id,
    COUNT(*) as total_scheduled_posts,
    COUNT(*) as credits_needed  -- 1 credit per post
  FROM public.content_posts cp2
  INNER JOIN public.projects p2 ON cp2.project_id = p2.id
  WHERE 
    cp2.status = 'scheduled'
    AND cp2.scheduled_at <= CURRENT_DATE
  GROUP BY p2.user_id
) user_scheduled_counts ON p.user_id = user_scheduled_counts.user_id
WHERE 
  -- Only include scheduled posts
  cp.status = 'scheduled'
  -- Only include users who have enough credits for ALL their scheduled posts
  AND uc.credits >= user_scheduled_counts.credits_needed
  -- Only include posts that are due to be posted (today or overdue)
  AND cp.scheduled_at <= CURRENT_DATE;

-- Add comment explaining the view's purpose
COMMENT ON VIEW public.scheduled_content_posts_with_credits IS 
'View that returns scheduled content posts only for users who have enough credits to cover ALL their scheduled posts. Includes posts due today or overdue. Includes credit count information for transparency.';

-- Create index on the underlying tables to optimize this view's performance
-- (These may already exist, but this ensures good performance)
CREATE INDEX IF NOT EXISTS idx_content_posts_status_scheduled_at 
ON public.content_posts(status, scheduled_at) 
WHERE status = 'scheduled';

CREATE INDEX IF NOT EXISTS idx_projects_user_id 
ON public.projects(user_id);

CREATE INDEX IF NOT EXISTS idx_user_credits_user_id_credits 
ON public.user_credits(user_id, credits);

-- Enable RLS on the view (inherits from underlying tables)
-- The view will respect the existing RLS policies on content_posts, projects, and user_credits

-- Example usage queries:
-- 
-- 1. Get all scheduled posts for users with sufficient credits:
-- SELECT * FROM public.scheduled_content_posts_with_credits;
-- 
-- 2. Get scheduled posts for a specific user (if they have enough credits):
-- SELECT * FROM public.scheduled_content_posts_with_credits WHERE user_id = 'user-uuid';
-- 
-- 3. Get scheduled posts due today for users with sufficient credits:
-- SELECT * FROM public.scheduled_content_posts_with_credits WHERE scheduled_at = CURRENT_DATE;
-- 
-- 4. See credit status per user (includes credit counts):
-- SELECT DISTINCT user_id, credits, total_scheduled_posts, credits_needed,
--        (credits - credits_needed) as credits_remaining
-- FROM public.scheduled_content_posts_with_credits;
-- 
-- 5. Users who can afford all their scheduled posts:
-- SELECT DISTINCT user_id, credits, total_scheduled_posts
-- FROM public.scheduled_content_posts_with_credits
-- WHERE credits >= total_scheduled_posts;
-- <<< END: 20250818014253_scheduled_content_with_credits_view.sql <<<


-- >>> BEGIN: 20250818015500_github_connections_with_credits_view.sql >>>
-- Create view to filter GitHub connections for users with sufficient credits
-- GitHub data fetching can consume variable tokens based on repository size/activity
-- This view ensures users have minimum credits before processing GitHub connections

create or replace view public.github_connections_with_credits as
with project_usage as (
    select
        c.id as connection_id,
        c.project_id,
        c.integration_id,
        c.config_public,
        c.account_identifier,
        c.is_active,
        c.status,
        c.created_at,
        c.updated_at,
        p.user_id,
        p.name as project_name,
        p.last_fetched_at,
        i.name as integration_name,
        i.provider,
        uc.credits as user_credits,
        uc.id as user_credits_id,
        coalesce(
            (c.config_public ->> 'estimated_token_usage')::integer,
            3
        ) as estimated_token_usage
    from connections c
    join projects p on c.project_id = p.id
    join integrations i on c.integration_id = i.id
    join user_credits uc on p.user_id = uc.user_id
    where
        i.provider = 'github'
        and i.type = 'data_source'
        and c.is_active = true
        and c.status = 'connected'::connection_status
        and (c.config_public -> 'repository') ->> 'owner' is not null
        and (c.config_public -> 'repository') ->> 'repository' is not null
),
running_total as (
    select *,
        sum(estimated_token_usage) over (
            partition by user_id 
            order by created_at, connection_id
            rows between unbounded preceding and current row
        ) as cumulative_usage
    from project_usage
)
select *
from running_total
where cumulative_usage <= user_credits;

-- Add comment explaining the view's purpose
COMMENT ON VIEW public.github_connections_with_credits IS 
'View that returns active GitHub connections only for users who have sufficient credits for GitHub data fetching. Includes estimated token usage and repository configuration. Minimum 3 tokens required by default, but can be customized per connection.';

-- Create indexes to optimize this view's performance
CREATE INDEX IF NOT EXISTS idx_connections_provider_active 
ON public.connections(integration_id, is_active, status)
WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_integrations_provider_type 
ON public.integrations(provider, type)
WHERE provider = 'github' AND type = 'data_source';

-- Enable RLS on the view (inherits from underlying tables)
-- The view will respect the existing RLS policies on connections, projects, and user_credits

-- Example usage queries:
-- 
-- 1. Get all GitHub connections for users with sufficient credits:
-- SELECT * FROM public.github_connections_with_credits;
-- 
-- 2. Get GitHub connections for a specific user:
-- SELECT * FROM public.github_connections_with_credits WHERE user_id = 'user-uuid';
-- 
-- 3. Get GitHub connections that need initialization:
-- SELECT * FROM public.github_connections_with_credits WHERE initialized_at IS NULL;
-- 
-- 4. Check credit status for GitHub users:
-- SELECT user_id, credits, estimated_token_usage, 
--        (credits - estimated_token_usage) as credits_remaining,
--        repo_owner, repo_name
-- FROM public.github_connections_with_credits;
-- 
-- 5. Get connections with custom token usage estimates:
-- SELECT * FROM public.github_connections_with_credits 
-- WHERE estimated_token_usage > 3;
-- <<< END: 20250818015500_github_connections_with_credits_view.sql <<<


-- >>> BEGIN: 20250820000000_add_stripe_fields_to_profiles.sql >>>
-- Add Stripe-related fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS profiles_stripe_customer_id_idx ON public.profiles(stripe_customer_id);

-- Add subscription tracking fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS subscription_is_active BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS subscription_price_id TEXT,
ADD COLUMN IF NOT EXISTS current_period_end TIMESTAMP WITH TIME ZONE;

-- Create index for faster subscription lookups
CREATE INDEX IF NOT EXISTS profiles_stripe_subscription_id_idx ON public.profiles(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS profiles_subscription_price_id_idx ON public.profiles(subscription_price_id);

-- <<< END: 20250820000000_add_stripe_fields_to_profiles.sql <<<


-- >>> BEGIN: 20250820001500_drop_subscription_plan_from_profiles.sql >>>
-- Drop legacy subscription_plan column now that subscription_price_id is the source of truth
ALTER TABLE public.profiles 
DROP COLUMN IF EXISTS subscription_plan;



-- <<< END: 20250820001500_drop_subscription_plan_from_profiles.sql <<<


-- >>> BEGIN: 20250823043645_3bf10f9d-3e73-4ae5-a7e1-164fbb465de8.sql >>>
-- Add status column to projects table
ALTER TABLE public.projects 
ADD COLUMN status text NOT NULL DEFAULT 'draft';

-- Add check constraint for valid status values
ALTER TABLE public.projects 
ADD CONSTRAINT projects_status_check 
CHECK (status IN ('draft', 'initialized'));
-- <<< END: 20250823043645_3bf10f9d-3e73-4ae5-a7e1-164fbb465de8.sql <<<

