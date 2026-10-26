/**
 * Classical Genetic Algorithm (Standard GA)
 * Traditional evolutionary benchmark using integer chromosome encoding,
 * tournament selection, uniform crossover, and random mutation.
 */

export function runClassicalGA(network, vehicleTrips, options = {}) {
  const {
    popSize = 24,
    maxGenerations = 35,
    crossoverRate = 0.8,
    mutationRate = 0.1
  } = options;

  const numVehicles = vehicleTrips.length;
  if (numVehicles === 0) return null;

  // 1. Candidate paths
  const tripCandidates = vehicleTrips.map(trip => {
    const paths = network.findCandidatePaths(trip.origin, trip.dest, 4);
    return paths.length > 0 ? paths : [{
      nodes: [trip.origin, trip.dest],
      linkIds: network.nodesToLinkIds([trip.origin, trip.dest]),
      baseCost: 99
    }];
  });

  // 2. Initialize classical population (integer chromosomes)
  let population = [];
  for (let p = 0; p < popSize; p++) {
    const chromosome = tripCandidates.map(c => Math.floor(Math.random() * c.length));
    population.push(chromosome);
  }

  const getRoutes = (chrom) => chrom.map((idx, v) => tripCandidates[v][idx]);

  let globalBestFitness = Infinity;
  let globalBestRoutes = null;
  let globalBestMetrics = null;

  const convergenceHistory = [];

  for (let gen = 0; gen < maxGenerations; gen++) {
    // Fitness evaluation
    const evaluated = population.map(chrom => {
      const routes = getRoutes(chrom);
      const metrics = network.evaluateAssignment(routes);
      const fitness = metrics.totalTravelTime + (metrics.severeCongestionCount * 25);
      return { chrom, routes, metrics, fitness };
    });

    // Track best
    evaluated.forEach(item => {
      if (item.fitness < globalBestFitness) {
        globalBestFitness = item.fitness;
        globalBestRoutes = item.routes;
        globalBestMetrics = item.metrics;
      }
    });

    const avgFitness = evaluated.reduce((sum, item) => sum + item.fitness, 0) / popSize;
    convergenceHistory.push({
      generation: gen,
      bestFitness: Math.round(globalBestFitness * 10) / 10,
      avgFitness: Math.round(avgFitness * 10) / 10,
      bestTSTT: globalBestMetrics ? globalBestMetrics.totalTravelTime : 0
    });

    // Selection: Tournament Selection
    const tournamentSelect = () => {
      const i1 = Math.floor(Math.random() * popSize);
      const i2 = Math.floor(Math.random() * popSize);
      return evaluated[i1].fitness < evaluated[i2].fitness ? evaluated[i1].chrom : evaluated[i2].chrom;
    };

    // Reproduce next generation
    const nextGen = [];
    while (nextGen.length < popSize) {
      const parent1 = tournamentSelect();
      const parent2 = tournamentSelect();

      let child1 = [...parent1];
      let child2 = [...parent2];

      // Crossover
      if (Math.random() < crossoverRate) {
        const splitPoint = Math.floor(Math.random() * numVehicles);
        child1 = [...parent1.slice(0, splitPoint), ...parent2.slice(splitPoint)];
        child2 = [...parent2.slice(0, splitPoint), ...parent1.slice(splitPoint)];
      }

      // Mutation
      const mutate = (chrom) => {
        return chrom.map((gene, v) => {
          if (Math.random() < mutationRate) {
            return Math.floor(Math.random() * tripCandidates[v].length);
          }
          return gene;
        });
      };

      nextGen.push(mutate(child1));
      if (nextGen.length < popSize) nextGen.push(mutate(child2));
    }

    population = nextGen;
  }

  return {
    algorithm: 'CGA',
    name: 'Classical Genetic Algorithm',
    routes: globalBestRoutes,
    metrics: globalBestMetrics,
    convergenceHistory
  };
}
