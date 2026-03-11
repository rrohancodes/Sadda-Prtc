const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  profilePicture: {
    type: String,
    default: null
  },
  userType: {
    type: String,
    enum: ['regular', 'student', 'senior'],
    default: 'regular'
  },
  preferences: {
    language: {
      type: String,
      enum: ['english', 'kannada', 'hindi'],
      default: 'english'
    },
    notifications: {
      busArrival: {
        type: Boolean,
        default: true
      },
      routeUpdates: {
        type: Boolean,
        default: true
      },
      emergencyAlerts: {
        type: Boolean,
        default: true
      }
    }
  },
  savedPlaces: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    address: {
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
    type: {
      type: String,
      enum: ['home', 'work', 'other'],
      default: 'other'
    }
  }],
  travelHistory: [{
    fromStop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BusStop'
    },
    toStop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BusStop'
    },
    routeUsed: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Route'
    },
    busNumber: String,
    fare: Number,
    date: {
      type: Date,
      default: Date.now
    },
    duration: Number // in minutes
  }],
  emergencyContacts: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    relationship: {
      type: String,
      trim: true
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Index for email queries
userSchema.index({ email: 1 });

// Index for phone queries
userSchema.index({ phone: 1 });

module.exports = mongoose.model('User', userSchema);
