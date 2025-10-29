-- Fix RLS policies to allow anonymous booking creation
-- Run this in your Supabase SQL Editor

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "authenticated users can insert bookings" ON bookings;
DROP POLICY IF EXISTS "Allow users to create bookings" ON bookings;
DROP POLICY IF EXISTS "bookings_insert_self" ON bookings;

-- Create new policy that allows anonymous users to create bookings
CREATE POLICY "Allow anonymous booking creation" ON bookings
    FOR INSERT TO anon WITH CHECK (true);

-- Also allow authenticated users to create bookings
CREATE POLICY "Allow authenticated booking creation" ON bookings
    FOR INSERT TO authenticated WITH CHECK (true);

-- Keep read policies for users to see their own bookings
CREATE POLICY "Allow users to read own bookings" ON bookings
    FOR SELECT USING (auth.email() = guest_email OR auth.uid()::text = user_id::text);

-- Allow users to update their own bookings
CREATE POLICY "Allow users to update own bookings" ON bookings
    FOR UPDATE USING (auth.email() = guest_email OR auth.uid()::text = user_id::text);

-- Allow public read access to bookings (for admin panels, etc.)
CREATE POLICY "Allow public read bookings" ON bookings
    FOR SELECT TO anon USING (true);

-- Show current policies
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
WHERE tablename = 'bookings'
ORDER BY policyname;
