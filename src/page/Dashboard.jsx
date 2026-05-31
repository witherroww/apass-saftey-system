import { useState, useMemo, useEffect } from 'react';
import TopBar from '@/components/apass/TopBar';
import TelemetryInput from '@/components/apass/TelemetryInput';
import PredictionPanel from '@/components/apass/PredictionPanel';
import ConfidencePanel from '@/components/apass/ConfidencePanel';
import HazardGauge from '@/components/apass/HazardGauge';
import FlightMap from '@/components/apass/FlightMap';
import LandingCandidates from '@/components/apass/LandingCandidates';
import AltitudeGauge from '@/components/apass/AltitudeGauge';
import SpeedGauge from '@/components/apass/SpeedGauge';
import MaydayPanel from '@/components/apass/MaydayPanel';
import EventLog from '@/components/apass/EventLog';
import WeatherStation from '@/components/apass/WeatherStation';
import ADSBTraffic from '@/components/apass/ADSBTraffic';
import LocationBar from '@/components/apass/LocationBar';
import ScenarioPresets from '@/components/apass/ScenarioPresets';
import SimulationControls from '@/components/apass/SimulationControls';
import {
  calculateTimeToImpact,
  calculateImpactLocation,
  calculateReachableRadius,
  calculateRecommendedHeading,
  calculateConfidence,
  calculateHazardLevel,
  generateFlightPath,
} from '@/lib/apass-calculations';
import { getNearestAirports } from '@/lib/airport-data';
import { runMonteCarlo, getPercentileRings } from '@/lib/monte-carlo';
import { processTelemetryEvents, addEvent } from '@/lib/event-log';
import AboutAPASS from "@/components/apass/AboutAPASS";

const DEFAULT_TELEMETRY = {
  altitude: 8500,
  airspeed: 120,
  heading: 270,
  verticalSpeed: -800,
  latitude: null,
  longitude: null,
  windSpeed: 15,
  windDirection: 180,
  glideRatio: 10,
};

