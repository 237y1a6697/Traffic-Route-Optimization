import React from 'react';
import { X, BookOpen, Atom, Zap, Cpu, Compass } from 'lucide-react';

export default function MathDocModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '820px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ background: 'rgba(168, 85, 247, 0.2)', padding: '0.4rem', borderRadius: '8px', color: '#c084fc' }}>
              <BookOpen size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.15rem' }}>Mathematical & Algorithmic Formulation</h2>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                Theoretical foundations of Quantum-Inspired Intelligent Traffic Route Optimization
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          {/* Section 1: BPR Traffic Latency */}
          <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '1.1rem', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#38bdf8', fontWeight: 700, marginBottom: '0.5rem' }}>
              <Compass size={16} />
              <span>1. Bureau of Public Roads (BPR) Latency Formulation</span>
            </div>
            <p style={{ color: '#cbd5e1', fontSize: '0.8rem', lineHeight: 1.5, marginBottom: '0.6rem' }}>
              In real-world transportation networks, as traffic volume on a link approaches its physical capacity, speed drops non-linearly. We model this using the standard BPR cost function:
            </p>
            <div style={{ background: '#090e1a', padding: '0.75rem', borderRadius: '6px', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: '#22d3ee', textAlign: 'center' }}>
              t_e(V_e) = t_0(e) · [ 1 + α · ( V_e / C_e )^β ]
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.5rem', lineHeight: 1.4 }}>
              Where <strong>t_0(e)</strong> is free-flow travel time, <strong>V_e</strong> is flow volume, <strong>C_e</strong> is effective capacity, <strong>α = 0.15</strong>, and <strong>β = 4.0</strong>. Note the 4th-power exponent: when volume exceeds capacity (V/C &gt; 1), latency spikes dramatically, causing gridlock!
            </div>
          </div>

          {/* Section 2: QGA */}
          <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '1.1rem', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#22d3ee', fontWeight: 700, marginBottom: '0.5rem' }}>
              <Atom size={16} />
              <span>2. Quantum-Inspired Genetic Algorithm (QGA)</span>
            </div>
            <p style={{ color: '#cbd5e1', fontSize: '0.8rem', lineHeight: 1.5, marginBottom: '0.6rem' }}>
              Unlike classical binary chromosomes that represent a single fixed state, a <strong>Q-bit chromosome</strong> simultaneously represents an entire quantum superposition of routes:
            </p>
            <div style={{ background: '#090e1a', padding: '0.75rem', borderRadius: '6px', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: '#38bdf8', textAlign: 'center' }}>
              |ψ_j⟩ = cos(θ_j)|0⟩ + sin(θ_j)|1⟩, &nbsp;&nbsp; with |α_j|² + |β_j|² = 1
            </div>
            <p style={{ color: '#cbd5e1', fontSize: '0.8rem', lineHeight: 1.5, marginTop: '0.6rem' }}>
              <strong>Quantum Rotation Gate U(Δθ):</strong> Population diversity is preserved while rotating the phase angle θ towards the global best route configuration:
            </p>
            <div style={{ background: '#090e1a', padding: '0.75rem', borderRadius: '6px', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#c084fc', textAlign: 'center', marginTop: '0.4rem' }}>
              [ α'_j , β'_j ]^T = [ cos(Δθ_j) &nbsp; -sin(Δθ_j) ; &nbsp; sin(Δθ_j) &nbsp; cos(Δθ_j) ] · [ α_j , β_j ]^T
            </div>
          </div>

          {/* Section 3: QUBO & SQA */}
          <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '1.1rem', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#c084fc', fontWeight: 700, marginBottom: '0.5rem' }}>
              <Zap size={16} />
              <span>3. Simulated Quantum Annealing (QUBO & Transverse Field)</span>
            </div>
            <p style={{ color: '#cbd5e1', fontSize: '0.8rem', lineHeight: 1.5, marginBottom: '0.6rem' }}>
              Multi-vehicle routing is mapped to a Quadratic Unconstrained Binary Optimization (QUBO) problem via a Transverse-Field Ising Hamiltonian:
            </p>
            <div style={{ background: '#090e1a', padding: '0.75rem', borderRadius: '6px', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#a855f7', textAlign: 'center' }}>
              H(t) = s(t) · [ Σ Cost(p_v) + λ Σ max(0, V_e - C_e)² ] - (1 - s(t)) · Γ_0 Σ σ_x
            </div>
            <p style={{ color: '#cbd5e1', fontSize: '0.8rem', lineHeight: 1.5, marginTop: '0.6rem' }}>
              The transverse magnetic field <strong>Γ(t)</strong> enables <strong>quantum tunneling</strong> through narrow, high congestion barriers, escaping local minima that trap classical thermal simulated annealing.
            </p>
          </div>

          {/* Section 4: Price of Anarchy */}
          <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '1.1rem', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fbbf24', fontWeight: 700, marginBottom: '0.5rem' }}>
              <Cpu size={16} />
              <span>4. Price of Anarchy (PoA) & Braess's Paradox</span>
            </div>
            <p style={{ color: '#cbd5e1', fontSize: '0.8rem', lineHeight: 1.5 }}>
              In classical uncoordinated navigation (Dijkstra/GPS), every vehicle greedily chooses the path with lowest perceived latency. This drives the network into <strong>User Equilibrium (UE)</strong>, which is mathematically proven to be suboptimal compared to <strong>System Optimum (SO)</strong>. The ratio <em>PoA = TSTT(UE) / TSTT(SO)</em> measures the efficiency loss of selfish routing.
            </p>
          </div>

          {/* Section 5: Multi-Objective Pareto Function, Fuel & Emissions */}
          <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '1.1rem', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981', fontWeight: 700, marginBottom: '0.5rem' }}>
              <Compass size={16} />
              <span>5. Multi-Objective Pareto Function, Fuel & Emissions</span>
            </div>
            <p style={{ color: '#cbd5e1', fontSize: '0.8rem', lineHeight: 1.5, marginBottom: '0.6rem' }}>
              Candidate routes follow the physical OpenStreetMap road network via the OSRM driving engine. The Quantum-Inspired GA evaluates candidate routes across normalized multi-objective metrics:
            </p>
            <div style={{ background: '#090e1a', padding: '0.75rem', borderRadius: '6px', fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: '#34d399', textAlign: 'center' }}>
              J(r) = w_t·T̃(r) + w_c·C̃(r) + w_d·D̃(r) + w_f·Ẽ_fuel(r) + w_e·Ẽ_co2(r) + P_incident
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.5rem', lineHeight: 1.4 }}>
              • <strong>Road Geometry:</strong> Fetched via OSRM Driving Routing API (lat/lng converted for Leaflet polylines).<br/>
              • <strong>Traffic Data:</strong> Clearly labeled simulated traffic based on BPR latency, peak period multipliers, and road capacities.<br/>
              • <strong>Fuel Model:</strong> Fuel(r) = D(r) · 0.072 L/km + Delay(r) · 0.028 L/min (7.2 L/100km city car baseline + congestion idling penalty).<br/>
              • <strong>CO₂ Emissions:</strong> CO₂(r) = Fuel(r) · 2.31 kg CO₂/L (standard passenger car emission factor).
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-primary" onClick={onClose}>
            Understood
          </button>
        </div>
      </div>
    </div>
  );
}
