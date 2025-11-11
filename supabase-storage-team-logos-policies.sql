-- ============================================
-- Supabase Storage RLS Policies for team-logos
-- ============================================
-- Run this in Supabase SQL Editor after creating the 'team-logos' bucket
-- This allows public read access and public uploads (for anonymous users)

-- Enable RLS on storage.objects (if not already enabled)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy 1: Allow public read access to team-logos bucket
CREATE POLICY "Public read access for team-logos"
ON storage.objects
FOR SELECT
USING (bucket_id = 'team-logos');

-- Policy 2: Allow public uploads to team-logos bucket (anonymous access)
CREATE POLICY "Public upload access for team-logos"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'team-logos');

-- Policy 3: Allow public updates to team-logos bucket
CREATE POLICY "Public update access for team-logos"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'team-logos')
WITH CHECK (bucket_id = 'team-logos');

-- Policy 4: Allow public deletes from team-logos bucket
CREATE POLICY "Public delete access for team-logos"
ON storage.objects
FOR DELETE
USING (bucket_id = 'team-logos');

-- ============================================
-- ALTERNATIVE: If you want authenticated-only uploads (more secure)
-- ============================================
-- Uncomment the following and comment out the public policies above:

/*
-- Drop public policies first
DROP POLICY IF EXISTS "Public upload access for team-logos" ON storage.objects;
DROP POLICY IF EXISTS "Public update access for team-logos" ON storage.objects;
DROP POLICY IF EXISTS "Public delete access for team-logos" ON storage.objects;

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload team-logos"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'team-logos' 
  AND auth.role() = 'authenticated'
);

-- Allow authenticated users to update
CREATE POLICY "Authenticated users can update team-logos"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'team-logos' 
  AND auth.role() = 'authenticated'
)
WITH CHECK (
  bucket_id = 'team-logos' 
  AND auth.role() = 'authenticated'
);

-- Allow authenticated users to delete
CREATE POLICY "Authenticated users can delete team-logos"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'team-logos' 
  AND auth.role() = 'authenticated'
);
*/

