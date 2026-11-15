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
  areaTokens: string[];
}

export const DISTANCE_UNAVAILABLE_LABEL = 'Distance unavailable — location not verified';

/**
 * Deterministic Chennai corridor metadata used strictly for Area / Corridor matching
 * against listed institution localities and addresses (no invented anchor coordinates).
 */
export const CORRIDOR_DEFINITIONS: Record<CorridorKey, CorridorDefinition> = {
  'All Chennai': {
    key: 'All Chennai',
    areaTokens: [],
  },
  'Tambaram & GST Corridor': {
    key: 'Tambaram & GST Corridor',
    areaTokens: ['tambaram', 'gst', 'mudichur', 'chromepet', 'irumbuliyur', 'perungalathur', 'selaiyur', 'chitlapakkam'],
  },
  'OMR / Sholinganallur': {
    key: 'OMR / Sholinganallur',
    areaTokens: ['omr', 'sholinganallur', 'karapakkam', 'padur', 'navalur', 'siruseri', 'kelambakkam', 'thoraipakkam', 'perungudi', 'semmancheri', 'perumbakkam'],
  },
  'Adyar & Besant Nagar': {
    key: 'Adyar & Besant Nagar',
    areaTokens: ['adyar', 'besant nagar', 'besant', 'gandhi nagar', 'padmanabha nagar', 'indira nagar', 'kasturba nagar', 'shastri nagar', 'thiruvanmiyur'],
  },
  'Porur & Manapakkam': {
    key: 'Porur & Manapakkam',
    areaTokens: ['porur', 'manapakkam', 'gerugambakkam', 'kolapakkam', 'mugalivakkam', 'iyyappanthangal'],
  },
  'Anna Nagar & Mogappair': {
    key: 'Anna Nagar & Mogappair',
    areaTokens: ['anna nagar', 'mogappair', 'shanti colony', 'shenoy nagar', 'kilpauk'],
  },
  'Velachery & Guindy': {
    key: 'Velachery & Guindy',
    areaTokens: ['velachery', 'guindy', 'dhandeeswaram', 'vijaya nagar', 'taramani', 'madipakkam'],
  },
};

export interface VerifiedOrigin {
  lat: number;
  lng: number;
}

/**
 * Validates that a coordinate object holds finite, non-zero lat/lng bounds.
 */
export function isValidCoordinatePair(
  coords?: { lat?: number; lng?: number } | null
): coords is VerifiedOrigin {
  if (!coords) return false;
  const { lat, lng } = coords;
  if (typeof lat !== 'number' || typeof lng !== 'number') return false;
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return false;
  if (lat === 0 && lng === 0) return false;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return false;
  return true;
}

/**
 * Checks whether an institution has finite, non-zero latitude/longitude coordinates.
 * Explicitly ignores mapX/mapY illustration offsets and static fallback distanceKm values.
 * Note: Valid numerical shape alone does NOT imply coordinates are verified.
 */
export function hasValidCoordinates(school: Pick<School, 'coordinates'> | null | undefined): boolean {
  return isValidCoordinatePair(school?.coordinates);
}

/**
 * Checks whether an institution's coordinates are explicitly verified AND numerically valid.
 * All demo catalog records default to unverified (false) until geocoded from a trusted source.
 */
export function isCoordinateVerified(
  school: Pick<School, 'coordinates' | 'coordinateVerified'> | null | undefined
): boolean {
  return Boolean(school?.coordinateVerified === true && hasValidCoordinates(school));
}

/**
 * Radius filtering requires both a verified search origin and at least one verified institution coordinate.
 * Returns false for unverified demo catalogs so users are never misled by unverified radius claims.
 */
export function isRadiusFilteringAvailable(
  schools?: Pick<School, 'coordinates' | 'coordinateVerified'>[],
  verifiedOrigin?: VerifiedOrigin | null
): boolean {
  if (!isValidCoordinatePair(verifiedOrigin)) return false;
  if (!schools || schools.length === 0) return false;
  return schools.some((s) => isCoordinateVerified(s));
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
 * Calculates an institution's distance in km ONLY when:
 * 1. The institution has explicitly verified, valid lat/lng coordinates (coordinateVerified === true), AND
 * 2. A verified geographical search origin is supplied.
 *
 * Returns null for all unverified demo records, missing coordinates, or when no reliable origin exists.
 * Never falls back to mapX/mapY, static distanceKm, or unverified corridor anchors.
 */
export function getSchoolDistanceKm(
  school: Pick<School, 'coordinates' | 'coordinateVerified'>,
  _selectedLocation?: string,
  verifiedOrigin?: VerifiedOrigin | null
): number | null {
  if (!isCoordinateVerified(school) || !isValidCoordinatePair(verifiedOrigin)) {
    return null;
  }
  return calculateHaversineDistanceKm(
    verifiedOrigin.lat,
    verifiedOrigin.lng,
    school.coordinates.lat,
    school.coordinates.lng
  );
}

/**
 * Formats distance safely for display, returning 'Distance unavailable — location not verified'
 * whenever reliable verified distance cannot be established.
 */
export function formatSchoolDistance(
  school: Pick<School, 'coordinates' | 'coordinateVerified'>,
  selectedLocation?: string,
  suffix: string = '',
  verifiedOrigin?: VerifiedOrigin | null
): string {
  const dist = getSchoolDistanceKm(school, selectedLocation, verifiedOrigin);
  if (dist === null) {
    return DISTANCE_UNAVAILABLE_LABEL;
  }
  return `${dist} km${suffix}`;
}

/**
 * Strictly checks whether an institution belongs to the selected Area / Corridor
 * using only institution locality and address metadata (never distance or anchor coordinates).
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
  locationVerified: boolean;
  matchesCorridor: boolean;
  exceedsRadius: boolean;
  radiusApplied: boolean;
}

/**
 * Safe deterministic location filter evaluation:
 * 1. Enforces selected Area / Corridor strictly via locality & address metadata.
 * 2. Suppresses numerical distances and radius exclusions whenever institution coordinates or origin are unverified.
 * 3. Only applies hard radius exclusion when both institution coordinates and origin are verified.
 */
export function evaluateLocationFilter(
  school: Pick<School, 'area' | 'address' | 'neighbourhood' | 'coordinates' | 'coordinateVerified'>,
  selectedLocation?: string,
  radiusKm?: number,
  verifiedOrigin?: VerifiedOrigin | null
): LocationFilterEvaluation {
  const corridorMatch = matchesLocationCorridor(school, selectedLocation);
  const locationVerified = isCoordinateVerified(school);
  const distanceKm = getSchoolDistanceKm(school, selectedLocation, verifiedOrigin);
  const distanceUnavailable = distanceKm === null;
  const hasRadiusLimit = typeof radiusKm === 'number' && radiusKm > 0;
  const radiusApplied = hasRadiusLimit && distanceKm !== null;
  const exceedsRadius = radiusApplied && distanceKm > radiusKm;

  return {
    included: corridorMatch && !exceedsRadius,
    distanceKm,
    distanceUnavailable,
    locationVerified,
    matchesCorridor: corridorMatch,
    exceedsRadius,
    radiusApplied,
  };
}
