import { haversineDistance } from './geocoding';
import { NavigationManeuver, RouteResult } from '../models/route';
import { GpsPosition } from '../hooks/useGpsTracker';

/**
 * Computes direct distance between two points in meters.
 */
export function distanceInMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  return haversineDistance(lat1, lng1, lat2, lng2) * 1000;
}

/**
 * Calculates the shortest distance in meters from a point (pLat, pLng)
 * to a line segment between (lat1, lng1) and (lat2, lng2).
 */
export function pointToSegmentDistanceMeters(
  pLat: number,
  pLng: number,
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  // Convert lat/lng to approximate flat projection meters relative to pLat
  const cosLat = Math.cos((pLat * Math.PI) / 180);
  const mPerDegLat = 111320;
  const mPerDegLng = 111320 * cosLat;

  const px = pLng * mPerDegLng;
  const py = pLat * mPerDegLat;
  const ax = lng1 * mPerDegLng;
  const ay = lat1 * mPerDegLat;
  const bx = lng2 * mPerDegLng;
  const by = lat2 * mPerDegLat;

  const abx = bx - ax;
  const aby = by - ay;
  const abLenSq = abx * abx + aby * aby;

  if (abLenSq === 0) {
    const dx = px - ax;
    const dy = py - ay;
    return Math.sqrt(dx * dx + dy * dy);
  }

  // Projection parameter t
  let t = ((px - ax) * abx + (py - ay) * aby) / abLenSq;
  t = Math.max(0, Math.min(1, t));

  const projX = ax + t * abx;
  const projY = ay + t * aby;
  const dx = px - projX;
  const dy = py - projY;

  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Computes minimum distance in meters from a GPS coordinate to a polyline path.
 */
export function distanceToPolylineMeters(
  lat: number,
  lng: number,
  polyline: [number, number][]
): { minDistanceMeters: number; nearestSegmentIndex: number } {
  if (!polyline || polyline.length < 2) {
    return { minDistanceMeters: 0, nearestSegmentIndex: 0 };
  }

  let minDistance = Infinity;
  let nearestIdx = 0;

  for (let i = 0; i < polyline.length - 1; i++) {
    const dist = pointToSegmentDistanceMeters(
      lat,
      lng,
      polyline[i][0],
      polyline[i][1],
      polyline[i + 1][0],
      polyline[i + 1][1]
    );

    if (dist < minDistance) {
      minDistance = dist;
      nearestIdx = i;
    }
  }

  return { minDistanceMeters: Math.round(minDistance), nearestSegmentIndex: nearestIdx };
}

/**
 * Calculates remaining route distance in km along polyline starting from a given segment index.
 */
export function calculateRemainingDistanceKm(
  currentLat: number,
  currentLng: number,
  polyline: [number, number][],
  fromSegmentIndex: number
): number {
  if (!polyline || polyline.length < 2) return 0;

  let totalMeters = 0;
  // Distance from current location to start of next vertex
  if (fromSegmentIndex < polyline.length - 1) {
    totalMeters += distanceInMeters(
      currentLat,
      currentLng,
      polyline[fromSegmentIndex + 1][0],
      polyline[fromSegmentIndex + 1][1]
    );
  }

  for (let i = fromSegmentIndex + 1; i < polyline.length - 1; i++) {
    totalMeters += distanceInMeters(
      polyline[i][0],
      polyline[i][1],
      polyline[i + 1][0],
      polyline[i + 1][1]
    );
  }

  return Math.round((totalMeters / 1000) * 10) / 10;
}
