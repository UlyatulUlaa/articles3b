// app/layout.tsx
import './globals.css'; // Pastikan Tailwind CSS diimpor
import { Inter } from 'next/font/google';
import SessionProvider from "@/components/SessionProvider"; // Ini akan kita buat nanti

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Upload PDF App',
  description: 'Upload PDF files after logging in',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}