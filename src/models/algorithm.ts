/**
 * TypeScript Interfaces for Optimization Algorithms & Preferences
 */

export interface OptimizationWeights {
  timeWeight: number;
  congestionWeight: number;
  distanceWeight: number;
  fuelWeight: number;
  emissionsWeight: number;
}

export interface ConvergencePoint {
  generation: number;
  bestFitness: number;
  avgFitness: number;
  bestTSTT: number;
  gamma?: number;
}

export interface QuantumStateData {
  theta: number;
  alpha: number;
  beta: number;
  prob0: number;
  prob1: number;
  entropy?: number;
}

export interface AlgorithmBenchmarkResult {
  algorithm: string;
  name: string;
  routes?: any[];
  metrics?: any;
  convergenceHistory?: ConvergencePoint[];
  quantumState?: QuantumStateData;
  quantumEntropyHistory?: number[];
  quantumTunnelingHistory?: number[];
}
