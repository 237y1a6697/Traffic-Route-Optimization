/**
 * Real-world Traffic Signals and Dynamic Google Maps-style Route Traffic Coloration
 * Models Hyderabad city traffic signals, phase cycles, queue lengths, and vehicle-specific clearance wait times.
 */

import { TrafficSignalInfo } from '../models/traffic';
import { TrafficService } from './traffic';
import { VehicleMode } from '../models/route';
import { HYDERABAD_ROAD_EDGES } from '../data/static/hyderabadGeoData';

export interface RouteTrafficSegment {
  coords: [number, number][];
  status: 'free' | 'moderate' | 'high';
  color: string;
  label: string;
  speedKmH: number;
  vcRatio: number;
}

export interface RawTrafficSignalDef {
  id: string;
  name: string;
  lat: number;
  lng: number;
  baseCycleSec: number;
  baseRedSec: number;
  baseGreenSec: number;
  baseAmberSec: number;
  corridor: string;
  isBottleneck: boolean;
}

export const HYDERABAD_SIGNALS: RawTrafficSignalDef[] = [
  {
    id: 'sig_kukatpally',
    name: 'Kukatpally Y-Junction Signal',
    lat: 17.4875,
    lng: 78.4089,
    baseCycleSec: 130,
    baseRedSec: 70,
    baseGreenSec: 50,
    baseAmberSec: 10,
    corridor: 'NH65 Mumbai Highway',
    isBottleneck: true
  },
  {
    id: 'sig_moosapet',
    name: 'Moosapet Crossroads Signal',
    lat: 17.4735,
    lng: 78.4285,
    baseCycleSec: 120,
    baseRedSec: 65,
    baseGreenSec: 45,
    baseAmberSec: 10,
    corridor: 'Kukatpally-Bharat Nagar Arterial',
    isBottleneck: true
  },
  {
    id: 'sig_balanagar',
    name: 'Balanagar X-Roads Signal',
    lat: 17.4705,
    lng: 78.4485,
    baseCycleSec: 140,
    baseRedSec: 75,
    baseGreenSec: 55,
    baseAmberSec: 10,
    corridor: 'Balanagar Industrial Arterial',
    isBottleneck: true
  },
  {
    id: 'sig_ameerpet',
    name: 'Ameerpet Metro Junction Signal',
    lat: 17.4375,
    lng: 78.4480,
    baseCycleSec: 140,
    baseRedSec: 80,
    baseGreenSec: 50,
    baseAmberSec: 10,
    corridor: 'Greenlands - Ameerpet Corridor',
    isBottleneck: true
  },
  {
    id: 'sig_panjagutta',
    name: 'Panjagutta Circle Signal',
    lat: 17.4256,
    lng: 78.4513,
    baseCycleSec: 150,
    baseRedSec: 85,
    baseGreenSec: 55,
    baseAmberSec: 10,
    corridor: 'Central Arterial Interchange',
    isBottleneck: true
  },
  {
    id: 'sig_banjara_rd1',
    name: 'Banjara Hills Rd No. 1 / Nagarjuna Circle',
    lat: 17.4205,
    lng: 78.4465,
    baseCycleSec: 120,
    baseRedSec: 65,
    baseGreenSec: 45,
    baseAmberSec: 10,
    corridor: 'Banjara Hills Central',
    isBottleneck: false
  },
  {
    id: 'sig_jubilee_checkpost',
    name: 'Jubilee Hills Check Post Signal',
    lat: 17.4319,
    lng: 78.4073,
    baseCycleSec: 130,
    baseRedSec: 70,
    baseGreenSec: 50,
    baseAmberSec: 10,
    corridor: 'Road No. 36 Arterial',
    isBottleneck: true
  },
  {
    id: 'sig_begumpet',
    name: 'Begumpet Airport Flyover Signal',
    lat: 17.4441,
    lng: 78.4682,
    baseCycleSec: 140,
    baseRedSec: 75,
    baseGreenSec: 55,
    baseAmberSec: 10,
    corridor: 'Raj Bhavan - Begumpet Corridor',
    isBottleneck: true
  },
  {
    id: 'sig_paradise',
    name: 'Paradise Circle Signal',
    lat: 17.4428,
    lng: 78.4877,
    baseCycleSec: 130,
    baseRedSec: 70,
    baseGreenSec: 50,
    baseAmberSec: 10,
    corridor: 'MG Road - SP Road Hub',
    isBottleneck: true
  },
  {
    id: 'sig_secunderabad',
    name: 'Secunderabad Junction Signal',
    lat: 17.4399,
    lng: 78.4983,
    baseCycleSec: 120,
    baseRedSec: 65,
    baseGreenSec: 45,
    baseAmberSec: 10,
    corridor: 'Railway Terminal Concourse',
    isBottleneck: true
  },
  {
    id: 'sig_tank_bund',
    name: 'Tank Bund / Secretariat Signal',
    lat: 17.4239,
    lng: 78.4738,
    baseCycleSec: 110,
    baseRedSec: 55,
    baseGreenSec: 45,
    baseAmberSec: 10,
    corridor: 'Hussain Sagar Lake Arterial',
    isBottleneck: false
  },
  {
    id: 'sig_lakdikapul',
    name: 'Lakdikapul Central Signal',
    lat: 17.4045,
    lng: 78.4665,
    baseCycleSec: 130,
    baseRedSec: 70,
    baseGreenSec: 50,
    baseAmberSec: 10,
    corridor: 'Assembly - Lakdikapul Corridor',
    isBottleneck: true
  },
  {
    id: 'sig_mehdipatnam',
    name: 'Mehdipatnam Junction Signal',
    lat: 17.3916,
    lng: 78.4418,
    baseCycleSec: 140,
    baseRedSec: 75,
    baseGreenSec: 55,
    baseAmberSec: 10,
    corridor: 'PVNR Expressway / Ring Road Entry',
    isBottleneck: true
  },
  {
    id: 'sig_mj_market',
    name: 'Moazzam Jahi Market Signal',
    lat: 17.3785,
    lng: 78.4745,
    baseCycleSec: 120,
    baseRedSec: 65,
    baseGreenSec: 45,
    baseAmberSec: 10,
    corridor: 'Abids - Old City Arterial',
    isBottleneck: true
  },
  {
    id: 'sig_madina',
    name: 'Madina Crossroads (Charminar North) Signal',
    lat: 17.3685,
    lng: 78.4740,
    baseCycleSec: 120,
    baseRedSec: 65,
    baseGreenSec: 45,
    baseAmberSec: 10,
    corridor: 'Charminar Heritage Corridor',
    isBottleneck: true
  },
  {
    id: 'sig_hitec_cyber',
    name: 'HITEC City Cyber Towers Signal',
    lat: 17.4504,
    lng: 78.3808,
    baseCycleSec: 140,
    baseRedSec: 75,
    baseGreenSec: 55,
    baseAmberSec: 10,
    corridor: 'Madhapur - Mindspace Arterial',
    isBottleneck: true
  },
  {
    id: 'sig_gachibowli',
    name: 'Gachibowli Junction Signal',
    lat: 17.4401,
    lng: 78.3489,
    baseCycleSec: 130,
    baseRedSec: 70,
    baseGreenSec: 50,
    baseAmberSec: 10,
    corridor: 'Financial District Gateway',
    isBottleneck: false
  },
  {
    id: 'sig_nanakramguda',
    name: 'Nanakramguda Rotary Signal',
    lat: 17.4172,
    lng: 78.3438,
    baseCycleSec: 100,
    baseRedSec: 50,
    baseGreenSec: 40,
    baseAmberSec: 10,
    corridor: 'ORR Outer Interchange',
    isBottleneck: false
  },
  {
    id: 'sig_bowenpally',
    name: 'Bowenpally Check Post Signal',
    lat: 17.4789,
    lng: 78.4836,
    baseCycleSec: 120,
    baseRedSec: 65,
    baseGreenSec: 45,
    baseAmberSec: 10,
    corridor: 'NH44 Nagpur Highway Corridor',
    isBottleneck: false
  },
  {
    id: 'sig_miyapur',
    name: 'Miyapur Metro Terminal Signal',
    lat: 17.4968,
    lng: 78.3548,
    baseCycleSec: 120,
    baseRedSec: 60,
    baseGreenSec: 50,
    baseAmberSec: 10,
    corridor: 'NH65 North-West Transit Arterial',
    isBottleneck: false
  }
];

