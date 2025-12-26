# Konfigurasi Supabase Storage untuk Upload File

## Masalah: "new row violates row-level security policy"

Error ini terjadi karena Row Level Security (RLS) policy di Supabase Storage belum dikonfigurasi dengan benar.

## Solusi: Setup Policy di Supabase Dashboard

### Langkah 1: Buat Bucket Storage

1. Buka Supabase Dashboard → Storage
2. Klik "New bucket"
3. Nama bucket: `uploads`
4. Pilih "Public bucket" (jika ingin file bisa diakses publik) atau "Private bucket" (jika ingin file hanya bisa diakses oleh user yang login)
5. Klik "Create bucket"

### Langkah 2: Konfigurasi Policy untuk Upload

1. Buka Supabase Dashboard → Storage → Policies
2. Pilih bucket `uploads`
3. Klik "New Policy"

#### Policy 1: Allow Authenticated Users to Upload Files

**Policy Name:** `Allow authenticated users to upload files`

**Policy Definition:**
```sql
CREATE POLICY "Allow authenticated users to upload files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'uploads' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

**Atau untuk policy yang lebih sederhana (mengizinkan semua user terautentikasi):**

```sql
CREATE POLICY "Allow authenticated users to upload"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'uploads');
```

#### Policy 2: Allow Users to Read Their Own Files

**Policy Name:** `Allow users to read their files`

**Policy Definition:**
```sql
CREATE POLICY "Allow users to read their files"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'uploads');
```

#### Policy 3: Allow Users to Delete Their Own Files (Opsional)

**Policy Name:** `Allow users to delete their files`

**Policy Definition:**
```sql
CREATE POLICY "Allow users to delete their files"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'uploads');
```

### Langkah 3: Alternatif - Disable RLS (Hanya untuk Development)

⚠️ **PERINGATAN:** Hanya gunakan untuk development/testing, jangan untuk production!

1. Buka Supabase Dashboard → Storage → Policies
2. Pilih bucket `uploads`
3. Toggle "Enable RLS" menjadi OFF

### Langkah 4: Verifikasi Policy

Setelah membuat policy, coba upload file lagi. Jika masih error:

1. Pastikan user sudah login (ada session)
2. Pastikan bucket name `uploads` sudah benar
3. Pastikan policy sudah diaktifkan
4. Cek console browser untuk error detail

## Policy Lengkap untuk Production

Jika ingin policy yang lebih ketat (user hanya bisa mengakses file mereka sendiri):

```sql
-- Policy untuk INSERT (Upload)
CREATE POLICY "Users can upload their own files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'uploads' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy untuk SELECT (Read)
CREATE POLICY "Users can read their own files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'uploads' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy untuk DELETE
CREATE POLICY "Users can delete their own files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'uploads' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

**Catatan:** Policy di atas mengasumsikan struktur folder seperti `{user_id}/filename.pdf`. Jika struktur berbeda, sesuaikan policy sesuai kebutuhan.

## Troubleshooting

### Error: "new row violates row-level security policy"
- Pastikan policy sudah dibuat dan diaktifkan
- Pastikan user sudah login (ada session)
- Pastikan bucket name sesuai dengan yang digunakan di kode

### Error: "Bucket not found"
- Pastikan bucket `uploads` sudah dibuat di Supabase Dashboard
- Pastikan nama bucket di kode sesuai dengan nama di dashboard

### File tidak bisa diakses setelah upload
- Pastikan policy SELECT sudah dibuat
- Jika bucket private, pastikan policy mengizinkan akses
- Jika bucket public, file seharusnya bisa diakses langsung via URL

