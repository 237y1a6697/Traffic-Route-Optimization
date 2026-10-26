import React, { useMemo } from 'react';
import { 
  ArrowUp, ArrowRight, ArrowLeft, ArrowUpRight, ArrowUpLeft, 
  RotateCcw, MapPin, X, AlertTriangle, 
  RefreshCw, Crosshair, ChevronLeft, ChevronRight, Gauge
} from 'lucide-react';
import { NavigationManeuver, RouteResult, VehicleMode } from '../../models/route';
import { GpsPosition } from '../../hooks/useGpsTracker';
import { VEHICLE_CONFIGS } from '../../services/routing';

interface NavigationHUDProps {
  route: RouteResult;
  activeManeuver: NavigationManeuver | null;
  maneuverIndex: number;
  totalManeuvers: number;
  distanceToManeuverMeters: number | null;
  remainingDistanceKm: number;
  remainingTimeMins: number;
  isOffRoute: boolean;
  offRouteDistanceMeters: number;
  gpsPosition: GpsPosition | null;
  gpsStatus: string;
  onExitNavigation: () => void;
  onRecalculateRoute: () => void;
  onNextManeuver: () => void;
  onPrevManeuver: () => void;
  onCenterMap: () => void;
  vehicleMode: VehicleMode;
}

export default function NavigationHUD({
  route,
  activeManeuver,
  maneuverIndex,
  totalManeuvers,
  distanceToManeuverMeters,
  remainingDistanceKm,
  remainingTimeMins,
  isOffRoute,
  offRouteDistanceMeters,
  gpsPosition,
  gpsStatus,
  onExitNavigation,
  onRecalculateRoute,
  onNextManeuver,
  onPrevManeuver,
  onCenterMap,
  vehicleMode
}: NavigationHUDProps) {
  // Format distance
  const formatManeuverDistance = (distMeters: number | null): string => {
    if (distMeters === null) return '';
    if (distMeters >= 1000) {
      return `In ${(distMeters / 1000).toFixed(1)} km`;
    }
    return `In ${Math.round(distMeters)} m`;
  };

  // Calculate ETA clock time memoized
  const etaString = useMemo(() => {
    const etaDate = new Date(Date.now() + remainingTimeMins * 60 * 1000);
    return etaDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }, [remainingTimeMins]);

  // Choose icon based on maneuver modifier
  const renderManeuverIcon = (modifier?: string) => {
    const mod = (modifier || '').toLowerCase();
    const iconSize = 34;
    const iconColor = '#ffffff';

    if (mod === 'right') return <ArrowRight size={iconSize} color={iconColor} />;
    if (mod === 'left') return <ArrowLeft size={iconSize} color={iconColor} />;
    if (mod === 'slight right') return <ArrowUpRight size={iconSize} color={iconColor} />;
    if (mod === 'slight left') return <ArrowUpLeft size={iconSize} color={iconColor} />;
    if (mod === 'u-turn') return <RotateCcw size={iconSize} color={iconColor} />;
    if (mod === 'arrive') return <MapPin size={iconSize} color="#22c55e" />;
    return <ArrowUp size={iconSize} color={iconColor} />;
  };

  const vehicleConfig = VEHICLE_CONFIGS[vehicleMode];

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      pointerEvents: 'none',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '1rem'
    }}>
      {/* TOP HEADER: Google Maps Style Turn-by-Turn Card */}
      <div style={{
        pointerEvents: 'auto',
        maxWidth: '560px',
        width: '100%',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem'
      }}>
        {/* Main Turn Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #065f46 0%, #047857 60%, #059669 100%)',
          borderRadius: '16px',
          boxShadow: '0 12px 36px rgba(0, 0, 0, 0.6), 0 0 20px rgba(16, 185, 129, 0.3)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          padding: '1rem 1.25rem',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          gap: '1.25rem',
          position: 'relative'
        }}>
          {/* Turn Icon Box */}
          <div style={{
            width: '54px',
            height: '54px',
            borderRadius: '12px',
            background: 'rgba(0, 0, 0, 0.25)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            {renderManeuverIcon(activeManeuver?.modifier)}
          </div>

          {/* Turn Instruction Text */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: '1.35rem',
              fontWeight: 800,
              fontFamily: 'var(--font-heading)',
              letterSpacing: '-0.01em',
              lineHeight: 1.2
            }}>
              {distanceToManeuverMeters !== null
                ? formatManeuverDistance(distanceToManeuverMeters)
                : (activeManeuver ? `Step ${maneuverIndex + 1} of ${totalManeuvers}` : 'Proceed on Route')}
            </div>

            <div style={{
              fontSize: '1rem',
              fontWeight: 600,
              marginTop: '4px',
              textShadow: '0 1px 2px rgba(0,0,0,0.4)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {activeManeuver?.instruction || 'Follow highlighted route to destination'}
            </div>

            {activeManeuver?.streetName && (
              <div style={{
                fontSize: '0.8rem',
                opacity: 0.9,
                marginTop: '2px',
                color: '#d1fae5'
              }}>
                Towards {activeManeuver.streetName}
              </div>
            )}
          </div>

          {/* Exit Navigation Button */}
          <button
            onClick={onExitNavigation}
            title="Exit Navigation"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'rgba(0, 0, 0, 0.35)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              flexShrink: 0,
              transition: 'background 0.2s ease'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Off-Route Alert Card */}
        {isOffRoute && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(185, 28, 28, 0.95), rgba(153, 27, 27, 0.95))',
            backdropFilter: 'blur(10px)',
            border: '1px solid #f87171',
            borderRadius: '12px',
            padding: '0.75rem 1rem',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 8px 24px rgba(220, 38, 38, 0.4)',
            animation: 'pulse 2s infinite'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <AlertTriangle size={20} color="#fef08a" />
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>
                  Off Route Deviation ({offRouteDistanceMeters} m)
                </div>
                <div style={{ fontSize: '0.72rem', opacity: 0.9 }}>
                  You have deviated from the recommended trajectory corridor.
                </div>
              </div>
            </div>

            <button
              onClick={onRecalculateRoute}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                background: '#ffffff',
                color: '#991b1b',
                border: 'none',
                borderRadius: '8px',
                padding: '6px 12px',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
              }}
            >
              <RefreshCw size={12} />
              <span>Recalculate</span>
            </button>
          </div>
        )}

        {/* Maneuver Navigation Controls (Manual Step Inspect) */}
        {totalManeuvers > 1 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(8px)',
            borderRadius: '8px',
            padding: '4px 10px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            fontSize: '0.75rem',
            color: '#94a3b8'
          }}>
            <button
              onClick={onPrevManeuver}
              disabled={maneuverIndex <= 0}
              style={{
                background: 'transparent',
                border: 'none',
                color: maneuverIndex <= 0 ? '#475569' : '#38bdf8',
                cursor: maneuverIndex <= 0 ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '2px',
                fontSize: '0.72rem'
              }}
            >
              <ChevronLeft size={14} />
              <span>Previous Turn</span>
            </button>

            <span>
              Maneuver <strong style={{ color: '#f8fafc' }}>{maneuverIndex + 1}</strong> of {totalManeuvers}
            </span>

            <button
              onClick={onNextManeuver}
              disabled={maneuverIndex >= totalManeuvers - 1}
              style={{
                background: 'transparent',
                border: 'none',
                color: maneuverIndex >= totalManeuvers - 1 ? '#475569' : '#38bdf8',
                cursor: maneuverIndex >= totalManeuvers - 1 ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '2px',
                fontSize: '0.72rem'
              }}
            >
              <span>Next Turn</span>
              <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>

      {/* BOTTOM FOOTER: Google Maps Style Trip Info Panel */}
      <div style={{
        pointerEvents: 'auto',
        maxWidth: '560px',
        width: '100%',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem'
      }}>
        <div style={{
          background: 'rgba(15, 23, 42, 0.94)',
          backdropFilter: 'blur(16px)',
          borderRadius: '16px',
          boxShadow: '0 12px 32px rgba(0, 0, 0, 0.7)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          padding: '0.85rem 1.25rem'
        }}>
          {/* Main Key Info Row: ETA, Remaining Time, Remaining Distance */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem' }}>
                <span style={{
                  fontSize: '1.85rem',
                  fontWeight: 800,
                  fontFamily: 'var(--font-heading)',
                  color: '#22c55e'
                }}>
                  {remainingTimeMins}
                </span>
                <span style={{ fontSize: '0.9rem', color: '#94a3b8', fontWeight: 600 }}>min</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                ETA: <strong style={{ color: '#f8fafc' }}>{etaString}</strong>
              </div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '1.4rem',
                fontWeight: 700,
                color: '#f8fafc',
                fontFamily: 'var(--font-heading)'
              }}>
                {remainingDistanceKm} <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>km</span>
              </div>
              <div style={{
                fontSize: '0.7rem',
                color: '#38bdf8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '3px'
              }}>
                <span>{vehicleConfig.tag}</span>
              </div>
            </div>

            {/* GPS Speed & Recenter Action */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(30, 41, 59, 0.7)',
                padding: '4px 10px',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.08)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#38bdf8', fontSize: '0.7rem' }}>
                  <Gauge size={12} />
                  <span>Speed</span>
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#f8fafc' }}>
                  {gpsPosition?.speed !== null && gpsPosition?.speed !== undefined ? `${gpsPosition.speed}` : '0'}
                  <span style={{ fontSize: '0.65rem', color: '#94a3b8', marginLeft: '2px' }}>km/h</span>
                </div>
              </div>

              <button
                onClick={onCenterMap}
                title="Center on My Location"
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  background: 'rgba(6, 182, 212, 0.15)',
                  border: '1px solid #06b6d4',
                  color: '#22d3ee',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <Crosshair size={20} />
              </button>
            </div>
          </div>

          {/* Live GPS Fix / Engine Info Row */}
          <div style={{
            marginTop: '0.65rem',
            paddingTop: '0.5rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.72rem',
            color: '#64748b'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: gpsPosition ? '#22c55e' : '#f59e0b',
                display: 'inline-block'
              }} />
              <span>
                {gpsPosition
                  ? `Live GPS Active (Accuracy: ±${gpsPosition.accuracy}m)`
                  : `GPS: ${gpsStatus}`}
              </span>
            </div>

            <div style={{ color: '#94a3b8' }}>
              Algorithm: <span style={{ color: '#22d3ee', fontWeight: 600 }}>{route.algorithmName}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
