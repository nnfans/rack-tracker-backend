import { Router } from 'express';

import rackController from '../rack.controller';
import validate from '../../../middlewares/validate';
import { inputJig, outputJig } from '../rack.validation';

const router = Router();

router.route('/').get(rackController.listRack).post(rackController.createRack);
router.route('/:id').get(rackController.getRackById);
router.route('/input').post(validate(inputJig), rackController.inputJig);
router.route('/output').post(validate(outputJig), rackController.outputJig);

export default router;
