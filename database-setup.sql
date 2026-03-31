-- ============================================
-- SUPABASE DATABASE SETUP
-- Run this SQL in your Supabase SQL Editor
-- ============================================

-- 1. Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  gender TEXT CHECK (gender IN ('male', 'female')),
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create test table (for your existing test API)
CREATE TABLE IF NOT EXISTS test (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE test ENABLE ROW LEVEL SECURITY;

-- 4. Create policies for users table
-- Users can read their own profile
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- Service role can do everything (for API routes)
-- This is handled by using SUPABASE_SERVICE_ROLE_KEY in server-side code

-- 5. Create policies for test table
-- Anyone can read test data
CREATE POLICY "Anyone can read test data"
  ON test FOR SELECT
  USING (true);

-- Authenticated users can insert test data
CREATE POLICY "Auth users can insert test data"
  ON test FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- 6. Create function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, name, email, gender, location)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'gender', ''),
    COALESCE(NEW.raw_user_meta_data->>'location', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Create trigger to automatically create user profile
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 8. Insert sample test data
INSERT INTO test (name, description) VALUES 
  ('Sample Item 1', 'This is a test item'),
  ('Sample Item 2', 'Another test item')
ON CONFLICT DO NOTHING;