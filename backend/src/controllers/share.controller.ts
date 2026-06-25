import { Request, Response, NextFunction } from 'express';
import * as tripService from '../services/trip.service';
import { AppError } from '../utils/AppError';

export async function getSharedTrip(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const token = req.params.token;
    if (typeof token !== 'string' || !token.trim()) {
      throw new AppError(400, 'Invalid share token');
    }

    const trip = await tripService.getSharedTrip(token);
    res.json({ trip });
  } catch (err) {
    next(err);
  }
}
