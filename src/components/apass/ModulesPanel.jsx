import { Satellite, Plane, Cpu, Lock } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

const modules = [
  {
    name: 'Aircraft Emergency Recovery',
    icon: Plane,
    status: 'active',
    version: 'v1.0',
    description: 'Real-time emergency landing prediction and guidance',
  },
  {
    name: 'Orbital Debris Avoidance',
    icon: Satellite,
    status: 'planned',
    version: '--',
    description: 'Predict and avoid orbital debris collision risks',
  },
  {
    name: 'UAV Emergency Recovery',
    icon: Plane,
    status: 'planned',
    version: '--',
    description: 'Automated emergency recovery for unmanned systems',
  },
  {
    name: 'Sensor Failure Detection',
    icon: Cpu,
    status: 'planned',
    version: '--',
    description: 'AI-driven sensor anomaly and failure prediction',
  },
];

export default function ModulesPanel() {
  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-center gap-2 mb-4">
        <Cpu className="w-3.5 h-3.5 text-primary" />
        <h2 className="text-xs font-mono font-semibold tracking-wider text-primary uppercase">
          System Modules
        </h2>
      </div>
      <div className="space-y-2">
        {modules.map((mod) => (
          <div
            key={mod.name}
            className={`flex items-center gap-3 rounded-md px-3 py-2.5 border transition-colors ${
              mod.status === 'active'
                ? 'bg-primary/5 border-primary/20'
                : 'bg-background/30 border-border/50 opacity-60'
            }`}
          >
            <mod.icon className={`w-4 h-4 ${mod.status === 'active' ? 'text-primary' : 'text-muted-foreground'}`} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-medium text-foreground truncate">
                  {mod.name}
                </span>
                {mod.status === 'planned' && <Lock className="w-3 h-3 text-muted-foreground" />}
              </div>
              <p className="text-[10px] font-mono text-muted-foreground truncate">{mod.description}</p>
            </div>
            <Badge
              variant="outline"
              className={`text-[9px] px-1.5 py-0 h-4 font-mono ${
                mod.status === 'active'
                  ? 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20'
                  : 'bg-muted text-muted-foreground border-border'
              }`}
            >
              {mod.status === 'active' ? 'ACTIVE' : 'PLANNED'}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
}