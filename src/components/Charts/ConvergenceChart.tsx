import React, { useRef, useEffect } from 'react';
import { TrendingDown } from 'lucide-react';

interface ConvergenceChartProps {
  algorithmResults: Record<string, any>;
}

export default function ConvergenceChart({ algorithmResults }: ConvergenceChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    const qgaHist = algorithmResults['QGA']?.convergenceHistory || [];
    const quboHist = algorithmResults['QUBO']?.convergenceHistory || [];
    const cgaHist = algorithmResults['CGA']?.convergenceHistory || [];
    const dijkstraHist = algorithmResults['DIJKSTRA']?.convergenceHistory || [];

    if (qgaHist.length === 0 && quboHist.length === 0 && cgaHist.length === 0) {
      ctx.fillStyle = '#64748b';
      ctx.font = '11px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Run optimization to view convergence trajectories', width / 2, height / 2);
      return;
    }

    const allVals: number[] = [];
    [qgaHist, quboHist, cgaHist, dijkstraHist].forEach(hist => {
      hist.forEach((h: any) => {
        if (h.bestFitness && isFinite(h.bestFitness)) allVals.push(h.bestFitness);
      });
    });

    if (allVals.length === 0) return;

    const minVal = Math.min(...allVals) * 0.95;
    const maxVal = Math.max(...allVals) * 1.05;

    const padLeft = 35;
    const padRight = 15;
    const padTop = 15;
    const padBottom = 20;

    const plotW = width - padLeft - padRight;
    const plotH = height - padTop - padBottom;

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;

    for (let i = 0; i <= 3; i++) {
      const y = padTop + (plotH / 3) * i;
      ctx.beginPath();
      ctx.moveTo(padLeft, y);
      ctx.lineTo(width - padRight, y);
      ctx.stroke();

      const val = Math.round(maxVal - ((maxVal - minVal) / 3) * i);
      ctx.fillStyle = '#64748b';
      ctx.font = '9px JetBrains Mono, monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`${val}`, padLeft - 5, y + 3);
    }

    const drawSeries = (hist: any[], strokeColor: string, lineWidth: number, isDashed = false) => {
      if (!hist || hist.length === 0) return;

      ctx.beginPath();
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = lineWidth;
      if (isDashed) {
        ctx.setLineDash([4, 4]);
      } else {
        ctx.setLineDash([]);
      }

      hist.forEach((pt, idx) => {
        const x = padLeft + (idx / Math.max(hist.length - 1, 1)) * plotW;
        const normY = (pt.bestFitness - minVal) / (maxVal - minVal || 1);
        const y = padTop + (1 - normY) * plotH;

        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });

      ctx.stroke();
      ctx.setLineDash([]);
    };

    drawSeries(dijkstraHist, '#f59e0b', 1.5, true);
    drawSeries(cgaHist, '#10b981', 1.5);
    drawSeries(quboHist, '#a855f7', 2);
    drawSeries(qgaHist, '#06b6d4', 2.5);

    if (qgaHist.length > 0) {
      const last = qgaHist[qgaHist.length - 1];
      const x = padLeft + plotW;
      const normY = (last.bestFitness - minVal) / (maxVal - minVal || 1);
      const y = padTop + (1 - normY) * plotH;

      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#22d3ee';
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }, [algorithmResults]);

  return (
    <div className="glass-panel control-card">
      <div className="card-title">
        <div className="card-title-icon">
          <TrendingDown size={18} />
          <span>Convergence Trajectory</span>
        </div>
        <div style={{ display: 'flex', gap: '0.6rem', fontSize: '0.65rem' }}>
          <span style={{ color: '#06b6d4', fontWeight: 600 }}>● QGA</span>
          <span style={{ color: '#a855f7', fontWeight: 600 }}>● QUBO</span>
          <span style={{ color: '#10b981', fontWeight: 600 }}>● CGA</span>
          <span style={{ color: '#f59e0b', fontWeight: 600 }}>-- Dijkstra</span>
        </div>
      </div>

      <div style={{ width: '100%', height: '115px' }}>
        <canvas
          ref={canvasRef}
          width={300}
          height={115}
          style={{ width: '100%', height: '100%', display: 'block' }}
        />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: '#64748b' }}>
        <span>Iteration 0</span>
        <span>Evolutionary Generations →</span>
        <span>Iteration 35</span>
      </div>
    </div>
  );
}
