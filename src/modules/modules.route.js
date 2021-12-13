import { Router } from 'express';
import jigRouter from './jig/routes';

const router = Router();

router.use(jigRouter);

export default router;
