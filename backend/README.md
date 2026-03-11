# Namma BMTC Backend API

A comprehensive REST API server for the Namma BMTC app clone, built with Node.js, Express.js, and MongoDB. This backend provides real-time bus tracking, route planning, fare calculation, and user management features.

## Features

### 🚌 Bus Management
- Real-time bus location tracking
- Bus information and status
- Route-based bus filtering
- Nearby buses with geospatial queries

### 🚏 Bus Stop Management
- Comprehensive bus stop database
- Nearby stops with distance calculation
- Route information for each stop
- Facilities and amenities data

### 🛣️ Route Management
- Complete route information
- Journey planning between locations
- Fare calculation with discounts
- Multiple bus types support

### 🔄 Real-time Updates
- WebSocket integration for live tracking
- Real-time bus location updates
- Route status notifications
- Live occupancy information

## Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Real-time**: Socket.IO
- **Security**: Helmet, CORS, Rate Limiting
- **Authentication**: JWT (ready for implementation)

## Installation & Setup

### Prerequisites
- Node.js (v16 or later)
- MongoDB Atlas account or local MongoDB
- npm or yarn

### Environment Variables
Create a `.env` file in the backend directory:

```env
MONGODB_URI=mongodb+srv://bora:arnav@cluster0.viblu0y.mongodb.net/sih-tracking?retryWrites=true&w=majority&appName=Cluster0
PORT=5000
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=development
```

### Installation Steps

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Seed the database with sample data**
   ```bash
   npm run seed
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Or start in production mode**
   ```bash
   npm start
   ```

The server will be available at `http://localhost:5000`

## API Endpoints

### Bus Endpoints

#### Get All Buses
```http
GET /api/buses
```

#### Get Nearby Buses
```http
GET /api/buses/nearby?latitude=12.9716&longitude=77.5946&radius=5000
```

#### Get Buses by Route
```http
GET /api/buses/route/:routeId
```

#### Get Single Bus
```http
GET /api/buses/:busId
```

#### Update Bus Location (Real-time)
```http
PUT /api/buses/:busId/location
Content-Type: application/json

{
  "latitude": 12.9716,
  "longitude": 77.5946,
  "speed": 25,
  "heading": 90,
  "nextStop": "Brigade Road",
  "eta": "5 mins",
  "occupancy": "Medium"
}
```

### Bus Stop Endpoints

#### Get All Bus Stops
```http
GET /api/bus-stops?page=1&limit=50&search=majestic
```

#### Get Nearby Bus Stops
```http
GET /api/bus-stops/nearby?latitude=12.9716&longitude=77.5946&radius=2000
```

#### Search Bus Stops
```http
GET /api/bus-stops/search?q=majestic&latitude=12.9716&longitude=77.5946
```

#### Get Bus Stops by Route
```http
GET /api/bus-stops/route/:routeId
```

#### Get Single Bus Stop
```http
GET /api/bus-stops/:stopId
```

### Route Endpoints

#### Get All Routes
```http
GET /api/routes?page=1&limit=20&search=majestic&busType=ordinary
```

#### Plan Journey
```http
GET /api/routes/plan-journey?from=Majestic&to=Electronic City&busType=ordinary
```

#### Calculate Fare
```http
GET /api/routes/calculate-fare?fromStop=Majestic&toStop=Electronic City&busType=ordinary
```

#### Get Single Route
```http
GET /api/routes/:routeId
```

### Health Check
```http
GET /api/health
```

## WebSocket Events

### Client to Server

#### Track Bus
```javascript
socket.emit('track-bus', busId);
```

#### Track Route
```javascript
socket.emit('track-route', routeId);
```

#### Stop Tracking
```javascript
socket.emit('stop-tracking', id);
```

### Server to Client

#### Bus Location Update
```javascript
socket.on('bus-location-update', (data) => {
  // data contains: busId, latitude, longitude, speed, etc.
});
```

#### Route Update
```javascript
socket.on('route-update', (data) => {
  // data contains: routeId, buses, delays, etc.
});
```

