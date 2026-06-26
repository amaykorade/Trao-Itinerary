import { useEffect } from 'react';
import type { TripDetail } from '@/lib/types';
import { api } from '@/lib/api';

const POLL_INTERVAL_MS = 3000;

export function usePollTripWhileGenerating(
  tripId: string,
  trip: TripDetail | null,
  onUpdate: (trip: TripDetail) => void
): void {
  useEffect(() => {
    if (!trip || trip.status !== 'generating') {
      return;
    }

    let cancelled = false;

    const poll = async () => {
      try {
        const { trip: updated } = await api.getTrip(tripId);
        if (!cancelled) {
          onUpdate(updated);
        }
      } catch {
        // Ignore transient poll errors; the user can refresh manually.
      }
    };

    const interval = setInterval(poll, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [tripId, trip?.status, onUpdate]);
}