export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Calculates live signal timing, queue length, and vehicle-specific clearance time.
 */
export function evaluateTrafficSignal(
  sig: RawTrafficSignalDef,
  trafficModel: TrafficService,
  vehicleMode: VehicleMode = 'car'
): TrafficSignalInfo {
  const period = trafficModel.getPeriodInfo();
  const cycle = sig.baseCycleSec;
  
  // Dynamic phase based on current epoch time and signal offset
  const hash = Math.abs(sig.name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0));
  const nowSec = Math.floor(Date.now() / 1000) + hash;
  const cyclePos = nowSec % cycle;

  let currentPhase: 'RED' | 'YELLOW' | 'GREEN' = 'RED';
  let timeRemainingSec = 0;

  if (cyclePos < sig.baseGreenSec) {
    currentPhase = 'GREEN';
    timeRemainingSec = sig.baseGreenSec - cyclePos;
  } else if (cyclePos < sig.baseGreenSec + sig.baseAmberSec) {
    currentPhase = 'YELLOW';
    timeRemainingSec = (sig.baseGreenSec + sig.baseAmberSec) - cyclePos;
  } else {
    currentPhase = 'RED';
    timeRemainingSec = cycle - cyclePos;
  }

  // Calculate volume-to-capacity (V/C) ratio & queue
  const isPeak = period.isPeak;
  const baseVC = sig.isBottleneck ? 0.88 : 0.65;
  const vcMultiplier = isPeak ? 1.45 : 0.85;
  const vcRatio = Math.min(1.4, Math.round(baseVC * vcMultiplier * 100) / 100);

  // Queue simulation (vehicles waiting)
  const baseQueue = sig.isBottleneck ? (isPeak ? 36 : 18) : (isPeak ? 20 : 8);
  const queueVehicles = Math.max(3, Math.round(baseQueue * (currentPhase === 'RED' ? 1.25 : 0.75)));
  const queueLengthMeters = queueVehicles * 6; // ~6 meters per car space

  // Vehicle-specific clearance wait time:
  // 1. Bike (2-Wheeler): Agile lane filtering between cars straight to the stop line
  let bikeTimeToCrossSec = 6;
  if (currentPhase === 'RED') {
    bikeTimeToCrossSec = timeRemainingSec + 4; // Clears during first green wave (filters past queued cars)
  } else if (currentPhase === 'YELLOW') {
    bikeTimeToCrossSec = timeRemainingSec + sig.baseRedSec + 4;
  } else {
    // GREEN: bike glides straight through!
    bikeTimeToCrossSec = Math.min(timeRemainingSec, 6);
  }

  // 2. Car (4-Wheeler): Queue dissipation delay (approx 2.1s per queued vehicle)
  let carWaitSec = 0;
  if (currentPhase === 'RED') {
    carWaitSec = timeRemainingSec + (queueVehicles * 2.1);
  } else if (currentPhase === 'YELLOW') {
    carWaitSec = timeRemainingSec + sig.baseRedSec + (queueVehicles * 2.1);
  } else {
    // GREEN: clear moving queue
    carWaitSec = Math.min(timeRemainingSec, Math.max(8, Math.round(queueVehicles * 1.2)));
  }
  const carTimeToCrossMins = Math.max(0.1, Math.round((carWaitSec / 60) * 10) / 10);

  // 3. Heavy Vehicle (Truck / Commercial): Slower acceleration, clearance penalty, multi-cycle delay if long queue
  let heavyWaitSec = 0;
  if (currentPhase === 'RED') {
    const multiCyclePenalty = isPeak && queueVehicles > 22 ? cycle : 0;
    heavyWaitSec = timeRemainingSec + (queueVehicles * 4.2) + multiCyclePenalty;
  } else if (currentPhase === 'YELLOW') {
    heavyWaitSec = timeRemainingSec + sig.baseRedSec + (queueVehicles * 4.2);
  } else {
    heavyWaitSec = Math.max(25, Math.round(queueVehicles * 2.5));
  }
  const heavyTimeToCrossMins = Math.max(0.3, Math.round((heavyWaitSec / 60) * 10) / 10);

  // Selected vehicle cross time
  let timeToCrossMins = carTimeToCrossMins;
  if (vehicleMode === 'bike') {
    timeToCrossMins = Math.round((bikeTimeToCrossSec / 60) * 10) / 10;
  } else if (vehicleMode === 'heavy_vehicle') {
    timeToCrossMins = heavyTimeToCrossMins;
  }

  let congestionTier: 'low' | 'moderate' | 'high' = 'low';
  if (vcRatio >= 1.05 || (isPeak && sig.isBottleneck)) {
    congestionTier = 'high';
  } else if (vcRatio >= 0.75) {
    congestionTier = 'moderate';
  }

  return {
    id: sig.id,
    name: sig.name,
    lat: sig.lat,
    lng: sig.lng,
    cycleLengthSec: cycle,
    redSec: sig.baseRedSec,
    greenSec: sig.baseGreenSec,
    amberSec: sig.baseAmberSec,
    currentPhase,
    timeRemainingSec,
    queueVehicles,
    queueLengthMeters,
    timeToCrossMins,
    bikeTimeToCrossSec,
    carTimeToCrossMins,
    heavyTimeToCrossMins,
    vcRatio,
    congestionTier
  };
}

