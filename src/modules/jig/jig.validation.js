import Joi from 'joi';

import { objectIdValidate } from '../../plugins/joi/objectId.validate';

export const getJigById = {
  params: Joi.object().keys({
    id: Joi.custom(objectIdValidate),
  }),
};

export const updateJigById = {
  params: Joi.object().keys({
    id: Joi.custom(objectIdValidate),
  }),
  body: Joi.object().keys({
    name: Joi.string(),
    model: Joi.string(),
    binQty: Joi.number(),
  }),
};
