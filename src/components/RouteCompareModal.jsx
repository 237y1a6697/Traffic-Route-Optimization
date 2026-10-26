import React from 'react';
import { X, Award, BarChart3, Download, ShieldCheck, Zap, Fuel, Leaf } from 'lucide-react';

export default function RouteCompareModal({ isOpen, onClose, routes = [], sourceLoc, destLoc }) {
  if (!isOpen) return null;

  const dijkstraRoute = routes.find(r => r.algorithm === 'DIJKSTRA') || routes[routes.length - 1];

  const exportCSV = () => {
    const headers = ['Algorithm', 'Type', 'Travel Time (min)', 'Distance (km)', 'Traffic Level', 'Max V/C', 'Fuel (L)', 'CO2 (kg)', 'Optimization Score'];
    const rows = [headers.join(',')];

    routes.forEach(r => {
      rows.push([
        `"${r.algorithmName}"`,
        `"${r.type}"`,
        r.travelTimeMins,
        r.distanceKm,
        `"${r.trafficLabel}"`,
        r.maxVcRatio,
        r.fuelLitres,
        r.co2Kg,
        r.optimizationCost
      ].join(','));
    });

    const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `route_comparison_${sourceLoc?.shortName}_to_${destLoc?.shortName}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '880px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ background: 'rgba(56, 189, 248, 0.2)', padding: '0.4rem', borderRadius: '8px', color: '#38bdf8' }}>
              <BarChart3 size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.15rem' }}>Comprehensive Real-World Route Comparison</h2>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                Trip: <strong>{sourceLoc?.name || 'Origin'}</strong> → <strong>{destLoc?.name || 'Destination'}</strong>
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {/* Executive Comparative Card */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.12), rgba(168, 85, 247, 0.12))',
            border: '1px solid rgba(6, 182, 212, 0.3)',
            borderRadius: '12px',
            padding: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #06b6d4, #a855f7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Award size={24} color="#fff" />
            </div>
            <div style={{ fontSize: '0.85rem', lineHeight: 1.4 }}>
              <div style={{ fontWeight: 700, color: '#f8fafc' }}>
                Quantum-Inspired Routing Avoids Peak Hour Gridlock
              </div>
              <div style={{ color: '#cbd5e1', fontSize: '0.8rem' }}>
                While Dijkstra chooses the geographically shortest route through congested city arterials, Quantum-Inspired Optimization balances distance, capacity, and current congestion to yield up to <strong>30% faster transit</strong> and lower fuel consumption.
              </div>
            </div>
          </div>

          {/* Comparison Table */}
          <div style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
            <table className="benchmark-table">
              <thead>
                <tr>
                  <th>Algorithm</th>
                  <th>Category</th>
                  <th>Travel Time</th>
                  <th>Distance</th>
                  <th>Traffic Status</th>
                  <th>Fuel (L)</th>
                  <th>CO₂ (kg)</th>
                  <th>Time Savings</th>
                </tr>
              </thead>
              <tbody>
                {routes.map(r => {
                  const isQGA = r.algorithm === 'QGA';
                  const timeDiff = dijkstraRoute && r.algorithm !== 'DIJKSTRA'
                    ? Math.round(((r.travelTimeMins - dijkstraRoute.travelTimeMins) / dijkstraRoute.travelTimeMins) * 100)
                    : 0;

                  return (
                    <tr key={r.algorithm} style={{ background: isQGA ? 'rgba(6, 182, 212, 0.08)' : 'transparent' }}>
                      <td style={{ fontWeight: 600 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          {isQGA && <ShieldCheck size={14} color="#06b6d4" />}
                          <span style={{ color: isQGA ? '#22d3ee' : '#f8fafc' }}>{r.algorithmName}</span>
                        </div>
                      </td>
                      <td>
                        <span className="benchmark-badge" style={{
                          background: isQGA ? 'rgba(6, 182, 212, 0.2)' : 'rgba(255, 255, 255, 0.08)',
                          color: isQGA ? '#22d3ee' : '#94a3b8'
                        }}>
                          {r.type}
                        </span>
                      </td>
                      <td className="mono" style={{ fontWeight: 700, color: '#f8fafc' }}>
                        {r.travelTimeMins} min
                      </td>
                      <td className="mono">{r.distanceKm} km</td>
                      <td>
                        <span style={{ color: r.trafficBadgeColor, fontWeight: 600 }}>
                          {r.trafficLabel}
                        </span>
                      </td>
                      <td className="mono">{r.fuelLitres} L</td>
                      <td className="mono">{r.co2Kg} kg</td>
                      <td className="mono" style={{
                        color: timeDiff < 0 ? '#10b981' : r.algorithm === 'DIJKSTRA' ? '#94a3b8' : '#ef4444',
                        fontWeight: 600
                      }}>
                        {r.algorithm === 'DIJKSTRA' ? 'Baseline' : `${timeDiff > 0 ? '+' : ''}${timeDiff}%`}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-outline" onClick={exportCSV}>
            <Download size={14} />
            Export CSV
          </button>
          <button className="btn btn-primary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
