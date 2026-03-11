
// Compute progress of a point along a corridor LineString
// Returns { meters, percent }
const turf = require('@turf/turf');
const Corridor = require('../models/Corridor');

// Simple in‑memory cache
const corridorCache = new Map();

async function getCorridor(key) {
  if (corridorCache.has(key)) return corridorCache.get(key);
  const c = await Corridor.findOne({ key });
  if (c) corridorCache.set(key, c);
  return c;
}

function computeProgressOnLine(point, lineCoords, cumulativeDistances) {
  // Iterate segments to find closest
  let closest = { dist: Infinity, meters: 0 };
  for (let i = 0; i < lineCoords.length - 1; i++) {
    const a = lineCoords[i];
    const b = lineCoords[i + 1];
    const seg = turf.lineString([a, b]);
    const d = turf.pointToLineDistance(point, seg, { units: 'meters' });
    if (d < closest.dist) {
      // Project fraction along segment using turf.length between a->point and a->b via nearestPointOnLine
      const np = turf.nearestPointOnLine(seg, point, { units: 'meters' });
      const frac = np.properties.location; // 0..1 along segment length
      const segLen = turf.length(seg, { units: 'meters' });
      const meters = cumulativeDistances[i] + segLen * frac;
      closest = { dist: d, meters };
    }
  }
  return closest.meters;
}

async function computeProgress(lng, lat, corridorKey, direction = 'forward') {
  const corridor = await getCorridor(corridorKey);
  if (!corridor) return null;
  const point = turf.point([lng, lat]);
  const coords = corridor.fullLine.coordinates; // [lng,lat]
  const meters = computeProgressOnLine(point, coords, corridor.cumulativeDistances);
  const length = corridor.lengthMeters || corridor.cumulativeDistances[corridor.cumulativeDistances.length - 1];
  let progressMeters = Math.min(Math.max(meters, 0), length);
  if (direction === 'reverse') {
    progressMeters = length - progressMeters;
  }
  const percent = length ? +(progressMeters / length * 100).toFixed(2) : 0;
  return { meters: Math.round(progressMeters), percent, length };
}

function computeETA(progressMeters, lengthMeters, speedKmph) {
  const DEFAULT_SPEED_KMPH = 45; // fallback average
  const effectiveSpeed = (speedKmph && speedKmph > 5) ? speedKmph : DEFAULT_SPEED_KMPH; // ignore unrealistically low readings
  const remainingMeters = Math.max(lengthMeters - progressMeters, 0);
  const speedMps = (effectiveSpeed * 1000) / 3600;
  const etaSeconds = speedMps > 0 ? Math.round(remainingMeters / speedMps) : null;
  if (etaSeconds == null) return { etaSeconds: null, arrivalTime: null };
  return { etaSeconds, arrivalTime: new Date(Date.now() + etaSeconds * 1000) };
}

module.exports = { computeProgress, computeETA };
