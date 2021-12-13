import { Schema, model } from 'mongoose';
import { toJSON } from '../../plugins/mongoose/toJSON.plugin';

/**
 * @constructor
 */
const locationSchema = new Schema({
  name: { type: String, required: true },
  items: [
    new Schema({
      jig: {
        type: Schema.Types.ObjectId,
        ref: 'Jig',
        required: true,
      },
      qty: { type: Number, required: true },
    }),
  ],
});

locationSchema.plugin(toJSON);

/**
 * @typedef Location
 */
const Location = model('Location', locationSchema);

export default Location;
