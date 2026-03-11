const mongoose = require('mongoose');

const routeSchema = new mongoose.Schema({
  routeNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  routeName: {
    type: String,
    required: true,
    trim: true
  },
  origin: {
    type: String,
    required: true,
    trim: true
  },
  destination: {
    type: String,
    required: true,
    trim: true
  },
  distance: {
    type: Number,
    required: true,
    min: 0
  },
  estimatedDuration: {
    type: Number, // in minutes
    required: true,
    min: 0
  },
  stops: [{
    stopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BusStop',
      required: true
    },
    sequence: {
      type: Number,
      required: true
    },
    distanceFromOrigin: {
      type: Number,
      default: 0
    },
    estimatedTime: {
      type: Number, // minutes from origin
      default: 0
    }
  }],
  polyline: [{
    latitude: Number,
    longitude: Number
  }],
  busType: {
    type: String,
    enum: ['ordinary', 'vajra', 'atal_sarige'],
    default: 'ordinary'
  },
  fare: {
    baseFare: {
      type: Number,
      required: true,
      min: 0
    },
    ratePerKm: {
      type: Number,
      required: true,
      min: 0
    }
  },
  frequency: {
    peakHours: {
      type: String,
      default: '10-15 mins'
    },
    offPeakHours: {
      type: String,
      default: '15-20 mins'
    }
  },
  operatingHours: {
    start: {
      type: String,
      required: true
    },
    end: {
      type: String,
      required: true
    }
  },
  isActive: {
    type: Boolean,
    default: true
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

// Index for route number queries
routeSchema.index({ routeNumber: 1 });

// Index for origin-destination queries
routeSchema.index({ origin: 1, destination: 1 });

// Text index for route search
routeSchema.index({ 
  routeNumber: 'text', 
  routeName: 'text', 
  origin: 'text', 
  destination: 'text' 
});

// Composite index for city + routeNumber
routeSchema.index({ city: 1, routeNumber: 1 });

module.exports = mongoose.model('Route', routeSchema);
