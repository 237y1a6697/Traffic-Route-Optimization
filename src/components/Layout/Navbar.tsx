import React from 'react';
import { 
  Navigation, Layers, BarChart3, BookOpen, Menu
} from 'lucide-react';

export type PageId = 
  | 'route_optimization'
  | 'route_comparison'
  | 'benchmark_arena'
  | 'math_theory';

interface NavbarProps {
  currentPage: PageId;
  onPageChange: (page: PageId) => void;
  onOpenMathDoc?: () => void;
  routingProvider?: string;
  apiConnected?: boolean;
  isRoutePlannerOpen?: boolean;
  onToggleRoutePlanner?: () => void;
}

export default function Navbar({ 
  currentPage, 
  onPageChange, 
  onOpenMathDoc,
  routingProvider = 'Stadia Maps',
  apiConnected = true,
  isRoutePlannerOpen = true,
  onToggleRoutePlanner
}: NavbarProps) {
  return (
    <header className="app-header-compact">
      {/* 1. Left Brand Section */}
      <div className="brand-section-compact">
        <div className="brand-logo-gem">
          <Navigation size={18} color="#ffffff" style={{ transform: 'rotate(45deg)' }} />
        </div>
        <div className="brand-title-group">
          <h1 className="brand-title">
            Quantum-Inspired Intelligent Traffic Route Optimization
          </h1>
          <div className="brand-subtitle-row">
            <span className="brand-subtitle-pill">OpenStreetMap & QGA Pareto Navigation</span>
            <span className="brand-subtitle-dot">•</span>
            <span className="brand-subtitle-region">Real Hyderabad Road Network</span>
          </div>
        </div>
      </div>

      {/* 2. Center/Right Navigation Tabs & Status Strip */}
      <div className="header-nav-group">
        <div className="header-tabs">
          <button
            type="button"
            className={`header-tab-btn ${currentPage === 'route_optimization' ? 'active' : ''}`}
            onClick={() => onPageChange('route_optimization')}
            title="Interactive Route Optimization on Live Map"
          >
            <Navigation size={14} style={{ transform: 'rotate(45deg)' }} />
            <span>Route Optimization</span>
          </button>

          <button
            type="button"
            className={`header-tab-btn ${currentPage === 'route_comparison' ? 'active' : ''}`}
            onClick={() => onPageChange('route_comparison')}
            title="Comprehensive Multi-Algorithm Route Comparison"
          >
            <BarChart3 size={14} />
            <span>Route Comparison</span>
          </button>

          <button
            type="button"
            className={`header-tab-btn ${currentPage === 'benchmark_arena' ? 'active' : ''}`}
            onClick={() => onPageChange('benchmark_arena')}
            title="QGA vs Classical Dijkstra & A* Benchmark Arena"
          >
            <Layers size={14} />
            <span>Benchmark Arena</span>
          </button>

          <button
            type="button"
            className={`header-tab-btn ${currentPage === 'math_theory' ? 'active' : ''}`}
            onClick={() => {
              if (onOpenMathDoc) onOpenMathDoc();
              else onPageChange('math_theory');
            }}
            title="Quantum-Inspired Mathematical Formulations & BPR Theory"
          >
            <BookOpen size={14} />
            <span>Math & Theory</span>
          </button>
        </div>

        {/* Provider Status Pill */}
        <div className="provider-status-pill" title="Routing Engine Connection Status">
          <span className={`status-dot ${apiConnected ? 'online' : 'offline'}`} />
          <div className="status-text-stack">
            <span className="status-name">{routingProvider}</span>
            <span className="status-state">{apiConnected ? 'Connected' : 'Offline'}</span>
          </div>
        </div>

        {/* Menu Button - Toggles Recommended Route Panel */}
        <button
          type="button"
          onClick={() => {
            if (currentPage !== 'route_optimization') {
              onPageChange('route_optimization');
            }
            if (onToggleRoutePlanner) {
              onToggleRoutePlanner();
            }
          }}
          className={`hamburger-toggle-btn ${isRoutePlannerOpen ? 'active' : ''}`}
          title={isRoutePlannerOpen ? "Hide Recommended Route Panel (Full Map View)" : "Show Recommended Route Panel"}
          aria-label="Toggle Recommended Route Panel"
        >
          <Menu size={18} />
        </button>
      </div>
    </header>
  );
}
