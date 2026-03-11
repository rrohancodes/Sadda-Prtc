# Namma BMTC Clone

An exact clone of the Namma BMTC app built with React Native and Expo. This app provides comprehensive public transportation features including real-time bus tracking, journey planning, fare calculation, and emergency services.

## Features

### ✅ Core Features Implemented

- **🏠 Home Screen**: Quick access dashboard with BMTC branding
- **🚌 Live Bus Tracking**: Real-time bus locations with interactive maps
- **📍 Nearby Stops**: Find bus stops near your location with facilities info
- **🗺️ Journey Planner**: Plan routes with multiple bus options and timing
- **💰 Fare Calculator**: Calculate fares for different bus types with discounts
- **🆘 Emergency SOS**: Safety feature with location sharing and emergency contacts
- **👤 Profile Management**: User settings and travel statistics

### 🎨 Design Features

- **BMTC Brand Colors**: Authentic red (#D32F2F) and yellow (#FFC107) color scheme
- **Modern UI**: Clean, intuitive interface with Material Design principles
- **Responsive Design**: Optimized for all screen sizes
- **Smooth Animations**: Gradient backgrounds and smooth transitions
- **Accessibility**: High contrast colors and clear typography

### 🚀 Technical Features

- **React Native & Expo**: Cross-platform development
- **React Navigation**: Smooth tab and stack navigation
- **Location Services**: GPS integration for location-based features
- **Maps Integration**: Interactive maps with markers and routes
- **Mock Data**: Realistic bus routes, stops, and timing data
- **Error Handling**: Comprehensive error handling and user feedback

## Installation

### Prerequisites

- Node.js (v16 or later)
- npm or yarn
- Expo CLI
- iOS Simulator / Android Emulator or Expo Go app on your phone
- MongoDB Atlas account (for backend)

### Setup

#### Frontend (React Native App)

1. **Navigate to the app directory**
   ```bash
   cd "namma bus/NammaBMTCClone"
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Run on device/simulator**
   - Press `i` for iOS Simulator
   - Press `a` for Android Emulator
   - Scan QR code with Expo Go app on your phone

#### Backend (API Server)

1. **Navigate to the backend directory**
   ```bash
   cd "namma bus/backend"
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Create .env file with:
   MONGODB_URI=mongodb+srv://bora:arnav@cluster0.viblu0y.mongodb.net/sih-tracking?retryWrites=true&w=majority&appName=Cluster0
   PORT=5000
   JWT_SECRET=your-secret-key
   NODE_ENV=development
   ```

4. **Seed the database**
   ```bash
   npm run seed
   ```

5. **Start the backend server**
   ```bash
   npm run dev
   ```

The backend API will be available at `http://localhost:5000`

## App Structure

```
src/
├── constants/
│   ├── Colors.js          # BMTC brand colors and theme
│   └── Layout.js          # Layout constants and spacing
├── navigation/
│   ├── AppNavigator.js    # Main stack navigator
│   └── TabNavigator.js    # Bottom tab navigation
├── screens/
│   ├── HomeScreen.js      # Main dashboard
│   ├── LiveTrackingScreen.js  # Real-time bus tracking
│   ├── NearbyStopsScreen.js   # Nearby bus stops
│   ├── JourneyPlannerScreen.js # Route planning
│   ├── FareCalculatorScreen.js # Fare calculation
│   ├── SOSScreen.js       # Emergency services
│   └── ProfileScreen.js   # User profile
├── components/            # Reusable UI components
├── services/             # API services (mock data)
└── utils/                # Utility functions
```

## Screens Overview

### 🏠 Home Screen
- Welcome banner with BMTC branding
- Quick access buttons for all major features
- Emergency SOS button prominently displayed
- Recent trips section
- Feature highlights grid

### 🚌 Live Bus Tracking
- Interactive map with real-time bus locations
- Bus route polylines
- Bus information overlay with speed, ETA, and occupancy
- Filter and navigation controls

### 📍 Nearby Stops
- GPS-based location detection
- List of nearby bus stops with distances
- Route information for each stop
- Facilities information (parking, restroom, ATM)

### 🗺️ Journey Planner
- Source and destination input
- Multiple route options with timing
- Fare information and trip duration
- Popular destinations quick access

### 💰 Fare Calculator
- Distance-based fare calculation
- Multiple bus types (Ordinary, Vajra, Atal Sarige)
- Discount calculations (Student, Senior Citizen, Monthly Pass)
- Popular routes quick selection

### 🆘 Emergency SOS
- One-touch emergency activation with countdown
- Location sharing with emergency services
- Quick access to emergency contact numbers
- Safety tips and guidelines

### 👤 Profile Screen
- User statistics and travel history
- Settings and preferences
- Language selection
- Help and support access

## Database & API Integration

The app is now connected to a MongoDB database via a REST API:

### Backend Features
- **MongoDB Database**: Persistent data storage with proper schemas
- **REST API**: Comprehensive endpoints for all app features
- **WebSocket Support**: Real-time bus tracking and updates
- **Geospatial Queries**: Efficient location-based searches
- **Data Validation**: Mongoose schema validation and error handling

### Sample Data
- **10 Bus Stops**: Major Bangalore locations with real coordinates
- **3 Active Routes**: Covering different parts of the city
- **3 Live Buses**: With real-time location tracking
- **Fare Structure**: Accurate BMTC fare calculations
- **Emergency Contacts**: Real emergency service numbers

### API Endpoints
- `/api/buses` - Bus management and tracking
- `/api/bus-stops` - Stop information and nearby searches
- `/api/routes` - Route planning and fare calculation
- `/api/health` - System health monitoring

## Customization

### Colors
Edit `src/constants/Colors.js` to modify the color scheme:
```javascript
export const Colors = {
  primary: '#D32F2F',      // BMTC Red
  secondary: '#FFC107',     // BMTC Yellow
  // ... other colors
};
```

### Layout
Modify spacing and dimensions in `src/constants/Layout.js`:
```javascript
export const Layout = {
  spacing: {
    xs: 4, sm: 8, md: 16, lg: 24, xl: 32
  },
  // ... other layout constants
};
```

## API Integration

The app is fully integrated with a MongoDB backend:

### Current Implementation
1. **Real API Calls**: All screens now use actual API endpoints
2. **MongoDB Integration**: Persistent data storage with proper schemas
3. **WebSocket Support**: Real-time bus location updates
4. **Error Handling**: Comprehensive error handling and user feedback

### API Service (`src/services/api.js`)
- Centralized API communication
- Automatic error handling
- Request/response transformation
- Base URL configuration

### WebSocket Service (`src/services/socketService.js`)
- Real-time bus tracking
- Live location updates
- Connection management
- Event handling

## Deployment

### Building for Production

```bash
# Build for iOS
expo build:ios

# Build for Android
expo build:android

# Or use EAS Build (recommended)
eas build --platform ios
eas build --platform android
```

### App Store Deployment

1. Configure app signing in `app.json`
2. Build production binaries
3. Upload to respective app stores
4. Follow store review guidelines

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is for educational purposes. BMTC is a trademark of Bangalore Metropolitan Transport Corporation.

## Support

For issues and questions:
- Check the GitHub issues
- Review the Expo documentation
- React Navigation documentation

## Roadmap

- [ ] Real BMTC API integration
- [ ] Push notifications for bus arrivals
- [ ] Offline mode support
- [ ] Multi-language support
- [ ] Payment gateway integration
- [ ] Social features and reviews
- [ ] Advanced analytics and reporting

---

**Built with ❤️ using React Native & Expo**
