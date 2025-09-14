-- Comprehensive Security Setup for Dock Rental Platform
-- Run this in your Supabase SQL Editor

-- 1. Enable Row Level Security (RLS) on all tables
ALTER TABLE public.slips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 2. Create RLS policies for slips table
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

-- 3. Create RLS policies for bookings table
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

-- 4. Create RLS policies for users table
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

-- 5. Grant appropriate permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.slips TO anon, authenticated;
GRANT ALL ON public.bookings TO anon, authenticated;
GRANT ALL ON public.users TO anon, authenticated;

-- 6. Create secure function for admin operations
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

-- 7. Create admin-only policies
CREATE POLICY "Allow admins to delete slips" ON public.slips
    FOR DELETE TO authenticated USING (public.is_admin());

CREATE POLICY "Allow admins to delete bookings" ON public.bookings
    FOR DELETE TO authenticated USING (public.is_admin());

CREATE POLICY "Allow admins to delete users" ON public.users
    FOR DELETE TO authenticated USING (public.is_admin());

-- 8. Verify security setup
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('slips', 'bookings', 'users');

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
WHERE schemaname = 'public';


