import { Schema, model } from 'mongoose';

const rackSchema = new Schema({
  name: { type: String, required: true },
  location: {
    type: Schema.Types.ObjectId,
    ref: 'Location',
    required: true,
  },
  info: {
    totalRow: {
      type: Number,
      required: true,
    },
    totalCol: { type: Number, required: true },
  },
  bins: [
    new Schema({
      x: { type: Number, required: true },
      y: { type: Number, required: true },
      jig: {
        type: Schema.Types.ObjectId,
        ref: 'Jig',
        required: true,
      },
    }),
  ],
});

/**
 * @typedef Rack
 */
const Rack = model('Rack', rackSchema);

export default Rack;
