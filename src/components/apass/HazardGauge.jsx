import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

export default function HazardGauge({ hazardLevel, timeToImpact }) {
  const config = {
    green: { angle: -60, color: '#34d399', label: 'SAFE', glow: '0 0 30px rgba(52,211,153,0.3)' },
    yellow: { angle: 0, color: '#fbbf24', label: 'CAUTION', glow: '0 0 30px rgba(251,191,36,0.3)' },
    red: { angle: 60, color: '#f87171', label: 'DANGER', glow: '0 0 30px rgba(248,113,113,0.4)' },
  };

  const c = config[hazardLevel];

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle className="w-3.5 h-3.5 text-primary" />
        <h2 className="text-xs font-mono font-semibold tracking-wider text-primary uppercase">
          Hazard Level
        </h2>
      </div>

      <div className="flex justify-center">
        <svg width="160" height="100" viewBox="0 0 160 100" className="overflow-visible">
          {/* Background arc */}
          <path
            d="M 20 90 A 60 60 0 0 1 140 90"
            fill="none"
            stroke="hsl(222, 30%, 18%)"
            strokeWidth="8"
            strokeLinecap="round"
          />
          {/* Green section */}
          <path
            d="M 20 90 A 60 60 0 0 1 55 35"
            fill="none"
            stroke="#34d399"
            strokeWidth="8"
            strokeLinecap="round"
            opacity="0.3"
          />
          {/* Yellow section */}
          <path
            d="M 55 35 A 60 60 0 0 1 105 35"
            fill="none"
            stroke="#fbbf24"
            strokeWidth="8"
            strokeLinecap="round"
            opacity="0.3"
          />
          {/* Red section */}
          <path
            d="M 105 35 A 60 60 0 0 1 140 90"
            fill="none"
            stroke="#f87171"
            strokeWidth="8"
            strokeLinecap="round"
            opacity="0.3"
          />

          {/* Needle */}
          <motion.line
            x1="80"
            y1="90"
            x2="80"
            y2="40"
            stroke={c.color}
            strokeWidth="2.5"
            strokeLinecap="round"
            style={{
              transformOrigin: '80px 90px',
              filter: `drop-shadow(${c.glow})`,
            }}
            animate={{ rotate: c.angle }}
            transition={{ type: 'spring', stiffness: 60, damping: 12 }}
          />

          {/* Center dot */}
          <circle cx="80" cy="90" r="5" fill={c.color} style={{ filter: `drop-shadow(${c.glow})` }} />
        </svg>
      </div>

      <div className="text-center mt-2">
        <motion.span
          key={hazardLevel}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-sm font-mono font-bold tracking-widest"
          style={{ color: c.color }}
        >
          {c.label}
        </motion.span>
      </div>
    </div>
  );
}