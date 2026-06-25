'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input, Label, Textarea } from '@/components/ui/Input';
import { Alert } from '@/components/ui/PageHeader';

interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

export function Modal({ open, title, onClose, children }: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md animate-fade-in rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

interface AddActivityModalProps {
  open: boolean;
  day: number;
  onClose: () => void;
  onSubmit: (data: { title: string; description?: string; category?: string }) => Promise<void>;
}

export function AddActivityModal({ open, day, onClose, onSubmit }: AddActivityModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await onSubmit({
        title,
        description: description || undefined,
        category: category || undefined,
      });
      setTitle('');
      setDescription('');
      setCategory('');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add activity');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={open} title={`Add activity — Day ${day}`} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert>{error}</Alert>}
        <div>
          <Label htmlFor="activity-title">Activity name</Label>
          <Input
            id="activity-title"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Senso-ji Temple"
          />
        </div>
        <div>
          <Label htmlFor="activity-desc">Description</Label>
          <Textarea
            id="activity-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            placeholder="What makes this worth visiting?"
          />
        </div>
        <div>
          <Label htmlFor="activity-cat">Category</Label>
          <Input
            id="activity-cat"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="food, culture, adventure..."
          />
        </div>
        <Button type="submit" disabled={loading} className="w-full" size="lg">
          {loading ? 'Adding...' : 'Add to itinerary'}
        </Button>
      </form>
    </Modal>
  );
}

interface RegenerateDayModalProps {
  open: boolean;
  day: number;
  onClose: () => void;
  onSubmit: (prompt: string) => Promise<void>;
}

export function RegenerateDayModal({ open, day, onClose, onSubmit }: RegenerateDayModalProps) {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await onSubmit(prompt);
      setPrompt('');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to regenerate day');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={open} title={`Regenerate Day ${day}`} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert>{error}</Alert>}
        <p className="text-sm text-slate-500">
          Optional notes for how this day should change. Leave blank to regenerate from scratch.
        </p>
        <div>
          <Label htmlFor="regen-prompt">Instructions (optional)</Label>
          <Textarea
            id="regen-prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={3}
            placeholder="More outdoor activities, less touristy spots..."
          />
        </div>
        <Button type="submit" disabled={loading} className="w-full" size="lg">
          {loading ? 'Regenerating...' : 'Regenerate day'}
        </Button>
      </form>
    </Modal>
  );
}

interface ConfirmModalProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  loading?: boolean;
  confirmVariant?: 'primary' | 'danger';
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
}

export function ConfirmModal({
  open,
  title,
  description,
  confirmLabel,
  loading,
  confirmVariant = 'primary',
  onClose,
  onConfirm,
}: ConfirmModalProps) {
  return (
    <Modal open={open} title={title} onClose={onClose}>
      <div className="space-y-5">
        <p className="text-sm leading-relaxed text-slate-600">{description}</p>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="button"
            variant={confirmVariant}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Please wait...' : confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
