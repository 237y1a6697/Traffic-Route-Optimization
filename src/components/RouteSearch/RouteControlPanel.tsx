import React, { useState } from 'react';
import { 
  Navigation, MapPin, ArrowUpDown, Sparkles, 
  Car, Bike, Truck, X, Bookmark, FileSpreadsheet, Printer,
  MousePointer, AlertTriangle, ChevronRight, Locate
} from 'lucide-react';
import { HYDERABAD_LOCATIONS } from '../../data/static/hyderabadGeoData';
import { GeographicLocation } from '../../models/road';
import { OptimizationWeights } from '../../models/algorithm';
import { VehicleMode, RouteResult } from '../../models/route';
import { TrafficService } from '../../services/traffic';
import { VEHICLE_CONFIGS } from '../../services/routing';

export type PlanningTab = 'directions' | 'map_select' | 'saved';
export type RoutePreference = 'fastest' | 'shortest' | 'less_congestion' | 'lower_emissions';

interface RouteControlPanelProps {
  sourceQuery: string;
  setSourceQuery: (val: string) => void;
  destQuery: string;
  setDestQuery: (val: string) => void;
  onSwapLocations: () => void;
  onSelectQuickRoute: (src: string, dest: string) => void;
  onRunOptimization: () => void;
  isOptimizing: boolean;
  errorMsg: string | null;
  weights: OptimizationWeights;
  setWeights: React.Dispatch<React.SetStateAction<OptimizationWeights>>;
  trafficModel: TrafficService;
  onTrafficModelChange: () => void;
  onQuickIncidentToggle?: (edgeId: string) => void;
  onClearAllIncidents?: () => void;
  incidentCount?: number;

  // Vehicle Selection Props
  vehicleMode: VehicleMode;
  setVehicleMode: (mode: VehicleMode) => void;
  engineLimitation?: string | null;

  // Saved / Map selection props
  recommendedRoute?: RouteResult | null;
  alternativeRoutes?: RouteResult[];
  mapSelectMode?: 'origin' | 'destination' | null;
  setMapSelectMode?: (mode: 'origin' | 'destination' | null) => void;
  sourceLoc?: GeographicLocation | null;
  destLoc?: GeographicLocation | null;
  onUseCurrentLocation?: () => void;
}

interface SavedExperiment {
  id: string;
  date: string;
  origin: string;
  destination: string;
  vehicle: VehicleMode;
  travelTimeMins: number;
  distanceKm: number;
  score: number;
  co2Kg: number;
  fuelLitres: number;
}

