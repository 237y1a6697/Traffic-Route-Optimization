/**
 * Nationwide India Location Search & Geocoding Service
 * Provides reliable multi-tier geocoding across street addresses, landmarks, cities,
 * and transport hubs throughout India.
 * 
 * Multi-Tier Strategy:
 * 1. Curated India-wide dataset & transit junctions (0 ms instant resolution)
 * 2. High-speed Photon OpenStreetMap geocoding with India geographical bias
 * 3. Authoritative OpenStreetMap Nominatim fallback with countrycodes=in
 * 4. Coordinate parser for direct lat/lng inputs with India boundary validation
 */
import { GeographicLocation } from '../models/road';
import { ALL_INDIA_LOCATIONS, isWithinIndia } from '../data/static/indiaGeoData';
import { HYDERABAD_LOCATIONS } from '../data/static/hyderabadGeoData';

// In-memory cache to prevent redundant requests and comply with provider rate limits
const geocodeCache = new Map<string, GeocodeResponse>();

export function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function findNearestNetworkNode(lat: number, lng: number): { node: GeographicLocation | null; distanceKm: number } {
  let closest: GeographicLocation | null = null;
  let minDistance = Infinity;

  ALL_INDIA_LOCATIONS.forEach(loc => {
    const dist = haversineDistance(lat, lng, loc.lat, loc.lng);
    if (dist < minDistance) {
      minDistance = dist;
      closest = loc;
    }
  });

  return {
    node: closest,
    distanceKm: minDistance
  };
}

export interface GeocodeResponse {
  success: boolean;
  source?: string;
  results?: GeographicLocation[];
  error?: string;
}

/**
 * Normalizes query string for indexing and matching
 */
function normalizeQuery(str: string): string {
  return str.toLowerCase().trim().replace(/[\s,]+/g, ' ');
}

/**
 * Geocodes an arbitrary Indian location string or coordinate pair.
 */
