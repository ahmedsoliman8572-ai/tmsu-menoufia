-- ============================================================
-- 🏛️ اتحاد طلاب تحيا مصر - محافظة المنوفية
-- Complete Database Schema for News, Events, Join Us & Contact Us
-- ============================================================

-- 1. Create News Table
CREATE TABLE IF NOT EXISTS public.news (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title_ar TEXT NOT NULL,
    title_en TEXT,
    content_ar TEXT NOT NULL,
    content_en TEXT,
    category TEXT DEFAULT 'أخبار',
    image_url TEXT,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Events Table
CREATE TABLE IF NOT EXISTS public.events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title_ar TEXT NOT NULL,
    title_en TEXT,
    description_ar TEXT NOT NULL,
    description_en TEXT,
    event_date DATE NOT NULL,
    location_ar TEXT DEFAULT 'المنوفية',
    location_en TEXT DEFAULT 'Menoufia',
    category TEXT DEFAULT 'مبادرات مجتمعية',
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create Join Applications Table (طلبات الانضمام)
CREATE TABLE IF NOT EXISTS public.join_applications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    full_name TEXT NOT NULL,
    national_id TEXT,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    university TEXT,
    faculty TEXT,
    committee TEXT NOT NULL,
    notes TEXT,
    status TEXT DEFAULT 'جديد',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Create Contact Messages Table (رسائل تواصل معنا)
CREATE TABLE IF NOT EXISTS public.contact_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    subject TEXT,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'غير مقروء',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Create Board Members Table
CREATE TABLE IF NOT EXISTS public.board_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    title TEXT NOT NULL,
    role_level INTEGER DEFAULT 1,
    committee TEXT DEFAULT 'القيادة العامة',
    image_url TEXT,
    phone TEXT,
    linkedin_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Create Top Members Table (لوحة الشرف)
CREATE TABLE IF NOT EXISTS public.top_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    committee TEXT NOT NULL,
    title_or_role TEXT,
    month_year TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Enable Row Level Security (RLS) & Open Access Policies
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.join_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.board_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.top_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow All Operations News" ON public.news;
DROP POLICY IF EXISTS "Allow All Operations Events" ON public.events;
DROP POLICY IF EXISTS "Allow All Operations Join" ON public.join_applications;
DROP POLICY IF EXISTS "Allow All Operations Contact" ON public.contact_messages;
DROP POLICY IF EXISTS "Allow All Operations Board" ON public.board_members;
DROP POLICY IF EXISTS "Allow All Operations Top" ON public.top_members;

CREATE POLICY "Allow All Operations News" ON public.news FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All Operations Events" ON public.events FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All Operations Join" ON public.join_applications FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All Operations Contact" ON public.contact_messages FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All Operations Board" ON public.board_members FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All Operations Top" ON public.top_members FOR ALL USING (true) WITH CHECK (true);

-- 8. Create Storage Bucket (If not exists)
INSERT INTO storage.buckets (id, name, public) VALUES ('public-images', 'public-images', true) ON CONFLICT (id) DO NOTHING;
DROP POLICY IF EXISTS "Public Storage Select" ON storage.objects;
DROP POLICY IF EXISTS "Public Storage Insert" ON storage.objects;
DROP POLICY IF EXISTS "Public Storage Update" ON storage.objects;
DROP POLICY IF EXISTS "Public Storage Delete" ON storage.objects;
CREATE POLICY "Public Storage Select" ON storage.objects FOR SELECT USING (bucket_id = 'public-images');
CREATE POLICY "Public Storage Insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'public-images');
CREATE POLICY "Public Storage Update" ON storage.objects FOR UPDATE USING (bucket_id = 'public-images');
CREATE POLICY "Public Storage Delete" ON storage.objects FOR DELETE USING (bucket_id = 'public-images');
