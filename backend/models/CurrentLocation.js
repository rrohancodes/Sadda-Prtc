const mongoose = require('mongoose');

const CurrentLocationSchema = new mongoose.Schema({
  vehicleNumber: { type: String, required: true, index: true, trim: true },
  driverName: { type: String, trim: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now, index: true },
  busNumber: { type: String, trim: true }
}, { versionKey: false, collection: 'currentlocations' });

CurrentLocationSchema.index({ vehicleNumber: 1, timestamp: -1 });

module.exports = mongoose.model('CurrentLocation', CurrentLocationSchema);
