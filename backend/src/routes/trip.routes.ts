import { Router } from 'express';
import * as tripController from '../controllers/trip.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.get('/interests', tripController.getInterests);
router.get('/', tripController.listTrips);
router.post('/', tripController.createTrip);
router.post('/:id/generate', tripController.generateTrip);
router.post('/:id/activities', tripController.addActivity);
router.delete('/:id/activities/:activityId', tripController.removeActivity);
router.post('/:id/days/:day/regenerate', tripController.regenerateDay);
router.patch('/:id/days/:day/activities/reorder', tripController.reorderActivities);
router.post('/:id/finalize', tripController.finalizeTrip);
router.post('/:id/unfinalize', tripController.unfinalizeTrip);
router.post('/:id/versions/:versionId/restore', tripController.restoreTripVersion);
router.post('/:id/share', tripController.enableTripShare);
router.delete('/:id/share', tripController.disableTripShare);
router.get('/:id', tripController.getTrip);
router.patch('/:id', tripController.updateTrip);
router.delete('/:id', tripController.deleteTrip);

export default router;
