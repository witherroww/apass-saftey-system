// CVR-style event log management

let eventLog = [];
let listeners = [];
let lastState = {};

export function subscribe(fn) {
  listeners.push(fn);
  return () => { listeners = listeners.filter(l => l !== fn); };
}

function emit() {
  listeners.forEach(fn => fn([...eventLog]));
}

export function addEvent(code, message, severity = 'info') {
  const entry = {
    id: Date.now() + Math.random(),
    time: new Date().toUTCString().slice(17, 25),
    code,
    message,
    severity, // 'info' | 'warn' | 'critical'
  };
  eventLog = [entry, ...eventLog].slice(0, 50); // keep last 50
  emit();
}

// Automatically generate events based on telemetry changes
export function processTelemetryEvents(telemetry, calculations) {
  const { altitude, verticalSpeed, airspeed } = telemetry;
  const { timeToImpact, hazardLevel } = calculations;
  const now = JSON.stringify({ altitude: Math.round(altitude / 100), hazardLevel, lowSpeed: airspeed < 70 });

  if (now === lastState.key) return;
  lastState.key = now;

  if (hazardLevel === 'red' && lastState.hazard !== 'red') {
    addEvent('HAZ-001', 'CRITICAL hazard level — emergency procedures required', 'critical');
  }
  if (hazardLevel === 'yellow' && lastState.hazard === 'green') {
    addEvent('HAZ-002', 'Hazard level elevated to CAUTION', 'warn');
  }
  lastState.hazard = hazardLevel;

  if (timeToImpact !== null && timeToImpact < 120 && lastState.tti !== 'lt120') {
    addEvent('TTI-001', `Time to impact below 2 minutes — ${Math.round(timeToImpact)}s remaining`, 'critical');
    lastState.tti = 'lt120';
  } else if (timeToImpact !== null && timeToImpact < 300 && lastState.tti !== 'lt300' && lastState.tti !== 'lt120') {
    addEvent('TTI-002', `Time to impact below 5 minutes — initiate emergency procedures`, 'warn');
    lastState.tti = 'lt300';
  }

  if (altitude < 1000 && lastState.altLow !== 'lt1000') {
    addEvent('ALT-001', 'Altitude below 1000 ft AGL — TERRAIN AWARENESS', 'critical');
    lastState.altLow = 'lt1000';
  } else if (altitude < 3000 && lastState.altLow !== 'lt3000' && lastState.altLow !== 'lt1000') {
    addEvent('ALT-002', 'Altitude below 3000 ft — PULL UP advisory issued', 'warn');
    lastState.altLow = 'lt3000';
  }

  if (airspeed < 70 && !lastState.lowSpeed) {
    addEvent('SPD-001', `Airspeed ${airspeed} kts — approaching stall envelope`, 'warn');
    lastState.lowSpeed = true;
  } else if (airspeed >= 70) {
    lastState.lowSpeed = false;
  }

  if (verticalSpeed < -3000 && !lastState.highDescent) {
    addEvent('VSI-001', `Vertical speed ${verticalSpeed} ft/min — excessive descent rate`, 'warn');
    lastState.highDescent = true;
  } else if (verticalSpeed >= -3000) {
    lastState.highDescent = false;
  }
}

export function getEvents() {
  return [...eventLog];
}

export function clearEvents() {
  eventLog = [];
  emit();
}

// Initialize with system boot
addEvent('SYS-001', 'APASS system initialized — telemetry acquisition active', 'info');
addEvent('SYS-002', 'Squawk 7700 — Emergency transponder code active', 'warn');