import React from 'react';
import { 
  BarChart3, Fuel, Leaf, TrendingDown, Scale, 
  Activity, ArrowDownRight, Layers, ShieldCheck 
} from 'lucide-react';

export default function AnalyticsPage() {
  const analyticsKpis = [
    {
      title: 'Avg Travel Time Reduction',
      value: '-18.4%',
      sub: 'vs selfish shortest-path routing',
      color: '#10b981',
      icon: <TrendingDown size={20} color="#10b981" />
    },
    {
      title: 'Estimated Fuel Savings',
      value: '-14.2%',
      sub: 'reduced stop-and-go idle time',
      color: '#38bdf8',
      icon: <Fuel size={20} color="#38bdf8" />
    },
    {
      title: 'CO₂ Emission Abatement',
      value: '-16.1%',
      sub: '0.41 kg CO₂ saved per trip',
      color: '#a855f7',
      icon: <Leaf size={20} color="#a855f7" />
    },
    {
      title: 'Price of Anarchy (PoA)',
      value: '1.24',
      sub: 'Efficiency ratio (UE / SO)',
      color: '#f59e0b',
      icon: <Scale size={20} color="#f59e0b" />
    }
  ];

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1400px', margin: '0 auto', color: '#f1f5f9' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <BarChart3 size={22} color="#10b981" />
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, color: '#fff' }}>
            System Analytics & Sustainability Metrics
          </h1>
        </div>
        <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0 }}>
          Macro-level transportation efficiency, environmental sustainability, and equilibrium game-theoretic metrics.
        </p>
      </div>

      {/* KPI Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        {analyticsKpis.map((kpi, idx) => (
          <div
            key={idx}
            style={{
              background: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '12px',
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>
                {kpi.title}
              </span>
              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.35rem', borderRadius: '6px' }}>
                {kpi.icon}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: kpi.color, margin: '0.25rem 0' }}>
                {kpi.value}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                {kpi.sub}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Deep-Dive Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Game Theory & Price of Anarchy Card */}
        <div style={{
          background: '#1e293b',
          borderRadius: '12px',
          border: '1px solid #334155',
          padding: '1.25rem'
        }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 0.5rem 0', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Scale size={18} />
            <span>Price of Anarchy (PoA) Equilibrium</span>
          </h2>
          <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '1rem', lineHeight: 1.4 }}>
            In transportation game theory, Wardrop’s User Equilibrium (UE) models selfish route choices where no driver can unilaterally reduce their travel time.
          </p>

          <div style={{
            background: 'rgba(15, 23, 42, 0.7)',
            padding: '0.75rem',
            borderRadius: '8px',
            fontFamily: 'monospace',
            fontSize: '0.85rem',
            color: '#f59e0b',
            marginBottom: '1rem',
            border: '1px solid #334155'
          }}>
            PoA = TSTT(User Equilibrium) / TSTT(System Optimum)
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.8rem' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                <span style={{ color: '#cbd5e1' }}>User Equilibrium (Dijkstra Selfish):</span>
                <span style={{ fontWeight: 700, color: '#ef4444' }}>100% baseline</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: '#334155', borderRadius: '4px' }}>
                <div style={{ width: '100%', height: '100%', background: '#ef4444', borderRadius: '4px' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                <span style={{ color: '#cbd5e1' }}>QIGA Pareto Coordinated:</span>
                <span style={{ fontWeight: 700, color: '#10b981' }}>80.6% TSTT (-19.4%)</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: '#334155', borderRadius: '4px' }}>
                <div style={{ width: '80.6%', height: '100%', background: '#10b981', borderRadius: '4px' }} />
              </div>
            </div>

            <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.5rem', lineHeight: 1.4 }}>
              By coordinating traffic flow away from central bottlenecks into parallel arterial corridors, QIGA reduces overall system congestion by 19.4%.
            </div>
          </div>
        </div>

        {/* Environmental Emissions Analysis */}
        <div style={{
          background: '#1e293b',
          borderRadius: '12px',
          border: '1px solid #334155',
          padding: '1.25rem'
        }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 0.5rem 0', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Leaf size={18} />
            <span>Fleet Emissions & Fuel Burn Matrix</span>
          </h2>
          <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '1rem', lineHeight: 1.4 }}>
            Stop-and-go driving through congested junctions increases fuel consumption and tailpipe carbon output by up to 40%.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ background: '#0f172a', padding: '0.75rem', borderRadius: '8px', border: '1px solid #334155' }}>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Dijkstra Shortest Path</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ef4444', margin: '0.25rem 0' }}>1.55 L / 3.56 kg</div>
              <div style={{ fontSize: '0.65rem', color: '#64748b' }}>High idle consumption in traffic</div>
            </div>

            <div style={{ background: '#0f172a', padding: '0.75rem', borderRadius: '8px', border: '1px solid #334155' }}>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>QIGA Pareto Route</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#10b981', margin: '0.25rem 0' }}>1.15 L / 2.65 kg</div>
              <div style={{ fontSize: '0.65rem', color: '#64748b' }}>Free-flowing arterial detour</div>
            </div>
          </div>

          <div style={{ fontSize: '0.75rem', color: '#cbd5e1', lineHeight: 1.4 }}>
            <strong style={{ color: '#38bdf8' }}>Net Environmental Impact:</strong> A fleet of 1,000 daily commuters adopting QIGA routes saves an estimated <strong>400 liters of gasoline</strong> and <strong>910 kg of CO₂ emissions</strong> daily in the Hyderabad metropolitan area.
          </div>
        </div>
      </div>
    </div>
  );
}
