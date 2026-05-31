import { motion } from 'framer-motion';
import { Gauge } from 'lucide-react';

export default function SpeedGauge({ airspeed, groundSpeed }) {
  const maxSpeed = 300;
  const pct = Math.min(100, Math.max(0, ((airspeed || 0) / maxSpeed) * 100));
  const angle = (pct / 100) * 180 - 90; // -90 to 90 degrees

  const speedColor = airspeed > 200 ? '#f87171' : airspeed > 100 ? '#22d3ee' : airspeed > 50 ? '#fbbf24' : '#f87171';

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <Gauge className="w-3.5 h-3.5 text-primary" />
        <h2 className="text-xs font-mono font-semibold tracking-wider text-primary uppercase">
          Airspeed
        </h2>
      </div>

      <div className="flex justify-center mb-2">
        <svg width="120" height="70" viewBox="0 0 120 70" className="overflow-visible">
          {/* Background arc */}
          <path d="M 10 65 A 50 50 0 0 1 110 65" fill="none" stroke="hsl(222,30%,18%)" strokeWidth="6" strokeLinecap="round" />
          {/* Progress arc */}
          <motion.path
            d="M 10 65 A 50 50 0 0 1 110 65"
            fill="none"
            stroke={speedColor}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray="157"
            animate={{ strokeDashoffset: 157 - (pct / 100) * 157 }}
            transition={{ type: 'spring', stiffness: 80, damping: 15 }}
            style={{ filter: `drop-shadow(0 0 6px ${speedColor}40)` }}
          />
          {/* Needle */}
          <motion.line
            x1="60" y1="65" x2="60" y2="25"
            stroke={speedColor}
            strokeWidth="2"
            strokeLinecap="round"
            style={{ transformOrigin: '60px 65px' }}
            animate={{ rotate: angle }}
            transition={{ type: 'spring', stiffness: 60, damping: 12 }}
          />
          <circle cx="60" cy="65" r="4" fill={speedColor} />
        </svg>
      </div>

      <div className="text-center space-y-1">
        <div>
          <span className="text-xl font-mono font-bold tabular-nums" style={{ color: speedColor }}>
            {airspeed || '--'}
          </span>
          <span className="text-xs font-mono text-muted-foreground ml-1">kts</span>
        </div>
        {groundSpeed && (
          <div className="text-[10px] font-mono text-muted-foreground">
            GS: {Math.round(groundSpeed)} kts
          </div>
        )}
      </div>
    </div>
  );
}