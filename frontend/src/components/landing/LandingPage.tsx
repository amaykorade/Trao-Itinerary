'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { buttonStyles } from '@/components/ui/Button';
import ProductPreview from '@/components/landing/ProductPreview';

export default function LandingPage() {
  const { user } = useAuth();

  return (
    <div className="landing-hero-bg border-b border-slate-200/80">
      <div className="app-container grid items-center gap-12 py-16 lg:grid-cols-2 lg:gap-16 lg:py-24">
        <div className="max-w-xl">
          <h1 className="text-4xl font-semibold leading-[1.1] tracking-tight text-slate-900 sm:text-5xl">
            Plan your trip day by day
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-slate-600">
            Enter a destination, pick your budget and interests, and get an itinerary with cost
            estimates and hotel suggestions. Edit activities or regenerate days as you go.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            {user ? (
              <>
                <Link href="/dashboard" className={buttonStyles('primary', 'lg')}>
                  My trips
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/trips/new" className={buttonStyles('outline', 'lg')}>
                  New trip
                </Link>
              </>
            ) : (
              <>
                <Link href="/register" className={buttonStyles('primary', 'lg')}>
                  Sign up
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/login" className={buttonStyles('outline', 'lg')}>
                  Log in
                </Link>
              </>
            )}
          </div>
        </div>

        <ProductPreview />
      </div>
    </div>
  );
}
