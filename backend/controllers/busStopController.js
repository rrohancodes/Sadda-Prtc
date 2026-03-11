const BusStop = require('../models/BusStop');
const Route = require('../models/Route');

// Get all bus stops
const getAllBusStops = async (req, res) => {
  try {
    const { page = 1, limit = 50, search, city } = req.query;
    const query = { isActive: true };
    
    if (search) {
      query.$text = { $search: search };
    }
    
    if (city) {
      query.city = city.toLowerCase();
    }
    
    const busStops = await BusStop.find(query)
      .populate('routes.routeId', 'routeNumber routeName')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-__v')
      .sort({ name: 1 });
    
    const total = await BusStop.countDocuments(query);
    
    res.json({
      success: true,
      count: busStops.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: busStops
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching bus stops',
      error: error.message
    });
  }
};

// Get nearby bus stops
const getNearbyBusStops = async (req, res) => {
  try {
    const { latitude, longitude, radius = 2000, city } = req.query;
    
    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    const busStops = await BusStop.aggregate([
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          distanceField: 'distance',
          maxDistance: parseInt(radius),
          query: { isActive: true, ...(city ? { city: city.toLowerCase() } : {}) },
          spherical: true
        }
      },
      {
        $lookup: {
          from: 'routes',
          localField: 'routes.routeId',
          foreignField: '_id',
          as: 'routeDetails'
        }
      },
      {
        $addFields: {
          distanceInKm: { $divide: ['$distance', 1000] },
          routeCount: { $size: '$routes' }
        }
      },
      {
        $project: {
          name: 1,
          location: 1,
          stopId: 1,
          routes: 1,
          facilities: 1,
          address: 1,
          landmark: 1,
          distance: 1,
          distanceInKm: 1,
          routeCount: 1,
          routeDetails: {
            _id: 1,
            routeNumber: 1,
            routeName: 1
          }
        }
      },
      {
        $sort: { distance: 1 }
      },
      {
        $limit: 20
      }
    ]);
    
    res.json({
      success: true,
      count: busStops.length,
      data: busStops
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching nearby bus stops',
      error: error.message
    });
  }
};

// Get bus stop by ID
const getBusStop = async (req, res) => {
  try {
    const { id } = req.params;
    const { city } = req.query;
    
    let busStop;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      busStop = await BusStop.findOne({ _id: id, isActive: true, ...(city ? { city: city.toLowerCase() } : {}) })
        .populate('routes.routeId', 'routeNumber routeName origin destination')
        .select('-__v');
    } else {
      busStop = await BusStop.findOne({ stopId: id, isActive: true, ...(city ? { city: city.toLowerCase() } : {}) })
        .populate('routes.routeId', 'routeNumber routeName origin destination')
        .select('-__v');
    }
    
    if (!busStop) {
      return res.status(404).json({
        success: false,
        message: 'Bus stop not found'
      });
    }
    
    res.json({
      success: true,
      data: busStop
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching bus stop',
      error: error.message
    });
  }
};

// Get bus stops by route
const getBusStopsByRoute = async (req, res) => {
  try {
    const { routeId } = req.params;
    const { city } = req.query;
    
    const filter = { 'routes.routeId': routeId, isActive: true };
    if (city) filter.city = city.toLowerCase();
    
    const busStops = await BusStop.find(filter)
      .populate('routes.routeId', 'routeNumber routeName')
      .select('-__v')
      .sort({ name: 1 });
    
    res.json({
      success: true,
      count: busStops.length,
      data: busStops
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching bus stops for route',
      error: error.message
    });
  }
};

// Search bus stops
const searchBusStops = async (req, res) => {
  try {
    const { q, latitude, longitude, radius = 5000, city } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }
    
    let query = {
      isActive: true,
      $text: { $search: q }
    };
    
    if (city) {
      query.city = city.toLowerCase();
    }
    
    let busStops;
    
    if (latitude && longitude) {
      // Search with location preference
      busStops = await BusStop.aggregate([
        { $match: query },
        {
          $geoNear: {
            near: {
              type: 'Point',
              coordinates: [parseFloat(longitude), parseFloat(latitude)]
            },
            distanceField: 'distance',
            maxDistance: parseInt(radius),
            spherical: true
          }
        },
        {
          $lookup: {
            from: 'routes',
            localField: 'routes.routeId',
            foreignField: '_id',
            as: 'routeDetails'
          }
        },
        {
          $addFields: {
            distanceInKm: { $divide: ['$distance', 1000] }
          }
        },
        {
          $sort: { score: { $meta: 'textScore' }, distance: 1 }
        },
        {
          $limit: 10
        }
      ]);
    } else {
      // Search without location
      busStops = await BusStop.find(query)
        .populate('routes.routeId', 'routeNumber routeName')
        .select('-__v')
        .sort({ score: { $meta: 'textScore' } })
        .limit(10);
    }
    
    res.json({
      success: true,
      count: busStops.length,
      data: busStops
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error searching bus stops',
      error: error.message
    });
  }
};

// Create new bus stop (admin only)
const createBusStop = async (req, res) => {
  try {
    const busStop = new BusStop(req.body);
    await busStop.save();
    
    const populatedBusStop = await BusStop.findById(busStop._id)
      .populate('routes.routeId', 'routeNumber routeName');
    
    res.status(201).json({
      success: true,
      data: populatedBusStop
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Stop ID already exists'
      });
    }
    
    res.status(400).json({
      success: false,
      message: 'Error creating bus stop',
      error: error.message
    });
  }
};

module.exports = {
  getAllBusStops,
  getNearbyBusStops,
  getBusStop,
  getBusStopsByRoute,
  searchBusStops,
  createBusStop
};
