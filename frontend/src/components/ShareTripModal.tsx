'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, Copy, Link2, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface ShareTripModalProps {
  open: boolean;
  destination: string;
  shareUrl: string | null;
  loading?: boolean;
  onClose: () => void;
  onEnableShare: () => void;
  onDisableShare: () => void;
}

export function ShareTripModal({
  open,
  destination,
  shareUrl,
  loading,
  onClose,
  onEnableShare,
  onDisableShare,
}: ShareTripModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open) {
      dialog.showModal();
      setCopied(false);
    } else {
      dialog.close();
    }
  }, [open]);

  async function handleCopy() {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (!open) return null;

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="w-[min(100%,28rem)] max-w-lg rounded-2xl border border-slate-200 bg-white p-0 shadow-xl backdrop:bg-slate-900/40"
    >
      <div className="border-b border-slate-100 px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Share trip</h2>
            <p className="mt-1 text-sm text-slate-500">
              Send a read-only link for <span className="font-medium text-slate-700">{destination}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="space-y-4 px-5 py-4">
        {!shareUrl ? (
          <>
            <p className="text-sm text-slate-600">
              Partners can view the itinerary without an account. They cannot edit it.
            </p>
            <Button onClick={onEnableShare} disabled={loading} className="w-full">
              <Link2 className="h-4 w-4" />
              Create share link
            </Button>
          </>
        ) : (
          <>
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
              <p className="break-all text-sm text-slate-700">{shareUrl}</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCopy} disabled={loading} className="flex-1">
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? 'Copied' : 'Copy link'}
              </Button>
              <Button variant="outline" onClick={onDisableShare} disabled={loading}>
                Revoke
              </Button>
            </div>
            <p className="text-xs text-slate-400">Revoke to disable the link.</p>
          </>
        )}
      </div>
    </dialog>
  );
}

export function buildShareUrl(shareToken: string): string {
  if (typeof window === 'undefined') return `/share/${shareToken}`;
  return `${window.location.origin}/share/${shareToken}`;
}
