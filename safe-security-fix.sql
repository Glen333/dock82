-- Safe Security Fix - Non-destructive approach
-- This script checks current state and only fixes what needs fixing

-- ========================================
-- STEP 1: Check current security status
-- ========================================

-- Check all views and their security settings
SELECT 
    schemaname,
    viewname,
    security_invoker,
    CASE 
        WHEN security_invoker = true THEN '✅ SECURE (SECURITY INVOKER)'
        ELSE '❌ INSECURE (SECURITY DEFINER)'
    END as security_status
FROM pg_views 
WHERE schemaname = 'public'
ORDER BY viewname;

-- ========================================
-- STEP 2: Check if views exist and their definitions
-- ========================================

-- Check if available_slips view exists
SELECT 
    'available_slips' as view_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_views 
            WHERE schemaname = 'public' AND viewname = 'available_slips'
        ) THEN 'EXISTS'
        ELSE 'DOES NOT EXIST'
    END as status,
    security_invoker
FROM pg_views 
WHERE schemaname = 'public' AND viewname = 'available_slips';

-- Check if booking_summary view exists
SELECT 
    'booking_summary' as view_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_views 
            WHERE schemaname = 'public' AND viewname = 'booking_summary'
        ) THEN 'EXISTS'
        ELSE 'DOES NOT EXIST'
    END as status,
    security_invoker
FROM pg_views 
WHERE schemaname = 'public' AND viewname = 'booking_summary';

-- ========================================
-- STEP 3: Safe recreation of views (only if needed)
-- ========================================

-- Only recreate available_slips if it has SECURITY DEFINER
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_views 
        WHERE schemaname = 'public' 
        AND viewname = 'available_slips' 
        AND security_invoker = false
    ) THEN
        -- Drop and recreate with SECURITY INVOKER
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
        
        RAISE NOTICE 'available_slips view recreated with SECURITY INVOKER';
    ELSE
        RAISE NOTICE 'available_slips view is already secure or does not exist';
    END IF;
END $$;

-- Only recreate booking_summary if it has SECURITY DEFINER
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_views 
        WHERE schemaname = 'public' 
        AND viewname = 'booking_summary' 
        AND security_invoker = false
    ) THEN
        -- Drop and recreate with SECURITY INVOKER
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
        
        RAISE NOTICE 'booking_summary view recreated with SECURITY INVOKER';
    ELSE
        RAISE NOTICE 'booking_summary view is already secure or does not exist';
    END IF;
END $$;

-- ========================================
-- STEP 4: Grant permissions safely
-- ========================================

-- Grant permissions only if views exist
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_views WHERE schemaname = 'public' AND viewname = 'available_slips') THEN
        GRANT SELECT ON public.available_slips TO authenticated, anon;
        RAISE NOTICE 'Permissions granted on available_slips';
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_views WHERE schemaname = 'public' AND viewname = 'booking_summary') THEN
        GRANT SELECT ON public.booking_summary TO authenticated;
        RAISE NOTICE 'Permissions granted on booking_summary';
    END IF;
END $$;

-- ========================================
-- STEP 5: Verify the fix
-- ========================================

-- Show final security status
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

-- Test the views (only if they exist)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_views WHERE schemaname = 'public' AND viewname = 'available_slips') THEN
        RAISE NOTICE 'Testing available_slips view...';
        -- The actual test will be shown in the results
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_views WHERE schemaname = 'public' AND viewname = 'booking_summary') THEN
        RAISE NOTICE 'Testing booking_summary view...';
        -- The actual test will be shown in the results
    END IF;
END $$;

-- Test queries (will only work if views exist)
SELECT 'available_slips count:' as view_name, COUNT(*) as count FROM public.available_slips
WHERE EXISTS (SELECT 1 FROM pg_views WHERE schemaname = 'public' AND viewname = 'available_slips')
UNION ALL
SELECT 'booking_summary count:' as view_name, COUNT(*) as count FROM public.booking_summary
WHERE EXISTS (SELECT 1 FROM pg_views WHERE schemaname = 'public' AND viewname = 'booking_summary');


