import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { HYDERABAD_ROAD_EDGES } from '../../data/static/hyderabadGeoData';
import { GeographicLocation } from '../../models/road';
import { RouteResult, VehicleMode, NavigationManeuver } from '../../models/route';
import { EdgeTrafficMetrics, TrafficSignalInfo } from '../../models/traffic';
import { TrafficService } from '../../services/traffic';
import { getSignalsAlongRoute, getTrafficColoredSegments } from '../../services/trafficSignals';
import { GpsPosition, GpsTrackingStatus } from '../../hooks/useGpsTracker';
import NavigationHUD from '../Navigation/NavigationHUD';
import { distanceToPolylineMeters } from '../../services/navigation';
import { Crosshair, Locate, LocateFixed, AlertCircle, Layers, Compass } from 'lucide-react';

// Fix Leaflet default icon path issues in bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

/**
 * Validates whether a given point is a legitimate [lat, lng] or {lat, lng} coordinate pair.
 */
function isValidLatLng(point: any): boolean {
  if (!point) return false;
  if (Array.isArray(point)) {
    return (
      point.length >= 2 &&
      typeof point[0] === 'number' &&
      !isNaN(point[0]) &&
      isFinite(point[0]) &&
      typeof point[1] === 'number' &&
      !isNaN(point[1]) &&
      isFinite(point[1])
    );
  }
  if (typeof point === 'object') {
    const lat = point.lat ?? point.latitude;
    const lng = point.lng ?? point.lon ?? point.longitude;
    return (
      typeof lat === 'number' &&
      !isNaN(lat) &&
      isFinite(lat) &&
      typeof lng === 'number' &&
      !isNaN(lng) &&
      isFinite(lng)
    );
  }
  return false;
}

// Custom SVG Icons
const createMarkerIcon = (color: string, text: string, isDestination: boolean = false) => {
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

const createGpsMarkerIcon = (heading: number | null) => {
  return L.divIcon({
    className: 'custom-gps-marker',
    html: `
      <div style="
        position: relative;
        width: 38px;
        height: 38px;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: #38bdf8;
          opacity: 0.45;
          animation: mapPulse 1.8s infinite ease-out;
        "></div>
        <div style="
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: #0284c7;
          border: 3px solid #ffffff;
          box-shadow: 0 0 16px #38bdf8;
          display: flex;
          align-items: center;
          justify-content: center;
          transform: ${heading !== null ? `rotate(${heading}deg)` : 'none'};
          transition: transform 0.3s ease;
        ">
          ${heading !== null 
            ? `<div style="width: 0; height: 0; border-left: 5px solid transparent; border-right: 5px solid transparent; border-bottom: 9px solid #ffffff; margin-bottom: 2px;"></div>`
            : `<div style="width: 8px; height: 8px; border-radius: 50%; background: #ffffff;"></div>`}
        </div>
      </div>
    `,
    iconSize: [38, 38],
    iconAnchor: [19, 19]
  });
};

const createManeuverMarkerIcon = (modifier?: string) => {
  let arrowSymbol = '⬆';
  const mod = (modifier || '').toLowerCase();
  if (mod === 'right') arrowSymbol = '➔';
  else if (mod === 'left') arrowSymbol = '⬅';
  else if (mod === 'slight right') arrowSymbol = '↗';
  else if (mod === 'slight left') arrowSymbol = '↖';
  else if (mod === 'u-turn') arrowSymbol = '↩';
  else if (mod === 'arrive') arrowSymbol = '🏁';

  return L.divIcon({
    className: 'custom-maneuver-beacon',
    html: `
      <div style="
        position: relative;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: #059669;
          opacity: 0.4;
          animation: mapPulse 1.5s infinite ease-out;
        "></div>
        <div style="
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #059669;
          border: 2px solid #ffffff;
          box-shadow: 0 0 14px rgba(5, 150, 105, 0.85);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          font-weight: 900;
          font-size: 13px;
        ">
          ${arrowSymbol}
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

const createTrafficSignalIcon = (currentPhase: 'RED' | 'YELLOW' | 'GREEN') => {
  const borderColor = currentPhase === 'RED' ? '#ef4444' : currentPhase === 'YELLOW' ? '#f59e0b' : '#22c55e';
  const glowColor = currentPhase === 'RED' ? 'rgba(239, 68, 68, 0.7)' : currentPhase === 'YELLOW' ? 'rgba(245, 158, 11, 0.7)' : 'rgba(34, 197, 94, 0.7)';

  return L.divIcon({
    className: 'custom-traffic-signal-icon',
    html: `
      <div style="
        position: relative;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
      ">
        <div style="
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: ${glowColor};
          animation: mapPulse 2s infinite ease-out;
        "></div>
        <div style="
          width: 26px;
          height: 26px;
          border-radius: 50%;
          background: #0f172a;
          border: 2px solid ${borderColor};
          box-shadow: 0 0 12px ${glowColor};
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          line-height: 1;
        ">
          🚦
        </div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  });
};

// Stadia Maps Alidade Smooth Dark Layer Configuration
const createStadiaDarkLayer = (onFallback?: () => void): L.TileLayer => {
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

const createOsmFallbackLayer = (): L.TileLayer => {
  return L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors'
  });
};

