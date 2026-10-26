/**
 * TypeScript Interfaces for Simulated Traffic & Latency Models
 */

export type CongestionTier = 'low' | 'moderate' | 'high' | 'severe';

export interface IncidentData {
  factor: number;
  reason: string;
}

export interface PeakPeriodInfo {
  label: string;
  factor: number;
  isPeak: boolean;
  badgeColor: string;
}

export interface EdgeTrafficMetrics {
  edgeId: string;
  name: string;
  distanceKm: number;
  speedLimit: number;
  currentSpeedKmH: number;
  baseT0Mins: number;
  actualTravelTimeMins: number;
  delayMins: number;
  capacityVehH: number;
  volumeVehH: number;
  vcRatio: number;
  congestionLevel: CongestionTier;
  color: string;
  isIncident: boolean;
  incidentReason: string | null;
  fuelLitres: number;
  co2Kg: number;
}

export interface TrafficSignalInfo {
  id: string;
  name: string;
  lat: number;
  lng: number;
  cycleLengthSec: number;
  redSec: number;
  greenSec: number;
  amberSec: number;
  currentPhase: 'RED' | 'YELLOW' | 'GREEN';
  timeRemainingSec: number;
  queueVehicles: number;
  queueLengthMeters: number;
  timeToCrossMins: number; // General time to cross
  bikeTimeToCrossSec: number; // Bike lane-filtering wait time
  carTimeToCrossMins: number; // Car wait time
  heavyTimeToCrossMins: number; // Heavy vehicle clearance wait time
  vcRatio: number;
  congestionTier: 'low' | 'moderate' | 'high';
}
