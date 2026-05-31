import { ShieldCheck, ShieldAlert, ShieldOff, Info } from 'lucide-react';
import { Progress } from "@/components/ui/progress";

export default function ConfidencePanel({ confidence }) {
  const { percentage, level, explanation, missing } = confidence;

  const config = {
    high: {
      icon: ShieldCheck,
      color: 'text-emerald-400',
      progressColor: 'bg-emerald-400',
      bg: 'bg-emerald-400/5',
      border: 'border-emerald-400/20',
      label: 'HIGH CONFIDENCE',
    },
    medium: {
      icon: ShieldAlert,
      color: 'text-amber-400',
      progressColor: 'bg-amber-400',
      bg: 'bg-amber-400/5',
      border: 'border-amber-400/20',
      label: 'MEDIUM CONFIDENCE',
    },
    low: {
      icon: ShieldOff,
      color: 'text-red-400',
      progressColor: 'bg-red-400',
      bg: 'bg-red-400/5',
      border: 'border-red-400/20',
      label: 'LOW CONFIDENCE',
    },
  };

  const c = config[level];
  const Icon = c.icon;

  return (
    <div className={`bg-card border rounded-lg p-4 ${c.border}`}>
      <div className="flex items-center gap-2 mb-3">
        <Icon className={`w-4 h-4 ${c.color}`} />
        <h2 className="text-xs font-mono font-semibold tracking-wider uppercase" style={{ color: 'inherit' }}>
          <span className={c.color}>{c.label}</span>
        </h2>
      </div>

      <div className="flex items-center gap-3 mb-3">
        <span className={`text-3xl font-mono font-bold tabular-nums ${c.color}`}>
          {percentage}%
        </span>
        <div className="flex-1">
          <div className="h-2 bg-background rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${c.progressColor}`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </div>

      <div className={`${c.bg} rounded-md p-2.5 border ${c.border}`}>
        <div className="flex items-start gap-2">
          <Info className="w-3 h-3 text-muted-foreground mt-0.5 shrink-0" />
          <p className="text-[11px] font-mono text-muted-foreground leading-relaxed">
            {explanation}
          </p>
        </div>
      </div>
    </div>
  );
}