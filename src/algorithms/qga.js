/**
 * Quantum-Inspired Genetic Algorithm (QGA) for Traffic Route Optimization
 * Uses Quantum Bit (Q-bit) angle representation and Quantum Rotation Gates.
 * 
 * Mathematical Formulation:
 * State: |psi> = cos(theta)|0> + sin(theta)|1>
 * Probability of observing state |1>: P(1) = sin^2(theta)
 * Initial State: theta = pi / 4 (Equal Superposition |psi> = 1/sqrt(2)|0> + 1/sqrt(2)|1>)
 * Quantum Rotation Gate: theta_new = theta_old + Delta_theta
 */

export function runQGA(network, vehicleTrips, options = {}) {
  const {
    popSize = 24,
    maxGenerations = 35,
    deltaThetaBase = 0.04 * Math.PI,
    mutationProb = 0.05
  } = options;

  const numVehicles = vehicleTrips.length;
  if (numVehicles === 0) return null;

  // 1. Precompute candidate paths for each vehicle trip
  const tripCandidates = vehicleTrips.map(trip => {
    const paths = network.findCandidatePaths(trip.origin, trip.dest, 4);
    return paths.length > 0 ? paths : [{
      nodes: [trip.origin, trip.dest],
      linkIds: network.nodesToLinkIds([trip.origin, trip.dest]),
      baseCost: 99
    }];
  });

  // 2. Initialize Q-bit population phase angles
  // Each individual has Q-bit chromosomes representing probability of each candidate path
  // angles[ind][vehicleIndex][pathIndex] in [0, pi/2]
  const populationAngles = [];
  for (let p = 0; p < popSize; p++) {
    const indAngles = [];
    for (let v = 0; v < numVehicles; v++) {
      const numPaths = tripCandidates[v].length;
      // Initialize in equal superposition theta = pi / 4 (50% prob)
      const vAngles = new Array(numPaths).fill(Math.PI / 4);
      indAngles.push(vAngles);
    }
    populationAngles.push(indAngles);
  }

  let globalBestFitness = Infinity;
  let globalBestRoutes = null;
  let globalBestMetrics = null;
  let globalBestAngles = null;

  const convergenceHistory = [];
  const quantumEntropyHistory = [];

  // Evolution Loop
  for (let gen = 0; gen < maxGenerations; gen++) {
    const observedPopulation = [];
    const fitnessList = [];
    const metricsList = [];

    // Measure / Collapse Quantum States into classical solutions
    for (let p = 0; p < popSize; p++) {
      const routes = [];
      for (let v = 0; v < numVehicles; v++) {
        const angles = populationAngles[p][v];
        // Quantum probability amplitude |beta|^2 = sin^2(theta)
        const probabilities = angles.map(theta => Math.pow(Math.sin(theta), 2));
        const sumProb = probabilities.reduce((a, b) => a + b, 0);

        // Roulette wheel / stochastic collapse
        const rand = Math.random() * (sumProb || 1);
        let cumulative = 0;
        let chosenIdx = 0;
        for (let k = 0; k < probabilities.length; k++) {
          cumulative += probabilities[k];
          if (rand <= cumulative) {
            chosenIdx = k;
            break;
          }
        }
        routes.push(tripCandidates[v][chosenIdx]);
      }

      // Evaluate fitness (Total System Travel Time + Congestion Penalty)
      const metrics = network.evaluateAssignment(routes);
      // Fitness = TSTT + penalty for severe bottleneck links
      const fitness = metrics.totalTravelTime + (metrics.severeCongestionCount * 25);

      observedPopulation.push(routes);
      fitnessList.push(fitness);
      metricsList.push(metrics);

      if (fitness < globalBestFitness) {
        globalBestFitness = fitness;
        globalBestRoutes = routes;
        globalBestMetrics = metrics;
        globalBestAngles = JSON.parse(JSON.stringify(populationAngles[p]));
      }
    }

    // Calculate quantum Von Neumann entropy of the population to track superposition
    let totalEntropy = 0;
    let totalQubits = 0;
    for (let p = 0; p < Math.min(popSize, 4); p++) {
      for (let v = 0; v < numVehicles; v++) {
        for (let k = 0; k < populationAngles[p][v].length; k++) {
          const theta = populationAngles[p][v][k];
          const p1 = Math.pow(Math.sin(theta), 2);
          const p0 = 1 - p1;
          const e = (p0 > 0.001 ? -p0 * Math.log2(p0) : 0) + (p1 > 0.001 ? -p1 * Math.log2(p1) : 0);
          totalEntropy += e;
          totalQubits++;
        }
      }
    }
    const avgEntropy = totalQubits > 0 ? totalEntropy / totalQubits : 0;
    quantumEntropyHistory.push(Math.round(avgEntropy * 1000) / 1000);

    // Record Convergence
    const avgFitness = fitnessList.reduce((a, b) => a + b, 0) / popSize;
    convergenceHistory.push({
      generation: gen,
      bestFitness: Math.round(globalBestFitness * 10) / 10,
      avgFitness: Math.round(avgFitness * 10) / 10,
      bestTSTT: globalBestMetrics ? globalBestMetrics.totalTravelTime : 0
    });

    // Apply Quantum Rotation Gate U(Delta_theta) towards the best observed solution
    // Delta_theta lookup table dynamically contracts as generations advance
    const currentDeltaTheta = deltaThetaBase * (1 - 0.7 * (gen / maxGenerations));

    for (let p = 0; p < popSize; p++) {
      for (let v = 0; v < numVehicles; v++) {
        const bestChosenRoute = globalBestRoutes[v];
        const bestIdx = tripCandidates[v].findIndex(r => r === bestChosenRoute);

        for (let k = 0; k < populationAngles[p][v].length; k++) {
          let theta = populationAngles[p][v][k];
          
          if (k === bestIdx) {
            // Rotate towards |1> (theta -> pi/2)
            theta += currentDeltaTheta;
          } else {
            // Rotate towards |0> (theta -> 0)
            theta -= currentDeltaTheta;
          }

          // Quantum Dynamic Mutation (Phase Inversion gate)
          if (Math.random() < mutationProb) {
            theta = (Math.PI / 2) - theta + (Math.random() - 0.5) * 0.1;
          }

          // Clamp theta to [0.01, pi/2 - 0.01] to retain slight quantum tunneling
          populationAngles[p][v][k] = Math.max(0.02, Math.min(Math.PI / 2 - 0.02, theta));
        }
      }
    }
  }

  // Extract representative Q-bit state angles for visualization
  const sampleQubitAngles = globalBestAngles ? globalBestAngles[0] : [Math.PI / 4];
  const thetaSample = sampleQubitAngles[0] || Math.PI / 4;
  const alpha = Math.cos(thetaSample);
  const beta = Math.sin(thetaSample);

  return {
    algorithm: 'QGA',
    name: 'Quantum-Inspired Genetic Algorithm',
    routes: globalBestRoutes,
    metrics: globalBestMetrics,
    convergenceHistory,
    quantumEntropyHistory,
    quantumState: {
      theta: Math.round(thetaSample * 100) / 100,
      alpha: Math.round(alpha * 100) / 100,
      beta: Math.round(beta * 100) / 100,
      prob0: Math.round(Math.pow(alpha, 2) * 100) / 100,
      prob1: Math.round(Math.pow(beta, 2) * 100) / 100,
      entropy: quantumEntropyHistory[quantumEntropyHistory.length - 1]
    }
  };
}
