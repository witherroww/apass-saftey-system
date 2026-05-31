import { useState } from 'react';
import { Radio, Copy, Check, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function MaydayPanel({ telemetry, timeToImpact, landingCandidates }) {
  const [copied, setCopied] = useState(false);

  const callsign = 'UNKNOWN';
  const { latitude, longitude, altitude, airspeed } = telemetry;

  const nearest = landingCandidates?.[0];
  const position = (latitude && longitude)
    ? `${Math.abs(latitude).toFixed(4)}°${latitude >= 0 ? 'N' : 'S'} ${Math.abs(longitude).toFixed(4)}°${longitude >= 0 ? 'E' : 'W'}`
    : 'POSITION UNKNOWN';

  const nature = timeToImpact && timeToImpact < 120
    ? 'ENGINE FAILURE / CONTROLLED DESCENT — IMMINENT IMPACT'
    : 'EMERGENCY DESCENT — POWER LOSS';

  const fuelState = 'UNKNOWN';
  const soulsOnBoard = 'UNKNOWN';
  const intention = nearest
    ? `INTENDING TO LAND AT ${nearest.name?.toUpperCase() || 'NEAREST AIRPORT'} (${nearest.distance} NM)`
    : 'SEEKING EMERGENCY LANDING SITE';

  const maydayText =
    `MAYDAY MAYDAY MAYDAY\n` +
    `[CALLSIGN: ${callsign}]\n` +
    `POSITION: ${position}\n` +
    `ALTITUDE: ${altitude ? Math.round(altitude) + ' FT' : 'UNKNOWN'}\n` +
    `NATURE OF EMERGENCY: ${nature}\n` +
    `SOULS ON BOARD: ${soulsOnBoard}\n` +
    `FUEL REMAINING: ${fuelState}\n` +
    `${intention}\n` +
    `REQUEST IMMEDIATE ASSISTANCE\n` +
    `EMERGENCY FREQUENCY: 121.5 MHz`;

  const handleCopy = () => {
    navigator.clipboard.writeText(maydayText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-card border border-red-500/40 rounded-lg p-4 glow-red">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-3.5 h-3.5 text-red-400 animate-pulse" />
          <h2 className="text-xs font-mono font-semibold tracking-wider text-red-400 uppercase">
            Mayday Auto-Draft
          </h2>
        </div>
        <div className="flex items-center gap-1.5 text-[15px] font-mono text-red-400 border border-red-500/40 rounded px-2 py-0.5">
          <Radio className="w-3 h-3 animate-pulse" />
          121.5 MHz
        </div>
      </div>

      <pre className="text-[15px] font-mono text-red-300/90 leading-relaxed bg-red-950/30 border border-red-500/20 rounded-md p-3 whitespace-pre-wrap mb-3">
        {maydayText}
      </pre>

      <Button
        size="sm"
        onClick={handleCopy}
        className="w-full h-7 text-[10px] font-mono bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40"
        variant="outline"
      >
        {copied ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
        {copied ? 'COPIED TO CLIPBOARD' : 'COPY MAYDAY CALL'}
      </Button>
    </div>
  );
}