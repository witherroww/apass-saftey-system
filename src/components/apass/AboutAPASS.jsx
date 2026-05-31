

export default function AboutAPASS() {
  return (
    <div className="bg-card border border-border rounded-lg p-4 glow-cyan">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
        <h2 className="text-xs font-mono font-semibold tracking-wider text-primary uppercase">
          About APASS / SYSTEM BRIEFING
        </h2>
      </div>

      <div className="space-y-3 text-reg leading-relaxed text-muted-foreground">
        <p>
          APASS is an experimental aviation 'awareness' dashboard combining live
          ADS-B traffic, nearby METAR weather, airport data, and telemetry-style
          alerts into one interface.
        </p>

        <p>
          Modern aircraft increasingly rely on digital displays, integrated avionics, and adaptive user interfaces. While traditional cockpit instrumentation remains highly effective and iconic, APASS explores how real-time aviation data could be presented through a modern interface that prioritizes clarity, accessibility, and rapid interpretation.

          Rather than replicating existing flight decks, APASS serves as a prototype for how future aviation systems might visualize information for pilots, operators, and observers.
        </p>

        <p className="text-amber-400 font-mono text-[11px]">
          Public aviation data may be delayed, incomplete, unavailable, or
          inaccurate. APASS is for educational and observational use only, not
          for real-world flight planning, navigation, or safety-critical
          decisions.
        </p>
      </div>
      <div className="mt-6 pt-4 border-t border-border text-center">
        <p className="text-xs font-mono text-muted-foreground">
          APASS — Aviation Position & Situational System
        </p>
        <p className="text-[13px] font-mono text-muted-foreground/70 mt-1">
          Designed and developed by Ryan McGurk · 2026
        </p>
      </div>
    </div>
  );
}