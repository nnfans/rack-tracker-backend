import { Router } from 'express';
import jigRouter from './jig/routes';
import locationRouter from './location/routes';
import rackRouter from './rack/routes';

const router = Router();

router.use(jigRouter);
router.use(locationRouter);
router.use(rackRouter);

export default router;
