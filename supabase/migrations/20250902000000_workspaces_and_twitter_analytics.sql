-- Workspaces introduction and Twitter analytics expansion
-- This migration introduces workspaces, migrates connections from project_id -> workspace_id,
-- backfills workspace records from existing projects, updates views/policies, and adds
-- analytics fields for Twitter/X to content_posts.

-- 1) Workspaces core tables
create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.workspaces enable row level security;

do $$ begin
  create policy "Owners can view workspaces"
  on public.workspaces for select
  to authenticated
  using (auth.uid() = owner_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Users can create their own workspaces"
  on public.workspaces for insert
  to authenticated
  with check (auth.uid() = owner_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Owners can update their workspaces"
  on public.workspaces for update
  to authenticated
  using (auth.uid() = owner_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Owners can delete their workspaces"
  on public.workspaces for delete
  to authenticated
  using (auth.uid() = owner_id);
exception when duplicate_object then null; end $$;

drop trigger if exists update_workspaces_updated_at on public.workspaces;
create trigger update_workspaces_updated_at
  before update on public.workspaces
  for each row execute function public.update_updated_at_column();

-- 2) Projects -> Workspaces relationship
-- Add workspace_id to projects (nullable initially for backfill), then backfill and enforce.
alter table public.projects add column if not exists workspace_id uuid;
create index if not exists idx_projects_workspace_id on public.projects(workspace_id);
-- Add FK constraint (deferred adding NOT NULL until backfill verified)
do $$ begin
  alter table public.projects
    add constraint projects_workspace_id_fkey
    foreign key (workspace_id) references public.workspaces(id) on delete set null;
exception when duplicate_object then null; end $$;

-- Backfill: create a workspace per existing project owner (profiles earlier had user_id via projects.user_id in older schema)
-- Some earlier migrations removed user_id from projects; but views and policies still refer to it.
-- We will attempt to infer owner from the latest projects table if column exists; otherwise fallback to profiles.id that created the project is unknown.
do $$
begin
  if exists (
    select 1 from information_schema.columns 
    where table_schema = 'public' and table_name = 'projects' and column_name = 'user_id'
  ) then
    -- Create workspaces for each distinct user_id if none exists
    insert into public.workspaces (id, owner_id, name, description)
    select gen_random_uuid(), p.user_id, coalesce(p.name || ' Workspace','Workspace'), 'Auto-migrated from project'
    from (select distinct user_id, min(name) as name from public.projects group by user_id) p
    where not exists (
      select 1 from public.workspaces w where w.owner_id = p.user_id
    );

    -- Link projects to a workspace owned by the same user
    update public.projects pr
    set workspace_id = w.id
    from public.workspaces w
    where w.owner_id = pr.user_id and pr.workspace_id is null;
  else
    -- Fallback: one shared workspace for orphaned projects
    -- Create a placeholder owner using the first profile id if available
    perform 1;
  end if;
end $$;

-- 3) Connections: migrate project_id -> workspace_id
alter table public.connections add column if not exists workspace_id uuid;
create index if not exists idx_connections_workspace_id on public.connections(workspace_id);
do $$ begin
  alter table public.connections
    add constraint connections_workspace_id_fkey
    foreign key (workspace_id) references public.workspaces(id) on delete cascade;
exception when duplicate_object then null; end $$;

-- Backfill workspace_id on connections via project.workspace_id
update public.connections c
set workspace_id = p.workspace_id
from public.projects p
where c.project_id = p.id and c.workspace_id is null;

-- Enforce NOT NULL once populated
do $$ begin
  if exists (select 1 from public.connections where workspace_id is null) then
    raise notice 'Some connections still have null workspace_id; leaving column nullable for now.';
  else
    alter table public.connections alter column workspace_id set not null;
  end if;
exception when others then null; end $$;

-- Optional: drop old FK uses in views referencing project_id for connections aggregations and create workspace-centric view
drop view if exists public.projects_with_connections;

create or replace view public.workspaces_with_connections as
select
  w.id as workspace_id,
  w.name as workspace_name,
  coalesce(
    json_agg(
      distinct jsonb_build_object(
        'connection_id', c.id,
        'integration_id', c.integration_id,
        'status', c.status
      )
    ) filter (where c.id is not null),
    '[]'::json
  ) as connections
from public.workspaces w
left join public.connections c on c.workspace_id = w.id
group by w.id, w.name;

-- 4) RLS updates for connections to include workspace-based policies
alter table public.connections enable row level security;

