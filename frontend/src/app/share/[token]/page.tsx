'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Calendar, Lock } from 'lucide-react';
import { api } from '@/lib/api';
import type { SharedTrip } from '@/lib/types';
import LoadingSpinner from '@/components/LoadingSpinner';
import ItineraryDay from '@/components/ItineraryDay';
import BudgetCard from '@/components/BudgetCard';
import HotelList from '@/components/HotelList';
import { Alert } from '@/components/ui/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { buttonStyles } from '@/components/ui/Button';

const noop = () => {};

export default function SharedTripPage() {
  const params = useParams();
  const token = params.token as string;

  const [trip, setTrip] = useState<SharedTrip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .getSharedTrip(token)
      .then(({ trip: shared }) => setTrip(shared))
      .catch((err) => setError(err instanceof Error ? err.message : 'Trip not found'))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return <LoadingSpinner fullPage label="Loading shared trip..." />;
  }

  if (error || !trip) {
    return (
      <div className="app-container py-16 text-center">
        <Alert>{error || 'This shared trip is unavailable.'}</Alert>
        <Link href="/" className={`mt-6 ${buttonStyles('outline', 'md')}`}>
          Go to Trao
        </Link>
      </div>
    );
  }

  const isFinalized = Boolean(trip.finalizedAt);

  return (
    <div className="min-h-full bg-slate-50">
      <div className="border-b border-teal-100 bg-teal-50/80">
        <div className="app-container py-3">
          <p className="text-center text-sm text-teal-800">
            Shared travel plan — read only
            {isFinalized && (
              <span className="ml-2 inline-flex items-center gap-1 font-medium">
                <Lock className="h-3.5 w-3.5" />
                Final plan
              </span>
            )}
          </p>
        </div>
      </div>

      <div className="app-container py-6 sm:py-8">
        <header className="mb-6 border-b border-slate-200 pb-6">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              {trip.destination}
            </h1>
            {isFinalized && <Badge tone="finalized">Final plan</Badge>}
            <Badge tone="default" className="capitalize">
              {trip.budgetType} budget
            </Badge>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-slate-400" />
              {trip.numDays} {trip.numDays === 1 ? 'day' : 'days'}
            </span>
            {trip.interests.length > 0 && (
              <>
                <span className="hidden h-1 w-1 rounded-full bg-slate-300 sm:inline-block" aria-hidden />
                <div className="flex flex-wrap items-center gap-1.5">
                  {trip.interests.map((interest) => (
                    <span
                      key={interest}
                      className="rounded-md bg-white px-2 py-0.5 text-xs font-medium capitalize text-slate-600 ring-1 ring-slate-200"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>
        </header>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-10">
          <section className="min-w-0 space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">Itinerary</h2>
            {trip.itinerary.map((day) => (
              <ItineraryDay
                key={day.day}
                day={day}
                readOnly
                onRemove={noop}
                onRegenerate={noop}
                onAdd={noop}
                onReorder={noop}
              />
            ))}
          </section>

          <aside className="trip-sidebar-panel">
            {trip.budget && <BudgetCard budget={trip.budget} />}
            <HotelList hotels={trip.hotels} />
          </aside>
        </div>

        <div className="mt-10 rounded-xl border border-slate-200 bg-white px-5 py-4 text-center">
          <p className="text-sm text-slate-600">Create your own trip</p>
          <Link href="/register" className={`mt-3 ${buttonStyles('primary', 'sm')}`}>
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
