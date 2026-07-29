-- ============================================================
-- VibeReels — Supabase Database Schema
-- Run this entire script in your Supabase SQL Editor
-- ============================================================

-- 1. PROFILES table
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  name text,
  bio text,
  avatar_url text,
  is_verified boolean default false,
  followers_count integer default 0,
  following_count integer default 0,
  likes_count integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table public.profiles enable row level security;

create policy "Profiles are publicly readable" on public.profiles
  for select using (true);

create policy "Users can insert their own profile" on public.profiles
  for insert with check (auth.uid() = id);

create policy "Users can update their own profile" on public.profiles
  for update using (auth.uid() = id);

-- 2. REELS table
create table if not exists public.reels (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  video_url text not null,
  thumbnail_url text,
  caption text,
  hashtags text[],
  song text,
  likes_count integer default 0,
  comments_count integer default 0,
  shares_count integer default 0,
  views_count integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table public.reels enable row level security;

create policy "Reels are publicly readable" on public.reels
  for select using (true);

create policy "Users can insert their own reels" on public.reels
  for insert with check (auth.uid() = user_id);

create policy "Users can delete their own reels" on public.reels
  for delete using (auth.uid() = user_id);

-- 3. LIKES table
create table if not exists public.likes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  reel_id uuid references public.reels(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  unique(user_id, reel_id)
);

alter table public.likes enable row level security;

create policy "Likes are publicly readable" on public.likes
  for select using (true);

create policy "Users can insert their own likes" on public.likes
  for insert with check (auth.uid() = user_id);

create policy "Users can delete their own likes" on public.likes
  for delete using (auth.uid() = user_id);

-- 4. COMMENTS table
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  reel_id uuid references public.reels(id) on delete cascade not null,
  text text not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table public.comments enable row level security;

create policy "Comments are publicly readable" on public.comments
  for select using (true);

create policy "Users can insert their own comments" on public.comments
  for insert with check (auth.uid() = user_id);

create policy "Users can delete their own comments" on public.comments
  for delete using (auth.uid() = user_id);

-- 5. FOLLOWS table
create table if not exists public.follows (
  id uuid primary key default gen_random_uuid(),
  follower_id uuid references public.profiles(id) on delete cascade not null,
  following_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  unique(follower_id, following_id)
);

alter table public.follows enable row level security;

create policy "Follows are publicly readable" on public.follows
  for select using (true);

create policy "Users can insert their own follows" on public.follows
  for insert with check (auth.uid() = follower_id);

create policy "Users can delete their own follows" on public.follows
  for delete using (auth.uid() = follower_id);

-- 6. NOTIFICATIONS table
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  actor_id uuid references public.profiles(id) on delete cascade not null,
  type text not null, -- 'like' | 'comment' | 'follow'
  reel_id uuid references public.reels(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  read boolean default false
);

alter table public.notifications enable row level security;

create policy "Users can read their notifications" on public.notifications
  for select using (auth.uid() = user_id);

create policy "Users can create notifications" on public.notifications
  for insert with check (auth.uid() = actor_id);

-- 7. Storage Bucket for videos
insert into storage.buckets (id, name, public) values ('reels', 'reels', true)
on conflict (id) do nothing;

create policy "Anyone can read reels bucket" on storage.objects
  for select using (bucket_id = 'reels');

create policy "Authenticated users can upload reels" on storage.objects
  for insert with check (bucket_id = 'reels' and auth.role() = 'authenticated');

-- 8. Storage Bucket for avatars
insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "Anyone can read avatars bucket" on storage.objects
  for select using (bucket_id = 'avatars');

create policy "Authenticated users can upload avatars" on storage.objects
  for insert with check (bucket_id = 'avatars' and auth.role() = 'authenticated');

-- 9. Auto-create profile on sign up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 10. RPC: increment_views (callable by anon — guests can count views)
create or replace function public.increment_views(reel_id uuid)
returns void as $$
  update public.reels set views_count = coalesce(views_count, 0) + 1 where id = reel_id;
$$ language sql security definer;

grant execute on function public.increment_views(uuid) to anon, authenticated;

-- 11. RPC: increment_likes
create or replace function public.increment_likes(reel_id uuid)
returns void as $$
  update public.reels set likes_count = coalesce(likes_count, 0) + 1 where id = reel_id;
$$ language sql security definer;

grant execute on function public.increment_likes(uuid) to authenticated;

-- 12. RPC: decrement_likes
create or replace function public.decrement_likes(reel_id uuid)
returns void as $$
  update public.reels set likes_count = greatest(0, coalesce(likes_count, 0) - 1) where id = reel_id;
$$ language sql security definer;

grant execute on function public.decrement_likes(uuid) to authenticated;

-- 13. RPC: increment_comments
create or replace function public.increment_comments(reel_id uuid)
returns void as $$
  update public.reels set comments_count = coalesce(comments_count, 0) + 1 where id = reel_id;
$$ language sql security definer;

grant execute on function public.increment_comments(uuid) to authenticated;

-- 14. RPC: increment_followers / decrement_followers
create or replace function public.increment_followers(target_user_id uuid)
returns void as $$
  update public.profiles set followers_count = coalesce(followers_count, 0) + 1 where id = target_user_id;
$$ language sql security definer;

create or replace function public.decrement_followers(target_user_id uuid)
returns void as $$
  update public.profiles set followers_count = greatest(0, coalesce(followers_count, 0) - 1) where id = target_user_id;
$$ language sql security definer;

grant execute on function public.increment_followers(uuid) to authenticated;
grant execute on function public.decrement_followers(uuid) to authenticated;

-- 15. RPC: increment_following / decrement_following
create or replace function public.increment_following(target_user_id uuid)
returns void as $$
  update public.profiles set following_count = coalesce(following_count, 0) + 1 where id = target_user_id;
$$ language sql security definer;

create or replace function public.decrement_following(target_user_id uuid)
returns void as $$
  update public.profiles set following_count = greatest(0, coalesce(following_count, 0) - 1) where id = target_user_id;
$$ language sql security definer;

grant execute on function public.increment_following(uuid) to authenticated;
grant execute on function public.decrement_following(uuid) to authenticated;
