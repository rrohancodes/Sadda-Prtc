// Corridor ingestion script
// Usage: node utils/ingestCorridor.js <path_to_json>

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const turf = require('@turf/turf');
const polyline = require('@mapbox/polyline');
const Corridor = require('../models/Corridor');

const KEY = 'bengaluru-tumkur';
const NAME = 'Bengaluru ⇄ Tumkur Corridor';

function parseFlags(rawArgs) {
  const flags = { noSimplify: false, tolerance: 0.0005 };
  rawArgs.forEach(a => {
    if (a === '--no-simplify') flags.noSimplify = true;
    else if (a.startsWith('--tolerance=')) {
      const v = parseFloat(a.split('=')[1]);
      if (!Number.isNaN(v) && v > 0) flags.tolerance = v;
    }
  });
  return flags;
}

function extractCoordinates(raw) {
  // Returns array of [lng, lat]
  if (raw && Array.isArray(raw.route)) {
    return raw.route
      .filter(p => p && typeof p.lat === 'number' && typeof p.lng === 'number')
      .map(p => [p.lng, p.lat]);
  }
  if (raw && raw.type === 'FeatureCollection' && Array.isArray(raw.features)) {
    let coords = [];
    raw.features.forEach(f => {
      if (!f || !f.geometry) return;
      const g = f.geometry;
      if (g.type === 'LineString') coords = coords.concat(g.coordinates);
      else if (g.type === 'MultiLineString') g.coordinates.forEach(line => { coords = coords.concat(line); });
    });
    return coords;
  }
  if (raw && raw.type === 'LineString' && Array.isArray(raw.coordinates)) return raw.coordinates;
  if (raw && raw.type === 'MultiLineString' && Array.isArray(raw.coordinates)) return raw.coordinates.flat();
  throw new Error('Unsupported file format: provide {route:[{lat,lng}]} or GeoJSON LineString/FeatureCollection');
}

async function run() {
  try {
    const args = process.argv.slice(2);
    const fileArg = args.find(a => !a.startsWith('--'));
    const flags = parseFlags(args.filter(a => a.startsWith('--')));

    if (!fileArg) {
      console.error('Usage: node utils/ingestCorridor.js <path_to_file> [--no-simplify] [--tolerance=0.0005]');
      process.exit(1);
    }
    const filePath = path.resolve(process.cwd(), fileArg);
    if (!fs.existsSync(filePath)) {
      console.error('File not found:', filePath);
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const raw = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    let fullCoords = extractCoordinates(raw);

    // Basic validation & cleanup (remove obviously bad points)
    fullCoords = fullCoords.filter(c => Array.isArray(c) && c.length === 2 &&
      typeof c[0] === 'number' && typeof c[1] === 'number' && !Number.isNaN(c[0]) && !Number.isNaN(c[1]));

    if (fullCoords.length < 2) {
      throw new Error('Not enough valid coordinates after parsing.');
    }

    // Ensure they are in [lng, lat] (GeoJSON). If numbers look inverted (lat outside [-90,90]) assume swapped.
    // Quick heuristic: count how many points have |lat| > 90; if many, swap.
    const suspect = fullCoords.filter((c) => Math.abs(c[1]) > 90).length;
    if (suspect > fullCoords.length * 0.8) {
      fullCoords = fullCoords.map(([a, b]) => [b, a]);
    }

    const fullLine = turf.lineString(fullCoords);
    const lengthKm = turf.length(fullLine, { units: 'kilometers' });

    let simplifiedLineGeom;
    if (flags.noSimplify) {
      simplifiedLineGeom = fullLine.geometry; // keep identical
    } else {
      const simplified = turf.simplify(fullLine, { tolerance: flags.tolerance, highQuality: false });
      simplifiedLineGeom = simplified.geometry;
    }

    // Cumulative distance meters
    const cumulative = [0];
    for (let i = 1; i < fullCoords.length; i++) {
      const d = turf.distance(turf.point(fullCoords[i - 1]), turf.point(fullCoords[i]), { units: 'meters' });
      cumulative.push(Math.round(cumulative[i - 1] + d));
    }

    // Encode the geometry we will actually draw (use full if noSimplify requested)
    const encodeCoords = (flags.noSimplify ? fullCoords : simplifiedLineGeom.coordinates)
      .map(([lng, lat]) => [lat, lng]);
    const encoded = polyline.encode(encodeCoords);

    const doc = await Corridor.findOneAndUpdate(
      { key: KEY },
      {
        key: KEY,
        name: NAME,
        fullLine: { type: 'LineString', coordinates: fullCoords },
        simplifiedLine: { type: 'LineString', coordinates: simplifiedLineGeom.coordinates },
        encodedPolyline: encoded,
        cumulativeDistances: cumulative,
        lengthMeters: Math.round(lengthKm * 1000),
        endpoints: {
          start: { type: 'Point', coordinates: fullCoords[0] },
            end: { type: 'Point', coordinates: fullCoords[fullCoords.length - 1] }
        },
        meta: {
          simplifiedPointCount: simplifiedLineGeom.coordinates.length,
          sourcePoints: fullCoords.length,
          sourceFile: path.basename(filePath),
          noSimplify: flags.noSimplify,
          tolerance: flags.tolerance
        }
      },
      { upsert: true, new: true }
    );

    console.log('Corridor stored:', doc.key,
      'lengthMeters:', doc.lengthMeters,
      'sourcePoints:', doc.meta.sourcePoints,
      'encodedPoints:', encodeCoords.length,
      'noSimplify:', flags.noSimplify);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Ingestion failed:', err.message);
    process.exit(1);
  }
}

run();
