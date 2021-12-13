import { Router } from 'express';
import locationController from '../location.controller';

const router = Router();

router.route('/').get(locationController.listLocation).post(locationController.createLocation);

export default router;
