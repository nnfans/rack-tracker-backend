const joi = require('joi');

const createJigValidation = joi.object().keys({
  name: joi.string().required(),
  model: joi.string().required(),
  binQty: joi.string().required(),
});

export default {
  createJigValidation,
};
