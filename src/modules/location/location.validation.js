import Joi from 'joi';
import { objectIdValidate } from '../../plugins/joi/objectId.validate';

export const listLocation = {
  query: Joi.object().keys({
    includeJig: Joi.number().valid(0, 1),
  }),
};

export const getLocationById = {
  params: Joi.object().keys({
    id: Joi.custom(objectIdValidate),
  }),
  query: Joi.object().keys({
    includeJig: Joi.number().valid(0, 1),
  }),
};
