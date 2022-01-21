import { Router } from 'express';

import locationController from '../location.controller';
import validate from '../../../middlewares/validate';
import { queryToCamelCase } from '../../../middlewares/camelCase';
import { listLocation, getLocationById } from '../location.validation';

const router = Router();

router
  .route('/')
  .get(queryToCamelCase, validate(listLocation), locationController.listLocation)
  .post(locationController.createLocation);

router
  .route('/:id')
  .get(queryToCamelCase, validate(getLocationById), locationController.getLocationById);

export default router;
