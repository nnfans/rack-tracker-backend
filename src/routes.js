import { Router } from 'express';

import config from './config/config';
import modulesRoute from './modules/modules.route';
import docsRoute from './docs/docs.route';

const router = Router();

router.use(modulesRoute);

if (config.env === 'development') {
  router.use(docsRoute);
}

export default router;
