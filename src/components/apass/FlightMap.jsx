import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Circle, Popup, useMap, Polygon } from 'react-leaflet';
import { Map as MapIcon } from 'lucide-react';
import L from 'leaflet';

// Fix leaflet default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const aircraftIcon = new L.DivIcon({
  html: `<div style="color:#22d3ee;font-size:24px;transform:rotate(0deg);filter:drop-shadow(0 0 6px rgba(34,211,238,0.6))">✈</div>`,
  className: '',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const impactIcon = new L.DivIcon({
  html: `<div style="color:#f87171;font-size:20px;filter:drop-shadow(0 0 6px rgba(248,113,113,0.6))">⊗</div>`,
  className: '',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

const landingIcon = new L.DivIcon({
  html: `<div style="color:#34d399;font-size:16px;filter:drop-shadow(0 0 4px rgba(52,211,153,0.5))">▲</div>`,
  className: '',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

const trafficIcon = new L.DivIcon({
  html: `<div style="color:#a78bfa;font-size:12px;filter:drop-shadow(0 0 3px rgba(167,139,250,0.5))">✦</div>`,
  className: '',
  iconSize: [12, 12],
  iconAnchor: [6, 6],
});

function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);
  return null;
}

export default function FlightMap({ 
  aircraftPosition, 
  flightPath, 
  impactPoint, 
  reachableRadius, 
  landingCandidates,
  monteCarloRings,
  adsbTraffic = [],
}) {
  const hasPosition = aircraftPosition && aircraftPosition.lat && aircraftPosition.lon;
  const center = hasPosition ? [aircraftPosition.lat, aircraftPosition.lon] : [34.0522, -118.2437];
  const radiusMeters = (reachableRadius || 0) * 1852; // nm to meters

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden h-full flex flex-col">
      <div className="flex items-center gap-2 p-3 border-b border-border">
        <MapIcon className="w-3.5 h-3.5 text-primary" />
        <h2 className="text-xs font-mono font-semibold tracking-wider text-primary uppercase">
          Tactical Map
        </h2>
        {adsbTraffic.length > 0 && (
          <span className="ml-auto text-[9px] font-mono text-purple-400 border border-purple-400/30 rounded px-1.5 py-0.5">
            {adsbTraffic.length} ADS-B contacts
          </span>
        )}
      </div>
      <div className="flex-1 relative" style={{ minHeight: '300px' }}>
        <MapContainer
          center={center}
          zoom={11}
          style={{ height: '100%', width: '100%', background: '#0a0f1e' }}
          zoomControl={false}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; OpenStreetMap'
          />
          <MapUpdater center={center} />

          {/* Monte Carlo P90 ring (outer, wider uncertainty) */}
          {monteCarloRings?.p90?.length > 0 && (
            <Polygon
              positions={monteCarloRings.p90}
              pathOptions={{ color: '#f87171', fillColor: '#f87171', fillOpacity: 0.05, weight: 1, dashArray: '4 4' }}
            />
          )}

          {/* Monte Carlo P50 ring (inner, most likely zone) */}
          {monteCarloRings?.p50?.length > 0 && (
            <Polygon
              positions={monteCarloRings.p50}
              pathOptions={{ color: '#fbbf24', fillColor: '#fbbf24', fillOpacity: 0.1, weight: 1.5, dashArray: '6 3' }}
            />
          )}

          {/* Aircraft position */}
          {hasPosition && (
            <Marker position={[aircraftPosition.lat, aircraftPosition.lon]} icon={aircraftIcon}>
              <Popup>
                <div className="font-mono text-xs">
                  <strong>Aircraft Position</strong><br/>
                  {aircraftPosition.lat.toFixed(4)}°, {aircraftPosition.lon.toFixed(4)}°
                </div>
              </Popup>
            </Marker>
          )}

          {/* Flight path */}
          {flightPath.length > 1 && (
            <Polyline
              positions={flightPath.map(p => [p.lat, p.lon])}
              pathOptions={{ color: '#fbbf24', weight: 2, dashArray: '8 4', opacity: 0.8 }}
            />
          )}

          {/* Impact point */}
          {impactPoint && (
            <>
              <Marker position={[impactPoint.lat, impactPoint.lon]} icon={impactIcon}>
                <Popup>
                  <div className="font-mono text-xs">
                    <strong>Predicted Impact</strong><br/>
                    {impactPoint.lat.toFixed(4)}°, {impactPoint.lon.toFixed(4)}°
                  </div>
                </Popup>
              </Marker>
              <Circle
                center={[impactPoint.lat, impactPoint.lon]}
                radius={500}
                pathOptions={{ color: '#f87171', fillColor: '#f87171', fillOpacity: 0.1, weight: 1 }}
              />
            </>
          )}

          {/* Reachable landing zone */}
          {hasPosition && radiusMeters > 0 && (
            <Circle
              center={[aircraftPosition.lat, aircraftPosition.lon]}
              radius={radiusMeters}
              pathOptions={{ color: '#22d3ee', fillColor: '#22d3ee', fillOpacity: 0.05, weight: 1.5, dashArray: '6 3' }}
            />
          )}

          {/* Landing candidates */}
          {landingCandidates.map((lc, i) => (
            <Marker key={i} position={[lc.lat, lc.lon]} icon={landingIcon}>
              <Popup>
                <div className="font-mono text-xs">
                  <strong>{lc.name}</strong><br/>
                  {lc.icao && <span>ICAO: {lc.icao}<br/></span>}
                  Runway: {lc.runway} ft<br/>
                  Distance: {lc.distance} nm<br/>
                  {lc.score !== undefined && <span>Score: {lc.score}/100</span>}
                </div>
              </Popup>
            </Marker>
          ))}

          {/* ADS-B live traffic */}
          {adsbTraffic.map((t, i) => (
            t.lat && t.lon && (
              <Marker key={t.icao24 || i} position={[t.lat, t.lon]} icon={trafficIcon}>
                <Popup>
                  <div className="font-mono text-xs">
                    <strong>{t.callsign}</strong><br/>
                    Alt: {t.altitude ? `${t.altitude} ft` : 'N/A'}<br/>
                    Speed: {t.velocity ? `${t.velocity} kt` : 'N/A'}<br/>
                    Hdg: {t.heading ? `${Math.round(t.heading)}°` : 'N/A'}
                  </div>
                </Popup>
              </Marker>
            )
          ))}
        </MapContainer>

        {/* Map legend */}
        <div className="absolute bottom-3 left-3 bg-card/90 backdrop-blur-sm border border-border rounded-md p-2 z-[1000]">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[13px] font-mono text-muted-foreground">
              <span style={{ color: '#22d3ee' }}>✈</span> Aircraft
            </div>
            <div className="flex items-center gap-2 text-[13px] font-mono text-muted-foreground">
              <span style={{ color: '#fbbf24' }}>---</span> Predicted Path
            </div>
            <div className="flex items-center gap-2 text-[13px] font-mono text-muted-foreground">
              <span style={{ color: '#fbbf24' }}>▭</span> P50 Impact Zone
            </div>
            <div className="flex items-center gap-2 text-[13px] font-mono text-muted-foreground">
              <span style={{ color: '#f87171' }}>▭</span> P90 Impact Zone
            </div>
            <div className="flex items-center gap-2 text-[13px] font-mono text-muted-foreground">
              <span style={{ color: '#f87171' }}>⊗</span> Impact Point
            </div>
            <div className="flex items-center gap-2 text-[13px] font-mono text-muted-foreground">
              <span style={{ color: '#22d3ee' }}>○</span> Reachable Zone
            </div>
            <div className="flex items-center gap-2 text-[13px] font-mono text-muted-foreground">
              <span style={{ color: '#34d399' }}>▲</span> Landing Site
            </div>
            <div className="flex items-center gap-2 text-[13px] font-mono text-muted-foreground">
              <span style={{ color: '#a78bfa' }}>✦</span> ADS-B Traffic
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}