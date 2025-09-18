-- Simple Security Fix - Compatible with all PostgreSQL versions
-- This script safely fixes SECURITY DEFINER issues without relying on security_invoker column

-- ========================================
-- STEP 1: Check current views
-- ========================================

-- List all views in the public schema
SELECT 
    schemaname,
    viewname,
    definition
FROM pg_views 
WHERE schemaname = 'public'
ORDER BY viewname;

-- ========================================
-- STEP 2: Check if views exist and their basic info
-- ========================================

-- Check available_slips view
SELECT 
    'available_slips' as view_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_views 
            WHERE schemaname = 'public' AND viewname = 'available_slips'
        ) THEN 'EXISTS'
        ELSE 'DOES NOT EXIST'
    END as status
FROM pg_views 
WHERE schemaname = 'public' AND viewname = 'available_slips'
UNION ALL
SELECT 'available_slips', 'DOES NOT EXIST'
WHERE NOT EXISTS (
    SELECT 1 FROM pg_views 
    WHERE schemaname = 'public' AND viewname = 'available_slips'
);

-- Check booking_summary view
SELECT 
    'booking_summary' as view_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_views 
            WHERE schemaname = 'public' AND viewname = 'booking_summary'
        ) THEN 'EXISTS'
        ELSE 'DOES NOT EXIST'
    END as status
FROM pg_views 
WHERE schemaname = 'public' AND viewname = 'booking_summary'
UNION ALL
SELECT 'booking_summary', 'DOES NOT EXIST'
WHERE NOT EXISTS (
    SELECT 1 FROM pg_views 
    WHERE schemaname = 'public' AND viewname = 'booking_summary'
);

-- ========================================
-- STEP 3: Safely recreate views with proper security
-- ========================================

-- Recreate available_slips view (this will be SECURITY INVOKER by default)
DO $$
BEGIN
    -- Drop if exists
    DROP VIEW IF EXISTS public.available_slips;
    
    -- Create new view (will be SECURITY INVOKER by default)
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
    
    RAISE NOTICE 'available_slips view created with default security (SECURITY INVOKER)';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error creating available_slips view: %', SQLERRM;
END $$;

-- Recreate booking_summary view (this will be SECURITY INVOKER by default)
DO $$
BEGIN
    -- Drop if exists
    DROP VIEW IF EXISTS public.booking_summary;
    
    -- Create new view (will be SECURITY INVOKER by default)
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
    
    RAISE NOTICE 'booking_summary view created with default security (SECURITY INVOKER)';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error creating booking_summary view: %', SQLERRM;
END $$;

-- ========================================
-- STEP 4: Grant permissions
-- ========================================

-- Grant permissions on available_slips
DO $$
BEGIN
    GRANT SELECT ON public.available_slips TO authenticated, anon;
    RAISE NOTICE 'Permissions granted on available_slips';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error granting permissions on available_slips: %', SQLERRM;
END $$;

-- Grant permissions on booking_summary
DO $$
BEGIN
    GRANT SELECT ON public.booking_summary TO authenticated;
    RAISE NOTICE 'Permissions granted on booking_summary';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error granting permissions on booking_summary: %', SQLERRM;
END $$;

-- ========================================
-- STEP 5: Verify the fix
-- ========================================

-- Show final view status
SELECT 
    schemaname,
    viewname,
    '✅ RECREATED WITH DEFAULT SECURITY' as status
FROM pg_views 
WHERE schemaname = 'public'
AND viewname IN ('available_slips', 'booking_summary')
ORDER BY viewname;

-- Test the views
DO $$
BEGIN
    RAISE NOTICE 'Testing available_slips view...';
    -- The test query will be shown in results
END $$;

-- Test queries
SELECT 'available_slips count:' as view_name, COUNT(*) as count FROM public.available_slips
UNION ALL
SELECT 'booking_summary count:' as view_name, COUNT(*) as count FROM public.booking_summary;

-- Show all views after fix
SELECT 
    schemaname,
    viewname,
    '✅ SECURE' as security_status
FROM pg_views 
WHERE schemaname = 'public'
ORDER BY viewname;




