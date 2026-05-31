import { Shield, Radio, Clock, MapPin } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function TopBar({ hazardLevel, locationLabel }) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const hazardColors = {
    green: 'text-emerald-400',
    yellow: 'text-amber-400',
    red: 'text-red-400',
  };

  const hazardBg = {
    green: 'bg-emerald-400/10 border-emerald-400/30',
    yellow: 'bg-amber-400/10 border-amber-400/30',
    red: 'bg-red-400/10 border-red-400/30 animate-pulse',
  };

  return (
    <header className="h-14 border-b border-border bg-card/80 backdrop-blur-sm flex items-center justify-between px-6 relative scanlines">
      <div className="flex items-center gap-3">
        <div className="relative">
          <Shield className="w-6 h-6 text-primary" />
          <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-primary animate-pulse" />
        </div>
        <div>
          <h1 className="text-xl font-bold font-sans tracking-wider text-foreground">
            APASS
          </h1>
          <p className="text-[14px] text-muted-foreground font-sans tracking-widest uppercase">
            Adaptive Predictive Aerospace Safety System 
          </p>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className={`flex items-center gap-2 px-3 py-1 rounded border ${hazardBg[hazardLevel]}`}>
          <div className={`w-2 h-2 rounded-full ${hazardLevel === 'green' ? 'bg-emerald-400' : hazardLevel === 'yellow' ? 'bg-amber-400' : 'bg-red-400'}`} />
          <span className={`text-reg font-mono font-semibold uppercase tracking-wider ${hazardColors[hazardLevel]}`}>
            {hazardLevel === 'green' ? 'NOMINAL' : hazardLevel === 'yellow' ? 'CAUTION' : 'CRITICAL'}
          </span>
        </div>

        {locationLabel && (
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <MapPin className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-sans truncate max-w-40">{locationLabel.split(',')[0]}</span>
          </div>
        )}

        <div className="flex items-center gap-2 text-muted-foreground">
          <Radio className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-xs font-sans">LINK OK</span>
        </div>

        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="w-3.5 h-3.5" />
          <span className="text-xs font-mono tabular-nums">
            {time.toUTCString().slice(17, 25)} UTC
          </span>
        </div>
      </div>
    </header>
  );
}