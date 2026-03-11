const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
  bus: { type: mongoose.Schema.Types.ObjectId, ref: 'Bus', required: true, index: true },
  route: { type: mongoose.Schema.Types.ObjectId, ref: 'Route', required: true },
  corridorKey: { type: String, index: true }, // e.g. 'bengaluru-tumkur'
  direction: { type: String, enum: ['forward','reverse'], required: true },
  status: { type: String, enum: ['active','ended'], default: 'active', index: true },
  lastLocation: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], index: '2dsphere' } // [lng, lat]
  },
  lastSpeed: Number,
  lastHeading: Number,
  progress: { // along corridor
    meters: Number,
    percent: Number
  },
  startedAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

tripSchema.index({ corridorKey: 1, status: 1 });
tripSchema.index({ updatedAt: 1 });

module.exports = mongoose.model('Trip', tripSchema);