export async function geocodeLocation(query: string): Promise<GeocodeResponse> {
  if (!query || query.trim().length === 0) {
    return { success: false, error: 'Location query cannot be empty.' };
  }

  const rawTrimmed = query.trim();
  const cleanQuery = normalizeQuery(rawTrimmed);

  // Check cache first
  if (geocodeCache.has(cleanQuery)) {
    return geocodeCache.get(cleanQuery)!;
  }

  // 1. Direct coordinate input format support: "17.4968, 78.3548" or "12.9716, 77.5946"
  const coordRegex = /^(-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)$/;
  const coordMatch = rawTrimmed.match(coordRegex);
  if (coordMatch) {
    const lat = parseFloat(coordMatch[1]);
    const lng = parseFloat(coordMatch[3]);
    if (!isNaN(lat) && !isNaN(lng)) {
      if (!isWithinIndia(lat, lng)) {
        return {
          success: false,
          error: `Coordinates (${lat.toFixed(4)}, ${lng.toFixed(4)}) appear to be outside India. Please provide coordinates within India.`
        };
      }

      const { node } = findNearestNetworkNode(lat, lng);
      const res: GeocodeResponse = {
        success: true,
        source: 'coordinates',
        results: [{
          id: `coord_${lat.toFixed(4)}_${lng.toFixed(4)}`,
          name: `Custom Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
          displayName: `Custom Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
          shortName: `${lat.toFixed(3)}, ${lng.toFixed(3)}`,
          lat,
          lng,
          type: 'Coordinates',
          keywords: [cleanQuery],
          nearestNodeId: node ? node.id : 'custom'
        }]
      };
      geocodeCache.set(cleanQuery, res);
      return res;
    }
  }

  // 2. High-precision match against curated nationwide Indian locations
  // Extract primary place token before comma if present (e.g. "Gachibowli" from "Gachibowli, Hyderabad")
  const primaryToken = rawTrimmed.split(',')[0].trim().toLowerCase();

  const scoredMatches = ALL_INDIA_LOCATIONS.map(loc => {
    const sName = loc.shortName.toLowerCase();
    const fName = loc.name.toLowerCase();
    let score = 0;

    if (sName === cleanQuery || loc.id === cleanQuery) {
      score += 100;
    } else if (sName === primaryToken || loc.id === primaryToken) {
      score += 95;
    } else if (loc.keywords.includes(primaryToken)) {
      score += 88;
    } else if (primaryToken.length >= 4 && (sName.startsWith(primaryToken) || primaryToken.startsWith(sName))) {
      score += 75;
    } else if (fName.startsWith(primaryToken)) {
      score += 70;
    } else if (loc.keywords.some(k => k.length >= 3 && primaryToken.includes(k))) {
      score += 65;
    } else if (sName === cleanQuery || cleanQuery.startsWith(sName)) {
      score += 55;
    } else if (sName.length >= 4 && cleanQuery.includes(sName)) {
      // Substring match (e.g. parent city 'hyderabad' in 'gachibowli, hyderabad')
      score += 30;
    }

    return { loc, score };
  })
    .filter(m => m.score > 0)
    .sort((a, b) => b.score - a.score);

  if (scoredMatches.length > 0 && scoredMatches[0].score >= 60) {
    const bestMatches = scoredMatches.slice(0, 5).map(m => ({
      ...m.loc,
      displayName: m.loc.name,
      nearestNodeId: m.loc.id
    }));

    const res: GeocodeResponse = {
      success: true,
      source: 'local_database',
      results: bestMatches
    };
    geocodeCache.set(cleanQuery, res);
    return res;
  }

  // 3. Remote Geocoding Tier A: Photon OpenStreetMap API (Fast, CORS-ready, OSM-based)
  try {
    // Biased towards India centroid (lat: 20.59, lon: 78.96)
    const photonUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(
      rawTrimmed
    )}&limit=5&lat=20.5937&lon=78.9629`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4500);

    const response = await fetch(photonUrl, {
      signal: controller.signal,
      headers: { 'Accept': 'application/json' }
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (data && Array.isArray(data.features) && data.features.length > 0) {
        // Filter features within India
        const indianFeatures = data.features.filter((f: any) => {
          const coords = f.geometry?.coordinates;
          if (!coords || coords.length < 2) return false;
          const [lng, lat] = coords;
          const country = (f.properties?.country || '').toLowerCase();
          return (country === 'india' || !country) && isWithinIndia(lat, lng);
        });

        if (indianFeatures.length > 0) {
          const results: GeographicLocation[] = indianFeatures.map((f: any, idx: number) => {
            const [lng, lat] = f.geometry.coordinates;
            const props = f.properties || {};
            const title = props.name || rawTrimmed;
            const addressParts = [
              title,
              props.street,
              props.district || props.city,
              props.state,
              'India'
            ].filter(Boolean);
            const displayName = addressParts.join(', ');

            return {
              id: `photon_${idx}_${lat.toFixed(4)}_${lng.toFixed(4)}`,
              name: displayName,
              displayName,
              shortName: title,
              lat,
              lng,
              type: props.type || 'Indian Location',
              keywords: [cleanQuery],
              nearestNodeId: 'node'
            };
          });

          const res: GeocodeResponse = {
            success: true,
            source: 'photon_osm',
            results
          };
          geocodeCache.set(cleanQuery, res);
          return res;
        }
      }
    }
  } catch (err) {
    // Photon network error or timeout - proceed to Nominatim fallback
  }

  // 4. Remote Geocoding Tier B: OpenStreetMap Nominatim API (with countrycodes=in)
  try {
    const nominatimBase =
      (import.meta as any).env?.VITE_NOMINATIM_API_URL || 'https://nominatim.openstreetmap.org';
    const endpoint = `${nominatimBase}/search?format=json&q=${encodeURIComponent(
      rawTrimmed
    )}&countrycodes=in&limit=5&addressdetails=1`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5500);

    const response = await fetch(endpoint, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'QuantumTrafficRouteOptimization/2.0 (University Research Route Planning; contact: research@traffic.in)'
      }
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        const results: GeographicLocation[] = data
          .map((item: any, idx: number) => {
            const lat = parseFloat(item.lat);
            const lng = parseFloat(item.lon);
            if (isNaN(lat) || isNaN(lng) || !isWithinIndia(lat, lng)) return null;

            return {
              id: `osm_${idx}_${lat.toFixed(4)}_${lng.toFixed(4)}`,
              name: item.display_name,
              displayName: item.display_name,
              shortName: item.name || rawTrimmed,
              lat,
              lng,
              type: item.type || 'Geocoded Address',
              keywords: [cleanQuery],
              nearestNodeId: 'node'
            };
          })
          .filter(Boolean) as GeographicLocation[];

        if (results.length > 0) {
          const res: GeocodeResponse = {
            success: true,
            source: 'nominatim_india',
            results
          };
          geocodeCache.set(cleanQuery, res);
          return res;
        }
      }
    }
  } catch (err) {
    // Nominatim network error or timeout
  }

  // 5. Fallback fuzzy token search across all Indian hubs
  const fuzzy = ALL_INDIA_LOCATIONS.find(loc => {
    const tokens = cleanQuery.split(/[\s,]+/);
    return tokens.some(t => t.length > 2 && (loc.name.toLowerCase().includes(t) || loc.id.includes(t)));
  });

  if (fuzzy) {
    const res: GeocodeResponse = {
      success: true,
      source: 'fuzzy_fallback',
      results: [{
        ...fuzzy,
        displayName: fuzzy.name,
        nearestNodeId: fuzzy.id
      }]
    };
    geocodeCache.set(cleanQuery, res);
    return res;
  }

  return {
    success: false,
    error: `Could not find "${query}" in India. Please check the spelling or enter a known city, landmark, or PIN code (e.g., Bengaluru, Mumbai, Jaipur, New Delhi, or Gachibowli).`
  };
}
