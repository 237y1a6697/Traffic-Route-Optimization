import React, { useState } from 'react';
import { 
  Network, MapPin, ArrowUpDown, 
  Car, Bike, Truck, Zap, X, Clock, Calendar, Rocket, 
  ChevronDown, ChevronUp, Locate, MousePointer
} from 'lucide-react';
import { INDIA_LOCATIONS } from '../../data/static/indiaGeoData';
import { GeographicLocation } from '../../models/road';
import { OptimizationWeights } from '../../models/algorithm';
import { VehicleMode } from '../../models/route';

export type RoutePreference = 'fastest' | 'shortest' | 'less_congestion' | 'lower_emissions';

interface RoutePlannerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
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
  vehicleMode: VehicleMode;
  setVehicleMode: (mode: VehicleMode) => void;
  mapSelectMode?: 'origin' | 'destination' | null;
  setMapSelectMode?: (mode: 'origin' | 'destination' | null) => void;
  onUseCurrentLocation?: () => void;
  departureTime?: string;
  setDepartureTime?: (time: string) => void;
}

export default function RoutePlannerDrawer({
  isOpen,
  onClose,
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
  mapSelectMode,
  setMapSelectMode,
  onUseCurrentLocation,
  departureTime = '08:30 AM',
  setDepartureTime
}: RoutePlannerDrawerProps) {
  const [routePreference, setRoutePreference] = useState<RoutePreference>('fastest');
  const [showQuickDemos, setShowQuickDemos] = useState<boolean>(true);
  
  // Autocomplete suggestions
  const [sourceSuggestions, setSourceSuggestions] = useState<GeographicLocation[]>([]);
  const [destSuggestions, setDestSuggestions] = useState<GeographicLocation[]>([]);
  const [showSourceDropdown, setShowSourceDropdown] = useState(false);
  const [showDestDropdown, setShowDestDropdown] = useState(false);

  if (!isOpen) return null;

  const handleRoutePreferenceChange = (pref: RoutePreference) => {
    setRoutePreference(pref);
    if (pref === 'fastest') {
      setWeights({ timeWeight: 0.50, congestionWeight: 0.25, distanceWeight: 0.10, fuelWeight: 0.08, emissionsWeight: 0.07 });
    } else if (pref === 'shortest') {
      setWeights({ timeWeight: 0.15, congestionWeight: 0.15, distanceWeight: 0.50, fuelWeight: 0.10, emissionsWeight: 0.10 });
    } else if (pref === 'less_congestion') {
      setWeights({ timeWeight: 0.20, congestionWeight: 0.50, distanceWeight: 0.10, fuelWeight: 0.10, emissionsWeight: 0.10 });
    } else if (pref === 'lower_emissions') {
      setWeights({ timeWeight: 0.15, congestionWeight: 0.15, distanceWeight: 0.15, fuelWeight: 0.25, emissionsWeight: 0.30 });
    }
  };

  const filterSuggestions = (text: string) => {
    if (!text || text.trim().length < 2) return [];
    const query = text.toLowerCase().trim();
    return INDIA_LOCATIONS.filter(l => 
      l.name.toLowerCase().includes(query) ||
      l.shortName.toLowerCase().includes(query) ||
      l.keywords.some(k => k.toLowerCase().includes(query))
    ).slice(0, 8);
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

  // Normalized active vehicle
  const activeVehicle: 'car' | 'bike' | 'heavy_vehicle' = 
    vehicleMode === 'car' ? 'car' :
    vehicleMode === 'bike' || vehicleMode === 'motorcycle' || vehicleMode === 'motor_scooter' ? 'bike' : 'heavy_vehicle';

  return (
    <aside className="route-planner-drawer" aria-label="Route Planner">
      {/* 1. Header */}
      <div className="planner-header">
        <div className="planner-title">
          <Network size={18} className="text-cyan animate-pulse" />
          <span>Route Planner</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="planner-close-btn"
          title="Close Route Planner"
          aria-label="Close Route Planner"
        >
          <X size={16} />
        </button>
      </div>

      <div className="planner-body">
        {/* 2. FROM (Origin) Input */}
        <div className="planner-field-group">
          <div className="field-label-row">
            <label className="field-label origin-label">
              <MapPin size={13} color="#22c55e" />
              <span>FROM (Origin)</span>
            </label>
            <div className="field-quick-actions">
              {onUseCurrentLocation && (
                <button
                  type="button"
                  onClick={onUseCurrentLocation}
                  className="field-action-chip text-emerald"
                  title="Use Device GPS Location"
                >
                  <Locate size={11} />
                  <span>GPS</span>
                </button>
              )}
              {setMapSelectMode && (
                <button
                  type="button"
                  onClick={() => setMapSelectMode(mapSelectMode === 'origin' ? null : 'origin')}
                  className={`field-action-chip ${mapSelectMode === 'origin' ? 'active' : ''}`}
                  title="Click directly on Map to set Origin"
                >
                  <MousePointer size={11} />
                  <span>{mapSelectMode === 'origin' ? 'Click Map...' : 'Map'}</span>
                </button>
              )}
            </div>
          </div>

          <div className="input-box-wrapper">
            <input
              type="text"
              className="planner-input"
              value={sourceQuery}
              onChange={(e) => handleSourceChange(e.target.value)}
              onFocus={() => {
                setSourceSuggestions(filterSuggestions(sourceQuery));
                setShowSourceDropdown(true);
              }}
              onBlur={() => setTimeout(() => setShowSourceDropdown(false), 200)}
              placeholder="e.g. Gachibowli, Hyderabad"
            />
            {sourceQuery && (
              <button
                type="button"
                className="input-clear-btn"
                onClick={() => setSourceQuery('')}
                title="Clear origin"
              >
                <X size={13} />
              </button>
            )}

            {/* Autocomplete Dropdown */}
            {showSourceDropdown && sourceSuggestions.length > 0 && (
              <div className="planner-autocomplete">
                {sourceSuggestions.map((item) => (
                  <div
                    key={item.id}
                    className="autocomplete-option"
                    onMouseDown={() => {
                      setSourceQuery(item.shortName);
                      setShowSourceDropdown(false);
                    }}
                  >
                    <MapPin size={12} color="#22c55e" />
                    <div>
                      <div className="option-title">{item.shortName}</div>
                      <div className="option-desc">{item.name}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Swap Control Row */}
        <div className="swap-row">
          <button
            type="button"
            onClick={onSwapLocations}
            className="swap-btn"
            title="Swap Origin and Destination"
          >
            <ArrowUpDown size={13} />
            <span>Swap</span>
          </button>
        </div>

        {/* 3. TO (Destination) Input */}
        <div className="planner-field-group">
          <div className="field-label-row">
            <label className="field-label dest-label">
              <MapPin size={13} color="#ef4444" />
              <span>TO (Destination)</span>
            </label>
            <div className="field-quick-actions">
              {setMapSelectMode && (
                <button
                  type="button"
                  onClick={() => setMapSelectMode(mapSelectMode === 'destination' ? null : 'destination')}
                  className={`field-action-chip ${mapSelectMode === 'destination' ? 'active-dest' : ''}`}
                  title="Click directly on Map to set Destination"
                >
                  <MousePointer size={11} />
                  <span>{mapSelectMode === 'destination' ? 'Click Map...' : 'Map'}</span>
                </button>
              )}
            </div>
          </div>

          <div className="input-box-wrapper">
            <input
              type="text"
              className="planner-input"
              value={destQuery}
              onChange={(e) => handleDestChange(e.target.value)}
              onFocus={() => {
                setDestSuggestions(filterSuggestions(destQuery));
                setShowDestDropdown(true);
              }}
              onBlur={() => setTimeout(() => setShowDestDropdown(false), 200)}
              placeholder="e.g. Secunderabad, Hyderabad"
            />
            {destQuery && (
              <button
                type="button"
                className="input-clear-btn"
                onClick={() => setDestQuery('')}
                title="Clear destination"
              >
                <X size={13} />
              </button>
            )}

            {/* Autocomplete Dropdown */}
            {showDestDropdown && destSuggestions.length > 0 && (
              <div className="planner-autocomplete">
                {destSuggestions.map((item) => (
                  <div
                    key={item.id}
                    className="autocomplete-option"
                    onMouseDown={() => {
                      setDestQuery(item.shortName);
                      setShowDestDropdown(false);
                    }}
                  >
                    <MapPin size={12} color="#ef4444" />
                    <div>
                      <div className="option-title">{item.shortName}</div>
                      <div className="option-desc">{item.name}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 4. Vehicle Category Selector */}
        <div className="planner-section">
          <div className="section-label">Vehicle Category</div>
          <div className="vehicle-category-grid">
            {/* Car */}
            <button
              type="button"
              className={`vehicle-card ${activeVehicle === 'car' ? 'active' : ''}`}
              onClick={() => setVehicleMode('car')}
            >
              <Car size={18} />
              <div className="vehicle-name">Car</div>
              <div className="vehicle-sub">4-Wheeler</div>
            </button>

            {/* Bike / 2-Wheeler */}
            <button
              type="button"
              className={`vehicle-card ${activeVehicle === 'bike' ? 'active' : ''}`}
              onClick={() => setVehicleMode('bike')}
            >
              <Bike size={18} />
              <div className="vehicle-name">Bike</div>
              <div className="vehicle-sub">2-Wheeler</div>
            </button>

            {/* Heavy Vehicle */}
            <button
              type="button"
              className={`vehicle-card ${activeVehicle === 'heavy_vehicle' ? 'active' : ''}`}
              onClick={() => setVehicleMode('heavy_vehicle')}
            >
              <Truck size={18} />
              <div className="vehicle-name">Heavy</div>
              <div className="vehicle-sub">Truck / Bus</div>
            </button>
          </div>
        </div>

        {/* 5. Route Preference (2x2 Radio Grid) */}
        <div className="planner-section">
          <div className="section-label-icon">
            <Network size={14} className="text-cyan" />
            <span>Route Preference</span>
          </div>

          <div className="preference-radio-grid">
            <label className={`pref-radio-item ${routePreference === 'fastest' ? 'active' : ''}`}>
              <input
                type="radio"
                name="preference"
                checked={routePreference === 'fastest'}
                onChange={() => handleRoutePreferenceChange('fastest')}
              />
              <span className="pref-radio-circle" />
              <span>Fastest</span>
            </label>

            <label className={`pref-radio-item ${routePreference === 'shortest' ? 'active' : ''}`}>
              <input
                type="radio"
                name="preference"
                checked={routePreference === 'shortest'}
                onChange={() => handleRoutePreferenceChange('shortest')}
              />
              <span className="pref-radio-circle" />
              <span>Shortest</span>
            </label>

            <label className={`pref-radio-item ${routePreference === 'less_congestion' ? 'active' : ''}`}>
              <input
                type="radio"
                name="preference"
                checked={routePreference === 'less_congestion'}
                onChange={() => handleRoutePreferenceChange('less_congestion')}
              />
              <span className="pref-radio-circle" />
              <span>Less Congestion</span>
            </label>

            <label className={`pref-radio-item ${routePreference === 'lower_emissions' ? 'active' : ''}`}>
              <input
                type="radio"
                name="preference"
                checked={routePreference === 'lower_emissions'}
                onChange={() => handleRoutePreferenceChange('lower_emissions')}
              />
              <span className="pref-radio-circle" />
              <span>Lower Emissions</span>
            </label>
          </div>
        </div>

        {/* 6. Departure Time */}
        <div className="planner-section">
          <div className="section-label-icon">
            <Clock size={14} className="text-cyan" />
            <span>Departure Time</span>
          </div>

          <div className="departure-time-box">
            <Clock size={15} className="text-cyan" />
            <input
              type="text"
              className="departure-input"
              value={departureTime}
              onChange={(e) => setDepartureTime && setDepartureTime(e.target.value)}
              placeholder="08:30 AM"
            />
            <button
              type="button"
              className="departure-calendar-btn"
              title="Schedule Departure Time"
            >
              <Calendar size={15} />
            </button>
          </div>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="planner-error-banner">
            <span>⚠️ {errorMsg}</span>
          </div>
        )}

        {/* 7. Optimize Route Button */}
        <button
          type="button"
          className="optimize-route-btn"
          onClick={onRunOptimization}
          disabled={isOptimizing}
        >
          {isOptimizing ? (
            <>
              <span className="spinner-border" />
              <span>Optimizing Routes...</span>
            </>
          ) : (
            <>
              <Rocket size={17} style={{ transform: 'rotate(45deg)' }} />
              <span>Optimize Route</span>
            </>
          )}
        </button>

        {/* 8. Quick Demonstrations (Collapsible) */}
        <div className="quick-demos-container">
          <button
            type="button"
            className="quick-demos-toggle"
            onClick={() => setShowQuickDemos(!showQuickDemos)}
          >
            <span>Quick Demonstrations</span>
            {showQuickDemos ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {showQuickDemos && (
            <div className="quick-demos-list">
              {[
                { src: 'Gachibowli', dest: 'Charminar' },
                { src: 'Hyderabad', dest: 'Bengaluru' },
                { src: 'Hyderabad', dest: 'Vijayawada' },
                { src: 'Hyderabad', dest: 'Chennai' },
                { src: 'Jaipur', dest: 'Ahmedabad' },
                { src: 'Hyderabad', dest: 'New Delhi' }
              ].map((pair) => (
                <button
                  key={`${pair.src}-${pair.dest}`}
                  type="button"
                  className="quick-demo-item"
                  onClick={() => onSelectQuickRoute(pair.src, pair.dest)}
                >
                  <span>{pair.src} → {pair.dest}</span>
                  <span className="demo-go-pill">Go</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
