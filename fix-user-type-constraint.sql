-- Fix user_type constraint to allow 'homeowner'
-- Run this in your Supabase SQL Editor

-- Drop the existing constraint
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_user_type_check;

-- Create new constraint that includes 'homeowner'
ALTER TABLE public.users 
ADD CONSTRAINT users_user_type_check 
CHECK (user_type = ANY (ARRAY['renter'::text, 'admin'::text, 'superadmin'::text, 'homeowner'::text]));

-- Verify the constraint was updated
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'public.users'::regclass
AND conname = 'users_user_type_check';

