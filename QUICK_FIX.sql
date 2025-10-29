-- QUICK FIX: Cancel all confirmed bookings for slip 024510d4-4c32-4840-9e31-769c17aabe76
-- Run this in Supabase SQL Editor: https://app.supabase.com/project/phstdzlniugqbxtfgktb/editor/new

UPDATE bookings 
SET status = 'cancelled' 
WHERE slip_id = '024510d4-4c32-4840-9e31-769c17aabe76' 
  AND status = 'confirmed';

-- Set the slip back to available
UPDATE slips 
SET available = true 
WHERE id = '024510d4-4c32-4840-9e31-769c17aabe76';

-- Verify the fix
SELECT 
    id,
    guest_name,
    check_in,
    check_out,
    status,
    created_at
FROM bookings
WHERE slip_id = '024510d4-4c32-4840-9e31-769c17aabe76'
ORDER BY created_at DESC;

