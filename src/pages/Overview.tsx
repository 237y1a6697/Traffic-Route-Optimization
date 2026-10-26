import React from 'react';
import { 
  Navigation, Layers, Activity, BarChart3, Clock, 
  ShieldAlert, Compass, Cpu, CheckCircle2, AlertCircle, ArrowRight, Sparkles 
} from 'lucide-react';
import { PageId } from '../components/Layout/Navbar';
import { HYDERABAD_LOCATIONS, HYDERABAD_ROAD_EDGES } from '../data/static/hyderabadGeoData';

interface OverviewPageProps {
  onNavigate: (page: PageId) => void;
  onOpenMathDoc?: () => void;
}

export default function OverviewPage({ onNavigate, onOpenMathDoc }: OverviewPageProps) {
  const quickCards = [
    {
      id: 'route_optimization' as PageId,
      title: 'Real-World Route Optimization',
      desc: 'Interactive location-to-location navigation using OpenStreetMap Hyderabad road network with multi-objective QIGA Pareto optimization.',
      icon: <Navigation size={22} className="text-cyan-400" />,
      badge: 'Primary Experience',
      badgeColor: '#06b6d4'
    },
    {
      id: 'live_traffic' as PageId,
      title: 'Live Traffic Monitor',
      desc: 'Simulated real-time road conditions, dynamic link speeds, congestion heatmaps, and incident-responsive traffic flow.',
      icon: <Activity size={22} className="text-emerald-400" />,
      badge: 'Simulated Stream',
      badgeColor: '#10b981'
    },
    {
      id: 'algorithm_comparison' as PageId,
      title: 'Algorithm Comparison Arena',
      desc: 'Side-by-side performance benchmarks comparing QIGA, Dijkstra, A*, and QUBO Annealing across travel time, fuel, and emissions.',
      icon: <BarChart3 size={22} className="text-purple-400" />,
      badge: 'Benchmarking',
      badgeColor: '#a855f7'
    },
    {
      id: 'traffic_prediction' as PageId,
      title: 'Traffic Prediction & BPR Modeling',
      desc: 'Dynamic Bureau of Public Roads (BPR) congestion modeling, rush-hour peak analysis, and predictive travel times.',
      icon: <Clock size={22} className="text-amber-400" />,
      badge: 'BPR & ML',
      badgeColor: '#f59e0b'
    },
    {
      id: 'benchmark_arena' as PageId,
      title: 'Academic Benchmark Arena',
      desc: 'Multi-agent simulation on standard research road graphs with live quantum superposition visualization and convergence plots.',
      icon: <Layers size={22} className="text-blue-400" />,
      badge: 'Research Core',
      badgeColor: '#3b82f6'
    },
    {
      id: 'road_network' as PageId,
      title: 'OpenStreetMap Road Topology',
      desc: 'Graph structural analytics of Hyderabad road network with node coordinates, edge capacities, and free-flow speed limits.',
      icon: <Compass size={22} className="text-indigo-400" />,
      badge: 'OSM Graph',
      badgeColor: '#6366f1'
    }
  ];

  return (
    <div className="overview-page" style={{ padding: '1.5rem', maxWidth: '1400px', margin: '0 auto', color: '#f1f5f9' }}>
      {/* Hero Section */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.9))',
        border: '1px solid rgba(56, 189, 248, 0.25)',
        borderRadius: '16px',
        padding: '2rem',
        marginBottom: '2rem',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <span style={{ 
            fontSize: '0.75rem', 
            fontWeight: 700, 
            letterSpacing: '0.08em', 
            textTransform: 'uppercase',
            background: 'rgba(6, 182, 212, 0.15)',
            color: '#38bdf8',
            padding: '0.25rem 0.75rem',
            borderRadius: '9999px',
            border: '1px solid rgba(56, 189, 248, 0.3)'
          }}>
            Research & Production Architecture
          </span>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Version 2.0 • Hybrid Quantum-Classical</span>
        </div>

        <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: '0 0 1rem 0', color: '#fff', lineHeight: 1.2 }}>
          Quantum-Inspired Intelligent Traffic Route Optimization in Transportation Systems
        </h1>

        <p style={{ fontSize: '1rem', color: '#cbd5e1', maxWidth: '900px', lineHeight: 1.6, margin: '0 0 1.5rem 0' }}>
          An advanced intelligent transportation platform integrating quantum-inspired genetic algorithms (QIGA), 
          classical graph search algorithms (Dijkstra, A*), and Bureau of Public Roads (BPR) congestion modeling on real 
          OpenStreetMap road networks to compute multi-objective Pareto-optimal travel routes.
        </p>

        {/* Disclaimer Notice */}
        <div style={{
          background: 'rgba(245, 158, 11, 0.1)',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          borderRadius: '8px',
          padding: '0.85rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          marginBottom: '1.5rem',
          fontSize: '0.85rem',
          color: '#fbbf24'
        }}>
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <span>
            <strong>Research Notice:</strong> Traffic data is initially simulated research data unless a real traffic provider is explicitly integrated.
          </span>
        </div>

        {/* Quick action buttons */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
          <button 
            className="btn btn-primary" 
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.25rem' }}
            onClick={() => onNavigate('route_optimization')}
          >
            <Navigation size={16} />
            <span>Launch Route Optimization</span>
            <ArrowRight size={14} />
          </button>

          <button 
            className="btn btn-secondary" 
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.25rem' }}
            onClick={() => onNavigate('benchmark_arena')}
          >
            <Layers size={16} />
            <span>Open Benchmark Arena</span>
          </button>

          {onOpenMathDoc && (
            <button 
              className="btn btn-outline" 
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.25rem' }}
              onClick={onOpenMathDoc}
            >
              <Sparkles size={16} />
              <span>Mathematical Formulations</span>
            </button>
          )}
        </div>
      </div>

      {/* Network & System Metrics Bar */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '1rem', 
        marginBottom: '2rem' 
      }}>
        <div style={{ background: '#1e293b', padding: '1rem 1.25rem', borderRadius: '10px', border: '1px solid #334155' }}>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Mapped Intersections</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#38bdf8' }}>{HYDERABAD_LOCATIONS.length} Nodes</div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Hyderabad Metropolitan Core</div>
        </div>

        <div style={{ background: '#1e293b', padding: '1rem 1.25rem', borderRadius: '10px', border: '1px solid #334155' }}>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Road Corridors</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#10b981' }}>{HYDERABAD_ROAD_EDGES.length} Corridors</div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Dual-direction graph edges</div>
        </div>

        <div style={{ background: '#1e293b', padding: '1rem 1.25rem', borderRadius: '10px', border: '1px solid #334155' }}>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Core Solvers</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#a855f7' }}>4 Solvers</div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>QIGA • Dijkstra • A* • QUBO</div>
        </div>

        <div style={{ background: '#1e293b', padding: '1rem 1.25rem', borderRadius: '10px', border: '1px solid #334155' }}>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>System Architecture</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f59e0b' }}>Decoupled</div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>React TS + Python Engine</div>
        </div>
      </div>

      {/* Feature Modules Grid */}
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', color: '#f8fafc' }}>
        Platform Modules & Capabilities
      </h2>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
        gap: '1.25rem', 
        marginBottom: '2rem' 
      }}>
        {quickCards.map(card => (
          <div 
            key={card.id}
            onClick={() => onNavigate(card.id)}
            style={{
              background: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '12px',
              padding: '1.25rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = card.badgeColor;
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = '#334155';
              e.currentTarget.style.transform = 'none';
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.5rem', borderRadius: '8px' }}>
                  {card.icon}
                </div>
                <span style={{ 
                  fontSize: '0.7rem', 
                  fontWeight: 600, 
                  color: card.badgeColor,
                  background: `${card.badgeColor}22`,
                  padding: '0.2rem 0.5rem',
                  borderRadius: '6px',
                  border: `1px solid ${card.badgeColor}44`
                }}>
                  {card.badge}
                </span>
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 600, margin: '0 0 0.5rem 0', color: '#fff' }}>
                {card.title}
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.5, margin: 0 }}>
                {card.desc}
              </p>
            </div>

            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.4rem', 
              marginTop: '1rem', 
              fontSize: '0.8rem', 
              fontWeight: 600, 
              color: card.badgeColor 
            }}>
              <span>Open Module</span>
              <ArrowRight size={14} />
            </div>
          </div>
        ))}
      </div>

      {/* Architecture Highlights */}
      <div style={{
        background: '#0f172a',
        border: '1px solid #1e293b',
        borderRadius: '12px',
        padding: '1.5rem'
      }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc', marginBottom: '1rem' }}>
          Key Technical Differentiators
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <CheckCircle2 size={18} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#f1f5f9' }}>Quantum Superposition Encoding</div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>
                Routes are encoded into Q-bit probabilistic chromosomes [α, β] with rotation gates for fast global Pareto-optimal discovery.
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <CheckCircle2 size={18} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#f1f5f9' }}>Multi-Objective Weighted Fitness</div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>
                Simultaneously balances travel time, BPR congestion, distance, estimated fuel burn, and CO2 emissions.
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <CheckCircle2 size={18} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#f1f5f9' }}>BPR Congestion Model</div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>
                Industry-standard Bureau of Public Roads formula dynamically penalizes saturated road segments under peak traffic volume.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
