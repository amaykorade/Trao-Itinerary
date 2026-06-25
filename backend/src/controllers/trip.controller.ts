import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import * as tripService from '../services/trip.service';
import { AppError } from '../utils/AppError';

function getParamId(params: AuthRequest['params'], key: string): string {
  const value = params[key];
  if (typeof value !== 'string') {
    throw new AppError(400, 'Invalid request parameter');
  }
  return value;
}

export async function listTrips(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) throw new AppError(401, 'Authentication required');
    const trips = await tripService.listTrips(req.user.id);
    res.json({ trips });
  } catch (err) {
    next(err);
  }
}

export async function createTrip(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) throw new AppError(401, 'Authentication required');
    const trip = await tripService.createTrip(req.user.id, req.body);
    res.status(201).json({ trip });
  } catch (err) {
    next(err);
  }
}

export async function getTrip(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) throw new AppError(401, 'Authentication required');
    const trip = await tripService.getTrip(getParamId(req.params, 'id'), req.user.id);
    res.json({ trip });
  } catch (err) {
    next(err);
  }
}

export async function updateTrip(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) throw new AppError(401, 'Authentication required');
    const trip = await tripService.updateTrip(getParamId(req.params, 'id'), req.user.id, req.body);
    res.json({ trip });
  } catch (err) {
    next(err);
  }
}

export async function deleteTrip(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) throw new AppError(401, 'Authentication required');
    await tripService.deleteTrip(getParamId(req.params, 'id'), req.user.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

function getParamDay(params: AuthRequest['params']): number {
  const value = params.day;
  if (typeof value !== 'string') {
    throw new AppError(400, 'Invalid day parameter');
  }
  const day = parseInt(value, 10);
  if (isNaN(day) || day < 1) {
    throw new AppError(400, 'Invalid day parameter');
  }
  return day;
}

export async function generateTrip(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) throw new AppError(401, 'Authentication required');
    const trip = await tripService.generateTrip(getParamId(req.params, 'id'), req.user.id);
    res.json({ trip });
  } catch (err) {
    next(err);
  }
}

export async function addActivity(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) throw new AppError(401, 'Authentication required');
    const trip = await tripService.addActivity(
      getParamId(req.params, 'id'),
      req.user.id,
      req.body
    );
    res.json({ trip });
  } catch (err) {
    next(err);
  }
}

export async function removeActivity(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) throw new AppError(401, 'Authentication required');
    const trip = await tripService.removeActivity(
      getParamId(req.params, 'id'),
      req.user.id,
      getParamId(req.params, 'activityId')
    );
    res.json({ trip });
  } catch (err) {
    next(err);
  }
}

export async function regenerateDay(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) throw new AppError(401, 'Authentication required');
    const trip = await tripService.regenerateDay(
      getParamId(req.params, 'id'),
      req.user.id,
      getParamDay(req.params),
      req.body
    );
    res.json({ trip });
  } catch (err) {
    next(err);
  }
}

export async function reorderActivities(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) throw new AppError(401, 'Authentication required');
    const trip = await tripService.reorderActivities(
      getParamId(req.params, 'id'),
      req.user.id,
      getParamDay(req.params),
      req.body
    );
    res.json({ trip });
  } catch (err) {
    next(err);
  }
}

export async function finalizeTrip(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) throw new AppError(401, 'Authentication required');
    const trip = await tripService.finalizeTrip(getParamId(req.params, 'id'), req.user.id);
    res.json({ trip });
  } catch (err) {
    next(err);
  }
}

export async function unfinalizeTrip(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) throw new AppError(401, 'Authentication required');
    const trip = await tripService.unfinalizeTrip(getParamId(req.params, 'id'), req.user.id);
    res.json({ trip });
  } catch (err) {
    next(err);
  }
}

export async function enableTripShare(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) throw new AppError(401, 'Authentication required');
    const trip = await tripService.enableTripShare(getParamId(req.params, 'id'), req.user.id);
    res.json({ trip });
  } catch (err) {
    next(err);
  }
}

export async function disableTripShare(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) throw new AppError(401, 'Authentication required');
    const trip = await tripService.disableTripShare(getParamId(req.params, 'id'), req.user.id);
    res.json({ trip });
  } catch (err) {
    next(err);
  }
}

export async function getInterests(
  _req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    res.json({ interests: tripService.INTERESTS });
  } catch (err) {
    next(err);
  }
}

export async function restoreTripVersion(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) throw new AppError(401, 'Authentication required');
    const trip = await tripService.restoreTripVersion(
      getParamId(req.params, 'id'),
      req.user.id,
      getParamId(req.params, 'versionId')
    );
    res.json({ trip });
  } catch (err) {
    next(err);
  }
}
