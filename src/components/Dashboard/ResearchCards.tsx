import React, { useState } from 'react';
import { 
  Activity, BarChart3, Trophy, BookOpen, 
  ChevronRight, Sliders
} from 'lucide-react';
import { RouteResult } from '../../models/route';
import { TrafficService } from '../../services/traffic';

interface ResearchCardsProps {
  recommendedRoute: RouteResult | null;
  alternativeRoutes: RouteResult[];
  activeSelectedRouteKey: string;
  setActiveSelectedRouteKey: (key: string) => void;
  trafficModel?: TrafficService;
  onOpenCompareModal: () => void;
  onOpenMathDoc: () => void;
  onOpenBenchmarkArena?: () => void;
  onOpenScenarioModal?: () => void;
}

export default function ResearchCards({
  recommendedRoute,
  alternativeRoutes = [],
  activeSelectedRouteKey,
  setActiveSelectedRouteKey,
  trafficModel: _trafficModel,
  onOpenCompareModal,
  onOpenMathDoc,
  onOpenBenchmarkArena: _onOpenBenchmarkArena,
  onOpenScenarioModal
}: ResearchCardsProps) {
  const [trafficTab, setTrafficTab] = useState<'live' | 'historical' | 'forecast'>('live');

  // Unified list of routes for the Live Tracking table
  const allRoutes: {
    key: string;
    label: string;
    isRecommended?: boolean;
    timeMins: number;
    distKm: number;
    congestion: string;
    congestionColor: string;
    fuelL: number;
    co2Kg: number;
    score: number;
  }[] = [];

  if (recommendedRoute) {
    allRoutes.push({
      key: 'QGA',
      label: 'Quantum (Recommended)',
      isRecommended: true,
      timeMins: recommendedRoute.travelTimeMins,
      distKm: recommendedRoute.distanceKm,
      congestion: recommendedRoute.maxVcRatio > 1.0 ? 'High' : recommendedRoute.maxVcRatio > 0.7 ? 'Medium' : 'Low',
      congestionColor: recommendedRoute.trafficBadgeColor || '#ef4444',
      fuelL: recommendedRoute.fuelLitres,
      co2Kg: recommendedRoute.co2Kg,
      score: recommendedRoute.optimizationScore || 0.74
    });
  }

  alternativeRoutes.forEach(r => {
    if (r.algorithm !== 'QGA') {
      const congestion = r.maxVcRatio > 1.0 ? 'High' : r.maxVcRatio > 0.75 ? 'Medium' : 'Low';
      const color = congestion === 'High' ? '#ef4444' : congestion === 'Medium' ? '#eab308' : '#22c55e';
      allRoutes.push({
        key: r.algorithm,
        label: r.algorithmName || r.type,
        isRecommended: false,
        timeMins: r.travelTimeMins,
        distKm: r.distanceKm,
        congestion,
        congestionColor: color,
        fuelL: r.fuelLitres,
        co2Kg: r.co2Kg,
        score: r.optimizationScore || (r.algorithm === 'FASTEST' ? 0.71 : r.algorithm === 'SHORTEST' ? 0.62 : 0.68)
      });
    }
  });

  // Fallback defaults if route not yet calculated
  if (allRoutes.length === 0) {
    allRoutes.push(
      { key: 'QGA', label: 'Quantum (Recommended)', isRecommended: true, timeMins: 43.7, distKm: 20.2, congestion: 'High', congestionColor: '#ef4444', fuelL: 1.95, co2Kg: 4.5, score: 0.74 },
      { key: 'FASTEST', label: 'Fastest', isRecommended: false, timeMins: 43.7, distKm: 20.2, congestion: 'High', congestionColor: '#ef4444', fuelL: 1.95, co2Kg: 4.5, score: 0.71 },
      { key: 'SHORTEST', label: 'Shortest', isRecommended: false, timeMins: 51.2, distKm: 17.6, congestion: 'Medium', congestionColor: '#eab308', fuelL: 1.68, co2Kg: 3.9, score: 0.62 },
      { key: 'LESS_CONGESTION', label: 'Less Congestion', isRecommended: false, timeMins: 46.8, distKm: 19.4, congestion: 'Low', congestionColor: '#22c55e', fuelL: 1.82, co2Kg: 4.2, score: 0.68 },
      { key: 'LOWER_EMISSIONS', label: 'Lower Emissions', isRecommended: false, timeMins: 49.3, distKm: 18.9, congestion: 'Low', congestionColor: '#22c55e', fuelL: 1.71, co2Kg: 3.5, score: 0.65 }
    );
  }

  return (
    <div className="research-grid">
      {/* CARD 1: Live Tracking Table */}
      <div className="glass-panel research-card">
        <div className="card-title" style={{ marginBottom: '0.65rem' }}>
          <div className="card-title-icon" style={{ color: '#06b6d4' }}>
            <Activity size={16} />
            <span>Live Tracking</span>
          </div>
        </div>

        <div className="table-responsive" style={{ maxHeight: '200px', overflowY: 'auto' }}>
          <table className="research-table">
            <thead>
              <tr>
                <th style={{ textAlign: 'left' }}>Route</th>
                <th>Time</th>
                <th>Distance</th>
                <th>Congestion</th>
                <th>Fuel</th>
                <th>CO₂</th>
                <th>Score</th>
              </tr>
            </thead>
            <tbody>
              {allRoutes.map((row) => {
                const isSelected = activeSelectedRouteKey === row.key || (row.isRecommended && activeSelectedRouteKey === 'QGA');
                return (
                  <tr
                    key={row.key}
                    onClick={() => setActiveSelectedRouteKey(row.key)}
                    style={{
                      cursor: 'pointer',
                      background: isSelected ? 'rgba(6, 182, 212, 0.12)' : 'transparent',
                      fontWeight: isSelected ? 600 : 400
                    }}
                  >
                    <td style={{ textAlign: 'left', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span
                        style={{
                          width: '7px',
                          height: '7px',
                          borderRadius: '50%',
                          background: row.isRecommended ? '#06b6d4' : isSelected ? '#38bdf8' : '#64748b'
                        }}
                      />
                      <span style={{ color: row.isRecommended ? '#22d3ee' : isSelected ? '#f8fafc' : '#cbd5e1' }}>
                        {row.label}
                      </span>
                    </td>
                    <td>{row.timeMins} min</td>
                    <td>{row.distKm} km</td>
                    <td>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        color: row.congestionColor,
                        fontSize: '0.72rem',
                        fontWeight: 600
                      }}>
                        <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: row.congestionColor }} />
                        {row.congestion}
                      </span>
                    </td>
                    <td>{row.fuelL} L</td>
                    <td>{row.co2Kg} kg</td>
                    <td className="mono" style={{ color: '#38bdf8', fontWeight: 700 }}>
                      {row.score.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: '0.6rem', borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '0.45rem' }}>
          <button
            onClick={onOpenCompareModal}
            className="link-button"
            style={{
              background: 'transparent',
              border: 'none',
              color: '#38bdf8',
              fontSize: '0.72rem',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer',
              fontWeight: 600,
              padding: 0
            }}
          >
            <span>Pareto Front (Time vs Emissions)</span>
            <ChevronRight size={13} />
          </button>
        </div>
      </div>

      {/* CARD 2: Traffic Intelligence */}
      <div className="glass-panel research-card">
        <div className="card-title" style={{ marginBottom: '0.4rem' }}>
          <div className="card-title-icon" style={{ color: '#38bdf8' }}>
            <BarChart3 size={16} />
            <span>Traffic Intelligence</span>
          </div>
          <span className="simulated-badge">SIMULATED</span>
        </div>

        {/* Sub-tabs: Live / Historical / Forecast */}
        <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.72rem', marginBottom: '0.5rem' }}>
          <button
            onClick={() => setTrafficTab('live')}
            style={{
              background: 'transparent',
              border: 'none',
              color: trafficTab === 'live' ? '#22d3ee' : '#64748b',
              fontWeight: trafficTab === 'live' ? 700 : 500,
              cursor: 'pointer',
              padding: 0
            }}
          >
            Live /
          </button>
          <button
            onClick={() => setTrafficTab('historical')}
            style={{
              background: 'transparent',
              border: 'none',
              color: trafficTab === 'historical' ? '#22d3ee' : '#64748b',
              fontWeight: trafficTab === 'historical' ? 700 : 500,
              cursor: 'pointer',
              padding: 0
            }}
          >
            Historical
          </button>
          <button
            onClick={() => setTrafficTab('forecast')}
            style={{
              background: 'transparent',
              border: 'none',
              color: trafficTab === 'forecast' ? '#22d3ee' : '#64748b',
              fontWeight: trafficTab === 'forecast' ? 700 : 500,
              cursor: 'pointer',
              padding: 0
            }}
          >
            Forecast
          </button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
          <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Traffic intensity (Next 6 Hours)</span>
          <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.65rem' }}>
            <span style={{ color: '#22c55e', display: 'flex', alignItems: 'center', gap: '3px' }}>● Low</span>
            <span style={{ color: '#eab308', display: 'flex', alignItems: 'center', gap: '3px' }}>● Moderate</span>
            <span style={{ color: '#f97316', display: 'flex', alignItems: 'center', gap: '3px' }}>● Heavy</span>
            <span style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '3px' }}>● Severe</span>
          </div>
        </div>

        {/* SVG Time-Series Chart */}
        <div style={{ width: '100%', height: '80px', position: 'relative' }}>
          <svg viewBox="0 0 300 70" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
            <defs>
              <linearGradient id="trafficGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ef4444" stopOpacity="0.45" />
                <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#22c55e" stopOpacity="0.05" />
              </linearGradient>
            </defs>

            {/* Grid lines */}
            <line x1="0" y1="20" x2="300" y2="20" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
            <line x1="0" y1="45" x2="300" y2="45" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />

            {/* Area */}
            <polygon
              points="0,60 0,38 50,22 100,42 150,30 200,48 250,26 300,35 300,60"
              fill="url(#trafficGradient)"
            />

            {/* Main Path Curve */}
            <polyline
              points="0,38 50,22 100,42 150,30 200,48 250,26 300,35"
              fill="none"
              stroke="#06b6d4"
              strokeWidth="2.2"
              strokeLinecap="round"
            />

            {/* Secondary Comparison Path (e.g. Unmanaged vs QGA) */}
            <polyline
              points="0,48 50,30 100,50 150,40 200,56 250,35 300,45"
              fill="none"
              stroke="#a855f7"
              strokeWidth="1.6"
              strokeDasharray="4 2"
              strokeLinecap="round"
            />

            {/* Data Dots */}
            <circle cx="50" cy="22" r="3" fill="#ef4444" stroke="#fff" strokeWidth="1" />
            <circle cx="150" cy="30" r="3" fill="#f59e0b" stroke="#fff" strokeWidth="1" />
            <circle cx="250" cy="26" r="3" fill="#ef4444" stroke="#fff" strokeWidth="1" />
          </svg>

          {/* Time Labels */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '0.62rem',
            color: '#64748b',
            marginTop: '2px'
          }}>
            <span>08 AM</span>
            <span>10 AM</span>
            <span>12 PM</span>
            <span>02 PM</span>
            <span>04 PM</span>
            <span>06 PM</span>
          </div>
        </div>

        {/* Footer info & adjust scenario button */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '0.5rem',
          paddingTop: '0.45rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          fontSize: '0.72rem'
        }}>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#f8fafc' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ef4444' }} />
              Current: <strong style={{ color: '#fca5a5' }}>Heavy</strong>
            </span>
            <span style={{ color: '#64748b' }}>Source: <strong style={{ color: '#94a3b8' }}>Simulated</strong></span>
          </div>

          <button
            onClick={onOpenScenarioModal}
            className="btn btn-sm btn-outline"
            style={{ fontSize: '0.68rem', padding: '3px 8px' }}
          >
            <Sliders size={11} />
            <span>Adjust Scenario</span>
          </button>
        </div>
      </div>

      {/* CARD 3: Benchmark Arena */}
      <div className="glass-panel research-card">
        <div className="card-title" style={{ marginBottom: '0.4rem' }}>
          <div className="card-title-icon" style={{ color: '#f59e0b' }}>
            <Trophy size={16} />
            <span>Benchmark Arena</span>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Algorithm Performance (Avg. over 5 runs)</span>
          <div style={{ display: 'flex', gap: '0.6rem', fontSize: '0.65rem' }}>
            <span style={{ color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '3px' }}>● Time (min)</span>
            <span style={{ color: '#c084fc', display: 'flex', alignItems: 'center', gap: '3px' }}>● Iterations</span>
          </div>
        </div>

        {/* SVG Bar Chart */}
        <div style={{ width: '100%', height: '85px' }}>
          <svg viewBox="0 0 280 80" style={{ width: '100%', height: '100%' }}>
            {/* Horizontal guideline */}
            <line x1="20" y1="65" x2="270" y2="65" stroke="rgba(255,255,255,0.12)" />

            {/* Dijkstra Bars */}
            <rect x="40" y="20" width="16" height="45" rx="3" fill="#0284c7" />
            <text x="48" y="16" fill="#7dd3fc" fontSize="9" textAnchor="middle" fontWeight="bold">62.4</text>
            <rect x="60" y="10" width="16" height="55" rx="3" fill="#9333ea" />
            <text x="68" y="7" fill="#d8b4fe" fontSize="9" textAnchor="middle" fontWeight="bold">210</text>
            <text x="58" y="76" fill="#94a3b8" fontSize="9" textAnchor="middle">Dijkstra</text>

            {/* A* Bars */}
            <rect x="120" y="28" width="16" height="37" rx="3" fill="#0284c7" />
            <text x="128" y="24" fill="#7dd3fc" fontSize="9" textAnchor="middle" fontWeight="bold">51.8</text>
            <rect x="140" y="24" width="16" height="41" rx="3" fill="#9333ea" />
            <text x="148" y="20" fill="#d8b4fe" fontSize="9" textAnchor="middle" fontWeight="bold">142</text>
            <text x="138" y="76" fill="#94a3b8" fontSize="9" textAnchor="middle">A*</text>

            {/* QGA (Ours) Bars */}
            <rect x="200" y="34" width="16" height="31" rx="3" fill="#06b6d4" />
            <text x="208" y="30" fill="#22d3ee" fontSize="9" textAnchor="middle" fontWeight="bold">43.7</text>
            <rect x="220" y="38" width="16" height="27" rx="3" fill="#a855f7" />
            <text x="228" y="34" fill="#c084fc" fontSize="9" textAnchor="middle" fontWeight="bold">98</text>
            <text x="218" y="76" fill="#22d3ee" fontSize="9" textAnchor="middle" fontWeight="bold">QGA (Ours)</text>
          </svg>
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '0.5rem',
          paddingTop: '0.45rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          fontSize: '0.72rem'
        }}>
          <div>
            <span style={{ color: '#64748b' }}>Best Solution: </span>
            <strong style={{ color: '#22d3ee' }}>QGA (Quantum-Inspired)</strong>
          </div>
          <div>
            <span style={{ color: '#64748b' }}>Improvement: </span>
            <strong style={{ color: '#10b981' }}>+16.5%</strong>
          </div>
        </div>
      </div>

      {/* CARD 4: Math & Theory */}
      <div className="glass-panel research-card">
        <div className="card-title" style={{ marginBottom: '0.4rem' }}>
          <div className="card-title-icon" style={{ color: '#c084fc' }}>
            <BookOpen size={16} />
            <span>Math & Theory</span>
          </div>
        </div>

        {/* Equations */}
        <div style={{ fontSize: '0.72rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <div>
            <span style={{ color: '#94a3b8', fontWeight: 600 }}>Quantum Genetic Algorithm (QGA)</span>
            <div className="mono" style={{ color: '#38bdf8', background: 'rgba(15, 23, 42, 0.6)', padding: '2px 6px', borderRadius: '4px', marginTop: '1px' }}>
              |ψ⟩ = α|0⟩ + β|1⟩, &nbsp; |α|² + |β|² = 1
            </div>
          </div>

          <div>
            <span style={{ color: '#94a3b8', fontWeight: 600 }}>Fitness Function</span>
            <div className="mono" style={{ color: '#c084fc', background: 'rgba(15, 23, 42, 0.6)', padding: '2px 6px', borderRadius: '4px', marginTop: '1px' }}>
              f(x) = w₁·T + w₂·D + w₃·C + w₄·E
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', fontSize: '0.65rem', color: '#64748b' }}>
            <span>• T - Travel time</span>
            <span>• C - Congestion cost</span>
            <span>• D - Distance</span>
            <span>• E - Emissions</span>
          </div>

          <div style={{ marginTop: '2px' }}>
            <span style={{ color: '#94a3b8', fontWeight: 600, fontSize: '0.7rem' }}>Pareto Dominance</span>
            <div className="mono" style={{ fontSize: '0.65rem', color: '#22c55e' }}>
              x ≻ y if: ∀i fᵢ(x) ≤ fᵢ(y) ∧ ∃j fⱼ(x) &lt; fⱼ(y)
            </div>
          </div>
        </div>

        {/* Footer Button */}
        <div style={{ marginTop: '0.5rem', paddingTop: '0.45rem', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
          <button
            onClick={onOpenMathDoc}
            className="btn btn-sm btn-outline"
            style={{ width: '100%', fontSize: '0.72rem', padding: '4px 8px' }}
          >
            <BookOpen size={12} />
            <span>View Full Explanation</span>
          </button>
        </div>
      </div>
    </div>
  );
}
