/**
 * Classical Dijkstra / Uncoordinated Selfish Routing
 * Represents the standard User Equilibrium baseline where each driver greedily
 * chooses the shortest path based on initial/static free-flow times, ignoring system-wide congestion.
 */

export function runDijkstra(network, vehicleTrips) {
  const numVehicles = vehicleTrips.length;
  if (numVehicles === 0) return null;

  // Single-source Dijkstra for node graph
  const dijkstraShortestPath = (originId, destId) => {
    const dist = new Map();
    const prev = new Map();
    const unvisited = new Set(network.nodes.map(n => n.id));

    network.nodes.forEach(n => dist.set(n.id, Infinity));
    dist.set(originId, 0);

    while (unvisited.size > 0) {
      // Find node with minimum distance in unvisited
      let curr = null;
      let minDist = Infinity;
      unvisited.forEach(nodeId => {
        const d = dist.get(nodeId);
        if (d < minDist) {
          minDist = d;
          curr = nodeId;
        }
      });

      if (curr === null || minDist === Infinity) break;
      if (curr === destId) break;

      unvisited.delete(curr);

      // Explore outbound links
      const outbound = network.links.filter(l => l.from === curr);
      for (const link of outbound) {
        if (!unvisited.has(link.to)) continue;
        const alt = dist.get(curr) + link.t0;
        if (alt < dist.get(link.to)) {
          dist.set(link.to, alt);
          prev.set(link.to, curr);
        }
      }
    }

    // Reconstruct path
    const pathNodes = [];
    let u = destId;
    while (u !== undefined) {
      pathNodes.unshift(u);
      u = prev.get(u);
      if (u === originId) {
        pathNodes.unshift(originId);
        break;
      }
    }

    return {
      nodes: pathNodes,
      linkIds: network.nodesToLinkIds(pathNodes),
      baseCost: dist.get(destId)
    };
  };

  // Precompute shortest paths for all unique OD pairs
  const odMap = new Map();
  const routes = vehicleTrips.map(trip => {
    const key = `${trip.origin}->${trip.dest}`;
    if (!odMap.has(key)) {
      odMap.set(key, dijkstraShortestPath(trip.origin, trip.dest));
    }
    return odMap.get(key);
  });

  const metrics = network.evaluateAssignment(routes);

  // Flat convergence history (Dijkstra does not iterate)
  const convergenceHistory = Array.from({ length: 30 }, (_, i) => ({
    generation: i,
    bestFitness: Math.round(metrics.totalTravelTime * 10) / 10,
    avgFitness: Math.round(metrics.totalTravelTime * 10) / 10,
    bestTSTT: metrics.totalTravelTime
  }));

  return {
    algorithm: 'DIJKSTRA',
    name: 'Classical Dijkstra (Greedy / Uncoordinated)',
    routes,
    metrics,
    convergenceHistory
  };
}
