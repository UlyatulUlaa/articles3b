-- ============================================
-- Supabase Storage Policies untuk Upload File
-- ============================================
-- Jalankan script ini di Supabase Dashboard → SQL Editor
-- Pastikan bucket 'uploads' sudah dibuat terlebih dahulu

-- ============================================
-- OPTION 1: Policy Sederhana (Recommended untuk Development)
-- Mengizinkan semua user terautentikasi untuk upload/read/delete
-- ============================================

-- Policy untuk INSERT (Upload)
CREATE POLICY IF NOT EXISTS "Allow authenticated users to upload"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'uploads');

-- Policy untuk SELECT (Read/Download)
CREATE POLICY IF NOT EXISTS "Allow authenticated users to read"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'uploads');

-- Policy untuk DELETE (Hapus file)
CREATE POLICY IF NOT EXISTS "Allow authenticated users to delete"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'uploads');

-- ============================================
-- OPTION 2: Policy Ketat (Recommended untuk Production)
-- User hanya bisa mengakses file mereka sendiri
-- Struktur folder: pdfs/{user_id}_{timestamp}.pdf
-- ============================================

-- Hapus policy sederhana jika ingin menggunakan policy ketat
-- DROP POLICY IF EXISTS "Allow authenticated users to upload" ON storage.objects;
-- DROP POLICY IF EXISTS "Allow authenticated users to read" ON storage.objects;
-- DROP POLICY IF EXISTS "Allow authenticated users to delete" ON storage.objects;

-- Policy untuk INSERT dengan validasi user ID di nama file
-- CREATE POLICY IF NOT EXISTS "Users can upload their own files"
-- ON storage.objects
-- FOR INSERT
-- TO authenticated
-- WITH CHECK (
--   bucket_id = 'uploads' AND
--   (storage.foldername(name))[1] = 'pdfs' AND
--   (string_to_array(split_part(name, '/', 2), '_'))[1] = auth.uid()::text
-- );

-- Policy untuk SELECT dengan validasi user ID
-- CREATE POLICY IF NOT EXISTS "Users can read their own files"
-- ON storage.objects
-- FOR SELECT
-- TO authenticated
-- USING (
--   bucket_id = 'uploads' AND
--   (storage.foldername(name))[1] = 'pdfs' AND
--   (string_to_array(split_part(name, '/', 2), '_'))[1] = auth.uid()::text
-- );

-- Policy untuk DELETE dengan validasi user ID
-- CREATE POLICY IF NOT EXISTS "Users can delete their own files"
-- ON storage.objects
-- FOR DELETE
-- TO authenticated
-- USING (
--   bucket_id = 'uploads' AND
--   (storage.foldername(name))[1] = 'pdfs' AND
--   (string_to_array(split_part(name, '/', 2), '_'))[1] = auth.uid()::text
-- );

-- ============================================
-- Catatan:
-- 1. Pastikan bucket 'uploads' sudah dibuat di Storage
-- 2. Untuk development, gunakan OPTION 1 (policy sederhana)
-- 3. Untuk production, gunakan OPTION 2 (policy ketat)
-- 4. Jika masih error, pastikan RLS sudah diaktifkan di bucket
-- ============================================

