import { Router } from 'express';
import * as shareController from '../controllers/share.controller';

const router = Router();

router.get('/:token', shareController.getSharedTrip);

export default router;
