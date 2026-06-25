import { z } from 'zod';
import { randomUUID } from 'crypto';
import { Trip, ITrip } from '../models/Trip';
import { AppError } from '../utils/AppError';
import { TripDetail, TripSummary, SharedTrip, TripVersionSource } from '../types/trip';
import * as openaiService from './openai.service';

const INTERESTS = [
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

const createTripSchema = z.object({
  destination: z.string().min(1, 'Destination is required').max(200),
  numDays: z.coerce.number().int().min(1).max(14),
  budgetType: z.enum(['low', 'medium', 'high']),
  interests: z
    .array(z.enum(INTERESTS))
    .min(1, 'Select at least one interest'),
});

const updateTripSchema = z
  .object({
    destination: z.string().min(1).max(200).optional(),
    numDays: z.coerce.number().int().min(1).max(14).optional(),
    budgetType: z.enum(['low', 'medium', 'high']).optional(),
    interests: z.array(z.enum(INTERESTS)).min(1).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  });

const addActivitySchema = z.object({
  day: z.coerce.number().int().min(1),
  title: z.string().min(1, 'Activity title is required').max(200),
  description: z.string().max(500).optional(),
  category: z.string().max(50).optional(),
});

const regenerateDaySchema = z.object({
  prompt: z.string().max(500).optional(),
});

const reorderActivitiesSchema = z.object({
  activityIds: z
    .array(z.string().uuid('Each activity id must be a valid UUID'))
    .min(1, 'At least one activity id is required'),
});

const MAX_TRIP_VERSIONS = 10;
const MAX_TRIPS_PER_USER = 20;

function cloneTripSnapshot(trip: ITrip) {
  return {
    itinerary: JSON.parse(JSON.stringify(trip.itinerary)),
    budget: trip.budget ? JSON.parse(JSON.stringify(trip.budget)) : null,
    hotels: JSON.parse(JSON.stringify(trip.hotels)),
  };
}

function saveVersionBeforeRegenerate(
  trip: ITrip,
  source: TripVersionSource,
  detail?: string
): void {
  if (trip.status !== 'generated' || trip.itinerary.length === 0) return;

  const label =
    source === 'regenerate_all'
      ? 'Before full regenerate'
      : detail
        ? `Before Day ${detail} regenerate`
        : 'Before day regenerate';

  const version = {
    id: randomUUID(),
    label,
    savedAt: new Date(),
    source,
    ...cloneTripSnapshot(trip),
  };

  if (!trip.versions) trip.versions = [];
  trip.versions.unshift(version);
  if (trip.versions.length > MAX_TRIP_VERSIONS) {
    trip.versions = trip.versions.slice(0, MAX_TRIP_VERSIONS);
  }
  trip.markModified('versions');
}

function requireGeneratedTrip(trip: ITrip): void {
  if (trip.status !== 'generated' || trip.itinerary.length === 0) {
    throw new AppError(400, 'Trip must have a generated itinerary before editing');
  }
}

function requireEditableTrip(trip: ITrip): void {
  if (trip.finalizedAt) {
    throw new AppError(400, 'This trip is finalized and cannot be edited. Unlock it to make changes.');
  }
}

function findDayIndex(trip: ITrip, dayNumber: number): number {
  const index = trip.itinerary.findIndex((d) => d.day === dayNumber);
  if (index === -1) {
    throw new AppError(404, `Day ${dayNumber} not found in itinerary`);
  }
  return index;
}


function toTripSummary(trip: ITrip): TripSummary {
  return {
    id: trip._id.toString(),
    destination: trip.destination,
    numDays: trip.numDays,
    budgetType: trip.budgetType,
    interests: trip.interests,
    status: trip.status,
    finalizedAt: trip.finalizedAt,
    createdAt: trip.createdAt,
    updatedAt: trip.updatedAt,
  };
}

function toTripDetail(trip: ITrip): TripDetail {
  return {
    ...toTripSummary(trip),
    itinerary: trip.itinerary,
    budget: trip.budget,
    hotels: trip.hotels,
    shareToken: trip.shareToken ?? null,
    versions: (trip.versions || []).map((version) => ({
      id: version.id,
      label: version.label,
      savedAt: version.savedAt,
      source: version.source,
    })),
  };
}

function toSharedTrip(trip: ITrip): SharedTrip {
  return {
    destination: trip.destination,
    numDays: trip.numDays,
    budgetType: trip.budgetType,
    interests: trip.interests,
    status: trip.status,
    finalizedAt: trip.finalizedAt,
    itinerary: trip.itinerary,
    budget: trip.budget,
    hotels: trip.hotels,
  };
}

async function findOwnedTrip(tripId: string, userId: string): Promise<ITrip> {
  const trip = await Trip.findOne({ _id: tripId, userId });
  if (!trip) {
    throw new AppError(404, 'Trip not found');
  }
  return trip;
}

async function applyGeneratedPlan(trip: ITrip): Promise<ITrip> {
  if (trip.status === 'generating') {
    throw new AppError(409, 'This trip is already being generated. Please wait.');
  }

  trip.status = 'generating';
  await trip.save();

  try {
    const generated = await openaiService.generateFullItinerary(trip);
    trip.itinerary = generated.itinerary;
    trip.budget = generated.budget;
    trip.hotels = generated.hotels;
    trip.status = 'generated';
    await trip.save();
    return trip;
  } catch (err) {
    trip.status = 'failed';
    await trip.save();
    throw err;
  }
}

export async function listTrips(userId: string): Promise<TripSummary[]> {
  const trips = await Trip.find({ userId }).sort({ createdAt: -1 });
  return trips.map(toTripSummary);
}

export async function createTrip(userId: string, input: unknown): Promise<TripDetail> {
  const data = createTripSchema.parse(input);

  const tripCount = await Trip.countDocuments({ userId });
  if (tripCount >= MAX_TRIPS_PER_USER) {
    throw new AppError(
      429,
      `Trip limit reached (${MAX_TRIPS_PER_USER}). Delete an existing trip to create a new one.`
    );
  }

  const trip = await Trip.create({
    userId,
    destination: data.destination,
    numDays: data.numDays,
    budgetType: data.budgetType,
    interests: data.interests,
  });

  const generated = await applyGeneratedPlan(trip);
  return toTripDetail(generated);
}

export async function generateTrip(tripId: string, userId: string): Promise<TripDetail> {
  const trip = await findOwnedTrip(tripId, userId);
  requireEditableTrip(trip);
  saveVersionBeforeRegenerate(trip, 'regenerate_all');
  if (trip.isModified('versions')) {
    await trip.save();
  }
  const generated = await applyGeneratedPlan(trip);
  return toTripDetail(generated);
}

export async function getTrip(tripId: string, userId: string): Promise<TripDetail> {
  const trip = await findOwnedTrip(tripId, userId);
  return toTripDetail(trip);
}

export async function updateTrip(
  tripId: string,
  userId: string,
  input: unknown
): Promise<TripDetail> {
  const data = updateTripSchema.parse(input);
  const trip = await findOwnedTrip(tripId, userId);
  requireEditableTrip(trip);

  if (data.destination !== undefined) trip.destination = data.destination;
  if (data.numDays !== undefined) trip.numDays = data.numDays;
  if (data.budgetType !== undefined) trip.budgetType = data.budgetType;
  if (data.interests !== undefined) trip.interests = data.interests;

  await trip.save();
  return toTripDetail(trip);
}

export async function deleteTrip(tripId: string, userId: string): Promise<void> {
  const result = await Trip.deleteOne({ _id: tripId, userId });
  if (result.deletedCount === 0) {
    throw new AppError(404, 'Trip not found');
  }
}

export async function addActivity(
  tripId: string,
  userId: string,
  input: unknown
): Promise<TripDetail> {
  const data = addActivitySchema.parse(input);
  const trip = await findOwnedTrip(tripId, userId);
  requireGeneratedTrip(trip);
  requireEditableTrip(trip);

  if (data.day > trip.numDays) {
    throw new AppError(400, `Day must be between 1 and ${trip.numDays}`);
  }

  const dayIndex = findDayIndex(trip, data.day);

  trip.itinerary[dayIndex].activities.push({
    id: randomUUID(),
    title: data.title,
    description: data.description,
    category: data.category,
  });

  trip.markModified('itinerary');
  await trip.save();
  return toTripDetail(trip);
}

export async function removeActivity(
  tripId: string,
  userId: string,
  activityId: string
): Promise<TripDetail> {
  const trip = await findOwnedTrip(tripId, userId);
  requireGeneratedTrip(trip);
  requireEditableTrip(trip);

  let removed = false;
  for (const day of trip.itinerary) {
    const index = day.activities.findIndex((a) => a.id === activityId);
    if (index !== -1) {
      day.activities.splice(index, 1);
      removed = true;
      break;
    }
  }

  if (!removed) {
    throw new AppError(404, 'Activity not found');
  }

  trip.markModified('itinerary');
  await trip.save();
  return toTripDetail(trip);
}

export async function regenerateDay(
  tripId: string,
  userId: string,
  dayNumber: number,
  input: unknown
): Promise<TripDetail> {
  const data = regenerateDaySchema.parse(input ?? {});
  const trip = await findOwnedTrip(tripId, userId);
  requireGeneratedTrip(trip);
  requireEditableTrip(trip);

  if (dayNumber < 1 || dayNumber > trip.numDays) {
    throw new AppError(400, `Day must be between 1 and ${trip.numDays}`);
  }

  findDayIndex(trip, dayNumber);

  saveVersionBeforeRegenerate(trip, 'regenerate_day', String(dayNumber));
  if (trip.isModified('versions')) {
    await trip.save();
  }

  const newDay = await openaiService.regenerateDay(trip, dayNumber, data.prompt);
  const dayIndex = trip.itinerary.findIndex((d) => d.day === dayNumber);
  trip.itinerary[dayIndex] = newDay;

  trip.markModified('itinerary');
  await trip.save();
  return toTripDetail(trip);
}

export async function reorderActivities(
  tripId: string,
  userId: string,
  dayNumber: number,
  input: unknown
): Promise<TripDetail> {
  const data = reorderActivitiesSchema.parse(input);
  const trip = await findOwnedTrip(tripId, userId);
  requireGeneratedTrip(trip);
  requireEditableTrip(trip);

  if (dayNumber < 1 || dayNumber > trip.numDays) {
    throw new AppError(400, `Day must be between 1 and ${trip.numDays}`);
  }

  const dayIndex = findDayIndex(trip, dayNumber);
  const activities = trip.itinerary[dayIndex].activities;

  if (data.activityIds.length !== activities.length) {
    throw new AppError(
      400,
      'activityIds must include every activity on this day exactly once'
    );
  }

  const activityById = new Map(activities.map((activity) => [activity.id, activity]));
  const seen = new Set<string>();

  for (const activityId of data.activityIds) {
    if (!activityById.has(activityId)) {
      throw new AppError(400, 'One or more activities do not belong to this day');
    }
    if (seen.has(activityId)) {
      throw new AppError(400, 'activityIds must not contain duplicates');
    }
    seen.add(activityId);
  }

  trip.itinerary[dayIndex].activities = data.activityIds.map(
    (activityId) => activityById.get(activityId)!
  );

  trip.markModified('itinerary');
  await trip.save();
  return toTripDetail(trip);
}

export async function finalizeTrip(tripId: string, userId: string): Promise<TripDetail> {
  const trip = await findOwnedTrip(tripId, userId);
  requireGeneratedTrip(trip);

  if (trip.finalizedAt) {
    throw new AppError(400, 'Trip is already finalized');
  }

  trip.finalizedAt = new Date();
  await trip.save();
  return toTripDetail(trip);
}

export async function unfinalizeTrip(tripId: string, userId: string): Promise<TripDetail> {
  const trip = await findOwnedTrip(tripId, userId);

  if (!trip.finalizedAt) {
    throw new AppError(400, 'Trip is not finalized');
  }

  trip.finalizedAt = null;
  await trip.save();
  return toTripDetail(trip);
}

export async function enableTripShare(tripId: string, userId: string): Promise<TripDetail> {
  const trip = await findOwnedTrip(tripId, userId);
  requireGeneratedTrip(trip);

  if (!trip.shareToken) {
    trip.shareToken = randomUUID();
  }

  await trip.save();
  return toTripDetail(trip);
}

export async function disableTripShare(tripId: string, userId: string): Promise<TripDetail> {
  const trip = await findOwnedTrip(tripId, userId);

  await Trip.updateOne({ _id: trip._id }, { $unset: { shareToken: '' } });

  const updated = await findOwnedTrip(tripId, userId);
  return toTripDetail(updated);
}

export async function getSharedTrip(shareToken: string): Promise<SharedTrip> {
  const trip = await Trip.findOne({ shareToken });

  if (!trip || trip.status !== 'generated' || trip.itinerary.length === 0) {
    throw new AppError(404, 'Shared trip not found');
  }

  return toSharedTrip(trip);
}

export async function restoreTripVersion(
  tripId: string,
  userId: string,
  versionId: string
): Promise<TripDetail> {
  const trip = await findOwnedTrip(tripId, userId);
  requireGeneratedTrip(trip);
  requireEditableTrip(trip);

  const version = (trip.versions || []).find((entry) => entry.id === versionId);
  if (!version) {
    throw new AppError(404, 'Version not found');
  }

  trip.itinerary = JSON.parse(JSON.stringify(version.itinerary));
  trip.budget = version.budget ? JSON.parse(JSON.stringify(version.budget)) : null;
  trip.hotels = JSON.parse(JSON.stringify(version.hotels));
  trip.markModified('itinerary');
  trip.markModified('budget');
  trip.markModified('hotels');
  await trip.save();
  return toTripDetail(trip);
}


export { INTERESTS };
