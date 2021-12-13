import { Router } from 'express';
import jigController from '../jig.controller';

const router = Router();

router.route('/').get(jigController.listJig).post(jigController.createJig);

export default router;
