/**
 * Traffic Service & Latency Engine
 * Clearly labeled: "Simulated Traffic Data"
 */
import { HYDERABAD_ROAD_EDGES } from '../data/static/hyderabadGeoData';
import { RoadEdge } from '../models/road';
import { EdgeTrafficMetrics, IncidentData, PeakPeriodInfo } from '../models/traffic';

export class TrafficService {
  private alpha: number = 0.15;
  private beta: number = 4.0;
  public timeOfDay: number = 8.5; // 08:30 AM (Peak morning rush)
  public timeOfDayHour: number = 8;
  public timeOfDayMinute: number = 30;
  public rushHourMultiplier: number = 1.0;
  public weatherFactor: number = 1.0;
  public dayOfWeek: string = 'weekday'; // 'weekday' or 'weekend'
  public incidents: Map<string, IncidentData> = new Map();

  constructor() {
    // Initial simulated incidents in Hyderabad during peak hours
    this.incidents.set('rd_begumpet_paradise', {
      factor: 0.35,
      reason: 'Metro Rail Construction & Bottleneck'
    });
    this.incidents.set('rd_jubilee_panjagutta', {
      factor: 0.45,
      reason: 'Heavy Traffic Signal Congestion'
    });
  }

  toggleIncident(edgeId: string, reason: string = 'Simulated Roadblock / Breakdown') {
    if (this.incidents.has(edgeId)) {
      this.incidents.delete(edgeId);
    } else {
      this.incidents.set(edgeId, { factor: 0.4, reason });
    }
  }

  getPeriodInfo(): PeakPeriodInfo {
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
      if (hr >= 12.0 && hr <= 19.0) {
        return { label: 'Weekend Leisure & Shopping Flow', factor: 1.4, isPeak: false, badgeColor: '#eab308' };
      }
      return { label: 'Weekend Normal Flow', factor: 0.8, isPeak: false, badgeColor: '#22c55e' };
    }
  }

  setIncident(edgeId: string, capacityFactor: number, reason: string = 'Accident') {
    if (capacityFactor >= 1.0) {
      this.incidents.delete(edgeId);
    } else {
      this.incidents.set(edgeId, { factor: capacityFactor, reason });
    }
  }

  clearIncidents() {
    this.incidents.clear();
  }

  getEdgeTrafficVolume(edge: RoadEdge): number {
    const period = this.getPeriodInfo();

    let baseLoadRatio = 0.55;
    if (edge.roadType === 'expressway') baseLoadRatio = 0.45;
    else if (edge.roadType === 'arterial') baseLoadRatio = 0.65;
    else if (edge.roadType === 'urban') baseLoadRatio = 0.75;

    const isTechHub = edge.id.includes('gachibowli') || edge.id.includes('hitec') || edge.id.includes('jubilee');
    const hubMultiplier = isTechHub && period.isPeak ? 1.35 : 1.0;

    const simulatedVolume = edge.capacity * baseLoadRatio * period.factor * hubMultiplier;
    return Math.round(simulatedVolume);
  }

  getEdgeMetrics(edge: RoadEdge): EdgeTrafficMetrics {
    let cap = edge.capacity;
    const isIncident = this.incidents.has(edge.id);
    const incidentData = this.incidents.get(edge.id);

    if (isIncident && incidentData) {
      cap *= incidentData.factor;
    }
    cap = Math.max(cap, 50);

    const volume = this.getEdgeTrafficVolume(edge);
    const vcRatio = volume / cap;

    // BPR Latency Model: t_e = t_0 * [1 + 0.15 * (V_e / C_e)^4]
    const travelTime = edge.baseT0 * (1.0 + this.alpha * Math.pow(vcRatio, this.beta));
    const currentSpeed = Math.min(
      edge.speedLimit,
      Math.max(5, (edge.distance / (travelTime / 60.0)))
    );

    let level: 'low' | 'moderate' | 'high' | 'severe' = 'low';
    let color = '#22c55e';
    if (vcRatio >= 1.2 || isIncident) {
      level = 'severe';
      color = '#ef4444';
    } else if (vcRatio >= 0.9) {
      level = 'high';
      color = '#f97316';
    } else if (vcRatio >= 0.65) {
      level = 'moderate';
      color = '#eab308';
    }

    const delayMins = Math.max(0, travelTime - edge.baseT0);
    const fuelLitres = (edge.distance * 0.065) + (delayMins * 0.025);
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

  getAllEdgesMetrics(): Map<string, EdgeTrafficMetrics> {
    const metricsMap = new Map<string, EdgeTrafficMetrics>();
    HYDERABAD_ROAD_EDGES.forEach(edge => {
      metricsMap.set(edge.id, this.getEdgeMetrics(edge));
    });
    return metricsMap;
  }
}

export const defaultTrafficService = new TrafficService();
