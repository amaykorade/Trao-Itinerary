import { randomUUID } from 'crypto';
import OpenAI from 'openai';
import { env } from '../config/env';
import { ITrip } from '../models/Trip';
import {
  Activity,
  BudgetBreakdown,
  BudgetType,
  DayPlan,
  HotelSuggestion,
} from '../types/trip';
import { AppError } from '../utils/AppError';

const openai = env.OPENAI_API_KEY ? new OpenAI({ apiKey: env.OPENAI_API_KEY }) : null;

const BUDGET_GUIDANCE: Record<BudgetType, string> = {
  low: 'Budget-conscious: hostels or budget hotels, street food, free attractions, public transit.',
  medium: 'Mid-range: 3-star hotels, mix of casual and sit-down dining, popular paid attractions.',
  high: 'Luxury: 4-5 star hotels, fine dining, premium experiences and private tours.',
};

const TRIP_PLAN_SCHEMA = {
  type: 'object',
  properties: {
    itinerary: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          day: { type: 'number' },
          title: { type: 'string' },
          activities: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                description: { type: 'string' },
                category: { type: 'string' },
              },
              required: ['title', 'description', 'category'],
              additionalProperties: false,
            },
          },
        },
        required: ['day', 'title', 'activities'],
        additionalProperties: false,
      },
    },
    budget: {
      type: 'object',
      properties: {
        flights: { type: 'number' },
        accommodation: { type: 'number' },
        food: { type: 'number' },
        activities: { type: 'number' },
        total: { type: 'number' },
        currency: { type: 'string' },
      },
      required: ['flights', 'accommodation', 'food', 'activities', 'total', 'currency'],
      additionalProperties: false,
    },
    hotels: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          tier: { type: 'string', enum: ['budget', 'mid-range', 'luxury'] },
          rating: { type: 'number' },
          priceRange: { type: 'string' },
          description: { type: 'string' },
        },
        required: ['name', 'tier', 'rating', 'priceRange', 'description'],
        additionalProperties: false,
      },
    },
  },
  required: ['itinerary', 'budget', 'hotels'],
  additionalProperties: false,
} as const;

const DAY_PLAN_SCHEMA = {
  type: 'object',
  properties: {
    day: { type: 'number' },
    title: { type: 'string' },
    activities: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          description: { type: 'string' },
          category: { type: 'string' },
        },
        required: ['title', 'description', 'category'],
        additionalProperties: false,
      },
    },
  },
  required: ['day', 'title', 'activities'],
  additionalProperties: false,
} as const;

export interface GeneratedTripPlan {
  itinerary: DayPlan[];
  budget: BudgetBreakdown;
  hotels: HotelSuggestion[];
}

function assignActivityIds(activities: Omit<Activity, 'id'>[]): Activity[] {
  return activities.map((activity) => ({
    ...activity,
    id: randomUUID(),
  }));
}

function buildGenerationPrompt(trip: ITrip): string {
  return `Create a complete travel plan with the following details:

Destination: ${trip.destination}
Duration: ${trip.numDays} day(s)
Budget preference: ${trip.budgetType} — ${BUDGET_GUIDANCE[trip.budgetType]}
Interests: ${trip.interests.join(', ')}

Requirements:
- Return exactly ${trip.numDays} day(s) in the itinerary, numbered Day 1 through Day ${trip.numDays}.
- Each day should have 3-5 specific activities tailored to the destination and interests (not generic placeholders).
- Activities must be real, recognizable places or experiences for ${trip.destination}.
- Budget breakdown should be realistic USD estimates for flights (from a typical US origin), accommodation for the full stay, food, and activities.
- The total must equal flights + accommodation + food + activities.
- Suggest exactly 3 hotels: one budget, one mid-range, and one luxury option in or near ${trip.destination}.
- Hotel ratings should be on a 1-5 scale.`;
}

export async function generateFullItinerary(trip: ITrip): Promise<GeneratedTripPlan> {
  if (!openai) {
    throw new AppError(503, 'AI service is not configured. Set OPENAI_API_KEY.');
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are an expert travel planner. Generate detailed, realistic itineraries with accurate local recommendations. Always respond with valid JSON matching the provided schema.',
        },
        {
          role: 'user',
          content: buildGenerationPrompt(trip),
        },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'trip_plan',
          strict: true,
          schema: TRIP_PLAN_SCHEMA,
        },
      },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('Empty response from OpenAI');
    }

    const parsed = JSON.parse(content) as {
      itinerary: Array<{ day: number; title: string; activities: Omit<Activity, 'id'>[] }>;
      budget: BudgetBreakdown;
      hotels: HotelSuggestion[];
    };

    const itinerary: DayPlan[] = parsed.itinerary.map((day) => ({
      day: day.day,
      title: day.title,
      activities: assignActivityIds(day.activities),
    }));

    return {
      itinerary,
      budget: parsed.budget,
      hotels: parsed.hotels,
    };
  } catch (err) {
    console.error('OpenAI generation failed:', err);
    throw new AppError(502, 'Failed to generate itinerary. Please try again.');
  }
}

function summarizeItinerary(trip: ITrip, excludeDay?: number): string {
  return trip.itinerary
    .filter((d) => d.day !== excludeDay)
    .map(
      (d) =>
        `Day ${d.day} (${d.title ?? 'Untitled'}): ${d.activities.map((a) => a.title).join(', ') || 'no activities'}`
    )
    .join('\n');
}

export async function regenerateDay(
  trip: ITrip,
  dayNumber: number,
  prompt?: string
): Promise<DayPlan> {
  if (!openai) {
    throw new AppError(503, 'AI service is not configured. Set OPENAI_API_KEY.');
  }

  const otherDays = summarizeItinerary(trip, dayNumber);
  const userInstruction =
    prompt?.trim() ||
    `Create a fresh plan for Day ${dayNumber} with activities matching the trip interests.`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are an expert travel planner. Regenerate a single day of an itinerary with specific, realistic local recommendations. Avoid duplicating activities from other days.',
        },
        {
          role: 'user',
          content: `Regenerate Day ${dayNumber} for a trip to ${trip.destination}.

Trip context:
- Duration: ${trip.numDays} days
- Budget: ${trip.budgetType} — ${BUDGET_GUIDANCE[trip.budgetType]}
- Interests: ${trip.interests.join(', ')}

Activities on other days (do NOT repeat these):
${otherDays || 'None yet'}

User request: ${userInstruction}

Return exactly 3-5 activities for Day ${dayNumber}. Use day number ${dayNumber} in the response.`,
        },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'day_plan',
          strict: true,
          schema: DAY_PLAN_SCHEMA,
        },
      },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('Empty response from OpenAI');
    }

    const parsed = JSON.parse(content) as {
      day: number;
      title: string;
      activities: Omit<Activity, 'id'>[];
    };

    return {
      day: dayNumber,
      title: parsed.title,
      activities: assignActivityIds(parsed.activities),
    };
  } catch (err) {
    console.error('OpenAI day regeneration failed:', err);
    throw new AppError(502, 'Failed to regenerate day. Please try again.');
  }
}

