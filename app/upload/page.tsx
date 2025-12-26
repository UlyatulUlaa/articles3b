// app/upload/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useSession } from '@/components/SessionProvider'; // Menggunakan custom hook kita
import { useRouter } from 'next/navigation';

export default function UploadPDFPage() {
  const { session, loading: sessionLoading } = useSession();
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  // Proteksi rute: Redirect jika belum login atau sesi sedang dimuat
  useEffect(() => {
    if (!sessionLoading && !session) {
      router.push('/login');
    }
  }, [session, sessionLoading, router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login'); // Redirect manual ke login setelah logout
  };

  // Helper function untuk mendapatkan NIM dari email
  const getNimFromEmail = (email: string) => {
    if (email && email.includes('@nim.local')) {
      return email.replace('@nim.local', '');
    }
    return email || 'User';
  };

  // Helper function untuk mendapatkan NIM dari session
  const getUserNim = () => {
    if (session?.user?.user_metadata?.nim) {
      return session.user.user_metadata.nim;
    }
    if (session?.user?.email) {
      return getNimFromEmail(session.user.email);
    }
    return 'User';
  };

  const uploadFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      setMessage('');

      // Pastikan session ada
      if (!session) {
        setMessage('Anda harus login terlebih dahulu.');
        router.push('/login');
        return;
      }

      const file = event.target.files?.[0];

      if (!file) {
        setMessage('Silakan pilih file PDF.');
        return;
      }

      if (file.type !== 'application/pdf') {
        setMessage('Hanya file PDF yang diizinkan.');
        return;
      }

      const fileExt = file.name.split('.').pop();
      // Gunakan NIM untuk nama file
      const nim = getUserNim();
      const fileName = `${nim}_${Date.now()}.${fileExt}`;
      const filePath = `pdfs/${fileName}`; // Simpan dalam subfolder 'pdfs'

      // Pastikan menggunakan client dengan session yang benar
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        setMessage('Session tidak valid. Silakan login ulang.');
        router.push('/login');
        return;
      }

      // Upload file dengan metadata user
      const { data, error: uploadError } = await supabase.storage
        .from('uploads') // Pastikan nama bucket ini sama dengan yang Anda buat di Supabase
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: 'application/pdf',
        });

      if (uploadError) {
        console.error('Upload error details:', uploadError);
        
        // Berikan pesan error yang lebih informatif
        if (uploadError.message.includes('row-level security')) {
          throw new Error('Policy keamanan belum dikonfigurasi. Silakan hubungi administrator atau lihat dokumentasi untuk mengatur policy di Supabase Storage.');
        }
        throw uploadError;
      }

      if (data) {
        setMessage('File PDF berhasil diunggah!');
        // Reset input file
        event.target.value = '';
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      setMessage(`Gagal mengunggah file: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  if (sessionLoading || !session) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-lg text-gray-700">Memuat...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-center text-gray-800">Unggah File PDF</h1>
        <p className="text-center text-gray-600 mb-6">Halo, NIM: <span className="font-semibold">{getUserNim()}</span>!</p>

        <input
          type="file"
          accept=".pdf" // Hanya menerima file PDF
          onChange={uploadFile}
          disabled={uploading}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100 mb-4"
        />

        {uploading && <p className="mt-2 text-blue-500 text-center">Sedang mengunggah...</p>}
        {message && (
          <p className={`mt-4 text-center ${message.includes('gagal') ? 'text-red-600' : 'text-green-600'}`}>
            {message}
          </p>
        )}

        <button
          onClick={handleLogout}
          className="mt-6 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          Logout
        </button>
      </div>
    </div>
  );
}