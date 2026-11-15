import { School } from '../types/school';

export type CorridorKey =
  | 'All Chennai'
  | 'Tambaram & GST Corridor'
  | 'OMR / Sholinganallur'
  | 'Adyar & Besant Nagar'
  | 'Porur & Manapakkam'
  | 'Anna Nagar & Mogappair'
  | 'Velachery & Guindy';

interface CorridorDefinition {
  key: CorridorKey;
  anchor: { lat: number; lng: number };
  areaTokens: string[];
}

export const CORRIDOR_DEFINITIONS: Record<CorridorKey, CorridorDefinition> = {
  'All Chennai': {
    key: 'All Chennai',
    anchor: { lat: 12.9450, lng: 80.2280 },
    areaTokens: [],
  },
  'Tambaram & GST Corridor': {
    key: 'Tambaram & GST Corridor',
    anchor: { lat: 12.9260, lng: 80.1100 },
    areaTokens: ['tambaram', 'gst', 'mudichur', 'chromepet', 'irumbuliyur', 'perungalathur', 'selaiyur', 'chitlapakkam'],
  },
  'OMR / Sholinganallur': {
    key: 'OMR / Sholinganallur',
    anchor: { lat: 12.9095, lng: 80.2295 },
    areaTokens: ['omr', 'sholinganallur', 'karapakkam', 'padur', 'navalur', 'siruseri', 'kelambakkam', 'thoraipakkam', 'perungudi', 'semmancheri', 'perumbakkam'],
  },
  'Adyar & Besant Nagar': {
    key: 'Adyar & Besant Nagar',
    anchor: { lat: 13.0050, lng: 80.2560 },
    areaTokens: ['adyar', 'besant nagar', 'besant', 'gandhi nagar', 'padmanabha nagar', 'indira nagar', 'kasturba nagar', 'shastri nagar', 'thiruvanmiyur'],
  },
  'Porur & Manapakkam': {
    key: 'Porur & Manapakkam',
    anchor: { lat: 13.0250, lng: 80.1500 },
    areaTokens: ['porur', 'manapakkam', 'gerugambakkam', 'kolapakkam', 'mugalivakkam', 'iyyappanthangal'],
  },
  'Anna Nagar & Mogappair': {
    key: 'Anna Nagar & Mogappair',
    anchor: { lat: 13.0865, lng: 80.2060 },
    areaTokens: ['anna nagar', 'mogappair', 'shanti colony', 'shenoy nagar', 'kilpauk'],
  },
  'Velachery & Guindy': {
    key: 'Velachery & Guindy',
    anchor: { lat: 12.9780, lng: 80.2180 },
    areaTokens: ['velachery', 'guindy', 'dhandeeswaram', 'vijaya nagar', 'taramani', 'madipakkam'],
  },
};

/**
 * Checks whether an institution has valid, reliable geographical latitude/longitude coordinates.
 * Explicitly ignores mapX/mapY illustration offsets and static fallback distanceKm values.
 */
export function hasValidCoordinates(school: Pick<School, 'coordinates'> | null | undefined): boolean {
  const coords = school?.coordinates;
  if (!coords) return false;
  const { lat, lng } = coords;
  if (typeof lat !== 'number' || typeof lng !== 'number') return false;
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return false;
  if (lat === 0 && lng === 0) return false;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return false;
  return true;
}

/**
 * Computes great-circle distance in kilometers using the Haversine formula.
 */
export function calculateHaversineDistanceKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const EARTH_RADIUS_KM = 6371;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(EARTH_RADIUS_KM * c * 10) / 10;
}

/**
 * Resolves a raw location string (corridor name or shorthand locality) to a canonical CorridorKey, or null if custom.
 */
export function resolveLocationCorridor(location?: string): CorridorKey | null {
  if (!location || !location.trim()) return 'All Chennai';
  const norm = location.trim().toLowerCase();
  if (norm === 'all chennai' || norm === 'chennai') return 'All Chennai';
  if (norm.includes('tambaram') || norm.includes('gst') || norm.includes('mudichur') || norm.includes('chromepet')) {
    return 'Tambaram & GST Corridor';
  }
  if (norm.includes('omr') || norm.includes('sholinganallur') || norm.includes('karapakkam') || norm.includes('padur') || norm.includes('navalur') || norm.includes('siruseri')) {
    return 'OMR / Sholinganallur';
  }
  if (norm.includes('adyar') || norm.includes('besant')) {
    return 'Adyar & Besant Nagar';
  }
  if (norm.includes('porur') || norm.includes('manapakkam') || norm.includes('gerugambakkam') || norm.includes('kolapakkam')) {
    return 'Porur & Manapakkam';
  }
  if (norm.includes('anna nagar') || norm.includes('mogappair')) {
    return 'Anna Nagar & Mogappair';
  }
  if (norm.includes('velachery') || norm.includes('guindy')) {
    return 'Velachery & Guindy';
  }
  return null;
}

