const express = require('express');
const router = express.Router();
const {
  getAllBusStops,
  getNearbyBusStops,
  getBusStop,
  getBusStopsByRoute,
  searchBusStops,
  createBusStop
} = require('../controllers/busStopController');

// @route   GET /api/bus-stops
// @desc    Get all bus stops
// @access  Public
router.get('/', getAllBusStops);

// @route   GET /api/bus-stops/nearby
// @desc    Get nearby bus stops
// @access  Public
router.get('/nearby', getNearbyBusStops);

// @route   GET /api/bus-stops/search
// @desc    Search bus stops
// @access  Public
router.get('/search', searchBusStops);

// @route   GET /api/bus-stops/route/:routeId
// @desc    Get bus stops by route
// @access  Public
router.get('/route/:routeId', getBusStopsByRoute);

// @route   GET /api/bus-stops/:id
// @desc    Get single bus stop by ID or stopId
// @access  Public
router.get('/:id', getBusStop);

// @route   POST /api/bus-stops
// @desc    Create new bus stop
// @access  Private (Admin only)
router.post('/', createBusStop);

module.exports = router;
