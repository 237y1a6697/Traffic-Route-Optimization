import React, { useState, useEffect } from 'react';
import { 
  Navigation, MapPin, ArrowUpDown, Sparkles, Sliders, 
  Clock, Calendar, AlertTriangle, ShieldCheck, RefreshCw, Zap
} from 'lucide-react';
import { HYDERABAD_LOCATIONS } from '../data/hyderabadGeoData';

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
  weights,
  setWeights,
  trafficModel,
  onTrafficModelChange,
  onQuickIncidentToggle,
  onClearAllIncidents,
  incidentCount
}) {
  const [sourceSuggestions, setSourceSuggestions] = useState([]);
  const [destSuggestions, setDestSuggestions] = useState([]);
  const [showSourceDropdown, setShowSourceDropdown] = useState(false);
  const [showDestDropdown, setShowDestDropdown] = useState(false);

  // Filter local landmark suggestions
  const filterSuggestions = (text) => {
    if (!text || text.trim().length === 0) return HYDERABAD_LOCATIONS.slice(0, 6);
    const q = text.toLowerCase();
    return HYDERABAD_LOCATIONS.filter(l => 
      l.name.toLowerCase().includes(q) || 
      l.shortName.toLowerCase().includes(q) ||
      l.keywords.some(k => k.includes(q))
    ).slice(0, 5);
  };

  const handleSourceChange = (val) => {
    setSourceQuery(val);
    setSourceSuggestions(filterSuggestions(val));
    setShowSourceDropdown(true);
  };

  const handleDestChange = (val) => {
    setDestQuery(val);
    setDestSuggestions(filterSuggestions(val));
    setShowDestDropdown(true);
  };

  const periodInfo = trafficModel.getPeriodInfo();

  // Handle individual weight change and normalize
  const handleWeightChange = (key, newVal) => {
    setWeights(prev => ({
      ...prev,
      [key]: newVal
    }));
  };

  return (
    <div className="sidebar-col">
      {/* 1. Route Search Card */}
      <div className="glass-panel control-card">
        <div className="card-title">
          <div className="card-title-icon">
            <Navigation size={18} />
            <span>Route Planning</span>
          </div>
          <span className="brand-badge">Navigation Mode</span>
        </div>

        {/* Origin / Source Input */}
        <div className="control-group" style={{ position: 'relative' }}>
          <label className="control-label">
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#22c55e' }}>
              <MapPin size={13} />
              <span>FROM (Origin)</span>
            </span>
          </label>
          <input
            type="text"
            className="select-input"
            value={sourceQuery}
            onChange={(e) => handleSourceChange(e.target.value)}
            onFocus={() => {
              setSourceSuggestions(filterSuggestions(sourceQuery));
              setShowSourceDropdown(true);
            }}
            placeholder="Search pickup location (e.g. Gachibowli)"
          />
          {showSourceDropdown && sourceSuggestions.length > 0 && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              background: '#0f172a',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              zIndex: 50,
              maxHeight: '180px',
              overflowY: 'auto',
              boxShadow: '0 8px 24px rgba(0,0,0,0.6)'
            }}>
              {sourceSuggestions.map(loc => (
                <div
                  key={loc.id}
                  onClick={() => {
                    setSourceQuery(loc.shortName);
                    setShowSourceDropdown(false);
                  }}
                  style={{
                    padding: '0.45rem 0.75rem',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                    color: '#e2e8f0',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(56, 189, 248, 0.15)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <span style={{ fontWeight: 600 }}>{loc.shortName}</span>
                  <span style={{ fontSize: '0.65rem', color: '#64748b' }}>{loc.type}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Swap Origin / Destination */}
        <div style={{ display: 'flex', justifyContent: 'center', margin: '-0.3rem 0' }}>
          <button
            className="btn btn-sm btn-outline"
            onClick={onSwapLocations}
            title="Swap Origin and Destination"
            style={{ borderRadius: '50%', width: '28px', height: '28px', padding: 0 }}
          >
            <ArrowUpDown size={13} />
          </button>
        </div>

        {/* Destination Input */}
        <div className="control-group" style={{ position: 'relative' }}>
          <label className="control-label">
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#38bdf8' }}>
              <MapPin size={13} />
              <span>TO (Destination)</span>
            </span>
          </label>
          <input
            type="text"
            className="select-input"
            value={destQuery}
            onChange={(e) => handleDestChange(e.target.value)}
            onFocus={() => {
              setDestSuggestions(filterSuggestions(destQuery));
              setShowDestDropdown(true);
            }}
            placeholder="Search destination (e.g. Secunderabad)"
          />
          {showDestDropdown && destSuggestions.length > 0 && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              background: '#0f172a',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              zIndex: 50,
              maxHeight: '180px',
              overflowY: 'auto',
              boxShadow: '0 8px 24px rgba(0,0,0,0.6)'
            }}>
              {destSuggestions.map(loc => (
                <div
                  key={loc.id}
                  onClick={() => {
                    setDestQuery(loc.shortName);
                    setShowDestDropdown(false);
                  }}
                  style={{
                    padding: '0.45rem 0.75rem',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                    color: '#e2e8f0',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(56, 189, 248, 0.15)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <span style={{ fontWeight: 600 }}>{loc.shortName}</span>
                  <span style={{ fontSize: '0.65rem', color: '#64748b' }}>{loc.type}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Error Notice */}
        {errorMsg && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            borderRadius: '6px',
            padding: '0.45rem 0.75rem',
            fontSize: '0.75rem',
            color: '#fca5a5'
          }}>
            {errorMsg}
          </div>
        )}

        {/* Big Prominent Optimize Route Button */}
        <button
          className="btn btn-primary btn-lg"
          style={{ width: '100%', marginTop: '0.35rem' }}
          onClick={onRunOptimization}
          disabled={isOptimizing}
        >
          {isOptimizing ? (
            <>
              <RefreshCw size={16} className="quantum-pulse" />
              <span>Optimizing Routes...</span>
            </>
          ) : (
            <>
              <Sparkles size={16} />
              <span>Optimize Route</span>
            </>
          )}
        </button>

        {/* Quick Route Presets */}
        <div style={{ marginTop: '0.2rem' }}>
          <div style={{ fontSize: '0.7rem', color: '#64748b', marginBottom: '0.3rem' }}>Quick Demonstrations:</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
            <button
              className="btn btn-sm btn-outline"
              style={{ fontSize: '0.7rem', padding: '0.25rem 0.5rem', borderColor: 'rgba(6, 182, 212, 0.4)', color: '#22d3ee' }}
              onClick={() => onSelectQuickRoute('Miyapur', 'Secunderabad')}
            >
              ★ Miyapur → Secunderabad
            </button>
            <button
              className="btn btn-sm btn-outline"
              style={{ fontSize: '0.7rem', padding: '0.25rem 0.5rem' }}
              onClick={() => onSelectQuickRoute('Gachibowli', 'Secunderabad')}
            >
              Gachibowli → Secunderabad
            </button>
            <button
              className="btn btn-sm btn-outline"
              style={{ fontSize: '0.7rem', padding: '0.25rem 0.5rem' }}
              onClick={() => onSelectQuickRoute('HITEC City', 'Banjara Hills')}
            >
              HITEC City → Banjara Hills
            </button>
            <button
              className="btn btn-sm btn-outline"
              style={{ fontSize: '0.7rem', padding: '0.25rem 0.5rem' }}
              onClick={() => onSelectQuickRoute('Miyapur', 'Charminar')}
            >
              Miyapur → Charminar
            </button>
          </div>
        </div>
      </div>

      {/* 2. Simulated Traffic Conditions Card (Clearly Labeled) */}
      <div className="glass-panel control-card">
        <div className="card-title">
          <div className="card-title-icon">
            <Clock size={18} />
            <span>Simulated Traffic Layer</span>
          </div>
          <span className="brand-badge" style={{ color: periodInfo.badgeColor, borderColor: periodInfo.badgeColor }}>
            {periodInfo.label}
          </span>
        </div>

        {/* Time of Day Slider */}
        <div className="control-group">
          <div className="control-label">
            <span>Departure Time</span>
            <span className="control-val">
              {Math.floor(trafficModel.timeOfDay).toString().padStart(2, '0')}:
              {Math.round((trafficModel.timeOfDay % 1) * 60).toString().padStart(2, '0')}
              {trafficModel.timeOfDay >= 12 ? ' PM' : ' AM'}
            </span>
          </div>
          <input
            type="range"
            min="6.0"
            max="23.0"
            step="0.5"
            value={trafficModel.timeOfDay}
            onChange={(e) => {
              trafficModel.timeOfDay = parseFloat(e.target.value);
              onTrafficModelChange();
            }}
            className="slider-input"
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: '#64748b' }}>
            <span>06:00 (Early)</span>
            <span style={{ color: '#ef4444' }}>08:30 (Morning Peak)</span>
            <span style={{ color: '#ef4444' }}>18:30 (Evening Peak)</span>
            <span>23:00</span>
          </div>
        </div>

        {/* Day of Week Toggle */}
        <div className="control-group">
          <div className="control-label">
            <span>Day Type</span>
            <span className="control-val">{trafficModel.dayOfWeek === 'weekday' ? 'Mon-Fri Workday' : 'Weekend'}</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
            <button
              className={`btn btn-sm ${trafficModel.dayOfWeek === 'weekday' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => {
                trafficModel.dayOfWeek = 'weekday';
                onTrafficModelChange();
              }}
            >
              Weekday
            </button>
            <button
              className={`btn btn-sm ${trafficModel.dayOfWeek === 'weekend' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => {
                trafficModel.dayOfWeek = 'weekend';
                onTrafficModelChange();
              }}
            >
              Weekend
            </button>
          </div>
        </div>

        {/* Incident Trigger Buttons */}
        <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.6rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Active Incidents: <strong>{incidentCount}</strong></span>
            {incidentCount > 0 && (
              <button
                className="btn btn-sm btn-outline"
                style={{ fontSize: '0.65rem', padding: '0.2rem 0.5rem' }}
                onClick={onClearAllIncidents}
              >
                Clear All
              </button>
            )}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
            <button
              className="incident-btn"
              style={{ padding: '0.4rem 0.5rem' }}
              onClick={() => onQuickIncidentToggle('rd_begumpet_paradise')}
            >
              <AlertTriangle size={12} color="#ef4444" />
              <span>Begumpet Jam</span>
            </button>
            <button
              className="incident-btn"
              style={{ padding: '0.4rem 0.5rem' }}
              onClick={() => onQuickIncidentToggle('rd_jubilee_panjagutta')}
            >
              <AlertTriangle size={12} color="#f97316" />
              <span>Jubilee Roadblock</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Optimization Preferences (Configurable Sliders) */}
      <div className="glass-panel control-card">
        <div className="card-title">
          <div className="card-title-icon">
            <Sliders size={18} />
            <span>Optimization Preferences</span>
          </div>
          <span className="brand-badge" style={{ color: '#38bdf8' }}>Multi-Objective</span>
        </div>

        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
          Adjust priorities. Quantum optimization dynamically recalculates route choice:
        </div>

        {/* Travel Time */}
        <div className="control-group">
          <div className="control-label">
            <span>Travel Time Priority</span>
            <span className="control-val">{Math.round(weights.timeWeight * 100)}%</span>
          </div>
          <input
            type="range"
            min="0.05"
            max="0.70"
            step="0.05"
            value={weights.timeWeight}
            onChange={(e) => handleWeightChange('timeWeight', parseFloat(e.target.value))}
            className="slider-input"
          />
        </div>

        {/* Congestion Avoidance */}
        <div className="control-group">
          <div className="control-label">
            <span>Congestion Avoidance</span>
            <span className="control-val">{Math.round(weights.congestionWeight * 100)}%</span>
          </div>
          <input
            type="range"
            min="0.05"
            max="0.70"
            step="0.05"
            value={weights.congestionWeight}
            onChange={(e) => handleWeightChange('congestionWeight', parseFloat(e.target.value))}
            className="slider-input"
          />
        </div>

        {/* Distance */}
        <div className="control-group">
          <div className="control-label">
            <span>Distance Minimization</span>
            <span className="control-val">{Math.round(weights.distanceWeight * 100)}%</span>
          </div>
          <input
            type="range"
            min="0.05"
            max="0.70"
            step="0.05"
            value={weights.distanceWeight}
            onChange={(e) => handleWeightChange('distanceWeight', parseFloat(e.target.value))}
            className="slider-input"
          />
        </div>

        {/* Fuel Economy */}
        <div className="control-group">
          <div className="control-label">
            <span>Fuel Conservation</span>
            <span className="control-val">{Math.round(weights.fuelWeight * 100)}%</span>
          </div>
          <input
            type="range"
            min="0.05"
            max="0.50"
            step="0.05"
            value={weights.fuelWeight}
            onChange={(e) => handleWeightChange('fuelWeight', parseFloat(e.target.value))}
            className="slider-input"
          />
        </div>

        {/* Emissions */}
        <div className="control-group">
          <div className="control-label">
            <span>CO₂ Emission Reduction</span>
            <span className="control-val">{Math.round(weights.emissionsWeight * 100)}%</span>
          </div>
          <input
            type="range"
            min="0.05"
            max="0.50"
            step="0.05"
            value={weights.emissionsWeight}
            onChange={(e) => handleWeightChange('emissionsWeight', parseFloat(e.target.value))}
            className="slider-input"
          />
        </div>
      </div>
    </div>
  );
}
