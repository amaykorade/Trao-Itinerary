import Link from 'next/link';
import { ChevronRight, Loader2 } from 'lucide-react';
import type { TripSummary } from '@/lib/types';
import { formatBudget, formatInterestList, formatRelativeDate, formatStatus } from '@/lib/format';

const statusStyles: Record<
  TripSummary['status'],
  { dot: string; text: string }
> = {
  draft: { dot: 'bg-slate-400', text: 'text-slate-600' },
  generating: { dot: 'bg-amber-500', text: 'text-amber-700' },
  generated: { dot: 'bg-emerald-500', text: 'text-emerald-700' },
  failed: { dot: 'bg-red-500', text: 'text-red-600' },
};

function TripInitials({ destination }: { destination: string }) {
  const words = destination.trim().split(/\s+/);
  const initials =
    words.length >= 2
      ? `${words[0][0]}${words[1][0]}`
      : destination.slice(0, 2);

  return (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-semibold uppercase tracking-wide text-slate-600">
      {initials}
    </span>
  );
}

export default function TripCard({ trip }: { trip: TripSummary }) {
  const status = statusStyles[trip.status];

  return (
    <Link
      href={`/trips/${trip.id}`}
      className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-3 transition-colors hover:border-slate-300 hover:bg-slate-50/50 sm:gap-4 sm:px-4 sm:py-3.5"
    >
      <TripInitials destination={trip.destination} />

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <h3 className="truncate text-sm font-semibold text-slate-900 sm:text-[0.9375rem]">
            {trip.destination}
          </h3>
          <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${status.text}`}>
            {trip.status === 'generating' ? (
              <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
            ) : (
              <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} aria-hidden />
            )}
            {formatStatus(trip.status)}
          </span>
          {trip.finalizedAt && (
            <span className="inline-flex items-center rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-800 ring-1 ring-indigo-200 ring-inset">
              Final
            </span>
          )}
        </div>
        <p className="mt-0.5 truncate text-xs text-slate-500 sm:text-sm">
          {trip.numDays} {trip.numDays === 1 ? 'day' : 'days'}
          <span className="mx-1.5 text-slate-300" aria-hidden>
            ·
          </span>
          {formatBudget(trip.budgetType)}
          <span className="mx-1.5 text-slate-300" aria-hidden>
            ·
          </span>
          {formatInterestList(trip.interests)}
        </p>
      </div>

      <div className="hidden shrink-0 text-right sm:block">
        <p className="text-xs text-slate-400">Updated</p>
        <p className="text-xs font-medium text-slate-500">
          {formatRelativeDate(trip.updatedAt)}
        </p>
      </div>

      <ChevronRight
        className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-slate-600"
        aria-hidden
      />
    </Link>
  );
}

export function TripListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-2" aria-hidden>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white px-4 py-3.5"
        >
          <div className="h-10 w-10 animate-pulse rounded-lg bg-slate-100" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-40 animate-pulse rounded bg-slate-100" />
            <div className="h-3 w-56 animate-pulse rounded bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  );
}
