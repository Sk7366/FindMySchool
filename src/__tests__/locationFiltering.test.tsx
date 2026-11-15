import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { SearchProvider, DEFAULT_FILTERS, useSearch } from '../context/SearchContext';
import { ShortlistProvider } from '../context/ShortlistContext';
import { ComparisonProvider } from '../context/ComparisonContext';
import { SchoolCard } from '../components/schools/SchoolCard';
import { SchoolMapPreview } from '../components/schools/SchoolMapPreview';
import { ComparePage } from '../pages/ComparePage';
import { SchoolProfilePage } from '../pages/SchoolProfilePage';
import {
  hasValidCoordinates,
  calculateHaversineDistanceKm,
  getSchoolDistanceKm,
  formatSchoolDistance,
  matchesLocationCorridor,
  evaluateLocationFilter,
} from '../utils/locationFiltering';
import { generateDynamicMatchReasons } from '../utils/matchProvenance';
import { calculateSchoolFitScore } from '../utils/preschoolScoring';
import { parseQueryLocally } from '../services/queryParserService';
import { schoolService } from '../services/schoolService';
import { CHENNAI_SCHOOLS } from '../data/schools';
import { CHENNAI_PRESCHOOLS } from '../data/preschools';
import { School } from '../types/school';
import { SearchFilters, SortField } from '../types/search';

vi.mock('../hooks/useSchoolData', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../hooks/useSchoolData')>();
  return {
    ...actual,
    useSchool: (idOrSlug?: string | null) => ({
      school: idOrSlug ? schoolService.getByIdSync(idOrSlug) || null : null,
      loading: false,
      error: null,
      isEmpty: !idOrSlug,
      retry: () => {},
    }),
  };
});

function createStorageMock(initial: Record<string, string> = {}) {
  const store: Record<string, string> = { ...initial };
  return {
    getItem: (key: string) => (key in store ? store[key] : null),
    setItem: (key: string, value: string) => {
      store[key] = String(value);
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      for (const key of Object.keys(store)) delete store[key];
    },
    key: (index: number) => Object.keys(store)[index] ?? null,
    get length() {
      return Object.keys(store).length;
    },
  };
}

function renderContextSnapshot(
  filters: SearchFilters,
  sortBy: SortField = 'best_match'
): { ids: string[]; distances: Record<string, number | undefined> } {
  let captured: { ids: string[]; distances: Record<string, number | undefined> } = {
    ids: [],
    distances: {},
  };

  function Probe() {
    const { filteredSchools } = useSearch();
    captured = {
      ids: filteredSchools.map((s) => s.id),
      distances: Object.fromEntries(filteredSchools.map((s) => [s.id, s.distanceKm])),
    };
    return <div data-count={filteredSchools.length} />;
  }

  vi.stubGlobal(
    'localStorage',
    createStorageMock({
      fms_search_state: JSON.stringify({
        rawQuery: 'Find schools in OMR',
        filters,
        sortBy,
      }),
    })
  );

  renderToStaticMarkup(
    <SearchProvider>
      <ShortlistProvider>
        <ComparisonProvider>
          <MemoryRouter initialEntries={['/results']}>
            <Probe />
          </MemoryRouter>
        </ComparisonProvider>
      </ShortlistProvider>
    </SearchProvider>
  );

  return captured;
}

function renderWithProviders(
  ui: React.ReactElement,
  route: string = '/',
  storageSeed: Record<string, string> = {}
): string {
  vi.stubGlobal('localStorage', createStorageMock(storageSeed));
  return renderToStaticMarkup(
    <SearchProvider>
      <ShortlistProvider>
        <ComparisonProvider>
          <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
        </ComparisonProvider>
      </ShortlistProvider>
    </SearchProvider>
  );
}

