create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  display_name text,
  avatar_url text,
  created_at timestamptz default now()
);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  comic_slug text not null,
  chapter_slug text,
  target_type text default 'comic' check (target_type in ('comic', 'chapter')),
  user_id uuid not null references auth.users(id) on delete cascade,
  content text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.reactions (
  id uuid primary key default gen_random_uuid(),
  comic_slug text not null,
  chapter_slug text,
  target_type text default 'comic' check (target_type in ('comic', 'chapter')),
  user_id uuid not null references auth.users(id) on delete cascade,
  reaction_type text not null check (reaction_type in ('like', 'love', 'laugh', 'wow', 'sad')),
  created_at timestamptz default now()
);

alter table public.comments
add column if not exists chapter_slug text;

alter table public.comments
add column if not exists target_type text default 'comic'
check (target_type in ('comic', 'chapter'));

alter table public.reactions
add column if not exists chapter_slug text;

alter table public.reactions
add column if not exists target_type text default 'comic'
check (target_type in ('comic', 'chapter'));

alter table public.reactions
drop constraint if exists reactions_comic_slug_user_id_key;

create unique index if not exists reactions_unique_target_user
on public.reactions (
  target_type,
  comic_slug,
  coalesce(chapter_slug, ''),
  user_id
);

alter table public.profiles enable row level security;
alter table public.comments enable row level security;
alter table public.reactions enable row level security;

create policy "Profiles are viewable by everyone"
on public.profiles for select
using (true);

create policy "Users can insert own profile"
on public.profiles for insert
with check (auth.uid() = id);

create policy "Users can update own profile"
on public.profiles for update
using (auth.uid() = id);

create policy "Comments are viewable by everyone"
on public.comments for select
using (true);

create policy "Logged in users can create comments"
on public.comments for insert
with check (auth.uid() = user_id);

create policy "Users can update own comments"
on public.comments for update
using (auth.uid() = user_id);

create policy "Users can delete own comments"
on public.comments for delete
using (auth.uid() = user_id);

create policy "Reactions are viewable by everyone"
on public.reactions for select
using (true);

create policy "Logged in users can create reactions"
on public.reactions for insert
with check (auth.uid() = user_id);

create policy "Users can update own reactions"
on public.reactions for update
using (auth.uid() = user_id);

create policy "Users can delete own reactions"
on public.reactions for delete
using (auth.uid() = user_id);
