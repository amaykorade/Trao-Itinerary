import type { BudgetBreakdown } from '@/lib/types';
import { Plane, Utensils, Hotel, Ticket, Wallet } from 'lucide-react';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';

const items = [
  { key: 'flights' as const, label: 'Flights', icon: Plane },
  { key: 'accommodation' as const, label: 'Accommodation', icon: Hotel },
  { key: 'food' as const, label: 'Food', icon: Utensils },
  { key: 'activities' as const, label: 'Activities', icon: Ticket },
];

export default function BudgetCard({ budget }: { budget: BudgetBreakdown }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Wallet className="h-5 w-5 text-teal-600" />
          <h3 className="font-semibold text-slate-900">Estimated Budget</h3>
        </div>
      </CardHeader>
      <CardBody className="space-y-3">
        {items.map(({ key, label, icon: Icon }) => (
          <div key={key} className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-slate-600">
              <Icon className="h-4 w-4 text-slate-400" />
              {label}
            </span>
            <span className="font-medium text-slate-900">
              ${budget[key].toLocaleString()}
            </span>
          </div>
        ))}
        <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-4">
          <span className="font-semibold text-slate-900">Total estimate</span>
          <span className="text-xl font-bold text-teal-700">
            ${budget.total.toLocaleString()}
            <span className="ml-1 text-sm font-normal text-slate-400">{budget.currency}</span>
          </span>
        </div>
        <p className="text-xs leading-relaxed text-slate-400">
          Estimates only — not live prices.
        </p>
      </CardBody>
    </Card>
  );
}
