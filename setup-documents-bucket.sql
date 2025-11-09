-- Setup Supabase Storage for User Documents (Rental Agreements, Insurance Proof, Boat Pictures)
-- Run this in your Supabase SQL Editor

-- Create storage bucket for user documents (private bucket)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents',
  'documents',
  false, -- Private bucket - requires authentication
  10485760, -- 10MB limit
  ARRAY['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
ON CONFLICT (id) DO NOTHING;

-- Set up Row Level Security (RLS) policies for the documents bucket
-- Users can only access their own documents (path format: {user_id}/filename)
CREATE POLICY "Users can read own documents" ON storage.objects
FOR SELECT USING (
  bucket_id = 'documents' 
  AND (auth.uid())::text = split_part(name, '/', 1)
);

CREATE POLICY "Users can upload own documents" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'documents' 
  AND (auth.uid())::text = split_part(name, '/', 1)
);

CREATE POLICY "Users can update own documents" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'documents' 
  AND (auth.uid())::text = split_part(name, '/', 1)
);

CREATE POLICY "Users can delete own documents" ON storage.objects
FOR DELETE USING (
  bucket_id = 'documents' 
  AND (auth.uid())::text = split_part(name, '/', 1)
);

-- Admins can access all documents (using service role key bypasses RLS)
-- This is handled by using supabaseAdmin in the backend

-- Verify the bucket was created
SELECT * FROM storage.buckets WHERE id = 'documents';

