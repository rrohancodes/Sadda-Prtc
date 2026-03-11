const mongoose = require('mongoose');

const corridorSchema = new mongoose.Schema({
  key: { type: String, unique: true, index: true },
  name: { type: String, required: true },
  fullLine: {
    type: { type: String, enum: ['LineString'], default: 'LineString' },
    coordinates: { type: [[Number]], required: true }
  },
  simplifiedLine: {
    type: { type: String, enum: ['LineString'], default: 'LineString' },
    coordinates: { type: [[Number]], required: true }
  },
  encodedPolyline: { type: String },
  cumulativeDistances: [{ type: Number }],
  lengthMeters: { type: Number },
  endpoints: {
    start: { type: { type: String, enum: ['Point'], default: 'Point' }, coordinates: [Number] },
    end: { type: { type: String, enum: ['Point'], default: 'Point' }, coordinates: [Number] }
  },
  meta: {
    simplifiedPointCount: Number,
    sourcePoints: Number
  },
  createdAt: { type: Date, default: Date.now }
});

corridorSchema.index({ fullLine: '2dsphere' });

module.exports = mongoose.model('Corridor', corridorSchema);
