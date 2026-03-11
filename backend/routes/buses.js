const express = require('express');
const router = express.Router();
const {
  getAllBuses,
  getBusesByRoute,
  getNearbyBuses,
  getBus,
  updateBusLocation,
  createBus
} = require('../controllers/busController');

// @route   GET /api/buses
// @desc    Get all active buses
// @access  Public
router.get('/', getAllBuses);

// @route   GET /api/buses/nearby
// @desc    Get buses near a location
// @access  Public
router.get('/nearby', getNearbyBuses);

// @route   GET /api/buses/route/:routeId
// @desc    Get buses by route
// @access  Public
router.get('/route/:routeId', getBusesByRoute);

// @route   GET /api/buses/:id
// @desc    Get single bus by ID or number
// @access  Public
router.get('/:id', getBus);

// @route   PUT /api/buses/:id/location
// @desc    Update bus location (for real-time tracking)
// @access  Private (Driver/Admin)
router.put('/:id/location', updateBusLocation);

// @route   POST /api/buses
// @desc    Create new bus
// @access  Private (Admin only)
router.post('/', createBus);

module.exports = router;
