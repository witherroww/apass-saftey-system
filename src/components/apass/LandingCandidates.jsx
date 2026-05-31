import { PlaneLanding, MapPin, Ruler } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

const typeColors = {
  regional: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20',
  municipal: 'bg-primary/10 text-primary border-primary/20',
  highway: 'bg-amber-400/10 text-amber-400 border-amber-400/20',
  private: 'bg-muted text-muted-foreground border-border',
  military: 'bg-red-400/10 text-red-400 border-red-400/20',
};

export default function LandingCandidates({ candidates }) {
  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <PlaneLanding className="w-3.5 h-3.5 text-primary" />
        <h2 className="text-xs font-mono font-semibold tracking-wider text-primary uppercase">
          Emergency Landing Sites
        </h2>
        <span className="text-[10px] font-mono text-muted-foreground ml-auto">
          {candidates.length} reachable
        </span>
      </div>
      
      {candidates.length === 0 ? (
        <p className="text-xs font-mono text-muted-foreground text-center py-4">
          No reachable landing sites. Input telemetry data to search.
        </p>
      ) : (
        <div className="space-y-2">
          {candidates.map((c, i) => (
            <div key={i} className="flex items-center justify-between bg-background/50 rounded-md px-3 py-2 border border-border/50 hover:border-primary/30 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded bg-primary/10 flex items-center justify-center">
                  <span className="text-[10px] font-mono font-bold text-primary">{i + 1}</span>
                </div>
                <div>
                  <p className="text-xs font-mono font-medium text-foreground">{c.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] font-mono text-muted-foreground">RWY {c.runway}ft</span>
                    <Badge variant="outline" className={`text-[9px] px-1.5 py-0 h-4 font-mono ${typeColors[c.type]}`}>
                      {c.type}
                    </Badge>
                  </div>
                </div>
              </div>
              <span className="text-xs font-mono font-semibold text-primary tabular-nums">
                {c.distance} nm
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}