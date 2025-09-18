-- SQL script to clean up test slips from Supabase database
-- Run this in your Supabase SQL Editor

-- Delete the 6 test slips that shouldn't be there
DELETE FROM slips 
WHERE id IN (
  'e7075755-a81b-47a2-b842-a51fe1e4a54a', -- Line Test Slip 100
  '6f6d9cf3-d192-4948-969d-eec44870cdf7', -- Line Test Slip 1757888035695
  'ea0f2312-dbb7-44e2-8f87-2c575762ed2a', -- Test Slip
  '28af76e6-33bd-44da-9617-9003383c72d1', -- Test Slip 1757888009121
  'b568729a-426f-48e6-9ce0-9b00550210e0', -- Test Slip 1757889456604
  '6a3acb55-fd86-411e-a2ec-3409ca1ae1ed'  -- Test Slip 99
);

-- Verify the cleanup
SELECT COUNT(*) as total_slips FROM slips;

-- Show remaining slips
SELECT id, name, price_per_night, available 
FROM slips 
ORDER BY name;

