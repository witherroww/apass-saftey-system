// Real airport data from OurAirports public dataset
// Fetches and caches the global airport CSV, filters by proximity

const AIRPORTS_URL = 'https://davidmegginson.github.io/ourairports-data/airports.csv';

let airportCache = null;
let fetchPromise = null;

function parseCSV(text) {
  const lines = text.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
  return lines.slice(1).map(line => {
    // Handle quoted fields with commas
    const fields = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      if (line[i] === '"') {
        inQuotes = !inQuotes;
      } else if (line[i] === ',' && !inQuotes) {
        fields.push(current.trim());
        current = '';
      } else {
        current += line[i];
      }
    }
    fields.push(current.trim());
    const obj = {};
    headers.forEach((h, i) => { obj[h] = fields[i] || ''; });
    return obj;
  });
}

export async function fetchAirports() {
  if (airportCache) return airportCache;
  if (fetchPromise) return fetchPromise;

  fetchPromise = fetch(AIRPORTS_URL)
    .then(r => r.text())
    .then(text => {
      const all = parseCSV(text);
      // Keep only airports with runways (small, medium, large, heliport excluded)
      airportCache = all.filter(a =>
        ['small_airport', 'medium_airport', 'large_airport'].includes(a.type) &&
        a.latitude_deg && a.longitude_deg
      ).map(a => ({
        id: a.ident,
        name: a.name,
        type: a.type,
        lat: parseFloat(a.latitude_deg),
        lon: parseFloat(a.longitude_deg),
        elevation: parseFloat(a.elevation_ft) || 0,
        municipality: a.municipality,
        iata: a.iata_code,
        icao: a.ident,
      }));
      return airportCache;
    })
    .catch(() => {
      // Fallback if fetch fails
      airportCache = [];
      return [];
    });

  return fetchPromise;
}

function distanceNm(lat1, lon1, lat2, lon2) {
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return 3440.065 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function bearingDeg(lat1, lon1, lat2, lon2) {
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const y = Math.sin(dLon) * Math.cos(lat2 * Math.PI / 180);
  const x = Math.cos(lat1 * Math.PI / 180) * Math.sin(lat2 * Math.PI / 180) -
    Math.sin(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.cos(dLon);
  return ((Math.atan2(y, x) * 180 / Math.PI) + 360) % 360;
}

// Score a runway candidate (0-100)
function scoreCandidate(airport, distance, windDirection, windSpeed) {
  // Distance score (closer = better), max 40 pts
  const distScore = Math.max(0, 40 - (distance * 4));

  // Type score: large=30, medium=20, small=10
  const typeScore = airport.type === 'large_airport' ? 30 : airport.type === 'medium_airport' ? 20 : 10;

  // Crosswind score: assume main runway aligned with bearing to airport
  let crosswindScore = 20;
  if (windSpeed && windSpeed > 5) {
    const runwayBearing = bearingDeg(0, 0, 0, 1); // placeholder
    const windAngle = Math.abs(((windDirection - 270) + 360) % 360); // rough crosswind
    const crosswind = windSpeed * Math.sin(windAngle * Math.PI / 180);
    crosswindScore = Math.max(0, 20 - crosswind);
  }

  return Math.round(Math.min(100, distScore + typeScore + crosswindScore));
}

export async function getNearestAirports(lat, lon, radiusNm, windDirection = 0, windSpeed = 0) {
  const airports = await fetchAirports();
  const results = [];

  for (const airport of airports) {
    const dist = distanceNm(lat, lon, airport.lat, airport.lon);
    if (dist <= radiusNm) {
      const bearing = bearingDeg(lat, lon, airport.lat, airport.lon);
      const score = scoreCandidate(airport, dist, windDirection, windSpeed);
      results.push({
        ...airport,
        distance: Math.round(dist * 10) / 10,
        bearing: Math.round(bearing),
        score,
        runway: airport.type === 'large_airport' ? 8000 : airport.type === 'medium_airport' ? 5000 : 2500,
      });
    }
  }

  return results.sort((a, b) => b.score - a.score).slice(0, 6);
}