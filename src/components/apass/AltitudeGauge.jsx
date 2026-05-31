import { motion } from 'framer-motion';
import { Mountain } from 'lucide-react';

export default function AltitudeGauge({ altitude, verticalSpeed }) {
  const maxAlt = 40000;
  const pct = Math.min(100, Math.max(0, ((altitude || 0) / maxAlt) * 100));
  const vsNormalized = Math.min(1, Math.max(-1, (verticalSpeed || 0) / 3000));

  const barColor = altitude > 5000 ? '#22d3ee' : altitude > 1000 ? '#fbbf24' : '#f87171';

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <Mountain className="w-3.5 h-3.5 text-primary" />
        <h2 className="text-xs font-mono font-semibold tracking-wider text-primary uppercase">
          Altitude
        </h2>
      </div>

      <div className="flex items-end gap-4">
        {/* Vertical bar gauge */}
        <div className="relative w-8 h-32 bg-background rounded-sm border border-border overflow-hidden">
          {/* Scale marks */}
          {[0, 25, 50, 75, 100].map(mark => (
            <div
              key={mark}
              className="absolute left-0 right-0 border-t border-border/30"
              style={{ bottom: `${mark}%` }}
            />
          ))}
          <motion.div
            className="absolute bottom-0 left-0 right-0 rounded-t-sm"
            style={{ backgroundColor: barColor }}
            animate={{ height: `${pct}%` }}
            transition={{ type: 'spring', stiffness: 80, damping: 15 }}
          />
        </div>

        <div className="flex-1 space-y-2">
          <div>
            <span className="text-2xl font-mono font-bold tabular-nums" style={{ color: barColor }}>
              {altitude ? altitude.toLocaleString() : '--'}
            </span>
            <span className="text-xs font-mono text-muted-foreground ml-1">ft</span>
          </div>
          <div className="flex items-center gap-1">
            <span className={`text-xs font-mono font-semibold tabular-nums ${
              (verticalSpeed || 0) < 0 ? 'text-red-400' : 'text-emerald-400'
            }`}>
              {verticalSpeed ? (verticalSpeed > 0 ? '+' : '') + verticalSpeed.toLocaleString() : '--'}
            </span>
            <span className="text-[10px] font-mono text-muted-foreground">ft/min</span>
          </div>
          <div className="text-[10px] font-mono text-muted-foreground">
            {altitude > 10000 ? 'CRUISE' : altitude > 3000 ? 'DESCENT' : altitude > 500 ? 'APPROACH' : altitude > 0 ? 'GROUND PROX' : '--'}
          </div>
        </div>
      </div>
    </div>
  );
}