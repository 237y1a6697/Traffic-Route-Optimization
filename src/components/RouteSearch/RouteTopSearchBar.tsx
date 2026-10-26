import React, { useState, useRef, useEffect } from 'react';
import { 
  MapPin, Locate, MousePointer, ArrowLeftRight, 
  Car, Bike, Truck, Clock, Sparkles, X, ChevronDown, Search, Check, Navigation
} from 'lucide-react';
import { INDIA_LOCATIONS } from '../../data/static/indiaGeoData';
import { GeographicLocation } from '../../models/road';
import { VehicleMode } from '../../models/route';
import { getCurrentClockTime } from '../../utils/timeUtils';

interface RouteTopSearchBarProps {
  sourceQuery: string;
  setSourceQuery: (val: string) => void;
  destQuery: string;
  setDestQuery: (val: string) => void;
  onSelectSource?: (loc: GeographicLocation) => void;
  onSelectDest?: (loc: GeographicLocation) => void;
  onSwapLocations: () => void;
  onRunOptimization: () => void;
  isOptimizing: boolean;
  vehicleMode: VehicleMode;
  setVehicleMode: (mode: VehicleMode) => void;
  departureTime: string;
  setDepartureTime: (time: string) => void;
  onUseCurrentLocation?: () => void;
  mapSelectMode?: 'origin' | 'destination' | null;
  setMapSelectMode?: (mode: 'origin' | 'destination' | null) => void;
  isRecommendedRouteOpen: boolean;
  onToggleRecommendedRoute: () => void;
  etaMins?: number;
  onStartNavigation?: () => void;
  isNavigating?: boolean;
}

