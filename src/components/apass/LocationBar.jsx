import { useState, useRef } from 'react';
import { MapPin, Crosshair, Search, Loader2, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function LocationBar({ onLocationSet }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef(null);

  const search = (q) => {
    setQuery(q);
    clearTimeout(debounceRef.current);
    if (!q.trim()) { setResults([]); setOpen(false); return; }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=5`);
      const data = await res.json();
      setResults(data);
      setOpen(true);
      setLoading(false);
    }, 400);
  };

  const select = (place) => {
    onLocationSet(parseFloat(place.lat), parseFloat(place.lon), place.display_name);
    setQuery(place.display_name.split(',')[0]);
    setOpen(false);
    setResults([]);
  };

  const useMyLocation = () => {
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        onLocationSet(latitude, longitude, 'Your Location');
        setQuery('Your Location');
        setGeoLoading(false);
      },
      () => setGeoLoading(false),
      { enableHighAccuracy: true }
    );
  };

  return (
    <div className="relative flex items-center gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
        <Input
          value={query}
          onChange={e => search(e.target.value)}
          placeholder="Search location…"
          className="h-8 pl-8 pr-8 text-xs font-sans bg-background border-border focus:border-primary text-foreground placeholder:text-muted-foreground"
        />
        {query && (
          <button onClick={() => { setQuery(''); setResults([]); setOpen(false); }} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
            <X className="w-3 h-3" />
          </button>
        )}
        {loading && <Loader2 className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 animate-spin text-primary" />}

        {open && results.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-md shadow-xl z-[9999] overflow-hidden">
            {results.map((r, i) => (
              <button
                key={i}
                onClick={() => select(r)}
                className="w-full text-left px-3 py-2 text-xs font-sans text-foreground hover:bg-secondary transition-colors border-b border-border/50 last:border-0 flex items-start gap-2"
              >
                <MapPin className="w-3 h-3 text-primary mt-0.5 shrink-0" />
                <span className="truncate">{r.display_name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={useMyLocation}
        disabled={geoLoading}
        className="h-8 px-2.5 border-border hover:border-primary text-muted-foreground hover:text-primary shrink-0"
        title="Use my location"
      >
        {geoLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Crosshair className="w-3.5 h-3.5" />}
      </Button>
    </div>
  );
}