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
  newJig.nameModel = newJig.name + newJig.model;

  await newJig.save(queryOptions);
  return newJig;
};

/**
 * Update jig by id
 * @param {Object} updateJigByIdArgs
 * @param {import('mongoose').ObjectId} updateJigByIdArgs.id
 * @param {Object} updateJigByIdArgs.jigBody
 * @param {import('mongoose').ClientSession} updateJigByIdArgs.session
 */
const updateJigById = async ({ id, jigBody, session }) => {
  const jig = await getJigById(id, session);

  if (!jig) {
    throw new ApiError(httpStatus.NOT_FOUND, `Jig is not found (id:${id})`);
  }

  const gap = jigBody.binQty - jig.binQty;

  if (jig.freeQty + gap < 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, `Cannot reduce more than unallocated bin qty`);
  }

  jig.name = jigBody.name;
  jig.model = jigBody.model;
  jig.binQty = jigBody.binQty;
  jig.freeQty += gap;

  await jig.save();

  return jig;
};

export default { createJig, listJig, getJigById, updateJigById };
