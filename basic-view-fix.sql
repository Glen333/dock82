-- Basic View Fix - Simple recreation without security property checks
-- This script just recreates the views to ensure they work properly

-- ========================================
-- STEP 1: Check what views currently exist
-- ========================================

-- List all views in the public schema
SELECT 
    schemaname,
    viewname
FROM pg_views 
WHERE schemaname = 'public'
ORDER BY viewname;

-- ========================================
-- STEP 2: Recreate available_slips view
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

-- ========================================
-- STEP 3: Recreate booking_summary view
-- ========================================

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

-- ========================================
-- STEP 4: Grant permissions
-- ========================================

-- Grant permissions on available_slips
GRANT SELECT ON public.available_slips TO authenticated, anon;

-- Grant permissions on booking_summary
GRANT SELECT ON public.booking_summary TO authenticated;

-- ========================================
-- STEP 5: Verify the views work
-- ========================================

-- Show all views after recreation
SELECT 
    schemaname,
    viewname,
    '✅ RECREATED' as status
FROM pg_views 
WHERE schemaname = 'public'
ORDER BY viewname;

-- Test the views
SELECT 'available_slips count:' as view_name, COUNT(*) as count FROM public.available_slips
UNION ALL
SELECT 'booking_summary count:' as view_name, COUNT(*) as count FROM public.booking_summary;

-- Show a sample of data from each view
SELECT 'available_slips sample:' as view_name, name, available FROM public.available_slips LIMIT 3
UNION ALL
SELECT 'booking_summary sample:' as view_name, guest_name, status FROM public.booking_summary LIMIT 3;




