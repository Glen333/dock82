-- REMOVE RESTRICTIONS TEMPORARILY
-- Run this in Supabase SQL Editor: https://app.supabase.com/project/phstdzlniugqbxtfgktb/editor/new

-- 1. Drop the trigger that prevents updates
DROP TRIGGER IF EXISTS trg_enforce_non_admin_update_columns ON bookings;

-- 2. Drop the trigger that prevents deletes  
DROP TRIGGER IF EXISTS trg_prevent_booking_delete ON bookings;

-- 3. Drop the overlap prevention trigger (temporarily)
DROP TRIGGER IF EXISTS trg_prevent_overlap ON bookings;

-- 4. Drop the rental date enforcement trigger
DROP TRIGGER IF EXISTS trg_enforce_7day ON bookings;

-- 5. Now you can directly delete or update bookings:
-- DELETE FROM bookings WHERE slip_id = '024510d4-4c32-4840-9e31-769c17aabe76' AND status = 'confirmed';

-- OR update them to cancelled:
-- UPDATE bookings SET status = 'cancelled' WHERE slip_id = '024510d4-4c32-4840-9e31-769c17aabe76' AND status = 'confirmed';

-- 6. Set slip back to available:
UPDATE slips SET available = true WHERE id = '024510d4-4c32-4840-9e31-769c17aabe76';

-- 7. Verify the fix
SELECT id, guest_name, check_in, check_out, status 
FROM bookings 
WHERE slip_id = '024510d4-4c32-4840-9e31-769c17aabe76'
ORDER BY created_at DESC;

-- NOTE: The triggers are now disabled. 
-- You can re-enable them later if needed, or leave them off for easier testing.

