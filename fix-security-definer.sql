-- Fix SECURITY DEFINER issue for available_slips view
-- This script should be run in your Supabase SQL Editor

-- First, let's see what the current view looks like
SELECT 
    schemaname,
    viewname,
    definition
FROM pg_views 
WHERE viewname = 'available_slips';

-- Drop the existing view with SECURITY DEFINER
DROP VIEW IF EXISTS public.available_slips;

-- Recreate the view with SECURITY INVOKER (default, more secure)
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

-- Grant appropriate permissions
GRANT SELECT ON public.available_slips TO authenticated;
GRANT SELECT ON public.available_slips TO anon;

-- Verify the view is now SECURITY INVOKER
SELECT 
    schemaname,
    viewname,
    security_invoker
FROM pg_views 
WHERE viewname = 'available_slips';

-- Test the view
SELECT COUNT(*) FROM public.available_slips;




