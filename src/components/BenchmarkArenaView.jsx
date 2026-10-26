import React, { useState, useMemo, useCallback, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { BarChart3, BookOpen, Layers } from 'lucide-react';

import { NETWORKS } from '../data/networks';
import { TrafficNetwork } from '../models/trafficModel';
import { runQGA } from '../algorithms/qga';
import { runQUBOAnnealing } from '../algorithms/quboAnnealing';
import { runClassicalGA } from '../algorithms/classicalGa';
import { runDijkstra } from '../algorithms/dijkstra';

import NetworkCanvas from './NetworkCanvas';
import SidebarControls from './SidebarControls';
import MetricsPanel from './MetricsPanel';
import QuantumVisualizer from './QuantumVisualizer';
import ConvergenceChart from './ConvergenceChart';
import BenchmarkModal from './BenchmarkModal';
import MathDocModal from './MathDocModal';

export default function BenchmarkArenaView() {
  const [selectedNetworkKey, setSelectedNetworkKey] = useState('logisticsCorridor'); // Defaults to the 12-node Tri-City Freight Corridor
  const [activeAlgorithm, setActiveAlgorithm] = useState('QGA');
  const [vehicleCount, setVehicleCount] = useState(80);
  const [rushHourFactor, setRushHourFactor] = useState(1.0);
  const [weather, setWeather] = useState('clear');
  const [simSpeed, setSimSpeed] = useState(1.5);
  const [isSimulating, setIsSimulating] = useState(true);
  const [isOptimizing, setIsOptimizing] = useState(false);

  const [isBenchmarkOpen, setIsBenchmarkOpen] = useState(false);
  const [isMathDocOpen, setIsMathDocOpen] = useState(false);
  const [selectedLink, setSelectedLink] = useState(null);
  const [incidentCounter, setIncidentCounter] = useState(0);

  // Network instance
  const network = useMemo(() => {
    const netData = NETWORKS[selectedNetworkKey] || NETWORKS.logisticsCorridor;
    const net = new TrafficNetwork(netData);
    net.weatherFactor = weather === 'rain' ? 0.8 : weather === 'storm' ? 0.6 : 1.0;
    return net;
  }, [selectedNetworkKey, weather]);

  // Vehicle trips
  const vehicleTrips = useMemo(() => {
    const totalVehicles = Math.round(vehicleCount * rushHourFactor);
    const nodeIds = network.nodes.map(n => n.id);
    const trips = [];
    for (let i = 0; i < totalVehicles; i++) {
      const origIdx = (i * 3 + 1) % nodeIds.length;
      let destIdx = (origIdx + 5 + (i % 7)) % nodeIds.length;
      if (destIdx === origIdx) destIdx = (destIdx + 1) % nodeIds.length;
      trips.push({ id: i, origin: nodeIds[origIdx], dest: nodeIds[destIdx] });
    }
    return trips;
  }, [network, vehicleCount, rushHourFactor]);

  const [algorithmResults, setAlgorithmResults] = useState({});

  const executeOptimization = useCallback((customNet = network) => {
    setIsOptimizing(true);
    setTimeout(() => {
      try {
        const dijkstraRes = runDijkstra(customNet, vehicleTrips);
        const cgaRes = runClassicalGA(customNet, vehicleTrips, { popSize: 20, maxGenerations: 25 });
        const quboRes = runQUBOAnnealing(customNet, vehicleTrips, { maxSteps: 40 });
        const qgaRes = runQGA(customNet, vehicleTrips, { popSize: 22, maxGenerations: 30 });

        setAlgorithmResults({
          DIJKSTRA: dijkstraRes,
          CGA: cgaRes,
          QUBO: quboRes,
          QGA: qgaRes
        });

        confetti({
          particleCount: 35,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#06b6d4', '#a855f7', '#38bdf8']
        });
      } catch (err) {
        console.error('Benchmark optimization error:', err);
      } finally {
        setIsOptimizing(false);
      }
    }, 50);
  }, [network, vehicleTrips]);

  useEffect(() => {
    executeOptimization(network);
  }, [selectedNetworkKey, vehicleCount, rushHourFactor, weather]);

  const handleLinkIncidentToggle = (linkId) => {
    if (network.incidents.has(linkId)) {
      network.setIncident(linkId, 1.0);
    } else {
      network.setIncident(linkId, 0.1, 'Major Bottleneck Collision');
    }
    setIncidentCounter(c => c + 1);
    executeOptimization(network);
  };

  const handleInjectRandomIncident = () => {
    if (network.links.length === 0) return;
    const randomLink = network.links[Math.floor(Math.random() * network.links.length)];
    network.setIncident(randomLink.id, 0.15, 'Incident');
    setSelectedLink(randomLink);
    setIncidentCounter(c => c + 1);
    executeOptimization(network);
  };

  const handleClearIncidents = () => {
    network.clearIncidents();
    setSelectedLink(null);
    setIncidentCounter(c => c + 1);
    executeOptimization(network);
  };

  return (
    <div style={{ height: 'calc(100vh - 73px)', display: 'flex', flexDirection: 'column' }}>
      {/* Sub-header for Benchmark Arena */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0.6rem 1.5rem',
        background: 'rgba(15, 23, 42, 0.8)',
        borderBottom: '1px solid var(--border-subtle)',
        fontSize: '0.8rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ background: 'rgba(168, 85, 247, 0.2)', padding: '0.3rem', borderRadius: '6px', color: '#c084fc' }}>
            <Layers size={16} />
          </div>
          <div>
            <strong style={{ color: '#f8fafc' }}>Academic Research & Network Simulation Arena</strong>
            <span style={{ color: '#64748b', marginLeft: '0.5rem' }}>
              Canonical 12-Node Freight & 24-Node Sioux Falls Benchmarks with Microscopic BPR Latency
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-sm btn-outline" onClick={() => setIsMathDocOpen(true)}>
            <BookOpen size={13} />
            <span>Math & Theory</span>
          </button>
          <button className="btn btn-sm btn-quantum" onClick={() => setIsBenchmarkOpen(true)}>
            <BarChart3 size={13} />
            <span>Arena Matrix</span>
          </button>
        </div>
      </div>

      <main className="dashboard-layout" style={{ height: 'calc(100% - 46px)' }}>
        <SidebarControls
          selectedNetworkKey={selectedNetworkKey}
          setSelectedNetworkKey={setSelectedNetworkKey}
          activeAlgorithm={activeAlgorithm}
          setActiveAlgorithm={setActiveAlgorithm}
          vehicleCount={vehicleCount}
          setVehicleCount={setVehicleCount}
          weather={weather}
          setWeather={setWeather}
          rushHourFactor={rushHourFactor}
          setRushHourFactor={setRushHourFactor}
          isOptimizing={isOptimizing}
          onRunOptimization={() => executeOptimization(network)}
          onInjectRandomIncident={handleInjectRandomIncident}
          onClearIncidents={handleClearIncidents}
          incidentCount={network.incidents.size}
          simSpeed={simSpeed}
          setSimSpeed={setSimSpeed}
        />

        <div className="center-col">
          <NetworkCanvas
            network={network}
            activeAlgorithm={activeAlgorithm}
            algorithmResults={algorithmResults}
            isSimulating={isSimulating}
            setIsSimulating={setIsSimulating}
            simSpeed={simSpeed}
            onLinkIncidentToggle={handleLinkIncidentToggle}
            selectedLink={selectedLink}
            setSelectedLink={setSelectedLink}
          />
        </div>

        <div className="sidebar-col">
          <MetricsPanel
            activeAlgorithm={activeAlgorithm}
            algorithmResults={algorithmResults}
          />
          <QuantumVisualizer
            activeAlgorithm={activeAlgorithm}
            algorithmResult={algorithmResults[activeAlgorithm]}
          />
          <ConvergenceChart
            algorithmResults={algorithmResults}
          />
        </div>
      </main>

      <BenchmarkModal
        isOpen={isBenchmarkOpen}
        onClose={() => setIsBenchmarkOpen(false)}
        algorithmResults={algorithmResults}
        network={network}
        vehicleCount={Math.round(vehicleCount * rushHourFactor)}
      />

      <MathDocModal
        isOpen={isMathDocOpen}
        onClose={() => setIsMathDocOpen(false)}
      />
    </div>
  );
}
