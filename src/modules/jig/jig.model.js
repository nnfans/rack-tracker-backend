import { Schema, model } from 'mongoose';
import { toJSON } from '../../plugins/mongoose/toJSON.plugin';

const jigSchema = new Schema({
  name: { type: String, required: true, unique: true },
  model: { type: String, required: true },
  nameModel: { type: String, required: true, unique: true },
  binQty: { type: Number, required: true },
  freeQty: { type: Number, required: true },
});

jigSchema.pre('save', function (next) {
  this.nameModel = this.name + this.model;

  next();
});

jigSchema.plugin(toJSON);

const Jig = model('Jig', jigSchema);

export default Jig;
