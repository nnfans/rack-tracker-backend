import Joi from 'joi';

import objectIdValidate from '../../plugins/joi/objectId.validate';

export const inputJig = {
  body: Joi.object().keys({
    rackId: Joi.string().required().custom(objectIdValidate),
    jigId: Joi.string().required().custom(objectIdValidate),
    coordinates: Joi.array()
      .items(
        Joi.object({
          x: Joi.number().required(),
          y: Joi.number().required(),
        })
      )
      .min(1)
      .required(),
    sourceLocationId: Joi.string().custom(objectIdValidate),
  }),
};

export const outputJig = {
  body: Joi.object().keys({
    rackId: Joi.string().required().custom(objectIdValidate),
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
