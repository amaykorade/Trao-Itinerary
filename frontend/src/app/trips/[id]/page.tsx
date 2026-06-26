'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Calendar, ChevronRight, Share2 } from 'lucide-react';
import { useRequireAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import type { TripDetail } from '@/lib/types';
import LoadingSpinner from '@/components/LoadingSpinner';
import ItineraryDay from '@/components/ItineraryDay';
import BudgetCard from '@/components/BudgetCard';
import HotelList from '@/components/HotelList';
import TripVersionHistory from '@/components/TripVersionHistory';
import { TripActionsMenu } from '@/components/TripActionsMenu';
import { ShareTripModal, buildShareUrl } from '@/components/ShareTripModal';
import { AddActivityModal, ConfirmModal, RegenerateDayModal } from '@/components/Modals';
import { Alert } from '@/components/ui/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { usePollTripWhileGenerating } from '@/hooks/usePollTripWhileGenerating';

function withTripVersions(trip: TripDetail): TripDetail {
  return { ...trip, versions: trip.versions ?? [] };
}

export default function TripDetailPage() {
  const params = useParams();
  const router = useRouter();
  const tripId = params.id as string;
  const { user, loading: authLoading } = useRequireAuth();

  const [trip, setTrip] = useState<TripDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [finalizeOpen, setFinalizeOpen] = useState(false);
  const [regenerateAllOpen, setRegenerateAllOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [revokeShareOpen, setRevokeShareOpen] = useState(false);
  const [restoreVersionId, setRestoreVersionId] = useState<string | null>(null);

  const [addDay, setAddDay] = useState<number | null>(null);
  const [regenDay, setRegenDay] = useState<number | null>(null);

  const isFinalized = Boolean(trip?.finalizedAt);

  const loadTrip = useCallback(async () => {
    const { trip } = await api.getTrip(tripId);
    setTrip(withTripVersions(trip));
  }, [tripId]);

  const handleTripPollUpdate = useCallback((updated: TripDetail) => {
    setTrip(withTripVersions(updated));
  }, []);

  usePollTripWhileGenerating(tripId, trip, handleTripPollUpdate);

  useEffect(() => {
    if (!user) return;
    loadTrip()
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load trip'))
      .finally(() => setLoading(false));
  }, [user, loadTrip]);

  async function withBusy<T>(fn: () => Promise<T>): Promise<T> {
    setBusy(true);
    try {
      return await fn();
    } finally {
      setBusy(false);
    }
  }

  async function handleRemove(activityId: string) {
    await withBusy(async () => {
      const { trip: updated } = await api.removeActivity(tripId, activityId);
      setTrip(withTripVersions(updated));
    });
  }

  async function handleAddActivity(data: {
    title: string;
    description?: string;
    category?: string;
  }) {
    if (addDay === null) return;
    await withBusy(async () => {
      const { trip: updated } = await api.addActivity(tripId, { day: addDay, ...data });
      setTrip(withTripVersions(updated));
    });
  }

  async function handleRegenerateDay(prompt: string) {
    if (regenDay === null) return;
    await withBusy(async () => {
      const { trip: updated } = await api.regenerateDay(tripId, regenDay, prompt || undefined);
      setTrip(withTripVersions(updated));
    });
  }

  async function handleReorder(day: number, activityIds: string[]) {
    const previousTrip = trip;
    if (!previousTrip || isFinalized) return;

    setTrip({
      ...previousTrip,
      itinerary: previousTrip.itinerary.map((dayPlan) => {
        if (dayPlan.day !== day) return dayPlan;

        const byId = new Map(dayPlan.activities.map((activity) => [activity.id, activity]));
        return {
          ...dayPlan,
          activities: activityIds
            .map((id) => byId.get(id))
            .filter((activity): activity is NonNullable<typeof activity> => Boolean(activity)),
        };
      }),
    });

    try {
      const { trip: updated } = await api.reorderActivities(tripId, day, activityIds);
      setTrip(withTripVersions(updated));
    } catch (err) {
      setTrip(previousTrip);
      setError(err instanceof Error ? err.message : 'Failed to reorder activities');
    }
  }

  async function handleRegenerateAll() {
    try {
      const { trip: updated } = await api.regenerateTrip(tripId);
      setTrip(withTripVersions(updated));
      setRegenerateAllOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to regenerate trip');
      setRegenerateAllOpen(false);
    }
  }

  async function handleRetryGeneration() {
    try {
      const { trip: updated } = await api.regenerateTrip(tripId);
      setTrip(withTripVersions(updated));
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to retry generation');
    }
  }

  async function handleDelete() {
    await withBusy(async () => {
      await api.deleteTrip(tripId);
      setDeleteOpen(false);
      router.push('/dashboard');
    });
  }

  async function handleFinalize() {
    await withBusy(async () => {
      const { trip: updated } = await api.finalizeTrip(tripId);
      setTrip(withTripVersions(updated));
      setFinalizeOpen(false);
    });
  }

  async function handleUnfinalize() {
    await withBusy(async () => {
      const { trip: updated } = await api.unfinalizeTrip(tripId);
      setTrip(withTripVersions(updated));
    });
  }

  async function handleEnableShare() {
    await withBusy(async () => {
      const { trip: updated } = await api.enableTripShare(tripId);
      setTrip(withTripVersions(updated));
    });
  }

  async function handleDisableShare() {
    await withBusy(async () => {
      const { trip: updated } = await api.disableTripShare(tripId);
      setTrip(withTripVersions(updated));
      setRevokeShareOpen(false);
    });
  }

  async function handleRestoreVersion() {
    if (!restoreVersionId) return;
    await withBusy(async () => {
      const { trip: updated } = await api.restoreTripVersion(tripId, restoreVersionId);
      setTrip(withTripVersions(updated));
      setRestoreVersionId(null);
    });
  }

  if (authLoading || loading) {
    return <LoadingSpinner fullPage label="Loading your trip..." />;
  }

  if (error || !trip) {
    return (
      <div className="app-container py-16 text-center">
        <Alert>{error || 'Trip not found'}</Alert>
        <Link href="/dashboard" className="mt-4 inline-block text-sm font-medium text-teal-700 hover:underline">
          Back to My Trips
        </Link>
      </div>
    );
  }

  const restoreVersion = trip.versions.find((version) => version.id === restoreVersionId);

  const shareUrl = trip.shareToken ? buildShareUrl(trip.shareToken) : null;
  const isGenerating = trip.status === 'generating';
  const isFailed = trip.status === 'failed';

  return (
    <div className="min-h-full bg-slate-50">
      <div className="app-container py-6 sm:py-8">
        <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1.5 text-sm text-slate-500">
          <Link href="/dashboard" className="font-medium transition hover:text-teal-700">
            My Trips
          </Link>
          <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden />
          <span className="truncate font-medium text-slate-900">{trip.destination}</span>
        </nav>

        {isFinalized && (
          <div className="mb-4 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm text-indigo-900">
            This trip is finalized. Unlock it from the menu to edit.
          </div>
        )}

        {isFailed && (
          <div className="mb-4 flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900 sm:flex-row sm:items-center sm:justify-between">
            <p>Itinerary generation failed. You can try again or edit trip details from the menu.</p>
            <Button variant="outline" size="sm" onClick={handleRetryGeneration} disabled={busy}>
              Try again
            </Button>
          </div>
        )}

        <header className="mb-6 flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                {trip.destination}
              </h1>
              <Badge tone={trip.status}>{trip.status}</Badge>
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
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShareOpen(true)}
              disabled={busy || trip.status !== 'generated'}
            >
              <Share2 className="h-4 w-4" />
              Share
            </Button>
            <TripActionsMenu
              disabled={busy || isGenerating}
              busy={busy}
              finalized={isFinalized}
              onRegenerate={() => setRegenerateAllOpen(true)}
              onDelete={() => setDeleteOpen(true)}
              onFinalize={() => setFinalizeOpen(true)}
              onUnfinalize={handleUnfinalize}
            />
          </div>
        </header>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-10">
          <section className="min-w-0 space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">Itinerary</h2>
            {isGenerating ? (
              <div className="rounded-xl border border-amber-200 bg-white px-6 py-12">
                <LoadingSpinner label="Generating your itinerary… This usually takes 15–30 seconds. You can leave and come back." />
              </div>
            ) : trip.itinerary.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
                <p className="text-sm text-slate-500">No itinerary yet. Try regenerating the full trip.</p>
                {!isFinalized && (
                  <Button variant="outline" size="sm" className="mt-4" onClick={() => setRegenerateAllOpen(true)}>
                    Regenerate trip
                  </Button>
                )}
              </div>
            ) : (
              trip.itinerary.map((day) => (
                <ItineraryDay
                  key={day.day}
                  day={day}
                  readOnly={isFinalized || isGenerating}
                  busy={busy || isFinalized || isGenerating}
                  onRemove={handleRemove}
                  onRegenerate={setRegenDay}
                  onAdd={setAddDay}
                  onReorder={handleReorder}
                />
              ))
            )}
          </section>

          <aside className="trip-sidebar-panel">
            {trip.budget && <BudgetCard budget={trip.budget} />}
            <HotelList hotels={trip.hotels} />
            <TripVersionHistory
              versions={trip.versions}
              disabled={busy || isFinalized}
              onRestore={setRestoreVersionId}
            />
          </aside>
        </div>
      </div>

      <ConfirmModal
        open={finalizeOpen}
        title="Finalize trip"
        description="Lock the itinerary. You can unlock it later from the trip menu."
        confirmLabel="Finalize trip"
        loading={busy}
        onClose={() => setFinalizeOpen(false)}
        onConfirm={handleFinalize}
      />

      <ConfirmModal
        open={regenerateAllOpen}
        title="Regenerate entire trip"
        description="Replace the full itinerary with a new generated plan. The current version is saved first. Generation runs in the background."
        confirmLabel="Regenerate all"
        loading={false}
        onClose={() => setRegenerateAllOpen(false)}
        onConfirm={handleRegenerateAll}
      />

      <ConfirmModal
        open={restoreVersionId !== null}
        title="Restore saved version"
        description={
          restoreVersion
            ? `Restore "${restoreVersion.label}" from ${new Intl.DateTimeFormat(undefined, {
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
              }).format(new Date(restoreVersion.savedAt))}? Your current itinerary will be replaced.`
            : 'Restore this saved version? Your current itinerary will be replaced.'
        }
        confirmLabel="Restore version"
        loading={busy}
        onClose={() => setRestoreVersionId(null)}
        onConfirm={handleRestoreVersion}
      />

      <ConfirmModal
        open={revokeShareOpen}
        title="Revoke share link"
        description="Anyone with the current link will no longer be able to view this trip."
        confirmLabel="Revoke link"
        confirmVariant="danger"
        loading={busy}
        onClose={() => setRevokeShareOpen(false)}
        onConfirm={handleDisableShare}
      />

      <ConfirmModal
        open={deleteOpen}
        title="Delete trip"
        description="Delete this trip permanently."
        confirmLabel="Delete trip"
        confirmVariant="danger"
        loading={busy}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
      />

      <ShareTripModal
        open={shareOpen}
        destination={trip.destination}
        shareUrl={shareUrl}
        loading={busy}
        onClose={() => setShareOpen(false)}
        onEnableShare={handleEnableShare}
        onDisableShare={() => setRevokeShareOpen(true)}
      />

      <AddActivityModal
        open={addDay !== null && !isFinalized}
        day={addDay ?? 1}
        onClose={() => setAddDay(null)}
        onSubmit={handleAddActivity}
      />

      <RegenerateDayModal
        open={regenDay !== null && !isFinalized}
        day={regenDay ?? 1}
        onClose={() => setRegenDay(null)}
        onSubmit={handleRegenerateDay}
      />
    </div>
  );
}