describe('Deterministic Location & Radius Filtering Suite', () => {
  const sch001 = CHENNAI_SCHOOLS.find((s) => s.id === 'sch-001')!; // Sholinganallur, OMR (lat 12.9010, lng 80.2279)
  const sch008 = CHENNAI_SCHOOLS.find((s) => s.id === 'sch-008')!; // Kolapakkam / Porur (Lalaji Memorial Omega)
  const sch009 = CHENNAI_SCHOOLS.find((s) => s.id === 'sch-009')!; // Padur, OMR (Gateway International)
  const sch004 = CHENNAI_SCHOOLS.find((s) => s.id === 'sch-004')!; // Anna Nagar
  const pre005 = CHENNAI_PRESCHOOLS.find((p) => p.id === 'pre-005')!; // Karapakkam, OMR

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.stubGlobal('localStorage', createStorageMock());
  });

  describe('1. Coordinate validation & Haversine distance calculation', () => {
    it('calculates real Haversine distance from valid lat/lng relative to the active corridor anchor', () => {
      const distFromOMR = getSchoolDistanceKm(sch001, 'OMR / Sholinganallur');
      const expected = calculateHaversineDistanceKm(
        12.9095,
        80.2295,
        sch001.coordinates.lat,
        sch001.coordinates.lng
      );
      expect(distFromOMR).toBe(expected);
      expect(distFromOMR).toBe(1.0);

      // Gateway International (Padur, OMR) is ~12 km south along OMR from Sholinganallur hub
      const padurDist = getSchoolDistanceKm(sch009, 'OMR / Sholinganallur');
      expect(padurDist).toBeGreaterThan(10);
      expect(padurDist).toBeLessThanOrEqual(25);
    });

    it('never uses mapX/mapY illustration offsets or stale static distanceKm when coordinates are missing', () => {
      const missingCoordSchool: School = {
        ...sch001,
        id: 'sch-missing-coords',
        distanceKm: 4.8,
        coordinates: { mapX: 85, mapY: 12 } as unknown as School['coordinates'],
      };

      const zeroCoordSchool: School = {
        ...sch001,
        id: 'sch-zero-coords',
        distanceKm: 3.1,
        coordinates: { lat: 0, lng: 0, mapX: 10, mapY: 10 },
      };

      const nanCoordSchool: School = {
        ...sch001,
        id: 'sch-nan-coords',
        coordinates: { lat: Number.NaN, lng: 80.22, mapX: 10, mapY: 10 },
      };

      for (const candidate of [missingCoordSchool, zeroCoordSchool, nanCoordSchool]) {
        expect(hasValidCoordinates(candidate)).toBe(false);
        expect(getSchoolDistanceKm(candidate, 'OMR / Sholinganallur')).toBeNull();
        expect(formatSchoolDistance(candidate, 'OMR / Sholinganallur')).toBe('Distance unavailable');
      }
    });
  });

  describe('2. Hard-exclusion radius & corridor filtering', () => {
    it('includes institutions within the selected radius and strictly excludes those outside', () => {
      // sch-001 is 1.0 km from OMR / Sholinganallur anchor
      const withinEval = evaluateLocationFilter(sch001, 'OMR / Sholinganallur', 2);
      expect(withinEval.included).toBe(true);
      expect(withinEval.matchesCorridor).toBe(true);
      expect(withinEval.exceedsRadius).toBe(false);
      expect(withinEval.distanceKm).toBe(1.0);

      // sch-009 (Padur, OMR) is ~12.0 km from OMR / Sholinganallur anchor -> excluded at 2 km
      const outsideRadiusEval = evaluateLocationFilter(sch009, 'OMR / Sholinganallur', 2);
      expect(outsideRadiusEval.matchesCorridor).toBe(true);
      expect(outsideRadiusEval.exceedsRadius).toBe(true);
      expect(outsideRadiusEval.included).toBe(false);

      // Under All Chennai anchor (4.9 km), sch-001 must NOT be retained with a +4 km hidden buffer at 2 km
      const allChennaiTightEval = evaluateLocationFilter(sch001, 'All Chennai', 2);
      expect(allChennaiTightEval.distanceKm).toBe(4.9);
      expect(allChennaiTightEval.exceedsRadius).toBe(true);
      expect(allChennaiTightEval.included).toBe(false);
    });

    it('strictly enforces Area / Corridor boundaries without distance-based corridor bypass', () => {
      // Kolapakkam / Porur school must never match OMR / Sholinganallur
      expect(matchesLocationCorridor(sch008, 'OMR / Sholinganallur')).toBe(false);
      const evalOmrPorur = evaluateLocationFilter(sch008, 'OMR / Sholinganallur', 25);
      expect(evalOmrPorur.included).toBe(false);

      // Anna Nagar school must never match OMR / Sholinganallur even with large radius
      const evalOmrAnna = evaluateLocationFilter(sch004, 'OMR / Sholinganallur', 25);
      expect(evalOmrAnna.included).toBe(false);
    });

    it('excludes out-of-radius schools when changing radius from 25 km to 2 km in both SearchContext and schoolService', async () => {
      const omrFilters25: SearchFilters = {
        ...DEFAULT_FILTERS,
        educationTarget: 'school',
        location: 'OMR / Sholinganallur',
        radiusKm: 25,
      };
      const omrFilters2: SearchFilters = {
        ...omrFilters25,
        radiusKm: 2,
      };

      // SearchContext path
      const ctxAt25 = renderContextSnapshot(omrFilters25);
      expect(ctxAt25.ids).toContain('sch-001');
      expect(ctxAt25.ids).toContain('sch-009'); // Padur, OMR (~12 km) included at 25 km
      expect(ctxAt25.ids).not.toContain('sch-008'); // Kolapakkam / Porur excluded
      expect(ctxAt25.ids).not.toContain('sch-004'); // Anna Nagar excluded

      const ctxAt2 = renderContextSnapshot(omrFilters2);
      expect(ctxAt2.ids).toContain('sch-001'); // 1.0 km <= 2 km
      expect(ctxAt2.ids).not.toContain('sch-009'); // 12.0 km > 2 km -> hard excluded
      expect(ctxAt2.ids).not.toContain('sch-008');
      expect(ctxAt2.distances['sch-001']).toBe(1.0);

      // schoolService.search path
      const svc25 = await schoolService.search({ filters: omrFilters25 });
      expect(svc25.data.schools.map((s) => s.id)).toContain('sch-009');
      expect(svc25.data.schools.map((s) => s.id)).not.toContain('sch-008');

      const svc2 = await schoolService.search({ filters: omrFilters2 });
      const svc2Ids = svc2.data.schools.map((s) => s.id);
      expect(svc2Ids).toContain('sch-001');
      expect(svc2Ids).not.toContain('sch-009');
      expect(svc2Ids).not.toContain('sch-008');
    });
  });

  describe('3. "Find schools in OMR" end-to-end deterministic pipeline', () => {
    it('extracts OMR / Sholinganallur from NL query and keeps only matching OMR institutions within 2 km', () => {
      const parsed = parseQueryLocally('Find schools in OMR', DEFAULT_FILTERS);
      expect(parsed.filters.location).toBe('OMR / Sholinganallur');
      expect(parsed.filters.educationTarget).toBe('school');

      // With default 25 km radius: excludes non-OMR schools (e.g. Kolapakkam / Porur)
      const res25 = renderContextSnapshot({ ...parsed.filters, radiusKm: 25 });
      expect(res25.ids).not.toContain('sch-008');
      expect(res25.ids).not.toContain('pre-005'); // standalone preschool excluded when target is 'school'
      expect(res25.ids.every((id) => {
        const inst = CHENNAI_SCHOOLS.find((s) => s.id === id)!;
        return matchesLocationCorridor(inst, 'OMR / Sholinganallur');
      })).toBe(true);

      // Tightening radius to 2 km strictly excludes Gateway International (12.0 km) while retaining sch-001 (1.0 km)
      const res2 = renderContextSnapshot({ ...parsed.filters, radiusKm: 2 });
      expect(res2.ids).toContain('sch-001');
      expect(res2.ids).not.toContain('sch-009');
      expect(res2.ids).not.toContain('sch-008');
    });
  });

  describe('4. Missing coordinates handling across filtering, scoring, provenance & UI', () => {
    const schoolWithoutCoords: School = {
      ...sch001,
      id: 'sch-no-coords',
      name: 'No Coords Academy OMR',
      distanceKm: 4.8,
      coordinates: { mapX: 70, mapY: 30 } as unknown as School['coordinates'],
    };

    it('does not silently exclude missing-coordinate corridor matches and uses neutral scoring + confirmation reason', () => {
      const locEval = evaluateLocationFilter(schoolWithoutCoords, 'OMR / Sholinganallur', 2);
      expect(locEval.included).toBe(true);
      expect(locEval.distanceKm).toBeNull();
      expect(locEval.distanceUnavailable).toBe(true);
      expect(locEval.exceedsRadius).toBe(false);

      const filters: SearchFilters = {
        ...DEFAULT_FILTERS,
        location: 'OMR / Sholinganallur',
        radiusKm: 2,
      };
      const reasons = generateDynamicMatchReasons(schoolWithoutCoords, filters);
      const distReason = reasons.find((r) => r.matchedCriteria === 'distance')!;
      expect(distReason).toBeDefined();
      expect(distReason.type).toBe('unverified');
      expect(distReason.sourceType).toBe('needs_confirmation');
      expect(distReason.title).toContain('Distance unavailable');
      expect(distReason.title).not.toContain('Within your');

      // Scoring uses neutral 0.5 distance factor rather than fabricating a 5 km distance
      const scoreMissing = calculateSchoolFitScore(schoolWithoutCoords, filters);
      const schoolAt1Km: School = { ...sch001, id: 'sch-1km' };
      const scoreNear = calculateSchoolFitScore(schoolAt1Km, filters);
      expect(scoreNear).toBeGreaterThan(scoreMissing);
    });

    it('renders "Distance unavailable" across SchoolCard, SchoolMapPreview, ComparePage, and SchoolProfilePage when coordinates are missing', () => {
      const cardHtml = renderWithProviders(<SchoolCard school={schoolWithoutCoords} />);
      expect(cardHtml).toContain('Distance unavailable');
      expect(cardHtml).not.toContain('4.8 km');

      const mapHtml = renderWithProviders(
        <SchoolMapPreview
          schools={[schoolWithoutCoords]}
          selectedSchoolId={schoolWithoutCoords.id}
          radiusKm={2}
        />
      );
      expect(mapHtml).toContain('Distance unavailable');
      expect(mapHtml).not.toContain('4.8 km');

      const compareHtml = renderWithProviders(
        <ComparePage />,
        '/compare',
        { fms_comparison: JSON.stringify(['sch-001', 'sch-008']) }
      );
      expect(compareHtml).toContain('4.9 km'); // All Chennai default anchor for sch-001

      const profileHtml = renderWithProviders(
        <Routes>
          <Route path="/school/:slug" element={<SchoolProfilePage />} />
        </Routes>,
        `/school/${sch001.slug}`
      );
      expect(profileHtml).toContain(sch001.name);
      expect(profileHtml).toContain('4.9 km');
      expect(profileHtml).not.toContain('4.8 km');
    });
  });

  describe('5. Preservation of existing curriculum, budget, education target & facility filters', () => {
    it('continues applying curriculum, budgetMax, educationTarget, and requiredFacilities alongside location/radius', () => {
      // Curriculum + Corridor + Radius
      const cbseOmr = renderContextSnapshot({
        ...DEFAULT_FILTERS,
        educationTarget: 'school',
        location: 'OMR / Sholinganallur',
        radiusKm: 25,
        curriculums: ['CBSE'],
      });
      expect(cbseOmr.ids).toContain('sch-001');
      expect(cbseOmr.ids).not.toContain('sch-009'); // Cambridge (IGCSE)

      // Preschool target in OMR within 2 km includes pre-005 (Karapakkam, OMR at 1.0 km)
      const preschoolOmr = renderContextSnapshot({
        ...DEFAULT_FILTERS,
        educationTarget: 'preschool',
        location: 'OMR / Sholinganallur',
        radiusKm: 2,
      });
      expect(preschoolOmr.ids).toContain(pre005.id);
      expect(preschoolOmr.ids).not.toContain('pre-001'); // Adyar

      // Budget filter excludes expensive OMR schools when budget is tight
      const lowBudgetOmr = renderContextSnapshot({
        ...DEFAULT_FILTERS,
        educationTarget: 'all',
        location: 'OMR / Sholinganallur',
        radiusKm: 25,
        budgetMax: 50000, // 50k * 1.25 grace = 62.5k; sch-001 min is 115k
      });
      expect(lowBudgetOmr.ids).not.toContain('sch-001');

      // Facility filter continues enforcing requiredFacilities
      const swimmingOmr = renderContextSnapshot({
        ...DEFAULT_FILTERS,
        educationTarget: 'school',
        location: 'OMR / Sholinganallur',
        radiusKm: 25,
        requiredFacilities: ['Swimming Pool'],
      });
      for (const id of swimmingOmr.ids) {
        const school = CHENNAI_SCHOOLS.find((s) => s.id === id)!;
        expect(
          school.facilities.some((f) => f.name.toLowerCase().includes('swimming pool'))
        ).toBe(true);
      }
    });
  });
});
