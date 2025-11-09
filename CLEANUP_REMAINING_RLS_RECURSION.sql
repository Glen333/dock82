-- =====================================================
-- CLEANUP REMAINING RLS RECURSION POLICIES
-- =====================================================
-- This removes the remaining policies that query the users table
-- and replaces them with JWT-based policies
-- =====================================================

-- STEP 1: DROP RECURSIVE BOOKINGS POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Admins can delete all bookings" ON public.bookings;
DROP POLICY IF EXISTS "Admins can manage all bookings" ON public.bookings;
DROP POLICY IF EXISTS "Admins can read all bookings" ON public.bookings;
DROP POLICY IF EXISTS "Admins can update all bookings" ON public.bookings;

-- STEP 2: DROP RECURSIVE USERS POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Admins can insert profiles" ON public.users;
DROP POLICY IF EXISTS "Admins can read all profiles" ON public.users;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.users;

-- STEP 3: CREATE NON-RECURSIVE ADMIN POLICIES FOR BOOKINGS
-- =====================================================
-- Use JWT claims instead of querying users table

CREATE POLICY "bookings_admin_all_jwt" ON public.bookings
  FOR ALL TO authenticated
  USING (
    COALESCE((auth.jwt() ->> 'user_role')::text, '') = ANY(ARRAY['admin', 'superadmin'])
  )
  WITH CHECK (
    COALESCE((auth.jwt() ->> 'user_role')::text, '') = ANY(ARRAY['admin', 'superadmin'])
  );

-- STEP 4: CREATE NON-RECURSIVE ADMIN POLICIES FOR USERS
-- =====================================================
-- Use JWT claims instead of querying users table

CREATE POLICY "users_admin_select_jwt" ON public.users
  FOR SELECT TO authenticated
  USING (
    COALESCE((auth.jwt() ->> 'user_role')::text, '') = ANY(ARRAY['admin', 'superadmin'])
  );

CREATE POLICY "users_admin_update_jwt" ON public.users
  FOR UPDATE TO authenticated
  USING (
    COALESCE((auth.jwt() ->> 'user_role')::text, '') = ANY(ARRAY['admin', 'superadmin'])
  )
  WITH CHECK (true);

CREATE POLICY "users_admin_insert_jwt" ON public.users
  FOR INSERT TO authenticated
  WITH CHECK (
    COALESCE((auth.jwt() ->> 'user_role')::text, '') = ANY(ARRAY['admin', 'superadmin'])
  );

-- STEP 5: VERIFY POLICIES (should show no recursive queries)
-- =====================================================

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
  AND (
    qual LIKE '%FROM users%' OR 
    qual LIKE '%users.%' OR
    with_check LIKE '%FROM users%' OR
    with_check LIKE '%users.%'
  )
ORDER BY tablename, policyname;

-- If the above query returns any rows, those are still recursive policies
-- If it returns no rows, all recursive policies have been removed!

SELECT '✅ Cleanup complete! All recursive policies should be removed.' as status;

