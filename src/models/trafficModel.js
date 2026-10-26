/**
 * Traffic Network Model & Latency Formulations
 * Implements Bureau of Public Roads (BPR) latency functions,
 * K-shortest candidate paths generator, and network equilibrium metrics.
 */

export class TrafficNetwork {
  constructor(networkData) {
    this.id = networkData.id;
    this.name = networkData.name;
    this.description = networkData.description;
    this.nodes = JSON.parse(JSON.stringify(networkData.layoutNodes || networkData.nodes));
    this.links = JSON.parse(JSON.stringify(networkData.links));

    // BPR parameters
    this.alpha = 0.15;
    this.beta = 4.0;

    // Incidents state: map of linkId -> { factor: 0.1, reason: 'Accident' }
    this.incidents = new Map();
    this.weatherFactor = 1.0; // 1.0 = clear, 0.8 = rain, 0.6 = storm

    // Link flow volumes (vehicle counts currently on each link)
    this.linkVolumes = new Map();
    this.links.forEach(l => this.linkVolumes.set(l.id, 0));

    // Cache of K-shortest paths for OD pairs
    this.pathCache = new Map();
  }

  // Set an incident / roadblock on a link
  setIncident(linkId, capacityMultiplier, reason = 'Accident') {
    if (capacityMultiplier >= 1.0) {
      this.incidents.delete(linkId);
    } else {
      this.incidents.set(linkId, { factor: capacityMultiplier, reason });
    }
    this.pathCache.clear();
  }

  clearIncidents() {
    this.incidents.clear();
    this.pathCache.clear();
  }

  getEffectiveCapacity(link) {
    let cap = link.capacity * this.weatherFactor;
    if (this.incidents.has(link.id)) {
      cap *= this.incidents.get(link.id).factor;
    }
    return Math.max(cap, 1.0); // minimum 1 to avoid zero division
  }

  // Bureau of Public Roads (BPR) link travel time calculation
  getLinkTravelTime(link, volume = null) {
    const v = volume !== null ? volume : (this.linkVolumes.get(link.id) || 0);
    const c = this.getEffectiveCapacity(link);
    const vcRatio = v / c;
    const weatherPenalty = (2 - this.weatherFactor);
    return link.t0 * weatherPenalty * (1 + this.alpha * Math.pow(vcRatio, this.beta));
  }

  // Find candidate paths between origin and destination (K-shortest paths)
  findCandidatePaths(originId, destId, k = 4) {
    const key = `${originId}->${destId}`;
    if (this.pathCache.has(key)) {
      return this.pathCache.get(key);
    }

    // DFS with depth limit to find diverse loops-free candidate paths
    const paths = [];
    const visited = new Set([originId]);

    const dfs = (current, target, currentPath, currentCost, depth) => {
      if (paths.length >= 12 || depth > 10) return;

      if (current === target) {
        paths.push({
          nodes: [...currentPath],
          linkIds: this.nodesToLinkIds(currentPath),
          baseCost: currentCost
        });
        return;
      }

      // Find outbound links
      const outbound = this.links.filter(l => l.from === current && !visited.has(l.to));
      // Sort by link t0
      outbound.sort((a, b) => a.t0 - b.t0);

      for (const link of outbound) {
        visited.add(link.to);
        currentPath.push(link.to);
        dfs(link.to, target, currentPath, currentCost + link.t0, depth + 1);
        currentPath.pop();
        visited.delete(link.to);
      }
    };

    dfs(originId, destId, [originId], 0, 0);

    // Sort by base cost and take top K diverse paths
    paths.sort((a, b) => a.baseCost - b.baseCost);
    const selected = paths.slice(0, Math.max(k, 2));

    // Fallback: If no path found, return direct or empty
    this.pathCache.set(key, selected);
    return selected;
  }

  nodesToLinkIds(nodeList) {
    const linkIds = [];
    for (let i = 0; i < nodeList.length - 1; i++) {
      const from = nodeList[i];
      const to = nodeList[i + 1];
      const link = this.links.find(l => l.from === from && l.to === to);
      if (link) linkIds.push(link.id);
    }
    return linkIds;
  }

  // Evaluate total system metrics given a set of vehicle path assignments
  evaluateAssignment(vehicleRoutes) {
    // 1. Calculate flow volume on each link
    const volumes = new Map();
    this.links.forEach(l => volumes.set(l.id, 0));

    vehicleRoutes.forEach(route => {
      if (!route || !route.linkIds) return;
      route.linkIds.forEach(lid => {
        volumes.set(lid, (volumes.get(lid) || 0) + 1);
      });
    });

    // 2. Compute travel times and total system travel time (TSTT)
    let totalTravelTime = 0;
    let maxCongestionRatio = 0;
    let severeCongestionCount = 0;
    let totalFreeFlowTime = 0;

    const linkMetrics = new Map();

    this.links.forEach(link => {
      const v = volumes.get(link.id) || 0;
      const c = this.getEffectiveCapacity(link);
      const vcRatio = v / c;
      const travelTime = this.getLinkTravelTime(link, v);

      if (vcRatio > maxCongestionRatio) {
        maxCongestionRatio = vcRatio;
      }
      if (vcRatio >= 1.0) {
        severeCongestionCount++;
      }

      totalTravelTime += v * travelTime;
      totalFreeFlowTime += v * link.t0;

      linkMetrics.set(link.id, {
        volume: v,
        capacity: c,
        vcRatio,
        travelTime,
        isCongested: vcRatio >= 1.0
      });
    });

    const numVehicles = Math.max(vehicleRoutes.length, 1);
    const avgTravelTime = totalTravelTime / numVehicles;

    // Environmental calculation: CO2 emission model
    // Base 120g/km + 28g per minute of delay over free-flow
    const delayMins = Math.max(0, totalTravelTime - totalFreeFlowTime);
    const estDistanceKm = totalFreeFlowTime * 0.8; // rough distance correlation
    const co2Kg = ((estDistanceKm * 120) + (delayMins * 32)) / 1000;

    return {
      totalTravelTime: Math.round(totalTravelTime * 10) / 10,
      avgTravelTime: Math.round(avgTravelTime * 100) / 100,
      maxCongestionRatio: Math.round(maxCongestionRatio * 100) / 100,
      severeCongestionCount,
      co2Kg: Math.round(co2Kg * 10) / 10,
      delayMins: Math.round(delayMins * 10) / 10,
      linkMetrics,
      volumes
    };
  }
}
