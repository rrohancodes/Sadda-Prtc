const Route = require('../models/Route');
const BusStop = require('../models/BusStop');

// Get all routes
const getAllRoutes = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, busType, city } = req.query;
    let query = { isActive: true };
    
    if (search) {
      query.$text = { $search: search };
    }
    
    if (busType) {
      query.busType = busType;
    }
    
    if (city) {
      query.city = city.toLowerCase();
    }
    
    const routes = await Route.find(query)
      .populate('stops.stopId', 'name location stopId')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-__v')
      .sort(search ? { score: { $meta: 'textScore' } } : { routeNumber: 1 });
    
    const total = await Route.countDocuments(query);
    
    res.json({
      success: true,
      count: routes.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: routes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching routes',
      error: error.message
    });
  }
};

// Get route by ID or route number
const getRoute = async (req, res) => {
  try {
    const { id } = req.params;
    
    let route;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      // MongoDB ObjectId
      route = await Route.findById(id)
        .populate('stops.stopId', 'name location stopId facilities')
        .select('-__v');
    } else {
      // Route number
      route = await Route.findOne({ routeNumber: id, isActive: true })
        .populate('stops.stopId', 'name location stopId facilities')
        .select('-__v');
    }
    
    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'Route not found'
      });
    }
    
    // Sort stops by sequence
    route.stops.sort((a, b) => a.sequence - b.sequence);
    
    res.json({
      success: true,
      data: route
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching route',
      error: error.message
    });
  }
};

// Plan journey between two points
const planJourney = async (req, res) => {
  try {
    const { from, to, busType, city } = req.query;
    
    if (!from || !to) {
      return res.status(400).json({
        success: false,
        message: 'From and to locations are required'
      });
    }
    
    // Find bus stops near from and to locations
    let fromStops, toStops;
    
    if (from.includes(',')) {
      // Coordinates provided
      const [fromLat, fromLng] = from.split(',').map(parseFloat);
      fromStops = await BusStop.find({
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [fromLng, fromLat]
            },
            $maxDistance: 1000 // 1km radius
          }
        },
        isActive: true,
        ...(city ? { city: city.toLowerCase() } : {})
      }).limit(5);
    } else {
      // Stop name provided
      fromStops = await BusStop.find({
        $text: { $search: from },
        isActive: true,
        ...(city ? { city: city.toLowerCase() } : {})
      }).limit(5);
    }
    
    if (to.includes(',')) {
      // Coordinates provided
      const [toLat, toLng] = to.split(',').map(parseFloat);
      toStops = await BusStop.find({
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [toLng, toLat]
            },
            $maxDistance: 1000 // 1km radius
          }
        },
        isActive: true,
        ...(city ? { city: city.toLowerCase() } : {})
      }).limit(5);
    } else {
      // Stop name provided
      toStops = await BusStop.find({
        $text: { $search: to },
        isActive: true,
        ...(city ? { city: city.toLowerCase() } : {})
      }).limit(5);
    }
    
    // Find common routes between from and to stops
    const journeyOptions = [];
    
    for (const fromStop of fromStops) {
      for (const toStop of toStops) {
        // Find common routes
        const commonRouteIds = fromStop.routes
          .map(r => r.routeId.toString())
          .filter(routeId => 
            toStop.routes.some(tr => tr.routeId.toString() === routeId)
          );
        
        for (const routeId of commonRouteIds) {
          const route = await Route.findById(routeId)
            .populate('stops.stopId', 'name location stopId');
          if (!route || (busType && route.busType !== busType) || (city && route.city !== city.toLowerCase())) continue;
          
          // Find stop sequences
          const fromStopSeq = route.stops.find(s => 
            s.stopId._id.toString() === fromStop._id.toString()
          )?.sequence;
          
          const toStopSeq = route.stops.find(s => 
            s.stopId._id.toString() === toStop._id.toString()
          )?.sequence;
          
          if (fromStopSeq && toStopSeq && fromStopSeq < toStopSeq) {
            const distance = Math.abs(
              route.stops.find(s => s.sequence === toStopSeq).distanceFromOrigin -
              route.stops.find(s => s.sequence === fromStopSeq).distanceFromOrigin
            );
            
            const estimatedTime = Math.abs(
              route.stops.find(s => s.sequence === toStopSeq).estimatedTime -
              route.stops.find(s => s.sequence === fromStopSeq).estimatedTime
            );
            
            const fare = Math.max(
              route.fare.baseFare,
              Math.ceil(distance * route.fare.ratePerKm)
            );
            
            journeyOptions.push({
              route: {
                _id: route._id,
                routeNumber: route.routeNumber,
                routeName: route.routeName,
                busType: route.busType,
                frequency: route.frequency
              },
              fromStop: {
                _id: fromStop._id,
                name: fromStop.name,
                location: fromStop.location,
                stopId: fromStop.stopId
              },
              toStop: {
                _id: toStop._id,
                name: toStop.name,
                location: toStop.location,
                stopId: toStop.stopId
              },
              distance: distance.toFixed(1),
              estimatedTime,
              fare,
              stops: toStopSeq - fromStopSeq
            });
          }
        }
      }
    }
    
    // Sort by estimated time and fare
    journeyOptions.sort((a, b) => {
      if (a.estimatedTime !== b.estimatedTime) {
        return a.estimatedTime - b.estimatedTime;
      }
      return a.fare - b.fare;
    });
    
    res.json({
      success: true,
      count: journeyOptions.length,
      data: journeyOptions.slice(0, 5) // Return top 5 options
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error planning journey',
      error: error.message
    });
  }
};

