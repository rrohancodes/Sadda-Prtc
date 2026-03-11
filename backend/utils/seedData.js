const mongoose = require('mongoose');
require('dotenv').config();

const Bus = require('../models/Bus');
const BusStop = require('../models/BusStop');
const Route = require('../models/Route');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected for seeding...');
  } catch (error) {
    console.error('Database connection error:', error.message);
    process.exit(1);
  }
};

// Sample bus stops data
const busStopsData = [
  {
    name: 'Majestic Bus Station',
    location: { latitude: 12.9767, longitude: 77.5693 },
    stopId: 'MJS001',
    facilities: ['parking', 'restroom', 'atm', 'food'],
    address: 'Kempegowda Bus Station, Majestic, Bengaluru',
    landmark: 'City Railway Station',
    zone: 'Central',
    depot: 'Majestic',
    city: 'bengaluru'
  },
  {
    name: 'City Railway Station',
    location: { latitude: 12.9698, longitude: 77.5659 },
    stopId: 'CRS002',
    facilities: ['parking', 'restroom', 'atm'],
    address: 'City Railway Station Road, Bengaluru',
    landmark: 'Bangalore City Railway Station',
    zone: 'Central',
    depot: 'Majestic',
    city: 'bengaluru'
  },
  {
    name: 'Vidhana Soudha',
    location: { latitude: 12.9794, longitude: 77.5912 },
    stopId: 'VDS003',
    facilities: ['parking'],
    address: 'Vidhana Soudha, Ambedkar Veedhi, Bengaluru',
    landmark: 'State Secretariat',
    zone: 'Central',
    depot: 'Vidhana Soudha',
    city: 'bengaluru'
  },
  {
    name: 'Cubbon Park',
    location: { latitude: 12.9718, longitude: 77.5924 },
    stopId: 'CBP004',
    facilities: ['restroom'],
    address: 'Cubbon Park, Kasturba Road, Bengaluru',
    landmark: 'Cubbon Park Metro Station',
    zone: 'Central',
    depot: 'Shivaji Nagar',
    city: 'bengaluru'
  },
  {
    name: 'Brigade Road',
    location: { latitude: 12.9719, longitude: 77.6109 },
    stopId: 'BRD005',
    facilities: ['atm'],
    address: 'Brigade Road, Bengaluru',
    landmark: 'Commercial Street Junction',
    zone: 'Central',
    depot: 'Shivaji Nagar',
    city: 'bengaluru'
  },
  {
    name: 'Koramangala',
    location: { latitude: 12.9352, longitude: 77.6245 },
    stopId: 'KRM006',
    facilities: ['parking', 'atm'],
    address: 'Koramangala 5th Block, Bengaluru',
    landmark: 'Forum Mall',
    zone: 'South',
    depot: 'Koramangala',
    city: 'bengaluru'
  },
  {
    name: 'BTM Layout',
    location: { latitude: 12.9165, longitude: 77.6101 },
    stopId: 'BTM007',
    facilities: ['parking', 'restroom'],
    address: 'BTM Layout 1st Stage, Bengaluru',
    landmark: 'Silk Board Junction',
    zone: 'South',
    depot: 'BTM',
    city: 'bengaluru'
  },
  {
    name: 'Electronic City',
    location: { latitude: 12.8456, longitude: 77.6603 },
    stopId: 'ELC008',
    facilities: ['parking', 'restroom', 'atm', 'food'],
    address: 'Electronic City Phase 1, Bengaluru',
    landmark: 'Infosys Campus',
    zone: 'South',
    depot: 'Electronic City',
    city: 'bengaluru'
  },
  {
    name: 'Whitefield',
    location: { latitude: 12.9698, longitude: 77.7499 },
    stopId: 'WHF009',
    facilities: ['parking', 'restroom', 'atm'],
    address: 'Whitefield Main Road, Bengaluru',
    landmark: 'ITPL',
    zone: 'East',
    depot: 'Whitefield',
    city: 'bengaluru'
  },
  {
    name: 'Airport',
    location: { latitude: 13.1986, longitude: 77.7066 },
    stopId: 'APT010',
    facilities: ['parking', 'restroom', 'atm', 'food'],
    address: 'Kempegowda International Airport, Bengaluru',
    landmark: 'Airport Terminal',
    zone: 'North',
    depot: 'Yelahanka',
    city: 'bengaluru'
  }
];

