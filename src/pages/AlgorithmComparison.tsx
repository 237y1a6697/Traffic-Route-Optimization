import React, { useState } from 'react';
import { 
  BarChart3, Cpu, Zap, Activity, Clock, 
  Fuel, ShieldCheck, CheckCircle2, Sliders, ArrowUpRight 
} from 'lucide-react';
import { OptimizationWeights } from '../models/algorithm';

export default function AlgorithmComparisonPage() {
  const [weights, setWeights] = useState<OptimizationWeights>({
    timeWeight: 0.35,
    congestionWeight: 0.30,
    distanceWeight: 0.15,
    fuelWeight: 0.10,
    emissionsWeight: 0.10
  });

  const algorithmData = [
    {
      key: 'QIGA',
      name: 'Quantum-Inspired Genetic Algorithm (QIGA)',
      tag: 'Pareto Optimal',
      color: '#06b6d4',
      timeMin: 22.4,
      distanceKm: 14.8,
      congestionIndex: 0.28,
      fuelLiters: 1.15,
      co2Kg: 2.65,
      execLatencyMs: 14,
      paretoScore: 94.2,
      pros: 'Avoids severe bottlenecks; balances multi-objective fitness; fast quantum gate rotation exploration',
      cons: 'Slightly longer physical distance (+0.6 km) to circumvent high-congestion corridors'
    },
    {
      key: 'ASTAR',
      name: 'A* Heuristic Graph Search',
      tag: 'Distance Heuristic',
      color: '#38bdf8',
      timeMin: 26.8,
      distanceKm: 14.2,
      congestionIndex: 0.52,
      fuelLiters: 1.32,
      co2Kg: 3.04,
      execLatencyMs: 6,
      paretoScore: 82.5,
      pros: 'Fastest compute time; guarantees optimal Euclidean distance heuristic',
      cons: 'Susceptible to bottlenecks; single-metric objective unless composite heuristics applied'
    },
    {
      key: 'DIJKSTRA',
      name: 'Classical Dijkstra Shortest Path',
      tag: 'Shortest Distance',
      color: '#a855f7',
      timeMin: 31.5,
      distanceKm: 13.9,
      congestionIndex: 0.76,
      fuelLiters: 1.55,
      co2Kg: 3.56,
      execLatencyMs: 9,
      paretoScore: 71.0,
      pros: 'Mathematical guarantee of absolute shortest geometric path length',
      cons: 'Severely penalizes user during rush hour by routing through congested arterial junctions'
    },
    {
      key: 'QUBO',
      name: 'QUBO Simulated Quantum Annealing',
      tag: 'Energy Minimization',
      color: '#f59e0b',
      timeMin: 23.9,
      distanceKm: 15.1,
      congestionIndex: 0.34,
      fuelLiters: 1.21,
      co2Kg: 2.78,
      execLatencyMs: 28,
      paretoScore: 89.1,
      pros: 'Maps traffic flow to Ising spin hamiltonian; effective combinatorial ground-state search',
      cons: 'Higher CPU overhead for thermal annealing schedule convergence'
    }
  ];

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1400px', margin: '0 auto', color: '#f1f5f9' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <BarChart3 size={22} color="#a855f7" />
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, color: '#fff' }}>
            Algorithm Comparison & Benchmark Matrix
          </h1>
        </div>
        <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0 }}>
          Theoretical and benchmarked evaluation across Quantum-Inspired, Heuristic, and Classical Graph Solvers.
        </p>
      </div>

      {/* Comparison Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', 
        gap: '1.25rem', 
        marginBottom: '2rem' 
      }}>
        {algorithmData.map(alg => (
          <div
            key={alg.key}
            style={{
              background: '#1e293b',
              border: `1px solid ${alg.color}44`,
              borderRadius: '12px',
              padding: '1.25rem',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 4px 20px rgba(0,0,0,0.25)'
            }}
          >
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: alg.color
            }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
              <div>
                <span style={{
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: alg.color,
                  background: `${alg.color}22`,
                  padding: '0.2rem 0.5rem',
                  borderRadius: '4px'
                }}>
                  {alg.tag}
                </span>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0.5rem 0 0 0', color: '#fff' }}>
                  {alg.name}
                </h3>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: alg.color }}>
                  {alg.paretoScore}
                </div>
                <div style={{ fontSize: '0.65rem', color: '#64748b' }}>Score / 100</div>
              </div>
            </div>

            {/* Metrics Breakdown */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.5rem',
              margin: '1rem 0',
              background: 'rgba(15, 23, 42, 0.6)',
              padding: '0.75rem',
              borderRadius: '8px',
              fontSize: '0.75rem'
            }}>
              <div>
                <span style={{ color: '#94a3b8' }}>Travel Time:</span>
                <strong style={{ display: 'block', color: '#f8fafc', fontSize: '0.9rem' }}>{alg.timeMin} min</strong>
              </div>
              <div>
                <span style={{ color: '#94a3b8' }}>Distance:</span>
                <strong style={{ display: 'block', color: '#f8fafc', fontSize: '0.9rem' }}>{alg.distanceKm} km</strong>
              </div>
              <div>
                <span style={{ color: '#94a3b8' }}>Congestion Index:</span>
                <strong style={{ display: 'block', color: alg.congestionIndex > 0.6 ? '#ef4444' : '#10b981', fontSize: '0.9rem' }}>
                  {Math.round(alg.congestionIndex * 100)}%
                </strong>
              </div>
              <div>
                <span style={{ color: '#94a3b8' }}>Exec Latency:</span>
                <strong style={{ display: 'block', color: '#f8fafc', fontSize: '0.9rem' }}>{alg.execLatencyMs} ms</strong>
              </div>
            </div>

            {/* Environmental Impact */}
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.75rem' }}>
              <div>Fuel: <span style={{ color: '#f1f5f9' }}>{alg.fuelLiters} L</span> • CO₂: <span style={{ color: '#f1f5f9' }}>{alg.co2Kg} kg</span></div>
            </div>

            {/* Qualitative Notes */}
            <div style={{ fontSize: '0.75rem', lineHeight: 1.4, borderTop: '1px solid #334155', paddingTop: '0.5rem' }}>
              <div style={{ color: '#10b981', marginBottom: '0.25rem' }}><strong>Advantage:</strong> {alg.pros}</div>
              <div style={{ color: '#94a3b8' }}><strong>Trade-off:</strong> {alg.cons}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Comparative Evaluation Table */}
      <div style={{
        background: '#1e293b',
        borderRadius: '12px',
        border: '1px solid #334155',
        padding: '1.25rem'
      }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 1rem 0', color: '#f8fafc' }}>
          Detailed Algorithmic Trade-Off Matrix
        </h3>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #334155', color: '#94a3b8' }}>
                <th style={{ padding: '0.75rem 0.5rem' }}>Algorithm</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Paradigm</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Objective Function</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Time Complexity</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Congestion Resilience</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Multi-Objective</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid #334155', color: '#f1f5f9' }}>
                <td style={{ padding: '0.75rem 0.5rem', fontWeight: 600, color: '#06b6d4' }}>QIGA</td>
                <td style={{ padding: '0.75rem 0.5rem' }}>Quantum-Inspired Probabilistic</td>
                <td style={{ padding: '0.75rem 0.5rem' }}>Pareto Fitness (Time, Congestion, Fuel, CO₂)</td>
                <td style={{ padding: '0.75rem 0.5rem' }}>O(G × P × N)</td>
                <td style={{ padding: '0.75rem 0.5rem', color: '#10b981' }}>High (Dynamic Detours)</td>
                <td style={{ padding: '0.75rem 0.5rem', color: '#10b981' }}>Native Pareto Frontier</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #334155', color: '#f1f5f9' }}>
                <td style={{ padding: '0.75rem 0.5rem', fontWeight: 600, color: '#38bdf8' }}>A* Heuristic</td>
                <td style={{ padding: '0.75rem 0.5rem' }}>Greedy Best-First Graph Search</td>
                <td style={{ padding: '0.75rem 0.5rem' }}>f(n) = g(n) + h(n) Euclidean</td>
                <td style={{ padding: '0.75rem 0.5rem' }}>O(E + V log V)</td>
                <td style={{ padding: '0.75rem 0.5rem', color: '#f59e0b' }}>Moderate</td>
                <td style={{ padding: '0.75rem 0.5rem', color: '#ef4444' }}>Single Metric Composite</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #334155', color: '#f1f5f9' }}>
                <td style={{ padding: '0.75rem 0.5rem', fontWeight: 600, color: '#a855f7' }}>Dijkstra</td>
                <td style={{ padding: '0.75rem 0.5rem' }}>Exact Shortest Path</td>
                <td style={{ padding: '0.75rem 0.5rem' }}>min Σ Distance</td>
                <td style={{ padding: '0.75rem 0.5rem' }}>O(E + V log V)</td>
                <td style={{ padding: '0.75rem 0.5rem', color: '#ef4444' }}>Low (Ignores Bottlenecks)</td>
                <td style={{ padding: '0.75rem 0.5rem', color: '#ef4444' }}>Single Metric (Distance)</td>
              </tr>
              <tr style={{ color: '#f1f5f9' }}>
                <td style={{ padding: '0.75rem 0.5rem', fontWeight: 600, color: '#f59e0b' }}>QUBO Annealing</td>
                <td style={{ padding: '0.75rem 0.5rem' }}>Ising Hamiltonian Spin System</td>
                <td style={{ padding: '0.75rem 0.5rem' }}>min x^T Q x + Energy Penalty</td>
                <td style={{ padding: '0.75rem 0.5rem' }}>O(T_steps × N^2)</td>
                <td style={{ padding: '0.75rem 0.5rem', color: '#10b981' }}>High</td>
                <td style={{ padding: '0.75rem 0.5rem', color: '#10b981' }}>Supported via Multi-Term Q</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