// Calculate fare between two stops
const calculateFare = async (req, res) => {
  try {
    const { fromStop, toStop, routeId, busType = 'ordinary', city } = req.query;
    
    if (!fromStop || !toStop) {
      return res.status(400).json({
        success: false,
        message: 'From and to stops are required'
      });
    }
    
    let route;
    if (routeId) {
      route = await Route.findById(routeId);
    } else {
      // Find route that connects both stops
      const fromStopDoc = await BusStop.findOne({
        $or: [
          { _id: fromStop },
          { stopId: fromStop },
          { name: { $regex: fromStop, $options: 'i' } }
        ],
        ...(city ? { city: city.toLowerCase() } : {})
      });
      
      const toStopDoc = await BusStop.findOne({
        $or: [
          { _id: toStop },
          { stopId: toStop },
          { name: { $regex: toStop, $options: 'i' } }
        ],
        ...(city ? { city: city.toLowerCase() } : {})
      });
      
      if (!fromStopDoc || !toStopDoc) {
        return res.status(404).json({
          success: false,
          message: 'One or both stops not found'
        });
      }
      
      // Find common route
      const commonRouteId = fromStopDoc.routes
        .map(r => r.routeId.toString())
        .find(routeId => 
          toStopDoc.routes.some(tr => tr.routeId.toString() === routeId)
        );
      
      if (commonRouteId) {
        route = await Route.findById(commonRouteId);
      }
    }
    
    if (!route || (city && route.city !== city.toLowerCase())) {
      return res.status(404).json({
        success: false,
        message: 'No direct route found between the stops'
      });
    }
    
    // Find stop sequences and calculate distance
    const fromStopSeq = route.stops.find(s => 
      s.stopId.toString() === fromStop || 
      s.stopId.stopId === fromStop
    );
    
    const toStopSeq = route.stops.find(s => 
      s.stopId.toString() === toStop || 
      s.stopId.stopId === toStop
    );
    
    if (!fromStopSeq || !toStopSeq) {
      return res.status(404).json({
        success: false,
        message: 'Stops not found on this route'
      });
    }
    
    const distance = Math.abs(toStopSeq.distanceFromOrigin - fromStopSeq.distanceFromOrigin);
    const baseFare = route.fare.baseFare;
    const ratePerKm = route.fare.ratePerKm;
    
    const calculatedFare = Math.max(baseFare, Math.ceil(distance * ratePerKm));
    
    // Calculate discounts
    const discounts = {
      student: Math.ceil(calculatedFare * 0.5),
      senior: 0, // Free for senior citizens
      monthly: Math.ceil(calculatedFare * 22) // 22 working days
    };
    
    res.json({
      success: true,
      data: {
        route: {
          _id: route._id,
          routeNumber: route.routeNumber,
          routeName: route.routeName,
          busType: route.busType
        },
        distance: distance.toFixed(1),
        baseFare,
        calculatedFare,
        discounts,
        estimatedTime: Math.abs(toStopSeq.estimatedTime - fromStopSeq.estimatedTime),
        stops: Math.abs(toStopSeq.sequence - fromStopSeq.sequence)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error calculating fare',
      error: error.message
    });
  }
};

// Create new route (admin only)
const createRoute = async (req, res) => {
  try {
    const route = new Route(req.body);
    await route.save();
    
    const populatedRoute = await Route.findById(route._id)
      .populate('stops.stopId', 'name location stopId');
    
    res.status(201).json({
      success: true,
      data: populatedRoute
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Route number already exists'
      });
    }
    
    res.status(400).json({
      success: false,
      message: 'Error creating route',
      error: error.message
    });
  }
};

module.exports = {
  getAllRoutes,
  getRoute,
  planJourney,
  calculateFare,
  createRoute
};
