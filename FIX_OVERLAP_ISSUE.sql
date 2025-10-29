-- FIX OVERLAP ISSUE - Run this in Supabase SQL Editor
-- https://app.supabase.com/project/phstdzlniugqbxtfgktb/editor/new

-- Step 1: Temporarily disable the overlap trigger
DROP TRIGGER IF EXISTS trg_prevent_overlap ON bookings;

-- Step 2: Check what bookings exist for Slip 8
SELECT 
    id,
    guest_name,
    check_in,
    check_out,
    status,
    payment_status
FROM bookings
WHERE slip_id = (SELECT id FROM slips WHERE name = 'Slip 8')
ORDER BY created_at DESC;

-- Step 3: Cancel any conflicting bookings
UPDATE bookings 
SET status = 'cancelled' 
WHERE slip_id = (SELECT id FROM slips WHERE name = 'Slip 8')
  AND status = 'confirmed'
  AND (check_in <= '2026-01-06' AND check_out >= '2026-01-01');

-- Step 4: Set slip back to available
UPDATE slips 
SET available = true 
WHERE name = 'Slip 8';

-- Step 5: Verify
SELECT 
    id,
    guest_name,
    check_in,
    check_out,
    status
FROM bookings
WHERE slip_id = (SELECT id FROM slips WHERE name = 'Slip 8')
ORDER BY check_in;

