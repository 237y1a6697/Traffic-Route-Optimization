import React, { useState } from 'react';
import { 
  ShieldAlert, AlertTriangle, Plus, Trash2, CheckCircle2, 
  MapPin, ShieldCheck, Activity, Info 
} from 'lucide-react';
import { TrafficService } from '../services/traffic';
import { HYDERABAD_ROAD_EDGES } from '../data/static/hyderabadGeoData';

interface IncidentsPageProps {
  trafficModel: TrafficService;
  trafficVersion: number;
  onTrafficModelChange: () => void;
}

export default function IncidentsPage({
  trafficModel,
  trafficVersion,
  onTrafficModelChange
}: IncidentsPageProps) {
  const [selectedEdgeId, setSelectedEdgeId] = useState<string>(HYDERABAD_ROAD_EDGES[0]?.id || '');
  const [incidentSeverity, setIncidentSeverity] = useState<number>(0.2); // 20% remaining capacity
  const [incidentType, setIncidentType] = useState<string>('Accident / Lane Blockage');

  const activeIncidents = Array.from(trafficModel.incidents.entries()).map(([edgeId, inc]) => {
    const edge = HYDERABAD_ROAD_EDGES.find(e => e.id === edgeId);
    return {
      edgeId,
      name: edge?.name || edgeId,
      from: edge ? String(edge.from) : '',
      to: edge ? String(edge.to) : '',
      factor: inc.factor,
      reason: inc.reason || 'Traffic Bottleneck'
    };
  });

  const handleAddIncident = () => {
    if (!selectedEdgeId) return;
    trafficModel.setIncident(selectedEdgeId, incidentSeverity, incidentType);
    onTrafficModelChange();
  };

  const handleRemoveIncident = (edgeId: string) => {
    trafficModel.setIncident(edgeId, 1.0);
    onTrafficModelChange();
  };

  const handleClearAll = () => {
    trafficModel.clearIncidents();
    onTrafficModelChange();
  };

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1400px', margin: '0 auto', color: '#f1f5f9' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <ShieldAlert size={22} color="#ef4444" />
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, color: '#fff' }}>
            Incident & Bottleneck Management Center
          </h1>
        </div>
        <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0 }}>
          Inject, manage, and simulate road closures, accidents, and capacity bottlenecks to evaluate dynamic reroute resilience.
        </p>
      </div>

      {/* Research Disclaimer */}
      <div style={{
        background: 'rgba(56, 189, 248, 0.08)',
        border: '1px solid rgba(56, 189, 248, 0.25)',
        borderRadius: '8px',
        padding: '0.75rem 1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        marginBottom: '1.5rem',
        fontSize: '0.8rem',
        color: '#bae6fd'
      }}>
        <Info size={18} style={{ flexShrink: 0 }} />
        <span>
          <strong>Research Sandbox:</strong> Incidents injected here dynamically modify link capacities across the road graph and trigger real-time QIGA rerouting.
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Incident Injector Form */}
        <div style={{
          background: '#1e293b',
          borderRadius: '12px',
          border: '1px solid #334155',
          padding: '1.25rem'
        }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 1rem 0', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Plus size={18} />
            <span>Simulate Incident or Road Hazard</span>
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.35rem' }}>
                Select Road Corridor:
              </label>
              <select
                value={selectedEdgeId}
                onChange={e => setSelectedEdgeId(e.target.value)}
                style={{
                  width: '100%',
                  background: '#0f172a',
                  color: '#fff',
                  border: '1px solid #334155',
                  borderRadius: '6px',
                  padding: '0.6rem',
                  fontSize: '0.8rem'
                }}
              >
                {HYDERABAD_ROAD_EDGES.map(edge => (
                  <option key={edge.id} value={edge.id}>
                    {edge.name} ({edge.from} → {edge.to})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.35rem' }}>
                Incident Category:
              </label>
              <select
                value={incidentType}
                onChange={e => setIncidentType(e.target.value)}
                style={{
                  width: '100%',
                  background: '#0f172a',
                  color: '#fff',
                  border: '1px solid #334155',
                  borderRadius: '6px',
                  padding: '0.6rem',
                  fontSize: '0.8rem'
                }}
              >
                <option value="Accident / Multi-Vehicle Collision">Accident / Multi-Vehicle Collision</option>
                <option value="Road Works / Metro Construction">Road Works / Metro Construction</option>
                <option value="Severe Waterlogging / Flash Flood">Severe Waterlogging / Flash Flood</option>
                <option value="Emergency VIP Convoy Closure">Emergency VIP Convoy Closure</option>
                <option value="Broken Down Heavy Vehicle">Broken Down Heavy Vehicle</option>
              </select>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.35rem' }}>
                <span style={{ color: '#94a3b8' }}>Remaining Capacity / Speed:</span>
                <span style={{ fontWeight: 700, color: incidentSeverity <= 0.3 ? '#ef4444' : '#f59e0b' }}>
                  {Math.round(incidentSeverity * 100)}% ({incidentSeverity <= 0.2 ? 'Severe Blockage' : 'Moderate Slowdown'})
                </span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.80"
                step="0.05"
                value={incidentSeverity}
                onChange={e => setIncidentSeverity(parseFloat(e.target.value))}
                style={{ width: '100%', accentColor: '#ef4444' }}
              />
            </div>

            <button
              onClick={handleAddIncident}
              className="btn btn-primary"
              style={{
                marginTop: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '0.65rem'
              }}
            >
              <Plus size={16} />
              <span>Inject Simulated Incident</span>
            </button>
          </div>
        </div>

        {/* Active Incidents List */}
        <div style={{
          background: '#1e293b',
          borderRadius: '12px',
          border: '1px solid #334155',
          padding: '1.25rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldAlert size={18} color="#ef4444" />
              <span>Active Network Bottlenecks ({activeIncidents.length})</span>
            </h2>

            {activeIncidents.length > 0 && (
              <button
                onClick={handleClearAll}
                className="btn btn-outline"
                style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
              >
                Clear All
              </button>
            )}
          </div>

          {activeIncidents.length === 0 ? (
            <div style={{
              background: '#0f172a',
              borderRadius: '8px',
              padding: '2rem',
              textAlign: 'center',
              border: '1px dashed #334155',
              color: '#94a3b8'
            }}>
              <CheckCircle2 size={32} color="#10b981" style={{ margin: '0 auto 0.75rem auto' }} />
              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#f8fafc' }}>All Corridors Clear</div>
              <p style={{ fontSize: '0.75rem', margin: '0.25rem 0 0 0', color: '#64748b' }}>
                No active simulated road hazards. Roads operating at normal free-flow conditions.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '350px', overflowY: 'auto' }}>
              {activeIncidents.map(inc => (
                <div
                  key={inc.edgeId}
                  style={{
                    background: '#0f172a',
                    border: '1px solid #ef444444',
                    borderRadius: '8px',
                    padding: '0.75rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f87171' }}>
                      {inc.name}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', margin: '0.2rem 0' }}>
                      {inc.reason}
                    </div>
                    <div style={{ fontSize: '0.65rem', color: '#64748b' }}>
                      Capacity reduced to {Math.round(inc.factor * 100)}% of normal
                    </div>
                  </div>

                  <button
                    onClick={() => handleRemoveIncident(inc.edgeId)}
                    style={{
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      color: '#ef4444',
                      borderRadius: '6px',
                      padding: '0.4rem',
                      cursor: 'pointer'
                    }}
                    title="Clear incident"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
