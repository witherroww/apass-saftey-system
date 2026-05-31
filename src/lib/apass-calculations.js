// APASS Core Calculation Engine
// Aircraft Emergency Recovery calculations

const EARTH_RADIUS_NM = 3440.065; // nautical miles
const FT_PER_NM = 6076.12;
const KNOTS_TO_FPM = 101.269; // 1 knot = 101.269 ft/min (approximate for ground)

export function calculateTimeToImpact(altitude, verticalSpeed) {
  if (!altitude || !verticalSpeed || verticalSpeed >= 0) return null;
  const seconds = Math.abs(altitude / verticalSpeed) * 60;
  return Math.max(0, seconds);
}

export function calculateImpactLocation(lat, lon, heading, airspeed, timeToImpactSeconds, windSpeed = 0, windDirection = 0) {
  if (!lat || !lon || !heading || !airspeed || !timeToImpactSeconds) return null;
  
  // Convert wind to components (wind direction is where wind comes FROM)
  const windRad = (windDirection * Math.PI) / 180;
  const windNorth = -windSpeed * Math.cos(windRad); // component going north
  const windEast = -windSpeed * Math.sin(windRad);
  
  // Aircraft heading components
  const headingRad = (heading * Math.PI) / 180;
  const acNorth = airspeed * Math.cos(headingRad);
  const acEast = airspeed * Math.sin(headingRad);
  
  // Ground speed components (knots)
  const gsNorth = acNorth + windNorth;
  const gsEast = acEast + windEast;
  
  // Distance traveled in nautical miles
  const timeHours = timeToImpactSeconds / 3600;
  const distNorth = gsNorth * timeHours;
  const distEast = gsEast * timeHours;
  
  // Convert to degrees
  const dLat = distNorth / 60;
  const dLon = distEast / (60 * Math.cos((lat * Math.PI) / 180));
  
  return {
    lat: lat + dLat,
    lon: lon + dLon,
    groundSpeed: Math.sqrt(gsNorth * gsNorth + gsEast * gsEast)
  };
}

export function calculateReachableRadius(altitude, glideRatio) {
  if (!altitude || !glideRatio) return 0;
  const distanceFt = altitude * glideRatio;
  return distanceFt / FT_PER_NM; // nautical miles
}

export function calculateRecommendedHeading(lat, lon, windDirection, windSpeed, currentHeading) {
  // Simple recommendation: turn into the wind for best glide performance
  // Wind direction is where wind comes FROM, so heading INTO wind = wind direction
  if (windSpeed && windSpeed > 5 && windDirection !== undefined) {
    return windDirection; // Fly into the wind
  }
  return currentHeading || 0;
}

export function calculateConfidence(telemetry) {
  const fields = [
    { key: 'altitude', weight: 20 },
    { key: 'airspeed', weight: 15 },
    { key: 'heading', weight: 10 },
    { key: 'verticalSpeed', weight: 20 },
    { key: 'latitude', weight: 10 },
    { key: 'longitude', weight: 10 },
    { key: 'windSpeed', weight: 5 },
    { key: 'windDirection', weight: 5 },
    { key: 'glideRatio', weight: 5 },
  ];

  let totalWeight = 0;
  let achievedWeight = 0;
  const missing = [];

  fields.forEach(({ key, weight }) => {
    totalWeight += weight;
    const val = telemetry[key];
    if (val !== null && val !== undefined && val !== '' && !isNaN(val)) {
      achievedWeight += weight;
    } else {
      missing.push(key);
    }
  });

  const percentage = Math.round((achievedWeight / totalWeight) * 100);
  
  let level, explanation;
  if (percentage >= 80) {
    level = 'high';
    explanation = 'All critical telemetry available. Predictions are reliable.';
  } else if (percentage >= 50) {
    level = 'medium';
    explanation = `Missing: ${missing.join(', ')}. Predictions have moderate uncertainty.`;
  } else {
    level = 'low';
    explanation = `Limited telemetry. Missing: ${missing.join(', ')}. Predictions are approximate.`;
  }

  return { percentage, level, explanation, missing };
}

export function calculateHazardLevel(altitude, verticalSpeed, airspeed, timeToImpact) {
  if (!altitude || altitude <= 0) return 'red';
  if (timeToImpact !== null && timeToImpact < 60) return 'red';
  if (timeToImpact !== null && timeToImpact < 180) return 'yellow';
  if (verticalSpeed && verticalSpeed < -2000) return 'yellow';
  if (airspeed && airspeed < 60) return 'yellow';
  return 'green';
}

export function generateFlightPath(lat, lon, heading, airspeed, verticalSpeed, altitude, windSpeed, windDirection, steps = 20) {
  if (!lat || !lon || !heading || !airspeed || !verticalSpeed || verticalSpeed >= 0 || !altitude) return [];
  
  const totalTime = calculateTimeToImpact(altitude, verticalSpeed);
  if (!totalTime) return [];
  
  const path = [];
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * totalTime;
    const currentAlt = Math.max(0, altitude + (verticalSpeed * t / 60));
    const point = calculateImpactLocation(lat, lon, heading, airspeed, t, windSpeed, windDirection);
    if (point) {
      path.push({ lat: point.lat, lon: point.lon, altitude: currentAlt, time: t });
    }
  }
  return path;
}

// Emergency landing candidates (simulated nearby airports)
export function getEmergencyLandingCandidates(lat, lon, radiusNm) {
  if (!lat || !lon || !radiusNm) return [];
  
  // Simulated airports around the area
  const candidates = [
    { name: 'Regional Airport Alpha', lat: lat + 0.08, lon: lon - 0.06, runway: 5000, type: 'regional' },
    { name: 'Municipal Field Bravo', lat: lat - 0.05, lon: lon + 0.09, runway: 3500, type: 'municipal' },
    { name: 'Highway Strip Charlie', lat: lat + 0.03, lon: lon + 0.04, runway: 2000, type: 'highway' },
    { name: 'Private Strip Delta', lat: lat - 0.07, lon: lon - 0.03, runway: 2800, type: 'private' },
    { name: 'Military Base Echo', lat: lat + 0.12, lon: lon + 0.02, runway: 8000, type: 'military' },
  ];
  
  // Filter by reachable radius
  return candidates.filter(c => {
    const dist = Math.sqrt(Math.pow((c.lat - lat) * 60, 2) + Math.pow((c.lon - lon) * 60 * Math.cos(lat * Math.PI / 180), 2));
    c.distance = Math.round(dist * 10) / 10;
    return dist <= radiusNm;
  }).sort((a, b) => a.distance - b.distance);
}

export function formatTime(seconds) {
  if (!seconds || seconds <= 0) return '--:--';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}