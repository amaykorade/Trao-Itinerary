export type BudgetType = 'low' | 'medium' | 'high';
export type TripStatus = 'draft' | 'generating' | 'generated' | 'failed';
export type HotelTier = 'budget' | 'mid-range' | 'luxury';

export interface Activity {
  id: string;
  title: string;
  description?: string;
  category?: string;
}

export interface DayPlan {
  day: number;
  title?: string;
  activities: Activity[];
}

export interface BudgetBreakdown {
  flights: number;
  accommodation: number;
  food: number;
  activities: number;
  total: number;
  currency: string;
}

export interface HotelSuggestion {
  name: string;
  tier: HotelTier;
  rating?: number;
  priceRange?: string;
  description?: string;
}

export type TripVersionSource = 'regenerate_all' | 'regenerate_day';

export interface TripVersionSummary {
  id: string;
  label: string;
  savedAt: Date;
  source: TripVersionSource;
}

export interface TripVersion extends TripVersionSummary {
  itinerary: DayPlan[];
  budget: BudgetBreakdown | null;
  hotels: HotelSuggestion[];
}

export interface TripSummary {
  id: string;
  destination: string;
  numDays: number;
  budgetType: BudgetType;
  interests: string[];
  status: TripStatus;
  finalizedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface TripDetail extends TripSummary {
  itinerary: DayPlan[];
  budget: BudgetBreakdown | null;
  hotels: HotelSuggestion[];
  shareToken: string | null;
  versions: TripVersionSummary[];
}

export interface SharedTrip {
  destination: string;
  numDays: number;
  budgetType: BudgetType;
  interests: string[];
  status: TripStatus;
  finalizedAt: Date | null;
  itinerary: DayPlan[];
  budget: BudgetBreakdown | null;
  hotels: HotelSuggestion[];
}
