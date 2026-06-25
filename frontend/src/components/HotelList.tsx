import type { HotelSuggestion } from '@/lib/types';
import { Building2, Star } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';

export default function HotelList({ hotels }: { hotels: HotelSuggestion[] }) {
  if (hotels.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-teal-600" />
          <h3 className="font-semibold text-slate-900">Recommended Hotels</h3>
        </div>
      </CardHeader>
      <CardBody className="space-y-4">
        {hotels.map((hotel) => (
          <div
            key={hotel.name}
            className="rounded-xl border border-slate-100 bg-slate-50/50 p-4"
          >
            <div className="flex items-start justify-between gap-2">
              <h4 className="font-medium text-slate-900">{hotel.name}</h4>
              <Badge tone={hotel.tier}>{hotel.tier.replace('-', ' ')}</Badge>
            </div>
            {hotel.rating && (
              <p className="mt-1.5 flex items-center gap-1 text-sm text-amber-600">
                <Star className="h-3.5 w-3.5 fill-current" />
                {hotel.rating.toFixed(1)}
              </p>
            )}
            {hotel.priceRange && (
              <p className="mt-1 text-sm font-medium text-slate-600">{hotel.priceRange}</p>
            )}
            {hotel.description && (
              <p className="mt-2 text-sm leading-relaxed text-slate-500">{hotel.description}</p>
            )}
          </div>
        ))}
      </CardBody>
    </Card>
  );
}
