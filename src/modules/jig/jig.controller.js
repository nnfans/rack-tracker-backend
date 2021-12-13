import catchAsync from '../../utils/catchAsync';
import jigService from './jig.service';

const listJig = catchAsync(async (_req, res) => {
  const jigs = await jigService.listJig();

  res.send(jigs);
});

const createJig = catchAsync(async (req, res) => {
  const jig = await jigService.createJig(req.body);

  res.send(jig);
});

export default { listJig, createJig };
