-- ============================================================
-- UZHAVAN CONNECT (SIH2026 - SIH26033)
-- Production Supabase PostgreSQL Schema & Authentication Alignment
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE
-- Primary key directly references auth.users(id) to guarantee 1:1 credential alignment
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'FARMER' CHECK (role IN ('FARMER', 'RETAIL_BUYER', 'BULK_BUYER', 'FPO_AGGREGATOR', 'LOGISTICS', 'ADMIN')),
    email TEXT UNIQUE,
    phone TEXT,
    location TEXT,
    organization TEXT,
    village TEXT,
    district TEXT,
    state TEXT,
    farm_size_acres NUMERIC(10, 2),
    main_crops TEXT[],
    fpo_name TEXT,
    avatar TEXT DEFAULT '👨‍🌾',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index critical lookup columns
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- 2. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Select policy: User can view their own profile, or Admins can view any profile
CREATE POLICY "Users can view own profile or admins can view all"
    ON public.profiles
    FOR SELECT
    USING (
        auth.uid() = id
        OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'ADMIN'
    );

-- Update policy: User can update permitted fields on their own profile
-- Security check: users cannot modify their own authorization role directly
CREATE POLICY "Users can update permitted fields on own profile"
    ON public.profiles
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (
        auth.uid() = id
        AND role = (SELECT role FROM public.profiles WHERE id = auth.uid())
    );

-- Insert policy: User can insert profile matching their own auth uid
CREATE POLICY "Users can insert own profile matching auth id"
    ON public.profiles
    FOR INSERT
    WITH CHECK (auth.uid() = id);

-- 3. AUTOMATIC PROFILE PROVISIONING TRIGGER (auth.users -> public.profiles)
-- Ensures atomicity: when an auth account is registered, a matching profile row is generated automatically
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (
        id,
        name,
        email,
        phone,
        role,
        district,
        state,
        location,
        organization
    )
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'name', 'Registered Member'),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'phone', ''),
        COALESCE(NEW.raw_user_meta_data->>'role', 'FARMER'),
        COALESCE(NEW.raw_user_meta_data->>'district', ''),
        COALESCE(NEW.raw_user_meta_data->>'state', 'Tamil Nadu'),
        COALESCE(NEW.raw_user_meta_data->>'location', 'Tamil Nadu, India'),
        CASE
            WHEN COALESCE(NEW.raw_user_meta_data->>'role', 'FARMER') = 'FARMER' THEN 'Uzhavan Farmer Collective'
            WHEN COALESCE(NEW.raw_user_meta_data->>'role', 'FARMER') = 'BULK_BUYER' THEN 'Metro Agri Wholesale'
            WHEN COALESCE(NEW.raw_user_meta_data->>'role', 'FARMER') = 'FPO_AGGREGATOR' THEN 'GreenHarvest FPO'
            ELSE 'Uzhavan Connect Network'
        END
    )
    ON CONFLICT (id) DO UPDATE
    SET
        name = EXCLUDED.name,
        role = EXCLUDED.role,
        email = EXCLUDED.email,
        updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 4. FILES & DOCUMENTS TABLE (Idempotent Storage & Metadata)
-- Guarantees: 1 File = 1 Storage Object = 1 DB Record
-- ============================================================
CREATE TABLE IF NOT EXISTS public.files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    size BIGINT NOT NULL,
    mime_type TEXT NOT NULL,
    file_hash TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'GENERAL' CHECK (category IN ('INVOICE', 'QUALITY_CERT', 'PRODUCE_PASSPORT', 'SETTLEMENT_RECEIPT', 'CONTRACT', 'WAYBILL', 'GENERAL')),
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'ARCHIVED', 'DELETED')),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    -- Strict Idempotency Constraint: user cannot have duplicate records of identical content
    CONSTRAINT uq_user_file_hash UNIQUE (user_id, file_hash)
);

CREATE INDEX IF NOT EXISTS idx_files_user ON public.files(user_id);
CREATE INDEX IF NOT EXISTS idx_files_hash ON public.files(file_hash);
CREATE INDEX IF NOT EXISTS idx_files_category ON public.files(category);
CREATE INDEX IF NOT EXISTS idx_files_created ON public.files(created_at DESC);

-- Enable RLS on files
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own files or admins view all"
    ON public.files
    FOR SELECT
    USING (
        auth.uid() = user_id
        OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'ADMIN'
    );

CREATE POLICY "Users can insert own files"
    ON public.files
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own files"
    ON public.files
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own files"
    ON public.files
    FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================================
-- 5. FILE SEARCH INDEX TABLE (Idempotent Search Records)
-- Guarantees: 1 Document = Exactly 1 Search Record
-- ============================================================
CREATE TABLE IF NOT EXISTS public.file_search_index (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    file_id UUID NOT NULL REFERENCES public.files(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    searchable_text TEXT NOT NULL,
    category TEXT,
    indexed_at TIMESTAMPTZ DEFAULT NOW(),
    -- Strict 1:1 constraint ensuring no duplicate index records for the same file
    CONSTRAINT uq_index_file_id UNIQUE (file_id)
);

CREATE INDEX IF NOT EXISTS idx_search_user ON public.file_search_index(user_id);
CREATE INDEX IF NOT EXISTS idx_search_text ON public.file_search_index USING gin(to_tsvector('english', searchable_text));

-- Enable RLS on file_search_index
ALTER TABLE public.file_search_index ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can search own files or admins search all"
    ON public.file_search_index
    FOR SELECT
    USING (
        auth.uid() = user_id
        OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'ADMIN'
    );

