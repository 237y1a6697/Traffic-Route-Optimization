import React from 'react';
import { 
  Star, Compass, Leaf, Fuel, 
  BarChart3, Navigation, ArrowRight, 
  ChevronRight, CheckCircle2, AlertTriangle, Clock, X
} from 'lucide-react';
import { RouteResult, VehicleMode } from '../../models/route';
import { VEHICLE_CONFIGS } from '../../services/routing';
import { getCurrentClockTime, computeArrivalClockTime } from '../../utils/timeUtils';

interface RouteResultsPanelProps {
  recommendedRoute: RouteResult | null;
  alternativeRoutes: RouteResult[];
  activeSelectedRouteKey: string;
  setActiveSelectedRouteKey: (key: string) => void;
  onOpenCompareModal: () => void;
  isOptimizing: boolean;
  onStartNavigation?: () => void;
  isNavigating?: boolean;
  vehicleMode?: VehicleMode;
  departureTime?: string;
  onClose?: () => void;
}

export default function RouteResultsPanel({
  recommendedRoute,
  alternativeRoutes = [],
  activeSelectedRouteKey,
  setActiveSelectedRouteKey,
  onOpenCompareModal,
  isOptimizing,
  onStartNavigation,
  isNavigating = false,
  vehicleMode = 'car',
  departureTime,
  onClose
}: RouteResultsPanelProps) {
  if (isOptimizing) {
    return (
      <div className="sidebar-col">
        <div className="glass-panel control-card" style={{ padding: '2rem', textAlign: 'center' }}>
          <Star size={36} className="quantum-pulse" color="#06b6d4" style={{ margin: '0 auto 1rem' }} />
          <div style={{ fontWeight: 700, fontSize: '1.05rem', color: '#f8fafc' }}>
            Quantum Evolutionary Routing...
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.4rem', lineHeight: 1.4 }}>
            Evaluating optimal route paths for {VEHICLE_CONFIGS[vehicleMode].name} across Indian road network corridors.
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
            Choose your origin and destination above, then click <strong>Find Routes</strong>.
          </div>
        </div>
      </div>
    );
  }

  const activeRoute = alternativeRoutes.find(r => r.algorithm === activeSelectedRouteKey) || recommendedRoute;
  const vehicleConfig = VEHICLE_CONFIGS[activeRoute.vehicleMode || vehicleMode];

  // Dynamic real-time synchronized timing
  const displayDeparture = activeRoute.departureTime || departureTime || getCurrentClockTime();
  const displayArrival = activeRoute.arrivalTime || computeArrivalClockTime(displayDeparture, activeRoute.travelTimeMins);

  // Map 4 discrete alternative choices
  const displayAlternatives: {
    num: number;
    key: string;
    title: string;
    timeMins: number;
    distKm: number;
    isRecommended?: boolean;
  }[] = [];

  const fastest = alternativeRoutes.find(r => r.algorithm === 'FASTEST') || alternativeRoutes[0] || recommendedRoute;
  const shortest = alternativeRoutes.find(r => r.algorithm === 'SHORTEST') || alternativeRoutes[1] || recommendedRoute;
  const lessCong = alternativeRoutes.find(r => r.algorithm === 'LESS_CONGESTION') || alternativeRoutes[2] || recommendedRoute;
  const lowerEm = alternativeRoutes.find(r => r.algorithm === 'LOWER_EMISSIONS') || alternativeRoutes[3] || recommendedRoute;

  displayAlternatives.push(
    { num: 1, key: fastest.algorithm, title: 'Fastest (Recommended)', timeMins: fastest.travelTimeMins, distKm: fastest.distanceKm, isRecommended: true },
    { num: 2, key: shortest.algorithm, title: 'Shortest', timeMins: shortest.travelTimeMins, distKm: shortest.distanceKm },
    { num: 3, key: lessCong.algorithm, title: 'Less Congestion', timeMins: lessCong.travelTimeMins, distKm: lessCong.distanceKm },
    { num: 4, key: lowerEm.algorithm, title: 'Lower Emissions', timeMins: lowerEm.travelTimeMins, distKm: lowerEm.distanceKm }
  );

  return (
    <div className="sidebar-col">
      {/* 1. Recommended Route Primary Card */}
      <div className="glass-panel control-card" style={{ padding: '0.85rem 1rem', marginBottom: '0.65rem' }}>
        {/* Header with Title and Optional Close/Collapse Button */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              background: 'rgba(6, 182, 212, 0.2)',
              border: '1.5px solid #06b6d4',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 8px rgba(6, 182, 212, 0.4)'
            }}>
              <Star size={13} color="#22d3ee" fill="#22d3ee" />
            </span>
            <span style={{ fontSize: '0.92rem', fontWeight: 700, color: '#38bdf8' }}>Recommended Route</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{
              fontSize: '0.65rem',
              fontWeight: 600,
              color: '#22d3ee',
              padding: '2px 7px',
              borderRadius: '4px',
              background: 'rgba(6, 182, 212, 0.12)',
              border: '1px solid rgba(6, 182, 212, 0.35)'
            }}>
              Quantum-Inspired
            </span>

            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="panel-collapse-x-btn"
                title="Hide Panel (View Full Map)"
                aria-label="Hide Panel"
              >
                <X size={15} />
              </button>
            )}
          </div>
        </div>

        {/* 4 Big Numbers in a Row: ETA | Distance | Fuel (est.) | CO2 (est.) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '6px',
          marginBottom: '0.75rem',
          textAlign: 'center'
        }}>
          {/* ETA */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.6)',
            padding: '0.5rem 0.2rem',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.06)'
          }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', fontFamily: 'var(--font-heading)' }}>
              {activeRoute.travelTimeMins}
              <span style={{ fontSize: '0.7rem', color: '#94a3b8', marginLeft: '2px', fontWeight: 500 }}>min</span>
            </div>
            <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 600 }}>ETA</div>
          </div>

          {/* Distance */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.6)',
            padding: '0.5rem 0.2rem',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.06)'
          }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', fontFamily: 'var(--font-heading)' }}>
              {activeRoute.distanceKm}
              <span style={{ fontSize: '0.7rem', color: '#94a3b8', marginLeft: '2px', fontWeight: 500 }}>km</span>
            </div>
            <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 600 }}>Distance</div>
          </div>

          {/* Fuel */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.6)',
            padding: '0.5rem 0.2rem',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.06)'
          }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', fontFamily: 'var(--font-heading)' }}>
              {activeRoute.fuelLitres}
              <span style={{ fontSize: '0.7rem', color: '#94a3b8', marginLeft: '2px', fontWeight: 500 }}>L</span>
            </div>
            <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 600 }}>Fuel (est.)</div>
          </div>

          {/* CO2 */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.6)',
            padding: '0.5rem 0.2rem',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.06)'
          }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', fontFamily: 'var(--font-heading)' }}>
              {activeRoute.co2Kg}
              <span style={{ fontSize: '0.7rem', color: '#94a3b8', marginLeft: '2px', fontWeight: 500 }}>kg</span>
            </div>
            <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 600 }}>CO₂ (est.)</div>
          </div>
        </div>

        {/* Traffic Conditions Row */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(15, 23, 42, 0.6)',
          borderRadius: '6px',
          padding: '0.4rem 0.65rem',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          fontSize: '0.75rem',
          marginBottom: '0.75rem'
        }}>
          <span style={{ color: '#94a3b8' }}>Traffic Conditions</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              color: activeRoute.trafficBadgeColor || '#ef4444',
              fontWeight: 700
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: activeRoute.trafficBadgeColor || '#ef4444' }} />
              {activeRoute.trafficLabel || 'Severe Congestion'}
            </span>
            <span className="simulated-badge" style={{ fontSize: '0.62rem', padding: '1px 5px' }}>(Simulated)</span>
          </div>
        </div>

        {/* Route Details Breakdown */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.4)',
          borderRadius: '6px',
          padding: '0.5rem 0.65rem',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          fontSize: '0.75rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '5px',
          marginBottom: '0.85rem'
        }}>
          <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600, marginBottom: '2px' }}>
            Route Details
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#cbd5e1' }}>
            <span>Optimized Score</span>
            <strong className="mono" style={{ color: '#22d3ee' }}>
              {(activeRoute.optimizationScore || 0.74).toFixed(2)} / 1.00
            </strong>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#cbd5e1' }}>
            <span>Est. Arrival Time</span>
            <strong className="mono" style={{ color: '#f8fafc' }}>
              {displayArrival}
            </strong>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#cbd5e1' }}>
            <span>Departure Time</span>
            <strong className="mono" style={{ color: '#94a3b8' }}>
              {displayDeparture}
            </strong>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#cbd5e1' }}>
            <span>CO₂ Reduction (vs. worst)</span>
            <strong className="mono" style={{ color: '#10b981' }}>
              +{activeRoute.co2ReductionPercent || 17.2}%
            </strong>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '0.68rem', marginTop: '2px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '4px' }}>
            <span>Routing Engine</span>
            <span className="mono" style={{ color: '#38bdf8' }}>
              {activeRoute.routingEngine === 'stadia' ? 'Stadia Maps Valhalla' : 'OpenStreetMap OSRM'}
            </span>
          </div>
        </div>

        {/* Big Start Navigation CTA */}
        {onStartNavigation && (
          <button
            className="btn btn-primary"
            onClick={onStartNavigation}
            style={{
              width: '100%',
              padding: '0.75rem',
              background: isNavigating 
                ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' 
                : 'linear-gradient(135deg, #06b6d4 0%, #0284c7 100%)',
              border: 'none',
              borderRadius: '8px',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: isNavigating 
                ? '0 4px 18px rgba(239, 68, 68, 0.35)' 
                : '0 4px 18px rgba(6, 182, 212, 0.35)',
              cursor: 'pointer'
            }}
          >
            <Navigation size={17} />
            <span>{isNavigating ? 'Stop Navigation' : 'Start Navigation'}</span>
          </button>
        )}
      </div>

      {/* 2. Alternative Routes Section */}
      <div className="glass-panel control-card" style={{ padding: '0.85rem 1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f8fafc' }}>
            Alternative Routes
          </span>
          <button
            onClick={onOpenCompareModal}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#38bdf8',
              fontSize: '0.72rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '2px',
              padding: 0
            }}
          >
            <span>View All</span>
            <ChevronRight size={13} />
          </button>
        </div>

        {/* 4 Alternative Route Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          {displayAlternatives.map((alt) => {
            const isSelected = activeSelectedRouteKey === alt.key || (alt.isRecommended && activeSelectedRouteKey === 'QGA');

            return (
              <div
                key={alt.key}
                onClick={() => setActiveSelectedRouteKey(alt.key)}
                style={{
                  padding: '0.5rem 0.75rem',
                  borderRadius: '6px',
                  background: isSelected ? 'rgba(6, 182, 212, 0.15)' : 'rgba(15, 23, 42, 0.6)',
                  border: `1px solid ${isSelected ? '#06b6d4' : 'rgba(255, 255, 255, 0.06)'}`,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    background: isSelected ? '#06b6d4' : 'rgba(100, 116, 139, 0.3)',
                    color: isSelected ? '#ffffff' : '#94a3b8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.65rem',
                    fontWeight: 700
                  }}>
                    {alt.num}
                  </span>
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: isSelected ? 700 : 500,
                    color: isSelected ? '#f8fafc' : '#cbd5e1'
                  }}>
                    {alt.title}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.72rem' }}>
                  <span style={{ color: '#38bdf8', fontWeight: 600 }}>{alt.timeMins} min</span>
                  <span style={{ color: '#64748b' }}>{alt.distKm} km</span>
                  <ChevronRight size={13} color="#64748b" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
