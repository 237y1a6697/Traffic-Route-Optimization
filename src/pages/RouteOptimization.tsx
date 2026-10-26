import React, { useState, useEffect, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import { INDIA_LOCATIONS } from '../data/static/indiaGeoData';
import { geocodeLocation } from '../services/geocoding';
import { TrafficService } from '../services/traffic';
import { calculateAuthoritativeRoadRoutes } from '../services/routing';
import { RouteResult, VehicleMode, NavigationManeuver } from '../models/route';
import { GeographicLocation } from '../models/road';
import { OptimizationWeights } from '../models/algorithm';
import { useGpsTracker, GpsPosition } from '../hooks/useGpsTracker';
import { distanceInMeters, distanceToPolylineMeters, calculateRemainingDistanceKm } from '../services/navigation';

import { Sparkles } from 'lucide-react';
import RealMap from '../components/Map/RealMap';
import RouteTopSearchBar from '../components/RouteSearch/RouteTopSearchBar';
import RouteResultsPanel from '../components/RouteResults/RouteResultsPanel';
import BottomComparisonStrip from '../components/Dashboard/BottomComparisonStrip';
import RouteCompareModal from '../components/RouteResults/RouteCompareModal';
import MathDocModal from '../components/common/MathDocModal';
import TrafficScenarioModal from '../components/Traffic/TrafficScenarioModal';
import { getCurrentClockTime } from '../utils/timeUtils';

interface RouteOptimizationPageProps {
  trafficModel: TrafficService;
  trafficVersion: number;
  onTrafficModelChange: () => void;
  onOpenCompareModal?: () => void;
  isRoutePlannerOpen?: boolean;
  setIsRoutePlannerOpen?: (open: boolean) => void;
  onOpenMathDoc?: () => void;
}

export default function RouteOptimizationPage({
  trafficModel,
  trafficVersion,
  onTrafficModelChange,
  isRoutePlannerOpen = true,
  setIsRoutePlannerOpen,
  onOpenMathDoc
}: RouteOptimizationPageProps) {
  const [sourceQuery, setSourceQuery] = useState('Gachibowli, Hyderabad');
  const [destQuery, setDestQuery] = useState('Secunderabad, Hyderabad');
  const [sourceLoc, setSourceLoc] = useState<GeographicLocation | null>(
    INDIA_LOCATIONS.find(l => l.id === 'gachibowli') || null
  );
  const [destLoc, setDestLoc] = useState<GeographicLocation | null>(
    INDIA_LOCATIONS.find(l => l.id === 'secunderabad') || null
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSingleRouteLimited, setIsSingleRouteLimited] = useState<boolean>(false);

  // Vehicle Mode: car | bike | heavy_vehicle
  const [vehicleMode, setVehicleMode] = useState<VehicleMode>('car');
  // Accurate real current time for departure
  const [departureTime, setDepartureTime] = useState<string>(() => getCurrentClockTime());

  // Toggle state for Recommended Route Panel (Collapsible to expand map)
  const [isRecommendedRouteOpen, setIsRecommendedRouteOpen] = useState<boolean>(isRoutePlannerOpen);

  useEffect(() => {
    setIsRecommendedRouteOpen(isRoutePlannerOpen);
  }, [isRoutePlannerOpen]);

  // Multi-Objective Optimization Weights
  const [weights, setWeights] = useState<OptimizationWeights>({
    timeWeight: 0.35,
    congestionWeight: 0.30,
    distanceWeight: 0.15,
    fuelWeight: 0.10,
    emissionsWeight: 0.10
  });

  const [recommendedRoute, setRecommendedRoute] = useState<RouteResult | null>(null);
  const [alternativeRoutes, setAlternativeRoutes] = useState<RouteResult[]>([]);
  const [activeSelectedRouteKey, setActiveSelectedRouteKey] = useState<string>('QGA');
  const [isOptimizing, setIsOptimizing] = useState<boolean>(false);

  // Modals state
  const [isCompareModalOpen, setIsCompareModalOpen] = useState<boolean>(false);
  const [isMathDocOpenLocal, setIsMathDocOpenLocal] = useState<boolean>(false);
  const [isScenarioModalOpen, setIsScenarioModalOpen] = useState<boolean>(false);

  // Map Select Mode: 'origin' | 'destination' | null
  const [mapSelectMode, setMapSelectMode] = useState<'origin' | 'destination' | null>(null);

  // Live GPS Tracker
  const gpsTracker = useGpsTracker();

  // Navigation Mode States
  const [isNavigating, setIsNavigating] = useState<boolean>(false);
  const [activeManeuverIndex, setActiveManeuverIndex] = useState<number>(0);
  const [isOffRoute, setIsOffRoute] = useState<boolean>(false);
  const [offRouteDistanceMeters, setOffRouteDistanceMeters] = useState<number>(0);

  // Simulated GPS drive position for desktop/viva demonstration
  const [simulatedGpsPos, setSimulatedGpsPos] = useState<GpsPosition | null>(null);
  const simDriveIntervalRef = useRef<number | null>(null);

  // Request counter to avoid stale responses
  const requestIdRef = useRef<number>(0);

  const handleRunOptimization = useCallback(async (customSource?: GeographicLocation) => {
    setErrorMsg(null);

    const currentReqId = ++requestIdRef.current;
    setIsOptimizing(true);

    try {
      const trimmedSource = sourceQuery.trim();
      const trimmedDest = destQuery.trim();

      if (!trimmedSource || !trimmedDest) {
        setErrorMsg('Please enter both origin and destination locations.');
        setIsOptimizing(false);
        return;
      }

      // 1. Resolve Origin (GPS coordinates vs Place Name)
      let startResult: GeographicLocation;
      if (customSource) {
        startResult = customSource;
        setSourceLoc(customSource);
        setSourceQuery(customSource.shortName);
      } else if (
        sourceLoc &&
        (trimmedSource.toLowerCase().includes('location') ||
          trimmedSource.toLowerCase().includes('gps') ||
          sourceLoc.shortName.toLowerCase() === trimmedSource.toLowerCase() ||
          sourceLoc.name.toLowerCase() === trimmedSource.toLowerCase())
      ) {
        startResult = sourceLoc;
      } else {
        const geoSource = await geocodeLocation(trimmedSource);
        if (currentReqId !== requestIdRef.current) return;
        if (!geoSource.success || !geoSource.results || geoSource.results.length === 0) {
          setErrorMsg(geoSource.error || `Could not find location "${trimmedSource}".`);
          setIsOptimizing(false);
          return;
        }
        startResult = geoSource.results[0];
        setSourceLoc(startResult);
      }

      // 2. Resolve Destination (Check matching destLoc vs Geocoding)
      let endResult: GeographicLocation;
      if (
        destLoc &&
        (destLoc.shortName.toLowerCase() === trimmedDest.toLowerCase() ||
          destLoc.name.toLowerCase() === trimmedDest.toLowerCase())
      ) {
        endResult = destLoc;
      } else {
        const geoDest = await geocodeLocation(trimmedDest);
        if (currentReqId !== requestIdRef.current) return;
        if (!geoDest.success || !geoDest.results || geoDest.results.length === 0) {
          setErrorMsg(geoDest.error || `Could not find location "${trimmedDest}".`);
          setIsOptimizing(false);
          return;
        }
        endResult = geoDest.results[0];
        setDestLoc(endResult);
      }

      // 3. Prevent duplicate same-spot calculation
      const dLat = Math.abs(startResult.lat - endResult.lat);
      const dLng = Math.abs(startResult.lng - endResult.lng);
      if (dLat < 0.0005 && dLng < 0.0005) {
        setErrorMsg('Origin and Destination are at the exact same coordinates.');
        setIsOptimizing(false);
        return;
      }

      // Calculate authoritative road routes using Stadia Valhalla / OSRM and QGA
      const {
        recommendedRoute: qgaResult,
        alternativeRoutes: allRoutes,
        isSingleRouteLimited: singleLimited
      } = await calculateAuthoritativeRoadRoutes(
        startResult,
        endResult,
        trafficModel,
        weights,
        vehicleMode,
        departureTime
      );

      if (currentReqId !== requestIdRef.current) return;

      setRecommendedRoute(qgaResult);
      setAlternativeRoutes(allRoutes);
      setIsSingleRouteLimited(singleLimited);
      setActiveSelectedRouteKey('QGA');
      setActiveManeuverIndex(0);
      setIsOffRoute(false);

      // Celebration confetti for optimal Pareto route
      confetti({
        particleCount: 25,
        spread: 45,
        origin: { y: 0.8 },
        colors: ['#06b6d4', '#a855f7', '#38bdf8']
      });
    } catch (err: any) {
      if (currentReqId === requestIdRef.current) {
        console.error('Route calculation error:', err);
        setErrorMsg(err.message || 'Failed to calculate route. Please try another destination.');
      }
    } finally {
      if (currentReqId === requestIdRef.current) {
        setIsOptimizing(false);
      }
    }
  }, [sourceQuery, destQuery, destLoc, trafficModel, weights, vehicleMode, departureTime]);

  // Initial and reactive optimization on traffic, weight, or vehicle mode changes
  useEffect(() => {
    handleRunOptimization();
  }, [trafficVersion, weights, vehicleMode]);

  // Active Route Reference
  const activeRoute = alternativeRoutes.find(r => r.algorithm === activeSelectedRouteKey) || recommendedRoute;
  const maneuvers: NavigationManeuver[] = activeRoute?.maneuvers || [];
  const activeManeuver: NavigationManeuver | null = maneuvers[activeManeuverIndex] || null;

  // Active GPS position: device GPS or simulated drive GPS
  const currentEffectiveGps: GpsPosition | null = gpsTracker.position || simulatedGpsPos;

  // Handle One-Click Current GPS Location for Origin
  const handleUseCurrentLocationAsOrigin = useCallback(() => {
    if (gpsTracker.position) {
      const orig: GeographicLocation = {
        id: 'current_gps_origin',
        name: `Your Location (${gpsTracker.position.lat.toFixed(4)}, ${gpsTracker.position.lng.toFixed(4)})`,
        shortName: 'Your Location (GPS)',
        type: 'GPS Location',
        lat: gpsTracker.position.lat,
        lng: gpsTracker.position.lng,
        keywords: ['current', 'gps', 'origin']
      };
      setSourceLoc(orig);
      setSourceQuery(orig.shortName);
      if (destLoc) {
        handleRunOptimization(orig);
      }
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const orig: GeographicLocation = {
            id: 'current_gps_origin',
            name: `Your Location (${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)})`,
            shortName: 'Your Location (GPS)',
            type: 'GPS Location',
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            keywords: ['current', 'gps', 'origin']
          };
          setSourceLoc(orig);
          setSourceQuery(orig.shortName);
          if (destLoc) {
            handleRunOptimization(orig);
          }
        },
        (err) => {
          console.warn('Geolocation error:', err);
          setErrorMsg('Could not acquire GPS position. Please check browser permissions.');
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    }
  }, [destLoc, gpsTracker.position, handleRunOptimization]);

  // Handle Map Click for Coordinate Selection
  const handleMapClick = useCallback((lat: number, lng: number) => {
    if (!mapSelectMode) return;

    const clickedLoc: GeographicLocation = {
      id: `map_click_${Date.now()}`,
      name: `Selected Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
      shortName: `${lat.toFixed(3)}, ${lng.toFixed(3)}`,
      type: 'Selected Point',
      lat,
      lng,
      keywords: ['custom', 'clicked']
    };

    if (mapSelectMode === 'origin') {
      setSourceLoc(clickedLoc);
      setSourceQuery(clickedLoc.shortName);
      setMapSelectMode(null);
      if (destLoc) {
        handleRunOptimization(clickedLoc);
      }
    } else if (mapSelectMode === 'destination') {
      setDestLoc(clickedLoc);
      setDestQuery(clickedLoc.shortName);
      setMapSelectMode(null);
      if (sourceLoc) {
        calculateAuthoritativeRoadRoutes(sourceLoc, clickedLoc, trafficModel, weights, vehicleMode, departureTime)
          .then(({ recommendedRoute: qga, alternativeRoutes: alts, isSingleRouteLimited: sLim }) => {
            setRecommendedRoute(qga);
            setAlternativeRoutes(alts);
            setIsSingleRouteLimited(sLim);
            setActiveSelectedRouteKey('QGA');
          })
          .catch(err => {
            console.error('Routing failed for map coordinates:', err);
            setErrorMsg('Unable to route between clicked coordinates.');
          });
      }
    }
  }, [mapSelectMode, sourceLoc, destLoc, trafficModel, weights, vehicleMode, departureTime, handleRunOptimization]);

  // Handle Swap Origin and Destination
  const handleSwapLocations = () => {
    const tempQ = sourceQuery;
    setSourceQuery(destQuery);
    setDestQuery(tempQ);

    const tempLoc = sourceLoc;
    setSourceLoc(destLoc);
    setDestLoc(tempLoc);

    if (destLoc) {
      handleRunOptimization(destLoc);
    }
  };

  // Handle Quick Route Demonstration Choice
  const handleSelectQuickRoute = (src: string, dest: string) => {
    setSourceQuery(src);
    setDestQuery(dest);
    const sFound = INDIA_LOCATIONS.find(l => l.shortName.toLowerCase() === src.toLowerCase() || l.name.toLowerCase().includes(src.toLowerCase())) || null;
    const dFound = INDIA_LOCATIONS.find(l => l.shortName.toLowerCase() === dest.toLowerCase() || l.name.toLowerCase().includes(dest.toLowerCase())) || null;
    setSourceLoc(sFound);
    setDestLoc(dFound);
    setTimeout(() => {
      handleRunOptimization();
    }, 50);
  };

  // Handle direct suggestion clicks from top search bar
  const handleSelectSourceFromSearch = useCallback((loc: GeographicLocation) => {
    setSourceLoc(loc);
    setSourceQuery(loc.shortName);
    setTimeout(() => {
      handleRunOptimization(loc);
    }, 50);
  }, [handleRunOptimization]);

  const handleSelectDestFromSearch = useCallback((loc: GeographicLocation) => {
    setDestLoc(loc);
    setDestQuery(loc.shortName);
    setTimeout(() => {
      handleRunOptimization();
    }, 50);
  }, [handleRunOptimization]);

  // Start Navigation Mode
  const handleStartNavigation = () => {
    if (!activeRoute || !activeRoute.polylineCoords || activeRoute.polylineCoords.length < 2) {
      setErrorMsg('Cannot start navigation without a calculated route.');
      return;
    }

    setIsNavigating(true);
    setActiveManeuverIndex(0);
    setIsOffRoute(false);

    if (gpsTracker.status !== 'active') {
      gpsTracker.startTracking();
    }

    if (simDriveIntervalRef.current) {
      clearInterval(simDriveIntervalRef.current);
    }

    const poly = activeRoute.polylineCoords;
    let stepIndex = 0;
    const totalSteps = poly.length;

    simDriveIntervalRef.current = window.setInterval(() => {
      if (stepIndex >= totalSteps) {
        if (simDriveIntervalRef.current) clearInterval(simDriveIntervalRef.current);
        return;
      }
      const coord = poly[stepIndex];
      setSimulatedGpsPos({
        lat: coord[0],
        lng: coord[1],
        accuracy: 5,
        speed: (activeRoute.vehicleMode === 'bike' ? 45 : 60) + (Math.random() * 6 - 3),
        heading: 90,
        altitude: null,
        timestamp: Date.now()
      });
      stepIndex = Math.min(totalSteps - 1, stepIndex + 1);
    }, 2000);
  };

  // Exit Navigation Mode
  const handleExitNavigation = () => {
    setIsNavigating(false);
    if (simDriveIntervalRef.current) {
      clearInterval(simDriveIntervalRef.current);
      simDriveIntervalRef.current = null;
    }
    setSimulatedGpsPos(null);
  };

  // Turn Maneuver and Off-Route Detection
  useEffect(() => {
    if (!isNavigating || !currentEffectiveGps || !activeRoute || maneuvers.length === 0) return;

    if (activeManeuver) {
      const dMeters = distanceInMeters(
        currentEffectiveGps.lat,
        currentEffectiveGps.lng,
        activeManeuver.location[0],
        activeManeuver.location[1]
      );

      if (dMeters < 35 && activeManeuverIndex < maneuvers.length - 1) {
        setActiveManeuverIndex(idx => idx + 1);
      }
    }

    if (activeRoute.polylineCoords && activeRoute.polylineCoords.length >= 2) {
      const distResult = distanceToPolylineMeters(
        currentEffectiveGps.lat,
        currentEffectiveGps.lng,
        activeRoute.polylineCoords
      );
      setOffRouteDistanceMeters(distResult.minDistanceMeters);
      if (distResult.minDistanceMeters > 75) {
        setIsOffRoute(true);
      } else {
        setIsOffRoute(false);
      }
    }
  }, [isNavigating, currentEffectiveGps, activeManeuver, activeManeuverIndex, activeRoute, maneuvers.length]);

  // Recalculate Route from Current Position
  const handleRecalculateRoute = () => {
    if (!currentEffectiveGps || !destLoc) return;
    const currentLoc: GeographicLocation = {
      id: `current_reroute_${Date.now()}`,
      name: `Reroute Position (${currentEffectiveGps.lat.toFixed(4)}, ${currentEffectiveGps.lng.toFixed(4)})`,
      shortName: 'Reroute GPS',
      type: 'GPS Location',
      lat: currentEffectiveGps.lat,
      lng: currentEffectiveGps.lng,
      keywords: ['reroute']
    };
    handleRunOptimization(currentLoc);
  };

  // Distance to Next Turn & Remaining Trip Metrics
  let distanceToManeuverMeters: number | null = null;
  if (activeManeuver && currentEffectiveGps) {
    distanceToManeuverMeters = Math.round(
      distanceInMeters(
        currentEffectiveGps.lat,
        currentEffectiveGps.lng,
        activeManeuver.location[0],
        activeManeuver.location[1]
      )
    );
  }

  const remainingDistanceKm = (activeRoute && currentEffectiveGps)
    ? calculateRemainingDistanceKm(
        currentEffectiveGps.lat,
        currentEffectiveGps.lng,
        activeRoute.polylineCoords,
        0
      )
    : (activeRoute?.distanceKm || 0);

  const remainingTimeMins = (activeRoute && activeRoute.distanceKm > 0)
    ? Math.max(1, Math.round((remainingDistanceKm / activeRoute.distanceKm) * activeRoute.travelTimeMins * 10) / 10)
    : (activeRoute?.travelTimeMins || 0);

  // Toggle Traffic Incident on Map
  const handleToggleIncident = (edgeId: string) => {
    trafficModel.toggleIncident(edgeId);
    onTrafficModelChange();
  };

  return (
    <div className="dashboard-container">
      {/* 1. PERMANENT TOP SEARCH & NAVIGATION HEADER */}
      <RouteTopSearchBar
        sourceQuery={sourceQuery}
        setSourceQuery={setSourceQuery}
        destQuery={destQuery}
        setDestQuery={setDestQuery}
        onSelectSource={handleSelectSourceFromSearch}
        onSelectDest={handleSelectDestFromSearch}
        onSwapLocations={handleSwapLocations}
        onRunOptimization={() => handleRunOptimization()}
        isOptimizing={isOptimizing}
        vehicleMode={vehicleMode}
        setVehicleMode={setVehicleMode}
        departureTime={departureTime}
        setDepartureTime={setDepartureTime}
        onUseCurrentLocation={handleUseCurrentLocationAsOrigin}
        mapSelectMode={mapSelectMode}
        setMapSelectMode={setMapSelectMode}
        isRecommendedRouteOpen={isRecommendedRouteOpen}
        onToggleRecommendedRoute={() => {
          setIsRecommendedRouteOpen(prev => {
            const next = !prev;
            if (setIsRoutePlannerOpen) setIsRoutePlannerOpen(next);
            return next;
          });
        }}
        etaMins={activeRoute?.travelTimeMins}
        onStartNavigation={handleStartNavigation}
        isNavigating={isNavigating}
      />

      {/* MAIN DASHBOARD LAYOUT: Center (Map + Bottom Strip) and Right (Collapsible Recommendation Panel) */}
      <main className={`dashboard-main-area ${!isRecommendedRouteOpen ? 'expanded-full-map' : ''}`}>
        {/* CENTER COLUMN: Central Interactive Map + Bottom Comparison Strip */}
        <div className="center-map-column">
          {/* MAP CANVAS CONTAINER */}
          <div className="map-canvas-wrapper">
            {/* Single corridor info badge */}
            {isSingleRouteLimited && !isNavigating && (
              <div className="single-corridor-badge">
                <span>ℹ️</span>
                <span>Single direct road corridor available for these coordinates.</span>
              </div>
            )}

            {/* Coordinate picking banner */}
            {mapSelectMode && (
              <div className="map-picker-banner">
                <span>📍</span>
                <span>Click anywhere on the map to set {mapSelectMode === 'origin' ? 'Origin' : 'Destination'}</span>
              </div>
            )}

            {/* Real Interactive Leaflet Map */}
            <RealMap
              sourceLoc={sourceLoc}
              destLoc={destLoc}
              recommendedRoute={recommendedRoute}
              alternativeRoutes={alternativeRoutes}
              activeSelectedRouteKey={activeSelectedRouteKey}
              setActiveSelectedRouteKey={setActiveSelectedRouteKey}
              trafficModel={trafficModel}
              onToggleIncident={handleToggleIncident}
              gpsPosition={currentEffectiveGps}
              gpsStatus={gpsTracker.status}
              gpsErrorMsg={gpsTracker.errorMsg}
              isGpsTracking={gpsTracker.isTracking || isNavigating}
              onToggleGpsTracking={gpsTracker.toggleTracking}
              isNavigating={isNavigating}
              activeManeuver={activeManeuver}
              maneuverIndex={activeManeuverIndex}
              totalManeuvers={maneuvers.length}
              distanceToManeuverMeters={distanceToManeuverMeters}
              remainingDistanceKm={remainingDistanceKm}
              remainingTimeMins={remainingTimeMins}
              isOffRoute={isOffRoute}
              offRouteDistanceMeters={offRouteDistanceMeters}
              onExitNavigation={handleExitNavigation}
              onRecalculateRoute={handleRecalculateRoute}
              onNextManeuver={() => setActiveManeuverIndex(idx => Math.min(maneuvers.length - 1, idx + 1))}
              onPrevManeuver={() => setActiveManeuverIndex(idx => Math.max(0, idx - 1))}
              vehicleMode={vehicleMode}
              onMapClick={handleMapClick}
              mapSelectMode={mapSelectMode}
            />
          </div>

          {/* BOTTOM ROUTE COMPARISON STRIP (Directly below central map) */}
          <BottomComparisonStrip
            recommendedRoute={recommendedRoute}
            alternativeRoutes={alternativeRoutes}
            activeSelectedRouteKey={activeSelectedRouteKey}
            setActiveSelectedRouteKey={setActiveSelectedRouteKey}
            trafficModel={trafficModel}
            onOpenCompareModal={() => setIsCompareModalOpen(true)}
            onOpenMathDoc={() => {
              if (onOpenMathDoc) onOpenMathDoc();
              else setIsMathDocOpenLocal(true);
            }}
            onOpenScenarioModal={() => setIsScenarioModalOpen(true)}
          />
        </div>

        {/* RIGHT COLUMN: Collapsible Recommendation Panel & Alternative Routes */}
        {isRecommendedRouteOpen && (
          <aside className="right-recommendation-column">
            <RouteResultsPanel
              recommendedRoute={recommendedRoute}
              alternativeRoutes={alternativeRoutes}
              activeSelectedRouteKey={activeSelectedRouteKey}
              setActiveSelectedRouteKey={setActiveSelectedRouteKey}
              onOpenCompareModal={() => setIsCompareModalOpen(true)}
              isOptimizing={isOptimizing}
              onStartNavigation={handleStartNavigation}
              isNavigating={isNavigating}
              vehicleMode={vehicleMode}
              departureTime={departureTime}
              onClose={() => {
                setIsRecommendedRouteOpen(false);
                if (setIsRoutePlannerOpen) setIsRoutePlannerOpen(false);
              }}
            />
          </aside>
        )}
      </main>

      {/* Compare Modal */}
      <RouteCompareModal
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        routes={alternativeRoutes}
        sourceLoc={sourceLoc}
        destLoc={destLoc}
      />

      {/* Mathematical Formulations Modal */}
      <MathDocModal
        isOpen={isMathDocOpenLocal}
        onClose={() => setIsMathDocOpenLocal(false)}
      />

      {/* Traffic Scenario Calibration Modal */}
      <TrafficScenarioModal
        isOpen={isScenarioModalOpen}
        onClose={() => setIsScenarioModalOpen(false)}
        trafficModel={trafficModel}
        onTrafficModelChange={onTrafficModelChange}
      />
    </div>
  );
}
