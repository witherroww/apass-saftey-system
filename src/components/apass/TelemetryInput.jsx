import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Gauge, Wind, Compass, MapPin, ArrowDown, Plane } from 'lucide-react';

const inputFields = [
  { key: 'altitude', label: 'Altitude', unit: 'ft', icon: ArrowDown, placeholder: '8500' },
  { key: 'airspeed', label: 'Airspeed', unit: 'kts', icon: Gauge, placeholder: '120' },
  { key: 'heading', label: 'Heading', unit: '°', icon: Compass, placeholder: '270' },
  { key: 'verticalSpeed', label: 'V/S', unit: 'ft/min', icon: ArrowDown, placeholder: '-800' },
  { key: 'latitude', label: 'Latitude', unit: '°', icon: MapPin, placeholder: '34.0522' },
  { key: 'longitude', label: 'Longitude', unit: '°', icon: MapPin, placeholder: '-118.2437' },
  { key: 'windSpeed', label: 'Wind Spd', unit: 'kts', icon: Wind, placeholder: '15' },
  { key: 'windDirection', label: 'Wind Dir', unit: '°', icon: Wind, placeholder: '180' },
  { key: 'glideRatio', label: 'Glide Ratio', unit: ':1', icon: Plane, placeholder: '10' },
];

export default function TelemetryInput({ telemetry, onChange }) {
  const handleChange = (key, value) => {
    const num = value === '' ? '' : parseFloat(value);
    onChange({ ...telemetry, [key]: isNaN(num) ? '' : num });
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 glow-cyan">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
        <h2 className="text-xs font-mono font-semibold tracking-wider text-primary uppercase">
          Telemetry Input
        </h2>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {inputFields.map(({ key, label, unit, icon: Icon, placeholder }) => (
          <div key={key} className="space-y-1">
            <Label className="text-[15px] font-mono text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <Icon className="w-3 h-3" />
              {label}
            </Label>
            <div className="relative">
              <Input
                
                value={telemetry[key] ?? ''}
                onChange={(e) => handleChange(key, e.target.value)}
                placeholder={placeholder}
                className="h-8 text-sm font-mono bg-slate-900 border-slate-700 text-cyan-400 pr-10"
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-mono text-muted-foreground">
                {unit}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
