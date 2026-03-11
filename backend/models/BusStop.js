const mongoose = require('mongoose');

const busStopSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    latitude: {
      type: Number,
      required: true
    },
    longitude: {
      type: Number,
      required: true
    }
  },
  stopId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  routes: [{
    routeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Route'
    },
    routeNumber: String,
    direction: {
      type: String,
      enum: ['UP', 'DOWN', 'BOTH'],
      default: 'BOTH'
    }
  }],
  facilities: [{
    type: String,
    enum: ['parking', 'restroom', 'atm', 'food', 'shelter', 'wheelchair_accessible']
  }],
  address: {
    type: String,
    trim: true
  },
  landmark: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  zone: {
    type: String,
    trim: true
  },
  depot: {
    type: String,
    trim: true
  },
  city: {
    type: String,
    enum: ['bengaluru', 'tumkur'],
    default: 'bengaluru',
    index: true
  }
}, {
  timestamps: true
});

// Geospatial index for nearby stops queries
busStopSchema.index({ location: '2dsphere' });

// Index for stop ID queries
busStopSchema.index({ stopId: 1 });

// Index for route-based queries
busStopSchema.index({ 'routes.routeId': 1 });

// Text index for stop name search
busStopSchema.index({ name: 'text', landmark: 'text' });

// Composite index for city + routes
busStopSchema.index({ city: 1, 'routes.routeId': 1 });

module.exports = mongoose.model('BusStop', busStopSchema);
