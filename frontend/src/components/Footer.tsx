import Link from 'next/link';
import { BrandLogo } from '@/components/BrandLogo';

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white">
      <div className="app-container flex flex-col gap-6 py-10 sm:flex-row sm:items-center sm:justify-between">
        <BrandLogo
          iconClassName="h-8 w-8 rounded-lg bg-slate-900"
          iconSizeClassName="h-4 w-4"
        />

        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500">
          <Link href="/" className="hover:text-slate-900">
            Home
          </Link>
          <Link href="/login" className="hover:text-slate-900">
            Log in
          </Link>
          <Link href="/register" className="hover:text-slate-900">
            Sign up
          </Link>
          <Link href="/dashboard" className="hover:text-slate-900">
            My trips
          </Link>
        </div>

        <p className="text-xs text-slate-400 sm:text-right" suppressHydrationWarning>
          © {new Date().getFullYear()} Trao. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
