// Monte Carlo trajectory simulation for APASS
// Runs N simulations with randomized uncertainty to produce probability cone

function randomGaussian(mean, stddev) {
  // Box-Muller transform
  const u1 = Math.random();
  const u2 = Math.random();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return mean + z * stddev;
}

function calcPoint(lat, lon, heading, airspeed, timeToImpactSec, windSpeed, windDirection) {
  const windRad = (windDirection * Math.PI) / 180;
  const windNorth = -windSpeed * Math.cos(windRad);
  const windEast = -windSpeed * Math.sin(windRad);
  const headingRad = (heading * Math.PI) / 180;
  const acNorth = airspeed * Math.cos(headingRad);
  const acEast = airspeed * Math.sin(headingRad);
  const gsNorth = acNorth + windNorth;
  const gsEast = acEast + windEast;
  const timeHours = timeToImpactSec / 3600;
  const distNorth = gsNorth * timeHours;
  const distEast = gsEast * timeHours;
  const dLat = distNorth / 60;
  const dLon = distEast / (60 * Math.cos((lat * Math.PI) / 180));
  return { lat: lat + dLat, lon: lon + dLon };
}

export function runMonteCarlo(telemetry, timeToImpact, runs = 300) {
  if (!timeToImpact || !telemetry.latitude || !telemetry.longitude) return [];

  const { latitude, longitude, heading, airspeed, verticalSpeed, windSpeed, windDirection, altitude } = telemetry;

  const points = [];

  for (let i = 0; i < runs; i++) {
    // Inject uncertainty
    const perturbedAirspeed = randomGaussian(airspeed, airspeed * 0.05);
    const perturbedHeading = randomGaussian(heading, 5);
    const perturbedVS = randomGaussian(verticalSpeed, Math.abs(verticalSpeed) * 0.1);
    const perturbedWind = randomGaussian(windSpeed || 0, 3);
    const perturbedWindDir = randomGaussian(windDirection || 0, 15);

    // Perturbed time to impact
    const perturbedTTI = perturbedVS < 0 ? Math.abs(altitude / perturbedVS) * 60 : timeToImpact;

    const pt = calcPoint(
      latitude, longitude,
      perturbedHeading, perturbedAirspeed,
      perturbedTTI,
      perturbedWind, perturbedWindDir
    );
    points.push(pt);
  }

  return points;
}

// Returns convex hull-like percentile rings [50th, 90th]
export function getPercentileRings(points) {
  if (!points.length) return { p50: [], p90: [] };

  const centLat = points.reduce((s, p) => s + p.lat, 0) / points.length;
  const centLon = points.reduce((s, p) => s + p.lon, 0) / points.length;

  // Sort by distance from centroid
  const withDist = points.map(p => ({
    ...p,
    dist: Math.sqrt((p.lat - centLat) ** 2 + (p.lon - centLon) ** 2),
  })).sort((a, b) => a.dist - b.dist);

  const p50Count = Math.floor(points.length * 0.5);
  const p90Count = Math.floor(points.length * 0.9);

  // Build rings as circle approximations around centroid with radius = percentile dist
  const r50 = withDist[p50Count - 1]?.dist || 0;
  const r90 = withDist[p90Count - 1]?.dist || 0;

  function makeRing(radius, steps = 32) {
    return Array.from({ length: steps }, (_, i) => {
      const angle = (i / steps) * 2 * Math.PI;
      return [centLat + radius * Math.sin(angle), centLon + radius * Math.cos(angle)];
    });
  }

  return {
    p50: makeRing(r50),
    p90: makeRing(r90),
    centroid: [centLat, centLon],
    allPoints: points,
  };
}