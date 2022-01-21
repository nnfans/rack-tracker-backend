import httpStatus from 'http-status';

import rackService from './rack.service';

import catchAsync from '../../utils/catchAsync';
import { ApiError } from '../../utils/ApiError';

const listRack = catchAsync(async (req, res) => {
  const { query } = req;

  let racksQuery = rackService.listRack();

  if (query.locationId) {
    racksQuery = racksQuery.where('location').equals(query.locationId);
  }

  racksQuery = racksQuery.sort('location name').populate(['location']);

  const racks = await racksQuery;

  res.send(racks);
});

const createRack = catchAsync(async (req, res) => {
  const newRack = await rackService.createRack(req.body);

  res.send(newRack);
});

const getRackById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const rack = await rackService.findRackById(id, null, {
    isPopulateBins: true,
    isPopulateLocation: true,
  });

  if (!rack) {
    throw new ApiError(httpStatus.NOT_FOUND, `Rack not found (id: ${id})`);
  }

  res.send(rack);
});

const inputJig = catchAsync(async (req, res) => {
  const { rackId, jigId, coordinates, sourceLocationId } = req.body;

  if (!sourceLocationId) {
    await rackService.newInputJigTransaction({ rackId, jigId, coordinates });
  } else {
    await rackService.InputJigTransaction({ rackId, jigId, coordinates, sourceLocationId });
  }

  res.send({ code: 200, mesage: 'Success' });
});

const outputJig = catchAsync(async (req, res) => {
  const { rackId, coordinates, destLocationId } = req.body;

  await rackService.OutputJigTransaction({ rackId, coordinates, destLocationId });

  res.send({ code: 200, mesage: 'Success' });
});

export default { listRack, createRack, getRackById, inputJig, outputJig };
