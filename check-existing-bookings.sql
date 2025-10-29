-- Check for existing bookings for a specific slip
-- Run this in Supabase SQL Editor to see what bookings exist

-- Replace the slip_id with your actual slip ID
SELECT 
    id,
    slip_id,
    guest_name,
    guest_email,
    check_in,
    check_out,
    status,
    payment_status,
    created_at
FROM bookings
WHERE slip_id = '024510d4-4c32-4840-9e31-769c17aabe76'
ORDER BY created_at DESC
LIMIT 10;

-- Check for overlapping bookings
SELECT 
    id,
    guest_name,
    guest_email,
    check_in,
    check_out,
    status,
    payment_status
FROM bookings
WHERE slip_id = '024510d4-4c32-4840-9e31-769c17aabe76'
  AND status = 'confirmed'
  AND (
    -- Overlaps check (adjust dates as needed)
    (check_in, check_out) OVERLAPS ('2025-06-01'::date, '2025-06-15'::date)
  )
ORDER BY check_in;
