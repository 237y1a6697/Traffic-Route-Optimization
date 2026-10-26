import React, { useState } from 'react';
import { 
  Clock, TrendingUp, Cpu, Sliders, AlertCircle, 
  BarChart, Zap, Calendar, CloudSun 
} from 'lucide-react';

export default function TrafficPredictionPage() {
  const [selectedHour, setSelectedHour] = useState<number>(18); // Default 6:00 PM (peak)
  const [vcRatio, setVcRatio] = useState<number>(0.85); // Volume to Capacity
  const [freeFlowTime, setFreeFlowTime] = useState<number>(15); // Free-flow minutes
  const [bprAlpha, setBprAlpha] = useState<number>(0.15);
  const [bprBeta, setBprBeta] = useState<number>(4.0);

  // BPR Formula: t = t0 * (1 + alpha * (V/C)^beta)
  const predictedTravelTime = freeFlowTime * (1 + bprAlpha * Math.pow(vcRatio, bprBeta));
  const delayMinutes = Math.max(0, predictedTravelTime - freeFlowTime);

  // 24-hour congestion pattern for Hyderabad
  const hourlyProfile = [
    { hour: '00:00', load: 0.15 },
    { hour: '02:00', load: 0.10 },
    { hour: '04:00', load: 0.12 },
    { hour: '06:00', load: 0.30 },
    { hour: '08:00', load: 0.82 },
    { hour: '09:00', load: 0.95 }, // Morning rush
    { hour: '11:00', load: 0.65 },
    { hour: '13:00', load: 0.55 },
    { hour: '15:00', load: 0.60 },
    { hour: '17:00', load: 0.88 },
    { hour: '18:30', load: 1.05 }, // Evening peak
    { hour: '20:00', load: 0.78 },
    { hour: '22:00', load: 0.40 }
  ];

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1400px', margin: '0 auto', color: '#f1f5f9' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <Clock size={22} color="#f59e0b" />
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, color: '#fff' }}>
            Traffic Prediction & BPR Congestion Dynamics
          </h1>
        </div>
        <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0 }}>
          Bureau of Public Roads (BPR) link-performance modeling and machine learning traffic forecasting.
        </p>
      </div>

      {/* Research Disclaimer */}
      <div style={{
        background: 'rgba(245, 158, 11, 0.1)',
        border: '1px solid rgba(245, 158, 11, 0.3)',
        borderRadius: '8px',
        padding: '0.75rem 1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        marginBottom: '1.5rem',
        fontSize: '0.8rem',
        color: '#fbbf24'
      }}>
        <AlertCircle size={18} style={{ flexShrink: 0 }} />
        <span>
          <strong>Research Disclaimer:</strong> Traffic data is initially simulated research data unless a real traffic provider is explicitly integrated.
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Interactive BPR Calculator */}
        <div style={{
          background: '#1e293b',
          borderRadius: '12px',
          border: '1px solid #334155',
          padding: '1.25rem'
        }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 1rem 0', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp size={18} />
            <span>Interactive BPR Delay Calculator</span>
          </h2>

          <div style={{
            background: 'rgba(15, 23, 42, 0.7)',
            padding: '0.75rem',
            borderRadius: '8px',
            fontFamily: 'monospace',
            fontSize: '0.85rem',
            color: '#38bdf8',
            marginBottom: '1rem',
            border: '1px solid #334155'
          }}>
            t = t₀ × [ 1 + α × (V / C)^β ]
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                <span style={{ color: '#94a3b8' }}>Volume / Capacity Ratio (V/C):</span>
                <span style={{ fontWeight: 700, color: vcRatio > 0.9 ? '#ef4444' : '#10b981' }}>{vcRatio.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.5"
                step="0.05"
                value={vcRatio}
                onChange={e => setVcRatio(parseFloat(e.target.value))}
                style={{ width: '100%', accentColor: '#06b6d4' }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                <span style={{ color: '#94a3b8' }}>Free-Flow Travel Time (t₀):</span>
                <span style={{ fontWeight: 700, color: '#f8fafc' }}>{freeFlowTime} min</span>
              </div>
              <input
                type="range"
                min="5"
                max="60"
                step="1"
                value={freeFlowTime}
                onChange={e => setFreeFlowTime(parseInt(e.target.value))}
                style={{ width: '100%', accentColor: '#06b6d4' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>BPR α (scale): {bprAlpha}</span>
                <input
                  type="range"
                  min="0.05"
                  max="0.5"
                  step="0.05"
                  value={bprAlpha}
                  onChange={e => setBprAlpha(parseFloat(e.target.value))}
                  style={{ width: '100%', accentColor: '#a855f7' }}
                />
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>BPR β (exponent): {bprBeta}</span>
                <input
                  type="range"
                  min="2.0"
                  max="6.0"
                  step="0.5"
                  value={bprBeta}
                  onChange={e => setBprBeta(parseFloat(e.target.value))}
                  style={{ width: '100%', accentColor: '#a855f7' }}
                />
              </div>
            </div>

            {/* Calculated Output Card */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.1), rgba(168, 85, 247, 0.1))',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              borderRadius: '8px',
              padding: '1rem',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.75rem'
            }}>
              <div>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase' }}>Congested Travel Time</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#38bdf8' }}>
                  {predictedTravelTime.toFixed(1)} <span style={{ fontSize: '0.85rem' }}>min</span>
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase' }}>Traffic Delay Incurred</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: delayMinutes > 5 ? '#ef4444' : '#10b981' }}>
                  +{delayMinutes.toFixed(1)} <span style={{ fontSize: '0.85rem' }}>min</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 24-Hour Diurnal Congestion Cycle */}
        <div style={{
          background: '#1e293b',
          borderRadius: '12px',
          border: '1px solid #334155',
          padding: '1.25rem'
        }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 1rem 0', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={18} />
            <span>24-Hour Diurnal Congestion Cycle</span>
          </h2>

          <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '1rem' }}>
            Simulated rush-hour dynamics showing morning (8:30-10:00 AM) and evening (17:30-20:30 PM) saturation.
          </p>

          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.4rem', height: '140px', paddingBottom: '1.5rem', position: 'relative' }}>
            {hourlyProfile.map(item => {
              const heightPercent = Math.min(100, Math.round(item.load * 90));
              const isHeavy = item.load >= 0.85;
              const isSevere = item.load >= 1.0;
              return (
                <div key={item.hour} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                  <div
                    title={`${item.hour}: ${(item.load * 100).toFixed(0)}% load`}
                    style={{
                      width: '100%',
                      height: `${heightPercent}%`,
                      background: isSevere ? '#ec4899' : isHeavy ? '#ef4444' : item.load > 0.5 ? '#f59e0b' : '#10b981',
                      borderRadius: '4px 4px 0 0',
                      transition: 'height 0.3s ease'
                    }}
                  />
                  <span style={{ fontSize: '0.6rem', color: '#64748b', marginTop: '0.4rem', transform: 'rotate(-45deg)', transformOrigin: 'top left' }}>
                    {item.hour.slice(0, 2)}h
                  </span>
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginTop: '1.5rem', borderTop: '1px solid #334155', paddingTop: '0.75rem' }}>
            <span style={{ color: '#10b981' }}>● Off-peak (&lt;50%)</span>
            <span style={{ color: '#f59e0b' }}>● Moderate (50-85%)</span>
            <span style={{ color: '#ef4444' }}>● Peak Saturation (&gt;85%)</span>
          </div>
        </div>
      </div>

      {/* ML Feature Pipeline */}
      <div style={{
        background: '#1e293b',
        borderRadius: '12px',
        border: '1px solid #334155',
        padding: '1.25rem'
      }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 1rem 0', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Cpu size={18} color="#a855f7" />
          <span>Machine Learning Traffic Feature Engineering</span>
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', fontSize: '0.8rem' }}>
          <div style={{ background: '#0f172a', padding: '0.85rem', borderRadius: '8px', border: '1px solid #334155' }}>
            <strong style={{ color: '#38bdf8' }}>Temporal Features</strong>
            <p style={{ color: '#94a3b8', margin: '0.35rem 0 0 0', lineHeight: 1.4 }}>
              Hour of day, day of week, cyclical sine/cosine embeddings, school calendar, public holidays.
            </p>
          </div>

          <div style={{ background: '#0f172a', padding: '0.85rem', borderRadius: '8px', border: '1px solid #334155' }}>
            <strong style={{ color: '#10b981' }}>Graph Spatial Features</strong>
            <p style={{ color: '#94a3b8', margin: '0.35rem 0 0 0', lineHeight: 1.4 }}>
              Node in-degree/out-degree, arterial hierarchy, lane count, speed limit, upstream inflow rate.
            </p>
          </div>

          <div style={{ background: '#0f172a', padding: '0.85rem', borderRadius: '8px', border: '1px solid #334155' }}>
            <strong style={{ color: '#f59e0b' }}>Dynamic Incident Vector</strong>
            <p style={{ color: '#94a3b8', margin: '0.35rem 0 0 0', lineHeight: 1.4 }}>
              Lane blockage severity (0.0 to 1.0), weather coefficient, active construction markers.
            </p>
          </div>

          <div style={{ background: '#0f172a', padding: '0.85rem', borderRadius: '8px', border: '1px solid #334155' }}>
            <strong style={{ color: '#ec4899' }}>Target Variable</strong>
            <p style={{ color: '#94a3b8', margin: '0.35rem 0 0 0', lineHeight: 1.4 }}>
              Predicted segment speed (km/h) and travel time $t_e$ computed via trained Random Forest / GBDT.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
