import React, { useState } from 'react';
import { X, Sliders, AlertTriangle, CloudRain, Sun, Clock, ShieldAlert, Check } from 'lucide-react';
import { TrafficService } from '../../services/traffic';

interface TrafficScenarioModalProps {
  isOpen: boolean;
  onClose: () => void;
  trafficModel: TrafficService;
  onTrafficModelChange: () => void;
}

export default function TrafficScenarioModal({
  isOpen,
  onClose,
  trafficModel,
  onTrafficModelChange
}: TrafficScenarioModalProps) {
  if (!isOpen) return null;

  const [activePreset, setActivePreset] = useState<'morning' | 'midday' | 'evening' | 'night'>('morning');
  const [rushFactor, setRushFactor] = useState<number>(1.2);
  const [weather, setWeather] = useState<'clear' | 'rain' | 'storm'>('clear');

  const handleApplyPreset = (preset: 'morning' | 'midday' | 'evening' | 'night') => {
    setActivePreset(preset);
    if (preset === 'morning') {
      trafficModel.timeOfDayHour = 8;
      trafficModel.timeOfDayMinute = 30;
      setRushFactor(1.35);
    } else if (preset === 'midday') {
      trafficModel.timeOfDayHour = 13;
      trafficModel.timeOfDayMinute = 0;
      setRushFactor(0.85);
    } else if (preset === 'evening') {
      trafficModel.timeOfDayHour = 18;
      trafficModel.timeOfDayMinute = 30;
      setRushFactor(1.45);
    } else if (preset === 'night') {
      trafficModel.timeOfDayHour = 23;
      trafficModel.timeOfDayMinute = 0;
      setRushFactor(0.5);
    }
    onTrafficModelChange();
  };

  const toggleIncidentOnCorridor = (edgeId: string, name: string) => {
    if (trafficModel.incidents.has(edgeId)) {
      trafficModel.setIncident(edgeId, 1.0);
    } else {
      trafficModel.setIncident(edgeId, 0.15, `Simulated bottleneck at ${name}`);
    }
    onTrafficModelChange();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '620px' }}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ background: 'rgba(6, 182, 212, 0.2)', padding: '0.4rem', borderRadius: '8px', color: '#06b6d4' }}>
              <Sliders size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.15rem' }}>Urban Traffic Scenario Calibration</h2>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                Tune Bureau of Public Roads (BPR) density factors, departure time, and corridor incidents
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Preset Buttons */}
          <div>
            <label style={{ fontSize: '0.78rem', color: '#cbd5e1', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>
              Departure Time Scenario
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
              {[
                { id: 'morning', label: 'Morning Peak', time: '08:30 AM', color: '#ef4444' },
                { id: 'midday', label: 'Midday Normal', time: '01:00 PM', color: '#22c55e' },
                { id: 'evening', label: 'Evening Peak', time: '06:30 PM', color: '#f97316' },
                { id: 'night', label: 'Night Free-flow', time: '11:00 PM', color: '#38bdf8' }
              ].map(p => (
                <button
                  key={p.id}
                  onClick={() => handleApplyPreset(p.id as any)}
                  style={{
                    padding: '0.55rem 0.35rem',
                    borderRadius: '8px',
                    border: `1px solid ${activePreset === p.id ? p.color : 'rgba(255,255,255,0.08)'}`,
                    background: activePreset === p.id ? `${p.color}22` : 'rgba(15, 23, 42, 0.6)',
                    color: activePreset === p.id ? p.color : '#cbd5e1',
                    cursor: 'pointer',
                    textAlign: 'center'
                  }}
                >
                  <div style={{ fontSize: '0.75rem', fontWeight: 700 }}>{p.label}</div>
                  <div style={{ fontSize: '0.65rem', color: '#64748b', marginTop: '2px' }}>{p.time}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Congestion Multiplier Slider */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#cbd5e1', marginBottom: '0.35rem' }}>
              <span style={{ fontWeight: 600 }}>Urban Congestion Multiplier (V/C Scaling)</span>
              <span className="mono" style={{ color: '#22d3ee', fontWeight: 700 }}>{rushFactor.toFixed(2)}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.05"
              value={rushFactor}
              onChange={e => {
                const val = parseFloat(e.target.value);
                setRushFactor(val);
                trafficModel.rushHourMultiplier = val;
                onTrafficModelChange();
              }}
              style={{ width: '100%', accentColor: '#06b6d4', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: '#64748b', marginTop: '2px' }}>
              <span>0.5x (Light Traffic)</span>
              <span>1.0x (Standard)</span>
              <span>2.0x (Gridlock)</span>
            </div>
          </div>

          {/* Weather Simulation */}
          <div>
            <label style={{ fontSize: '0.78rem', color: '#cbd5e1', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>
              Atmospheric & Weather Conditions
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
              {[
                { id: 'clear', label: 'Clear Sky', icon: <Sun size={15} color="#eab308" />, desc: 'Normal road friction' },
                { id: 'rain', label: 'Monsoon Rain', icon: <CloudRain size={15} color="#38bdf8" />, desc: '-15% speed cap' },
                { id: 'storm', label: 'Severe Storm', icon: <AlertTriangle size={15} color="#ef4444" />, desc: '-35% speed & delays' }
              ].map(w => (
                <button
                  key={w.id}
                  onClick={() => {
                    setWeather(w.id as any);
                    trafficModel.weatherFactor = w.id === 'storm' ? 0.65 : w.id === 'rain' ? 0.85 : 1.0;
                    onTrafficModelChange();
                  }}
                  style={{
                    padding: '0.55rem',
                    borderRadius: '8px',
                    border: `1px solid ${weather === w.id ? '#06b6d4' : 'rgba(255,255,255,0.08)'}`,
                    background: weather === w.id ? 'rgba(6, 182, 212, 0.15)' : 'rgba(15, 23, 42, 0.6)',
                    color: weather === w.id ? '#f8fafc' : '#94a3b8',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  {w.icon}
                  <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{w.label}</span>
                  <span style={{ fontSize: '0.62rem', color: '#64748b' }}>{w.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Incident Injection */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <label style={{ fontSize: '0.78rem', color: '#cbd5e1', fontWeight: 600 }}>
                Corridor Incident & Disruption Injector
              </label>
              {trafficModel.incidents.size > 0 && (
                <button
                  onClick={() => {
                    trafficModel.clearIncidents();
                    onTrafficModelChange();
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#ef4444',
                    fontSize: '0.7rem',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  Clear All ({trafficModel.incidents.size})
                </button>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
              {[
                { id: 'panjagutta_incident', name: 'Panjagutta Flyover Jam' },
                { id: 'begumpet_incident', name: 'Begumpet Airport Road Closure' },
                { id: 'jubilee_incident', name: 'Jubilee Hills Road 36 Repair' },
                { id: 'mehdipatnam_incident', name: 'PVNR Expressway Breakdown' }
              ].map(corridor => {
                const isActive = trafficModel.incidents.has(corridor.id);
                return (
                  <button
                    key={corridor.id}
                    onClick={() => toggleIncidentOnCorridor(corridor.id, corridor.name)}
                    style={{
                      padding: '0.5rem 0.65rem',
                      borderRadius: '6px',
                      border: `1px solid ${isActive ? '#ef4444' : 'rgba(255,255,255,0.08)'}`,
                      background: isActive ? 'rgba(239, 68, 68, 0.2)' : 'rgba(15, 23, 42, 0.6)',
                      color: isActive ? '#fca5a5' : '#cbd5e1',
                      fontSize: '0.72rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <span>{corridor.name}</span>
                    <span style={{
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      color: isActive ? '#ef4444' : '#64748b'
                    }}>
                      {isActive ? 'ACTIVE' : 'Clear'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
          <button className="btn btn-primary" onClick={onClose} style={{ padding: '0.5rem 1.25rem' }}>
            <span>Apply Scenario & Close</span>
          </button>
        </div>
      </div>
    </div>
  );
}
