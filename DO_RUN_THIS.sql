-- RUN THIS IN SUPABASE SQL EDITOR
-- Go to: https://app.supabase.com/project/phstdzlniugqbxtfgktb/editor/new

-- 1. See all bookings for this specific slip
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
ORDER BY created_at DESC;

-- 2. If there are old test bookings, UPDATE them to 'cancelled' status:
-- Replace <booking_id> with the actual ID from query above
-- UPDATE bookings SET status = 'cancelled' WHERE id = <booking_id>;

-- 3. Or cancel all confirmed bookings for this slip:
UPDATE bookings 
SET status = 'cancelled' 
WHERE slip_id = '024510d4-4c32-4840-9e31-769c17aabe76' 
  AND status = 'confirmed';

-- 4. Then set the slip back to available:
UPDATE slips 
SET available = true 
WHERE id = '024510d4-4c32-4840-9e31-769c17aabe76';

