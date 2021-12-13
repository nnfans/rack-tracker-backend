import mongoose from 'mongoose';
import httpStatus from 'http-status';

import Rack from './rack.model';
import locationService from '../location/location.service';

import { ApiError } from '../../utils/ApiError';

/**
 * @typedef {Object} Coordinate
 * @property {Number} x
 * @property {Number} y
 */

/**
 * Create new rack
 * @param {Object} rackBody
 * @param {mongoose.ClientSession} session
 */
const createRack = async (rackBody, session) => {
  const queryOptions = session ? { session } : {};
  const newRack = new Rack({ ...rackBody, bins: [] });

  await newRack.save(queryOptions);
  return newRack;
};

const listRack = async () => {
  return Rack.find();
};

/**
 * @param {mongoose.ObjectId} id
 * @param {mongoose.ClientSession} session
 */
const findRackById = async (id, session) => {
  const queryOptions = session ? { session } : {};
  const rack = await Rack.findById(id, {}, queryOptions);

  if (!rack) {
    throw new ApiError(httpStatus.NOT_FOUND, `Rack not found (id:${id})`);
  }

  return rack;
};

/**
 * @param {Object} generateBinObjectArgs
 * @param {mongoose.Schema.ObjectId} generateBinObjectArgs.jigId
 * @param {Coordinate[]} generateBinObjectArgs.locations
 * @returns
 */
const generateBinObject = ({ jigId, locations }) => {
  return locations.map(({ x, y }) => ({ jig: jigId, x, y }));
};

/**
 * @param {Coordinate[]} coor1
 * @param {Coordinate[]} coor2
 */
const isCoordinateCrossed = (coor1, coor2) => {
  let match = false;

  coor1.forEach(({ x: x1, y: y1 }) => {
    coor2.forEach(({ x: x2, y: y2 }) => {
      if (x1 === x2 && y1 === y2) {
        match = true;
      }
    });
  });

  return match;
};

/**
 * Add jig to bin
 * @param {Object} addJigArguments
 * @param {mongoose.ObjectId} addJigArguments.rackId
 * @param {mongoose.ObjectId} addJigArguments.jigId
 * @param {Coordinate[]} addJigArguments.coordinates
 * @param {mongoose.ClientSession} addJigArguments.session
 */
const addJig = async ({ rackId, jigId, coordinates, session }) => {
  if (!session) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'addJig must be combined with valid session transaction'
    );
  }

  try {
    const rack = await findRackById(rackId, { session });

    if (isCoordinateCrossed(rack.bins, coordinates)) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Coordinate is crossed');
    }

    const binObject = generateBinObject({ jigId, coordinates });

    rack.bins.push(binObject);

    await rack.save();

    return rack;
  } catch (ex) {
    await session.abortTransaction();

    throw ex;
  }
};

/**
 * @typedef {Object} removeJigReturn
 * @property {Rack} removeJigReturn.rack
 * @property {Object} removeJigReturn.removedJigs
 * @property {mongoose.ObjectId} removeJigReturn.removedJigs.jig
 * @property {Number} removeJigReturn.removedJigs.qty
 */

/**
 * Add jig to bin
 * @param {Object} removeJigArgs
 * @param {mongoose.ObjectId} removeJigArgs.rackId
 * @param {Coordinate[]} removeJigArgs.coordinates
 * @param {mongoose.ClientSession} removeJigArgs.session
 * @returns {Promise<removeJigReturn>}
 */
