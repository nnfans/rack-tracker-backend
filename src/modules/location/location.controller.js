import catchAsync from '../../utils/catchAsync';
import locaitonService from './location.service';

const listLocation = catchAsync(async (_req, res) => {
  const locations = await locaitonService.listLocation();

  res.send(locations);
});

const createLocation = catchAsync(async (req, res) => {
  const newLocation = await locaitonService.createLocation(req.body);

  res.send(newLocation);
});

export default { listLocation, createLocation };
