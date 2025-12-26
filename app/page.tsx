"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useSession } from '@/components/SessionProvider';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface FileItem {
  name: string;
  id: string;
  created_at: string;
  updated_at: string;
  metadata?: {
    size?: number;
    mimetype?: string;
  };
}

export default function Home() {
  const { session, loading: sessionLoading } = useSession();
  const router = useRouter();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      setError('');

      // Ambil daftar file dari storage Supabase
      const { data, error: listError } = await supabase.storage
        .from('uploads')
        .list('pdfs', {
          limit: 100,
          offset: 0,
          sortBy: { column: 'created_at', order: 'desc' },
        });

      if (listError) throw listError;

      // Format data file
      const formattedFiles: FileItem[] = (data || []).map((file) => ({
        name: file.name,
        id: file.id,
        created_at: file.created_at,
        updated_at: file.updated_at,
        metadata: file.metadata,
      }));

      setFiles(formattedFiles);
    } catch (err: any) {
      setError(`Gagal memuat file: ${err.message}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getFileUrl = (fileName: string) => {
    const { data } = supabase.storage
      .from('uploads')
      .getPublicUrl(`pdfs/${fileName}`);
    return data.publicUrl;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Tidak diketahui';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
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
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Artikel & Halaman
              </h1>
              {session && getUserNim() && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  NIM: <span className="font-semibold">{getUserNim()}</span>
                </p>
              )}
            </div>
            <nav className="flex items-center gap-4">
              {session ? (
                <>
                  <Link
                    href="/upload"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Unggah PDF
                  </Link>
                  <button
                    onClick={async () => {
                      await supabase.auth.signOut();
                      router.push('/login');
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Login
                </Link>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {sessionLoading || loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Memuat halaman...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        ) : files.length === 0 ? (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <svg
                className="mx-auto h-24 w-24 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h2 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">
                Belum ada halaman
              </h2>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Mulai dengan mengunggah file PDF pertama Anda.
              </p>
              {session && (
                <Link
                  href="/upload"
                  className="mt-6 inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Unggah PDF
                </Link>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Daftar Halaman ({files.length})
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Klik pada halaman untuk melihat atau mengunduh.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {files.map((file) => {
                const fileUrl = getFileUrl(file.name);
                const fileName = file.name.replace(/^\d+_/, '').replace(/\.pdf$/i, '');

                return (
                  <div
                    key={file.id}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden"
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                            {fileName}
                          </h3>
                          <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
                            <p>Dibuat: {formatDate(file.created_at)}</p>
                            {file.metadata?.size && (
                              <p>Ukuran: {formatFileSize(file.metadata.size)}</p>
                            )}
                          </div>
                        </div>
                        <div className="ml-4">
                          <svg
                            className="h-8 w-8 text-red-600"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <a
                          href={fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 px-4 py-2 bg-blue-600 text-white text-center rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Lihat
                        </a>
                        <a
                          href={fileUrl}
                          download
                          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                        >
                          Unduh
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-16 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-gray-600 dark:text-gray-400">
            © {new Date().getFullYear()} Artikel & Halaman. Semua hak dilindungi.
          </p>
        </div>
      </footer>
    </div>
  );
}
