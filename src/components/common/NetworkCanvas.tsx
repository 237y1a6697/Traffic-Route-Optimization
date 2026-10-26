import React, { useRef, useEffect, useState } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Play, Pause } from 'lucide-react';
import { TrafficNetwork } from '../../models/trafficModel';

interface NetworkCanvasProps {
  network: TrafficNetwork;
  activeAlgorithm: string;
  algorithmResults: Record<string, any>;
  isSimulating: boolean;
  setIsSimulating: (val: boolean) => void;
  simSpeed: number;
  onLinkIncidentToggle: (linkId: string) => void;
  selectedLink: any;
  setSelectedLink: (link: any) => void;
}

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
}: NetworkCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredLink, setHoveredLink] = useState<any>(null);

  const animRef = useRef<number | null>(null);
  const vehiclesRef = useRef<any[]>([]);

  useEffect(() => {
    const currentResult = algorithmResults[activeAlgorithm];
    if (!currentResult || !currentResult.routes || currentResult.routes.length === 0) {
      vehiclesRef.current = [];
      return;
    }

    const particles = currentResult.routes.map((route: any, idx: number) => {
      return {
        id: idx,
        routeNodes: route.nodes,
        currentNodeIdx: 0,
        segmentProgress: Math.random() * 0.9,
        speed: 0.008 + Math.random() * 0.006,
        color: activeAlgorithm === 'QGA' ? '#22d3ee' :
               activeAlgorithm === 'QUBO' ? '#c084fc' :
               activeAlgorithm === 'CGA' ? '#34d399' : '#fbbf24'
      };
    });

    vehiclesRef.current = particles;
  }, [algorithmResults, activeAlgorithm, network]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastTime = performance.now();

    const render = (time: number) => {
      lastTime = time;

      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        if (canvas.width !== clientWidth || canvas.height !== clientHeight) {
          canvas.width = clientWidth;
          canvas.height = clientHeight;
        }
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      ctx.translate(offset.x, offset.y);
      ctx.scale(scale, scale);

      const nodeCoords = new Map<number | string, { x: number; y: number }>();
      network.nodes.forEach((n: any) => nodeCoords.set(n.id, { x: n.x, y: n.y }));

      const currentResult = algorithmResults[activeAlgorithm];
      const linkMetrics = currentResult?.metrics?.linkMetrics;

      // 1. Draw Links
      network.links.forEach((link: any) => {
        const from = nodeCoords.get(link.from);
        const to = nodeCoords.get(link.to);
        if (!from || !to) return;

        const isIncident = network.incidents.has(link.id);
        const isHovered = hoveredLink?.id === link.id;
        const isSelected = selectedLink?.id === link.id;

        const metrics = linkMetrics?.get(link.id);
        const vcRatio = metrics?.vcRatio || 0;

        let strokeColor = '#334155';
        let glowColor = 'transparent';

        if (isIncident) {
          strokeColor = '#ef4444';
          glowColor = 'rgba(239, 68, 68, 0.7)';
        } else if (metrics) {
          if (vcRatio < 0.6) strokeColor = '#10b981';
          else if (vcRatio < 0.9) strokeColor = '#06b6d4';
          else if (vcRatio < 1.15) {
            strokeColor = '#f59e0b';
            glowColor = 'rgba(245, 158, 11, 0.3)';
          } else {
            strokeColor = '#ef4444';
            glowColor = 'rgba(239, 68, 68, 0.5)';
          }
        }

        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);

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

        if (isIncident) {
          const midX = (from.x + to.x) / 2;
          const midY = (from.y + to.y) / 2;
          ctx.fillStyle = '#ef4444';
          ctx.beginPath();
          ctx.arc(midX, midY, 6, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#fff';
          ctx.font = 'bold 8px Inter, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('!', midX, midY);
        }
      });

      // 2. Moving vehicle particles
      if (isSimulating && vehiclesRef.current.length > 0) {
        vehiclesRef.current.forEach(vehicle => {
          if (!vehicle.routeNodes || vehicle.routeNodes.length < 2) return;

          const n1Id = vehicle.routeNodes[vehicle.currentNodeIdx];
          const n2Id = vehicle.routeNodes[vehicle.currentNodeIdx + 1];
          const n1 = nodeCoords.get(n1Id);
          const n2 = nodeCoords.get(n2Id);

          if (n1 && n2) {
            const link = network.links.find((l: any) => l.from === n1Id && l.to === n2Id);
            const m = link ? linkMetrics?.get(link.id) : null;
            const congestionSlowdown = m ? Math.max(0.15, 1 / (1 + 0.15 * Math.pow(m.vcRatio, 3))) : 1;

            vehicle.segmentProgress += vehicle.speed * simSpeed * congestionSlowdown;

            if (vehicle.segmentProgress >= 1.0) {
              vehicle.segmentProgress = 0;
              vehicle.currentNodeIdx++;
              if (vehicle.currentNodeIdx >= vehicle.routeNodes.length - 1) {
                vehicle.currentNodeIdx = 0;
              }
            }

            const curX = n1.x + (n2.x - n1.x) * vehicle.segmentProgress;
            const curY = n1.y + (n2.y - n1.y) * vehicle.segmentProgress;

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

      // 3. Draw Nodes
      network.nodes.forEach((node: any) => {
        const isConnectedToSelected = selectedLink && 
          (selectedLink.from === node.id || selectedLink.to === node.id);

        ctx.beginPath();
        ctx.arc(node.x, node.y, 11, 0, Math.PI * 2);
        ctx.fillStyle = isConnectedToSelected ? 'rgba(56, 189, 248, 0.25)' : 'rgba(15, 23, 42, 0.9)';
        ctx.strokeStyle = isConnectedToSelected ? '#38bdf8' : '#475569';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fill();

        ctx.beginPath();
        ctx.arc(node.x, node.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#06b6d4';
        ctx.shadowColor = '#06b6d4';
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.font = '600 10px Inter, sans-serif';
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

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left - offset.x) / scale;
    const mouseY = (e.clientY - rect.top - offset.y) / scale;

    const nodeCoords = new Map<number | string, { x: number; y: number }>();
    network.nodes.forEach((n: any) => nodeCoords.set(n.id, { x: n.x, y: n.y }));

    let hit = null;
    for (const link of network.links) {
      const from = nodeCoords.get(link.from);
      const to = nodeCoords.get(link.to);
      if (!from || !to) continue;

      const dist = distanceToSegment(mouseX, mouseY, from.x, from.y, to.x, to.y);
      if (dist < 10) {
        hit = link;
        break;
      }
    }
    setHoveredLink(hit);
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleClick = () => {
    if (hoveredLink) setSelectedLink(hoveredLink);
    else setSelectedLink(null);
  };

  const handleWheel = (e: React.WheelEvent) => {
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

      <div className="sim-info-overlay">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#f8fafc', fontWeight: 600 }}>
          <span>{network.name}</span>
        </div>
        <div>Nodes: {network.nodes.length} | Links: {network.links.length}</div>
        <div style={{ color: activeAlgorithm === 'QGA' ? '#22d3ee' : activeAlgorithm === 'QUBO' ? '#c084fc' : '#10b981' }}>
          Active View: {activeAlgorithm}
        </div>
      </div>

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
    </div>
  );
}

function distanceToSegment(px: number, py: number, x1: number, y1: number, x2: number, y2: number) {
  const l2 = (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
  if (l2 === 0) return Math.hypot(px - x1, py - y1);
  let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (x1 + t * (x2 - x1)), py - (y1 + t * (y2 - y1)));
}
