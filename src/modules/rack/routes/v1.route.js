import { Router } from 'express';

import rackController from '../rack.controller';
import validate from '../../../middlewares/validate';
import { inputJig, outputJig, listRack } from '../rack.validation';
import { queryToCamelCase } from '../../../middlewares/camelCase';

const router = Router();

router
  .route('/')
  .get(queryToCamelCase, validate(listRack), rackController.listRack)
  .post(rackController.createRack);
router.route('/:id').get(rackController.getRackById);
router.route('/input').post(validate(inputJig), rackController.inputJig);
router.route('/output').post(validate(outputJig), rackController.outputJig);

export default router;
