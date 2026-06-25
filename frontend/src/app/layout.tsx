import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import { Providers } from '@/components/Providers';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Trao',
  description: 'Day-by-day trip plans with budget and hotel suggestions.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full`}>
      <body className="flex min-h-full flex-col antialiased">
        <Providers>
          <Navbar />
          <main className="page-shell flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
