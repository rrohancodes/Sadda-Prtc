const express = require('express');
const jwt = require('jsonwebtoken');
const Bus = require('../models/Bus');
const Trip = require('../models/Trip');
const authDriver = require('../middleware/authDriver');
const Corridor = require('../models/Corridor');
const { computeProgress, computeETA } = require('../utils/corridorProgress');

const router = express.Router();

// TEMP simple in-memory driver credentials (replace with DB later)
const drivers = [
  { busNumber: 'KA-01-HB-2001', password: 'pass123', busId: null },
  { busNumber: 'KA-06-T-1001', password: 'pass123', busId: null }
];

// Resolve bus IDs once (lazy)
async function ensureBusIds() {
  for (const d of drivers) {
    if (!d.busId) {
      const bus = await Bus.findOne({ busNumber: d.busNumber });
      if (bus) d.busId = bus._id;
    }
  }
}

router.post('/login', async (req, res) => {
  const { busNumber, password } = req.body;
  if (!busNumber || !password) return res.status(400).json({ success: false, message: 'busNumber & password required' });
  await ensureBusIds();
  const drv = drivers.find(d => d.busNumber === busNumber && d.password === password);
  if (!drv) return res.status(401).json({ success: false, message: 'Invalid credentials' });
  const token = jwt.sign({ busNumber, busId: drv.busId, role: 'driver' }, process.env.JWT_SECRET, { expiresIn: '8h' });
  res.json({ success: true, token, busId: drv.busId });
});

// Start trip
router.post('/trips/start', authDriver, async (req, res) => {
  try {
    // Harden against undefined body (destructuring on undefined caused earlier 500)
    const rawBody = req.body; // could be undefined if JSON middleware not applied / wrong content-type
    if (!rawBody || typeof rawBody !== 'object') {
      return res.status(400).json({ success: false, message: 'Missing JSON body. Ensure Content-Type: application/json and a JSON payload { "direction": "forward" }.' });
    }
    const { direction = 'forward', corridorKey = 'bengaluru-tumkur' } = rawBody;
    if (!['forward','reverse'].includes(direction)) return res.status(400).json({ success: false, message: 'Invalid direction' });

    const bus = await Bus.findById(req.driver.busId);
    if (!bus) return res.status(404).json({ success: false, message: 'Bus not found' });

    // End any existing active trip for this bus
    await Trip.updateMany({ bus: bus._id, status: 'active' }, { status: 'ended' });

    const trip = await Trip.create({
      bus: bus._id,
      route: bus.routeId,
      corridorKey,
      direction,
      lastLocation: bus.currentLocation
    });
    // progress initial
    if (bus.currentLocation && bus.currentLocation.coordinates) {
      const [lng, lat] = bus.currentLocation.coordinates;
      const prog = await computeProgress(lng, lat, corridorKey, direction);
      if (prog) { trip.progress = { meters: prog.meters, percent: prog.percent }; }
      if (prog) {
        const eta = computeETA(prog.meters, prog.length, bus.speed || 0);
        if (eta) trip.eta = eta.arrivalTime;
      }
      await trip.save();
    }

    req.io.to(`bus-${bus._id}`).emit('trip-started', { tripId: trip._id });
    req.io.to(`corridor-${corridorKey}`).emit('corridor-update', { type: 'trip-start', tripId: trip._id });

    res.status(201).json({ success: true, data: trip });
  } catch (e) {
    console.error('Start trip error:', e);
    res.status(500).json({ success: false, message: e.message });
  }
});

// Update location
router.post('/trips/:id/location', authDriver, async (req, res) => {
  try {
    const { id } = req.params;
    const { lng, lat, speed, heading } = req.body;
    if (lng === undefined || lat === undefined) return res.status(400).json({ success: false, message: 'lng & lat required' });

    const trip = await Trip.findOne({ _id: id, bus: req.driver.busId, status: 'active' });
    if (!trip) return res.status(404).json({ success: false, message: 'Active trip not found' });

    trip.lastLocation = { type: 'Point', coordinates: [lng, lat] };
    // compute progress
    const prog = await computeProgress(lng, lat, trip.corridorKey, trip.direction);
    if (prog) trip.progress = { meters: prog.meters, percent: prog.percent };
    let etaObj = null;
    if (prog) {
      etaObj = computeETA(prog.meters, prog.length, speed || trip.lastSpeed || 0);
      if (etaObj && etaObj.arrivalTime) trip.eta = etaObj.arrivalTime;
    }
    trip.updatedAt = new Date();
    await trip.save();

    await Bus.findByIdAndUpdate(req.driver.busId, { currentLocation: { type: 'Point', coordinates: [lng, lat] }, speed, heading, lastUpdated: new Date() });

    req.io.to(`trip-${trip._id}`).emit('trip-update', { tripId: trip._id, location: trip.lastLocation, speed, heading, progress: trip.progress, eta: trip.eta, updatedAt: trip.updatedAt });
    req.io.to(`corridor-${trip.corridorKey}`).emit('corridor-update', { type: 'location', tripId: trip._id, bus: req.driver.busId, location: trip.lastLocation, speed, heading, progress: trip.progress, eta: trip.eta, updatedAt: trip.updatedAt });

    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// End trip
router.post('/trips/:id/end', authDriver, async (req, res) => {
  try {
    const { id } = req.params;
    const trip = await Trip.findOne({ _id: id, bus: req.driver.busId, status: 'active' });
    if (!trip) return res.status(404).json({ success: false, message: 'Active trip not found' });
    trip.status = 'ended';
    trip.updatedAt = new Date();
    await trip.save();
    req.io.to(`trip-${trip._id}`).emit('trip-ended', { tripId: trip._id });
    req.io.to(`corridor-${trip.corridorKey}`).emit('corridor-update', { type: 'trip-end', tripId: trip._id });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// Active corridor trips
router.get('/corridor/:key/active', async (req, res) => {
  try {
    const { key } = req.params; const { direction } = req.query;
    const filter = { corridorKey: key, status: 'active' };
    if (direction && ['forward','reverse'].includes(direction)) filter.direction = direction;
    const since = new Date(Date.now() - 5 * 60 * 1000); // 5 min freshness
    filter.updatedAt = { $gte: since };

    const trips = await Trip.find(filter).populate('bus','busNumber busType').lean();
    res.json({ success: true, count: trips.length, data: trips.map(t => ({
      tripId: t._id,
      busNumber: t.bus?.busNumber,
      busType: t.bus?.busType,
      direction: t.direction,
      lastLocation: t.lastLocation,
      progress: t.progress,
      eta: t.eta,
      updatedAt: t.updatedAt
    })) });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

module.exports = router;
