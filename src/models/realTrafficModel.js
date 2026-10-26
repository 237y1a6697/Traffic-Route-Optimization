/**
 * Realistic Traffic Simulation Engine
 * Clearly labeled: "Simulated Traffic Data"
 * 
 * Implements Bureau of Public Roads (BPR) latency functions with:
 * - Time-of-day peak period dynamics (Morning: 07:00-10:00, Evening: 17:00-20:00)
 * - Day-of-week multipliers (Weekday commuter rush vs Weekend leisure)
 * - Road type capacity thresholds
 * - Dynamic incident road closures / accidents
 */
import { HYDERABAD_ROAD_EDGES } from '../data/hyderabadGeoData';

export class RealTrafficModel {
  constructor() {
    this.alpha = 0.15;
    this.beta = 4.0;

    // Simulation settings
    this.timeOfDay = 8.5; // 08:30 AM (Peak morning rush)
    this.dayOfWeek = 'weekday'; // 'weekday' or 'weekend'
    this.incidents = new Map(); // edgeId -> { factor: 0.15, reason: 'Multi-vehicle Collision' }

    // Pre-populate some realistic incidents in Hyderabad during peak hours
    this.incidents.set('rd_begumpet_paradise', {
      factor: 0.35,
      reason: 'Metro Rail Construction & Bottleneck'
    });
    this.incidents.set('rd_jubilee_panjagutta', {
      factor: 0.45,
      reason: 'Heavy Traffic Signal Congestion'
    });
  }

  // Get current peak period metadata
  getPeriodInfo() {
    const hr = this.timeOfDay;
    if (this.dayOfWeek === 'weekday') {
      if (hr >= 7.0 && hr <= 10.0) {
        return { label: 'Morning Peak Rush', factor: 1.95, isPeak: true, badgeColor: '#ef4444' };
      }
      if (hr >= 17.0 && hr <= 20.0) {
        return { label: 'Evening Peak Rush', factor: 2.15, isPeak: true, badgeColor: '#ef4444' };
      }
      if (hr >= 11.0 && hr <= 16.0) {
        return { label: 'Midday Commercial Flow', factor: 1.25, isPeak: false, badgeColor: '#eab308' };
      }
      return { label: 'Night / Free Flow', factor: 0.55, isPeak: false, badgeColor: '#22c55e' };
    } else {
      // Weekend pattern
      if (hr >= 12.0 && hr <= 19.0) {
        return { label: 'Weekend Leisure & Shopping Flow', factor: 1.4, isPeak: false, badgeColor: '#eab308' };
      }
      return { label: 'Weekend Normal Flow', factor: 0.8, isPeak: false, badgeColor: '#22c55e' };
    }
  }

  setIncident(edgeId, capacityFactor, reason = 'Accident') {
    if (capacityFactor >= 1.0) {
      this.incidents.delete(edgeId);
    } else {
      this.incidents.set(edgeId, { factor: capacityFactor, reason });
    }
  }

  clearIncidents() {
    this.incidents.clear();
  }

  // Calculate dynamic simulated traffic volume for a road segment
  getEdgeTrafficVolume(edge) {
    const period = this.getPeriodInfo();

    // Baseline demand based on road type
    let baseLoadRatio = 0.55;
    if (edge.roadType === 'expressway') baseLoadRatio = 0.45;
    else if (edge.roadType === 'arterial') baseLoadRatio = 0.65;
    else if (edge.roadType === 'urban') baseLoadRatio = 0.75;

    // IT Corridor surge bias (e.g. Gachibowli, HITEC City, Jubilee Hills)
    const isTechHub = edge.id.includes('gachibowli') || edge.id.includes('hitec') || edge.id.includes('jubilee');
    const hubMultiplier = isTechHub && period.isPeak ? 1.35 : 1.0;

    const simulatedVolume = edge.capacity * baseLoadRatio * period.factor * hubMultiplier;
    return Math.round(simulatedVolume);
  }

  // Calculate link metrics with BPR function
  getEdgeMetrics(edge) {
    let cap = edge.capacity;
    const isIncident = this.incidents.has(edge.id);
    const incidentData = this.incidents.get(edge.id);

    if (isIncident) {
      cap *= incidentData.factor;
    }
    cap = Math.max(cap, 50);

    const volume = this.getEdgeTrafficVolume(edge);
    const vcRatio = volume / cap;

    // Bureau of Public Roads (BPR) latency formulation
    // t_e = t_0 * [1 + 0.15 * (V_e / C_e)^4]
    const travelTime = edge.baseT0 * (1.0 + this.alpha * Math.pow(vcRatio, this.beta));

    // Calculate actual current speed: distance / (time in hours)
    const currentSpeed = Math.min(
      edge.speedLimit,
      Math.max(5, (edge.distance / (travelTime / 60.0)))
    );

    // Congestion level categorization
    let level = 'low';
    let color = '#22c55e'; // Green
    if (vcRatio >= 1.2 || isIncident) {
      level = 'severe';
      color = '#ef4444'; // Red
    } else if (vcRatio >= 0.9) {
      level = 'high';
      color = '#f97316'; // Orange
    } else if (vcRatio >= 0.65) {
      level = 'moderate';
      color = '#eab308'; // Yellow
    }

    // Fuel and emissions models
    const delayMins = Math.max(0, travelTime - edge.baseT0);
    // Average vehicle uses ~0.065 L/km at cruising speed + 0.025 L/min during stop-and-go delay
    const fuelLitres = (edge.distance * 0.065) + (delayMins * 0.025);
    // 2.31 kg of CO2 per liter of gasoline
    const co2Kg = fuelLitres * 2.31;

    return {
      edgeId: edge.id,
      name: edge.name,
      distanceKm: edge.distance,
      speedLimit: edge.speedLimit,
      currentSpeedKmH: Math.round(currentSpeed * 10) / 10,
      baseT0Mins: edge.baseT0,
      actualTravelTimeMins: Math.round(travelTime * 10) / 10,
      delayMins: Math.round(delayMins * 10) / 10,
      capacityVehH: Math.round(cap),
      volumeVehH: volume,
      vcRatio: Math.round(vcRatio * 100) / 100,
      congestionLevel: level,
      color,
      isIncident,
      incidentReason: incidentData?.reason || null,
      fuelLitres: Math.round(fuelLitres * 100) / 100,
      co2Kg: Math.round(co2Kg * 100) / 100
    };
  }

  // Get complete network traffic state
  getAllEdgesMetrics() {
    const metricsMap = new Map();
    HYDERABAD_ROAD_EDGES.forEach(edge => {
      metricsMap.set(edge.id, this.getEdgeMetrics(edge));
    });
    return metricsMap;
  }
}
