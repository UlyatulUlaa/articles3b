# Troubleshooting - File Tidak Muncul di Halaman Depan

## Masalah: File PDF tidak muncul di halaman depan

### Langkah 1: Cek Console Browser

1. Buka halaman depan aplikasi
2. Tekan `F12` atau klik kanan → "Inspect" → Tab "Console"
3. Lihat apakah ada error yang muncul
4. Cari pesan yang mengandung:
   - "Error fetching files"
   - "permission denied"
   - "row-level security"
   - "Bucket not found"

### Langkah 2: Verifikasi Bucket di Supabase

1. Buka **Supabase Dashboard** → **Storage**
2. Pastikan bucket dengan nama `uploads` sudah ada
3. Jika belum ada, buat bucket baru:
   - Klik "New bucket"
   - Nama: `uploads`
   - Pilih **"Public bucket"** (penting!)
   - Klik "Create bucket"

### Langkah 3: Verifikasi Policy di Supabase

1. Buka **Supabase Dashboard** → **Storage** → **Policies**
2. Pilih bucket `uploads`
3. Pastikan ada policy dengan nama **"Allow public to read files"**

#### Jika policy belum ada, buat dengan cara berikut:

**Opsi A: Via SQL Editor (Recommended)**

1. Buka **Supabase Dashboard** → **SQL Editor**
2. Copy-paste script berikut:

```sql
-- Policy untuk PUBLIC READ (siapa saja bisa melihat file)
CREATE POLICY IF NOT EXISTS "Allow public to read files"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'uploads');
```

3. Klik **"Run"** untuk menjalankan script
4. Refresh halaman aplikasi

**Opsi B: Via Policy UI**

1. Buka **Supabase Dashboard** → **Storage** → **Policies**
2. Pilih bucket `uploads`
3. Klik **"New Policy"**
4. Isi form:
   - **Policy name:** `Allow public to read files`
   - **Allowed operation:** `SELECT`
   - **Target roles:** `public`
   - **Policy definition:** `bucket_id = 'uploads'`
5. Klik **"Save"**

### Langkah 4: Verifikasi File Sudah Diupload

1. Buka **Supabase Dashboard** → **Storage** → **uploads**
2. Cek apakah ada folder `pdfs` atau file PDF di dalam bucket
3. Jika belum ada file:
   - Login ke aplikasi
   - Upload file PDF melalui halaman `/upload`
   - Kembali ke halaman depan

### Langkah 5: Cek Struktur Folder

File seharusnya disimpan di path: `pdfs/{NIM}_{timestamp}.pdf`

Jika file ada di root bucket (bukan di folder `pdfs`), aplikasi akan otomatis mencarinya.

### Langkah 6: Test Manual di Supabase Dashboard

1. Buka **Supabase Dashboard** → **Storage** → **uploads**
2. Coba buka salah satu file PDF
3. Jika file bisa dibuka, berarti file ada dan bucket public
4. Jika tidak bisa dibuka, cek policy SELECT

### Langkah 7: Cek Environment Variables

Pastikan file `.env.local` atau environment variables berisi:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Langkah 8: Clear Cache dan Refresh

1. Tekan `Ctrl + Shift + R` (Windows/Linux) atau `Cmd + Shift + R` (Mac) untuk hard refresh
2. Atau buka Developer Tools → Network tab → centang "Disable cache" → refresh

## Error Messages dan Solusinya

### Error: "Akses ditolak. Pastikan policy..."
**Solusi:** Buat policy "Allow public to read files" seperti di Langkah 3

### Error: "Bucket not found"
**Solusi:** Buat bucket `uploads` di Supabase Storage (Langkah 2)

### Error: "new row violates row-level security policy"
**Solusi:** 
1. Pastikan bucket adalah **Public bucket**
2. Buat policy untuk public SELECT
3. Atau disable RLS sementara untuk testing (tidak recommended untuk production)

### File tidak muncul tapi tidak ada error
**Kemungkinan:**
1. Belum ada file yang diupload
2. File ada di folder yang berbeda
3. Cache browser - coba hard refresh

## Quick Fix Script

Jalankan script SQL lengkap ini di Supabase SQL Editor:

```sql
-- 1. Pastikan bucket public (jika belum)
-- (Lakukan via UI: Storage → uploads → Settings → Make Public)

-- 2. Buat policy untuk public read
CREATE POLICY IF NOT EXISTS "Allow public to read files"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'uploads');

-- 3. Policy untuk authenticated users upload (jika belum ada)
CREATE POLICY IF NOT EXISTS "Allow authenticated users to upload"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'uploads');
```

## Masih Tidak Berfungsi?

1. Cek console browser untuk error detail
2. Cek Network tab di Developer Tools untuk melihat request ke Supabase
3. Pastikan URL Supabase dan API key sudah benar
4. Coba buka file langsung via URL public dari Supabase Dashboard

## Kontak Support

Jika masih bermasalah setelah mengikuti semua langkah di atas, siapkan informasi berikut:
- Screenshot error di console browser
- Screenshot policy di Supabase Dashboard
- Screenshot struktur folder di Storage
- URL aplikasi yang digunakan

