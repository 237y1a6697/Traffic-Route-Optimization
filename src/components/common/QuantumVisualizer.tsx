import React from 'react';
import { Atom, Zap, Layers } from 'lucide-react';
import { QuantumStateData } from '../../models/algorithm';

interface QuantumVisualizerProps {
  activeAlgorithm: string;
  algorithmResult?: {
    quantumState?: QuantumStateData;
  } | null;
}

export default function QuantumVisualizer({ activeAlgorithm, algorithmResult }: QuantumVisualizerProps) {
  const isQGA = activeAlgorithm === 'QGA';
  const isQUBO = activeAlgorithm === 'QUBO';

  const qState: QuantumStateData = algorithmResult?.quantumState || {
    theta: 0.85,
    alpha: 0.66,
    beta: 0.75,
    prob0: 0.44,
    prob1: 0.56,
    entropy: 0.98
  };

  const angleDeg = Math.round((qState.theta * 180) / Math.PI);

  return (
    <div className="glass-panel control-card" style={{ borderColor: isQGA ? 'var(--border-glow)' : isQUBO ? 'var(--border-quantum)' : 'var(--border-subtle)' }}>
      <div className="card-title">
        <div className="card-title-icon" style={{ color: isQGA ? '#22d3ee' : isQUBO ? '#c084fc' : '#94a3b8' }}>
          <Atom size={18} />
          <span>Quantum State Inspector</span>
        </div>
        <span className="brand-badge" style={{
          color: isQGA ? '#22d3ee' : isQUBO ? '#c084fc' : '#94a3b8',
          borderColor: isQGA ? 'rgba(6, 182, 212, 0.4)' : isQUBO ? 'rgba(168, 85, 247, 0.4)' : 'rgba(255, 255, 255, 0.1)'
        }}>
          {isQGA ? 'Q-Bit Angle Gate' : isQUBO ? 'Transverse Tunneling' : 'Classical Mode'}
        </span>
      </div>

      {isQGA ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <div className="quantum-state-box">
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', justifyContent: 'space-between' }}>
              <span>Qubit Chromosome Phase:</span>
              <span className="mono" style={{ color: '#22d3ee', fontWeight: 600 }}>θ = {qState.theta} rad ({angleDeg}°)</span>
            </div>

            <div className="qubit-display">
              <div className="bloch-circle">
                <div
                  className="bloch-vector"
                  style={{
                    transform: `rotate(-${angleDeg}deg)`
                  }}
                />
                <span style={{ position: 'absolute', top: '2px', fontSize: '9px', color: '#94a3b8' }}>|1⟩</span>
                <span style={{ position: 'absolute', right: '3px', fontSize: '9px', color: '#94a3b8' }}>|0⟩</span>
              </div>

              <div className="qubit-math">
                <div className="qubit-amplitude">
                  |ψ⟩ = <span>{qState.alpha}</span>|0⟩ + <span>{qState.beta}</span>|1⟩
                </div>
                <div>P(|0⟩ Alternative) = <strong>{Math.round(qState.prob0 * 100)}%</strong></div>
                <div>P(|1⟩ Optimal) = <strong style={{ color: '#22d3ee' }}>{Math.round(qState.prob1 * 100)}%</strong></div>
                <div style={{ color: '#94a3b8', fontSize: '0.7rem' }}>
                  Von Neumann Entropy: <strong style={{ color: '#a855f7' }}>{qState.entropy || '0.94'} bits</strong>
                </div>
              </div>
            </div>
          </div>

          <div style={{ fontSize: '0.75rem', color: '#94a3b8', lineHeight: 1.4 }}>
            Quantum rotation gate <strong>U(Δθ)</strong> steers the superposition towards network-level global optimum while avoiding congestion local minima.
          </div>
        </div>
      ) : isQUBO ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <div className="quantum-state-box" style={{ borderColor: 'rgba(168, 85, 247, 0.4)' }}>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', justifyContent: 'space-between' }}>
              <span>Transverse Quantum Field:</span>
              <span className="mono" style={{ color: '#c084fc', fontWeight: 600 }}>Γ(t) → 0.00</span>
            </div>

            <div style={{ margin: '0.6rem 0', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                <span style={{ color: '#94a3b8' }}>Quantum Tunneling Probability:</span>
                <span className="mono" style={{ color: '#a855f7', fontWeight: 600 }}>P_tunnel = e^(-ΔE/√(T²+Γ²))</span>
              </div>
              <div style={{ height: '8px', background: '#1e293b', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: '92%', height: '100%', background: 'linear-gradient(90deg, #a855f7, #06b6d4)' }} />
              </div>
            </div>

            <div style={{ fontSize: '0.7rem', color: '#cbd5e1' }}>
              Ising Hamiltonian: <strong>H = Σ Cost(p) + λ Σ (V_e - C_e)²</strong>
            </div>
          </div>

          <div style={{ fontSize: '0.75rem', color: '#94a3b8', lineHeight: 1.4 }}>
            Quantum tunneling penetrates high, narrow congestion barriers where classical simulated annealing gets trapped in gridlock.
          </div>
        </div>
      ) : (
        <div style={{ padding: '1rem', textAlign: 'center', color: '#64748b', fontSize: '0.8rem' }}>
          <Layers size={28} style={{ margin: '0 auto 0.5rem', opacity: 0.5 }} />
          <div>Current algorithm uses classical deterministic or heuristic logic without quantum superposition or tunneling.</div>
        </div>
      )}
    </div>
  );
}
