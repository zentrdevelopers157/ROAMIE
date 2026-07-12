-- ============================================
-- ROAMIE Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. PROFILES
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.id ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  adventure_level INTEGER NOT NULL DEFAULT 5,
  social_level INTEGER NOT NULL DEFAULT 6,
  selected_vibes INTEGER[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- 2. TRIPS
CREATE TABLE trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  destination TEXT NOT NULL,
  preferences TEXT[] NOT NULL DEFAULT '{}',
  liked_moods INTEGER[] NOT NULL DEFAULT '{}',
  itinerary JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE trips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own trips"
  ON trips FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own trips"
  ON trips FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own trips"
  ON trips FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own trips"
  ON trips FOR DELETE
  USING (auth.uid() = user_id);

-- 3. COMMUNITY POSTS
CREATE TABLE community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  user_avatar TEXT NOT NULL DEFAULT '',
  location TEXT NOT NULL DEFAULT '',
  image_url TEXT NOT NULL,
  caption TEXT NOT NULL DEFAULT '',
  tags TEXT NOT NULL DEFAULT '',
  likes_count INTEGER NOT NULL DEFAULT 0,
  comments_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view community posts"
  ON community_posts FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create posts"
  ON community_posts FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own posts"
  ON community_posts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts"
  ON community_posts FOR DELETE
  USING (auth.uid() = user_id);

-- 4. POST LIKES
CREATE TABLE post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view likes"
  ON post_likes FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can like"
  ON post_likes FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can unlike their own likes"
  ON post_likes FOR DELETE
  USING (auth.uid() = user_id);

-- 5. AUTO-UPDATE TRIGGERS
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_trips_updated_at
  BEFORE UPDATE ON trips
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- 6. INCREMENT LIKE COUNT TRIGGER
CREATE OR REPLACE FUNCTION increment_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE community_posts
  SET likes_count = likes_count + 1
  WHERE id = NEW.post_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION decrement_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE community_posts
  SET likes_count = GREATEST(0, likes_count - 1)
  WHERE id = OLD.post_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_like_added
  AFTER INSERT ON post_likes
  FOR EACH ROW
  EXECUTE FUNCTION increment_likes_count();

CREATE TRIGGER on_like_removed
  AFTER DELETE ON post_likes
  FOR EACH ROW
  EXECUTE FUNCTION decrement_likes_count();