export default function Dashboard() {
  const [telemetry, setTelemetry] = useState(DEFAULT_TELEMETRY);
  const [landingCandidates, setLandingCandidates] = useState([]);
  const [adsbTraffic, setAdsbTraffic] = useState([]);
  const [locationLabel, setLocationLabel] = useState(null);

  // Auto-detect location on first load
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setTelemetry(t => ({ ...t, latitude, longitude }));
          setLocationLabel('Your Location');
          addEvent('GEO-001', `Position acquired: ${latitude.toFixed(4)}°, ${longitude.toFixed(4)}°`, 'info');
        },
        () => {
          // Fallback to NYC if denied
          setTelemetry(t => ({ ...t, latitude: 40.7128, longitude: -74.006 }));
          setLocationLabel('New York (default)');
        }
      );
    }
  }, []);

  const handleLocationSet = (lat, lon, label) => {
    setTelemetry(t => ({ ...t, latitude: lat, longitude: lon }));
    setLocationLabel(label);
    addEvent('GEO-002', `Location updated: ${label?.split(',')[0] || 'Custom'}`, 'info');
  };

  const handlePreset = (values) => {
    setTelemetry(t => ({ ...t, ...values }));
    addEvent('SIM-001', 'Scenario preset loaded — telemetry updated', 'info');
  };

  const calculations = useMemo(() => {
    const { altitude, airspeed, heading, verticalSpeed, latitude, longitude, windSpeed, windDirection, glideRatio } = telemetry;

    const timeToImpact = calculateTimeToImpact(altitude, verticalSpeed);
    const impactLocation = calculateImpactLocation(latitude, longitude, heading, airspeed, timeToImpact, windSpeed, windDirection);
    const reachableRadius = calculateReachableRadius(altitude, glideRatio);
    const recommendedHeading = calculateRecommendedHeading(latitude, longitude, windDirection, windSpeed, heading);
    const confidence = calculateConfidence(telemetry);
    const hazardLevel = calculateHazardLevel(altitude, verticalSpeed, airspeed, timeToImpact);
    const flightPath = generateFlightPath(latitude, longitude, heading, airspeed, verticalSpeed, altitude, windSpeed, windDirection);
    const mcPoints = runMonteCarlo(telemetry, timeToImpact, 300);
    const monteCarloRings = getPercentileRings(mcPoints);

    return {
      timeToImpact,
      impactLocation,
      reachableRadius,
      recommendedHeading,
      confidence,
      hazardLevel,
      flightPath,
      monteCarloRings,
      groundSpeed: impactLocation?.groundSpeed || null,
    };
  }, [telemetry]);

  useEffect(() => {
    const { latitude, longitude, windSpeed, windDirection } = telemetry;
    if (!latitude || !longitude || !calculations.reachableRadius) return;
    getNearestAirports(latitude, longitude, calculations.reachableRadius, windDirection, windSpeed)
      .then(airports => setLandingCandidates(airports));
  }, [telemetry.latitude, telemetry.longitude, calculations.reachableRadius]);

  useEffect(() => {
    processTelemetryEvents(telemetry, calculations);
  }, [telemetry, calculations]);

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background font-sans">
      <TopBar hazardLevel={calculations.hazardLevel} locationLabel={locationLabel} />

      {/* Location + Simulation bar */}
      <div className="border-b border-border bg-card/60 backdrop-blur-sm px-4 py-2 flex items-center gap-3 flex-wrap">
        <div className="flex-1 min-w-48 max-w-xs">
          <LocationBar onLocationSet={handleLocationSet} />
        </div>
        <div className="flex-1">
          <SimulationControls telemetry={telemetry} onUpdate={setTelemetry} />
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <div className="grid grid-cols-12 gap-4">
          {/* Left column */}
          <div className="col-span-12 lg:col-span-3 space-y-4">
            <ScenarioPresets onApply={handlePreset} />
            <TelemetryInput telemetry={telemetry} onChange={setTelemetry} />
            <div className="grid grid-cols-2 gap-4">
              <AltitudeGauge altitude={telemetry.altitude} verticalSpeed={telemetry.verticalSpeed} />
              <SpeedGauge airspeed={telemetry.airspeed} groundSpeed={calculations.groundSpeed} />
            </div>
            <HazardGauge hazardLevel={calculations.hazardLevel} timeToImpact={calculations.timeToImpact} />
          </div>

          {/* Center */}
          <div className="col-span-12 lg:col-span-6 space-y-4">
            <div style={{ height: '500px' }}>
              <FlightMap
                aircraftPosition={{ lat: telemetry.latitude, lon: telemetry.longitude }}
                flightPath={calculations.flightPath}
                impactPoint={calculations.impactLocation}
                reachableRadius={calculations.reachableRadius}
                landingCandidates={landingCandidates}
                monteCarloRings={calculations.monteCarloRings}
                adsbTraffic={adsbTraffic}
              />
            </div>
            <EventLog />
            <ADSBTraffic
              latitude={telemetry.latitude}
              longitude={telemetry.longitude}
              onTrafficUpdate={setAdsbTraffic}
            />
            <MaydayPanel
              telemetry={telemetry}
              timeToImpact={calculations.timeToImpact}
              landingCandidates={landingCandidates}
            />
            
          </div>

          {/* Right column */}
          <div className="col-span-12 lg:col-span-3 space-y-4">
            <PredictionPanel
              predictions={{
                timeToImpact: calculations.timeToImpact,
                impactLocation: calculations.impactLocation,
                reachableRadius: calculations.reachableRadius,
                recommendedHeading: calculations.recommendedHeading,
              }}
              hazardLevel={calculations.hazardLevel}
            />
            <ConfidencePanel confidence={calculations.confidence} />
            <LandingCandidates candidates={landingCandidates} />
            <WeatherStation latitude={telemetry.latitude} longitude={telemetry.longitude} />
            
          </div>
        </div>
        <div className="bg-card border border-border rounded-lg p-6">

              <AboutAPASS />

            </div>
      </div>
    </div>
  );
}