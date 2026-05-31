import { Zap } from 'lucide-react';

const PRESETS = [
  {
    label: 'Engine Failure',
    icon: '',
    desc: 'High altitude, no thrust, rapid descent',
    values: { altitude: 12000, airspeed: 95, heading: 180, verticalSpeed: -1800, windSpeed: 20, windDirection: 270, glideRatio: 9 },
  },
  {
    label: 'Final Approach',
    icon: '',
    desc: 'Low and slow on approach path',
    values: { altitude: 1500, airspeed: 80, heading: 90, verticalSpeed: -600, windSpeed: 8, windDirection: 90, glideRatio: 12 },
  },
  {
    label: 'Cruise Nominal',
    icon: '',
    desc: 'Normal cruise, slight turbulence',
    values: { altitude: 35000, airspeed: 450, heading: 270, verticalSpeed: -100, windSpeed: 50, windDirection: 280, glideRatio: 18 },
  },
  {
    label: 'Critical Dive',
    icon: '',
    desc: 'Uncontrolled descent, impact imminent',
    values: { altitude: 3000, airspeed: 200, heading: 0, verticalSpeed: -4500, windSpeed: 30, windDirection: 45, glideRatio: 6 },
  },
];

export default function ScenarioPresets({ onApply }) {
  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <Zap className="w-3.5 h-3.5 text-primary" />
        <h2 className="text-xs font-sans font-semibold tracking-wider text-primary uppercase">
          Scenario Presets
        </h2>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {PRESETS.map((p) => (
          <button
            key={p.label}
            onClick={() => onApply(p.values)}
            className="text-left bg-background/60 hover:bg-secondary/60 border border-border hover:border-primary/50 rounded-md px-3 py-2.5 transition-all group"
          >
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-sm">{p.icon}</span>
              <span className="text-[10px] font-sans font-bold text-foreground group-hover:text-primary transition-colors uppercase tracking-wide">
                {p.label}
              </span>
            </div>
            <p className="text-[18px] font-sans text-muted-foreground leading-snug">{p.desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
}