import { useEffect, useState } from 'react';
import { Radar, RefreshCw, AlertCircle } from 'lucide-react';

// airplanes.live - free public API for live ADS-B traffic
const AIRPLANES_URL = 'https://api.airplanes.live/v2';;

export async function fetchADSBTraffic(lat, lon, radiusNm = 100) {
  const url = `https://api.airplanes.live/v2/point/${lat}/${lon}/${radiusNm}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error('Airplanes.live API error');

  const data = await res.json();
  

  const mapped = (data.ac || [])
    .map(a => ({
      icao24: a.hex,
      callsign: (a.flight || a.r || a.hex || "UNKNOWN").trim(),
      lon: a.lon,
      lat: a.lat,
      altitude: typeof a.alt_baro === "number" ? a.alt_baro : null,
      velocity: typeof a.gs === "number" ? Math.round(a.gs) : null,
      heading: typeof a.track === "number" ? Math.round(a.track) : null,
      verticalRate: typeof a.baro_rate === "number" ? a.baro_rate : null,
      onGround: a.alt_baro === "ground",
    }))
    .filter(a => typeof a.lat === "number" && typeof a.lon === "number" && !a.onGround);

  
  return mapped;
}

export default function ADSBTraffic({ latitude, longitude, onTrafficUpdate }) {
  const [traffic, setTraffic] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastFetch, setLastFetch] = useState(null);

  const load = async () => {
    if (!latitude || !longitude) return;
    setLoading(true);
    setError(null);
    const data = await fetchADSBTraffic(latitude, longitude).catch(e => {

      console.error("Traffic fetch failed:", e);

      setError('Traffic data unavailable');

      return [];

    });
    setTraffic(data.slice(0, 20));
    onTrafficUpdate?.(data.slice(0, 20));
    setLastFetch(new Date().toUTCString().slice(17, 25));
    setLoading(false);
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 5 * 60 * 1000); // refresh every 30s
    return () => clearInterval(interval);
  }, [latitude, longitude]);

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Radar className="w-3.5 h-3.5 text-primary" />
          <h2 className="text-xs font-mono font-semibold tracking-wider text-primary uppercase">
            ADS-B Traffic
          </h2>
          <span className="text-[9px] font-mono text-emerald-400 border border-emerald-400/30 rounded px-1">LIVE</span>
        </div>
        <button onClick={load} disabled={loading} className="text-muted-foreground hover:text-primary transition-colors">
          <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {lastFetch && (
        <p className="text-[9px] font-mono text-muted-foreground mb-2">Updated {lastFetch} UTC · {traffic.length} contacts</p>
      )}

      {error && (
        <div className="flex items-center gap-1.5 text-[10px] font-mono text-amber-400 mb-2">
          <AlertCircle className="w-3 h-3" /> {error}
        </div>
      )}

      <div className="space-y-1 max-h-40 overflow-y-auto">
        {traffic.slice(0, 8).map((t, i) => (
          <div key={t.icao24} className="flex items-center justify-between bg-background/50 rounded px-2 py-1 border border-border/50">
            <span className="text-[10px] font-mono text-foreground w-16 truncate">{t.callsign}</span>
            <span className="text-[9px] font-mono text-muted-foreground">{t.altitude ? `${t.altitude} ft` : '--'}</span>
            <span className="text-[9px] font-mono text-muted-foreground">{t.velocity ? `${t.velocity} kt` : '--'}</span>
            <span className="text-[9px] font-mono text-primary">{t.heading ? `${Math.round(t.heading)}°` : '--'}</span>
          </div>
        ))}
        {traffic.length === 0 && !loading && !error && (
          <p className="text-[10px] font-mono text-muted-foreground">No traffic in range.</p>
        )}
      </div>
    </div>
  );
}