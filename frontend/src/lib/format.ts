import type { BudgetType, TripStatus } from '@/lib/types';

export function formatBudget(budget: BudgetType): string {
  const labels: Record<BudgetType, string> = {
    low: 'Low budget',
    medium: 'Mid-range',
    high: 'Premium',
  };
  return labels[budget];
}

export function formatStatus(status: TripStatus): string {
  const labels: Record<TripStatus, string> = {
    draft: 'Draft',
    generating: 'Generating',
    generated: 'Ready',
    failed: 'Failed',
  };
  return labels[status];
}

export function formatRelativeDate(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}

export function formatInterestList(interests: string[], max = 3): string {
  if (interests.length === 0) return 'No interests';
  const shown = interests.slice(0, max).map((i) => i.charAt(0).toUpperCase() + i.slice(1));
  if (interests.length > max) {
    return `${shown.join(', ')} +${interests.length - max}`;
  }
  return shown.join(', ');
}