/**
 * Returns traffic signals along the given polyline route.
 * Accurately filters only intersections the route passes through (strict 350m corridor),
 * excludes access-controlled expressways (ORR / PVNR elevated corridor),
 * snaps signal markers onto the exact route polyline,
 * and orders them in sequence of travel from Origin to Destination.
 */
export function getSignalsAlongRoute(
  polylineCoords: [number, number][],
  trafficModel: TrafficService,
  vehicleMode: VehicleMode = 'car',
  maxDistanceKm: number = 0.35 // 350 meters strict corridor proximity
): (TrafficSignalInfo & { routeIndex: number })[] {
  if (!polylineCoords || polylineCoords.length === 0) return [];

  const matchedSignals: (TrafficSignalInfo & { routeIndex: number })[] = [];

  for (const sig of HYDERABAD_SIGNALS) {
    let minDistance = Infinity;
    let closestIndex = -1;
    let closestCoord: [number, number] | null = null;

    for (let i = 0; i < polylineCoords.length; i++) {
      const [lat, lng] = polylineCoords[i];

      // Exclude access-controlled expressways (ORR and PVNR elevated deck have zero signals)
      const isORR = (lat < 17.430 && lng < 78.360) || (lat < 17.380 && lng < 78.430);
      if (isORR && vehicleMode === 'heavy_vehicle') {
        continue;
      }

      const dist = calculateDistanceKm(sig.lat, sig.lng, lat, lng);
      if (dist < minDistance) {
        minDistance = dist;
        closestIndex = i;
        closestCoord = [lat, lng];
      }
    }

    // Only include if the route passes within 350m of the actual intersection
    if (minDistance <= maxDistanceKm && closestCoord && closestIndex >= 0) {
      const evalSig = evaluateTrafficSignal(sig, trafficModel, vehicleMode);
      // ACCURATE SNAPPING: Pin marker directly onto the exact road line coordinate!
      evalSig.lat = closestCoord[0];
      evalSig.lng = closestCoord[1];
      matchedSignals.push({
        ...evalSig,
        routeIndex: closestIndex
      });
    }
  }

  // Sort signals sequentially along direction of travel from Origin to Destination
  matchedSignals.sort((a, b) => a.routeIndex - b.routeIndex);

  return matchedSignals;
}

