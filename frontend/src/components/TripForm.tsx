'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { INTEREST_OPTIONS, type BudgetType } from '@/lib/types';
import LoadingSpinner from './LoadingSpinner';
import { Alert } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { Input, Label } from '@/components/ui/Input';

const budgetOptions: { value: BudgetType; label: string; hint: string }[] = [
  { value: 'low', label: 'Budget', hint: 'Hostels, street food, free sights' },
  { value: 'medium', label: 'Mid-range', hint: 'Comfortable hotels & mixed dining' },
  { value: 'high', label: 'Luxury', hint: 'Premium stays & experiences' },
];

export default function TripForm() {
  const router = useRouter();
  const [destination, setDestination] = useState('');
  const [numDaysInput, setNumDaysInput] = useState('3');
  const [budgetType, setBudgetType] = useState<BudgetType>('medium');
  const [interests, setInterests] = useState<string[]>(['food', 'culture']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function toggleInterest(interest: string) {
    setInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (interests.length === 0) {
      setError('Select at least one interest');
      return;
    }

    const numDays = parseInt(numDaysInput, 10);
    if (Number.isNaN(numDays) || numDays < 1 || numDays > 14) {
      setError('Enter a trip length between 1 and 14 days');
      return;
    }

    setLoading(true);
    try {
      const { trip } = await api.createTrip({
        destination,
        numDays,
        budgetType,
        interests,
      });
      router.push(`/trips/${trip.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create trip');
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <Card>
        <CardBody className="py-16">
          <LoadingSpinner label="Generating itinerary… usually takes 15–30 seconds." />
        </CardBody>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardBody className="space-y-8 p-6 sm:p-8">
          {error && <Alert>{error}</Alert>}

          <section className="space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
              Destination
            </h2>
            <div>
              <Label htmlFor="destination">Where are you going?</Label>
              <Input
                id="destination"
                required
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="Tokyo, Paris, Bali..."
              />
            </div>
            <div>
              <Label htmlFor="numDays" hint="Between 1 and 14 days">
                Trip length
              </Label>
              <Input
                id="numDays"
                type="number"
                min={1}
                max={14}
                required
                value={numDaysInput}
                onChange={(e) => setNumDaysInput(e.target.value)}
              />
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
              Budget
            </h2>
            <div className="grid gap-3 sm:grid-cols-3">
              {budgetOptions.map((opt) => (
                <label
                  key={opt.value}
                  className={`cursor-pointer rounded-xl border p-4 transition-all ${
                    budgetType === opt.value
                      ? 'border-teal-500 bg-teal-50 ring-2 ring-teal-500/20'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="budgetType"
                    value={opt.value}
                    checked={budgetType === opt.value}
                    onChange={() => setBudgetType(opt.value)}
                    className="sr-only"
                  />
                  <span className="block text-sm font-semibold text-slate-900">{opt.label}</span>
                  <span className="mt-1 block text-xs text-slate-500">{opt.hint}</span>
                </label>
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
              Interests
            </h2>
            <p className="text-sm text-slate-500">Select everything you&apos;d like to experience</p>
            <div className="flex flex-wrap gap-2">
              {INTEREST_OPTIONS.map((interest) => {
                const selected = interests.includes(interest);
                return (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => toggleInterest(interest)}
                    className={`rounded-full px-4 py-2 text-sm font-medium capitalize transition-all ${
                      selected
                        ? 'bg-teal-600 text-white shadow-sm shadow-teal-600/25'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {interest}
                  </button>
                );
              })}
            </div>
          </section>

          <Button type="submit" size="lg" className="w-full">
            Generate itinerary
          </Button>
        </CardBody>
      </Card>
    </form>
  );
}
