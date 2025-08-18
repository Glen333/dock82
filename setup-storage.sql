-- Setup Supabase Storage for Slip Images
-- Run this in your Supabase SQL Editor

-- Create storage bucket for slip images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'slip-images',
  'slip-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg']
)
ON CONFLICT (id) DO NOTHING;

-- Set up Row Level Security (RLS) policies for the storage bucket
-- Allow public read access to slip images
CREATE POLICY "Public read access for slip images" ON storage.objects
FOR SELECT USING (bucket_id = 'slip-images');

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload slip images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'slip-images' 
  AND auth.role() = 'authenticated'
);

-- Allow authenticated users to update their uploaded images
CREATE POLICY "Authenticated users can update slip images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'slip-images' 
  AND auth.role() = 'authenticated'
);

-- Allow authenticated users to delete their uploaded images
CREATE POLICY "Authenticated users can delete slip images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'slip-images' 
  AND auth.role() = 'authenticated'
);

-- Verify the bucket was created
SELECT * FROM storage.buckets WHERE id = 'slip-images';
