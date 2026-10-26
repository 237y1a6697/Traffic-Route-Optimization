import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { AlertTriangle, Compass, Layers, ShieldAlert, Sparkles, Zap } from 'lucide-react';
import { HYDERABAD_ROAD_EDGES } from '../data/hyderabadGeoData';

// Fix Leaflet default icon path issues in bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom SVG Icons
const createMarkerIcon = (color, text, isDestination = false) => {
  return L.divIcon({
    className: 'custom-map-beacon',
    html: `
      <div style="
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
      ">
        <div style="
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: ${color};
          opacity: 0.35;
          animation: mapPulse 2s infinite ease-in-out;
        "></div>
        <div style="
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: ${color};
          border: 2px solid #ffffff;
          box-shadow: 0 0 12px ${color};
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          font-weight: 800;
          font-size: 11px;
          font-family: sans-serif;
        ">
          ${isDestination ? '🏁' : '📍'}
        </div>
        <div style="
          position: absolute;
          top: 32px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(15, 23, 42, 0.92);
          border: 1px solid rgba(255,255,255,0.15);
          color: #f8fafc;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 600;
          white-space: nowrap;
          pointer-events: none;
          box-shadow: 0 4px 12px rgba(0,0,0,0.5);
        ">
          ${text}
        </div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  });
};

const incidentIcon = L.divIcon({
  className: 'custom-incident-icon',
  html: `
    <div style="
      background: #ef4444;
      color: #fff;
      border: 2px solid #ffffff;
      border-radius: 50%;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: bold;
      box-shadow: 0 0 10px rgba(239, 68, 68, 0.9);
      animation: mapPulse 1.5s infinite;
    ">
      ⚠️
    </div>
  `,
  iconSize: [24, 24],
  iconAnchor: [12, 12]
});

// Stadia Maps Alidade Smooth Dark Layer Configuration
// Localhost: Keyless authentication supported automatically by Stadia Maps
// Production: Uses Domain-based Authentication (configured in Stadia Dashboard) - no frontend secrets needed!
const createStadiaDarkLayer = (onFallback) => {
  const layer = L.tileLayer(
    'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png',
    {
      maxZoom: 20,
      subdomains: '',
      attribution:
        '&copy; <a href="https://stadiamaps.com/" target="_blank" rel="noopener noreferrer">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank" rel="noopener noreferrer">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors'
    }
  );

  let fallbackTriggered = false;
  layer.on('tileerror', (error) => {
    if (!fallbackTriggered) {
      fallbackTriggered = true;
      console.warn('Stadia Maps tile error encountered. Gracefully activating OpenStreetMap fallback layer:', error);
      if (onFallback) onFallback();
    }
  });

  return layer;
};

const createOsmFallbackLayer = () => {
  return L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors'
  });
};

export default function RealMap({
  sourceLoc,
  destLoc,
  recommendedRoute,
  alternativeRoutes = [],
  activeSelectedRouteKey,
  setActiveSelectedRouteKey,
  trafficModel,
  onToggleIncident
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layersRef = useRef({
    tileLayer: null,
    networkLayer: null,
    routesLayer: null,
    markersLayer: null,
    incidentsLayer: null
  });

  const [mapStyle, setMapStyle] = useState('dark'); // 'dark' or 'osm'
  const [selectedEdgeData, setSelectedEdgeData] = useState(null);

  // Fallback handler if Stadia tiles cannot load
  const handleFallbackToOsm = () => {
    const map = mapInstanceRef.current;
    if (map && layersRef.current.tileLayer) {
      try {
        map.removeLayer(layersRef.current.tileLayer);
      } catch (_) {}
      const fallbackLayer = createOsmFallbackLayer();
      fallbackLayer.addTo(map);
      layersRef.current.tileLayer = fallbackLayer;
    }
  };

  // 1. Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const container = mapContainerRef.current;
      if (container._leaflet_id && !container._leaflet_id.startsWith?.('map')) {
        delete container._leaflet_id;
      }

      let map = null;
      try {
        map = L.map(container, {
          center: [17.4350, 78.4350],
          zoom: 12,
          zoomControl: false,
          attributionControl: false
        });
      } catch (err) {
        console.warn('Leaflet map initialization recovery:', err);
        try {
          delete container._leaflet_id;
          map = L.map(container, {
            center: [17.4350, 78.4350],
            zoom: 12,
            zoomControl: false,
            attributionControl: false
          });
        } catch (innerErr) {
          console.error('Fatal map initialization error:', innerErr);
          return;
        }
      }

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Initialize with Stadia Alidade Smooth Dark Layer
      const darkTiles = createStadiaDarkLayer(handleFallbackToOsm);
      darkTiles.addTo(map);

      mapInstanceRef.current = map;
      layersRef.current.tileLayer = darkTiles;

      // Group layers
      layersRef.current.networkLayer = L.layerGroup().addTo(map);
      layersRef.current.routesLayer = L.layerGroup().addTo(map);
      layersRef.current.markersLayer = L.layerGroup().addTo(map);
      layersRef.current.incidentsLayer = L.layerGroup().addTo(map);
    }

    return () => {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch (e) {
          console.warn('Safe leaflet unmount catch:', e);
        }
        mapInstanceRef.current = null;
      }
      if (mapContainerRef.current) {
        delete mapContainerRef.current._leaflet_id;
      }
    };
  }, []);

  // 2. Handle Tile Layer Switcher
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (layersRef.current.tileLayer) {
      try {
        map.removeLayer(layersRef.current.tileLayer);
      } catch (_) {}
    }

    if (mapStyle === 'dark') {
      const darkTiles = createStadiaDarkLayer(handleFallbackToOsm);
      darkTiles.addTo(map);
      layersRef.current.tileLayer = darkTiles;
    } else {
      const osmTiles = createOsmFallbackLayer();
      osmTiles.addTo(map);
      layersRef.current.tileLayer = osmTiles;
    }
  }, [mapStyle]);

  // 3. Render Road Network Overlay with Simulated Traffic Conditions & Incidents
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !layersRef.current.networkLayer) return;

    layersRef.current.networkLayer.clearLayers();
    layersRef.current.incidentsLayer.clearLayers();

    HYDERABAD_ROAD_EDGES.forEach(edge => {
      const m = trafficModel.getEdgeMetrics(edge);

      // Draw underlying road segment with congestion color
      const line = L.polyline(edge.coordinates, {
        color: m.color,
        weight: m.isIncident ? 6 : Math.max(3, edge.capacity / 700),
        opacity: 0.65,
        lineCap: 'round',
        lineJoin: 'round'
      });

      // Interactive popup on road click
      line.on('click', () => {
        setSelectedEdgeData(m);
      });

      line.addTo(layersRef.current.networkLayer);

      // Add incident warning marker if road has an active incident
      if (m.isIncident) {
        const midPoint = edge.coordinates[Math.floor(edge.coordinates.length / 2)];
        const marker = L.marker(midPoint, { icon: incidentIcon });
        marker.bindPopup(`
          <div style="font-family: sans-serif; font-size: 12px; color: #0f172a; padding: 4px;">
            <strong style="color: #ef4444;">⚠️ Traffic Incident Disruption</strong><br/>
            <strong>${edge.name}</strong><br/>
            Reason: ${m.incidentReason || 'Roadblock / Collision'}<br/>
            Capacity Drop: <strong>${Math.round(m.vcRatio * 100)}% V/C Congestion</strong><br/>
            Current Speed: <strong>${m.currentSpeedKmH} km/h</strong> (Limit: ${edge.speedLimit} km/h)
          </div>
        `);
        marker.addTo(layersRef.current.incidentsLayer);
      }
    });
  }, [trafficModel]);

  // 4. Render Start & Destination Markers and Fit Bounds
  useEffect(() => {
    try {
      const map = mapInstanceRef.current;
      if (!map || !layersRef.current.markersLayer) return;

      layersRef.current.markersLayer.clearLayers();

      const bounds = L.latLngBounds([]);

      if (sourceLoc && typeof sourceLoc.lat === 'number' && typeof sourceLoc.lng === 'number') {
        L.marker([sourceLoc.lat, sourceLoc.lng], {
          icon: createMarkerIcon('#22c55e', sourceLoc.shortName || 'Start', false)
        }).addTo(layersRef.current.markersLayer);
        bounds.extend([sourceLoc.lat, sourceLoc.lng]);
      }

      if (destLoc && typeof destLoc.lat === 'number' && typeof destLoc.lng === 'number') {
        L.marker([destLoc.lat, destLoc.lng], {
          icon: createMarkerIcon('#38bdf8', destLoc.shortName || 'Destination', true)
        }).addTo(layersRef.current.markersLayer);
        bounds.extend([destLoc.lat, destLoc.lng]);
      }

      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [60, 60], maxZoom: 14 });
      }
    } catch (err) {
      console.warn('Marker render error:', err);
    }
  }, [sourceLoc, destLoc]);

  // 5. Render Optimized Route & Alternative Routes
  useEffect(() => {
    try {
      const map = mapInstanceRef.current;
      if (!map || !layersRef.current.routesLayer) return;

      layersRef.current.routesLayer.clearLayers();

      // 1. Draw alternative routes first
      alternativeRoutes.forEach(route => {
        if (!route || !route.polylineCoords || route.polylineCoords.length === 0) return;
        if (route.algorithm === 'QGA') return;

        const isSelected = activeSelectedRouteKey === route.algorithm;
        const routeColor = route.algorithm === 'DIJKSTRA' ? '#f59e0b' : '#a855f7';

        const altLine = L.polyline(route.polylineCoords, {
          color: isSelected ? routeColor : '#64748b',
          weight: isSelected ? 6 : 4,
          opacity: isSelected ? 0.95 : 0.5,
          dashArray: isSelected ? null : '5, 6',
          lineCap: 'round',
          lineJoin: 'round'
        });

        altLine.bindTooltip(`
          <div style="font-family: sans-serif; font-size: 11px; padding: 2px;">
            <strong>${route.algorithmName}</strong><br/>
            ${route.distanceKm} km • ${route.travelTimeMins} min
          </div>
        `, { sticky: true });

        altLine.on('click', () => {
          if (setActiveSelectedRouteKey) {
            setActiveSelectedRouteKey(route.algorithm);
          }
        });

        altLine.addTo(layersRef.current.routesLayer);
      });

      // 2. Draw Recommended Quantum-Inspired Route on Top (bold vibrant cyan)
      if (recommendedRoute && recommendedRoute.polylineCoords && recommendedRoute.polylineCoords.length > 0) {
        const isQuantumActive = !activeSelectedRouteKey || activeSelectedRouteKey === 'QGA';

        // Outer glow polyline
        L.polyline(recommendedRoute.polylineCoords, {
          color: '#38bdf8',
          weight: isQuantumActive ? 9 : 5,
          opacity: isQuantumActive ? 0.35 : 0.15,
          lineCap: 'round',
          lineJoin: 'round'
        }).addTo(layersRef.current.routesLayer);

        // Core route polyline
        const mainLine = L.polyline(recommendedRoute.polylineCoords, {
          color: isQuantumActive ? '#06b6d4' : '#0284c7',
          weight: isQuantumActive ? 5 : 3.5,
          opacity: 0.95,
          lineCap: 'round',
          lineJoin: 'round'
        });

        mainLine.bindTooltip(`
          <div style="font-family: sans-serif; font-size: 11px; padding: 2px;">
            <strong style="color: #06b6d4;">★ Recommended: Quantum Pareto Route</strong><br/>
            ${recommendedRoute.distanceKm} km • ${recommendedRoute.travelTimeMins} min
          </div>
        `, { sticky: true });

        mainLine.on('click', () => {
          if (setActiveSelectedRouteKey) {
            setActiveSelectedRouteKey('QGA');
          }
        });

        mainLine.addTo(layersRef.current.routesLayer);

        // Fit bounds to the active route or recommended route
        const activeRoute = alternativeRoutes.find(r => r.algorithm === activeSelectedRouteKey) || recommendedRoute;
        if (activeRoute && activeRoute.polylineCoords && activeRoute.polylineCoords.length > 0) {
          const routeBounds = L.latLngBounds(activeRoute.polylineCoords);
          if (routeBounds.isValid()) {
            map.fitBounds(routeBounds, { padding: [60, 60] });
          }
        }
      }
    } catch (err) {
      console.warn('Routes render error:', err);
    }
  }, [recommendedRoute, alternativeRoutes, activeSelectedRouteKey]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: '12px', overflow: 'hidden' }}>
      {/* Real Map Container */}
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%', zIndex: 1 }} />

      {/* Floating Map Header Badge: Clearly Labeled Simulated Traffic */}
      <div style={{
        position: 'absolute',
        top: '1rem',
        left: '1rem',
        zIndex: 10,
        background: 'rgba(15, 23, 42, 0.88)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '8px',
        padding: '0.45rem 0.85rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.65rem',
        boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
        fontSize: '0.75rem'
      }}>
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 8px #22c55e' }} />
        <span style={{ color: '#f8fafc', fontWeight: 600 }}>OpenStreetMap Hyderabad Geographic Layer</span>
        <span style={{ color: '#64748b' }}>|</span>
        <span style={{ color: '#38bdf8', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>Simulated Traffic Data</span>
      </div>

      {/* Map Basemap Style Switcher (Dark vs OSM) */}
      <div style={{
        position: 'absolute',
        top: '1rem',
        right: '1rem',
        zIndex: 10,
        background: 'rgba(15, 23, 42, 0.88)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '8px',
        padding: '0.3rem',
        display: 'flex',
        gap: '0.3rem'
      }}>
        <button
          onClick={() => setMapStyle('dark')}
          style={{
            background: mapStyle === 'dark' ? 'rgba(56, 189, 248, 0.25)' : 'transparent',
            border: `1px solid ${mapStyle === 'dark' ? 'rgba(56, 189, 248, 0.5)' : 'transparent'}`,
            color: mapStyle === 'dark' ? '#38bdf8' : '#94a3b8',
            borderRadius: '5px',
            padding: '0.3rem 0.6rem',
            fontSize: '0.75rem',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Dark Tile
        </button>
        <button
          onClick={() => setMapStyle('osm')}
          style={{
            background: mapStyle === 'osm' ? 'rgba(56, 189, 248, 0.25)' : 'transparent',
            border: `1px solid ${mapStyle === 'osm' ? 'rgba(56, 189, 248, 0.5)' : 'transparent'}`,
            color: mapStyle === 'osm' ? '#38bdf8' : '#94a3b8',
            borderRadius: '5px',
            padding: '0.3rem 0.6rem',
            fontSize: '0.75rem',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          OSM Standard
        </button>
      </div>

      {/* Real Map Traffic Legend */}
      <div style={{
        position: 'absolute',
        bottom: '1rem',
        left: '1rem',
        zIndex: 10,
        background: 'rgba(15, 23, 42, 0.92)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '8px',
        padding: '0.5rem 0.85rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.85rem',
        fontSize: '0.75rem',
        boxShadow: '0 4px 16px rgba(0,0,0,0.4)'
      }}>
        <span style={{ fontWeight: 600, color: '#f8fafc' }}>Traffic Level:</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#94a3b8' }}>
          <div style={{ width: '12px', height: '5px', background: '#22c55e', borderRadius: '2px' }} />
          <span>Low</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#94a3b8' }}>
          <div style={{ width: '12px', height: '5px', background: '#eab308', borderRadius: '2px' }} />
          <span>Moderate</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#94a3b8' }}>
          <div style={{ width: '12px', height: '5px', background: '#f97316', borderRadius: '2px' }} />
          <span>Heavy</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#94a3b8' }}>
          <div style={{ width: '12px', height: '5px', background: '#ef4444', borderRadius: '2px' }} />
          <span>Severe Jam</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#f8fafc', fontWeight: 600 }}>
          <span style={{ color: '#06b6d4' }}>━━</span>
          <span>Quantum Route</span>
        </div>
      </div>

      {/* Selected Road Segment Popup Inspector */}
      {selectedEdgeData && (
        <div style={{
          position: 'absolute',
          bottom: '1rem',
          right: '1rem',
          zIndex: 20,
          background: 'rgba(15, 23, 42, 0.95)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(56, 189, 248, 0.4)',
          borderRadius: '10px',
          padding: '0.9rem',
          fontSize: '0.8rem',
          minWidth: '270px',
          maxWidth: '320px',
          boxShadow: '0 12px 32px rgba(0,0,0,0.6)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontWeight: 700, color: '#38bdf8', fontSize: '0.85rem' }}>
              {selectedEdgeData.name}
            </span>
            <button
              onClick={() => setSelectedEdgeData(null)}
              style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '1rem' }}
            >
              ✕
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', color: '#cbd5e1', fontSize: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Segment Length:</span>
              <strong className="mono">{selectedEdgeData.distanceKm} km</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Speed:</span>
              <strong className="mono" style={{ color: selectedEdgeData.currentSpeedKmH < 25 ? '#ef4444' : '#22c55e' }}>
                {selectedEdgeData.currentSpeedKmH} km/h (Limit: {selectedEdgeData.speedLimit})
              </strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Congestion Level:</span>
              <strong style={{ color: selectedEdgeData.color, textTransform: 'capitalize' }}>
                {selectedEdgeData.congestionLevel} ({Math.round(selectedEdgeData.vcRatio * 100)}% V/C)
              </strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>BPR Latency Travel Time:</span>
              <strong className="mono">{selectedEdgeData.actualTravelTimeMins} mins</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Simulated Volume:</span>
              <strong className="mono">{selectedEdgeData.volumeVehH} / {selectedEdgeData.capacityVehH} veh/hr</strong>
            </div>

            {selectedEdgeData.isIncident && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                borderRadius: '6px',
                padding: '0.4rem',
                color: '#fca5a5',
                marginTop: '0.3rem'
              }}>
                ⚠️ <strong>Active Incident:</strong> {selectedEdgeData.incidentReason}
              </div>
            )}

            <div style={{ marginTop: '0.6rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <button
                className={`btn btn-sm ${selectedEdgeData.isIncident ? 'btn-primary' : 'btn-danger'}`}
                style={{ width: '100%' }}
                onClick={() => {
                  onToggleIncident(selectedEdgeData.edgeId);
                  setSelectedEdgeData(null);
                }}
              >
                <AlertTriangle size={13} />
                {selectedEdgeData.isIncident ? 'Clear Incident' : 'Simulate Accident / Roadblock'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
