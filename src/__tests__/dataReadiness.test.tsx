import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { SearchProvider, DEFAULT_FILTERS } from '../context/SearchContext';
import { ShortlistProvider } from '../context/ShortlistContext';
import { ComparisonProvider } from '../context/ComparisonContext';
import { SchoolCard } from '../components/schools/SchoolCard';
import { SchoolMapPreview } from '../components/schools/SchoolMapPreview';
import { SearchTransitionPipeline } from '../components/search/SearchTransitionPipeline';
import { SearchResultsPage } from '../pages/SearchResultsPage';
import { SchoolProfilePage } from '../pages/SchoolProfilePage';
import { ComparePage } from '../pages/ComparePage';
import { HomePage } from '../pages/HomePage';
import { HowItWorksPage } from '../pages/HowItWorksPage';
import { CHENNAI_SCHOOLS } from '../data/schools';
import { CHENNAI_PRESCHOOLS } from '../data/preschools';
import { schoolService } from '../services/schoolService';
import { generateDynamicMatchReasons, formatMatchReason } from '../utils/matchProvenance';
import { calculateSchoolFitScore } from '../utils/preschoolScoring';
import { buildAdvisorContext, getAdvisorResponse } from '../utils/advisorContext';
import { School } from '../types/school';

// Synchronously resolve useSchool from schoolService.getByIdSync so SchoolProfilePage renders full profile in SSR tests
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

