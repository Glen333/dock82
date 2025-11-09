-- Add file path columns to bookings table for storing uploaded file locations
-- Run this in your Supabase SQL Editor

-- Add columns for file storage paths (if they don't exist)
DO $$ 
BEGIN
  -- Add rental_agreement_path column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'bookings' 
    AND column_name = 'rental_agreement_path'
  ) THEN
    ALTER TABLE public.bookings 
    ADD COLUMN rental_agreement_path text null;
  END IF;

  -- Add insurance_proof_path column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'bookings' 
    AND column_name = 'insurance_proof_path'
  ) THEN
    ALTER TABLE public.bookings 
    ADD COLUMN insurance_proof_path text null;
  END IF;

  -- Add boat_picture_path column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'bookings' 
    AND column_name = 'boat_picture_path'
  ) THEN
    ALTER TABLE public.bookings 
    ADD COLUMN boat_picture_path text null;
  END IF;
END $$;

-- Add comments to document the columns
COMMENT ON COLUMN public.bookings.rental_agreement_path IS 'Path to rental agreement file in Supabase Storage (documents bucket)';
COMMENT ON COLUMN public.bookings.insurance_proof_path IS 'Path to insurance proof file in Supabase Storage (documents bucket)';
COMMENT ON COLUMN public.bookings.boat_picture_path IS 'Path to boat picture file in Supabase Storage (documents bucket)';

-- Verify columns were added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'bookings' 
AND column_name IN ('rental_agreement_path', 'insurance_proof_path', 'boat_picture_path');

