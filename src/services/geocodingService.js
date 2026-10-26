/**
 * Location Search & Geocoding Service (JavaScript)
 * Integrates OpenStreetMap Nominatim API with cached Hyderabad landmarks.
 */
import { HYDERABAD_LOCATIONS } from '../data/hyderabadGeoData.js';

const geocodeCache = new Map();

export function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
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

export function findNearestNetworkNode(lat, lng) {
  let closest = null;
  let minDistance = Infinity;

  HYDERABAD_LOCATIONS.forEach(loc => {
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

export async function geocodeLocation(query) {
  if (!query || query.trim().length === 0) {
    return { success: false, error: 'Location query cannot be empty.' };
  }

  const cleanQuery = query.trim().toLowerCase();

  if (geocodeCache.has(cleanQuery)) {
    return geocodeCache.get(cleanQuery);
  }

  // Direct coordinate match
  const coordRegex = /^(-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)$/;
  const coordMatch = query.trim().match(coordRegex);
  if (coordMatch) {
    const lat = parseFloat(coordMatch[1]);
    const lng = parseFloat(coordMatch[3]);
    if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      const { node } = findNearestNetworkNode(lat, lng);
      const res = {
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
          nearestNodeId: node ? node.id : 'gachibowli'
        }]
      };
      geocodeCache.set(cleanQuery, res);
      return res;
    }
  }

  // Exact curated match
  const exactMatches = HYDERABAD_LOCATIONS.filter(loc => {
    if (loc.id === cleanQuery || loc.shortName.toLowerCase() === cleanQuery) return true;
    if (loc.name.toLowerCase().includes(cleanQuery)) return true;
    return loc.keywords.some(k => k.includes(cleanQuery) || cleanQuery.includes(k));
  });

  if (exactMatches.length > 0) {
    const res = {
      success: true,
      source: 'local_database',
      results: exactMatches.map(loc => ({
        ...loc,
        displayName: loc.name,
        nearestNodeId: loc.id
      }))
    };
    geocodeCache.set(cleanQuery, res);
    return res;
  }

  // OpenStreetMap Nominatim
  try {
    const endpoint = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      query + ', Hyderabad, Telangana, India'
    )}&limit=4&countrycodes=in&viewbox=78.10,17.15,78.75,17.65&addressdetails=1`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4500);

    const response = await fetch(endpoint, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'QuantumTrafficOptimizer/2.0'
      }
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        const results = data.map((item, idx) => {
          const lat = parseFloat(item.lat);
          const lng = parseFloat(item.lon);
          const { node } = findNearestNetworkNode(lat, lng);

          return {
            id: `osm_${idx}_${lat.toFixed(4)}_${lng.toFixed(4)}`,
            name: item.display_name,
            displayName: item.display_name,
            shortName: item.name || query,
            lat,
            lng,
            type: item.type || 'Geocoded Address',
            keywords: [cleanQuery],
            nearestNodeId: node ? node.id : 'gachibowli'
          };
        }).filter(Boolean);

        if (results.length > 0) {
          const res = { success: true, source: 'nominatim', results };
          geocodeCache.set(cleanQuery, res);
          return res;
        }
      }
    }
  } catch (err) {
    // fallback
  }

  const fuzzy = HYDERABAD_LOCATIONS.find(loc => {
    const tokens = cleanQuery.split(/[\s,]+/);
    return tokens.some(t => t.length > 2 && loc.name.toLowerCase().includes(t));
  });

  if (fuzzy) {
    const res = {
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
    error: `Could not resolve "${query}". Please check spelling or select from suggested locations.`
  };
}
