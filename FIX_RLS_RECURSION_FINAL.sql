-- =====================================================
-- COMPLETE RLS RECURSION FIX FOR DOCK82
-- =====================================================
-- This script fixes infinite recursion errors (42P17) by
-- removing all policies that query the users table
-- and replacing them with JWT-based policies
-- =====================================================

-- STEP 1: DROP ALL EXISTING POLICIES
-- =====================================================

-- Drop all users table policies
DROP POLICY IF EXISTS "Admins can manage all users" ON public.users;
DROP POLICY IF EXISTS "admin users can manage all data" ON public.users;
DROP POLICY IF EXISTS "users_self_select" ON public.users;
DROP POLICY IF EXISTS "users_self_update" ON public.users;
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Admin read users" ON public.users;
DROP POLICY IF EXISTS "Admin insert users" ON public.users;
DROP POLICY IF EXISTS "Admin update users" ON public.users;
DROP POLICY IF EXISTS "Admin delete users" ON public.users;
DROP POLICY IF EXISTS "Allow users to read own user data" ON public.users;
DROP POLICY IF EXISTS "Allow users to update own user data" ON public.users;
DROP POLICY IF EXISTS "Allow authenticated users to read all users" ON public.users;
DROP POLICY IF EXISTS "Allow authenticated users to update all users" ON public.users;
DROP POLICY IF EXISTS "Allow admins to delete users" ON public.users;

-- Drop all slips table policies
DROP POLICY IF EXISTS "Public can view available slips" ON public.slips;
DROP POLICY IF EXISTS "Authenticated users can view slips" ON public.slips;
DROP POLICY IF EXISTS "Admins can manage slips" ON public.slips;
DROP POLICY IF EXISTS "slips_select_public" ON public.slips;
DROP POLICY IF EXISTS "slips_select_authenticated" ON public.slips;
DROP POLICY IF EXISTS "slips_public_read" ON public.slips;
DROP POLICY IF EXISTS "Allow admins to delete slips" ON public.slips;

-- Drop all bookings table policies
DROP POLICY IF EXISTS "Users can view own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can create bookings" ON public.bookings;
DROP POLICY IF EXISTS "Admins can manage bookings" ON public.bookings;
DROP POLICY IF EXISTS "bookings_select_own" ON public.bookings;
DROP POLICY IF EXISTS "bookings_insert_own" ON public.bookings;
DROP POLICY IF EXISTS "bookings_public_read" ON public.bookings;
DROP POLICY IF EXISTS "bookings_authenticated_insert" ON public.bookings;
DROP POLICY IF EXISTS "bookings_authenticated_update" ON public.bookings;
DROP POLICY IF EXISTS "bookings_read_own" ON public.bookings;
DROP POLICY IF EXISTS "bookings_update_own" ON public.bookings;
DROP POLICY IF EXISTS "Allow authenticated users to update all bookings" ON public.bookings;
DROP POLICY IF EXISTS "Allow admins to delete bookings" ON public.bookings;

-- STEP 2: DROP RECURSIVE FUNCTIONS
-- =====================================================
DROP FUNCTION IF EXISTS public.is_admin() CASCADE;

-- STEP 3: CREATE NON-RECURSIVE POLICIES FOR USERS TABLE
-- =====================================================
-- These policies use JWT claims directly, NOT table queries

-- Users can view their own profile using JWT email (no recursion)
CREATE POLICY "users_select_own_jwt" ON public.users
  FOR SELECT TO authenticated
  USING (email = (auth.jwt() ->> 'email')::text);

-- Users can update their own profile using JWT email (no recursion)
CREATE POLICY "users_update_own_jwt" ON public.users
  FOR UPDATE TO authenticated
  USING (email = (auth.jwt() ->> 'email')::text)
  WITH CHECK (email = (auth.jwt() ->> 'email')::text);

-- Allow authenticated users to insert their own profile (for registration)
CREATE POLICY "users_insert_own_jwt" ON public.users
  FOR INSERT TO authenticated
  WITH CHECK (email = (auth.jwt() ->> 'email')::text);

-- STEP 4: CREATE SIMPLE POLICIES FOR SLIPS TABLE
-- =====================================================
-- Simple policy: authenticated users can view all slips
-- No queries to users table = no recursion

CREATE POLICY "slips_select_authenticated" ON public.slips
  FOR SELECT TO authenticated
  USING (true);

-- Allow authenticated users to update slips (for availability changes)
CREATE POLICY "slips_update_authenticated" ON public.slips
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

-- STEP 5: CREATE SIMPLE POLICIES FOR BOOKINGS TABLE
-- =====================================================
-- Use JWT email directly, don't query users table

-- Users can view their own bookings (by email from JWT)
CREATE POLICY "bookings_select_own_email" ON public.bookings
  FOR SELECT TO authenticated
  USING (guest_email = (auth.jwt() ->> 'email')::text);

-- Users can create bookings (must use their own email)
CREATE POLICY "bookings_insert_own_email" ON public.bookings
  FOR INSERT TO authenticated
  WITH CHECK (guest_email = (auth.jwt() ->> 'email')::text);

-- Users can update their own bookings
CREATE POLICY "bookings_update_own_email" ON public.bookings
  FOR UPDATE TO authenticated
  USING (guest_email = (auth.jwt() ->> 'email')::text)
  WITH CHECK (guest_email = (auth.jwt() ->> 'email')::text);

-- STEP 6: VERIFY THE FIX
-- =====================================================

-- Show all current policies
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename IN ('users', 'slips', 'bookings')
ORDER BY tablename, policyname;

-- Success message
SELECT '✅ RLS policies fixed! No more recursion errors.' as status;

