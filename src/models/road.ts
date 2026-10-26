/**
 * TypeScript Interfaces for Road Networks & Geometries
 */

export interface GeographicLocation {
  id: string;
  name: string;
  shortName: string;
  type: string;
  lat: number;
  lng: number;
  keywords: string[];
  nearestNodeId?: string;
  displayName?: string;
}

export interface RoadEdge {
  id: string;
  name: string;
  from: string | number;
  to: string | number;
  distance: number; // in km
  speedLimit: number; // in km/h
  baseT0: number; // free-flow travel time in mins
  capacity: number; // vehicles per hour
  roadType: 'expressway' | 'arterial' | 'collector' | 'urban';
  coordinates: [number, number][]; // array of [lat, lng]
}

export interface NetworkNode {
  id: string | number;
  x?: number;
  y?: number;
  lat?: number;
  lng?: number;
  label?: string;
}

export interface NetworkBenchmarkData {
  id: string;
  name: string;
  description: string;
  nodes: NetworkNode[];
  layoutNodes?: NetworkNode[];
  links: any[];
}
