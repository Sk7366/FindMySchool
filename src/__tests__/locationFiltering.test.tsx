import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { SearchProvider, DEFAULT_FILTERS, useSearch } from '../context/SearchContext';
import { ShortlistProvider } from '../context/ShortlistContext';
import { ComparisonProvider } from '../context/ComparisonContext';
import { SchoolCard } from '../components/schools/SchoolCard';
import { SchoolMapPreview } from '../components/schools/SchoolMapPreview';
import { FilterSidebar } from '../components/filters/FilterSidebar';
import { GuidedSearchModal } from '../components/search/GuidedSearchModal';
import { WhatWeUnderstoodPanel } from '../components/search/WhatWeUnderstoodPanel';
import { SearchResultsPage } from '../pages/SearchResultsPage';
import { ComparePage } from '../pages/ComparePage';
import { SchoolProfilePage } from '../pages/SchoolProfilePage';
import {
  DISTANCE_UNAVAILABLE_LABEL,
  hasValidCoordinates,
  isCoordinateVerified,
  isRadiusFilteringAvailable,
  calculateHaversineDistanceKm,
  getSchoolDistanceKm,
  formatSchoolDistance,
  matchesLocationCorridor,
  evaluateLocationFilter,
} from '../utils/locationFiltering';
import { generateDynamicMatchReasons } from '../utils/matchProvenance';
import { buildAdvisorContext, getAdvisorResponse } from '../utils/advisorContext';
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
): {
  ids: string[];
  distances: Record<string, number | undefined>;
  isRadiusFilterAvailable: boolean;
} {
  let captured: {
    ids: string[];
    distances: Record<string, number | undefined>;
    isRadiusFilterAvailable: boolean;
  } = {
    ids: [],
    distances: {},
    isRadiusFilterAvailable: true,
  };

  function Probe() {
    const { filteredSchools, isRadiusFilterAvailable } = useSearch();
    captured = {
      ids: filteredSchools.map((s) => s.id),
      distances: Object.fromEntries(filteredSchools.map((s) => [s.id, s.distanceKm])),
      isRadiusFilterAvailable,
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

describe('Phase 1.5 Safe Location Handling & Coordinate Provenance Suite', () => {
  const sch001 = CHENNAI_SCHOOLS.find((s) => s.id === 'sch-001')!; // Sholinganallur, OMR
  const sch008 = CHENNAI_SCHOOLS.find((s) => s.id === 'sch-008')!; // Kolapakkam / Porur
  const sch009 = CHENNAI_SCHOOLS.find((s) => s.id === 'sch-009')!; // Padur, OMR
  const sch004 = CHENNAI_SCHOOLS.find((s) => s.id === 'sch-004')!; // Anna Nagar
  const pre005 = CHENNAI_PRESCHOOLS.find((p) => p.id === 'pre-005')!; // Karapakkam, OMR

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.stubGlobal('localStorage', createStorageMock());
  });

  describe('1. Explicit coordinate provenance on all demo institutions', () => {
    it('marks every existing demo school and preschool record as coordinateVerified: false with no fabricated verification metadata', () => {
      expect(CHENNAI_SCHOOLS.length).toBe(18);
      expect(CHENNAI_PRESCHOOLS.length).toBe(6);

      for (const inst of CHENNAI_SCHOOLS) {
        expect(inst.coordinateVerified).toBe(false);
        expect(inst.coordinateSource).toBeUndefined();
        expect(inst.coordinateVerifiedAt).toBeUndefined();
        expect(isCoordinateVerified(inst)).toBe(false);
      }

      for (const pre of CHENNAI_PRESCHOOLS) {
        expect(pre.coordinateVerified).toBe(false);
        expect(pre.coordinateSource).toBeUndefined();
        expect(pre.coordinateVerifiedAt).toBeUndefined();
      }
    });
  });

  describe('2. Unverified distance suppression & verified-only Haversine calculation', () => {
    it('suppresses numerical distances for all unverified demo records even when raw lat/lng or distanceKm exist', () => {
      expect(hasValidCoordinates(sch001)).toBe(true);
      expect(sch001.distanceKm).toBeGreaterThan(0);

      expect(getSchoolDistanceKm(sch001, 'OMR / Sholinganallur')).toBeNull();
      expect(getSchoolDistanceKm(sch009, 'OMR / Sholinganallur')).toBeNull();
      expect(getSchoolDistanceKm(sch001, 'All Chennai', { lat: 12.9095, lng: 80.2295 })).toBeNull();

      expect(formatSchoolDistance(sch001, 'OMR / Sholinganallur')).toBe(DISTANCE_UNAVAILABLE_LABEL);
    });

    it('never uses mapX/mapY illustration offsets or static fallback distanceKm', () => {
      const missingCoordVerified: School = {
        ...sch001,
        id: 'sch-missing-coords',
        coordinateVerified: true,
        distanceKm: 4.8,
        coordinates: { mapX: 85, mapY: 12 } as unknown as School['coordinates'],
      };

      const zeroCoordVerified: School = {
        ...sch001,
        id: 'sch-zero-coords',
        coordinateVerified: true,
        distanceKm: 3.1,
        coordinates: { lat: 0, lng: 0, mapX: 10, mapY: 10 },
      };

      const nanCoordVerified: School = {
        ...sch001,
        id: 'sch-nan-coords',
        coordinateVerified: true,
        coordinates: { lat: Number.NaN, lng: 80.22, mapX: 10, mapY: 10 },
      };

      const origin = { lat: 12.9095, lng: 80.2295 };
      for (const candidate of [missingCoordVerified, zeroCoordVerified, nanCoordVerified]) {
        expect(hasValidCoordinates(candidate)).toBe(false);
        expect(isCoordinateVerified(candidate)).toBe(false);
        expect(getSchoolDistanceKm(candidate, 'OMR / Sholinganallur', origin)).toBeNull();
        expect(formatSchoolDistance(candidate, 'OMR / Sholinganallur', '', origin)).toBe(
          DISTANCE_UNAVAILABLE_LABEL
        );
      }
    });

    it('calculates real Haversine distance ONLY when BOTH coordinateVerified === true and a valid verifiedOrigin are supplied', () => {
      const verifiedSch001: School = {
        ...sch001,
        id: 'sch-001-verified',
        coordinateVerified: true,
        coordinateSource: 'Official Campus Survey',
        coordinateVerifiedAt: '2026-04-01',
      };
      const verifiedOrigin = { lat: 12.9095, lng: 80.2295 };

      // Without verifiedOrigin, distance remains suppressed
      expect(getSchoolDistanceKm(verifiedSch001, 'OMR / Sholinganallur')).toBeNull();

      // With verifiedOrigin, Haversine distance is computed
      const dist = getSchoolDistanceKm(verifiedSch001, 'OMR / Sholinganallur', verifiedOrigin);
      const expected = calculateHaversineDistanceKm(
        verifiedOrigin.lat,
        verifiedOrigin.lng,
        verifiedSch001.coordinates.lat,
        verifiedSch001.coordinates.lng
      );
      expect(dist).toBe(expected);
      expect(dist).toBe(1.0);
      expect(formatSchoolDistance(verifiedSch001, 'OMR / Sholinganallur', '', verifiedOrigin)).toBe(
        '1 km'
      );
    });
  });

  describe('3. Safe radius filtering & corridor matching without invented anchors', () => {
    it('reports radius filtering unavailable for the unverified demo catalog', () => {
      expect(isRadiusFilteringAvailable(CHENNAI_SCHOOLS)).toBe(false);
      expect(isRadiusFilteringAvailable(CHENNAI_SCHOOLS, { lat: 12.9095, lng: 80.2295 })).toBe(false);

      const snapshot = renderContextSnapshot({ ...DEFAULT_FILTERS, location: 'OMR / Sholinganallur' });
      expect(snapshot.isRadiusFilterAvailable).toBe(false);
    });

    it('never excludes corridor-matching unverified schools due to radius (2 km vs 25 km)', async () => {
      const eval2Km = evaluateLocationFilter(sch009, 'OMR / Sholinganallur', 2);
      expect(eval2Km.matchesCorridor).toBe(true);
      expect(eval2Km.locationVerified).toBe(false);
      expect(eval2Km.distanceUnavailable).toBe(true);
      expect(eval2Km.radiusApplied).toBe(false);
      expect(eval2Km.exceedsRadius).toBe(false);
      expect(eval2Km.included).toBe(true);

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

      const ctx25 = renderContextSnapshot(omrFilters25);
      const ctx2 = renderContextSnapshot(omrFilters2);
      expect(ctx2.ids).toEqual(ctx25.ids);
      expect(ctx2.ids).toContain('sch-001');
      expect(ctx2.ids).toContain('sch-009'); // Padur, OMR kept safely because location is unverified
      expect(ctx2.ids).not.toContain('sch-008'); // Kolapakkam / Porur still strictly excluded by corridor
      expect(ctx2.ids).not.toContain('sch-004'); // Anna Nagar excluded by corridor
      expect(ctx2.distances['sch-001']).toBeUndefined();

      const svc25 = await schoolService.search({ filters: omrFilters25 });
      const svc2 = await schoolService.search({ filters: omrFilters2 });
      expect(svc2.data.schools.map((s) => s.id)).toEqual(svc25.data.schools.map((s) => s.id));
      expect(svc2.data.schools.map((s) => s.id)).toContain('sch-009');
      expect(svc2.data.schools.map((s) => s.id)).not.toContain('sch-008');
    });

    it('applies hard radius exclusion ONLY when both institution coordinates and search origin are verified', () => {
      const origin = { lat: 12.9095, lng: 80.2295 };
      const verifiedNear: School = { ...sch001, coordinateVerified: true };
      const verifiedFar: School = { ...sch009, coordinateVerified: true };

      const nearEval = evaluateLocationFilter(verifiedNear, 'OMR / Sholinganallur', 2, origin);
      expect(nearEval.radiusApplied).toBe(true);
      expect(nearEval.exceedsRadius).toBe(false);
      expect(nearEval.included).toBe(true);
      expect(nearEval.distanceKm).toBe(1.0);

      const farEval = evaluateLocationFilter(verifiedFar, 'OMR / Sholinganallur', 2, origin);
      expect(farEval.radiusApplied).toBe(true);
      expect(farEval.exceedsRadius).toBe(true);
      expect(farEval.included).toBe(false);
      expect(farEval.distanceKm).toBeGreaterThan(10);
    });

    it('preserves strict Area / Corridor matching for "Find schools in OMR"', () => {
      const parsed = parseQueryLocally('Find schools in OMR', DEFAULT_FILTERS);
      expect(parsed.filters.location).toBe('OMR / Sholinganallur');
      expect(parsed.filters.educationTarget).toBe('school');

      const res = renderContextSnapshot({ ...parsed.filters, radiusKm: 2 });
      expect(res.ids).not.toContain('sch-008'); // Kolapakkam / Porur excluded
      expect(res.ids).not.toContain('pre-005'); // Standalone preschool excluded for target='school'
      expect(
        res.ids.every((id) => {
          const inst = CHENNAI_SCHOOLS.find((s) => s.id === id)!;
          return matchesLocationCorridor(inst, 'OMR / Sholinganallur');
        })
      ).toBe(true);
    });
  });

  describe('4. Safe UI disclosure across cards, maps, filters, compare, profile, and advisor', () => {
    it('renders "Distance unavailable — location not verified" instead of numerical km across views', () => {
      const cardHtml = renderWithProviders(<SchoolCard school={sch001} />);
      expect(cardHtml).toContain(DISTANCE_UNAVAILABLE_LABEL);
      expect(cardHtml).not.toContain('4.8 km');
      expect(cardHtml).not.toContain('1.0 km');

      const mapHtml = renderWithProviders(
        <SchoolMapPreview
          schools={[sch001]}
          selectedSchoolId={sch001.id}
          radiusKm={2}
          radiusAvailable={false}
        />
      );
      expect(mapHtml).toContain(DISTANCE_UNAVAILABLE_LABEL);
      expect(mapHtml).toContain('illustrative pins (locations not verified)');
      expect(mapHtml).not.toContain('stroke-dasharray="5,5"'); // radius circle hidden when unavailable
      expect(mapHtml).not.toContain('4.8 km');

      const compareHtml = renderWithProviders(
        <ComparePage />,
        '/compare',
        { fms_comparison: JSON.stringify(['sch-001', 'sch-008']) }
      );
      expect(compareHtml).toContain(DISTANCE_UNAVAILABLE_LABEL);
      expect(compareHtml).toContain('Radius filter unavailable (demo data)');
      expect(compareHtml).not.toContain('4.8 km');
      expect(compareHtml).not.toContain('5.6 km');

      const profileHtml = renderWithProviders(
        <Routes>
          <Route path="/school/:slug" element={<SchoolProfilePage />} />
        </Routes>,
        `/school/${sch001.slug}`
      );
      expect(profileHtml).toContain(sch001.name);
      expect(profileHtml).toContain(DISTANCE_UNAVAILABLE_LABEL);
      expect(profileHtml).not.toContain('4.8 km');
    });

    it('disables radius controls and omits misleading radius pills/options when location data is unverified', () => {
      const sidebarHtml = renderWithProviders(<FilterSidebar />);
      expect(sidebarHtml).toContain('Unavailable');
      expect(sidebarHtml).toContain('Radius filtering is unavailable');
      expect(sidebarHtml).toContain('disabled=""');

      const guidedHtml = renderWithProviders(
        <GuidedSearchModal isOpen={true} onClose={() => {}} />
      );
      expect(guidedHtml).toContain('Unavailable');
      expect(guidedHtml).toContain('Radius filtering is temporarily unavailable');
      expect(guidedHtml).toContain('disabled=""');

      const understoodHtml = renderWithProviders(
        <WhatWeUnderstoodPanel onOpenPriorityTuner={() => {}} />,
        '/results',
        {
          fms_search_state: JSON.stringify({
            rawQuery: 'Find schools in OMR',
            filters: { ...DEFAULT_FILTERS, location: 'OMR / Sholinganallur', radiusKm: 2 },
            sortBy: 'best_match',
          }),
        }
      );
      expect(understoodHtml).toContain('Commute radius filter unavailable (locations not verified)');
      expect(understoodHtml).not.toContain('Within 2 km');

      const resultsHtml = renderWithProviders(
        <SearchResultsPage />,
        '/results',
        {
          fms_search_state: JSON.stringify({
            rawQuery: 'Find schools in OMR',
            filters: { ...DEFAULT_FILTERS, location: 'OMR / Sholinganallur', radiusKm: 2 },
            sortBy: 'distance_asc',
          }),
        }
      );
      expect(resultsHtml).toContain('Nearest commute (unavailable)');
      expect(resultsHtml).not.toContain('≤ 2 km radius');

      // Provenance and advisor reflect unavailable distance/radius cleanly
      const reasons = generateDynamicMatchReasons(sch001, {
        ...DEFAULT_FILTERS,
        location: 'OMR / Sholinganallur',
        radiusKm: 2,
      });
      expect(reasons.some((r) => r.title === 'Listed in Sholinganallur, OMR')).toBe(true);
      expect(reasons.some((r) => r.title === DISTANCE_UNAVAILABLE_LABEL)).toBe(true);
      expect(reasons.some((r) => r.title.includes('Within your'))).toBe(false);

      const advisorCtx = buildAdvisorContext(
        {
          rawQuery: 'Find schools in OMR',
          filters: { ...DEFAULT_FILTERS, location: 'OMR / Sholinganallur', radiusKm: 2 },
          sortBy: 'best_match',
        },
        [sch001],
        [],
        [sch001]
      );
      const schoolAdvisorReply = getAdvisorResponse(sch001.name, advisorCtx, [sch001]);
      expect(schoolAdvisorReply.text).toContain(DISTANCE_UNAVAILABLE_LABEL);
      expect(schoolAdvisorReply.text).not.toContain('4.8 km');
      const advisorReply = getAdvisorResponse('adjust-search', advisorCtx, [sch001]);
      expect(advisorReply.text).toContain('Commute Radius Filter**: Temporarily unavailable');
    });
  });

  describe('5. Preservation of existing curriculum, budget, target, facility filters & neutral scoring', () => {
    it('continues enforcing curriculum, budgetMax, educationTarget, requiredFacilities, and neutral distance scoring', () => {
      const cbseOmr = renderContextSnapshot({
        ...DEFAULT_FILTERS,
        educationTarget: 'school',
        location: 'OMR / Sholinganallur',
        curriculums: ['CBSE'],
      });
      expect(cbseOmr.ids).toContain('sch-001');
      expect(cbseOmr.ids).not.toContain('sch-009'); // Cambridge (IGCSE)

      const preschoolOmr = renderContextSnapshot({
        ...DEFAULT_FILTERS,
        educationTarget: 'preschool',
        location: 'OMR / Sholinganallur',
      });
      expect(preschoolOmr.ids).toContain(pre005.id);
      expect(preschoolOmr.ids).not.toContain('pre-001'); // Adyar

      const lowBudgetOmr = renderContextSnapshot({
        ...DEFAULT_FILTERS,
        educationTarget: 'all',
        location: 'OMR / Sholinganallur',
        budgetMax: 50000,
      });
      expect(lowBudgetOmr.ids).not.toContain('sch-001');

      const swimmingOmr = renderContextSnapshot({
        ...DEFAULT_FILTERS,
        educationTarget: 'school',
        location: 'OMR / Sholinganallur',
        requiredFacilities: ['Swimming Pool'],
      });
      for (const id of swimmingOmr.ids) {
        const school = CHENNAI_SCHOOLS.find((s) => s.id === id)!;
        expect(
          school.facilities.some((f) => f.name.toLowerCase().includes('swimming pool'))
        ).toBe(true);
      }

      // Fit score still works deterministically without relying on unverified coordinates
      const score = calculateSchoolFitScore(sch001, {
        ...DEFAULT_FILTERS,
        location: 'OMR / Sholinganallur',
        curriculums: ['CBSE'],
        budgetMax: 150000,
      });
      expect(score).toBeGreaterThan(70);
      expect(score).toBeLessThanOrEqual(98);
    });
  });
});
