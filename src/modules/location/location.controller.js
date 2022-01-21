import catchAsync from '../../utils/catchAsync';
import locationService from './location.service';

const listLocation = catchAsync(async (req, res) => {
  const { includeJig } = req.query;

  let locationsQuery = locationService.listLocation().sort('displayName');
  if (includeJig === 1) {
    locationsQuery = locationsQuery.populate(['items.jig']);
  }
  const locations = await locationsQuery;

  res.send(locations);
});

const getLocationById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { includeJig } = req.query;

  const location = await locationService.getLocationById(id, { includeJig });

  res.send(location);
});

const createLocation = catchAsync(async (req, res) => {
  const newLocation = await locationService.createLocation(req.body);

  res.send(newLocation);
});

export default { listLocation, getLocationById, createLocation };
