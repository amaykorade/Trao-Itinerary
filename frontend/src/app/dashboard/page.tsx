'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Plus, Search, X } from 'lucide-react';
import { useRequireAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import type { TripSummary } from '@/lib/types';
import TripCard, { TripListSkeleton } from '@/components/TripCard';
import { Alert } from '@/components/ui/PageHeader';
import { buttonStyles } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

function matchesTripSearch(trip: TripSummary, query: string): boolean {
  const term = query.trim().toLowerCase();
  if (!term) return true;

  const destination = trip.destination.toLowerCase();
  const interests = trip.interests.join(' ').toLowerCase();

  return destination.includes(term) || interests.includes(term);
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useRequireAuth();
  const [trips, setTrips] = useState<TripSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!user) return;
    api
      .listTrips()
      .then(({ trips: fetched }) => {
        const sorted = [...fetched].sort(
          (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
        setTrips(sorted);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load trips'))
      .finally(() => setLoading(false));
  }, [user]);

  const hasGeneratingTrips = trips.some((trip) => trip.status === 'generating');

  useEffect(() => {
    if (!user || !hasGeneratingTrips) return;

    const refreshTrips = () => {
      api
        .listTrips()
        .then(({ trips: fetched }) => {
          const sorted = [...fetched].sort(
            (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );
          setTrips(sorted);
        })
        .catch(() => {
          // Ignore transient poll errors on the dashboard.
        });
    };

    const interval = setInterval(refreshTrips, 3000);
    return () => clearInterval(interval);
  }, [user, hasGeneratingTrips]);

  const filteredTrips = useMemo(
    () => trips.filter((trip) => matchesTripSearch(trip, search)),
    [trips, search]
  );

  const hasSearch = search.trim().length > 0;

  if (authLoading || !user) {
    return (
      <div className="bg-slate-50">
        <div className="app-container py-8">
          <TripListSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-slate-50">
      <div className="app-container py-6 sm:py-8">
        <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
              Trips
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {loading
                ? 'Loading your itineraries…'
                : trips.length === 0
                  ? 'Plan and manage your travel itineraries'
                  : `${trips.length} saved ${trips.length === 1 ? 'itinerary' : 'itineraries'}`}
            </p>
          </div>
          <Link href="/trips/new" className={buttonStyles('primary', 'sm')}>
            <Plus className="h-4 w-4" />
            New trip
          </Link>
        </div>

        {error && (
          <div className="mt-5">
            <Alert>{error}</Alert>
          </div>
        )}

        {!loading && !error && trips.length > 0 && (
          <div className="relative mt-5 max-w-md">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              aria-hidden
            />
            <Input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by city, country, or destination…"
              className="py-2 pl-9 pr-9"
              aria-label="Search trips"
            />
            {hasSearch && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        )}

        <div className="mt-5">
          {loading && <TripListSkeleton />}

          {!loading && !error && trips.length === 0 && (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center sm:px-10">
              <h2 className="text-base font-semibold text-slate-900">No trips yet</h2>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-slate-500">
                Start with a destination, trip length, and budget. Trao will build a day-by-day
                plan you can edit anytime.
              </p>
              <Link href="/trips/new" className={`mt-6 ${buttonStyles('primary', 'md')}`}>
                <Plus className="h-4 w-4" />
                Create your first trip
              </Link>
            </div>
          )}

          {!loading && trips.length > 0 && filteredTrips.length === 0 && (
            <div className="rounded-xl border border-slate-200 bg-white px-6 py-10 text-center">
              <p className="text-sm text-slate-600">
                No trips match <span className="font-medium">&ldquo;{search.trim()}&rdquo;</span>
              </p>
              <button
                type="button"
                onClick={() => setSearch('')}
                className="mt-3 text-sm font-medium text-teal-700 hover:underline"
              >
                Clear search
              </button>
            </div>
          )}

          {!loading && filteredTrips.length > 0 && (
            <div className="space-y-2" role="list">
              {filteredTrips.map((trip) => (
                <div key={trip.id} role="listitem">
                  <TripCard trip={trip} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
