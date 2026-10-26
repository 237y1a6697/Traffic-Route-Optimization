import React from 'react';
import { Clock, Activity, AlertCircle, Leaf, Zap, TrendingUp, TrendingDown } from 'lucide-react';

export default function MetricsPanel({ activeAlgorithm, algorithmResults }) {
  const current = algorithmResults[activeAlgorithm]?.metrics;
  const dijkstra = algorithmResults['DIJKSTRA']?.metrics;

  if (!current) {
    return (
      <div className="glass-panel control-card">
        <div className="card-title">Live Network KPIs</div>
        <div style={{ color: '#64748b', fontSize: '0.8rem', padding: '1rem', textAlign: 'center' }}>
          No metrics computed. Run optimization to evaluate.
        </div>
      </div>
    );
  }

  // Calculate percentage improvements vs Dijkstra baseline
  const calcDiff = (val, baseVal, lowerIsBetter = true) => {
    if (!baseVal || val === undefined) return null;
    const diff = ((val - baseVal) / baseVal) * 100;
    const isImprovement = lowerIsBetter ? diff < 0 : diff > 0;
    return {
      percent: Math.abs(Math.round(diff * 10) / 10),
      isImprovement,
      text: `${diff > 0 ? '+' : ''}${Math.round(diff * 10) / 10}%`
    };
  };

  const timeDiff = activeAlgorithm !== 'DIJKSTRA' ? calcDiff(current.avgTravelTime, dijkstra?.avgTravelTime, true) : null;
  const tsttDiff = activeAlgorithm !== 'DIJKSTRA' ? calcDiff(current.totalTravelTime, dijkstra?.totalTravelTime, true) : null;
  const co2Diff = activeAlgorithm !== 'DIJKSTRA' ? calcDiff(current.co2Kg, dijkstra?.co2Kg, true) : null;
  const vcDiff = activeAlgorithm !== 'DIJKSTRA' ? calcDiff(current.maxCongestionRatio, dijkstra?.maxCongestionRatio, true) : null;

  return (
    <div className="glass-panel control-card">
      <div className="card-title">
        <div className="card-title-icon">
          <Activity size={18} />
          <span>Real-Time Network Performance</span>
        </div>
        <span className="brand-badge">BPR Latency Model</span>
      </div>

      <div className="metrics-grid">
        {/* Metric 1: Avg Travel Time */}
        <div className="metric-card">
          <div className="metric-header">
            <span>Avg Travel Time</span>
            <Clock size={14} color="#38bdf8" />
          </div>
          <div className="metric-value">
            {current.avgTravelTime}
            <span className="metric-unit">mins</span>
          </div>
          {timeDiff && (
            <div className={`metric-diff ${timeDiff.isImprovement ? 'positive' : 'negative'}`}>
              {timeDiff.isImprovement ? <TrendingDown size={12} /> : <TrendingUp size={12} />}
              <span>{timeDiff.text} vs Dijkstra</span>
            </div>
          )}
        </div>

        {/* Metric 2: Total System Travel Time (TSTT) */}
        <div className="metric-card">
          <div className="metric-header">
            <span>System TSTT</span>
            <Zap size={14} color="#a855f7" />
          </div>
          <div className="metric-value">
            {current.totalTravelTime}
            <span className="metric-unit">veh-min</span>
          </div>
          {tsttDiff && (
            <div className={`metric-diff ${tsttDiff.isImprovement ? 'positive' : 'negative'}`}>
              {tsttDiff.isImprovement ? <TrendingDown size={12} /> : <TrendingUp size={12} />}
              <span>{tsttDiff.text} vs Baseline</span>
            </div>
          )}
        </div>

        {/* Metric 3: Max Congestion V/C */}
        <div className="metric-card">
          <div className="metric-header">
            <span>Max Congestion (V/C)</span>
            <AlertCircle size={14} color={current.maxCongestionRatio >= 1.0 ? '#ef4444' : '#10b981'} />
          </div>
          <div className="metric-value" style={{ color: current.maxCongestionRatio >= 1.0 ? '#f87171' : '#f8fafc' }}>
            {current.maxCongestionRatio}
            <span className="metric-unit">ratio</span>
          </div>
          {vcDiff ? (
            <div className={`metric-diff ${vcDiff.isImprovement ? 'positive' : 'negative'}`}>
              {vcDiff.isImprovement ? <TrendingDown size={12} /> : <TrendingUp size={12} />}
              <span>{vcDiff.text} vs Dijkstra</span>
            </div>
          ) : (
            <div style={{ fontSize: '0.7rem', color: current.maxCongestionRatio < 1.0 ? '#10b981' : '#ef4444' }}>
              {current.maxCongestionRatio < 1.0 ? 'Under Capacity' : 'Over Capacity (Jam)'}
            </div>
          )}
        </div>

        {/* Metric 4: CO2 Emissions */}
        <div className="metric-card">
          <div className="metric-header">
            <span>CO₂ Emissions</span>
            <Leaf size={14} color="#10b981" />
          </div>
          <div className="metric-value">
            {current.co2Kg}
            <span className="metric-unit">kg CO₂</span>
          </div>
          {co2Diff && (
            <div className={`metric-diff ${co2Diff.isImprovement ? 'positive' : 'negative'}`}>
              {co2Diff.isImprovement ? <TrendingDown size={12} /> : <TrendingUp size={12} />}
              <span>{co2Diff.text} Fuel Saved</span>
            </div>
          )}
        </div>
      </div>

      {/* Severe Bottlenecks Bar */}
      <div style={{
        marginTop: '0.4rem',
        padding: '0.65rem 0.85rem',
        borderRadius: '8px',
        background: current.severeCongestionCount > 0 ? 'rgba(239, 68, 68, 0.12)' : 'rgba(16, 185, 129, 0.12)',
        border: `1px solid ${current.severeCongestionCount > 0 ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '0.75rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <AlertCircle size={14} color={current.severeCongestionCount > 0 ? '#ef4444' : '#10b981'} />
          <span style={{ color: current.severeCongestionCount > 0 ? '#fca5a5' : '#86efac', fontWeight: 600 }}>
            {current.severeCongestionCount > 0
              ? `${current.severeCongestionCount} Critical Bottlenecks Detected`
              : 'Zero Severe Bottlenecks (Smooth Flow)'}
          </span>
        </div>
        <span className="mono" style={{ color: '#94a3b8' }}>
          Delay: +{current.delayMins} min
        </span>
      </div>
    </div>
  );
}
