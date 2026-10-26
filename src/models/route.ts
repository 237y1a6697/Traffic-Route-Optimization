import { RoadEdge } from './road';

export type VehicleMode = 'bike' | 'car' | 'heavy_vehicle' | 'motorcycle' | 'motor_scooter';

export interface VehicleModeConfig {
  id: VehicleMode;
  name: string;
  subtitle: string;
  stadiaCosting: 'auto' | 'motorcycle' | 'motor_scooter' | 'truck' | 'bus';
  fuelRateLPer100Km: number;
  fuelDelayPenaltyLPerMin: number;
  co2PerLitre: number;
  congestionFactor: number;
  maxSpeedKmh: number;
  expresswayAllowed: boolean;
  tag: string;
}

export interface NavigationManeuver {
  id: string;
  instruction: string;
  verbalInstruction?: string;
  type: number | string;
  modifier?: string; // 'left' | 'right' | 'straight' | 'slight left' | 'slight right' | 'u-turn' | 'depart' | 'arrive'
  streetName?: string;
  distanceMeters: number;
  durationSeconds: number;
  location: [number, number]; // [lat, lng]
  shapeIndex?: number;
}

export interface RouteMetrics {
  distanceKm: number;
  travelTimeMins: number;
  delayMins: number;
  fuelLitres: number;
  co2Kg: number;
  maxVcRatio: number;
  severeBottlenecks: number;
  trafficLabel: string;
  trafficBadgeColor: string;
}

export interface RouteResult extends RouteMetrics {
  algorithm: string;
  algorithmName: string;
  type: string;
  edges: RoadEdge[];
  nodes: (string | number)[];
  polylineCoords: [number, number][];
  optimizationCost?: number;
  optimizationScore?: number;
  co2ReductionPercent?: number;
  departureTime?: string;
  arrivalTime?: string;
  qubitPhase?: number;
  weightsUsed?: {
    timeWeight: number;
    congestionWeight: number;
    distanceWeight: number;
    fuelWeight: number;
    emissionsWeight: number;
  };
  vehicleMode?: VehicleMode;
  maneuvers?: NavigationManeuver[];
  trafficMode?: 'live' | 'simulated';
  trafficDataSource?: string;
  trafficRetrievedAt?: string;
  routingEngine?: 'stadia' | 'osrm';
  engineLimitation?: string | null;
}

export interface CandidatePath {
  edges: RoadEdge[];
  nodes: (string | number)[];
}