interface RealMapProps {
  sourceLoc?: GeographicLocation | null;
  destLoc?: GeographicLocation | null;
  recommendedRoute?: RouteResult | null;
  alternativeRoutes?: RouteResult[];
  activeSelectedRouteKey?: string;
  setActiveSelectedRouteKey?: (key: string) => void;
  trafficModel: TrafficService;
  onToggleIncident?: (edgeId: string) => void;
  onSelectEdge?: (edgeId: string) => void;
  selectedEdgeId?: string | null;

  // GPS Tracking Props
  gpsPosition?: GpsPosition | null;
  gpsStatus?: GpsTrackingStatus;
  gpsErrorMsg?: string | null;
  isGpsTracking?: boolean;
  onToggleGpsTracking?: () => void;

  // Navigation Mode Props
  isNavigating?: boolean;
  activeManeuver?: NavigationManeuver | null;
  maneuverIndex?: number;
  totalManeuvers?: number;
  distanceToManeuverMeters?: number | null;
  remainingDistanceKm?: number;
  remainingTimeMins?: number;
  isOffRoute?: boolean;
  offRouteDistanceMeters?: number;
  onExitNavigation?: () => void;
  onRecalculateRoute?: () => void;
  onNextManeuver?: () => void;
  onPrevManeuver?: () => void;
  vehicleMode?: VehicleMode;
  onMapClick?: (lat: number, lng: number) => void;
  mapSelectMode?: 'origin' | 'destination' | null;
}

