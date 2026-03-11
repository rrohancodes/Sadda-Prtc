const Bus = require('../models/Bus');
const Route = require('../models/Route');

// Get all active buses
const getAllBuses = async (req, res) => {
  try {
    const { city } = req.query;
    const filter = { isActive: true };
    if (city) filter.city = city.toLowerCase();

    const buses = await Bus.find(filter)
      .populate('routeId', 'routeNumber routeName origin destination')
      .select('-__v');
    
    res.json({
      success: true,
      count: buses.length,
      data: buses
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching buses',
      error: error.message
    });
  }
};

// Get buses by route
const getBusesByRoute = async (req, res) => {
  try {
    const { routeId } = req.params;
    const { city } = req.query;
    const filter = { routeId, isActive: true };
    if (city) filter.city = city.toLowerCase();

    const buses = await Bus.find(filter)
      .populate('routeId', 'routeNumber routeName origin destination')
      .select('-__v');
    
    res.json({
      success: true,
      count: buses.length,
      data: buses
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching buses for route',
      error: error.message
    });
  }
};

// Get buses near a location
const getNearbyBuses = async (req, res) => {
  try {
    const { latitude, longitude, radius = 5000, city } = req.query;
    
    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    const filter = {
      isActive: true,
      currentLocation: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: parseInt(radius)
        }
      }
    };
    if (city) filter.city = city.toLowerCase();

    const buses = await Bus.find(filter)
    .populate('routeId', 'routeNumber routeName origin destination')
    .select('-__v');
    
    res.json({
      success: true,
      count: buses.length,
      data: buses
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching nearby buses',
      error: error.message
    });
  }
};

// Get single bus by ID or number
const getBus = async (req, res) => {
  try {
    const { id } = req.params;
    
    let bus;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      // MongoDB ObjectId
      bus = await Bus.findById(id)
        .populate('routeId', 'routeNumber routeName origin destination stops')
        .select('-__v');
    } else {
      // Bus number
      bus = await Bus.findOne({ busNumber: id, isActive: true })
        .populate('routeId', 'routeNumber routeName origin destination stops')
        .select('-__v');
    }
    
    if (!bus) {
      return res.status(404).json({
        success: false,
        message: 'Bus not found'
      });
    }
    
    res.json({
      success: true,
      data: bus
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching bus',
      error: error.message
    });
  }
};

// Update bus location (for real-time tracking)
const updateBusLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const { latitude, longitude, speed, heading, nextStop, eta, occupancy } = req.body;

    if (latitude == null || longitude == null) {
      return res.status(400).json({ success: false, message: 'latitude & longitude required' });
    }

    const latNum = parseFloat(latitude);
    const lngNum = parseFloat(longitude);
    if (Number.isNaN(latNum) || Number.isNaN(lngNum)) {
      return res.status(400).json({ success: false, message: 'Invalid latitude/longitude' });
    }

    const updateData = {
      currentLocation: { type: 'Point', coordinates: [lngNum, latNum] },
      lastUpdated: new Date()
    };

    if (speed !== undefined) updateData.speed = speed;
    if (heading !== undefined) updateData.heading = heading;
    if (nextStop) updateData.nextStop = nextStop;
    if (eta) updateData.eta = eta;
    if (occupancy) updateData.occupancy = occupancy;

    const bus = await Bus.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('routeId', 'routeNumber routeName origin destination');

    if (!bus) {
      return res.status(404).json({ success: false, message: 'Bus not found' });
    }

    res.json({ success: true, data: bus });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating bus location', error: error.message });
  }
};

// Create new bus (admin only)
const createBus = async (req, res) => {
  try {
    const bus = new Bus(req.body);
    await bus.save();
    
    const populatedBus = await Bus.findById(bus._id)
      .populate('routeId', 'routeNumber routeName origin destination');
    
    res.status(201).json({
      success: true,
      data: populatedBus
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Bus number already exists'
      });
    }
    
    res.status(400).json({
      success: false,
      message: 'Error creating bus',
      error: error.message
    });
  }
};

module.exports = {
  getAllBuses,
  getBusesByRoute,
  getNearbyBuses,
  getBus,
  updateBusLocation,
  createBus
};