## Database Schema

### Bus Schema
```javascript
{
  busNumber: String,        // "KA-01-HB-2001"
  route: String,           // "Majestic - Electronic City"
  routeId: ObjectId,       // Reference to Route
  busType: String,         // "ordinary", "vajra", "atal_sarige"
  currentLocation: {
    latitude: Number,
    longitude: Number
  },
  speed: Number,           // km/h
  nextStop: String,
  eta: String,
  occupancy: String,       // "Low", "Medium", "High"
  capacity: Number,
  currentPassengers: Number,
  isActive: Boolean
}
```

### Bus Stop Schema
```javascript
{
  name: String,            // "Majestic Bus Station"
  location: {
    latitude: Number,
    longitude: Number
  },
  stopId: String,          // "MJS001"
  routes: [{
    routeId: ObjectId,
    routeNumber: String,
    direction: String      // "UP", "DOWN", "BOTH"
  }],
  facilities: [String],    // ["parking", "restroom", "atm"]
  address: String,
  landmark: String,
  zone: String,
  depot: String
}
```

### Route Schema
```javascript
{
  routeNumber: String,     // "201"
  routeName: String,       // "Majestic - Electronic City"
  origin: String,
  destination: String,
  distance: Number,        // km
  estimatedDuration: Number, // minutes
  stops: [{
    stopId: ObjectId,
    sequence: Number,
    distanceFromOrigin: Number,
    estimatedTime: Number
  }],
  busType: String,
  fare: {
    baseFare: Number,
    ratePerKm: Number
  },
  frequency: {
    peakHours: String,
    offPeakHours: String
  },
  operatingHours: {
    start: String,         // "05:30"
    end: String           // "23:00"
  }
}
```

## Sample Data

The database is seeded with:
- **10 Bus Stops**: Major Bangalore locations
- **3 Routes**: Covering different parts of the city
- **3 Buses**: With real-time location data

### Sample Routes
1. **Route 201**: Majestic - Electronic City (Ordinary)
2. **Route 301A**: Majestic - Whitefield (Vajra/AC)
3. **Route 401**: Vidhana Soudha - Koramangala (Ordinary)

## Error Handling

The API uses consistent error response format:

```javascript
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message (development only)"
}
```

Common HTTP status codes:
- `200`: Success
- `400`: Bad Request
- `404`: Not Found
- `500`: Internal Server Error

## Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Input Validation**: Mongoose schema validation
- **Environment Variables**: Sensitive data protection

## Performance Features

- **MongoDB Indexes**: Optimized queries
- **Geospatial Queries**: Efficient location-based searches
- **Pagination**: Large dataset handling
- **Connection Pooling**: Database optimization

## Development

### Scripts
- `npm start`: Production server
- `npm run dev`: Development with nodemon
- `npm run seed`: Populate database with sample data

### Debugging
Enable debug logs by setting:
```bash
DEBUG=socket.io:* npm run dev
```

## Production Deployment

### Environment Setup
1. Set `NODE_ENV=production`
2. Use strong JWT secret
3. Configure proper CORS origins
4. Set up MongoDB Atlas with proper security

### Recommended Deployment Platforms
- **Heroku**: Easy deployment with MongoDB Atlas
- **Railway**: Modern deployment platform
- **DigitalOcean**: VPS with Docker
- **AWS EC2**: Full control deployment

### Docker Support
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## API Testing

Use tools like Postman, Insomnia, or curl:

```bash
# Test health endpoint
curl http://localhost:5000/api/health

# Get nearby buses
curl "http://localhost:5000/api/buses/nearby?latitude=12.9716&longitude=77.5946"

# Plan journey
curl "http://localhost:5000/api/routes/plan-journey?from=Majestic&to=Electronic%20City"
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is for educational purposes. BMTC is a trademark of Bangalore Metropolitan Transport Corporation.

---

**Built with ❤️ for the Namma BMTC ecosystem**
