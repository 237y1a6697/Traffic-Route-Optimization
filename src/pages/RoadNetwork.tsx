import React, { useState } from 'react';
import { 
  Compass, MapPin, Search, Filter, Database, 
  ExternalLink, Layers, ArrowRight, ShieldCheck 
} from 'lucide-react';
import { HYDERABAD_LOCATIONS, HYDERABAD_ROAD_EDGES } from '../data/static/hyderabadGeoData';

export default function RoadNetworkPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState<'edges' | 'nodes'>('edges');

  const filteredEdges = HYDERABAD_ROAD_EDGES.filter(e => 
    e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(e.from).toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(e.to).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredNodes = HYDERABAD_LOCATIONS.filter(n =>
    n.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    n.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1400px', margin: '0 auto', color: '#f1f5f9' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <Compass size={22} color="#6366f1" />
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, color: '#fff' }}>
            OpenStreetMap Road Graph Topology
          </h1>
        </div>
        <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0 }}>
          Graph representation of Hyderabad metropolitan road network extracted from OpenStreetMap (OSM) via Overpass Turbo.
        </p>
      </div>

      {/* OSM Sourcing Notice */}
      <div style={{
        background: 'rgba(99, 102, 241, 0.1)',
        border: '1px solid rgba(99, 102, 241, 0.3)',
        borderRadius: '8px',
        padding: '0.85rem 1.25rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem',
        fontSize: '0.8rem',
        color: '#c7d2fe'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Database size={18} style={{ flexShrink: 0 }} />
          <span>
            <strong>Data Source:</strong> OpenStreetMap contributors (ODbL License). Raw highway geometry and topology preserved in <code>data/osm/</code>.
          </span>
        </div>
        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>EPSG:4326 WGS-84</span>
      </div>

      {/* Graph Overview Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ background: '#1e293b', padding: '1rem', borderRadius: '10px', border: '1px solid #334155' }}>
          <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase' }}>Intersections (Vertices)</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#38bdf8' }}>{HYDERABAD_LOCATIONS.length} Nodes</div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Key traffic junctions & centers</div>
        </div>

        <div style={{ background: '#1e293b', padding: '1rem', borderRadius: '10px', border: '1px solid #334155' }}>
          <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase' }}>Road Segments (Edges)</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#10b981' }}>{HYDERABAD_ROAD_EDGES.length} Edges</div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Dual-direction travel corridors</div>
        </div>

        <div style={{ background: '#1e293b', padding: '1rem', borderRadius: '10px', border: '1px solid #334155' }}>
          <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase' }}>Total Network Length</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#a855f7' }}>
            {Math.round(HYDERABAD_ROAD_EDGES.reduce((acc, e) => acc + e.distance, 0))} km
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Arterial & expressway network</div>
        </div>

        <div style={{ background: '#1e293b', padding: '1rem', borderRadius: '10px', border: '1px solid #334155' }}>
          <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase' }}>Bounding Box</div>
          <div style={{ fontSize: '1rem', fontWeight: 700, color: '#f59e0b', marginTop: '0.35rem' }}>
            17.32°N, 78.30°E to 17.52°N, 78.58°E
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Greater Hyderabad Area</div>
        </div>
      </div>

      {/* Filter and Tab Bar */}
      <div style={{
        background: '#1e293b',
        borderRadius: '12px',
        border: '1px solid #334155',
        padding: '1.25rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => setSelectedTab('edges')}
              className={`btn ${selectedTab === 'edges' ? 'btn-primary' : 'btn-outline'}`}
              style={{ fontSize: '0.8rem', padding: '0.4rem 0.85rem' }}
            >
              Road Segments ({HYDERABAD_ROAD_EDGES.length})
            </button>
            <button
              onClick={() => setSelectedTab('nodes')}
              className={`btn ${selectedTab === 'nodes' ? 'btn-primary' : 'btn-outline'}`}
              style={{ fontSize: '0.8rem', padding: '0.4rem 0.85rem' }}
            >
              Intersections ({HYDERABAD_LOCATIONS.length})
            </button>
          </div>

          <div style={{ position: 'relative', width: '280px' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: '#64748b' }} />
            <input
              type="text"
              placeholder={`Search ${selectedTab === 'edges' ? 'corridors' : 'nodes'}...`}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                background: '#0f172a',
                border: '1px solid #334155',
                borderRadius: '6px',
                padding: '0.45rem 0.75rem 0.45rem 2rem',
                color: '#fff',
                fontSize: '0.8rem'
              }}
            />
          </div>
        </div>

        {/* Table Display */}
        {selectedTab === 'edges' ? (
          <div style={{ overflowX: 'auto', maxHeight: '450px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #334155', color: '#94a3b8' }}>
                  <th style={{ padding: '0.6rem' }}>Edge ID</th>
                  <th style={{ padding: '0.6rem' }}>Corridor Name</th>
                  <th style={{ padding: '0.6rem' }}>From Node</th>
                  <th style={{ padding: '0.6rem' }}>To Node</th>
                  <th style={{ padding: '0.6rem' }}>Distance (km)</th>
                  <th style={{ padding: '0.6rem' }}>Speed Limit</th>
                </tr>
              </thead>
              <tbody>
                {filteredEdges.map(edge => (
                  <tr key={edge.id} style={{ borderBottom: '1px solid #1e293b' }}>
                    <td style={{ padding: '0.6rem', fontFamily: 'monospace', color: '#64748b' }}>{edge.id}</td>
                    <td style={{ padding: '0.6rem', fontWeight: 600, color: '#f1f5f9' }}>{edge.name}</td>
                    <td style={{ padding: '0.6rem', color: '#38bdf8' }}>{edge.from}</td>
                    <td style={{ padding: '0.6rem', color: '#10b981' }}>{edge.to}</td>
                    <td style={{ padding: '0.6rem', color: '#f8fafc' }}>{edge.distance} km</td>
                    <td style={{ padding: '0.6rem', color: '#94a3b8' }}>{edge.speedLimit} km/h</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ overflowX: 'auto', maxHeight: '450px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #334155', color: '#94a3b8' }}>
                  <th style={{ padding: '0.6rem' }}>Node ID</th>
                  <th style={{ padding: '0.6rem' }}>Location Name</th>
                  <th style={{ padding: '0.6rem' }}>Latitude (°N)</th>
                  <th style={{ padding: '0.6rem' }}>Longitude (°E)</th>
                  <th style={{ padding: '0.6rem' }}>Aliases</th>
                </tr>
              </thead>
              <tbody>
                {filteredNodes.map(node => (
                  <tr key={node.id} style={{ borderBottom: '1px solid #1e293b' }}>
                    <td style={{ padding: '0.6rem', fontFamily: 'monospace', color: '#64748b' }}>{node.id}</td>
                    <td style={{ padding: '0.6rem', fontWeight: 600, color: '#f1f5f9' }}>{node.name}</td>
                    <td style={{ padding: '0.6rem', color: '#38bdf8' }}>{node.lat.toFixed(5)}</td>
                    <td style={{ padding: '0.6rem', color: '#10b981' }}>{node.lng.toFixed(5)}</td>
                    <td style={{ padding: '0.6rem', color: '#94a3b8' }}>{(node.keywords || []).slice(0, 3).join(', ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
