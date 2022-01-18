import { Schema, model } from 'mongoose';

import { toJSON } from '../../plugins/mongoose/toJSON.plugin';

const rackSchema = new Schema({
  name: { type: String, required: true },
  location: {
    type: Schema.Types.ObjectId,
    ref: 'Location',
    required: true,
  },
  order: { type: Number, default: 0 },
  info: {
    row: {
      total: {
        type: Number,
        required: true,
      },
      useLetter: {
        type: Boolean,
        default: true,
      },
    },
    col: {
      total: {
        type: Number,
        required: true,
      },
      useLetter: {
        type: Boolean,
        default: false,
      },
    },
  },
  bins: [
    {
      x: { type: Number, required: true },
      y: { type: Number, required: true },
      jig: {
        type: Schema.Types.ObjectId,
        ref: 'Jig',
        required: true,
      },
    },
  ],
});

rackSchema.plugin(toJSON);

/**
 * @typedef Rack
 */
const Rack = model('Rack', rackSchema);

export default Rack;
