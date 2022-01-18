import mongoose from 'mongoose';
import httpStatus from 'http-status';

import Location from './location.model';
import jigService from '../jig/jig.service';
import { ApiError } from '../../utils/ApiError';

/**
 * @typedef CombineStockByItemsArg
 * @property {mongoose.Types.ObjectId} locationId
 * @property {Object[]} items
 * @property {mongoose.Types.ObjectId} items.jig
 * @property {Number} items.qty
 * @property {mongoose.ClientSession} session
 */

/**
 *
 * @returns {Promise<Location[]>}
 */
const listLocation = () => {
  return Location.find();
};

/**
 * Create new location
 * @param {Object} locationBody
 * @param {mongoose.ClientSession} session
 * @returns
 */
const createLocation = async (locationBody, session) => {
  const queryOptions = session ? { session } : {};
  const newLocation = new Location({ displayName: locationBody.name, ...locationBody });

  await newLocation.save(queryOptions);
  return newLocation;
};

/**
 * Get location by id
 * @param {mongoose.ObjectId} id
 * @param {mongoose.ClientSession} [session]
 */
const getLocationById = async (id, session) => {
  const queryOptions = session ? { session } : {};
  const location = await Location.findById(id, {}, queryOptions);

  if (!location) {
    throw new ApiError(httpStatus.NOT_FOUND, `Location is not found (id:${id})`);
  }

  return location;
};

/**
 * @param {CombineStockByItemsArg} locationItemTransactionArgs - reduceStockByItems arguments
 */
const reduceStockByItems = async ({ locationId, items, session }) => {
  if (!session) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'reduceStockByItems must be combined with valid session transaction'
    );
  }

  const location = await getLocationById(locationId, session);

  items.forEach((item) => {
    const foundItem = location.items.find(
      (locationItem) => locationItem.jig.toString() === item.jig
    );

    if (!foundItem || foundItem?.qty < item.qty) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Location stock is insufficient');
    }

    const updatedQty = foundItem.qty - item.qty;

    location.items.id(foundItem._id).set({ qty: updatedQty });
  });

  await location.save();

  return location;
};

/**
 * @param {CombineStockByItemsArg} locationItemTransactionArgs - increaseStockByItem arguments
 */
const increaseStockByItems = async ({ locationId, items, session }) => {
  if (!session) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'increaseStockByItems must be combined with valid session transaction'
    );
  }

  const location = await getLocationById(locationId, session);

  items.forEach((item) => {
    const foundItem = location.items.find(
      (locationItem) => locationItem.jig.toString() === item.jig
    );

    if (foundItem) {
      const updatedQty = foundItem.qty + item.qty;
      location.items.id(foundItem._id).set({ qty: updatedQty });
    } else {
      location.items.push({ jig: item.jig, qty: item.qty });
    }
  });

  await location.save();

  return location;
};

/**
 * @param {Object} addItemArgument
 * @param {mongoose.Types.ObjectId} addItemArgument.locationId
 * @param {mongoose.Types.ObjectId} addItemArgument.jigId
 * @param {Number} addItemArgument.qty
 * @param {mongoose.ClientSession} [addItemArgument.session]
 */
const addItem = async ({ locationId, jigId, qty, session: sessionParent }) => {
  const session = sessionParent || (await mongoose.startSession());

  if (!sessionParent) {
    session.startTransaction();
  }

  try {
    // Reduce free qty of jig
    const jig = await jigService.getJigById(jigId, session);
    if (jig.freeQty < qty) {
      throw new ApiError(httpStatus.BAD_REQUEST, `Jig "${jig.name}" qty is insufficient`);
    }
    jig.freeQty -= qty;
    await jig.save();

    // Add jig qty to location
    const location = await increaseStockByItems({
      locationId,
      items: [{ jig: jigId, qty }],
      session,
    });

    if (!sessionParent) {
      await session.commitTransaction();
      session.endSession();
    }

    return location;
  } catch (ex) {
    if (!sessionParent) {
      await session.abortTransaction();
    }

    throw ex;
  }
};

/**
 *
 * @param {Object} locationItemTransactionArgs - Transaction arguments
 * @param {mongoose.Types.ObjectId} locationItemTransactionArgs.sourceId
 * @param {mongoose.Types.ObjectId} locationItemTransactionArgs.destId
 * @param {Object[]} locationItemTransactionArgs.items
 * @param {mongoose.Types.ObjectId} locationItemTransactionArgs.items.jig
 * @param {Number} locationItemTransactionArgs.items.qty
 * @param {mongoose.ClientSession} [locationItemTransactionArgs.session]
 */
const locationItemTransaction = async ({ sourceId, destId, items, session: sessionParent }) => {
  const session = sessionParent || (await mongoose.startSession());

  if (!sessionParent) {
    session.startTransaction();
  }

  try {
    if (sourceId === destId) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        'Source location and destination location must be different'
      );
    }

    await reduceStockByItems({ locationId: sourceId, items, session });
    await increaseStockByItems({ locationId: destId, items, session });

    if (!sessionParent) {
      await session.commitTransaction();
      session.endSession();
    }
  } catch (ex) {
    if (!sessionParent) {
      await session.abortTransaction();
    }

    throw ex;
  }
};

export default {
  listLocation,
  createLocation,
  getLocationById,
  addItem,
  reduceStockByItems,
  increaseStockByItems,
  locationItemTransaction,
};
