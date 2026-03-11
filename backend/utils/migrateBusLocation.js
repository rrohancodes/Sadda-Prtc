// Migration: Convert existing Bus.currentLocation { latitude, longitude } to GeoJSON Point
require('dotenv').config();
const mongoose = require('mongoose');
const Bus = require('../models/Bus');

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected');
    const buses = await Bus.find({ 'currentLocation.latitude': { $exists: true } });
    console.log('Buses needing migration:', buses.length);
    for (const b of buses) {
      if (b.currentLocation && b.currentLocation.latitude !== undefined) {
        const { latitude, longitude } = b.currentLocation;
        b.currentLocation = { type: 'Point', coordinates: [longitude, latitude] };
        await b.save();
        console.log('Migrated bus', b.busNumber);
      }
    }
    console.log('Done.');
    process.exit(0);
  } catch (e) {
    console.error('Migration failed', e);
    process.exit(1);
  }
})();
