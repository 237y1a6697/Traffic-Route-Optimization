import React from 'react';
import { 
  Cpu, Server, Database, Globe, Layers, 
  Terminal, ShieldCheck, FileText, ExternalLink, Code 
} from 'lucide-react';

export default function SystemInformationPage() {
  const stack = [
    {
      category: 'Frontend Client',
      color: '#38bdf8',
      items: [
        { name: 'React 19', desc: 'UI component framework with concurrent rendering' },
        { name: 'TypeScript 5.8+', desc: 'Static typing for models, routes, and geographic data' },
        { name: 'Vite 8', desc: 'Next-generation ES module bundler and dev server' },
        { name: 'Leaflet 1.9', desc: 'Hardware-accelerated interactive OpenStreetMap GIS client' },
        { name: 'Lucide React', desc: 'Modern SVG iconography system' }
      ]
    },
    {
      category: 'Authoritative Python Engine',
      color: '#10b981',
      items: [
        { name: 'FastAPI', desc: 'Asynchronous REST API endpoints for route solving and predictions' },
        { name: 'NetworkX', desc: 'Graph theory structures and shortest-path heuristic algorithms' },
        { name: 'OSMnx', desc: 'OpenStreetMap road network retrieval and graph topology simplification' },
        { name: 'Scikit-learn', desc: 'Machine learning regression models for link travel time forecasting' },
        { name: 'NumPy / SciPy', desc: 'Vectorized QIGA rotation gate and probabilistic calculations' }
      ]
    },
    {
      category: 'Data & Infrastructure',
      color: '#a855f7',
      items: [
        { name: 'OpenStreetMap (OSM)', desc: 'Authoritative geographic road data extracted via Overpass Turbo' },
        { name: 'PostgreSQL / PostGIS', desc: 'Spatial database for storing road geometries and historical traffic' },
        { name: 'Docker Compose', desc: 'Multi-container orchestration for frontend, API, and database services' },
        { name: 'GeoJSON (EPSG:4326)', desc: 'Standard spatial serialization format for road network features' }
      ]
    }
  ];

  const endpoints = [
    { method: 'POST', path: '/api/route', desc: 'Solves multi-objective route via QIGA, A*, or Dijkstra with BPR penalty' },
    { method: 'GET', path: '/api/traffic/conditions', desc: 'Returns real-time simulated link speeds and incident status' },
    { method: 'POST', path: '/api/traffic/incident', desc: 'Injects or removes a road hazard/bottleneck on specified segment' },
    { method: 'POST', path: '/api/ml/predict', desc: 'Predicts future link travel times using ML regression model' },
    { method: 'POST', path: '/api/benchmark/run', desc: 'Runs academic benchmark suite across multiple road network topologies' }
  ];

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1400px', margin: '0 auto', color: '#f1f5f9' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <Cpu size={22} color="#38bdf8" />
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, color: '#fff' }}>
            System Architecture & Environment Specifications
          </h1>
        </div>
        <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0 }}>
          Technical stack, architectural separation of responsibilities, and authoritative research engine specs.
        </p>
      </div>

      {/* Architecture Separation Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.9))',
        border: '1px solid #334155',
        borderRadius: '12px',
        padding: '1.5rem',
        marginBottom: '2rem'
      }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 0.75rem 0', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Layers size={18} />
          <span>Architectural Responsibility Separation</span>
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', fontSize: '0.8rem' }}>
          <div style={{ background: '#0f172a', padding: '1rem', borderRadius: '8px', border: '1px solid #334155' }}>
            <strong style={{ color: '#38bdf8', fontSize: '0.9rem' }}>Frontend Client (React + TS)</strong>
            <ul style={{ margin: '0.5rem 0 0 0', paddingLeft: '1.2rem', color: '#94a3b8', lineHeight: 1.6 }}>
              <li>Interactive map rendering with Leaflet</li>
              <li>Location search and geocoding auto-complete</li>
              <li>User preference sliders and weight tuning</li>
              <li>Visual route display and Pareto comparison</li>
              <li>API orchestration and async communication</li>
            </ul>
          </div>

          <div style={{ background: '#0f172a', padding: '1rem', borderRadius: '8px', border: '1px solid #334155' }}>
            <strong style={{ color: '#10b981', fontSize: '0.9rem' }}>Python Engine (Authoritative Research)</strong>
            <ul style={{ margin: '0.5rem 0 0 0', paddingLeft: '1.2rem', color: '#94a3b8', lineHeight: 1.6 }}>
              <li>Road graph construction and simplification</li>
              <li>Authoritative QIGA quantum probability update</li>
              <li>Dijkstra and A* algorithmic baselines</li>
              <li>Dynamic BPR congestion calculations</li>
              <li>Machine learning traffic flow prediction</li>
            </ul>
          </div>

          <div style={{ background: '#0f172a', padding: '1rem', borderRadius: '8px', border: '1px solid #334155' }}>
            <strong style={{ color: '#a855f7', fontSize: '0.9rem' }}>Data & Persistence Pipeline</strong>
            <ul style={{ margin: '0.5rem 0 0 0', paddingLeft: '1.2rem', color: '#94a3b8', lineHeight: 1.6 }}>
              <li><code>data/osm/</code>: Raw Overpass Turbo GeoJSON</li>
              <li><code>python_engine/data/processed/</code>: Graph artifacts</li>
              <li><code>database/schema/</code>: PostGIS road schemas</li>
              <li><code>experiments/</code>: Benchmark datasets and logs</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Tech Stack Breakdown */}
      <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 1rem 0', color: '#f8fafc' }}>
        Technology Stack Details
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        {stack.map(group => (
          <div
            key={group.category}
            style={{
              background: '#1e293b',
              border: `1px solid ${group.color}44`,
              borderRadius: '12px',
              padding: '1.25rem'
            }}
          >
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: group.color, margin: '0 0 0.75rem 0' }}>
              {group.category}
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {group.items.map(item => (
                <div key={item.name} style={{ fontSize: '0.8rem' }}>
                  <span style={{ fontWeight: 600, color: '#f1f5f9' }}>{item.name}: </span>
                  <span style={{ color: '#94a3b8' }}>{item.desc}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* API Endpoints */}
      <div style={{
        background: '#1e293b',
        borderRadius: '12px',
        border: '1px solid #334155',
        padding: '1.25rem'
      }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 1rem 0', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Server size={18} color="#10b981" />
          <span>Python Engine REST API Specification</span>
        </h3>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #334155', color: '#94a3b8' }}>
                <th style={{ padding: '0.6rem' }}>Method</th>
                <th style={{ padding: '0.6rem' }}>Endpoint</th>
                <th style={{ padding: '0.6rem' }}>Description</th>
              </tr>
            </thead>
            <tbody>
              {endpoints.map(ep => (
                <tr key={ep.path} style={{ borderBottom: '1px solid #1e293b' }}>
                  <td style={{ padding: '0.6rem' }}>
                    <span style={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      padding: '0.2rem 0.4rem',
                      borderRadius: '4px',
                      background: ep.method === 'POST' ? 'rgba(56, 189, 248, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                      color: ep.method === 'POST' ? '#38bdf8' : '#10b981'
                    }}>
                      {ep.method}
                    </span>
                  </td>
                  <td style={{ padding: '0.6rem', fontFamily: 'monospace', color: '#f1f5f9' }}>{ep.path}</td>
                  <td style={{ padding: '0.6rem', color: '#94a3b8' }}>{ep.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
