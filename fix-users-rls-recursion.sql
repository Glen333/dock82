-- Fix for infinite recursion in users table RLS policies
-- Error: 42P17 - infinite recursion detected in policy for relation "users"
-- Cause: Users policies querying the users table itself

-- =====================================================
-- STEP 1: DROP PROBLEMATIC RECURSIVE POLICIES
-- =====================================================

-- Drop the recursive admin policy that queries users table
DROP POLICY IF EXISTS "Admins can manage all users" ON public.users;

-- Drop any other potentially recursive policies
DROP POLICY IF EXISTS "admin users can manage all data" ON public.users;
DROP POLICY IF EXISTS "users_self_select" ON public.users;
DROP POLICY IF EXISTS "users_self_update" ON public.users;

-- =====================================================
-- STEP 2: CREATE NON-RECURSIVE JWT-BASED POLICIES
-- =====================================================

-- Admin policies using JWT claims (non-recursive)
CREATE POLICY "Admin read users" ON public.users 
  FOR SELECT TO authenticated 
  USING ((auth.jwt() ->> 'user_role') = ANY(ARRAY['admin','superadmin']));

CREATE POLICY "Admin insert users" ON public.users 
  FOR INSERT TO authenticated 
  WITH CHECK ((auth.jwt() ->> 'user_role') = ANY(ARRAY['admin','superadmin']));

CREATE POLICY "Admin update users" ON public.users 
  FOR UPDATE TO authenticated 
  USING ((auth.jwt() ->> 'user_role') = ANY(ARRAY['admin','superadmin']))
  WITH CHECK ((auth.jwt() ->> 'user_role') = ANY(ARRAY['admin','superadmin']));

CREATE POLICY "Admin delete users" ON public.users 
  FOR DELETE TO authenticated 
  USING ((auth.jwt() ->> 'user_role') = ANY(ARRAY['admin','superadmin']));

-- =====================================================
-- STEP 3: CREATE USER SELF-MANAGEMENT POLICIES
-- =====================================================

-- Users can view their own profile (using auth.uid() directly)
CREATE POLICY "Users can view own profile" ON public.users 
  FOR SELECT TO authenticated 
  USING (auth.uid()::text = auth_user_id::text);

-- Users can update their own profile (non-recursive)
CREATE POLICY "Users can update own profile" ON public.users 
  FOR UPDATE TO authenticated 
  USING (auth.uid()::text = auth_user_id::text)
  WITH CHECK (auth.uid()::text = auth_user_id::text);

-- =====================================================
-- STEP 4: FIX OTHER TABLE POLICIES (if needed)
-- =====================================================

-- Ensure slips table has simple public read policy
DROP POLICY IF EXISTS "slips_public_read" ON public.slips;
CREATE POLICY "slips_public_read" ON public.slips 
  FOR SELECT USING (true);

-- Fix bookings policies to avoid recursion
DROP POLICY IF EXISTS "bookings_read_own" ON public.bookings;
DROP POLICY IF EXISTS "bookings_update_own" ON public.bookings;

-- Simple bookings policies (non-recursive)
CREATE POLICY "bookings_public_read" ON public.bookings 
  FOR SELECT USING (true);

CREATE POLICY "bookings_authenticated_insert" ON public.bookings 
  FOR INSERT TO authenticated 
  WITH CHECK (true);

CREATE POLICY "bookings_authenticated_update" ON public.bookings 
  FOR UPDATE TO authenticated 
  USING (renter_auth_id = auth.uid())
  WITH CHECK (renter_auth_id = auth.uid());

-- =====================================================
-- STEP 5: VERIFY THE FIX
-- =====================================================

-- Test that we can access tables without recursion
SELECT 'Testing slips access...' as test;
SELECT COUNT(*) as slip_count FROM slips;

SELECT 'Testing users access...' as test;
SELECT COUNT(*) as user_count FROM users;

SELECT 'Testing bookings access...' as test;
SELECT COUNT(*) as booking_count FROM bookings;

-- =====================================================
-- STEP 6: SHOW CURRENT POLICIES (for verification)
-- =====================================================

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
  AND tablename IN ('users', 'slips', 'bookings')
ORDER BY tablename, policyname;
