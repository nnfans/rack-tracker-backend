import { Router } from 'express';

import jigController from '../jig.controller';
import validate from '../../../middlewares/validate';
import { getJigById, updateJigById } from '../jig.validation';

const router = Router();

router.route('/').get(jigController.listJig).post(jigController.createJig);
router
  .route('/:id')
  .get(validate(getJigById), jigController.getJigById)
  .put(validate(updateJigById), jigController.updateJigById);

export default router;
