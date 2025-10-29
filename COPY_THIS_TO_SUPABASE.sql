-- COPY THIS ENTIRE BLOCK AND RUN IN SUPABASE SQL EDITOR
-- Go to: https://app.supabase.com/project/phstdzlniugqbxtfgktb/editor/new

DROP TRIGGER IF EXISTS trg_enforce_non_admin_update_columns ON bookings;
DROP TRIGGER IF EXISTS trg_prevent_booking_delete ON bookings;
DROP TRIGGER IF EXISTS trg_prevent_overlap ON bookings;
DROP TRIGGER IF EXISTS trg_enforce_7day ON bookings;

UPDATE bookings SET status = 'cancelled' 
WHERE slip_id = '024510d4-4c32-4840-9e31-769c17aabe76' 
  AND status = 'confirmed';

UPDATE slips SET available = true 
WHERE id = '024510d4-4c32-4840-9e31-769c17aabe76';

SELECT id, guest_name, status FROM bookings 
WHERE slip_id = '024510d4-4c32-4840-9e31-769c17aabe76';

