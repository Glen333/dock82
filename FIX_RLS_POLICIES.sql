-- Fix RLS infinite recursion errors for users and slips tables
-- Error: 42P17 - infinite recursion detected in policy for relation "users"
-- This happens when RLS policies query the same table they're protecting

-- =====================================================
-- STEP 1: DROP ALL EXISTING POLICIES ON USERS TABLE
-- =====================================================

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

-- =====================================================
-- STEP 2: CREATE NON-RECURSIVE POLICIES FOR USERS
-- =====================================================

-- Allow authenticated users to read their own profile (using auth.uid() from JWT)
CREATE POLICY "users_select_own" ON public.users
  FOR SELECT TO authenticated
  USING (email = (auth.jwt() ->> 'email')::text);

-- Allow authenticated users to update their own profile
CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE TO authenticated
  USING (email = (auth.jwt() ->> 'email')::text)
  WITH CHECK (email = (auth.jwt() ->> 'email')::text);

-- Allow service role (backend) to do everything (bypasses RLS)
-- This is handled automatically by service role key, but we ensure no blocking policies

-- =====================================================
-- STEP 3: FIX SLIPS TABLE RLS POLICIES
-- =====================================================

-- Drop existing policies that might query users table
DROP POLICY IF EXISTS "Public can view available slips" ON public.slips;
DROP POLICY IF EXISTS "Authenticated users can view slips" ON public.slips;
DROP POLICY IF EXISTS "Admins can manage slips" ON public.slips;
DROP POLICY IF EXISTS "slips_select_public" ON public.slips;
DROP POLICY IF EXISTS "slips_select_authenticated" ON public.slips;

-- Create simple policy: authenticated users can view all slips
-- This doesn't query users table, avoiding recursion
CREATE POLICY "slips_select_authenticated" ON public.slips
  FOR SELECT TO authenticated
  USING (true);  -- Simple check, no recursion

-- Allow service role to manage slips (for admin operations)
-- Service role bypasses RLS automatically

-- =====================================================
-- STEP 4: FIX BOOKINGS TABLE RLS POLICIES
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can create bookings" ON public.bookings;
DROP POLICY IF EXISTS "Admins can manage bookings" ON public.bookings;

-- Create simple policies without recursion
CREATE POLICY "bookings_select_own" ON public.bookings
  FOR SELECT TO authenticated
  USING (guest_email = (auth.jwt() ->> 'email')::text);

CREATE POLICY "bookings_insert_own" ON public.bookings
  FOR INSERT TO authenticated
  WITH CHECK (guest_email = (auth.jwt() ->> 'email')::text);

-- Allow service role to manage all bookings (for admin operations)

-- =====================================================
-- VERIFY POLICIES
-- =====================================================

-- Check existing policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename IN ('users', 'slips', 'bookings')
ORDER BY tablename, policyname;

