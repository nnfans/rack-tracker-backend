import { Router } from 'express';
import jigController from '../jig.controller';

const router = Router();

router.route('/').get(jigController.listJig).post(jigController.createJig);
router.route('/:id').get(jigController.getJigById).put(jigController.updateJigById);

export default router;
