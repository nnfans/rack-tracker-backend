import { Router } from 'express';
import v1Route from './v1.route';

const router = Router();
const modulePath = '/locations';

const routes = [
  {
    path: '/v1',
    route: v1Route,
  },
];

routes.forEach((route) => {
  router.use(`${route.path}${modulePath}`, route.route);
});

export default router;
