-- Cupboard: Supabase database schema
-- Run this in the Supabase SQL Editor to set up all tables and RLS policies.

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- Users table
-- ============================================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT NOT NULL DEFAULT '',
  preferences JSONB NOT NULL DEFAULT '{"dietaryRestrictions":[],"cuisinePreferences":[]}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- ============================================================
-- Pantry items table
-- ============================================================
CREATE TABLE IF NOT EXISTS public.pantry_items (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  quantity NUMERIC NOT NULL DEFAULT 1,
  unit TEXT NOT NULL DEFAULT 'units',
  category TEXT NOT NULL DEFAULT 'Other',
  barcode TEXT,
  image_url TEXT,
  date_added TIMESTAMPTZ NOT NULL DEFAULT now(),
  expiry_date TIMESTAMPTZ
);

CREATE INDEX idx_pantry_items_user_id ON public.pantry_items(user_id);

ALTER TABLE public.pantry_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own pantry items"
  ON public.pantry_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own pantry items"
  ON public.pantry_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pantry items"
  ON public.pantry_items FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own pantry items"
  ON public.pantry_items FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- Recipes table
-- ============================================================
CREATE TABLE IF NOT EXISTS public.recipes (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  image_url TEXT,
  source TEXT NOT NULL DEFAULT 'manual',
  ingredients JSONB NOT NULL DEFAULT '[]',
  steps JSONB NOT NULL DEFAULT '[]',
  tags JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_favourite BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX idx_recipes_user_id ON public.recipes(user_id);

ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own recipes"
  ON public.recipes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own recipes"
  ON public.recipes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own recipes"
  ON public.recipes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own recipes"
  ON public.recipes FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- Enable Realtime for pantry and recipe tables
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.pantry_items;
ALTER PUBLICATION supabase_realtime ADD TABLE public.recipes;

-- ============================================================
-- Storage buckets (create via Supabase dashboard or API)
-- ============================================================
-- Bucket: recipe-images     (public read, authenticated write)
-- Bucket: pantry-images     (public read, authenticated write)
-- Bucket: scanned-documents (private, authenticated read/write)
