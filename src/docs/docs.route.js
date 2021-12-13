import express from 'express';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import swaggerDefinition from './swaggerDef';

const router = express.Router();

const specs = swaggerJsdoc({
  swaggerDefinition,
  apis: [`${__dirname}/*.yml`, `${__dirname}/../modules/**/v1.route.yml`],
});

router.use('/v1/docs', swaggerUi.serve);
router.get(
  '/v1/docs',
  swaggerUi.setup(specs, {
    explorer: true,
  })
);

export default router;
