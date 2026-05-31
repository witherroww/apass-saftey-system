import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, FastForward } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Simulates a realistic aircraft emergency descent over time
export default function SimulationControls({ telemetry, onUpdate }) {
  const [running, setRunning] = useState(false);
  const [speed, setSpeed] = useState(1);
  const intervalRef = useRef(null);
  const stateRef = useRef(telemetry);

  useEffect(() => { stateRef.current = telemetry; }, [telemetry]);

  const tick = () => {
    const t = stateRef.current;
    const dtSec = 2 * speed;

    // Simulate realistic physics: altitude decreases with VS, airspeed slight decay
    const newAlt = Math.max(0, (t.altitude || 0) + ((t.verticalSpeed || 0) / 60) * dtSec);
    const newAirspeed = Math.max(55, (t.airspeed || 100) - 0.05 * speed);
    // Slight heading drift
    const newHeading = ((t.heading || 0) + (Math.random() - 0.5) * 0.5 * speed + 360) % 360;
    // VS gets slightly more negative (nose drops)
    const newVS = Math.min(-50, (t.verticalSpeed || -500) - 5 * speed);

    const updated = {
      ...t,
      altitude: Math.round(newAlt),
      airspeed: Math.round(newAirspeed * 10) / 10,
      heading: Math.round(newHeading * 10) / 10,
      verticalSpeed: Math.round(newVS),
    };

    stateRef.current = updated;
    onUpdate(updated);

    if (newAlt <= 0) {
      setRunning(false);
    }
  };

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(tick, 500);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running, speed]);

  const toggle = () => setRunning(r => !r);
  const cycleSpeed = () => setSpeed(s => s === 1 ? 5 : s === 5 ? 10 : 1);

  return (
    <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-4 py-2.5">
      <span className="text-[14px] font-sans font-semibold text-muted-foreground uppercase tracking-widest mr-1">Simulation</span>

      <Button
        size="sm"
        variant="outline"
        onClick={toggle}
        className={`h-7 px-3 text-[12px] font-sans font-bold border transition-all ${
          running
            ? 'border-red-500/50 text-red-400 hover:bg-red-500/10'
            : 'border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10'
        }`}
      >
        {running ? <Pause className="w-3 h-3 mr-1" /> : <Play className="w-3 h-3 mr-1" />}
        {running ? 'PAUSE' : 'RUN'}
      </Button>

      <Button
        size="sm"
        variant="outline"
        onClick={cycleSpeed}
        className="h-7 px-2.5 text-[10px] font-sans border-border text-amber-400 hover:border-amber-400/50"
      >
        <FastForward className="w-3 h-3 mr-1" />
        {speed}×
      </Button>

      <Button
        size="sm"
        variant="ghost"
        onClick={() => { setRunning(false); }}
        className="h-7 px-2 text-muted-foreground hover:text-foreground"
        title="Stop simulation"
      >
        <RotateCcw className="w-3 h-3" />
      </Button>

      {running && (
        <div className="ml-auto flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[9px] font-sans text-emerald-400 font-semibold">LIVE</span>
        </div>
      )}
    </div>
  );
}