/**
 * Returns the geographical reference coordinates for the selected location/corridor.
 */
export function getLocationAnchor(selectedLocation?: string): { lat: number; lng: number } {
  const corridor = resolveLocationCorridor(selectedLocation);
  if (corridor) {
    return CORRIDOR_DEFINITIONS[corridor].anchor;
  }
  return CORRIDOR_DEFINITIONS['All Chennai'].anchor;
}

/**
 * Calculates an institution's distance in km strictly from real latitude/longitude coordinates.
 * Returns null if valid geographical coordinates are unavailable (never fabricates from mapX/mapY).
 */
export function getSchoolDistanceKm(
  school: Pick<School, 'coordinates'>,
  selectedLocation?: string
): number | null {
  if (!hasValidCoordinates(school)) {
    return null;
  }
  const anchor = getLocationAnchor(selectedLocation);
  return calculateHaversineDistanceKm(
    anchor.lat,
    anchor.lng,
    school.coordinates.lat,
    school.coordinates.lng
  );
}

/**
 * Formats distance reliably for display, returning 'Distance unavailable' if coordinates are missing.
 */
export function formatSchoolDistance(
  school: Pick<School, 'coordinates'>,
  selectedLocation?: string,
  suffix: string = ''
): string {
  const dist = getSchoolDistanceKm(school, selectedLocation);
  if (dist === null) {
    return 'Distance unavailable';
  }
  return `${dist} km${suffix}`;
}

/**
 * Strictly checks whether an institution belongs to the selected Area / Corridor.
 * Does not bypass corridor boundaries via arbitrary distance fallbacks.
 */
export function matchesLocationCorridor(
  school: Pick<School, 'area' | 'address' | 'neighbourhood'>,
  selectedLocation?: string
): boolean {
  if (!selectedLocation || !selectedLocation.trim()) return true;
  const corridor = resolveLocationCorridor(selectedLocation);
  if (corridor === 'All Chennai') return true;

  const schoolLocationText = `${school.area || ''} ${school.neighbourhood?.area || ''} ${school.address || ''}`.toLowerCase();

  if (corridor) {
    const tokens = CORRIDOR_DEFINITIONS[corridor].areaTokens;
    return tokens.some((token) => schoolLocationText.includes(token));
  }

  // Fallback for unrecognized custom locality queries (e.g. "Mylapore", "R.A. Puram")
  const customNorm = selectedLocation.trim().toLowerCase();
  return schoolLocationText.includes(customNorm);
}

export interface LocationFilterEvaluation {
  included: boolean;
  distanceKm: number | null;
  distanceUnavailable: boolean;
  matchesCorridor: boolean;
  exceedsRadius: boolean;
}

/**
 * Deterministic location and radius filter evaluation:
 * 1. Enforces selected Area / Corridor strictly.
 * 2. Calculates real Haversine distance from valid lat/lng coordinates.
 * 3. Hard-excludes institutions whose reliably calculated distance exceeds radiusKm (no hidden buffer).
 * 4. Does not manufacture distances or silently drop institutions when lat/lng coordinates are missing.
 */
export function evaluateLocationFilter(
  school: Pick<School, 'area' | 'address' | 'neighbourhood' | 'coordinates'>,
  selectedLocation?: string,
  radiusKm?: number
): LocationFilterEvaluation {
  const corridorMatch = matchesLocationCorridor(school, selectedLocation);
  const distanceKm = getSchoolDistanceKm(school, selectedLocation);
  const distanceUnavailable = distanceKm === null;
  const hasRadiusLimit = typeof radiusKm === 'number' && radiusKm > 0;
  const exceedsRadius = hasRadiusLimit && distanceKm !== null && distanceKm > radiusKm;

  return {
    included: corridorMatch && !exceedsRadius,
    distanceKm,
    distanceUnavailable,
    matchesCorridor: corridorMatch,
    exceedsRadius,
  };
}