do $$ begin
  drop policy if exists "Users can view their project connections" on public.connections;
  create policy "Workspace owners or project owners can view connections" 
  on public.connections for select to authenticated
  using (
    exists (
      select 1 from public.workspaces w
      where w.id = connections.workspace_id and w.owner_id = auth.uid()
    )
    or exists (
      select 1 from public.projects p where p.id = connections.project_id and p.user_id = auth.uid()
    )
  );
exception when duplicate_object then null; end $$;

do $$ begin
  drop policy if exists "Users can create connections for their projects" on public.connections;
  create policy "Workspace owners or project owners can create connections" 
  on public.connections for insert to authenticated
  with check (
    exists (
      select 1 from public.workspaces w
      where w.id = connections.workspace_id and w.owner_id = auth.uid()
    )
    or exists (
      select 1 from public.projects p where p.id = connections.project_id and p.user_id = auth.uid()
    )
  );
exception when duplicate_object then null; end $$;

do $$ begin
  drop policy if exists "Users can update their project connections" on public.connections;
  create policy "Workspace owners or project owners can update connections" 
  on public.connections for update to authenticated
  using (
    exists (
      select 1 from public.workspaces w
      where w.id = connections.workspace_id and w.owner_id = auth.uid()
    )
    or exists (
      select 1 from public.projects p where p.id = connections.project_id and p.user_id = auth.uid()
    )
  );
exception when duplicate_object then null; end $$;

do $$ begin
  drop policy if exists "Users can delete their project connections" on public.connections;
  create policy "Workspace owners or project owners can delete connections" 
  on public.connections for delete to authenticated
  using (
    exists (
      select 1 from public.workspaces w
      where w.id = connections.workspace_id and w.owner_id = auth.uid()
    )
    or exists (
      select 1 from public.projects p where p.id = connections.project_id and p.user_id = auth.uid()
    )
  );
exception when duplicate_object then null; end $$;

-- 5) Twitter analytics fields on content_posts
-- Explicit columns for posts on Twitter/X; kept nullable to support multi-platform table
alter table public.content_posts
  add column if not exists workspace_id uuid,

-- Index and FK for workspace_id on content_posts
create index if not exists idx_content_posts_workspace_id on public.content_posts(workspace_id);
do $$ begin
  alter table public.content_posts
    add constraint content_posts_workspace_id_fkey
    foreign key (workspace_id) references public.workspaces(id) on delete set null;
exception when duplicate_object then null; end $$;

-- Backfill content_posts.workspace_id from related project
update public.content_posts cp
set workspace_id = p.workspace_id
from public.projects p
where cp.project_id = p.id and cp.workspace_id is null;

-- Computed engagement rate convenience view (avoids per-row computed column complexity across platforms)
create or replace view public.content_posts_twitter_metrics as
select
  id,
  project_id,
  platform,
  posted_at,
  metadata ->> 'twitter_post_id' as twitter_post_id,
  metadata ->> 'twitter_url' as twitter_url,
  metadata ->> 'twitter_likes' as twitter_likes,
  metadata ->> 'twitter_retweets' as twitter_retweets,
  metadata ->> 'twitter_replies' as twitter_replies
from public.content_posts
where platform in ('twitter','x');

-- Helpful indexes
create index if not exists idx_content_posts_twitter_post_id on public.content_posts(twitter_post_id);
create index if not exists idx_content_posts_platform_posted_at on public.content_posts(platform, posted_at);

-- 6) Maintain backwards-compatibility views
-- Recreate projects_with_connections to still work temporarily by joining via project.workspace_id
create or replace view public.projects_with_connections as
select
  p.id as project_id,
  p.name as project_name,
  coalesce(
    json_agg(
      distinct jsonb_build_object(
        'connection_id', c.id,
        'integration_id', c.integration_id,
        'status', c.status
      )
    ) filter (where c.id is not null),
    '[]'::json
  ) as connections
from public.projects p
left join public.connections c on c.workspace_id = p.workspace_id
group by p.id, p.name;


