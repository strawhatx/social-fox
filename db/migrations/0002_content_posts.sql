-- Migration 0001: content_posts baseline
create extension if not exists pgcrypto;

create or replace function public.update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.content_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  content text not null,
  platform text not null,
  status text not null default 'draft' check (status in ('draft','scheduled','posted','archived')),
  scheduled_at timestamptz null,
  posted_at timestamptz null,
  engagement jsonb not null default '{}'::jsonb,
  metadata   jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists update_content_posts_updated_at on public.content_posts;
create trigger update_content_posts_updated_at
  before update on public.content_posts
  for each row execute function public.update_updated_at();

create index if not exists idx_content_posts_user_scheduled
  on public.content_posts(user_id, scheduled_at);

create index if not exists idx_content_posts_user_posted
  on public.content_posts(user_id, posted_at);