describe('Phase 1 Data-Readiness & Transparency Regression Suite', () => {
  const sch001 = CHENNAI_SCHOOLS.find((s) => s.id === 'sch-001')!;
  const sch002 = CHENNAI_SCHOOLS.find((s) => s.id === 'sch-002')!;
  const pre001 = CHENNAI_PRESCHOOLS.find((p) => p.id === 'pre-001')!;
  const pre003 = CHENNAI_PRESCHOOLS.find((p) => p.id === 'pre-003')!;

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.stubGlobal('localStorage', createStorageMock());
  });

  describe('1. Suppression of synthetic ratings and reviews', () => {
    it('does not render synthetic rating or reviewCount on SchoolCard for demo records while preserving Demo data badge', () => {
      for (const inst of [sch001, sch002, pre001, pre003]) {
        const html = renderWithProviders(<SchoolCard school={inst} />);
        expect(html).toContain('Demo data');
        expect(html).not.toContain(`(${inst.reviewCount})`);
        expect(html).not.toContain(`>${inst.rating.toFixed(1)}<`);
      }
    });

    it('renders rating on SchoolCard only if record is genuinely verified and non-demo with positive reviewCount', () => {
      const verifiedSchool: School = {
        ...sch001,
        id: 'sch-verified-test',
        dataStatus: 'verified',
        verificationStatus: 'Verified by School',
        rating: 4.6,
        reviewCount: 42,
      };
      const html = renderWithProviders(<SchoolCard school={verifiedSchool} />);
      expect(html).toContain('4.6');
      expect(html).toContain('(42)');
    });

    it('removes Parent rating sort option from SearchResultsPage and normalizes legacy rating_desc sort state', () => {
      const html = renderWithProviders(
        <SearchResultsPage />,
        '/results',
        {
          fms_search_state: JSON.stringify({
            rawQuery: '',
            filters: DEFAULT_FILTERS,
            sortBy: 'rating_desc',
          }),
        }
      );
      expect(html).not.toContain('value="rating_desc"');
      expect(html).not.toContain('Parent rating');
      expect(html).toContain('value="best_match"');
    });

    it('does not display synthetic ratings or review counts on SchoolProfilePage or ComparePage', () => {
      const profileHtml = renderWithProviders(
        <Routes>
          <Route path="/school/:slug" element={<SchoolProfilePage />} />
        </Routes>,
        `/school/${sch001.slug}`
      );
      expect(profileHtml).toContain('Demo data');
      expect(profileHtml).not.toContain(`(${sch001.reviewCount})`);
      expect(profileHtml).not.toContain('Parent Rating');

      const compareHtml = renderWithProviders(
        <ComparePage />,
        '/compare',
        {
          fms_comparison: JSON.stringify([sch001.id, sch002.id, pre003.id]),
        }
      );
      expect(compareHtml).toContain('Demo data');
      expect(compareHtml).not.toContain(`(${sch001.reviewCount})`);
      expect(compareHtml).not.toContain(`(${pre003.reviewCount})`);
    });
  });

  describe('2. Fee transparency & illustrative demo disclosures', () => {
    it('discloses illustrative demo fees on SchoolCard while preserving existing fee ranges', () => {
      const html = renderWithProviders(<SchoolCard school={sch001} />);
      expect(html).toContain('Illustrative demo fee');
      expect(html).toContain('₹1.1L – ₹1.4L');
    });

    it('discloses illustrative demo fees on SchoolMapPreview and handles missing fees honestly', () => {
      const htmlWithFee = renderWithProviders(
        <SchoolMapPreview schools={[sch001]} selectedSchoolId={sch001.id} />
      );
      expect(htmlWithFee).toContain('Illustrative demo fee');

      const missingFeeSchool: School = {
        ...sch001,
        annualFeeMin: 0,
        annualFeeMax: 0,
      };
      const htmlMissingFee = renderWithProviders(
        <SchoolMapPreview schools={[missingFeeSchool]} selectedSchoolId={missingFeeSchool.id} />
      );
      expect(htmlMissingFee).toContain('Fee information not available');
      expect(htmlMissingFee).not.toContain('₹0.0L');
    });

    it('discloses illustrative demo fees on SchoolProfilePage without Verified 2025-26 claims', () => {
      const html = renderWithProviders(
        <Routes>
          <Route path="/school/:slug" element={<SchoolProfilePage />} />
        </Routes>,
        `/school/${sch001.slug}`
      );
      expect(html).toContain('Demo estimate · Not an official circular');
      expect(html).toContain('Illustrative Tuition');
      expect(html).toContain('3. Fees (Illustrative)');
      expect(html).toContain('Illustrative demo data');
      expect(html).not.toContain('Verified 2025-26');
      expect(html).not.toContain('Official verified fee');
    });

    it('labels fees as illustrative on ComparePage without Verified circular or Verified schedule claims', () => {
      const html = renderWithProviders(
        <ComparePage />,
        '/compare',
        {
          fms_comparison: JSON.stringify([sch001.id, pre003.id]),
        }
      );
      expect(html).toContain('Illustrative demo fee');
      expect(html).not.toContain('Verified circular');
      expect(html).not.toContain('Verified schedule');
    });

    it('uses illustrative fee copy on HomePage hubs and FAQs', () => {
      const html = renderWithProviders(<HomePage onOpenAdvisor={() => {}} />);
      expect(html).toContain('Illustrative ~');
      expect(html).toContain('illustrative demo fee estimates');
      expect(html).not.toContain('Avg ~');
      expect(html).not.toContain('verified fee structures');
    });
  });

  describe('3. Correction of misleading verification language', () => {
    it('does not claim verified recommendations or verified results in SearchTransitionPipeline', () => {
      const animatingHtml = renderToStaticMarkup(
        <SearchTransitionPipeline resultsCount={8} isInitialSearch={true} />
      );
      const readyHtml = renderToStaticMarkup(
        <SearchTransitionPipeline resultsCount={8} isInitialSearch={false} />
      );
      expect(animatingHtml.toLowerCase()).not.toContain('verified recommendations');
      expect(readyHtml.toLowerCase()).not.toContain('verified results');
      expect(readyHtml).toContain('8 matching results ready');
    });

    it('labels catalog match explanations truthfully in matchProvenance without false verification claims', () => {
      const reasons = generateDynamicMatchReasons(sch001, {
        ...DEFAULT_FILTERS,
        requiredFacilities: ['Science Laboratories'],
      });
      for (const reason of reasons) {
        const formatted = formatMatchReason(reason);
        expect(formatted.tag).not.toBe('Verified factual information');
        expect(reason.title).not.toContain('Offers verified early-childhood');
        if (reason.description) {
          expect(reason.description).not.toContain('Verified campus infrastructure');
          expect(reason.description).not.toContain('No verified');
        }
        if (formatted.detail) {
          expect(formatted.detail).not.toContain('Verified campus infrastructure');
          expect(formatted.detail).not.toContain('No verified');
        }
      }
      const verifiedFactReason = reasons.find((r) => r.sourceType === 'verified_fact');
      expect(verifiedFactReason).toBeDefined();
      expect(formatMatchReason(verifiedFactReason!).tag).toBe('Listed catalog information');
    });

    it('updates HowItWorksPage and advisorContext copy away from false verification claims', () => {
      const howHtml = renderWithProviders(<HowItWorksPage />);
      expect(howHtml).toContain('2. Listed Catalog Information');
      expect(howHtml).toContain('listed catalog details');
      expect(howHtml).not.toContain('2. Verified Factual Information');
      expect(howHtml).not.toContain('verified factual details');

      const context = buildAdvisorContext(
        { rawQuery: '', filters: DEFAULT_FILTERS, sortBy: 'best_match' },
        [sch001, sch002],
        [],
        [sch001, sch002]
      );
      const reply = getAdvisorResponse('compare-shortlist', context, [sch001, sch002]);
      expect(reply.text).not.toContain('Compare verified fee transparency');
      expect(reply.text).toContain('Compare listed fee breakdowns');
    });
  });

  describe('4. Honest handling of missing and undefined fields', () => {
    it('does not synthesize missing pedagogy, timings, ratios, or facility text on SchoolCard', () => {
      const sparsePreschool: School = {
        ...pre003,
        id: 'pre-sparse',
        slug: 'sparse-preschool',
        name: 'Sparse Early Learning',
        preschoolPrograms: undefined,
        pedagogy: undefined,
        timings: undefined,
        ageRange: undefined,
        childToCaregiverRatio: undefined,
        daycare: undefined,
        facilities: [],
      };

      const html = renderWithProviders(<SchoolCard school={sparsePreschool} />);
      expect(html).toContain('Information not available');
      expect(html).toContain('Needs confirmation');
      expect(html).toContain('No facilities listed in catalog records');
      expect(html).not.toContain('Montessori / Play-way');
      expect(html).not.toContain('8:30 AM – 1:30 PM');
      expect(html).not.toContain('Half-day program');
      expect(html).not.toContain('Toddler to UKG');
      expect(html).not.toContain('1:8');

      // Combined school sch-002 has pedagogy: undefined and daycare: undefined
      const combinedHtml = renderWithProviders(<SchoolCard school={sch002} />);
      expect(combinedHtml).not.toContain('Labs &amp; Sports Turf');
      expect(combinedHtml).not.toContain('Labs & Sports Turf');
      expect(combinedHtml).not.toContain('1:16');
      expect(combinedHtml).not.toContain('Early Childhood Foundation');
      expect(combinedHtml).toContain('Approach not listed');
    });

    it('renders tri-state Needs confirmation / Information not available for missing fields in ComparePage and SchoolProfilePage', () => {
      const sparsePreschoolForProfile: School = {
        ...pre003,
        id: 'pre-sparse-profile',
        slug: 'sparse-preschool-profile',
        pedagogy: undefined,
        timings: undefined,
        ageRange: undefined,
        preschoolPrograms: undefined,
        childToCaregiverRatio: undefined,
        daycare: undefined,
        outdoorPlay: undefined,
        meals: undefined,
        hasTransport: undefined as unknown as boolean,
        facilities: [],
      };

      vi.spyOn(schoolService, 'getByIdSync').mockReturnValueOnce(sparsePreschoolForProfile);

      const profileHtml = renderWithProviders(
        <Routes>
          <Route path="/school/:slug" element={<SchoolProfilePage />} />
        </Routes>,
        `/school/${sparsePreschoolForProfile.slug}`
      );
      expect(profileHtml).not.toContain('2026 circular verification');
      expect(profileHtml).not.toContain('Activity-based &amp; Montessori');
      expect(profileHtml).not.toContain('8:30 AM – 1:30 PM');
      expect(profileHtml).toContain('Needs confirmation');
      expect(profileHtml).toContain('Information not available');

      // ComparePage distinguishes undefined daycare/meals/outdoorPlay on sch-002
      const compareHtml = renderWithProviders(
        <ComparePage />,
        '/compare',
        {
          fms_comparison: JSON.stringify([sch002.id, pre003.id]),
        }
      );
      expect(compareHtml).toContain('Needs confirmation');
      expect(compareHtml).not.toContain('8:30 AM – 1:30 PM');
      expect(compareHtml).not.toContain('Counseling &amp; guidance');
    });
  });

  describe('5. Preservation of search, filtering, and deterministic scoring', () => {
    it('continues filtering and scoring schools and preschools accurately', async () => {
      const searchRes = await schoolService.search({
        filters: {
          ...DEFAULT_FILTERS,
          educationTarget: 'preschool',
          budgetMax: 150000,
        },
      });
      expect(searchRes.status).toBe('success');
      expect(searchRes.data.schools.length).toBeGreaterThan(0);

      const score = calculateSchoolFitScore(pre001, {
        ...DEFAULT_FILTERS,
        educationTarget: 'preschool',
        budgetMax: 150000,
      });
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThanOrEqual(100);
    });
  });
});