export default function RouteTopSearchBar({
  sourceQuery,
  setSourceQuery,
  destQuery,
  setDestQuery,
  onSelectSource,
  onSelectDest,
  onSwapLocations,
  onRunOptimization,
  isOptimizing,
  vehicleMode,
  setVehicleMode,
  departureTime,
  setDepartureTime,
  onUseCurrentLocation,
  mapSelectMode,
  setMapSelectMode,
  isRecommendedRouteOpen,
  onToggleRecommendedRoute,
  etaMins,
  onStartNavigation,
  isNavigating = false
}: RouteTopSearchBarProps) {
  const [activeDropdown, setActiveDropdown] = useState<'origin' | 'dest' | 'time' | null>(null);
  const [originSearch, setOriginSearch] = useState('');
  const [destSearch, setDestSearch] = useState('');

  const barRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (barRef.current && !barRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter locations across India for dropdown autocomplete
  const filterLocations = (query: string) => {
    if (!query || query.trim().length === 0) {
      return INDIA_LOCATIONS.slice(0, 10);
    }
    const q = query.toLowerCase().trim();
    return INDIA_LOCATIONS.filter(l =>
      l.shortName.toLowerCase().includes(q) ||
      l.name.toLowerCase().includes(q) ||
      l.keywords.some(k => k.toLowerCase().includes(q))
    ).slice(0, 10);
  };

  const originSuggestions = filterLocations(originSearch || sourceQuery);
  const destSuggestions = filterLocations(destSearch || destQuery);

  // Normalized vehicle for UI
  const currentVehicle: 'car' | 'bike' | 'heavy_vehicle' = 
    vehicleMode === 'car' ? 'car' :
    vehicleMode === 'bike' || vehicleMode === 'motorcycle' || vehicleMode === 'motor_scooter' ? 'bike' : 'heavy_vehicle';

  // Handle setting time quickly
  const handleSetQuickTime = (type: 'now' | '15' | '30' | '60') => {
    if (type === 'now') {
      setDepartureTime(getCurrentClockTime());
    } else {
      const mins = parseInt(type, 10);
      const future = new Date(Date.now() + mins * 60000);
      setDepartureTime(getCurrentClockTime(future));
    }
    setActiveDropdown(null);
  };

  return (
    <div className="route-top-search-bar" ref={barRef} aria-label="Route Navigation Header">
      <div className="search-bar-inner">
        {/* 1. ORIGIN & DESTINATION Google Maps Search Inputs */}
        <div className="search-inputs-group">
          {/* ORIGIN INPUT */}
          <div className="search-input-pill origin-pill">
            <span className="dot-indicator origin-dot" title="Origin" />
            <input
              type="text"
              className="search-text-input"
              value={sourceQuery}
              onChange={(e) => {
                setSourceQuery(e.target.value);
                setOriginSearch(e.target.value);
              }}
              onFocus={() => {
                setActiveDropdown('origin');
                setOriginSearch('');
              }}
              placeholder="Choose origin (e.g. Gachibowli)"
            />
            {sourceQuery && (
              <button
                type="button"
                className="input-clear-icon"
                onClick={() => setSourceQuery('')}
                title="Clear origin"
              >
                <X size={13} />
              </button>
            )}

            {/* Google Maps Style Origin Suggestions Popover */}
            {activeDropdown === 'origin' && (
              <div className="google-suggestions-popover">
                <div className="popover-section-label">SELECT OPTIONS</div>

                {/* 1. Your Location (GPS) */}
                {onUseCurrentLocation && (
                  <button
                    type="button"
                    className="suggestion-item quick-action-item"
                    onMouseDown={() => {
                      onUseCurrentLocation();
                      setActiveDropdown(null);
                    }}
                  >
                    <div className="suggestion-icon-circle gps-circle">
                      <Locate size={15} color="#10b981" />
                    </div>
                    <div className="suggestion-text">
                      <div className="suggestion-title">Your current location</div>
                      <div className="suggestion-sub">Use device GPS coordinates</div>
                    </div>
                  </button>
                )}

                {/* 2. Choose on map */}
                {setMapSelectMode && (
                  <button
                    type="button"
                    className={`suggestion-item quick-action-item ${mapSelectMode === 'origin' ? 'active-map-pick' : ''}`}
                    onMouseDown={() => {
                      setMapSelectMode('origin');
                      setActiveDropdown(null);
                    }}
                  >
                    <div className="suggestion-icon-circle map-circle">
                      <MousePointer size={15} color="#38bdf8" />
                    </div>
                    <div className="suggestion-text">
                      <div className="suggestion-title">Choose on map</div>
                      <div className="suggestion-sub">Click anywhere on Indian road network</div>
                    </div>
                  </button>
                )}

                <div className="popover-divider" />
                <div className="popover-section-label">POPULAR INDIAN HUBS & DESTINATIONS</div>

                <div className="suggestions-scroll-list">
                  {originSuggestions.map((loc) => (
                    <button
                      key={loc.id}
                      type="button"
                      className="suggestion-item"
                      onMouseDown={() => {
                        setSourceQuery(loc.shortName);
                        if (onSelectSource) onSelectSource(loc);
                        setActiveDropdown(null);
                      }}
                    >
                      <div className="suggestion-icon-circle pin-circle">
                        <MapPin size={14} color="#94a3b8" />
                      </div>
                      <div className="suggestion-text">
                        <div className="suggestion-title">{loc.shortName}</div>
                        <div className="suggestion-sub">{loc.name}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* SWAP BUTTON */}
          <button
            type="button"
            className="search-swap-btn"
            onClick={onSwapLocations}
            title="Swap Origin and Destination"
            aria-label="Swap Locations"
          >
            <ArrowLeftRight size={14} />
          </button>

          {/* DESTINATION INPUT */}
          <div className="search-input-pill dest-pill">
            <span className="dot-indicator dest-dot" title="Destination" />
            <input
              type="text"
              className="search-text-input"
              value={destQuery}
              onChange={(e) => {
                setDestQuery(e.target.value);
                setDestSearch(e.target.value);
              }}
              onFocus={() => {
                setActiveDropdown('dest');
                setDestSearch('');
              }}
              placeholder="Choose destination (e.g. Secunderabad)"
            />
            {destQuery && (
              <button
                type="button"
                className="input-clear-icon"
                onClick={() => setDestQuery('')}
                title="Clear destination"
              >
                <X size={13} />
              </button>
            )}

            {/* Google Maps Style Destination Suggestions Popover */}
            {activeDropdown === 'dest' && (
              <div className="google-suggestions-popover">
                <div className="popover-section-label">SELECT OPTIONS</div>

                {/* Choose on map */}
                {setMapSelectMode && (
                  <button
                    type="button"
                    className={`suggestion-item quick-action-item ${mapSelectMode === 'destination' ? 'active-map-pick' : ''}`}
                    onMouseDown={() => {
                      setMapSelectMode('destination');
                      setActiveDropdown(null);
                    }}
                  >
                    <div className="suggestion-icon-circle map-circle">
                      <MousePointer size={15} color="#ef4444" />
                    </div>
                    <div className="suggestion-text">
                      <div className="suggestion-title">Choose on map</div>
                      <div className="suggestion-sub">Click anywhere on Indian road network</div>
                    </div>
                  </button>
                )}

                <div className="popover-divider" />
                <div className="popover-section-label">POPULAR INDIAN HUBS & DESTINATIONS</div>

                <div className="suggestions-scroll-list">
                  {destSuggestions.map((loc) => (
                    <button
                      key={loc.id}
                      type="button"
                      className="suggestion-item"
                      onMouseDown={() => {
                        setDestQuery(loc.shortName);
                        if (onSelectDest) onSelectDest(loc);
                        setActiveDropdown(null);
                      }}
                    >
                      <div className="suggestion-icon-circle pin-circle">
                        <MapPin size={14} color="#ef4444" />
                      </div>
                      <div className="suggestion-text">
                        <div className="suggestion-title">{loc.shortName}</div>
                        <div className="suggestion-sub">{loc.name}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 2. VEHICLE CATEGORY SELECTOR (Car | Bike | Heavy Vehicle) */}
        <div className="vehicle-mode-selector">
          {/* Car */}
          <button
            type="button"
            className={`vehicle-pill-btn ${currentVehicle === 'car' ? 'active' : ''}`}
            onClick={() => setVehicleMode('car')}
            title="Car / 4-Wheeler (Standard passenger car with arterial & expressway routing)"
          >
            <Car size={15} />
            <span className="vehicle-pill-name">Car</span>
          </button>

          {/* Bike (2-Wheeler) */}
          <button
            type="button"
            className={`vehicle-pill-btn ${currentVehicle === 'bike' ? 'active' : ''}`}
            onClick={() => setVehicleMode('bike')}
            title="Bike / 2-Wheeler (High agility, lane-filtering through traffic bottlenecks)"
          >
            <Bike size={15} />
            <span className="vehicle-pill-name">Bike</span>
          </button>

          {/* Heavy Vehicle (Truck / Commercial - Replaces Scooter) */}
          <button
            type="button"
            className={`vehicle-pill-btn ${currentVehicle === 'heavy_vehicle' ? 'active' : ''}`}
            onClick={() => setVehicleMode('heavy_vehicle')}
            title="Heavy Vehicle (Truck / Commercial: ORR freight corridors, max 50 km/h)"
          >
            <Truck size={15} />
            <span className="vehicle-pill-name">Heavy Vehicle</span>
          </button>
        </div>

        {/* 3. DEPARTURE TIME & LIVE CLOCK */}
        <div className="departure-time-wrapper">
          <button
            type="button"
            className="departure-pill-btn"
            onClick={() => setActiveDropdown(activeDropdown === 'time' ? null : 'time')}
            title="Departure Time (matches real clock)"
          >
            <Clock size={13} className="text-muted" />
            <span className="departure-time-label">Depart:</span>
            <span className="departure-time-val">{departureTime || getCurrentClockTime()}</span>
            <ChevronDown size={12} className="text-muted" />
          </button>

          {/* Time Picker Popover */}
          {activeDropdown === 'time' && (
            <div className="time-picker-popover">
              <div className="popover-section-label">DEPARTURE SCHEDULE</div>
              <button
                type="button"
                className="time-quick-btn active-time-now"
                onClick={() => handleSetQuickTime('now')}
              >
                <span>Leave Now</span>
                <span className="time-sub-tag">Current ({getCurrentClockTime()})</span>
              </button>
              <button
                type="button"
                className="time-quick-btn"
                onClick={() => handleSetQuickTime('15')}
              >
                <span>In 15 minutes</span>
              </button>
              <button
                type="button"
                className="time-quick-btn"
                onClick={() => handleSetQuickTime('30')}
              >
                <span>In 30 minutes</span>
              </button>
              <button
                type="button"
                className="time-quick-btn"
                onClick={() => handleSetQuickTime('60')}
              >
                <span>In 1 hour</span>
              </button>

              <div className="custom-time-input-row">
                <input
                  type="text"
                  className="custom-time-input"
                  value={departureTime}
                  onChange={(e) => setDepartureTime(e.target.value)}
                  placeholder="e.g. 12:45 PM"
                />
                <button
                  type="button"
                  className="custom-time-set-btn"
                  onClick={() => setActiveDropdown(null)}
                >
                  <Check size={13} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 4. PRIMARY ACTION: OPTIMIZE ROUTE */}
        <button
          type="button"
          className="search-optimize-btn"
          onClick={onRunOptimization}
          disabled={isOptimizing}
          title="Compute Quantum-Inspired Pareto Routes"
        >
          {isOptimizing ? (
            <>
              <span className="spinner-border-sm" />
              <span>Optimizing...</span>
            </>
          ) : (
            <>
              <Sparkles size={14} />
              <span>Find Routes</span>
            </>
          )}
        </button>

        {/* 4b. LIVE NAVIGATION & GPS TRACKING (Google Maps style) */}
        {onStartNavigation && (
          <button
            type="button"
            className={`start-nav-pill-btn ${isNavigating ? 'active-navigating' : ''}`}
            onClick={onStartNavigation}
            title={isNavigating ? "Exit Live Navigation" : "Start Live Navigation & GPS Tracking"}
          >
            <Navigation size={14} style={{ transform: isNavigating ? 'none' : 'rotate(45deg)' }} />
            <span>{isNavigating ? 'Exit Nav' : 'Start'}</span>
          </button>
        )}

        {/* 5. RECOMMENDED ROUTE PANEL TOGGLE (MENU BUTTON) */}
        <button
          type="button"
          className={`recommended-panel-menu-btn ${isRecommendedRouteOpen ? 'active' : ''}`}
          onClick={onToggleRecommendedRoute}
          title={isRecommendedRouteOpen ? "Hide Recommended Route Panel (Full Map View)" : "Show Recommended Route Panel"}
          aria-label="Toggle Route Details"
        >
          <span className="menu-btn-content">
            <span className="menu-pill-dot" />
            <span className="menu-btn-text">Recommended Route</span>
            {etaMins && (
              <span className="menu-btn-eta-badge">{etaMins}m</span>
            )}
          </span>
        </button>
      </div>
    </div>
  );
}
