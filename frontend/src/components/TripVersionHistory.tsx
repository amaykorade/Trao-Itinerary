'use client';

import { History, RotateCcw } from 'lucide-react';
import type { TripVersionSummary } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';

function formatSavedAt(savedAt: string): string {
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(savedAt));
}

interface TripVersionHistoryProps {
  versions: TripVersionSummary[];
  disabled?: boolean;
  onRestore: (versionId: string) => void;
}

export default function TripVersionHistory({
  versions,
  disabled,
  onRestore,
}: TripVersionHistoryProps) {
  if (versions.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <History className="h-5 w-5 text-teal-600" />
          <h3 className="font-semibold text-slate-900">Saved versions</h3>
        </div>
      </CardHeader>
      <CardBody className="space-y-3">
        <ul className="space-y-2">
          {versions.map((version) => (
            <li
              key={version.id}
              className="flex items-start justify-between gap-3 rounded-lg border border-slate-100 bg-slate-50/80 px-3 py-2.5"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-900">{version.label}</p>
                <p className="text-xs text-slate-500">{formatSavedAt(version.savedAt)}</p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="shrink-0"
                disabled={disabled}
                onClick={() => onRestore(version.id)}
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Restore
              </Button>
            </li>
          ))}
        </ul>
      </CardBody>
    </Card>
  );
}
