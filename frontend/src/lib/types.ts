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
  savedAt: string;
  source: TripVersionSource;
}

export interface TripSummary {
  id: string;
  destination: string;
  numDays: number;
  budgetType: BudgetType;
  interests: string[];
  status: TripStatus;
  finalizedAt: string | null;
  createdAt: string;
  updatedAt: string;
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
  finalizedAt: string | null;
  itinerary: DayPlan[];
  budget: BudgetBreakdown | null;
  hotels: HotelSuggestion[];
}

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export const INTEREST_OPTIONS = [
  'food',
  'culture',
  'adventure',
  'shopping',
  'nature',
  'nightlife',
  'history',
  'art',
  'relaxation',
] as const;

export type Interest = (typeof INTEREST_OPTIONS)[number];
