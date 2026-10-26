import React, { useState } from 'react';
import { 
  Activity, AlertTriangle, ShieldCheck, 
  Info, MapPin, Zap, Clock 
} from 'lucide-react';
import RealMap from '../components/Map/RealMap';
import TrafficConditionCard from '../components/Traffic/TrafficConditionCard';
import { TrafficService } from '../services/traffic';
import { HYDERABAD_ROAD_EDGES } from '../data/static/hyderabadGeoData';

interface LiveTrafficPageProps {
  trafficModel: TrafficService;
  trafficVersion: number;
  onTrafficModelChange: () => void;
}

export default function LiveTrafficPage({
  trafficModel,
  trafficVersion,
  onTrafficModelChange
}: LiveTrafficPageProps) {
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);

  const selectedEdge = selectedEdgeId 
    ? HYDERABAD_ROAD_EDGES.find(e => e.id === selectedEdgeId) 
    : null;

  const selectedEdgeMetrics = selectedEdge 
    ? trafficModel.getEdgeMetrics(selectedEdge) 
    : null;

  const handleToggleIncident = (edgeId: string) => {
    if (trafficModel.incidents.has(edgeId)) {
      trafficModel.setIncident(edgeId, 1.0);
    } else {
      trafficModel.setIncident(edgeId, 0.15, 'Simulated Incident / Bottleneck');
    }
    onTrafficModelChange();
  };

  const handleClearAll = () => {
    trafficModel.clearIncidents();
    onTrafficModelChange();
  };

  // Compute live congestion stats across the road network
  const totalEdges = HYDERABAD_ROAD_EDGES.length;
  let incidentCount = 0;
  let heavyCount = 0;
  let moderateCount = 0;
  let freeFlowCount = 0;
  let totalSpeed = 0;

  HYDERABAD_ROAD_EDGES.forEach(edge => {
    const m = trafficModel.getEdgeMetrics(edge);
    totalSpeed += m.currentSpeedKmH;
    if (m.isIncident) {
      incidentCount++;
    } else if (m.congestionLevel === 'severe' || m.congestionLevel === 'high') {
      heavyCount++;
    } else if (m.congestionLevel === 'moderate') {
      moderateCount++;
    } else {
      freeFlowCount++;
    }
  });

  const avgSpeed = Math.round(totalSpeed / (totalEdges || 1));

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', height: 'calc(100vh - 70px)', overflow: 'hidden' }}>
      {/* Left Sidebar - Live Traffic Controls & Status */}
      <div style={{
        background: '#0f172a',
        borderRight: '1px solid #1e293b',
        padding: '1.25rem',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <Activity size={18} color="#10b981" />
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: '#f8fafc' }}>
              Live Traffic Monitor
            </h2>
          </div>
          <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>
            Simulated real-time congestion and incident feed across Hyderabad arterial network.
          </p>
        </div>

        {/* Research Disclaimer */}
        <div style={{
          background: 'rgba(56, 189, 248, 0.08)',
          border: '1px solid rgba(56, 189, 248, 0.25)',
          borderRadius: '8px',
          padding: '0.65rem 0.85rem',
          fontSize: '0.72rem',
          color: '#bae6fd',
          display: 'flex',
          gap: '0.5rem'
        }}>
          <Info size={16} style={{ flexShrink: 0, marginTop: '1px' }} />
          <span>Traffic data is initially simulated research data using BPR formulas.</span>
        </div>

        {/* Global Period Info Card */}
        <TrafficConditionCard trafficModel={trafficModel} />

        {/* Network Health Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
          <div style={{ background: '#1e293b', padding: '0.75rem', borderRadius: '8px', border: '1px solid #334155' }}>
            <div style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase' }}>Avg Network Speed</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#38bdf8' }}>{avgSpeed} km/h</div>
            <div style={{ fontSize: '0.65rem', color: '#64748b' }}>Free-flow base: ~60 km/h</div>
          </div>

          <div style={{ background: '#1e293b', padding: '0.75rem', borderRadius: '8px', border: '1px solid #334155' }}>
            <div style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase' }}>Active Incidents</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: incidentCount > 0 ? '#ef4444' : '#10b981' }}>
              {incidentCount}
            </div>
            <div style={{ fontSize: '0.65rem', color: '#64748b' }}>Manual bottlenecks</div>
          </div>
        </div>

        {/* Congestion Distribution */}
        <div style={{ background: '#1e293b', padding: '0.85rem', borderRadius: '8px', border: '1px solid #334155' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#e2e8f0', marginBottom: '0.5rem' }}>
            Congestion Breakdown ({totalEdges} Segments)
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#22c55e' }}>● Free Flow (&lt;45%)</span>
              <span>{freeFlowCount}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#eab308' }}>● Moderate (45-75%)</span>
              <span>{moderateCount}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#f97316' }}>● Heavy (&gt;75%)</span>
              <span>{heavyCount}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#ef4444' }}>● Incident / Bottleneck</span>
              <span>{incidentCount}</span>
            </div>
          </div>
        </div>

        {/* Selected Road Segment Inspector */}
        {selectedEdge && selectedEdgeMetrics ? (
          <div style={{
            background: 'rgba(30, 41, 59, 0.8)',
            border: '1px solid #38bdf8',
            borderRadius: '8px',
            padding: '0.85rem'
          }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#38bdf8', marginBottom: '0.25rem' }}>
              {selectedEdge.name}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '0.5rem' }}>
              {String(selectedEdge.from)} → {String(selectedEdge.to)} ({selectedEdge.distance} km)
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', fontSize: '0.75rem', marginBottom: '0.75rem' }}>
              <div style={{ background: '#0f172a', padding: '0.4rem', borderRadius: '4px' }}>
                <span style={{ color: '#94a3b8' }}>Speed: </span>
                <strong style={{ color: '#38bdf8' }}>{selectedEdgeMetrics.currentSpeedKmH} km/h</strong>
              </div>
              <div style={{ background: '#0f172a', padding: '0.4rem', borderRadius: '4px' }}>
                <span style={{ color: '#94a3b8' }}>Travel Time: </span>
                <strong style={{ color: '#f8fafc' }}>{selectedEdgeMetrics.actualTravelTimeMins} min</strong>
              </div>
              <div style={{ background: '#0f172a', padding: '0.4rem', borderRadius: '4px' }}>
                <span style={{ color: '#94a3b8' }}>V/C Ratio: </span>
                <strong style={{ color: selectedEdgeMetrics.vcRatio > 0.9 ? '#ef4444' : '#10b981' }}>{selectedEdgeMetrics.vcRatio}</strong>
              </div>
              <div style={{ background: '#0f172a', padding: '0.4rem', borderRadius: '4px' }}>
                <span style={{ color: '#94a3b8' }}>Volume: </span>
                <strong style={{ color: '#f8fafc' }}>{selectedEdgeMetrics.volumeVehH} veh/h</strong>
              </div>
            </div>

            <button
              onClick={() => handleToggleIncident(selectedEdge.id)}
              className="btn btn-secondary"
              style={{ width: '100%', fontSize: '0.75rem', padding: '0.4rem' }}
            >
              {trafficModel.incidents.has(selectedEdge.id) ? 'Remove Incident' : 'Inject Incident Here'}
            </button>
          </div>
        ) : (
          <div style={{
            background: '#1e293b',
            padding: '1rem',
            borderRadius: '8px',
            border: '1px dashed #475569',
            textAlign: 'center',
            fontSize: '0.75rem',
            color: '#94a3b8'
          }}>
            Click any road segment or incident marker on the map to inspect live dynamics.
          </div>
        )}

        {/* Quick Incident Actions */}
        <div style={{ marginTop: 'auto', paddingTop: '0.5rem', borderTop: '1px solid #1e293b' }}>
          <button
            onClick={handleClearAll}
            disabled={incidentCount === 0}
            className="btn btn-outline"
            style={{ width: '100%', fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
          >
            <ShieldCheck size={14} />
            <span>Clear All Incidents ({incidentCount})</span>
          </button>
        </div>
      </div>

      {/* Right Area - Full-view Map */}
      <div style={{ position: 'relative', height: '100%' }}>
        <RealMap
          trafficModel={trafficModel}
          onToggleIncident={handleToggleIncident}
          onSelectEdge={(edgeId) => setSelectedEdgeId(edgeId)}
          selectedEdgeId={selectedEdgeId}
        />
      </div>
    </div>
  );
}
