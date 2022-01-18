import httpStatus from 'http-status';

import rackService from './rack.service';

import catchAsync from '../../utils/catchAsync';
import { ApiError } from '../../utils/ApiError';

const listRack = catchAsync(async (_req, res) => {
  const racks = await rackService.listRack();

  res.send(racks);
});

const createRack = catchAsync(async (req, res) => {
  const newRack = await rackService.createRack(req.body);

  res.send(newRack);
});

const getRackById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const rack = await rackService.findRackById(id, null, { isPopulateBins: true });

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