export default function RouteControlPanel({
  sourceQuery,
  setSourceQuery,
  destQuery,
  setDestQuery,
  onSwapLocations,
  onSelectQuickRoute,
  onRunOptimization,
  isOptimizing,
  errorMsg,
  setWeights,
  vehicleMode,
  setVehicleMode,
  engineLimitation,
  recommendedRoute,
  alternativeRoutes = [],
  mapSelectMode,
  setMapSelectMode,
  sourceLoc,
  destLoc,
  onUseCurrentLocation
}: RouteControlPanelProps) {
  const [activeTab, setActiveTab] = useState<PlanningTab>('directions');
  const [routePreference, setRoutePreference] = useState<RoutePreference>('fastest');
  
  const [sourceSuggestions, setSourceSuggestions] = useState<GeographicLocation[]>([]);
  const [destSuggestions, setDestSuggestions] = useState<GeographicLocation[]>([]);
  const [showSourceDropdown, setShowSourceDropdown] = useState(false);
  const [showDestDropdown, setShowDestDropdown] = useState(false);

  // Saved experiments state (persisted to localStorage)
  const [savedExperiments, setSavedExperiments] = useState<SavedExperiment[]>(() => {
    try {
      const data = localStorage.getItem('traffic_saved_experiments');
      return data ? JSON.parse(data) : [];
    } catch (_) {
      return [];
    }
  });

  const filterSuggestions = (text: string) => {
    if (!text || text.trim().length === 0) return HYDERABAD_LOCATIONS.slice(0, 6);
    const q = text.toLowerCase();
    return HYDERABAD_LOCATIONS.filter(l => 
      l.name.toLowerCase().includes(q) || 
      l.shortName.toLowerCase().includes(q) ||
      l.keywords.some(k => k.includes(q))
    ).slice(0, 5);
  };

  const handleSourceChange = (val: string) => {
    setSourceQuery(val);
    setSourceSuggestions(filterSuggestions(val));
    setShowSourceDropdown(true);
  };

  const handleDestChange = (val: string) => {
    setDestQuery(val);
    setDestSuggestions(filterSuggestions(val));
    setShowDestDropdown(true);
  };

  // Preference change handler
  const handlePreferenceChange = (pref: RoutePreference) => {
    setRoutePreference(pref);
    if (pref === 'fastest') {
      setWeights({ timeWeight: 0.50, congestionWeight: 0.30, distanceWeight: 0.10, fuelWeight: 0.05, emissionsWeight: 0.05 });
    } else if (pref === 'shortest') {
      setWeights({ timeWeight: 0.15, congestionWeight: 0.10, distanceWeight: 0.65, fuelWeight: 0.05, emissionsWeight: 0.05 });
    } else if (pref === 'less_congestion') {
      setWeights({ timeWeight: 0.20, congestionWeight: 0.60, distanceWeight: 0.10, fuelWeight: 0.05, emissionsWeight: 0.05 });
    } else if (pref === 'lower_emissions') {
      setWeights({ timeWeight: 0.10, congestionWeight: 0.05, distanceWeight: 0.10, fuelWeight: 0.35, emissionsWeight: 0.40 });
    }
  };

  // Save current experiment
  const handleSaveCurrentExperiment = () => {
    if (!recommendedRoute) return;
    const newExp: SavedExperiment = {
      id: `exp_${Date.now()}`,
      date: new Date().toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      origin: sourceQuery,
      destination: destQuery,
      vehicle: vehicleMode,
      travelTimeMins: recommendedRoute.travelTimeMins,
      distanceKm: recommendedRoute.distanceKm,
      score: recommendedRoute.optimizationScore || 0.74,
      co2Kg: recommendedRoute.co2Kg,
      fuelLitres: recommendedRoute.fuelLitres
    };
    const updated = [newExp, ...savedExperiments.slice(0, 9)];
    setSavedExperiments(updated);
    try {
      localStorage.setItem('traffic_saved_experiments', JSON.stringify(updated));
    } catch (_) {}
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Origin', 'Destination', 'Vehicle', 'Travel Time (min)', 'Distance (km)', 'Fuel (L)', 'CO2 (kg)', 'Optimization Score'];
    const rows = [headers.join(',')];

    if (recommendedRoute) {
      rows.push([
        `"${sourceQuery}"`,
        `"${destQuery}"`,
        `"${vehicleMode}"`,
        recommendedRoute.travelTimeMins,
        recommendedRoute.distanceKm,
        recommendedRoute.fuelLitres,
        recommendedRoute.co2Kg,
        recommendedRoute.optimizationScore || 0.74
      ].join(','));
    }

    alternativeRoutes.forEach(r => {
      rows.push([
        `"${sourceQuery}"`,
        `"${destQuery}"`,
        `"${r.algorithmName || r.type}"`,
        r.travelTimeMins,
        r.distanceKm,
        r.fuelLitres,
        r.co2Kg,
        r.optimizationScore || 0.65
      ].join(','));
    });

    const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `traffic_route_${sourceQuery}_to_${destQuery}_${vehicleMode}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Print PDF
  const handlePrintReport = () => {
    window.print();
  };

  const normalizedMode = (vehicleMode === 'motorcycle' || vehicleMode === 'motor_scooter') ? 'bike' : vehicleMode;
  const currentVehicleConfig = VEHICLE_CONFIGS[normalizedMode] || VEHICLE_CONFIGS.car;

  return (
    <div className="sidebar-col">
      <div className="glass-panel control-card" style={{ padding: '1rem' }}>
        {/* Card Header */}
        <div className="card-title" style={{ marginBottom: '0.75rem' }}>
          <div className="card-title-icon" style={{ color: '#06b6d4' }}>
            <Navigation size={18} />
            <span style={{ fontSize: '1rem', fontWeight: 700 }}>Route Planning</span>
          </div>
        </div>

        {/* Top 3 Menu Options Bar */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '5px',
          background: 'rgba(15, 23, 42, 0.7)',
          padding: '4px',
          borderRadius: '10px',
          marginBottom: '1rem',
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <button
            onClick={() => {
              setActiveTab('directions');
              if (setMapSelectMode) setMapSelectMode(null);
            }}
            style={{
              padding: '0.5rem 0.2rem',
              borderRadius: '7px',
              border: 'none',
              background: activeTab === 'directions' ? 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)' : 'transparent',
              color: activeTab === 'directions' ? '#ffffff' : '#94a3b8',
              fontWeight: 700,
              fontSize: '0.75rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              transition: 'all 0.2s',
              boxShadow: activeTab === 'directions' ? '0 2px 8px rgba(2, 132, 199, 0.4)' : 'none'
            }}
          >
            <Navigation size={12} />
            <span>Directions</span>
          </button>

          <button
            onClick={() => setActiveTab('map_select')}
            style={{
              padding: '0.5rem 0.2rem',
              borderRadius: '7px',
              border: 'none',
              background: activeTab === 'map_select' ? 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)' : 'transparent',
              color: activeTab === 'map_select' ? '#ffffff' : '#94a3b8',
              fontWeight: 700,
              fontSize: '0.75rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              transition: 'all 0.2s',
              boxShadow: activeTab === 'map_select' ? '0 2px 8px rgba(2, 132, 199, 0.4)' : 'none'
            }}
          >
            <MousePointer size={12} />
            <span>Map Select</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('saved');
              if (setMapSelectMode) setMapSelectMode(null);
            }}
            style={{
              padding: '0.5rem 0.2rem',
              borderRadius: '7px',
              border: 'none',
              background: activeTab === 'saved' ? 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)' : 'transparent',
              color: activeTab === 'saved' ? '#ffffff' : '#94a3b8',
              fontWeight: 700,
              fontSize: '0.75rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              transition: 'all 0.2s',
              boxShadow: activeTab === 'saved' ? '0 2px 8px rgba(2, 132, 199, 0.4)' : 'none'
            }}
          >
            <Bookmark size={12} />
            <span>Saved</span>
          </button>
        </div>

        {/* TAB 1: DIRECTIONS (From & To with Google Maps-style selectors) */}
        {activeTab === 'directions' && (
          <>
            {/* FROM (Origin) Field */}
            <div className="control-group" style={{ position: 'relative', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                <label className="control-label" style={{ fontSize: '0.72rem', color: '#22c55e', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <MapPin size={12} color="#22c55e" />
                  <span style={{ fontWeight: 700 }}>FROM (Origin)</span>
                </label>
                {sourceLoc?.type === 'GPS Location' && (
                  <span style={{ fontSize: '0.65rem', color: '#4ade80', background: 'rgba(34, 197, 94, 0.15)', padding: '1px 6px', borderRadius: '4px' }}>
                    ● GPS Active
                  </span>
                )}
              </div>

              {/* Type Location Input */}
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="input-field"
                  value={sourceQuery}
                  onChange={(e) => handleSourceChange(e.target.value)}
                  onFocus={() => {
                    setSourceSuggestions(filterSuggestions(sourceQuery));
                    setShowSourceDropdown(true);
                  }}
                  onBlur={() => setTimeout(() => setShowSourceDropdown(false), 200)}
                  placeholder="Type origin or landmark..."
                  style={{ paddingRight: '2rem' }}
                />
                {sourceQuery && (
                  <button
                    onClick={() => setSourceQuery('')}
                    style={{
                      position: 'absolute',
                      right: '8px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'transparent',
                      border: 'none',
                      color: '#64748b',
                      cursor: 'pointer'
                    }}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Google Maps-style Selective Options for FROM */}
              <div style={{ display: 'flex', gap: '6px', marginTop: '0.35rem' }}>
                <button
                  type="button"
                  onClick={() => onUseCurrentLocation && onUseCurrentLocation()}
                  style={{
                    padding: '3px 8px',
                    borderRadius: '5px',
                    background: 'rgba(34, 197, 94, 0.12)',
                    border: '1px solid rgba(34, 197, 94, 0.3)',
                    color: '#4ade80',
                    fontSize: '0.68rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    transition: 'all 0.15s ease'
                  }}
                  title="Use live GPS or current location"
                >
                  <Locate size={11} />
                  <span>Your Location</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMapSelectMode && setMapSelectMode(mapSelectMode === 'origin' ? null : 'origin')}
                  style={{
                    padding: '3px 8px',
                    borderRadius: '5px',
                    background: mapSelectMode === 'origin' ? 'rgba(34, 197, 94, 0.25)' : 'rgba(15, 23, 42, 0.6)',
                    border: `1px solid ${mapSelectMode === 'origin' ? '#22c55e' : 'rgba(255, 255, 255, 0.1)'}`,
                    color: mapSelectMode === 'origin' ? '#22c55e' : '#94a3b8',
                    fontSize: '0.68rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    transition: 'all 0.15s ease'
                  }}
                  title="Click directly on map to set Origin"
                >
                  <MousePointer size={11} />
                  <span>{mapSelectMode === 'origin' ? '● Clicking on Map...' : 'Choose on map'}</span>
                </button>
              </div>

              {/* Suggestions Dropdown */}
              {showSourceDropdown && sourceSuggestions.length > 0 && (
                <div className="autocomplete-dropdown">
                  {sourceSuggestions.map(loc => (
                    <div
                      key={loc.id}
                      className="autocomplete-item"
                      onMouseDown={() => {
                        setSourceQuery(loc.shortName);
                        setShowSourceDropdown(false);
                      }}
                    >
                      <MapPin size={12} color="#22c55e" style={{ flexShrink: 0 }} />
                      <div>
                        <div style={{ fontWeight: 600, color: '#f8fafc' }}>{loc.shortName}</div>
                        <div style={{ fontSize: '0.68rem', color: '#64748b' }}>{loc.name}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* TO (Destination) Field */}
            <div className="control-group" style={{ position: 'relative', marginBottom: '0.9rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                <label className="control-label" style={{ fontSize: '0.72rem', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <MapPin size={12} color="#ef4444" />
                  <span style={{ fontWeight: 700 }}>TO (Destination)</span>
                </label>
                <button
                  onClick={onSwapLocations}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#38bdf8',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '3px',
                    fontSize: '0.68rem',
                    padding: '1px 4px'
                  }}
                  title="Swap Origin and Destination"
                >
                  <ArrowUpDown size={11} />
                  <span>Swap</span>
                </button>
              </div>

              {/* Type Destination Input */}
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="input-field"
                  value={destQuery}
                  onChange={(e) => handleDestChange(e.target.value)}
                  onFocus={() => {
                    setDestSuggestions(filterSuggestions(destQuery));
                    setShowDestDropdown(true);
                  }}
                  onBlur={() => setTimeout(() => setShowDestDropdown(false), 200)}
                  placeholder="Type destination landmark..."
                  style={{ paddingRight: '2rem' }}
                />
                {destQuery && (
                  <button
                    onClick={() => setDestQuery('')}
                    style={{
                      position: 'absolute',
                      right: '8px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'transparent',
                      border: 'none',
                      color: '#64748b',
                      cursor: 'pointer'
                    }}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Google Maps-style Selective Options for TO */}
              <div style={{ display: 'flex', gap: '5px', marginTop: '0.35rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => setMapSelectMode && setMapSelectMode(mapSelectMode === 'destination' ? null : 'destination')}
                  style={{
                    padding: '3px 8px',
                    borderRadius: '5px',
                    background: mapSelectMode === 'destination' ? 'rgba(239, 68, 68, 0.25)' : 'rgba(15, 23, 42, 0.6)',
                    border: `1px solid ${mapSelectMode === 'destination' ? '#ef4444' : 'rgba(255, 255, 255, 0.1)'}`,
                    color: mapSelectMode === 'destination' ? '#ef4444' : '#94a3b8',
                    fontSize: '0.68rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    transition: 'all 0.15s ease'
                  }}
                  title="Click directly on map to set Destination"
                >
                  <MousePointer size={11} />
                  <span>{mapSelectMode === 'destination' ? '● Clicking on Map...' : 'Choose on map'}</span>
                </button>

                {/* Quick destination chips */}
                {['HITEC City', 'Secunderabad', 'Airport'].map(chip => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => setDestQuery(chip)}
                    style={{
                      padding: '3px 7px',
                      borderRadius: '5px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      color: '#94a3b8',
                      fontSize: '0.66rem',
                      cursor: 'pointer'
                    }}
                  >
                    {chip}
                  </button>
                ))}
              </div>

              {/* Suggestions Dropdown */}
              {showDestDropdown && destSuggestions.length > 0 && (
                <div className="autocomplete-dropdown">
                  {destSuggestions.map(loc => (
                    <div
                      key={loc.id}
                      className="autocomplete-item"
                      onMouseDown={() => {
                        setDestQuery(loc.shortName);
                        setShowDestDropdown(false);
                      }}
                    >
                      <MapPin size={12} color="#ef4444" style={{ flexShrink: 0 }} />
                      <div>
                        <div style={{ fontWeight: 600, color: '#f8fafc' }}>{loc.shortName}</div>
                        <div style={{ fontSize: '0.68rem', color: '#64748b' }}>{loc.name}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Vehicle Mode Categories: Bike, Car, Heavy Vehicle */}
            <div style={{ marginBottom: '0.9rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>Vehicle Category</span>
                <span style={{ fontSize: '0.65rem', color: '#06b6d4' }}>{currentVehicleConfig.tag}</span>
              </div>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '6px'
              }}>
                {/* 1. BIKE */}
                <button
                  type="button"
                  onClick={() => setVehicleMode('bike')}
                  style={{
                    padding: '0.5rem 0.25rem',
                    borderRadius: '8px',
                    border: `1px solid ${normalizedMode === 'bike' ? '#06b6d4' : 'rgba(255, 255, 255, 0.1)'}`,
                    background: normalizedMode === 'bike' ? 'rgba(6, 182, 212, 0.22)' : 'rgba(15, 23, 42, 0.6)',
                    color: normalizedMode === 'bike' ? '#22d3ee' : '#94a3b8',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '3px',
                    cursor: 'pointer',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    transition: 'all 0.15s ease'
                  }}
                >
                  <Bike size={16} />
                  <span>Bike</span>
                  <span style={{ fontSize: '0.6rem', color: normalizedMode === 'bike' ? '#67e8f9' : '#64748b', fontWeight: 400 }}>2-Wheeler</span>
                </button>

                {/* 2. CAR */}
                <button
                  type="button"
                  onClick={() => setVehicleMode('car')}
                  style={{
                    padding: '0.5rem 0.25rem',
                    borderRadius: '8px',
                    border: `1px solid ${normalizedMode === 'car' ? '#06b6d4' : 'rgba(255, 255, 255, 0.1)'}`,
                    background: normalizedMode === 'car' ? 'rgba(6, 182, 212, 0.22)' : 'rgba(15, 23, 42, 0.6)',
                    color: normalizedMode === 'car' ? '#22d3ee' : '#94a3b8',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '3px',
                    cursor: 'pointer',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    transition: 'all 0.15s ease'
                  }}
                >
                  <Car size={16} />
                  <span>Car</span>
                  <span style={{ fontSize: '0.6rem', color: normalizedMode === 'car' ? '#67e8f9' : '#64748b', fontWeight: 400 }}>4-Wheeler</span>
                </button>

                {/* 3. HEAVY VEHICLE */}
                <button
                  type="button"
                  onClick={() => setVehicleMode('heavy_vehicle')}
                  style={{
                    padding: '0.5rem 0.25rem',
                    borderRadius: '8px',
                    border: `1px solid ${normalizedMode === 'heavy_vehicle' ? '#06b6d4' : 'rgba(255, 255, 255, 0.1)'}`,
                    background: normalizedMode === 'heavy_vehicle' ? 'rgba(6, 182, 212, 0.22)' : 'rgba(15, 23, 42, 0.6)',
                    color: normalizedMode === 'heavy_vehicle' ? '#22d3ee' : '#94a3b8',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '3px',
                    cursor: 'pointer',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    transition: 'all 0.15s ease'
                  }}
                >
                  <Truck size={16} />
                  <span>Heavy</span>
                  <span style={{ fontSize: '0.6rem', color: normalizedMode === 'heavy_vehicle' ? '#67e8f9' : '#64748b', fontWeight: 400 }}>Truck / Bus</span>
                </button>
              </div>

              {/* Dynamic Vehicle Dynamics Spec Readout */}
              <div style={{
                marginTop: '0.4rem',
                padding: '0.35rem 0.55rem',
                borderRadius: '6px',
                background: 'rgba(6, 182, 212, 0.08)',
                border: '1px solid rgba(6, 182, 212, 0.2)',
                fontSize: '0.66rem',
                color: '#94a3b8',
                display: 'flex',
                justifyContent: 'space-between',
                lineHeight: 1.3
              }}>
                <span>Speed Cap: <strong style={{ color: '#f8fafc' }}>{currentVehicleConfig.maxSpeedKmh} km/h</strong></span>
                <span>Fuel: <strong style={{ color: '#f8fafc' }}>{currentVehicleConfig.fuelRateLPer100Km} L/100km</strong></span>
                <span>CO₂ Rate: <strong style={{ color: '#f8fafc' }}>{currentVehicleConfig.co2PerLitre} kg/L</strong></span>
              </div>
            </div>

            {/* Route Preference Radio Group */}
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginBottom: '0.35rem', fontWeight: 600 }}>
                Optimization Objective
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '6px'
              }}>
                {(['fastest', 'shortest', 'less_congestion', 'lower_emissions'] as RoutePreference[]).map(pref => {
                  const isChecked = routePreference === pref;
                  const label = 
                    pref === 'fastest' ? 'Fastest' :
                    pref === 'shortest' ? 'Shortest' :
                    pref === 'less_congestion' ? 'Less Congestion' : 'Lower Emissions';

                  return (
                    <label
                      key={pref}
                      onClick={() => handlePreferenceChange(pref)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '0.72rem',
                        color: isChecked ? '#f8fafc' : '#94a3b8',
                        cursor: 'pointer',
                        padding: '4px 6px',
                        borderRadius: '6px',
                        background: isChecked ? 'rgba(6, 182, 212, 0.15)' : 'transparent',
                        border: `1px solid ${isChecked ? 'rgba(6, 182, 212, 0.4)' : 'transparent'}`
                      }}
                    >
                      <input
                        type="radio"
                        name="routePreference"
                        checked={isChecked}
                        onChange={() => {}}
                        style={{ accentColor: '#06b6d4', cursor: 'pointer' }}
                      />
                      <span>{label}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div style={{
                marginBottom: '0.85rem',
                padding: '0.5rem 0.75rem',
                borderRadius: '8px',
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                color: '#fca5a5',
                fontSize: '0.72rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <AlertTriangle size={14} style={{ flexShrink: 0 }} />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Engine Limitation Note if applicable */}
            {engineLimitation && (
              <div style={{
                marginBottom: '0.85rem',
                padding: '0.4rem 0.65rem',
                borderRadius: '6px',
                background: 'rgba(234, 179, 8, 0.12)',
                border: '1px solid rgba(234, 179, 8, 0.3)',
                color: '#fef08a',
                fontSize: '0.67rem'
              }}>
                ℹ️ {engineLimitation}
              </div>
            )}

            {/* Big Gradient Optimize Route Button */}
            <button
              className="btn btn-primary"
              onClick={onRunOptimization}
              disabled={isOptimizing}
              style={{
                width: '100%',
                padding: '0.75rem',
                background: 'linear-gradient(135deg, #06b6d4 0%, #0284c7 100%)',
                border: 'none',
                borderRadius: '8px',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 18px rgba(6, 182, 212, 0.35)',
                cursor: isOptimizing ? 'not-allowed' : 'pointer',
                marginBottom: '1rem'
              }}
            >
              {isOptimizing ? (
                <>
                  <span className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }} />
                  <span>Optimizing Routes...</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>Optimize Route</span>
                </>
              )}
            </button>

            {/* Quick Demonstrations */}
            <div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginBottom: '0.45rem', fontWeight: 600 }}>
                Quick Demonstrations
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                {[
                  { src: 'Gachibowli', dest: 'Secunderabad' },
                  { src: 'HITEC City', dest: 'Banjara Hills' },
                  { src: 'Miyapur', dest: 'Charminar' },
                  { src: 'Balanagar', dest: 'Shamshabad' }
                ].map(pair => (
                  <button
                    key={`${pair.src}-${pair.dest}`}
                    onClick={() => onSelectQuickRoute(pair.src, pair.dest)}
                    style={{
                      textAlign: 'left',
                      padding: '0.45rem 0.65rem',
                      borderRadius: '6px',
                      background: 'rgba(15, 23, 42, 0.6)',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                      color: '#cbd5e1',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.borderColor = 'rgba(6, 182, 212, 0.4)';
                      (e.currentTarget as HTMLElement).style.background = 'rgba(6, 182, 212, 0.1)';
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255, 255, 255, 0.06)';
                      (e.currentTarget as HTMLElement).style.background = 'rgba(15, 23, 42, 0.6)';
                    }}
                  >
                    <span>{pair.src} → {pair.dest}</span>
                    <ChevronRight size={13} color="#64748b" />
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* TAB 2: CHOOSE FROM MAP (Interactive Map Pin Picker) */}
        {activeTab === 'map_select' && (
          <div style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>
            <div style={{
              background: 'rgba(15, 23, 42, 0.7)',
              border: '1px solid rgba(6, 182, 212, 0.3)',
              borderRadius: '8px',
              padding: '0.75rem',
              marginBottom: '0.85rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#38bdf8', fontWeight: 700, marginBottom: '0.35rem' }}>
                <MousePointer size={14} />
                <span>Interactive Map Coordinate Picker</span>
              </div>
              <p style={{ fontSize: '0.7rem', color: '#94a3b8', lineHeight: 1.4 }}>
                Choose endpoints directly by clicking on the map canvas, or pick from popular Hyderabad landmarks below.
              </p>
            </div>

            {/* Click on Map Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '1rem' }}>
              <button
                type="button"
                onClick={() => setMapSelectMode && setMapSelectMode(mapSelectMode === 'origin' ? null : 'origin')}
                style={{
                  padding: '0.65rem 0.75rem',
                  borderRadius: '8px',
                  border: `1px solid ${mapSelectMode === 'origin' ? '#22c55e' : 'rgba(255,255,255,0.1)'}`,
                  background: mapSelectMode === 'origin' ? 'rgba(34, 197, 94, 0.25)' : 'rgba(15, 23, 42, 0.6)',
                  color: mapSelectMode === 'origin' ? '#4ade80' : '#cbd5e1',
                  cursor: 'pointer',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxShadow: mapSelectMode === 'origin' ? '0 0 12px rgba(34, 197, 94, 0.3)' : 'none'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MapPin size={15} color="#22c55e" />
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '0.78rem', color: '#f8fafc' }}>
                      {mapSelectMode === 'origin' ? '● Clicking on Map...' : 'Click Map to Set Origin'}
                    </div>
                    <div style={{ fontSize: '0.66rem', color: '#94a3b8' }}>
                      Current: {sourceLoc ? sourceLoc.shortName : sourceQuery}
                    </div>
                  </div>
                </div>
                <span style={{ fontSize: '0.7rem', color: '#22c55e' }}>
                  {mapSelectMode === 'origin' ? 'Active' : 'Set'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setMapSelectMode && setMapSelectMode(mapSelectMode === 'destination' ? null : 'destination')}
                style={{
                  padding: '0.65rem 0.75rem',
                  borderRadius: '8px',
                  border: `1px solid ${mapSelectMode === 'destination' ? '#ef4444' : 'rgba(255,255,255,0.1)'}`,
                  background: mapSelectMode === 'destination' ? 'rgba(239, 68, 68, 0.25)' : 'rgba(15, 23, 42, 0.6)',
                  color: mapSelectMode === 'destination' ? '#f87171' : '#cbd5e1',
                  cursor: 'pointer',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxShadow: mapSelectMode === 'destination' ? '0 0 12px rgba(239, 68, 68, 0.3)' : 'none'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MapPin size={15} color="#ef4444" />
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '0.78rem', color: '#f8fafc' }}>
                      {mapSelectMode === 'destination' ? '● Clicking on Map...' : 'Click Map to Set Destination'}
                    </div>
                    <div style={{ fontSize: '0.66rem', color: '#94a3b8' }}>
                      Current: {destLoc ? destLoc.shortName : destQuery}
                    </div>
                  </div>
                </div>
                <span style={{ fontSize: '0.7rem', color: '#ef4444' }}>
                  {mapSelectMode === 'destination' ? 'Active' : 'Set'}
                </span>
              </button>
            </div>

            {/* Quick 1-Click Hyderabad Landmarks */}
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginBottom: '0.45rem', fontWeight: 600 }}>
                Popular Hyderabad Landmarks
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                {HYDERABAD_LOCATIONS.slice(0, 5).map(loc => (
                  <div
                    key={loc.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.4rem 0.6rem',
                      background: 'rgba(15, 23, 42, 0.6)',
                      borderRadius: '6px',
                      border: '1px solid rgba(255, 255, 255, 0.06)'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, color: '#f8fafc', fontSize: '0.74rem' }}>{loc.shortName}</div>
                      <div style={{ fontSize: '0.65rem', color: '#64748b' }}>{loc.lat.toFixed(3)}, {loc.lng.toFixed(3)}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button
                        onClick={() => {
                          setSourceQuery(loc.shortName);
                        }}
                        style={{
                          padding: '2px 6px',
                          borderRadius: '4px',
                          border: '1px solid rgba(34, 197, 94, 0.4)',
                          background: 'rgba(34, 197, 94, 0.15)',
                          color: '#4ade80',
                          fontSize: '0.64rem',
                          cursor: 'pointer'
                        }}
                      >
                        From
                      </button>
                      <button
                        onClick={() => {
                          setDestQuery(loc.shortName);
                        }}
                        style={{
                          padding: '2px 6px',
                          borderRadius: '4px',
                          border: '1px solid rgba(239, 68, 68, 0.4)',
                          background: 'rgba(239, 68, 68, 0.15)',
                          color: '#f87171',
                          fontSize: '0.64rem',
                          cursor: 'pointer'
                        }}
                      >
                        To
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              className="btn btn-primary"
              onClick={onRunOptimization}
              style={{ width: '100%', padding: '0.65rem' }}
            >
              <Sparkles size={14} />
              <span>Optimize Selected Coordinates</span>
            </button>
          </div>
        )}

        {/* TAB 3: SAVED EXPERIMENTS & EXPORTS */}
        {activeTab === 'saved' && (
          <div style={{ fontSize: '0.75rem' }}>
            <div style={{ display: 'flex', gap: '6px', marginBottom: '0.85rem' }}>
              <button
                onClick={handleSaveCurrentExperiment}
                disabled={!recommendedRoute}
                className="btn btn-outline"
                style={{ flex: 1, fontSize: '0.72rem', padding: '0.45rem' }}
              >
                <Bookmark size={13} color="#38bdf8" />
                <span>Save Run</span>
              </button>

              <button
                onClick={handleExportCSV}
                className="btn btn-outline"
                style={{ flex: 1, fontSize: '0.72rem', padding: '0.45rem' }}
              >
                <FileSpreadsheet size={13} color="#10b981" />
                <span>CSV</span>
              </button>

              <button
                onClick={handlePrintReport}
                className="btn btn-outline"
                style={{ flex: 1, fontSize: '0.72rem', padding: '0.45rem' }}
              >
                <Printer size={13} color="#c084fc" />
                <span>PDF</span>
              </button>
            </div>

            <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginBottom: '0.4rem', fontWeight: 600 }}>
              Recent Experiment Runs
            </div>

            {savedExperiments.length === 0 ? (
              <div style={{
                padding: '1rem',
                textAlign: 'center',
                color: '#64748b',
                background: 'rgba(15, 23, 42, 0.4)',
                borderRadius: '6px',
                border: '1px dashed rgba(255,255,255,0.08)'
              }}>
                No saved experiments yet. Click <strong>Save Run</strong> to persist current results.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', maxHeight: '220px', overflowY: 'auto' }}>
                {savedExperiments.map(exp => (
                  <div
                    key={exp.id}
                    style={{
                      background: 'rgba(15, 23, 42, 0.7)',
                      borderRadius: '6px',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      padding: '0.5rem 0.65rem'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                      <strong style={{ color: '#f8fafc', fontSize: '0.72rem' }}>
                        {exp.origin} → {exp.destination}
                      </strong>
                      <span style={{ fontSize: '0.65rem', color: '#38bdf8', textTransform: 'uppercase' }}>
                        {exp.vehicle}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '0.68rem' }}>
                      <span>{exp.travelTimeMins} min • {exp.distanceKm} km</span>
                      <span>{exp.co2Kg} kg CO₂ • {exp.fuelLitres} L</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
