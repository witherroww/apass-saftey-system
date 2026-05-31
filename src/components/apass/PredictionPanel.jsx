import { Timer, Target, Circle, Navigation, TrendingDown } from 'lucide-react';
import { formatTime } from '@/lib/apass-calculations';

export default function PredictionPanel({ predictions, hazardLevel }) {
  const {
    timeToImpact,
    impactLocation,
    reachableRadius,
    recommendedHeading,
  } = predictions;

  const hazardGlow = {
    green: 'glow-green',
    yellow: 'glow-amber',
    red: 'glow-red',
  };

  const hazardBorder = {
    green: 'border-emerald-500/30',
    yellow: 'border-amber-500/30',
    red: 'border-red-500/30',
  };

  const metrics = [
    {
      label: 'Time to Impact',
      value: formatTime(timeToImpact),
      icon: Timer,
      color: timeToImpact && timeToImpact < 120 ? 'text-red-400' : timeToImpact && timeToImpact < 300 ? 'text-amber-400' : 'text-emerald-400',
    },
    {
      label: 'Impact Location',
      value: impactLocation ? `${impactLocation.lat.toFixed(4)}°, ${impactLocation.lon.toFixed(4)}°` : '-- , --',
      icon: Target,
      color: 'text-red-400',
    },
    {
      label: 'Reachable Radius',
      value: reachableRadius ? `${reachableRadius.toFixed(1)} nm` : '-- nm',
      icon: Circle,
      color: 'text-primary',
    },
    {
      label: 'Recommended HDG',
      value: recommendedHeading !== null ? `${Math.round(recommendedHeading)}°` : '--°',
      icon: Navigation,
      color: 'text-primary',
    },
  ];

  return (
    <div className={`bg-card border rounded-lg p-4 ${hazardBorder[hazardLevel]} ${hazardGlow[hazardLevel]}`}>
      <div className="flex items-center gap-2 mb-4">
        <TrendingDown className="w-3.5 h-3.5 text-primary" />
        <h2 className="text-xs font-mono font-semibold tracking-wider text-primary uppercase">
          Predictions
        </h2>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {metrics.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-background/50 rounded-md p-3 border border-border/50">
            <div className="flex items-center gap-1.5 mb-1">
              <Icon className={`w-3 h-3 ${color}`} />
              <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                {label}
              </span>
            </div>
            <p className={`text-lg font-mono font-bold tabular-nums ${color}`}>
              {value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}