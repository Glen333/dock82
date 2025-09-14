-- Comprehensive Security Setup for Dock Rental Platform
-- This script fixes all SECURITY DEFINER issues and sets up proper RLS

-- ========================================
-- STEP 1: Fix all SECURITY DEFINER views
-- ========================================

-- Drop and recreate available_slips view
DROP VIEW IF EXISTS public.available_slips;

CREATE VIEW public.available_slips AS
SELECT 
    id,
    name,
    max_length,
    width,
    depth,
    price_per_night,
    amenities,
    description,
    dock_etiquette,
    available,
    images,
    location_data,
    maintenance_notes,
    seasonal_pricing,
    created_at,
    updated_at
FROM public.slips
WHERE available = true;

-- Drop and recreate booking_summary view
DROP VIEW IF EXISTS public.booking_summary;

CREATE VIEW public.booking_summary AS
SELECT 
    b.id,
    b.guest_name,
    b.guest_email,
    b.guest_phone,
    b.slip_name,
    b.check_in,
    b.check_out,
    b.status,
    b.user_type,
    b.boat_length,
    b.total_price,
    b.created_at,
    b.updated_at,
    s.max_length,
    s.width,
    s.depth,
    s.price_per_night,
    s.amenities,
    s.description
FROM public.bookings b
LEFT JOIN public.slips s ON b.slip_name = s.name;

-- Grant permissions on views
GRANT SELECT ON public.available_slips TO authenticated, anon;
GRANT SELECT ON public.booking_summary TO authenticated;

-- ========================================
-- STEP 2: Enable Row Level Security
-- ========================================

ALTER TABLE public.slips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- ========================================
-- STEP 3: Create RLS Policies for Slips
-- ========================================

-- Allow public read access to available slips
CREATE POLICY "Allow public read access to available slips" ON public.slips
    FOR SELECT USING (available = true);

-- Allow authenticated users to read all slips (for admin panel)
CREATE POLICY "Allow authenticated users to read all slips" ON public.slips
    FOR SELECT TO authenticated USING (true);

-- Allow authenticated users to update slips (for admin functions)
CREATE POLICY "Allow authenticated users to update slips" ON public.slips
    FOR UPDATE TO authenticated USING (true);

-- Allow authenticated users to insert slips (for admin functions)
CREATE POLICY "Allow authenticated users to insert slips" ON public.slips
    FOR INSERT TO authenticated WITH CHECK (true);

-- ========================================
-- STEP 4: Create RLS Policies for Bookings
-- ========================================

-- Allow users to read their own bookings
CREATE POLICY "Allow users to read own bookings" ON public.bookings
    FOR SELECT USING (auth.email() = guest_email);

-- Allow users to create bookings
CREATE POLICY "Allow users to create bookings" ON public.bookings
    FOR INSERT WITH CHECK (auth.email() = guest_email);

-- Allow users to update their own bookings
CREATE POLICY "Allow users to update own bookings" ON public.bookings
    FOR UPDATE USING (auth.email() = guest_email);

-- Allow authenticated users to read all bookings (for admin panel)
CREATE POLICY "Allow authenticated users to read all bookings" ON public.bookings
    FOR SELECT TO authenticated USING (true);

-- Allow authenticated users to update all bookings (for admin functions)
CREATE POLICY "Allow authenticated users to update all bookings" ON public.bookings
    FOR UPDATE TO authenticated USING (true);

-- ========================================
-- STEP 5: Create RLS Policies for Users
-- ========================================

-- Allow users to read their own user data
CREATE POLICY "Allow users to read own user data" ON public.users
    FOR SELECT USING (auth.email() = email);

-- Allow users to update their own user data
CREATE POLICY "Allow users to update own user data" ON public.users
    FOR UPDATE USING (auth.email() = email);

-- Allow authenticated users to read all users (for admin panel)
CREATE POLICY "Allow authenticated users to read all users" ON public.users
    FOR SELECT TO authenticated USING (true);

-- Allow authenticated users to update all users (for admin functions)
CREATE POLICY "Allow authenticated users to update all users" ON public.users
    FOR UPDATE TO authenticated USING (true);

-- ========================================
-- STEP 6: Create Admin Function
-- ========================================

-- Create secure function for admin operations
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.users 
        WHERE email = auth.email() 
        AND user_type = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- STEP 7: Create Admin-Only Policies
-- ========================================

-- Allow admins to delete slips
CREATE POLICY "Allow admins to delete slips" ON public.slips
    FOR DELETE TO authenticated USING (public.is_admin());

-- Allow admins to delete bookings
CREATE POLICY "Allow admins to delete bookings" ON public.bookings
    FOR DELETE TO authenticated USING (public.is_admin());

-- Allow admins to delete users
CREATE POLICY "Allow admins to delete users" ON public.users
    FOR DELETE TO authenticated USING (public.is_admin());

-- ========================================
-- STEP 8: Grant Schema Permissions
-- ========================================

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.slips TO anon, authenticated;
GRANT ALL ON public.bookings TO anon, authenticated;
GRANT ALL ON public.users TO anon, authenticated;

-- ========================================
-- STEP 9: Verify Security Setup
-- ========================================

-- Check RLS status
SELECT 
    schemaname,
    tablename,
    rowsecurity,
    CASE 
        WHEN rowsecurity = true THEN '✅ RLS ENABLED'
        ELSE '❌ RLS DISABLED'
    END as rls_status
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('slips', 'bookings', 'users')
ORDER BY tablename;

-- Check view security
SELECT 
    schemaname,
    viewname,
    security_invoker,
    CASE 
        WHEN security_invoker = true THEN '✅ SECURE'
        ELSE '❌ INSECURE - SECURITY DEFINER'
    END as security_status
FROM pg_views 
WHERE schemaname = 'public'
ORDER BY viewname;

-- Show all policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Test the views
SELECT 'available_slips count:' as view_name, COUNT(*) as count FROM public.available_slips
UNION ALL
SELECT 'booking_summary count:' as view_name, COUNT(*) as count FROM public.booking_summary;


