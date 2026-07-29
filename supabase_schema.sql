-- =======================================================
-- RAMAILO REELS - SUPABASE FREE TIER DATABASE SCHEMA
-- Copy and Paste this SQL into your Supabase SQL Editor
-- =======================================================

-- 1. Create Reels Table
CREATE TABLE IF NOT EXISTS public.reels (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    video_url TEXT NOT NULL,
    thumbnail_url TEXT,
    user_name TEXT NOT NULL,
    user_handle TEXT NOT NULL,
    user_avatar TEXT,
    caption TEXT,
    hashtags TEXT[],
    song TEXT,
    likes_count INT DEFAULT 0,
    comments_count INT DEFAULT 0,
    shares_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Comments Table
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    reel_id UUID REFERENCES public.reels(id) ON DELETE CASCADE,
    user_handle TEXT NOT NULL,
    user_avatar TEXT,
    comment_text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create Likes Table
CREATE TABLE IF NOT EXISTS public.likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    reel_id UUID REFERENCES public.reels(id) ON DELETE CASCADE,
    user_handle TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(reel_id, user_handle)
);

-- 4. Enable Row Level Security (RLS) & Grant Public Access for Testing
ALTER TABLE public.reels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on reels" ON public.reels FOR SELECT USING (true);
CREATE POLICY "Allow public insert on reels" ON public.reels FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on reels" ON public.reels FOR UPDATE USING (true);

CREATE POLICY "Allow public read access on comments" ON public.comments FOR SELECT USING (true);
CREATE POLICY "Allow public insert on comments" ON public.comments FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access on likes" ON public.likes FOR SELECT USING (true);
CREATE POLICY "Allow public insert on likes" ON public.likes FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public delete on likes" ON public.likes FOR DELETE USING (true);

-- 5. Storage Bucket Policy for Video Files
-- Go to Supabase Dashboard -> Storage -> New Bucket -> Name it "reels-videos" -> Toggle "Public" to ON.