// Sample routes data
const routesData = [
  {
    routeNumber: '201',
    routeName: 'Majestic - Electronic City',
    origin: 'Majestic Bus Station',
    destination: 'Electronic City',
    distance: 28.5,
    estimatedDuration: 75,
    busType: 'ordinary',
    fare: { baseFare: 5, ratePerKm: 1.2 },
    frequency: { peakHours: '10-15 mins', offPeakHours: '15-20 mins' },
    operatingHours: { start: '05:30', end: '23:00' },
    depot: 'Electronic City',
    city: 'bengaluru'
  },
  {
    routeNumber: '301A',
    routeName: 'Majestic - Whitefield',
    origin: 'Majestic Bus Station',
    destination: 'Whitefield',
    distance: 25.3,
    estimatedDuration: 65,
    busType: 'vajra',
    fare: { baseFare: 10, ratePerKm: 2.0 },
    frequency: { peakHours: '15-20 mins', offPeakHours: '20-25 mins' },
    operatingHours: { start: '06:00', end: '22:30' },
    depot: 'Whitefield',
    city: 'bengaluru'
  },
  {
    routeNumber: '401',
    routeName: 'Vidhana Soudha - Koramangala',
    origin: 'Vidhana Soudha',
    destination: 'Koramangala',
    distance: 15.7,
    estimatedDuration: 45,
    busType: 'ordinary',
    fare: { baseFare: 5, ratePerKm: 1.2 },
    frequency: { peakHours: '8-12 mins', offPeakHours: '12-18 mins' },
    operatingHours: { start: '05:45', end: '23:30' },
    depot: 'Koramangala',
    city: 'bengaluru'
  }
];

// Sample buses data
const busesData = [
  {
    busNumber: 'KA-01-HB-2001',
    route: 'Majestic - Electronic City',
    busType: 'ordinary',
    currentLocation: { latitude: 12.9767, longitude: 77.5693 },
    speed: 25,
    nextStop: 'City Railway Station',
    eta: '3 mins',
    occupancy: 'Medium',
    capacity: 40,
    currentPassengers: 25,
    driverId: 'DRV001',
    city: 'bengaluru'
  },
  {
    busNumber: 'KA-01-HB-3001',
    route: 'Majestic - Whitefield',
    busType: 'vajra',
    currentLocation: { latitude: 12.9698, longitude: 77.5659 },
    speed: 30,
    nextStop: 'Freedom Park',
    eta: '5 mins',
    occupancy: 'High',
    capacity: 45,
    currentPassengers: 38,
    driverId: 'DRV002',
    city: 'bengaluru'
  },
  {
    busNumber: 'KA-01-HB-4001',
    route: 'Vidhana Soudha - Koramangala',
    busType: 'ordinary',
    currentLocation: { latitude: 12.9794, longitude: 77.5912 },
    speed: 20,
    nextStop: 'Cubbon Park',
    eta: '2 mins',
    occupancy: 'Low',
    capacity: 40,
    currentPassengers: 15,
    driverId: 'DRV003',
    city: 'bengaluru'
  }
];

// Tumkur additional data
const tumkurBusStops = [
  {
    name: 'Tumkur KSRTC Bus Stand',
    location: { latitude: 13.3410, longitude: 77.1010 },
    stopId: 'TMK001',
    facilities: ['parking', 'restroom', 'atm'],
    address: 'KSRTC Bus Stand, Tumkur',
    landmark: 'Central Bus Stand',
    zone: 'Central',
    depot: 'Tumkur Central',
    city: 'tumkur'
  },
  {
    name: 'SIT College',
    location: { latitude: 13.3205, longitude: 77.1122 },
    stopId: 'TMK002',
    facilities: ['parking'],
    address: 'Siddaganga Institute Of Technology, Tumkur',
    landmark: 'SIT Main Gate',
    zone: 'South',
    depot: 'Tumkur South',
    city: 'tumkur'
  },
  {
    name: 'Tumkur Town Hall',
    location: { latitude: 13.3382, longitude: 77.0975 },
    stopId: 'TMK003',
    facilities: ['parking', 'restroom'],
    address: 'Town Hall Road, Tumkur',
    landmark: 'Town Hall',
    zone: 'Central',
    depot: 'Tumkur Central',
    city: 'tumkur'
  },
  {
    name: 'Gubbi Gate',
    location: { latitude: 13.3456, longitude: 77.1151 },
    stopId: 'TMK004',
    facilities: ['restroom'],
    address: 'Gubbi Gate, Tumkur',
    landmark: 'Gubbi Gate Circle',
    zone: 'North',
    depot: 'Tumkur North',
    city: 'tumkur'
  }
];

