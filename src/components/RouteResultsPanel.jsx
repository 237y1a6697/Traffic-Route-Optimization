import React from 'react';
import { 
  Sparkles, Clock, Compass, Zap, Leaf, Fuel, 
  BarChart3, CheckCircle, ChevronRight, AlertCircle, ShieldAlert
} from 'lucide-react';

export default function RouteResultsPanel({
  recommendedRoute,
  alternativeRoutes = [],
  activeSelectedRouteKey,
  setActiveSelectedRouteKey,
  onOpenCompareModal,
  isOptimizing
}) {
  if (isOptimizing) {
    return (
      <div className="sidebar-col">
        <div className="glass-panel control-card" style={{ padding: '2rem', textAlign: 'center' }}>
          <Sparkles size={36} className="quantum-pulse" color="#06b6d4" style={{ margin: '0 auto 1rem' }} />
          <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#f8fafc' }}>
            Quantum Evolutionary Routing...
          </div>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.5rem' }}>
            Rotating Q-bit phase angles across combinatorial path choices to minimize latency and bottleneck jams.
          </div>
        </div>
      </div>
    );
  }

  if (!recommendedRoute) {
    return (
      <div className="sidebar-col">
        <div className="glass-panel control-card" style={{ padding: '2rem', textAlign: 'center' }}>
          <Compass size={32} color="#64748b" style={{ margin: '0 auto 1rem' }} />
          <div style={{ fontWeight: 600, color: '#94a3b8' }}>No Route Selected</div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.4rem' }}>
            Enter your pickup location and destination, then click <strong>Optimize Route</strong>.
          </div>
        </div>
      </div>
    );
  }

  // Active highlighted route (defaults to recommended QGA)
  const activeRoute = alternativeRoutes.find(r => r.algorithm === activeSelectedRouteKey) || recommendedRoute;

  return (
    <div className="sidebar-col">
      {/* 1. Recommended Route Primary Card */}
      <div className="glass-panel control-card" style={{
        borderColor: 'rgba(6, 182, 212, 0.4)',
        boxShadow: '0 8px 32px rgba(6, 182, 212, 0.15)'
      }}>
        <div className="card-title">
          <div className="card-title-icon" style={{ color: '#22d3ee' }}>
            <Sparkles size={18} />
            <span>RECOMMENDED ROUTE</span>
          </div>
          <span className="brand-badge" style={{ color: '#22d3ee', borderColor: 'rgba(6, 182, 212, 0.4)' }}>
            Quantum-Inspired
          </span>
        </div>

        {/* Big Key Numbers */}
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', margin: '0.4rem 0' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem' }}>
            <span style={{ fontSize: '2.2rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: '#f8fafc' }}>
              {recommendedRoute.travelTimeMins}
            </span>
            <span style={{ fontSize: '1rem', color: '#94a3b8', fontWeight: 600 }}>min</span>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'var(--font-heading)', color: '#38bdf8' }}>
              {recommendedRoute.distanceKm}
            </span>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8', marginLeft: '3px' }}>km</span>
          </div>
        </div>

        {/* Traffic Status Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.5rem 0.75rem',
          borderRadius: '8px',
          background: 'rgba(15, 23, 42, 0.6)',
          border: `1px solid ${recommendedRoute.trafficBadgeColor}44`,
          fontSize: '0.8rem'
        }}>
          <span style={{ color: '#94a3b8' }}>Traffic Conditions:</span>
          <span style={{ color: recommendedRoute.trafficBadgeColor, fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: recommendedRoute.trafficBadgeColor }} />
            {recommendedRoute.trafficLabel}
          </span>
        </div>

        {/* Fuel & Emissions Grid */}
        <div className="metrics-grid" style={{ marginTop: '0.3rem' }}>
          <div className="metric-card" style={{ padding: '0.6rem' }}>
            <div className="metric-header">
              <span>Fuel Consumption</span>
              <Fuel size={13} color="#f59e0b" />
            </div>
            <div className="metric-value" style={{ fontSize: '1.1rem' }}>
              {recommendedRoute.fuelLitres}
              <span className="metric-unit">L</span>
            </div>
          </div>

          <div className="metric-card" style={{ padding: '0.6rem' }}>
            <div className="metric-header">
              <span>Estimated CO₂</span>
              <Leaf size={13} color="#10b981" />
            </div>
            <div className="metric-value" style={{ fontSize: '1.1rem' }}>
              {recommendedRoute.co2Kg}
              <span className="metric-unit">kg</span>
            </div>
          </div>
        </div>

        {/* Optimization Cost & Savings */}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.2rem' }}>
          <span>Optimization Score: <strong className="mono" style={{ color: '#22d3ee' }}>{recommendedRoute.optimizationCost}</strong></span>
          <span>Delay vs Free Flow: <strong className="mono" style={{ color: recommendedRoute.delayMins > 10 ? '#ef4444' : '#10b981' }}>+{recommendedRoute.delayMins} min</strong></span>
        </div>

        {/* Compare Routes Button */}
        <button
          className="btn btn-outline"
          style={{ width: '100%', marginTop: '0.5rem' }}
          onClick={onOpenCompareModal}
        >
          <BarChart3 size={15} />
          <span>Compare All Computed Routes</span>
        </button>
      </div>

      {/* 2. Alternative Routes Comparison Card */}
      <div className="glass-panel control-card">
        <div className="card-title">
          <div className="card-title-icon">
            <BarChart3 size={18} />
            <span>Alternative Computed Routes</span>
          </div>
          <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Click to view on map</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {alternativeRoutes.map(route => {
            const isSelected = (activeSelectedRouteKey || 'QGA') === route.algorithm;
            const isQGA = route.algorithm === 'QGA';

            return (
              <div
                key={route.algorithm}
                onClick={() => setActiveSelectedRouteKey(route.algorithm)}
                style={{
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  background: isSelected ? 'rgba(56, 189, 248, 0.12)' : 'rgba(15, 23, 42, 0.6)',
                  border: `1px solid ${isSelected ? '#38bdf8' : 'var(--border-subtle)'}`,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      color: isQGA ? '#22d3ee' : isSelected ? '#38bdf8' : '#e2e8f0'
                    }}>
                      {route.algorithmName}
                    </span>
                    {isQGA && (
                      <span style={{
                        fontSize: '0.65rem',
                        background: 'rgba(6, 182, 212, 0.2)',
                        color: '#06b6d4',
                        padding: '1px 5px',
                        borderRadius: '4px'
                      }}>
                        Best
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '2px' }}>
                    {route.distanceKm} km • {route.fuelLitres} L fuel • {route.co2Kg} kg CO₂
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc', fontFamily: 'var(--font-heading)' }}>
                    {route.travelTimeMins} min
                  </div>
                  <div style={{ fontSize: '0.7rem', color: route.trafficBadgeColor, fontWeight: 600 }}>
                    {route.trafficLabel}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Journey Segments & Corridors */}
      <div className="glass-panel control-card">
        <div className="card-title">
          <div className="card-title-icon">
            <Compass size={18} />
            <span>Itinerary Corridors ({(activeRoute?.edges || []).length} Segments)</span>
          </div>
          <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{activeRoute?.algorithm || 'Route'}</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '200px', overflowY: 'auto' }}>
          {(activeRoute?.edges || []).map((edge, idx) => (
            <div
              key={edge.id || idx}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.65rem',
                fontSize: '0.75rem',
                paddingBottom: '0.4rem',
                borderBottom: idx < (activeRoute?.edges?.length || 0) - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none'
              }}
            >
              <div style={{
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                background: 'rgba(56, 189, 248, 0.2)',
                color: '#38bdf8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '10px',
                fontWeight: 700,
                flexShrink: 0,
                marginTop: '1px'
              }}>
                {idx + 1}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ color: '#f8fafc', fontWeight: 600 }}>{edge.name}</div>
                <div style={{ color: '#64748b', fontSize: '0.7rem', display: 'flex', gap: '0.5rem' }}>
                  <span>{edge.distance} km</span>
                  <span>•</span>
                  <span>Limit: {edge.speedLimit} km/h</span>
                  <span>•</span>
                  <span style={{ textTransform: 'capitalize' }}>{edge.roadType}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