export default function RealMap({
  sourceLoc,
  destLoc,
  recommendedRoute,
  alternativeRoutes = [],
  activeSelectedRouteKey,
  setActiveSelectedRouteKey,
  trafficModel,
  onToggleIncident,
  onSelectEdge,
  selectedEdgeId,
  gpsPosition,
  gpsStatus = 'idle',
  gpsErrorMsg,
  isGpsTracking = false,
  onToggleGpsTracking,
  isNavigating = false,
  activeManeuver = null,
  maneuverIndex = 0,
  totalManeuvers = 0,
  distanceToManeuverMeters = null,
  remainingDistanceKm = 0,
  remainingTimeMins = 0,
  isOffRoute = false,
  offRouteDistanceMeters = 0,
  onExitNavigation,
  onRecalculateRoute,
  onNextManeuver,
  onPrevManeuver,
  vehicleMode = 'car',
  onMapClick,
  mapSelectMode = null
}: RealMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const onMapClickRef = useRef(onMapClick);
  useEffect(() => {
    onMapClickRef.current = onMapClick;
  }, [onMapClick]);
  const layersRef = useRef<{
    tileLayer?: L.TileLayer;
    networkLayer?: L.LayerGroup;
    routesLayer?: L.LayerGroup;
    markersLayer?: L.LayerGroup;
    incidentsLayer?: L.LayerGroup;
    signalsLayer?: L.LayerGroup;
    gpsLayer?: L.LayerGroup;
    maneuverLayer?: L.LayerGroup;
  }>({});

  const [mapStyle, setMapStyle] = useState<'dark' | 'osm'>('dark');
  const [selectedEdgeData, setSelectedEdgeData] = useState<EdgeTrafficMetrics | null>(null);
  const [selectedSignal, setSelectedSignal] = useState<(TrafficSignalInfo & { routeIndex?: number }) | null>(null);
  const [signalTick, setSignalTick] = useState(0);

  // Live 1-second clock ticker for authentic real-time traffic signal phase countdowns
  useEffect(() => {
    const timer = setInterval(() => {
      setSignalTick(t => (t + 1) % 86400);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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

  // Center on user location action
  const handleCenterOnUser = useCallback(() => {
    const map = mapInstanceRef.current;
    if (!map || !gpsPosition) return;
    map.flyTo([gpsPosition.lat, gpsPosition.lng], 16, {
      duration: 1.2
    });
  }, [gpsPosition]);

  // Center on Route action
  const handleFitRoute = useCallback(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    const activeRoute = alternativeRoutes.find(r => r.algorithm === activeSelectedRouteKey) || recommendedRoute;
    if (activeRoute && activeRoute.polylineCoords && activeRoute.polylineCoords.length > 0) {
      const bounds = L.latLngBounds(activeRoute.polylineCoords);
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [60, 60] });
      }
    }
  }, [alternativeRoutes, activeSelectedRouteKey, recommendedRoute]);

  // 1. Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const container = mapContainerRef.current as any;
      if (container._leaflet_id && !container._leaflet_id.startsWith?.('map')) {
        delete container._leaflet_id;
      }

      let map: L.Map | null = null;
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
      layersRef.current.networkLayer = L.layerGroup().addTo(map);
      layersRef.current.routesLayer = L.layerGroup().addTo(map);
      layersRef.current.markersLayer = L.layerGroup().addTo(map);
      layersRef.current.incidentsLayer = L.layerGroup().addTo(map);
      layersRef.current.signalsLayer = L.layerGroup().addTo(map);
      layersRef.current.gpsLayer = L.layerGroup().addTo(map);
      layersRef.current.maneuverLayer = L.layerGroup().addTo(map);

      map.on('click', (e: L.LeafletMouseEvent) => {
        if (onMapClickRef.current) {
          onMapClickRef.current(e.latlng.lat, e.latlng.lng);
        }
      });
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
        delete (mapContainerRef.current as any)._leaflet_id;
      }
    };
  }, []);

  // 2. Basemap Style Switcher
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

  // 3. Render Simulated Traffic Incidents ONLY if they occur directly on the route we are traveling
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !layersRef.current.networkLayer || !layersRef.current.incidentsLayer) return;

    layersRef.current.networkLayer.clearLayers();
    layersRef.current.incidentsLayer.clearLayers();

    // Determine currently active route polyline
    const activeRoute = alternativeRoutes.find(r => r.algorithm === activeSelectedRouteKey) || recommendedRoute;
    const polyline = activeRoute?.polylineCoords || [];

    // ONLY render active traffic incidents with distinct ⚠️ markers if they lie on the route we are traveling
    for (const [edgeId, inc] of trafficModel.incidents.entries()) {
      const edge = HYDERABAD_ROAD_EDGES.find(e => e.id === edgeId);
      if (edge && edge.coordinates && edge.coordinates.length > 0) {
        const midPoint = edge.coordinates[Math.floor(edge.coordinates.length / 2)];
        if (midPoint && isValidLatLng(midPoint)) {
          // If a travel route exists, strictly filter to incidents occurring along the route
          if (polyline.length >= 2) {
            const { minDistanceMeters } = distanceToPolylineMeters(midPoint[0], midPoint[1], polyline);
            if (minDistanceMeters > 350) {
              // Incident is NOT on the route we are going to travel - skip!
              continue;
            }
          }

          const marker = L.marker(midPoint, { icon: incidentIcon });
          marker.bindPopup(`
            <div style="font-family: sans-serif; font-size: 12px; color: #0f172a; padding: 4px;">
              <strong style="color: #ef4444;">⚠️ Active Incident / Lane Disruption</strong><br/>
              <strong>${edge.name}</strong><br/>
              Reason: ${inc.reason || 'Roadblock / Collision'}<br/>
              Speed Penalty: <strong>${Math.round(edge.speedLimit * inc.factor)} km/h</strong> (Limit: ${edge.speedLimit} km/h)
            </div>
          `);
          marker.addTo(layersRef.current.incidentsLayer!);
        }
      }
    }
  }, [trafficModel, onSelectEdge, activeSelectedRouteKey, recommendedRoute, alternativeRoutes]);

  // 4. Render Origin / Destination Markers and Fit Bounds (When not navigating)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !layersRef.current.markersLayer) return;

    layersRef.current.markersLayer.clearLayers();
    const bounds = L.latLngBounds([]);

    if (sourceLoc && isValidLatLng([sourceLoc.lat, sourceLoc.lng])) {
      L.marker([sourceLoc.lat, sourceLoc.lng], {
        icon: createMarkerIcon('#22c55e', sourceLoc.shortName || 'Start', false)
      }).addTo(layersRef.current.markersLayer);
      bounds.extend([sourceLoc.lat, sourceLoc.lng]);
    }

    if (destLoc && isValidLatLng([destLoc.lat, destLoc.lng])) {
      L.marker([destLoc.lat, destLoc.lng], {
        icon: createMarkerIcon('#38bdf8', destLoc.shortName || 'Destination', true)
      }).addTo(layersRef.current.markersLayer);
      bounds.extend([destLoc.lat, destLoc.lng]);
    }

    if (bounds.isValid() && !isNavigating) {
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 14 });
    }
  }, [sourceLoc, destLoc, isNavigating]);

  // 5. Render Route Polylines (Google Maps Style: Red for High Traffic, Yellow for Medium Traffic, Green for Normal Free Road)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !layersRef.current.routesLayer) return;

    layersRef.current.routesLayer.clearLayers();

    // 1. Draw Alternative routes first as subtle dashed lines
    alternativeRoutes.forEach(route => {
      if (!route || !route.polylineCoords) return;
      const validCoords = route.polylineCoords.filter(c => isValidLatLng(c));
      if (validCoords.length < 2) return;
      if (route.algorithm === activeSelectedRouteKey) return; // Selected route is drawn with live traffic colors on top

      const routeColor = route.algorithm === 'DIJKSTRA' ? '#f59e0b' : '#a855f7';

      const altLine = L.polyline(validCoords, {
        color: routeColor,
        weight: 4,
        opacity: 0.45,
        dashArray: '5, 6',
        lineCap: 'round',
        lineJoin: 'round'
      });

      altLine.bindTooltip(`
        <div style="font-family: sans-serif; font-size: 11px; padding: 3px;">
          <strong>${route.algorithmName}</strong><br/>
          ${route.distanceKm} km • ${route.travelTimeMins} min<br/>
          <span style="color: #94a3b8; font-size: 10px;">Click to select and view traffic flow</span>
        </div>
      `, { sticky: true });

      altLine.on('click', () => {
        if (setActiveSelectedRouteKey) {
          setActiveSelectedRouteKey(route.algorithm);
        }
      });

      altLine.addTo(layersRef.current.routesLayer!);
    });

    // 2. Identify the Active Route to render with Google Maps-style Traffic Colors
    const activeRoute = alternativeRoutes.find(r => r.algorithm === activeSelectedRouteKey) || recommendedRoute;

    if (activeRoute && activeRoute.polylineCoords) {
      const validActiveCoords = activeRoute.polylineCoords.filter(c => isValidLatLng(c));
      if (validActiveCoords.length >= 2) {
        // Glow underlay halo so segment transitions are completely seamless
        L.polyline(validActiveCoords, {
          color: '#0f172a',
          weight: 10,
          opacity: 0.65,
          lineCap: 'round',
          lineJoin: 'round'
        }).addTo(layersRef.current.routesLayer!);

        // Calculate traffic segments:
        const segments = getTrafficColoredSegments(validActiveCoords, trafficModel, vehicleMode);

        segments.forEach(seg => {
          const validSegCoords = (seg.coords || []).filter(c => isValidLatLng(c));
          if (validSegCoords.length < 2) return;

          const segLine = L.polyline(validSegCoords, {
          color: seg.color,
          weight: 6,
          opacity: 0.96,
          lineCap: 'round',
          lineJoin: 'round'
        });

        const statusBadge = seg.status === 'high' ? '🔴 High Traffic' : seg.status === 'moderate' ? '🟡 Medium Traffic' : '🟢 Free Road (Normal)';

        segLine.bindTooltip(`
          <div style="font-family: sans-serif; font-size: 11px; padding: 4px; min-width: 150px;">
            <strong style="color: ${seg.color};">${statusBadge}</strong><br/>
            ${seg.label}<br/>
            Est. Speed: <strong>${seg.speedKmH} km/h</strong> • V/C: <strong>${seg.vcRatio}</strong>
          </div>
        `, { sticky: true });

        segLine.addTo(layersRef.current.routesLayer!);
      });

      // If route changed and not currently navigating, fit bounds
      if (!isNavigating) {
        const routeBounds = L.latLngBounds(validActiveCoords);
        if (routeBounds.isValid()) {
          map.fitBounds(routeBounds, { padding: [60, 60] });
        }
      }
    }
  }
  }, [recommendedRoute, alternativeRoutes, activeSelectedRouteKey, setActiveSelectedRouteKey, trafficModel, vehicleMode, isNavigating]);

  // 5b. Render Traffic Signal Icons along the Active Route with interactive wait time popups
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !layersRef.current.signalsLayer) return;

    layersRef.current.signalsLayer.clearLayers();

    const activeRoute = alternativeRoutes.find(r => r.algorithm === activeSelectedRouteKey) || recommendedRoute;
    if (!activeRoute || !activeRoute.polylineCoords || activeRoute.polylineCoords.length === 0) return;

    // Filter signals within strict 350m corridor of the active calculated route (excludes ORR/expressway)
    const signals = getSignalsAlongRoute(activeRoute.polylineCoords, trafficModel, vehicleMode, 0.35);

    // Keep selectedSignal up-to-date with live ticking data
    if (selectedSignal) {
      const refreshed = signals.find(s => s.id === selectedSignal.id);
      if (refreshed) {
        setSelectedSignal(refreshed);
      }
    }

    signals.forEach((sig, index) => {
      if (!sig || !isValidLatLng([sig.lat, sig.lng])) return;
      const icon = createTrafficSignalIcon(sig.currentPhase);
      const marker = L.marker([sig.lat, sig.lng], { icon, zIndexOffset: 850 });

      const phaseBg = sig.currentPhase === 'RED' ? '#ef4444' : sig.currentPhase === 'YELLOW' ? '#f59e0b' : '#22c55e';
      const formattedVehicleTime = vehicleMode === 'bike' ? `${sig.bikeTimeToCrossSec} sec` : `${sig.timeToCrossMins} min`;

      marker.on('click', () => {
        setSelectedSignal(sig);
      });

      marker.bindPopup(`
        <div style="
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          min-width: 280px;
          background: #0f172a;
          color: #f8fafc;
          border-radius: 10px;
          padding: 12px;
        ">
          <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 8px; margin-bottom: 10px;">
            <div style="display: flex; align-items: center; gap: 6px;">
              <span style="font-size: 18px;">🚦</span>
              <div>
                <strong style="font-size: 13px; color: #f1f5f9; font-weight: 700; display: block;">${sig.name}</strong>
                <span style="font-size: 10px; color: #94a3b8;">Signal ${index + 1} of ${signals.length} on route</span>
              </div>
            </div>
            <span style="
              background: ${phaseBg};
              color: #ffffff;
              font-size: 10px;
              font-weight: 700;
              padding: 2px 7px;
              border-radius: 9999px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            ">
              ${sig.currentPhase} • ${sig.timeRemainingSec}s
            </span>
          </div>

          <!-- Highlighted Time to Cross Signal -->
          <div style="
            background: rgba(30, 41, 59, 0.95);
            border: 1px solid rgba(56, 189, 248, 0.35);
            border-radius: 8px;
            padding: 10px;
            margin-bottom: 10px;
            text-align: center;
          ">
            <div style="font-size: 11px; color: #94a3b8; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
              ⏱️ Time to Cross Signal (${vehicleMode.toUpperCase()})
            </div>
            <div style="font-size: 24px; font-weight: 800; color: #38bdf8; margin: 3px 0;">
              ${formattedVehicleTime}
            </div>
            <div style="font-size: 11px; color: #cbd5e1;">
              Queue: <strong>${sig.queueLengthMeters}m</strong> (${sig.queueVehicles} vehicles waiting)
            </div>
          </div>

          <!-- Vehicle Category Breakdown -->
          <div style="font-size: 11px; margin-bottom: 8px;">
            <div style="color: #94a3b8; font-weight: 600; margin-bottom: 5px;">Clearance Wait by Vehicle Category:</div>
            <div style="display: flex; justify-content: space-between; padding: 4px; border-bottom: 1px dashed rgba(255,255,255,0.08); ${vehicleMode === 'bike' ? 'background: rgba(34, 197, 94, 0.15); border-radius: 4px;' : ''}">
              <span style="color: #cbd5e1;">🏍️ Bike / Two-Wheeler:</span>
              <strong style="color: #22c55e;">~${sig.bikeTimeToCrossSec}s (Lane filter)</strong>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 4px; border-bottom: 1px dashed rgba(255,255,255,0.08); ${vehicleMode === 'car' ? 'background: rgba(56, 189, 248, 0.15); border-radius: 4px;' : ''}">
              <span style="color: #cbd5e1;">🚗 Car / 4-Wheeler:</span>
              <strong style="color: #f59e0b;">~${sig.carTimeToCrossMins} min (Queue delay)</strong>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 4px; ${vehicleMode === 'heavy_vehicle' ? 'background: rgba(239, 68, 68, 0.15); border-radius: 4px;' : ''}">
              <span style="color: #cbd5e1;">🚚 Heavy Vehicle / Truck:</span>
              <strong style="color: #ef4444;">~${sig.heavyTimeToCrossMins} min (Multi-cycle)</strong>
            </div>
          </div>

          <!-- Signal Cycle Details -->
          <div style="
            display: flex;
            justify-content: space-between;
            font-size: 10px;
            color: #64748b;
            border-top: 1px solid rgba(255,255,255,0.08);
            padding-top: 6px;
          ">
            <span>Cycle: ${sig.cycleLengthSec}s (Red ${sig.redSec}s / Green ${sig.greenSec}s)</span>
            <span>V/C: ${sig.vcRatio}</span>
          </div>
        </div>
      `, {
        maxWidth: 320,
        className: 'custom-traffic-signal-popup'
      });

      marker.addTo(layersRef.current.signalsLayer!);
    });
  }, [recommendedRoute, alternativeRoutes, activeSelectedRouteKey, trafficModel, vehicleMode, signalTick]);

  // 6. Render Live GPS Location & Accuracy Circle
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !layersRef.current.gpsLayer) return;

    layersRef.current.gpsLayer.clearLayers();

    if (gpsPosition && isValidLatLng([gpsPosition.lat, gpsPosition.lng])) {
      // 1. Accuracy Circle (in meters)
      if (typeof gpsPosition.accuracy === 'number' && gpsPosition.accuracy > 0) {
        L.circle([gpsPosition.lat, gpsPosition.lng], {
          radius: Math.min(gpsPosition.accuracy, 250),
          color: '#38bdf8',
          weight: 1,
          opacity: 0.6,
          fillColor: '#38bdf8',
          fillOpacity: 0.12
        }).addTo(layersRef.current.gpsLayer);
      }

      // 2. Pulse Marker with Heading Arrow
      const marker = L.marker([gpsPosition.lat, gpsPosition.lng], {
        icon: createGpsMarkerIcon(gpsPosition.heading),
        zIndexOffset: 1000
      });

      marker.bindTooltip(`
        <div style="font-family: sans-serif; font-size: 11px; padding: 3px;">
          <strong style="color: #0284c7;">📍 Your GPS Location</strong><br/>
          Accuracy: ±${gpsPosition.accuracy}m<br/>
          ${gpsPosition.speed !== null ? `Speed: ${gpsPosition.speed} km/h` : ''}
        </div>
      `, { sticky: true });

      marker.addTo(layersRef.current.gpsLayer);

      // In Navigation mode, smoothly follow user
      if (isNavigating) {
        map.panTo([gpsPosition.lat, gpsPosition.lng], { animate: true, duration: 0.8 });
      }
    }
  }, [gpsPosition, isNavigating]);

  // 7. Render Active Maneuver Beacon in Navigation Mode
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !layersRef.current.maneuverLayer) return;

    layersRef.current.maneuverLayer.clearLayers();

    if (isNavigating && activeManeuver && activeManeuver.location && isValidLatLng(activeManeuver.location)) {
      const beacon = L.marker(activeManeuver.location, {
        icon: createManeuverMarkerIcon(activeManeuver.modifier),
        zIndexOffset: 950
      });

      beacon.bindTooltip(`
        <div style="font-family: sans-serif; font-size: 11px; padding: 3px;">
          <strong style="color: #059669;">Next Turn</strong><br/>
          ${activeManeuver.instruction}
        </div>
      `, { permanent: true, direction: 'top', offset: [0, -18] });

      beacon.addTo(layersRef.current.maneuverLayer);
    }
  }, [isNavigating, activeManeuver]);

  const activeRoute = alternativeRoutes.find(r => r.algorithm === activeSelectedRouteKey) || recommendedRoute;

  // Check if any active traffic incident occurs directly on the route we are traveling
  const travelPolyline = activeRoute?.polylineCoords || [];
  const incidentOnActiveRoute = useMemo(() => {
    if (!travelPolyline || travelPolyline.length < 2) return null;
    for (const [edgeId, inc] of trafficModel.incidents.entries()) {
      const edge = HYDERABAD_ROAD_EDGES.find(e => e.id === edgeId);
      if (edge && edge.coordinates && edge.coordinates.length > 0) {
        const midPoint = edge.coordinates[Math.floor(edge.coordinates.length / 2)];
        if (midPoint && isValidLatLng(midPoint)) {
          const { minDistanceMeters } = distanceToPolylineMeters(midPoint[0], midPoint[1], travelPolyline);
          if (minDistanceMeters <= 350) {
            return {
              edgeId,
              name: edge.name,
              reason: inc.reason || 'Heavy Traffic Signal Congestion',
              speedPenalty: Math.round(edge.speedLimit * inc.factor),
              speedLimit: edge.speedLimit
            };
          }
        }
      }
    }
    return null;
  }, [trafficModel, travelPolyline]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: '12px', overflow: 'hidden' }}>
      <div 
        ref={mapContainerRef} 
        style={{ 
          width: '100%', 
          height: '100%', 
          zIndex: 1,
          cursor: mapSelectMode ? 'crosshair' : 'default'
        }} 
      />

      {/* Active Incident Warning Alert ONLY when incident occurs directly on the route we are traveling */}
      {incidentOnActiveRoute && !isNavigating && (
        <div className="active-route-incident-banner" role="alert">
          <div className="incident-banner-header">
            <span style={{ color: '#ef4444', fontWeight: 800 }}>⚠️ Active Incident / Lane Disruption</span>
            <span className="incident-banner-speed-tag">Speed Penalty: {incidentOnActiveRoute.speedPenalty} km/h (Limit: {incidentOnActiveRoute.speedLimit} km/h)</span>
          </div>
          <div className="incident-banner-body">
            <strong>{incidentOnActiveRoute.name}</strong> • Reason: {incidentOnActiveRoute.reason}
          </div>
        </div>
      )}

      {/* Navigation HUD Overlay (Active during Turn-by-Turn Guidance) */}
      {isNavigating && activeRoute && (
        <NavigationHUD
          route={activeRoute}
          activeManeuver={activeManeuver}
          maneuverIndex={maneuverIndex}
          totalManeuvers={totalManeuvers}
          distanceToManeuverMeters={distanceToManeuverMeters}
          remainingDistanceKm={remainingDistanceKm}
          remainingTimeMins={remainingTimeMins}
          isOffRoute={isOffRoute}
          offRouteDistanceMeters={offRouteDistanceMeters}
          gpsPosition={gpsPosition || null}
          gpsStatus={gpsStatus}
          onExitNavigation={onExitNavigation || (() => {})}
          onRecalculateRoute={onRecalculateRoute || (() => {})}
          onNextManeuver={onNextManeuver || (() => {})}
          onPrevManeuver={onPrevManeuver || (() => {})}
          onCenterMap={handleCenterOnUser}
          vehicleMode={vehicleMode}
        />
      )}

      {/* Top Left Floating Badges */}
      {!isNavigating && (
        <div style={{
          position: 'absolute',
          top: '0.85rem',
          left: '0.85rem',
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          flexWrap: 'wrap'
        }}>
          <div className="map-badge">
            <span className="status-chip-dot green"></span>
            <span>OpenStreetMap ({mapStyle === 'dark' ? 'Stadia Tiles' : 'Standard'})</span>
          </div>
          <div className="map-badge">
            <span>Road Layer</span>
          </div>
          <div className="map-badge">
            <span>Traffic (Simulated)</span>
            <span className="simulated-badge">SIMULATED</span>
          </div>
        </div>
      )}

      {/* Top Right: Layer Toggle Button */}
      {!isNavigating && (
        <div style={{
          position: 'absolute',
          top: '0.85rem',
          right: '0.85rem',
          zIndex: 10
        }}>
          <button
            onClick={() => setMapStyle(prev => prev === 'dark' ? 'osm' : 'dark')}
            className="map-control-btn"
            title="Toggle Map Style (Dark / OSM)"
          >
            <Layers size={16} color="#38bdf8" />
          </button>
        </div>
      )}

      {/* Right Edge: Floating Map Action Controls */}
      {!isNavigating && (
        <div style={{
          position: 'absolute',
          right: '0.85rem',
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          gap: '6px'
        }}>
          {/* Compass / Orientation */}
          <button
            onClick={handleFitRoute}
            className="map-control-btn"
            title="Orient North / Reset Bearing"
          >
            <Compass size={16} color="#38bdf8" />
          </button>

          {/* Recenter / Locate Me */}
          <button
            onClick={handleCenterOnUser}
            className="map-control-btn"
            title={gpsPosition ? "Center on My Location" : "Acquire GPS Location"}
            style={{ color: isGpsTracking ? '#4ade80' : '#cbd5e1' }}
          >
            <Locate size={16} />
          </button>

          {/* Zoom In */}
          <button
            onClick={() => mapInstanceRef.current?.zoomIn()}
            className="map-control-btn"
            title="Zoom In"
            style={{ fontWeight: 700, fontSize: '15px' }}
          >
            +
          </button>

          {/* Zoom Out */}
          <button
            onClick={() => mapInstanceRef.current?.zoomOut()}
            className="map-control-btn"
            title="Zoom Out"
            style={{ fontWeight: 700, fontSize: '15px' }}
          >
            −
          </button>

          {/* Layers Switcher */}
          <button
            onClick={() => setMapStyle(prev => prev === 'dark' ? 'osm' : 'dark')}
            className="map-control-btn"
            title="Switch Map Layers"
          >
            <Layers size={15} color="#94a3b8" />
          </button>
        </div>
      )}

      {/* Bottom Left: Scale Indicator */}
      {!isNavigating && (
        <div className="map-scale-indicator">
          <span>5 km</span>
          <div className="scale-line"></div>
        </div>
      )}

      {/* Bottom Center: Traffic Level & Route Legend */}
      {!isNavigating && (
        <div className="map-legend-sleek">
          <span className="legend-head">Traffic Level:</span>
          <span className="legend-pill-item">
            <span className="legend-dot green" />
            <span>Low</span>
          </span>
          <span className="legend-pill-item">
            <span className="legend-dot yellow" />
            <span>Moderate</span>
          </span>
          <span className="legend-pill-item">
            <span className="legend-dot orange" />
            <span>Heavy</span>
          </span>
          <span className="legend-pill-item">
            <span className="legend-dot red" />
            <span>Severe Jam</span>
          </span>
          <span className="legend-divider">|</span>
          <span className="legend-pill-item text-cyan">
            <span className="legend-quantum-line" />
            <span style={{ fontWeight: 700 }}>Quantum Route</span>
          </span>
        </div>
      )}

      {/* Selected Edge Detail Panel */}
      {selectedEdgeData && !isNavigating && (
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
                  if (onToggleIncident) onToggleIncident(selectedEdgeData.edgeId);
                  setSelectedEdgeData(null);
                }}
              >
                {selectedEdgeData.isIncident ? 'Clear Incident' : 'Simulate Accident / Roadblock'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Selected Traffic Signal Detail Panel (Live Real-Time Telemetry) */}
      {selectedSignal && !isNavigating && (
        <div style={{
          position: 'absolute',
          bottom: '1rem',
          right: '1rem',
          zIndex: 25,
          background: 'rgba(15, 23, 42, 0.96)',
          backdropFilter: 'blur(16px)',
          border: `1px solid ${selectedSignal.currentPhase === 'RED' ? 'rgba(239, 68, 68, 0.55)' : selectedSignal.currentPhase === 'YELLOW' ? 'rgba(245, 158, 11, 0.55)' : 'rgba(34, 197, 94, 0.55)'}`,
          borderRadius: '12px',
          padding: '1rem',
          fontSize: '0.8rem',
          minWidth: '290px',
          maxWidth: '340px',
          boxShadow: '0 16px 36px rgba(0,0,0,0.65)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '18px' }}>🚦</span>
              <span style={{ fontWeight: 700, color: '#f8fafc', fontSize: '0.88rem' }}>
                {selectedSignal.name}
              </span>
            </div>
            <button
              onClick={() => setSelectedSignal(null)}
              style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '1.1rem' }}
            >
              ✕
            </button>
          </div>

          {/* Traffic Light Visual Lamps & Live Phase Countdown */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(30, 41, 59, 0.8)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '8px',
            padding: '8px 12px',
            marginBottom: '0.75rem'
          }}>
            {/* Visual 3-light traffic pole */}
            <div style={{
              display: 'flex',
              gap: '6px',
              background: '#090d16',
              padding: '4px 8px',
              borderRadius: '20px',
              border: '1px solid rgba(255,255,255,0.1)'
            }}>
              <div style={{
                width: '14px',
                height: '14px',
                borderRadius: '50%',
                background: selectedSignal.currentPhase === 'RED' ? '#ef4444' : '#331010',
                boxShadow: selectedSignal.currentPhase === 'RED' ? '0 0 10px #ef4444' : 'none'
              }} />
              <div style={{
                width: '14px',
                height: '14px',
                borderRadius: '50%',
                background: selectedSignal.currentPhase === 'YELLOW' ? '#f59e0b' : '#332408',
                boxShadow: selectedSignal.currentPhase === 'YELLOW' ? '0 0 10px #f59e0b' : 'none'
              }} />
              <div style={{
                width: '14px',
                height: '14px',
                borderRadius: '50%',
                background: selectedSignal.currentPhase === 'GREEN' ? '#22c55e' : '#082914',
                boxShadow: selectedSignal.currentPhase === 'GREEN' ? '0 0 10px #22c55e' : 'none'
              }} />
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{
                color: selectedSignal.currentPhase === 'RED' ? '#ef4444' : selectedSignal.currentPhase === 'YELLOW' ? '#f59e0b' : '#22c55e',
                fontWeight: 800,
                fontSize: '0.85rem',
                textTransform: 'uppercase'
              }}>
                {selectedSignal.currentPhase} PHASE
              </div>
              <div style={{ color: '#f8fafc', fontFamily: 'monospace', fontWeight: 700, fontSize: '0.95rem' }}>
                {selectedSignal.timeRemainingSec}s remaining
              </div>
            </div>
          </div>

          {/* Time to Cross Highlight */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.15), rgba(168, 85, 247, 0.15))',
            border: '1px solid rgba(56, 189, 248, 0.35)',
            borderRadius: '8px',
            padding: '8px 10px',
            marginBottom: '0.75rem',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Time to Cross ({vehicleMode.toUpperCase()})
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#38bdf8' }}>
              {vehicleMode === 'bike' ? `${selectedSignal.bikeTimeToCrossSec} sec` : `${selectedSignal.timeToCrossMins} min`}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#cbd5e1' }}>
              Queue: <strong>{selectedSignal.queueLengthMeters}m</strong> ({selectedSignal.queueVehicles} vehicles in approach)
            </div>
          </div>

          {/* Breakdown for other vehicle types */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.72rem', color: '#cbd5e1' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 4px', background: vehicleMode === 'bike' ? 'rgba(34, 197, 94, 0.15)' : 'transparent', borderRadius: '4px' }}>
              <span>🏍️ Bike / 2-Wheeler:</span>
              <strong style={{ color: '#22c55e' }}>~{selectedSignal.bikeTimeToCrossSec}s (Lane filtering)</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 4px', background: vehicleMode === 'car' ? 'rgba(56, 189, 248, 0.15)' : 'transparent', borderRadius: '4px' }}>
              <span>🚗 Car / 4-Wheeler:</span>
              <strong style={{ color: '#f59e0b' }}>~{selectedSignal.carTimeToCrossMins} min (Standard queue)</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 4px', background: vehicleMode === 'heavy_vehicle' ? 'rgba(239, 68, 68, 0.15)' : 'transparent', borderRadius: '4px' }}>
              <span>🚚 Heavy Vehicle:</span>
              <strong style={{ color: '#ef4444' }}>~{selectedSignal.heavyTimeToCrossMins} min (Multi-cycle wait)</strong>
            </div>
          </div>

          <div style={{ marginTop: '0.6rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.08)', fontSize: '0.68rem', color: '#64748b', display: 'flex', justifyContent: 'space-between' }}>
            <span>Cycle: {selectedSignal.cycleLengthSec}s (R: {selectedSignal.redSec}s / G: {selectedSignal.greenSec}s)</span>
            <span>V/C: {selectedSignal.vcRatio}</span>
          </div>
        </div>
      )}
    </div>
  );
}
