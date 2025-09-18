-- Fix ALL SECURITY DEFINER issues in the database
-- This script should be run in your Supabase SQL Editor

-- First, let's see ALL views with SECURITY DEFINER
SELECT 
    schemaname,
    viewname,
    security_invoker,
    definition
FROM pg_views 
WHERE schemaname = 'public' 
AND security_invoker = false;

-- Fix available_slips view
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

-- Fix booking_summary view
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

-- Grant appropriate permissions for available_slips
GRANT SELECT ON public.available_slips TO authenticated;
GRANT SELECT ON public.available_slips TO anon;

-- Grant appropriate permissions for booking_summary
GRANT SELECT ON public.booking_summary TO authenticated;
GRANT SELECT ON public.booking_summary TO anon;

-- Verify all views are now SECURITY INVOKER
SELECT 
    schemaname,
    viewname,
    security_invoker
FROM pg_views 
WHERE schemaname = 'public' 
AND viewname IN ('available_slips', 'booking_summary');

-- Test both views
SELECT 'available_slips count:' as view_name, COUNT(*) as count FROM public.available_slips
UNION ALL
SELECT 'booking_summary count:' as view_name, COUNT(*) as count FROM public.booking_summary;

-- Show final status of all public views
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




