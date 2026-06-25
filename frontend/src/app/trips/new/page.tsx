'use client';

import { useRequireAuth } from '@/context/AuthContext';
import TripForm from '@/components/TripForm';
import LoadingSpinner from '@/components/LoadingSpinner';
import { PageHeader } from '@/components/ui/PageHeader';

export default function NewTripPage() {
  const { user, loading } = useRequireAuth();

  if (loading || !user) return <LoadingSpinner fullPage />;

  return (
    <div className="mesh-bg min-h-full">
      <div className="app-container py-8 sm:py-10">
        <PageHeader
          title="Plan a new trip"
          description="Enter trip details to generate a plan."
        />
        <TripForm />
      </div>
    </div>
  );
}
