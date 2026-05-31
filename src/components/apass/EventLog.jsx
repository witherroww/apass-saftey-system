import { useEffect, useState } from 'react';
import { subscribe, getEvents } from '@/lib/event-log';
import { ScrollText } from 'lucide-react';

const severityConfig = {
  critical: { color: 'text-red-400', bg: 'bg-red-400/5', dot: 'bg-red-400', border: 'border-red-400/20' },
  warn:     { color: 'text-amber-400', bg: 'bg-amber-400/5', dot: 'bg-amber-400', border: 'border-amber-400/20' },
  info:     { color: 'text-primary', bg: 'bg-primary/5', dot: 'bg-primary', border: 'border-primary/20' },
};

export default function EventLog() {
  const [events, setEvents] = useState(getEvents);

  useEffect(() => {
    const unsub = subscribe(setEvents);
    return unsub;
  }, []);

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <ScrollText className="w-3.5 h-3.5 text-primary" />
        <h2 className="text-xs font-mono font-semibold tracking-wider text-primary uppercase">
          Event Log
        </h2>
        <div className="ml-auto text-[15px] font-mono text-muted-foreground">CVR/FDR</div>
      </div>

      <div className="space-y-1 max-h-48 overflow-y-auto">
        {events.length === 0 && (
          <p className="text-[15px] font-mono text-muted-foreground">No events recorded.</p>
        )}
        {events.map(event => {
          const cfg = severityConfig[event.severity] || severityConfig.info;
          return (
            <div key={event.id} className={`flex items-start gap-2 rounded px-2 py-1.5 border ${cfg.bg} ${cfg.border}`}>
              <div className={`w-1.5 h-1.5 rounded-full mt-1 shrink-0 ${cfg.dot}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-mono text-muted-foreground tabular-nums shrink-0">{event.time}</span>
                  <span className={`text-[9px] font-mono font-bold ${cfg.color}`}>{event.code}</span>
                </div>
                <p className={`text-[15px] font-mono leading-snug ${cfg.color}`}>{event.message}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}