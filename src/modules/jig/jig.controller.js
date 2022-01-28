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

const getJigById = catchAsync(async (req, res) => {
  const { id } = req.params;

  const jig = await jigService.getJigById(id);

  res.send(jig);
});

const updateJigById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const jig = await jigService.updateJigById({ id, jigBody: req.body });

  res.send(jig);
});

export default { listJig, createJig, getJigById, updateJigById };
