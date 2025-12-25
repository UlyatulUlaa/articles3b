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

  const uploadFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      setMessage('');
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
      // Untuk keamanan, tambahkan user ID ke nama file atau path
      const userId = session?.user?.id;
      const fileName = `${userId}_${Date.now()}.${fileExt}`;
      const filePath = `pdfs/${fileName}`; // Simpan dalam subfolder 'pdfs'

      let { error: uploadError } = await supabase.storage
        .from('uploads') // Pastikan nama bucket ini sama dengan yang Anda buat di Supabase
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      setMessage('File PDF berhasil diunggah!');
    } catch (error: any) {
      setMessage(`Gagal mengunggah file: ${error.message}`);
      console.error(error);
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
        <p className="text-center text-gray-600 mb-6">Halo, {session.user?.email}!</p>

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