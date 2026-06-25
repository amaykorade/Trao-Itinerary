import mongoose, { Document, Schema, Types } from 'mongoose';
import {
  Activity,
  BudgetBreakdown,
  BudgetType,
  DayPlan,
  HotelSuggestion,
  TripStatus,
  TripVersion,
} from '../types/trip';

export interface ITrip extends Document {
  userId: Types.ObjectId;
  destination: string;
  numDays: number;
  budgetType: BudgetType;
  interests: string[];
  itinerary: DayPlan[];
  budget: BudgetBreakdown | null;
  hotels: HotelSuggestion[];
  shareToken: string | null;
  finalizedAt: Date | null;
  versions: TripVersion[];
  status: TripStatus;
  createdAt: Date;
  updatedAt: Date;
}

const activitySchema = new Schema<Activity>(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    description: String,
    category: String,
  },
  { _id: false }
);

const dayPlanSchema = new Schema<DayPlan>(
  {
    day: { type: Number, required: true },
    title: String,
    activities: { type: [activitySchema], default: [] },
  },
  { _id: false }
);

const budgetSchema = new Schema<BudgetBreakdown>(
  {
    flights: { type: Number, required: true },
    accommodation: { type: Number, required: true },
    food: { type: Number, required: true },
    activities: { type: Number, required: true },
    total: { type: Number, required: true },
    currency: { type: String, default: 'USD' },
  },
  { _id: false }
);

const hotelSchema = new Schema<HotelSuggestion>(
  {
    name: { type: String, required: true },
    tier: { type: String, enum: ['budget', 'mid-range', 'luxury'], required: true },
    rating: Number,
    priceRange: String,
    description: String,
  },
  { _id: false }
);

const tripVersionSchema = new Schema<TripVersion>(
  {
    id: { type: String, required: true },
    label: { type: String, required: true },
    savedAt: { type: Date, required: true },
    source: { type: String, enum: ['regenerate_all', 'regenerate_day'], required: true },
    itinerary: { type: [dayPlanSchema], default: [] },
    budget: { type: budgetSchema, default: null },
    hotels: { type: [hotelSchema], default: [] },
  },
  { _id: false }
);

const tripSchema = new Schema<ITrip>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    destination: { type: String, required: true, trim: true },
    numDays: { type: Number, required: true, min: 1, max: 14 },
    budgetType: { type: String, enum: ['low', 'medium', 'high'], required: true },
    interests: { type: [String], default: [] },
    itinerary: { type: [dayPlanSchema], default: [] },
    budget: { type: budgetSchema, default: null },
    hotels: { type: [hotelSchema], default: [] },
    shareToken: { type: String },
    finalizedAt: { type: Date, default: null },
    versions: { type: [tripVersionSchema], default: [] },
    status: {
      type: String,
      enum: ['draft', 'generating', 'generated', 'failed'],
      default: 'draft',
    },
  },
  { timestamps: true }
);

tripSchema.index({ userId: 1, createdAt: -1 });
tripSchema.index(
  { shareToken: 1 },
  {
    unique: true,
    partialFilterExpression: { shareToken: { $exists: true, $type: 'string' } },
  }
);

export const Trip = mongoose.model<ITrip>('Trip', tripSchema);
