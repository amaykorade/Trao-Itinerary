'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { buttonStyles } from '@/components/ui/Button';
import { BrandLogo } from '@/components/BrandLogo';
import { UserMenu } from '@/components/UserMenu';

const navLinkClass = (active: boolean) =>
  `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
    active
      ? 'bg-teal-50 text-teal-800'
      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
  }`;

function isTripsSection(pathname: string): boolean {
  return pathname === '/dashboard' || pathname.startsWith('/trips');
}

export default function Navbar() {
  const { user, logout, loading } = useAuth();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const showUser = mounted && !loading && Boolean(user);

  const homeActive = pathname === '/';
  const tripsActive = isTripsSection(pathname);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
      <div className="app-container flex h-16 items-center justify-between gap-4">
        <div className="min-w-0 shrink-0">
          <BrandLogo />
        </div>

        <nav className="hidden items-center justify-center gap-0.5 sm:flex sm:gap-1">
          <Link href="/" className={navLinkClass(homeActive)}>
            Home
          </Link>
          {showUser && (
            <Link href="/dashboard" className={navLinkClass(tripsActive)}>
              My Trips
            </Link>
          )}
        </nav>

        <div className="flex shrink-0 items-center justify-end gap-1.5 sm:gap-2">
          {showUser ? (
            <>
              <nav className="flex items-center gap-0.5 sm:hidden">
                <Link href="/" className={navLinkClass(homeActive)}>
                  Home
                </Link>
                <Link href="/dashboard" className={navLinkClass(tripsActive)}>
                  Trips
                </Link>
              </nav>
              <UserMenu user={user!} onLogout={logout} />
            </>
          ) : (
            <>
              <Link href="/login" className={`hidden sm:inline-flex ${navLinkClass(pathname === '/login')}`}>
                Log in
              </Link>
              <Link href="/register" className={buttonStyles('primary', 'sm')}>
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
