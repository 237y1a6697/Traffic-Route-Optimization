/**
 * Simulated Quantum Annealing (SQA) & QUBO Formulation for Traffic Routing
 * Formulates the multi-vehicle path selection as an Ising Hamiltonian with
 * transverse quantum tunneling field Gamma(t).
 * 
 * Objective Function:
 * Minimize H = H_travel + lambda_capacity * H_bottleneck - Gamma(t) * H_transverse
 */

export function runQUBOAnnealing(network, vehicleTrips, options = {}) {
  const {
    maxSteps = 60,
    gamma0 = 4.5, // Initial transverse quantum field strength
    temp0 = 3.0,  // Initial thermal temperature
    penaltyLambda = 35.0
  } = options;

  const numVehicles = vehicleTrips.length;
  if (numVehicles === 0) return null;

  // 1. Get candidate paths
  const tripCandidates = vehicleTrips.map(trip => {
    const paths = network.findCandidatePaths(trip.origin, trip.dest, 4);
    return paths.length > 0 ? paths : [{
      nodes: [trip.origin, trip.dest],
      linkIds: network.nodesToLinkIds([trip.origin, trip.dest]),
      baseCost: 99
    }];
  });

  // 2. Initial state: random candidate path index for each vehicle
  let currentState = tripCandidates.map(c => Math.floor(Math.random() * c.length));
  
  const getRoutes = (state) => state.map((pathIdx, v) => tripCandidates[v][pathIdx]);

  // Energy / Hamiltonian evaluation
  const evaluateHamiltonian = (state) => {
    const routes = getRoutes(state);
    const metrics = network.evaluateAssignment(routes);
    // Quadratic bottleneck penalty
    let penalty = 0;
    metrics.linkMetrics.forEach((m) => {
      if (m.volume > m.capacity) {
        const excess = m.volume - m.capacity;
        penalty += penaltyLambda * Math.pow(excess, 2);
      }
    });
    return {
      energy: metrics.totalTravelTime + penalty,
      metrics,
      routes
    };
  };

  let { energy: currentEnergy, metrics: bestMetrics, routes: bestRoutes } = evaluateHamiltonian(currentState);
  let bestEnergy = currentEnergy;
  let bestState = [...currentState];

  const convergenceHistory = [];
  const quantumTunnelingHistory = [];

  // Annealing Schedule
  for (let step = 0; step < maxSteps; step++) {
    const progress = step / maxSteps;
    // Transverse quantum field decay schedule
    const gamma = gamma0 * Math.pow(1 - progress, 1.5);
    // Thermal cooling schedule
    const temp = temp0 * (1 - 0.85 * progress);

    quantumTunnelingHistory.push(Math.round(gamma * 100) / 100);

    // Quantum Monte Carlo step with transverse tunneling
    for (let sweep = 0; sweep < numVehicles; sweep++) {
      // Pick random vehicle
      const v = Math.floor(Math.random() * numVehicles);
      const numOptions = tripCandidates[v].length;
      if (numOptions <= 1) continue;

      const oldChoice = currentState[v];
      const newChoice = Math.floor(Math.random() * numOptions);
      if (newChoice === oldChoice) continue;

      currentState[v] = newChoice;
      const { energy: newEnergy, metrics: candMetrics, routes: candRoutes } = evaluateHamiltonian(currentState);
      const deltaE = newEnergy - currentEnergy;

      // Quantum Tunneling Acceptance Probability:
      // Includes both thermal fluctuation and quantum transverse-field tunneling
      const effectiveBarrierTemp = Math.sqrt(Math.pow(temp, 2) + Math.pow(gamma, 2));
      const acceptProb = deltaE < 0 ? 1.0 : Math.exp(-deltaE / effectiveBarrierTemp);

      if (Math.random() < acceptProb) {
        currentEnergy = newEnergy;
        if (newEnergy < bestEnergy) {
          bestEnergy = newEnergy;
          bestState = [...currentState];
          bestMetrics = candMetrics;
          bestRoutes = candRoutes;
        }
      } else {
        // Revert spin flip
        currentState[v] = oldChoice;
      }
    }

    convergenceHistory.push({
      generation: step,
      bestFitness: Math.round(bestEnergy * 10) / 10,
      avgFitness: Math.round(currentEnergy * 10) / 10,
      bestTSTT: bestMetrics ? bestMetrics.totalTravelTime : 0,
      gamma: Math.round(gamma * 100) / 100
    });
  }

  return {
    algorithm: 'QUBO',
    name: 'Simulated Quantum Annealing (QUBO)',
    routes: bestRoutes,
    metrics: bestMetrics,
    convergenceHistory,
    quantumTunnelingHistory,
    finalGamma: 0
  };
}
