import Joi from 'joi';

import { objectIdValidate } from '../../plugins/joi/objectId.validate';

export const inputJig = {
  body: Joi.object().keys({
    rackId: Joi.custom(objectIdValidate).required(),
    jigId: Joi.custom(objectIdValidate).required(),
    coordinates: Joi.array()
      .items(
        Joi.object({
          x: Joi.number().required(),
          y: Joi.number().required(),
        })
      )
      .min(1)
      .required(),
    sourceLocationId: Joi.custom(objectIdValidate),
  }),
};

export const outputJig = {
  body: Joi.object().keys({
    rackId: Joi.custom(objectIdValidate).required(),
    coordinates: Joi.array()
      .items(
        Joi.object({
          x: Joi.number().required(),
          y: Joi.number().required(),
        })
      )
      .min(1)
      .required(),
    destLocationId: Joi.string().custom(objectIdValidate),
  }),
};

export const listRack = {
  query: Joi.object().keys({
    locationId: Joi.custom(objectIdValidate),
  }),
};
