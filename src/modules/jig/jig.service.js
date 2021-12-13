import httpStatus from 'http-status';

import Jig from './jig.model';
import { ApiError } from '../../utils/ApiError';

const listJig = async () => {
  return Jig.find();
};

/**
 * Get jig by id
 * @param {import('mongoose').ObjectId} id
 * @param {import('mongoose').ClientSession} [session]
 */
const getJigById = async (id, session) => {
  const queryOptions = session ? { session } : {};
  const jig = await Jig.findById(id, {}, queryOptions);
  if (!jig) {
    throw new ApiError(httpStatus.NOT_FOUND, `Jig is not found (id:${id})`);
  }

  return jig;
};

/**
 * Create jig
 * @param {Object} jigBody
 * @param {import('mongoose').ClientSession} session
 */
const createJig = async (jigBody, session) => {
  const queryOptions = session ? { session } : {};
  const newJig = new Jig({ freeQty: jigBody.binQty, ...jigBody });

  await newJig.save(queryOptions);
  return newJig;
};

export default { createJig, listJig, getJigById };
