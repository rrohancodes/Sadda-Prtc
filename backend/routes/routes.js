const express = require('express');
const router = express.Router();
const {
  getAllRoutes,
  getRoute,
  planJourney,
  calculateFare,
  createRoute
} = require('../controllers/routeController');

// @route   GET /api/routes
// @desc    Get all routes
// @access  Public
router.get('/', getAllRoutes);

// @route   GET /api/routes/plan-journey
// @desc    Plan journey between two points
// @access  Public
router.get('/plan-journey', planJourney);

// @route   GET /api/routes/calculate-fare
// @desc    Calculate fare between two stops
// @access  Public
router.get('/calculate-fare', calculateFare);

// @route   GET /api/routes/:id
// @desc    Get single route by ID or route number
// @access  Public
router.get('/:id', getRoute);

// @route   POST /api/routes
// @desc    Create new route
// @access  Private (Admin only)
router.post('/', createRoute);

module.exports = router;