/**
 * Slices route coordinates into Google Maps-style color segments:
 * - Green (#22c55e): Free flow, normal traffic
 * - Yellow (#f59e0b): Moderate traffic, slow-moving
 * - Red (#ef4444): High traffic congestion, bottlenecks & incidents
 */
export function getTrafficColoredSegments(
  polylineCoords: [number, number][],
  trafficModel: TrafficService,
  vehicleMode: VehicleMode = 'car'
): RouteTrafficSegment[] {
  if (!polylineCoords || polylineCoords.length < 2) return [];

  const period = trafficModel.getPeriodInfo();
  const pointCongestion: Array<{ status: 'free' | 'moderate' | 'high'; color: string; label: string; speedKmH: number; vcRatio: number }> = [];

  // 1. Evaluate traffic density at each coordinate point
  for (let i = 0; i < polylineCoords.length; i++) {
    const [lat, lng] = polylineCoords[i];

    // A. Check for active incident proximity (within 600m)
    let isNearIncident = false;
    for (const [edgeId] of trafficModel.incidents.entries()) {
      const edge = HYDERABAD_ROAD_EDGES.find(e => e.id === edgeId);
      if (edge && edge.coordinates) {
        for (const [eLat, eLng] of edge.coordinates) {
          if (calculateDistanceKm(lat, lng, eLat, eLng) < 0.6) {
            isNearIncident = true;
            break;
          }
        }
      }
      if (isNearIncident) break;
    }

    if (isNearIncident) {
      pointCongestion.push({
        status: 'high',
        color: '#ef4444',
        label: 'High Congestion: Incident / Bottleneck Alert',
        speedKmH: 12,
        vcRatio: 1.25
      });
      continue;
    }

    // B. Check proximity to major bottleneck signals
    let isNearBottleneckSignal = false;
    for (const sig of HYDERABAD_SIGNALS) {
      if (sig.isBottleneck && calculateDistanceKm(lat, lng, sig.lat, sig.lng) < 0.65) {
        isNearBottleneckSignal = true;
        break;
      }
    }

    // C. Check if on Outer Ring Road (ORR) or Expressway (always free flow green)
    const isORR = (lat < 17.430 && lng < 78.360) || (lat < 17.380 && lng < 78.430);
    if (isORR && vehicleMode === 'heavy_vehicle') {
      pointCongestion.push({
        status: 'free',
        color: '#22c55e',
        label: 'Normal Flow: ORR 8-Lane Freight Bypass',
        speedKmH: 70,
        vcRatio: 0.45
      });
      continue;
    }

    // D. Evaluate vehicle mode and period
    if (vehicleMode === 'bike') {
      // Bikes filter through most traffic, so only major bottlenecks turn yellow, rare red
      if (isNearBottleneckSignal && period.isPeak) {
        pointCongestion.push({
          status: 'moderate',
          color: '#f59e0b',
          label: 'Moderate Traffic: Intersection Signal Queue',
          speedKmH: 26,
          vcRatio: 0.82
        });
      } else {
        pointCongestion.push({
          status: 'free',
          color: '#22c55e',
          label: 'Free Flow: Agile 2-Wheeler Corridor',
          speedKmH: 42,
          vcRatio: 0.52
        });
      }
    } else {
      // Car / Heavy vehicle traffic logic
      if (isNearBottleneckSignal && period.isPeak) {
        pointCongestion.push({
          status: 'high',
          color: '#ef4444',
          label: 'High Traffic Congestion: Major Junction Delay',
          speedKmH: 15,
          vcRatio: 1.18
        });
      } else if (period.isPeak) {
        // Peak hours in urban central corridors
        pointCongestion.push({
          status: 'moderate',
          color: '#f59e0b',
          label: 'Medium Traffic: Slow Moving Corridor',
          speedKmH: 28,
          vcRatio: 0.88
        });
      } else {
        // Free flow road
        pointCongestion.push({
          status: 'free',
          color: '#22c55e',
          label: 'Normal Road Flow: Uncongested Route',
          speedKmH: 52,
          vcRatio: 0.58
        });
      }
    }
  }

  // 2. Group contiguous points into continuous colored polylines
  const segments: RouteTrafficSegment[] = [];
  if (pointCongestion.length === 0) return segments;

  let currentStatus = pointCongestion[0].status;
  let currentColor = pointCongestion[0].color;
  let currentLabel = pointCongestion[0].label;
  let currentSpeed = pointCongestion[0].speedKmH;
  let currentVC = pointCongestion[0].vcRatio;
  let currentCoords: [number, number][] = [polylineCoords[0]];

  for (let i = 1; i < polylineCoords.length; i++) {
    const pt = pointCongestion[i];
    if (pt.status === currentStatus) {
      currentCoords.push(polylineCoords[i]);
    } else {
      // Close out current segment (include the transition point so segments connect seamlessly)
      currentCoords.push(polylineCoords[i]);
      segments.push({
        coords: currentCoords,
        status: currentStatus,
        color: currentColor,
        label: currentLabel,
        speedKmH: currentSpeed,
        vcRatio: currentVC
      });

      // Start new segment starting from the junction point
      currentStatus = pt.status;
      currentColor = pt.color;
      currentLabel = pt.label;
      currentSpeed = pt.speedKmH;
      currentVC = pt.vcRatio;
      currentCoords = [polylineCoords[i]];
    }
  }

  // Push remaining segment
  if (currentCoords.length >= 2) {
    segments.push({
      coords: currentCoords,
      status: currentStatus,
      color: currentColor,
      label: currentLabel,
      speedKmH: currentSpeed,
      vcRatio: currentVC
    });
  } else if (segments.length === 0 && polylineCoords.length >= 2) {
    segments.push({
      coords: polylineCoords,
      status: currentStatus,
      color: currentColor,
      label: currentLabel,
      speedKmH: currentSpeed,
      vcRatio: currentVC
    });
  }

  return segments;
}
