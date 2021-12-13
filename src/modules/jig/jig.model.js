import { Schema, model } from 'mongoose';
import { toJSON } from '../../plugins/mongoose/toJSON.plugin';

const jigSchema = new Schema({
  name: { type: String, required: true },
  model: { type: String, required: true },
  binQty: { type: Number, required: true },
  freeQty: { type: Number, required: true },
});

jigSchema.plugin(toJSON);

const Jig = model('Jig', jigSchema);

export default Jig;
