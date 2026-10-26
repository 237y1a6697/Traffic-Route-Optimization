import React, { useRef, useEffect, useState, useCallback } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, AlertTriangle, Info, Play, Pause } from 'lucide-react';

export default function NetworkCanvas({
  network,
  activeAlgorithm,
  algorithmResults,
  isSimulating,
  setIsSimulating,
  simSpeed,
  onLinkIncidentToggle,
  selectedLink,
  setSelectedLink
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  // Transform state (Pan and Zoom)
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredLink, setHoveredLink] = useState(null);

  // Animation frame reference and vehicle particle positions
  const animRef = useRef(null);
  const vehiclesRef = useRef([]);

  // Initialize animated vehicles when algorithm results or activeAlgorithm change
  useEffect(() => {
    const currentResult = algorithmResults[activeAlgorithm];
    if (!currentResult || !currentResult.routes || currentResult.routes.length === 0) {
      vehiclesRef.current = [];
      return;
    }

    const nodeCoords = new Map();
    network.nodes.forEach(n => nodeCoords.set(n.id, { x: n.x, y: n.y }));

    // Create particle representations for vehicles
    const particles = currentResult.routes.map((route, idx) => {
      return {
        id: idx,
        routeNodes: route.nodes,
        currentNodeIdx: 0,
        segmentProgress: Math.random() * 0.9, // distribute initially
        speed: 0.008 + Math.random() * 0.006,
        color: activeAlgorithm === 'QGA' ? '#22d3ee' :
               activeAlgorithm === 'QUBO' ? '#c084fc' :
               activeAlgorithm === 'CGA' ? '#34d399' : '#fbbf24'
      };
    });

    vehiclesRef.current = particles;
  }, [algorithmResults, activeAlgorithm, network]);

  // Main Canvas Rendering Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let lastTime = performance.now();

    const render = (time) => {
      const dt = (time - lastTime) / 1000;
      lastTime = time;

      // Handle canvas resize
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        if (canvas.width !== clientWidth || canvas.height !== clientHeight) {
          canvas.width = clientWidth;
          canvas.height = clientHeight;
        }
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      // Apply Pan and Zoom
      ctx.translate(offset.x, offset.y);
      ctx.scale(scale, scale);

      const nodeCoords = new Map();
      network.nodes.forEach(n => nodeCoords.set(n.id, { x: n.x, y: n.y }));

      const currentResult = algorithmResults[activeAlgorithm];
      const linkMetrics = currentResult?.metrics?.linkMetrics;

      // 1. Draw Network Links (Roads)
      network.links.forEach(link => {
        const from = nodeCoords.get(link.from);
        const to = nodeCoords.get(link.to);
        if (!from || !to) return;

        const isIncident = network.incidents.has(link.id);
        const isHovered = hoveredLink?.id === link.id;
        const isSelected = selectedLink?.id === link.id;

        const metrics = linkMetrics?.get(link.id);
        const vcRatio = metrics?.vcRatio || 0;

        // Calculate link color based on congestion or incident
        let strokeColor = '#334155';
        let glowColor = 'transparent';

        if (isIncident) {
          strokeColor = '#ef4444';
          glowColor = 'rgba(239, 68, 68, 0.7)';
        } else if (metrics) {
          if (vcRatio < 0.6) {
            strokeColor = '#10b981';
          } else if (vcRatio < 0.9) {
            strokeColor = '#06b6d4';
          } else if (vcRatio < 1.15) {
            strokeColor = '#f59e0b';
            glowColor = 'rgba(245, 158, 11, 0.3)';
          } else {
            strokeColor = '#ef4444';
            glowColor = 'rgba(239, 68, 68, 0.5)';
          }
        }

        // Draw background road path
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);

        // Highlight line
        ctx.lineWidth = isSelected ? 6 : isHovered ? 5 : Math.max(2.5, link.capacity / 12);
        ctx.strokeStyle = strokeColor;
        ctx.lineCap = 'round';

        if (glowColor !== 'transparent' || isHovered || isSelected) {
          ctx.shadowColor = isSelected ? '#38bdf8' : glowColor;
          ctx.shadowBlur = 10;
        } else {
          ctx.shadowBlur = 0;
        }

        ctx.stroke();
        ctx.shadowBlur = 0;

        // Draw incident warning badge on link midpoint
        if (isIncident) {
          const midX = (from.x + to.x) / 2;
          const midY = (from.y + to.y) / 2;
          ctx.fillStyle = '#ef4444';
          ctx.beginPath();
          ctx.arc(midX, midY, 6, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#fff';
          ctx.font = 'bold 8px Inter';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('!', midX, midY);
        }
      });

      // 2. Draw Moving Vehicle Particles
      if (isSimulating && vehiclesRef.current.length > 0) {
        vehiclesRef.current.forEach(vehicle => {
          if (!vehicle.routeNodes || vehicle.routeNodes.length < 2) return;

          const n1Id = vehicle.routeNodes[vehicle.currentNodeIdx];
          const n2Id = vehicle.routeNodes[vehicle.currentNodeIdx + 1];
          const n1 = nodeCoords.get(n1Id);
          const n2 = nodeCoords.get(n2Id);

          if (n1 && n2) {
            // Find current link congestion to scale speed
            const link = network.links.find(l => l.from === n1Id && l.to === n2Id);
            const m = link ? linkMetrics?.get(link.id) : null;
            const congestionSlowdown = m ? Math.max(0.15, 1 / (1 + 0.15 * Math.pow(m.vcRatio, 3))) : 1;

            // Advance vehicle progress
            vehicle.segmentProgress += vehicle.speed * simSpeed * congestionSlowdown;

            if (vehicle.segmentProgress >= 1.0) {
              vehicle.segmentProgress = 0;
              vehicle.currentNodeIdx++;
              if (vehicle.currentNodeIdx >= vehicle.routeNodes.length - 1) {
                // Trip complete: restart at origin
                vehicle.currentNodeIdx = 0;
              }
            }

            // Interpolate position
            const curX = n1.x + (n2.x - n1.x) * vehicle.segmentProgress;
            const curY = n1.y + (n2.y - n1.y) * vehicle.segmentProgress;

            // Draw vehicle dot with quantum glow
            ctx.beginPath();
            ctx.arc(curX, curY, 3.5, 0, Math.PI * 2);
            ctx.fillStyle = vehicle.color;
            ctx.shadowColor = vehicle.color;
            ctx.shadowBlur = 8;
            ctx.fill();
            ctx.shadowBlur = 0;
          }
        });
      }

      // 3. Draw Nodes (Junctions)
      network.nodes.forEach(node => {
        const isConnectedToSelected = selectedLink && 
          (selectedLink.from === node.id || selectedLink.to === node.id);

        // Node outer ring
        ctx.beginPath();
        ctx.arc(node.x, node.y, 11, 0, Math.PI * 2);
        ctx.fillStyle = isConnectedToSelected ? 'rgba(56, 189, 248, 0.25)' : 'rgba(15, 23, 42, 0.9)';
        ctx.strokeStyle = isConnectedToSelected ? '#38bdf8' : '#475569';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fill();

        // Node center core
        ctx.beginPath();
        ctx.arc(node.x, node.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#06b6d4';
        ctx.shadowColor = '#06b6d4';
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Node Label
        ctx.font = '600 10px Inter';
        ctx.fillStyle = '#94a3b8';
        ctx.textAlign = 'center';
        ctx.fillText(`N${node.id}`, node.x, node.y - 15);
      });

      ctx.restore();

      animRef.current = requestAnimationFrame(render);
    };

    animRef.current = requestAnimationFrame(render);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [network, activeAlgorithm, algorithmResults, isSimulating, simSpeed, offset, scale, hoveredLink, selectedLink]);

  // Mouse interaction handlers
  const handleMouseDown = (e) => {
    if (e.button === 0) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
      return;
    }

    // Check hit-testing on links
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left - offset.x) / scale;
    const mouseY = (e.clientY - rect.top - offset.y) / scale;

    const nodeCoords = new Map();
    network.nodes.forEach(n => nodeCoords.set(n.id, { x: n.x, y: n.y }));

    let hit = null;
    for (const link of network.links) {
      const from = nodeCoords.get(link.from);
      const to = nodeCoords.get(link.to);
      if (!from || !to) continue;

      // Distance from point to line segment
      const dist = distanceToSegment(mouseX, mouseY, from.x, from.y, to.x, to.y);
      if (dist < 10) {
        hit = link;
        break;
      }
    }

    setHoveredLink(hit);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleClick = (e) => {
    if (hoveredLink) {
      setSelectedLink(hoveredLink);
    } else {
      setSelectedLink(null);
    }
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    setScale(prev => Math.max(0.5, Math.min(prev * zoomFactor, 3.0)));
  };

  const resetView = () => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
    setSelectedLink(null);
  };

  return (
    <div className="sim-container" ref={containerRef}>
      {/* Simulation Floating Controls */}
      <div className="sim-toolbar">
        <button
          className={`btn btn-sm ${isSimulating ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setIsSimulating(!isSimulating)}
          title={isSimulating ? 'Pause Traffic' : 'Play Traffic'}
        >
          {isSimulating ? <Pause size={14} /> : <Play size={14} />}
          {isSimulating ? 'Pause' : 'Simulate'}
        </button>
        <button className="btn btn-sm btn-outline" onClick={() => setScale(s => Math.min(s * 1.2, 3.0))} title="Zoom In">
          <ZoomIn size={14} />
        </button>
        <button className="btn btn-sm btn-outline" onClick={() => setScale(s => Math.max(s * 0.8, 0.5))} title="Zoom Out">
          <ZoomOut size={14} />
        </button>
        <button className="btn btn-sm btn-outline" onClick={resetView} title="Reset View">
          <RotateCcw size={14} />
        </button>
      </div>

      {/* Network & Algorithm Status Overlay */}
      <div className="sim-info-overlay">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#f8fafc', fontWeight: 600 }}>
          <span>{network.name}</span>
        </div>
        <div>Nodes: {network.nodes.length} | Links: {network.links.length}</div>
        <div style={{ color: activeAlgorithm === 'QGA' ? '#22d3ee' : activeAlgorithm === 'QUBO' ? '#c084fc' : '#10b981' }}>
          Active View: {activeAlgorithm}
        </div>
      </div>

      {/* Canvas */}
      <div className="canvas-viewport">
        <canvas
          id="trafficCanvas"
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onClick={handleClick}
          onWheel={handleWheel}
        />
      </div>

      {/* Link Congestion Legend */}
      <div className="sim-legend">
        <span style={{ fontWeight: 600, color: '#f8fafc' }}>Flow V/C:</span>
        <div className="legend-item">
          <div className="legend-color" style={{ background: '#10b981' }} />
          <span>&lt; 0.6 Free</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ background: '#06b6d4' }} />
          <span>0.6 - 0.9 Optimal</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ background: '#f59e0b' }} />
          <span>0.9 - 1.1 Dense</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ background: '#ef4444' }} />
          <span>&gt; 1.1 Congested</span>
        </div>
      </div>

      {/* Selected Link Floating Detail Inspector */}
      {selectedLink && (
        <div style={{
          position: 'absolute',
          bottom: '1rem',
          right: '1rem',
          background: 'rgba(15, 23, 42, 0.92)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(56, 189, 248, 0.4)',
          borderRadius: '10px',
          padding: '0.85rem',
          fontSize: '0.8rem',
          zIndex: 10,
          minWidth: '220px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.5)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', fontWeight: 600, color: '#38bdf8' }}>
            <span>Link #{selectedLink.id} (N{selectedLink.from} → N{selectedLink.to})</span>
            <button
              onClick={() => setSelectedLink(null)}
              style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
            >
              ✕
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', color: '#cbd5e1' }}>
            <div>Base Cost (t0): <strong>{selectedLink.t0} mins</strong></div>
            <div>Effective Capacity: <strong>{Math.round(network.getEffectiveCapacity(selectedLink))} veh/hr</strong></div>
            {algorithmResults[activeAlgorithm]?.metrics?.linkMetrics?.get(selectedLink.id) && (
              <>
                <div>Volume: <strong>{algorithmResults[activeAlgorithm].metrics.linkMetrics.get(selectedLink.id).volume} veh</strong></div>
                <div>V/C Ratio: <strong>{Math.round(algorithmResults[activeAlgorithm].metrics.linkMetrics.get(selectedLink.id).vcRatio * 100) / 100}</strong></div>
                <div>Actual Travel Time: <strong>{Math.round(algorithmResults[activeAlgorithm].metrics.linkMetrics.get(selectedLink.id).travelTime * 10) / 10} mins</strong></div>
              </>
            )}
            <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <button
                className={`btn btn-sm ${network.incidents.has(selectedLink.id) ? 'btn-primary' : 'btn-danger'}`}
                style={{ width: '100%' }}
                onClick={() => onLinkIncidentToggle(selectedLink.id)}
              >
                <AlertTriangle size={13} />
                {network.incidents.has(selectedLink.id) ? 'Clear Incident' : 'Trigger Roadblock (Accident)'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Distance from point (px, py) to line segment (x1, y1) -> (x2, y2)
function distanceToSegment(px, py, x1, y1, x2, y2) {
  const l2 = (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
  if (l2 === 0) return Math.hypot(px - x1, py - y1);
  let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (x1 + t * (x2 - x1)), py - (y1 + t * (y2 - y1)));
}
