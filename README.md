# SADDA PRTC ("Inspired By Namma BMTC App")

A full‑stack smart transit prototype providing real‑time inter/intra‑city bus tracking, dynamic corridor visualization (Bengaluru ⇄ Tumkur), generated corridor bus stops, next‑stop distance lookup, journey planning scaffolding, fare logic, and multilingual mobile UI (incl. Punjabi) built during a rapid hackathon sprint.

> Educational / demo project. Not affiliated with BMTC / PRTC. Do **not** use the included sample keys or connection strings in production.

---
## ✨ High‑Level Features
| Domain | Key Capabilities |
|--------|------------------|
| Live Tracking | Current vehicle positions (Mongo aggregate latest per vehicle), adaptive client polling (2s → backoff on 429), high‑accuracy user GPS with smoothing |
| Corridor | Ingested high‑precision polyline (Bengaluru–Tumkur), simplified for map rendering, cumulative distance metadata |
| Corridor Stops | Auto‑generated bus stops from polyline every N km with sequence + distanceAlongCorridor + map markers |
| Next Stop Distance | API: vehicle → nearest corridor stop (with fallback to Bus collection if currentlocations missing) |
| Bus Data | Nearby search (geospatial), route filtering, occupancy, speed, heading placeholders |
| Bus Stops | Facilities, geospatial index, search & nearby, corridor metadata fields |
| Routes | Schema for stops sequence, fare components, duration, frequency (future expansion) |
| Real‑Time Strategy | Poll-first design (adaptive) + Socket.IO scaffolding for future push updates |
| Localization | Punjabi locale added (extensible) |
| Resilience | Rate limit skip list for high‑frequency endpoints, exponential backoff, timeout + single active polling loop |

---
## 🏗️ Architecture Overview
```
Root
├─ backend/                # Express + MongoDB API
│  ├─ models/              # Mongoose schemas (Bus, BusStop, Route, CurrentLocation, Corridor)
│  ├─ routes/              # REST endpoints (buses, bus-stops, routes, corridor, driver, auth)
│  ├─ scripts/             # Utility scripts (e.g., generateCorridorBusStops.js)
│  ├─ data/                # GeoJSON / seed assets
│  └─ server.js            # App bootstrap & Socket.IO wiring
└─ NammaBMTCClone/         # React Native (Expo) mobile app
   ├─ src/screens/         # UI Screens (LiveTracking, NearbyStops, Planner, etc.)
   ├─ src/services/        # api.js (REST client), socketService.js
   ├─ src/constants/       # Colors / Layout
   └─ assets/              # App icons, marker images
```

### Data Flow (Live Vehicles)
1. Driver / ingestion process inserts GPS samples in `currentlocations` (vehicleNumber, lat, lon, timestamp).
2. `/api/current-locations` aggregation returns latest doc per vehicle (sort + group).
3. Mobile `LiveTrackingScreen` polls adaptively; renders markers & corridor overlay.
4. User searches vehicle → `/api/corridor-stops/:key/vehicle/:vehicleNumber/next-stop` provides distance & nearest stop.

### Corridor Stops Generation
`backend/scripts/generateCorridorBusStops.js` samples the stored simplified corridor line at fixed distance intervals (default 5 km) and writes BusStop documents annotated with `corridorKey`, `sequence`, `distanceAlongCorridor`.

---
## 🧩 Key Schemas (Summaries)

**CurrentLocation**: vehicleNumber, busNumber, latitude, longitude, timestamp (compound index for latest per vehicle).

**BusStop** (extended): name, location {lat,lng}, stopId, corridorKey, sequence, distanceAlongCorridor, facilities, routes[], geo + text indexes.

**Corridor**: key, name, fullLine, simplifiedLine, cumulativeDistances, lengthMeters, endpoints.

**Route**: routeNumber, origin/destination, stops[ {stopId, sequence, distanceFromOrigin} ], fare, frequency, operatingHours.

---
## ⚙️ Backend Setup
### Prerequisites
- Node.js ≥ 16
- MongoDB Atlas (or local instance)

### Install
```bash
cd backend
npm install
```

### Environment (.env example)
```env
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster/sample?retryWrites=true&w=majority
PORT=3001
JWT_SECRET=change-me
NODE_ENV=development
```
> Replace credentials. Do **not** commit real secrets.

### Seed (optional sample data)
If a seed script exists (e.g., `utils/seedData.js`):
```bash
npm run seed
```

