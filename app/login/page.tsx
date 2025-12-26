// app/login/page.tsx
"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [nim, setNim] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');
  const router = useRouter();

  // Fungsi untuk mendapatkan email dari NIM
  const getEmailFromNim = (nim: string) => {
    return `${nim.trim()}@nim.local`;
  };

  const handleLoginOrSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setMessageType('');

    if (!nim.trim()) {
      setMessage('Silakan masukkan NIM Anda.');
      setMessageType('error');
      setLoading(false);
      return;
    }

    // Validasi format NIM (hanya angka, minimal 5 karakter)
    if (!/^\d{5,}$/.test(nim.trim())) {
      setMessage('NIM harus berupa angka minimal 5 digit.');
      setMessageType('error');
      setLoading(false);
      return;
    }

    try {
      const email = getEmailFromNim(nim);
      
      // Coba login langsung dengan password dummy (untuk user yang sudah ada)
      // Jika gagal, berarti user belum ada, maka kita buat user baru
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password: nim.trim(), // Gunakan NIM sebagai password
      });

      if (loginError) {
        // Jika user belum ada, buat user baru
        if (loginError.message.includes('Invalid login credentials') || 
            loginError.message.includes('User not found') ||
            loginError.message.includes('Email not confirmed')) {
          
          // Buat user baru dengan password = NIM
          const { error: signUpError, data: signUpData } = await supabase.auth.signUp({
            email,
            password: nim.trim(),
            options: {
              emailRedirectTo: `${window.location.origin}/`,
              data: {
                nim: nim.trim(),
                display_name: `Mahasiswa ${nim.trim()}`,
              },
            },
          });

          if (signUpError) {
            // Jika error karena user sudah ada, coba login lagi
            if (signUpError.message.includes('already registered') || 
                signUpError.message.includes('User already registered')) {
              const { error: retryError } = await supabase.auth.signInWithPassword({
                email,
                password: nim.trim(),
              });

              if (retryError) throw retryError;
            } else {
              throw signUpError;
            }
          } else {
            // Setelah signup, langsung login (jika email verification di-disable)
            // Jika email verification aktif, user perlu verifikasi dulu
            if (signUpData?.user && !signUpData.user.email_confirmed_at) {
              // Jika email verification aktif, coba login langsung (mungkin sudah auto-verified)
              const { error: autoLoginError } = await supabase.auth.signInWithPassword({
                email,
                password: nim.trim(),
              });

              // Jika masih error karena belum terverifikasi, beri pesan
              if (autoLoginError && autoLoginError.message.includes('Email not confirmed')) {
                throw new Error('Akun berhasil dibuat. Silakan coba login lagi dalam beberapa saat.');
              } else if (autoLoginError) {
                throw autoLoginError;
              }
            } else if (signUpData?.user) {
              // User sudah terverifikasi, langsung login
              const { error: autoLoginError } = await supabase.auth.signInWithPassword({
                email,
                password: nim.trim(),
              });

              if (autoLoginError) throw autoLoginError;
            }
          }
        } else {
          throw loginError;
        }
      }

      // Login berhasil
      setMessage('Login berhasil! Mengarahkan...');
      setMessageType('success');
      
      // Redirect akan dilakukan oleh SessionProvider
      setTimeout(() => {
        router.push('/');
      }, 1000);
    } catch (error: any) {
      console.error('Auth error:', error);
      setMessage(`Gagal: ${error.message}`);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Masuk dengan NIM
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Masukkan Nomor Induk Mahasiswa Anda
          </p>
        </div>
        
        <form onSubmit={handleLoginOrSignUp} className="space-y-6">
          <div>
            <label htmlFor="nim" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nomor Induk Mahasiswa (NIM)
            </label>
            <input
              type="text"
              id="nim"
              value={nim}
              onChange={(e) => setNim(e.target.value.replace(/\D/g, ''))} // Hanya angka
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg dark:bg-gray-700 dark:text-white"
              placeholder="Contoh: 1234567890"
              required
              minLength={5}
              pattern="\d{5,}"
              disabled={loading}
            />
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Hanya angka, minimal 5 digit
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || !nim.trim()}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Memproses...
              </span>
            ) : (
              'Masuk / Daftar'
            )}
          </button>
        </form>

        {message && (
          <div className={`mt-4 p-4 rounded-lg ${
            messageType === 'error' 
              ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800' 
              : 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
          }`}>
            <p className={`text-center text-sm ${
              messageType === 'error' 
                ? 'text-red-800 dark:text-red-200' 
                : 'text-green-800 dark:text-green-200'
            }`}>
              {message}
            </p>
          </div>
        )}

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Dengan masuk, Anda dapat mengunggah dan mengakses file PDF kapan saja
          </p>
        </div>
      </div>
    </div>
  );
}
