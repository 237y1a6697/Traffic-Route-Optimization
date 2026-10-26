import React, { useState, useMemo } from 'react';
import Navbar, { PageId } from './components/Layout/Navbar';
import MathDocModal from './components/common/MathDocModal';
import { TrafficService } from './services/traffic';

import RouteOptimizationPage from './pages/RouteOptimization';
import BenchmarkArenaPage from './pages/BenchmarkArena';
import AlgorithmComparisonPage from './pages/AlgorithmComparison';

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageId>('route_optimization');
  const [isMathDocOpen, setIsMathDocOpen] = useState<boolean>(false);
  const [isRoutePlannerOpen, setIsRoutePlannerOpen] = useState<boolean>(true);

  // Shared Traffic Model state across pages
  const trafficModel = useMemo(() => new TrafficService(), []);
  const [trafficModelVersion, setTrafficModelVersion] = useState<number>(0);

  const handleTrafficModelChange = () => {
    setTrafficModelVersion(v => v + 1);
  };

  return (
    <div className="dashboard-app-root">
      {/* Top Application Navbar */}
      <Navbar
        currentPage={currentPage}
        onPageChange={(page) => {
          if (page === 'math_theory') {
            setIsMathDocOpen(true);
          } else {
            setCurrentPage(page);
          }
        }}
        onOpenMathDoc={() => setIsMathDocOpen(true)}
        routingProvider="Stadia Maps"
        apiConnected={true}
        isRoutePlannerOpen={isRoutePlannerOpen}
        onToggleRoutePlanner={() => setIsRoutePlannerOpen(prev => !prev)}
      />

      {/* Main Page Content Router */}
      <div className="dashboard-content-router">
        {currentPage === 'route_optimization' && (
          <RouteOptimizationPage
            trafficModel={trafficModel}
            trafficVersion={trafficModelVersion}
            onTrafficModelChange={handleTrafficModelChange}
            isRoutePlannerOpen={isRoutePlannerOpen}
            setIsRoutePlannerOpen={setIsRoutePlannerOpen}
            onOpenMathDoc={() => setIsMathDocOpen(true)}
          />
        )}

        {currentPage === 'route_comparison' && (
          <div className="page-wrapper-padded">
            <AlgorithmComparisonPage />
          </div>
        )}

        {currentPage === 'benchmark_arena' && (
          <div className="page-wrapper-padded">
            <BenchmarkArenaPage />
          </div>
        )}
      </div>

      {/* Mathematical Formulations Modal */}
      <MathDocModal
        isOpen={isMathDocOpen}
        onClose={() => setIsMathDocOpen(false)}
      />
    </div>
  );
}
