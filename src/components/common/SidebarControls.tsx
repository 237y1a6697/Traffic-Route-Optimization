import React from 'react';
import { 
  Sparkles, Sliders, ShieldAlert, 
  RefreshCw, Zap, Flame, Compass, Car
} from 'lucide-react';
import { NETWORKS } from '../../data/static/networks';

interface SidebarControlsProps {
  selectedNetworkKey: string;
  setSelectedNetworkKey: (key: string) => void;
  activeAlgorithm: string;
  setActiveAlgorithm: (algo: string) => void;
  vehicleCount: number;
  setVehicleCount: (val: number) => void;
  weather: string;
  setWeather: (w: string) => void;
  rushHourFactor: number;
  setRushHourFactor: (f: number) => void;
  isOptimizing: boolean;
  onRunOptimization: () => void;
  onInjectRandomIncident: () => void;
  onClearIncidents: () => void;
  incidentCount: number;
  simSpeed: number;
  setSimSpeed: (s: number) => void;
}

export default function SidebarControls({
  selectedNetworkKey,
  setSelectedNetworkKey,
  activeAlgorithm,
  setActiveAlgorithm,
  vehicleCount,
  setVehicleCount,
  weather,
  setWeather,
  rushHourFactor,
  setRushHourFactor,
  isOptimizing,
  onRunOptimization,
  onInjectRandomIncident,
  onClearIncidents,
  incidentCount,
  simSpeed,
  setSimSpeed
}: SidebarControlsProps) {
  return (
    <div className="sidebar-col">
      {/* 1. Network Selection Card */}
      <div className="glass-panel control-card">
        <div className="card-title">
          <div className="card-title-icon">
            <Compass size={18} />
            <span>Transportation Network</span>
          </div>
        </div>

        <div className="control-group">
          <label className="control-label">Preset Benchmark Network</label>
          <select
            className="select-input"
            value={selectedNetworkKey}
            onChange={(e) => setSelectedNetworkKey(e.target.value)}
            disabled={isOptimizing}
          >
            <option value="siouxFalls">Sioux Falls Benchmark (24 Nodes, 76 Links)</option>
            <option value="cyberMetropolis">Cyber-Metropolis Grid (16 Nodes, 46 Links)</option>
            <option value="logisticsCorridor">Tri-City Freight Corridor (12 Nodes, 32 Links)</option>
          </select>
        </div>

        <div style={{ fontSize: '0.75rem', color: '#94a3b8', lineHeight: 1.4 }}>
          {NETWORKS[selectedNetworkKey]?.description}
        </div>
      </div>

      {/* 2. Algorithm Selector Card */}
      <div className="glass-panel control-card">
        <div className="card-title">
          <div className="card-title-icon">
            <Zap size={18} />
            <span>Optimization Algorithms</span>
          </div>
        </div>

        <div className="algo-pills">
          <div
            className={`algo-pill qga ${activeAlgorithm === 'QGA' ? 'active' : ''}`}
            onClick={() => setActiveAlgorithm('QGA')}
          >
            <div className="algo-name" style={{ color: '#22d3ee' }}>
              <Sparkles size={14} />
              <span>QGA</span>
            </div>
            <span className="algo-tag">Quantum Genetic</span>
          </div>

          <div
            className={`algo-pill qubo ${activeAlgorithm === 'QUBO' ? 'active' : ''}`}
            onClick={() => setActiveAlgorithm('QUBO')}
          >
            <div className="algo-name" style={{ color: '#c084fc' }}>
              <Zap size={14} />
              <span>QUBO</span>
            </div>
            <span className="algo-tag">Quantum Anneal</span>
          </div>

          <div
            className={`algo-pill cga ${activeAlgorithm === 'CGA' ? 'active' : ''}`}
            onClick={() => setActiveAlgorithm('CGA')}
          >
            <div className="algo-name" style={{ color: '#34d399' }}>
              <Sliders size={14} />
              <span>CGA</span>
            </div>
            <span className="algo-tag">Classical GA</span>
          </div>

          <div
            className={`algo-pill dijkstra ${activeAlgorithm === 'DIJKSTRA' ? 'active' : ''}`}
            onClick={() => setActiveAlgorithm('DIJKSTRA')}
          >
            <div className="algo-name" style={{ color: '#fbbf24' }}>
              <Car size={14} />
              <span>Dijkstra</span>
            </div>
            <span className="algo-tag">Greedy Shortest</span>
          </div>
        </div>

        <button
          className="btn btn-primary btn-lg"
          style={{ width: '100%', marginTop: '0.35rem' }}
          onClick={onRunOptimization}
          disabled={isOptimizing}
        >
          {isOptimizing ? (
            <>
              <RefreshCw size={16} className="quantum-pulse" />
              <span>Quantum Optimizing...</span>
            </>
          ) : (
            <>
              <Sparkles size={16} />
              <span>Run Quantum Optimization</span>
            </>
          )}
        </button>
      </div>

      {/* 3. Traffic Demand */}
      <div className="glass-panel control-card">
        <div className="card-title">
          <div className="card-title-icon">
            <Car size={18} />
            <span>Traffic Demand & Environmental Factors</span>
          </div>
        </div>

        <div className="control-group">
          <div className="control-label">
            <span>Fleet Load (Vehicles)</span>
            <span className="control-val">{vehicleCount}</span>
          </div>
          <input
            type="range"
            min="20"
            max="250"
            step="10"
            value={vehicleCount}
            onChange={(e) => setVehicleCount(Number(e.target.value))}
            className="slider-input"
          />
        </div>

        <div className="control-group">
          <div className="control-label">
            <span>Rush Hour Surge Factor</span>
            <span className="control-val">{rushHourFactor}x</span>
          </div>
          <input
            type="range"
            min="1.0"
            max="2.5"
            step="0.25"
            value={rushHourFactor}
            onChange={(e) => setRushHourFactor(Number(e.target.value))}
            className="slider-input"
          />
        </div>

        <div className="control-group">
          <div className="control-label">
            <span>Weather Condition</span>
            <span style={{ fontSize: '0.8rem', color: weather === 'storm' ? '#ef4444' : weather === 'rain' ? '#38bdf8' : '#10b981' }}>
              {weather === 'clear' ? 'Clear (100% Cap)' : weather === 'rain' ? 'Rain (80% Cap)' : 'Severe Storm (60% Cap)'}
            </span>
          </div>
          <select
            className="select-input"
            value={weather}
            onChange={(e) => setWeather(e.target.value)}
          >
            <option value="clear">☀️ Clear Conditions (Optimal)</option>
            <option value="rain">🌧️ Rain Shower (-20% Capacity)</option>
            <option value="storm">⛈️ Severe Blizzard / Storm (-40% Capacity)</option>
          </select>
        </div>

        <div className="control-group">
          <div className="control-label">
            <span>Particle Flow Speed</span>
            <span className="control-val">{simSpeed}x</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="4.0"
            step="0.5"
            value={simSpeed}
            onChange={(e) => setSimSpeed(Number(e.target.value))}
            className="slider-input"
          />
        </div>
      </div>

      {/* 4. Incident & Stress Testing */}
      <div className="glass-panel control-card">
        <div className="card-title">
          <div className="card-title-icon">
            <ShieldAlert size={18} />
            <span>Incident & Stress Testing</span>
          </div>
          {incidentCount > 0 && (
            <span className="brand-badge" style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.4)' }}>
              {incidentCount} Active
            </span>
          )}
        </div>

        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
          Simulate real-world bottlenecks (accidents, road closures) to test algorithmic resilience:
        </div>

        <div className="incident-grid">
          <button className="incident-btn" onClick={onInjectRandomIncident}>
            <Flame size={14} color="#ef4444" />
            <span>Trigger Accident</span>
          </button>
          <button className="incident-btn" onClick={onClearIncidents} disabled={incidentCount === 0}>
            <RefreshCw size={14} color="#10b981" />
            <span>Clear Incidents</span>
          </button>
        </div>
      </div>
    </div>
  );
}
