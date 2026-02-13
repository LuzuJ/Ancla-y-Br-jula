-- ==========================================
-- ANCLA Y BRÚJULA - SUPABASE SCHEMA
-- ==========================================
-- Execute this SQL in Supabase SQL Editor
-- ==========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============= USERS TABLE =============
-- (Already managed by Supabase Auth)
-- We'll use auth.users table

-- ============= USER PROFILES =============
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    daily_check_in_streak INTEGER DEFAULT 0,
    favorite_exercises TEXT[] DEFAULT '{}',
    preferences JSONB DEFAULT '{"notifications": true, "darkMode": true, "soundEnabled": true}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============= JOURNAL ENTRIES =============
CREATE TABLE IF NOT EXISTS public.journal_entries (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    date TEXT NOT NULL,
    emotion TEXT NOT NULL CHECK (emotion IN ('calm', 'happy', 'anxious', 'sad', 'angry', 'mixed')),
    intensity INTEGER CHECK (intensity >= 1 AND intensity <= 5),
    type TEXT NOT NULL CHECK (type IN ('text', 'voice', 'challenge')),
    content TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_journal_user_date ON public.journal_entries(user_id, date DESC);

-- ============= VAULT ENTRIES (AUTOESTIMA) =============
CREATE TABLE IF NOT EXISTS public.vault_entries (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    evidence TEXT NOT NULL,
    date TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('achievement', 'compliment', 'overcoming', 'skill')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_vault_user ON public.vault_entries(user_id, created_at DESC);

-- ============= CHAT MESSAGES (TCC HISTORY) =============
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    trigger TEXT CHECK (trigger IN ('VAULT', 'PANIC_MODE', 'EMERGENCY_CONTACT')),
    distortions TEXT[] DEFAULT '{}'
);

CREATE INDEX idx_chat_user_time ON public.chat_messages(user_id, timestamp ASC);

-- ============= DAILY CONTENT =============
CREATE TABLE IF NOT EXISTS public.daily_content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date TEXT UNIQUE NOT NULL,
    quote TEXT NOT NULL,
    author TEXT NOT NULL,
    micro_action TEXT NOT NULL,
    curated_songs JSONB DEFAULT '[]',
    curated_art JSONB DEFAULT '[]',
    poem JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_content_date ON public.daily_content(date DESC);

-- ============= ROW LEVEL SECURITY (RLS) =============
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vault_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_content ENABLE ROW LEVEL SECURITY;

-- User Profiles Policies
CREATE POLICY "Users can view own profile"
    ON public.user_profiles FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
    ON public.user_profiles FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
    ON public.user_profiles FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Journal Entries Policies
CREATE POLICY "Users can view own journal entries"
    ON public.journal_entries FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own journal entries"
    ON public.journal_entries FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own journal entries"
    ON public.journal_entries FOR DELETE
    USING (auth.uid() = user_id);

-- Vault Entries Policies
CREATE POLICY "Users can view own vault entries"
    ON public.vault_entries FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own vault entries"
    ON public.vault_entries FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own vault entries"
    ON public.vault_entries FOR DELETE
    USING (auth.uid() = user_id);

-- Chat Messages Policies
CREATE POLICY "Users can view own chat messages"
    ON public.chat_messages FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own chat messages"
    ON public.chat_messages FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own chat messages"
    ON public.chat_messages FOR DELETE
    USING (auth.uid() = user_id);

-- Daily Content Policies (Everyone can read, only service can write)
CREATE POLICY "Anyone can view daily content"
    ON public.daily_content FOR SELECT
    TO authenticated
    USING (true);

-- ============= FUNCTIONS =============
-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- SETUP COMPLETE
-- ==========================================
-- Next steps:
-- 1. Copy your Supabase URL and Anon Key
-- 2. Add them to your .env file
-- 3. Run: npm install in /app folder
-- 4. Run: npm run dev
-- ==========================================