const removeJig = async ({ rackId, coordinates, session }) => {
  if (!session) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'removeJig must be combined with valid session transaction'
    );
  }

  try {
    const rack = await findRackById(rackId, { session });

    const removedJigs = coordinates
      .map((coor) => {
        const found = rack.bins.find(({ x, y }) => coor.x === x && coor.y === y);

        if (!found) {
          throw new ApiError(httpStatus.BAD_REQUEST, "Can't remove non-exist jig");
        }

        rack.bins.id(found._id).remove();
        return found.jig;
      })
      .reduce(({ acc, jigName }) => {
        let found = false;

        const newAcc = acc.map((bin) => {
          if (bin.jig === jigName) {
            found = true;
            return { jig: bin.jig, qty: bin.qty + 1 };
          }

          return bin;
        });

        if (found) {
          return newAcc;
        }

        return [...acc, { jig: jigName, qty: 1 }];
      }, []);

    await rack.save();

    return { rack, removedJigs };
  } catch (ex) {
    await session.abortTransaction();

    throw ex;
  }
};

/**
 * Input jig to rack
 * @param {Object} inputJigTransactionArgs
 * @param {mongoose.ObjectId} inputJigTransactionArgs.rackId
 * @param {mongoose.ObjectId} inputJigTransactionArgs.jigId
 * @param {Coordinate[]} inputJigTransactionArgs.coordinates
 * @param {mongoose.ObjectId} inputJigTransactionArgs.sourceLocationId
 * @param {mongoose.ClientSession} [inputJigTransactionArgs.sessionParent]
 */
const InputJigTransaction = async ({
  rackId,
  jigId,
  coordinates,
  sourceLocationId,
  sessionParent,
}) => {
  const session = sessionParent || (await mongoose.startSession());

  if (!sessionParent) {
    session.startTransaction();
  }

  try {
    const rack = await addJig({ rackId, jigId, coordinates, session });

    const destLocationId = rack.location;

    await locationService.locationItemTransaction({
      sourceId: sourceLocationId,
      destId: destLocationId,
      items: [{ jigId, qty: coordinates.length }],
      session,
    });

    if (!sessionParent) {
      await session.commitTransaction();
      session.endSession();
    }
  } catch (ex) {
    await session.abortTransaction();

    throw ex;
  }
};

/**
 * Output jig from rack
 * @param {Object} inputJigTransactionArgs
 * @param {mongoose.ObjectId} inputJigTransactionArgs.rackId
 * @param {Coordinate[]} inputJigTransactionArgs.coordinates
 * @param {mongoose.ObjectId} inputJigTransactionArgs.destLocationId
 * @param {mongoose.ClientSession} [inputJigTransactionArgs.sessionParent]
 */
const OutputJigTransaction = async ({ rackId, coordinates, destLocationId, sessionParent }) => {
  const session = sessionParent || (await mongoose.startSession());

  if (!sessionParent) {
    session.startTransaction();
  }

  try {
    const { rack, removedJigs } = await removeJig({ rackId, coordinates, session });

    await locationService.locationItemTransaction({
      sourceId: rack.location,
      destId: destLocationId,
      items: removedJigs,
      session,
    });

    if (!sessionParent) {
      await session.commitTransaction();
      session.endSession();
    }
  } catch (ex) {
    await session.abortTransaction();

    throw ex;
  }
};

/**
 * Output jig from rack
 * @param {Object} inputJigTransactionArgs
 * @param {mongoose.ObjectId} inputJigTransactionArgs.rackId
 * @param {mongoose.ObjectId} inputJigTransactionArgs.jigId
 * @param {Coordinate[]} inputJigTransactionArgs.coordinates
 * @param {mongoose.ClientSession} [inputJigTransactionArgs.sessionParent]
 */
const newJigTransaction = async ({ rackId, jigId, coordinates, sessionParent }) => {
  const session = sessionParent || (await mongoose.startSession());

  if (!sessionParent) {
    session.startTransaction();
  }

  try {
    const rack = await addJig({ rackId, jigId, coordinates, session });

    await locationService.addItem({ jigId, locationId: rack.location, qty: coordinates.length });

    if (!sessionParent) {
      await session.commitTransaction();
      session.endSession();
    }
  } catch (ex) {
    await session.abortTransaction();

    throw ex;
  }
};

export default {
  createRack,
  listRack,
  addJig,
  InputJigTransaction,
  OutputJigTransaction,
  newJigTransaction,
};