### Generate Corridor Stops
(Requires existing Corridor document with key `bengaluru-tumkur`)
```bash
node scripts/generateCorridorBusStops.js
```

### Run
```bash
npm run dev      # nodemon
# or
npm start        # production style
```
API base: `http://localhost:3001/api`

---
## 📱 Mobile App Setup (React Native / Expo)
### Prerequisites
- Node.js ≥ 16
- Expo CLI (`npm i -g expo`)
- Android Emulator / iOS Simulator / Expo Go

### Install & Run
```bash
cd NammaBMTCClone
npm install
# Configure API base (EXPO_PUBLIC_API_URL) if needed:
# echo 'EXPO_PUBLIC_API_URL=http://<yourLANIP>:3001' >> .env
npm start
```
Press `a` (Android) or `i` (iOS). Ensure device & dev machine share network when using a LAN IP.

### Updating API Base
The client uses:
```javascript
const BASE_URL = (process.env.EXPO_PUBLIC_API_URL || 'http://<LAN-IP>:3001') + '/api';
```
Set `EXPO_PUBLIC_API_URL` to avoid hard‑coding IPs.

---
## 🔌 Core Endpoints (Selected)
| Endpoint | Purpose |
|----------|---------|
| GET /current-locations | Latest position per vehicle |
| GET /corridor/:key | Corridor metadata & simplified polyline |
| GET /bus-stops?corridorKey=... | Corridor stops (after generation) |
| GET /corridor-stops/:key/vehicle/:vehicleNumber/next-stop | Distance to nearest corridor stop |
| GET /buses/nearby?lat&lng&radius | Nearby active buses |
| GET /health | Service health check |

> Additional CRUD endpoints: `/buses`, `/bus-stops`, `/routes`, `/driver/*`, `/auth/*` (auth scaffolding).

---
## 🚀 Real‑Time & Performance Notes
- Adaptive polling resets to 2s on success; exponential backoff to 30s on errors (429/timeouts).
- Rate limiter bypass for high‑frequency paths (`/current-locations`, `/corridor`).
- Geospatial indices: `BusStop.location`, potential future `Bus.currentLocation` 2dsphere.
- Aggregation pipeline returns O(N vehicles) not O(samples) using `$group`.

---
## 🧪 Quick Verification
```bash
curl http://localhost:3001/api/health
curl "http://localhost:3001/api/current-locations?limit=5"
```
On mobile map you should see: user marker, corridor polyline, live buses, corridor stops (if generated), and search distance overlay.

---
## 🛠️ Development Scripts
| Command | Location | Description |
|---------|----------|-------------|
| `npm run dev` | backend | Start API with nodemon |
| `npm start` | backend | Start API (prod) |
| `npm run seed` | backend | Seed sample data (if configured) |
| `node scripts/generateCorridorBusStops.js` | backend | Generate corridor stops |
| `npm start` | NammaBMTCClone | Expo dev server |

---
## 🧭 Roadmap (Potential Next)
- WebSocket delta stream for vehicles (reduce polling bandwidth)
- Path‑aware next stop (project along polyline vs nearest Euclidean)
- Predictive ETAs using speed history
- Marker clustering & off‑thread map updates
- Auth + role separation (driver / passenger)
- Offline caching & optimistic UI

---
## 🔐 Security & Hardening Checklist
- Replace demo Mongo URI + secrets
- Add auth middleware for modification endpoints
- Introduce API key / token gating for high‑frequency endpoints
- Input validation layer (Joi / Zod) before persistence
- Configure CORS to trusted origins only in production

---
## ❗ Troubleshooting
| Issue | Cause | Fix |
|-------|-------|-----|
| Repeated `Aborted` errors | Client timeout (network / long query) | Increase timeout, verify single polling loop |
| 404 vehicle next-stop | No recent CurrentLocation doc | Confirm via `/current-locations`, insert test sample |
| Corridor stops missing | Generation script not run | Execute generate script; reload app |
| Empty map markers | API base URL wrong on device | Set `EXPO_PUBLIC_API_URL` to LAN IP |

---
## 📄 License & Attribution
Educational prototype. All public transit names/logos belong to respective authorities.

---
## 🙌 Acknowledgements
Built with: Node.js, Express, MongoDB, React Native, Expo, Socket.IO, Mongoose.

---
**Happy hacking!**
