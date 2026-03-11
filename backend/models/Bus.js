const mongoose = require('mongoose');

const busSchema = new mongoose.Schema({
  busNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  route: {
    type: String,
    required: true,
    trim: true
  },
  routeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Route',
    required: true
  },
  busType: {
    type: String,
    enum: ['ordinary', 'vajra', 'atal_sarige'],
    default: 'ordinary'
  },
  currentLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [lng, lat]
      required: true,
      index: '2dsphere'
    }
  },
  speed: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  heading: {
    type: Number,
    default: 0,
    min: 0,
    max: 360
  },
  nextStop: {
    type: String,
    trim: true
  },
  eta: {
    type: String,
    trim: true
  },
  occupancy: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  driverId: {
    type: String,
    trim: true
  },
  capacity: {
    type: Number,
    default: 40
  },
  currentPassengers: {
    type: Number,
    default: 0,
    min: 0
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

// Index for efficient bus number queries
busSchema.index({ busNumber: 1 });

// Index for route-based queries
busSchema.index({ routeId: 1, isActive: 1 });

// Additional composite index for city + route
busSchema.index({ city: 1, routeId: 1 });

module.exports = mongoose.model('Bus', busSchema);
