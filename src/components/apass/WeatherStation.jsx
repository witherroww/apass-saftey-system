import { useEffect, useState } from 'react';
import { Cloud, Wind, Eye, AlertCircle, RefreshCw } from 'lucide-react';
import { fetchNearbyMETARs } from '@/lib/weather-data';

const flightCatColors = {
  VFR: 'text-emerald-400',
  MVFR: 'text-blue-400',
  IFR: 'text-red-400',
  LIFR: 'text-purple-400',
};

export default function WeatherStation({ latitude, longitude }) {
  const [metars, setMetars] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastFetch, setLastFetch] = useState(null);

  const load = async () => {
    if (!latitude || !longitude) return;
    setLoading(true);
    setError(null);
    const data = await fetchNearbyMETARs(latitude, longitude).catch(e => {
      setError('Unable to fetch live weather');
      return [];
    });
    setMetars(data.slice(0, 4));
    setLastFetch(new Date().toUTCString().slice(17, 25));
    setLoading(false);
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 5 * 60 * 1000); // refresh every 5 min
    return () => clearInterval(interval);
  }, [latitude, longitude]);

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Cloud className="w-3.5 h-3.5 text-primary" />
          <h2 className="text-xs font-mono font-semibold tracking-wider text-primary uppercase">
            Live METAR
          </h2>
        </div>
        <button onClick={load} disabled={loading} className="text-muted-foreground hover:text-primary transition-colors">
          <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {lastFetch && (
        <p className="text-[9px] font-mono text-muted-foreground mb-2">Updated {lastFetch} UTC</p>
      )}

      {error && (
        <div className="flex items-center gap-1.5 text-[10px] font-mono text-amber-400 mb-2">
          <AlertCircle className="w-3 h-3" /> {error}
        </div>
      )}

      {metars.length === 0 && !loading && !error && (
        <p className="text-[10px] font-mono text-muted-foreground">No METAR data in range.</p>
      )}

      <div className="space-y-2">
        {metars.map((m, i) => (
          <div key={i} className="bg-background/50 rounded-md p-2.5 border border-border/50">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-mono font-bold text-foreground">{m.icao}</span>
              <span className={`text-[9px] font-mono font-bold ${flightCatColors[m.flightCategory] || 'text-muted-foreground'}`}>
                {m.flightCategory}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1">
              <div className="flex items-center gap-1 text-[9px] font-mono text-muted-foreground">
                <Wind className="w-2.5 h-2.5" />
                {m.windDir}°/{m.windSpeed}{m.windGust ? `G${m.windGust}` : ''} kt
              </div>
              <div className="flex items-center gap-1 text-[9px] font-mono text-muted-foreground">
                <Eye className="w-2.5 h-2.5" />
                {m.visibility} SM
              </div>
              <div className="text-[9px] font-mono text-muted-foreground">
                {m.temp !== undefined ? `${m.temp}°C` : '--'}
              </div>
            </div>
            {m.ceiling && (
              <p className="text-[9px] font-mono text-muted-foreground mt-0.5">
                Ceiling: {m.ceiling} ft
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}