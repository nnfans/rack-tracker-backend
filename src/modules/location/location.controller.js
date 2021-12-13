import catchAsync from '../../utils/catchAsync';
import locationService from './location.service';

const listLocation = catchAsync(async (_req, res) => {
  const locations = await locationService.listLocation();

  res.send(locations);
});

const createLocation = catchAsync(async (req, res) => {
  const newLocation = await locationService.createLocation(req.body);

  res.send(newLocation);
});

export default { listLocation, createLocation };