const tumkurRoutes = [
  {
    routeNumber: 'T1',
    routeName: 'KSRTC Stand - SIT College - Town Hall',
    origin: 'Tumkur KSRTC Bus Stand',
    destination: 'Tumkur Town Hall',
    distance: 7,
    estimatedDuration: 20,
    busType: 'ordinary',
    fare: { baseFare: 5, ratePerKm: 1.1 },
    frequency: { peakHours: '12-15 mins', offPeakHours: '18-22 mins' },
    operatingHours: { start: '06:00', end: '22:00' },
    depot: 'Tumkur Central',
    city: 'tumkur'
  },
  {
    routeNumber: 'T2',
    routeName: 'KSRTC Stand - Town Hall - Gubbi Gate',
    origin: 'Tumkur KSRTC Bus Stand',
    destination: 'Gubbi Gate',
    distance: 6,
    estimatedDuration: 18,
    busType: 'ordinary',
    fare: { baseFare: 5, ratePerKm: 1.1 },
    frequency: { peakHours: '10-12 mins', offPeakHours: '15-20 mins' },
    operatingHours: { start: '06:15', end: '22:15' },
    depot: 'Tumkur Central',
    city: 'tumkur'
  }
];

const tumkurBuses = [
  {
    busNumber: 'KA-06-T-1001',
    route: 'KSRTC Stand - SIT College - Town Hall',
    busType: 'ordinary',
    currentLocation: { latitude: 13.3410, longitude: 77.1010 },
    speed: 20,
    nextStop: 'SIT College',
    eta: '4 mins',
    occupancy: 'Medium',
    capacity: 40,
    currentPassengers: 22,
    driverId: 'TMKDRV001',
    city: 'tumkur'
  },
  {
    busNumber: 'KA-06-T-2001',
    route: 'KSRTC Stand - Town Hall - Gubbi Gate',
    busType: 'ordinary',
    currentLocation: { latitude: 13.3382, longitude: 77.0975 },
    speed: 18,
    nextStop: 'Gubbi Gate',
    eta: '6 mins',
    occupancy: 'Low',
    capacity: 40,
    currentPassengers: 12,
    driverId: 'TMKDRV002',
    city: 'tumkur'
  }
];

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Clear existing data
    await Bus.deleteMany({});
    await BusStop.deleteMany({});
    await Route.deleteMany({});
    console.log('✅ Cleared existing data');
    
    // Insert bus stops
    const insertedBusStops = await BusStop.insertMany(busStopsData);
    console.log(`✅ Inserted ${insertedBusStops.length} bus stops`);
    
    // Create routes with proper stop references
    const routesWithStops = [];
    
    for (let i = 0; i < routesData.length; i++) {
      const routeData = routesData[i];
      const route = { ...routeData };
      
      // Add stops to route based on route number
      if (route.routeNumber === '201') {
        route.stops = [
          { stopId: insertedBusStops[0]._id, sequence: 1, distanceFromOrigin: 0, estimatedTime: 0 },
          { stopId: insertedBusStops[1]._id, sequence: 2, distanceFromOrigin: 2.5, estimatedTime: 5 },
          { stopId: insertedBusStops[4]._id, sequence: 3, distanceFromOrigin: 10.3, estimatedTime: 20 },
          { stopId: insertedBusStops[5]._id, sequence: 4, distanceFromOrigin: 15.7, estimatedTime: 35 },
          { stopId: insertedBusStops[6]._id, sequence: 5, distanceFromOrigin: 18.9, estimatedTime: 50 },
          { stopId: insertedBusStops[7]._id, sequence: 6, distanceFromOrigin: 28.5, estimatedTime: 75 }
        ];
      } else if (route.routeNumber === '301A') {
        route.stops = [
          { stopId: insertedBusStops[0]._id, sequence: 1, distanceFromOrigin: 0, estimatedTime: 0 },
          { stopId: insertedBusStops[3]._id, sequence: 2, distanceFromOrigin: 5.2, estimatedTime: 15 },
          { stopId: insertedBusStops[4]._id, sequence: 3, distanceFromOrigin: 10.3, estimatedTime: 25 },
          { stopId: insertedBusStops[8]._id, sequence: 4, distanceFromOrigin: 25.3, estimatedTime: 65 }
        ];
      } else if (route.routeNumber === '401') {
        route.stops = [
          { stopId: insertedBusStops[2]._id, sequence: 1, distanceFromOrigin: 0, estimatedTime: 0 },
          { stopId: insertedBusStops[3]._id, sequence: 2, distanceFromOrigin: 2.8, estimatedTime: 8 },
          { stopId: insertedBusStops[4]._id, sequence: 3, distanceFromOrigin: 7.9, estimatedTime: 20 },
          { stopId: insertedBusStops[5]._id, sequence: 4, distanceFromOrigin: 15.7, estimatedTime: 45 }
        ];
      }
      
      routesWithStops.push(route);
    }
    
    const insertedRoutes = await Route.insertMany(routesWithStops);
    console.log(`✅ Inserted ${insertedRoutes.length} routes`);
    
    // Update bus stops with route references
    for (let i = 0; i < insertedBusStops.length; i++) {
      const busStop = insertedBusStops[i];
      const routes = [];
      
      // Find routes that include this stop
      for (const route of insertedRoutes) {
        const stopInRoute = route.stops.find(s => s.stopId.toString() === busStop._id.toString());
        if (stopInRoute) {
          routes.push({
            routeId: route._id,
            routeNumber: route.routeNumber,
            direction: 'BOTH'
          });
        }
      }
      
      await BusStop.findByIdAndUpdate(busStop._id, { routes });
    }
    console.log('✅ Updated bus stops with route references');
    
    // Insert buses with route references
    const busesWithRoutes = busesData.map(bus => {
      const route = insertedRoutes.find(r => r.routeName === bus.route);
      return {
        ...bus,
        routeId: route._id
      };
    });
    
    const insertedBuses = await Bus.insertMany(busesWithRoutes);
    console.log(`✅ Inserted ${insertedBuses.length} buses`);
    
    // Insert Tumkur data
    const insertedTumkurBusStops = await BusStop.insertMany(tumkurBusStops);
    console.log(`✅ Inserted ${insertedTumkurBusStops.length} Tumkur bus stops`);
    
    const tumkurRoutesWithStops = [];
    
    for (let i = 0; i < tumkurRoutes.length; i++) {
      const routeData = tumkurRoutes[i];
      const route = { ...routeData };
      
      // Add stops to route based on route number
      if (route.routeNumber === 'T1') {
        route.stops = [
          { stopId: insertedTumkurBusStops[0]._id, sequence: 1, distanceFromOrigin: 0, estimatedTime: 0 },
          { stopId: insertedTumkurBusStops[1]._id, sequence: 2, distanceFromOrigin: 3.5, estimatedTime: 10 },
          { stopId: insertedTumkurBusStops[2]._id, sequence: 3, distanceFromOrigin: 7, estimatedTime: 20 }
        ];
      } else if (route.routeNumber === 'T2') {
        route.stops = [
          { stopId: insertedTumkurBusStops[0]._id, sequence: 1, distanceFromOrigin: 0, estimatedTime: 0 },
          { stopId: insertedTumkurBusStops[2]._id, sequence: 2, distanceFromOrigin: 2.5, estimatedTime: 8 },
          { stopId: insertedTumkurBusStops[3]._id, sequence: 3, distanceFromOrigin: 6, estimatedTime: 18 }
        ];
      }
      
      tumkurRoutesWithStops.push(route);
    }
    
    const insertedTumkurRoutes = await Route.insertMany(tumkurRoutesWithStops);
    console.log(`✅ Inserted ${insertedTumkurRoutes.length} Tumkur routes`);
    
    // Update Tumkur bus stops with route references
    for (let i = 0; i < insertedTumkurBusStops.length; i++) {
      const busStop = insertedTumkurBusStops[i];
      const routes = [];
      
      // Find routes that include this stop
      for (const route of insertedTumkurRoutes) {
        const stopInRoute = route.stops.find(s => s.stopId.toString() === busStop._id.toString());
        if (stopInRoute) {
          routes.push({
            routeId: route._id,
            routeNumber: route.routeNumber,
            direction: 'BOTH'
          });
        }
      }
      
      await BusStop.findByIdAndUpdate(busStop._id, { routes });
    }
    console.log('✅ Updated Tumkur bus stops with route references');
    
    // Insert Tumkur buses with route references
    const busesWithTumkurRoutes = tumkurBuses.map(bus => {
      const route = insertedTumkurRoutes.find(r => r.routeName === bus.route);
      return {
        ...bus,
        routeId: route._id
      };
    });
    
    const insertedTumkurBuses = await Bus.insertMany(busesWithTumkurRoutes);
    console.log(`✅ Inserted ${insertedTumkurBuses.length} Tumkur buses`);
    
    console.log('🎉 Database seeding completed successfully!');
    console.log(`
📊 Summary:
- Bus Stops: ${insertedBusStops.length + insertedTumkurBusStops.length}
- Routes: ${insertedRoutes.length + insertedTumkurRoutes.length}
- Buses: ${insertedBuses.length + insertedTumkurBuses.length}
    `);
    
  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
};

// Run seeder
connectDB().then(() => {
  seedDatabase();
});

module.exports = { seedDatabase };
