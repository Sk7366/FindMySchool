import { describe, it, expect } from 'vitest';
import { calculateSchoolFitScore, checkGradeOfferings } from '../utils/preschoolScoring';
import { generateDynamicMatchReasons, formatMatchReason } from '../utils/matchProvenance';
import { getPrioritizedFacilities } from '../components/schools/SchoolCard';
import { CHENNAI_SCHOOLS } from '../data/schools';
import { CHENNAI_PRESCHOOLS } from '../data/preschools';
import { schoolService } from '../services/schoolService';
import { DEFAULT_FILTERS } from '../context/SearchContext';
import { School } from '../types/school';
import { SearchFilters } from '../types/search';

describe('Phase 1 Trust, Correctness & Data Integrity Suite', () => {
  const pre003 = CHENNAI_PRESCHOOLS.find((p) => p.id === 'pre-003')!;
  const sch001 = CHENNAI_SCHOOLS.find((s) => s.id === 'sch-001')!;
  const sch002 = CHENNAI_SCHOOLS.find((s) => s.id === 'sch-002')!;
  const sch003 = CHENNAI_SCHOOLS.find((s) => s.id === 'sch-003')!;

  // 1. P0: Facility Synthesis Prevention in SchoolCard
  describe('P0 Defect 1: No query-driven facility synthesis in SchoolCard', () => {
    it('does NOT synthesize Daycare, Extended Hours, or Montessori for pre-003 when query mentions them', () => {
      // pre-003 explicitly has daycare: false, extendedHours: false, pedagogy: ['Waldorf-inspired', 'Play-way']
      expect(pre003.daycare).toBe(false);
      expect(pre003.extendedHours).toBe(false);

      const query = 'montessori daycare extended hours play';
      const facilities = getPrioritizedFacilities(pre003, query);

      // Verify no synthetic facilities were injected
      const facilityIds = facilities.map((f) => f.id);
      expect(facilityIds).not.toContain('synth-daycare');
      expect(facilityIds).not.toContain('synth-ext-hours');
      expect(facilityIds).not.toContain('synth-montessori');
      expect(facilityIds).not.toContain('synth-outdoor');
      expect(facilityIds).not.toContain('pre-003-daycare');
      expect(facilityIds).not.toContain('pre-003-ext-hours');

      // None of the rendered facilities should claim Daycare
      const facilityNames = facilities.map((f) => f.name.toLowerCase());
      expect(facilityNames.some((n) => n.includes('daycare'))).toBe(false);
      expect(facilityNames.some((n) => n.includes('montessori'))).toBe(false);
    });

    it('renders real facilities defined in the school record', () => {
      const facilities = getPrioritizedFacilities(pre003, 'nature garden wood');
      expect(facilities.length).toBeGreaterThan(0);
      expect(facilities.every((f) => pre003.facilities.some((real) => real.id === f.id))).toBe(true);
    });
  });

  // 2. P0: Dynamic Match Explanations vs Static Hardcoded Strings
  describe('P0 Defect 2 & 3: Truthful, query-aware dynamic match explanations', () => {
    it('updates distance explanations dynamically based on active search radius', () => {
      // sch-001 distanceKm is 4.8 km
      const filtersNear: SearchFilters = { ...DEFAULT_FILTERS, radiusKm: 8 };
      const reasonsNear = generateDynamicMatchReasons(sch001, filtersNear);
      const distReasonNear = reasonsNear.find((r) => r.matchedCriteria === 'distance')!;

      expect(distReasonNear).toBeDefined();
      expect(distReasonNear.type).toBe('positive');
      expect(distReasonNear.title).toContain('Within your 8 km search radius');

      // Change search radius to 3 km (4.8 km exceeds 3 km)
      const filtersTight: SearchFilters = { ...DEFAULT_FILTERS, radiusKm: 3 };
      const reasonsTight = generateDynamicMatchReasons(sch001, filtersTight);
      const distReasonTight = reasonsTight.find((r) => r.matchedCriteria === 'distance')!;

      expect(distReasonTight).toBeDefined();
      expect(distReasonTight.type).toBe('partial');
      expect(distReasonTight.sourceType).toBe('needs_confirmation');
      expect(distReasonTight.title).toContain('exceeds 3 km radius');
    });

    it('updates budget explanations dynamically based on user budget threshold', () => {
      // sch-001 starting fee is 115000
      const filtersAdequate: SearchFilters = { ...DEFAULT_FILTERS, budgetMax: 150000 };
      const reasonsAdequate = generateDynamicMatchReasons(sch001, filtersAdequate);
      const feeReasonAdequate = reasonsAdequate.find((r) => r.matchedCriteria === 'budget')!;

      expect(feeReasonAdequate.type).toBe('positive');
      expect(feeReasonAdequate.title).toContain('fits your ₹1.5L annual budget');

      // User sets lower budget of 80000
      const filtersLow: SearchFilters = { ...DEFAULT_FILTERS, budgetMax: 80000 };
      const reasonsLow = generateDynamicMatchReasons(sch001, filtersLow);
      const feeReasonLow = reasonsLow.find((r) => r.matchedCriteria === 'budget')!;

      expect(feeReasonLow.type).toBe('partial');
      expect(feeReasonLow.title).toContain('exceeds ₹0.8L budget');
    });

    it('labels unverified program fees with confirmation advice rather than fabricating claims', () => {
      // sch-002 has institutionType 'combined' and offers LKG/UKG/Pre-KG, but preschoolProgramDetails is undefined
      const filters: SearchFilters = {
        ...DEFAULT_FILTERS,
        educationTarget: 'preschool',
        budgetMax: 100000,
        preschool: { ...DEFAULT_FILTERS.preschool, programs: ['nursery'] },
      };
      const reasons = generateDynamicMatchReasons(sch002, filters);
      const feeReason = reasons.find((r) => r.matchedCriteria === 'budget')!;

      expect(feeReason).toBeDefined();
      expect(feeReason.type).toBe('unverified');
      expect(feeReason.sourceType).toBe('needs_confirmation');
      expect(feeReason.confirmationAction).toBeDefined();

      const formatted = formatMatchReason(feeReason);
      expect(formatted.category).toBe('confirmation');
      expect(formatted.tag).toBe('Information requiring confirmation');
    });

    it('preserves demo-data labels without marking mock data as verified', () => {
      expect(sch001.verificationStatus).toBe('Demo Data');
      expect(sch001.dataStatus).toBe('demo');
      expect(pre003.verificationStatus).toBe('Demo Data');
      expect(pre003.dataStatus).toBe('demo');
    });
  });

  // 3. Scoring Fix 5: Grade Matching Checks Actual Offerings
  describe('Scoring Fix 5: Grade matching logic', () => {
    it('penalizes a standalone preschool when a K-12 grade (Class 11) is requested', () => {
      const filters: SearchFilters = {
        ...DEFAULT_FILTERS,
        educationTarget: 'school',
        grade: 'Class 11',
      };

      const gradeStatus = checkGradeOfferings(pre003, 'Class 11');
      expect(gradeStatus).toBe('mismatch');

      const score = calculateSchoolFitScore(pre003, filters);
      // Because Class 11 is a confirmed mismatch for pre-003, fit score must not be 95!
      expect(score).toBeLessThan(55);
    });

    it('distinguishes between confirmed match and confirmed mismatch in traditional schools', () => {
      // sch-003 offers LKG to Class 12 (Min: LKG)
      expect(checkGradeOfferings(sch003, 'LKG')).toBe('match');
      expect(checkGradeOfferings(sch003, 'Class 10')).toBe('match');
      expect(checkGradeOfferings(sch003, 'Pre-KG')).toBe('mismatch');
      expect(checkGradeOfferings(sch003, 'Playgroup')).toBe('mismatch');
    });
  });

  // 4. Scoring Fix 6: Elimination of the 55% score floor
  describe('Scoring Fix 6: Elimination of arbitrary 55% floor', () => {
    it('allows severe multi-constraint violations to drop well below 55%', () => {
      const severelyMismatchedFilters: SearchFilters = {
        ...DEFAULT_FILTERS,
        educationTarget: 'school',
        grade: 'Class 11',
        radiusKm: 2, // pre003 is 7.2 km away
        budgetMax: 20000, // fee is ~70k, over 3x budget
      };

      const score = calculateSchoolFitScore(pre003, severelyMismatchedFilters);
      // Previously, Math.max(55, score) would artificially elevate this to 55%
      expect(score).toBeLessThan(35);
      expect(score).toBeGreaterThanOrEqual(0);
    });

    it('awards strong scores (85-98) to institutions that legitimately meet criteria', () => {
      const matchingFilters: SearchFilters = {
        ...DEFAULT_FILTERS,
        educationTarget: 'preschool',
        radiusKm: 10,
        budgetMax: 100000,
        preschool: {
          ...DEFAULT_FILTERS.preschool,
          programs: ['nursery', 'lkg'],
          pedagogy: ['Montessori'],
        },
      };

      const pre001 = CHENNAI_PRESCHOOLS.find((p) => p.id === 'pre-001')!;
      const score = calculateSchoolFitScore(pre001, matchingFilters);
      expect(score).toBeGreaterThanOrEqual(85);
      expect(score).toBeLessThanOrEqual(98);
    });
  });

  // 5. Scoring Fix 7: Program-Aware Preschool Budget
  describe('Scoring Fix 7: Program-aware preschool budget evaluation', () => {
    it('uses the specific program fee rather than headline school fee for combined schools', () => {
      // sch-001 headline fee is 115k to 145k.
      // But its nursery preschool program fee is 105k!
      const budget110kFilters: SearchFilters = {
        ...DEFAULT_FILTERS,
        educationTarget: 'preschool',
        budgetMax: 110000,
        preschool: {
          ...DEFAULT_FILTERS.preschool,
          programs: ['nursery'],
        },
      };

      const score = calculateSchoolFitScore(sch001, budget110kFilters);
      // Because 105k <= 110k, it receives full budget fit score
      expect(score).toBeGreaterThan(80);

      const dynamicReasons = generateDynamicMatchReasons(sch001, budget110kFilters);
      const feeReason = dynamicReasons.find((r) => r.matchedCriteria === 'budget')!;
      expect(feeReason.type).toBe('positive');
      expect(feeReason.title).toContain('fits your ₹1.1L budget');
    });

    it('does not assume budget is met when preschool program fee is missing', () => {
      // sch-002 has no preschoolProgramDetails
      const budgetFilters: SearchFilters = {
        ...DEFAULT_FILTERS,
        educationTarget: 'preschool',
        budgetMax: 120000,
        preschool: {
          ...DEFAULT_FILTERS.preschool,
          programs: ['nursery'],
        },
      };

      const reasons = generateDynamicMatchReasons(sch002, budgetFilters);
      const feeReason = reasons.find((r) => r.matchedCriteria === 'budget')!;
      expect(feeReason.type).toBe('unverified');
    });
  });

  // 6. Data Integrity Fix 8: Discoverability of 9 Traditional Schools
  describe('Data Integrity Fix 8: Discoverability of 9 traditional schools in early-years searches', () => {
    const targetIds = [
      'sch-002',
      'sch-003',
      'sch-004',
      'sch-006',
      'sch-007',
      'sch-009',
      'sch-010',
      'sch-011',
      'sch-012',
    ];

    it('configures institutionType as combined and populates preschoolPrograms accurately', () => {
      for (const id of targetIds) {
        const school = CHENNAI_SCHOOLS.find((s) => s.id === id);
        expect(school).toBeDefined();
        expect(school!.institutionType).toBe('combined');
        expect(school!.preschoolPrograms).toBeDefined();
        expect(school!.preschoolPrograms!.length).toBeGreaterThan(0);

        // Bala Vidya Mandir (sch-003), Sankara (sch-006), and Vidya Mandir (sch-010) start from LKG
        if (id === 'sch-003' || id === 'sch-006' || id === 'sch-010') {
          expect(school!.preschoolPrograms).toEqual(['lkg', 'ukg']);
          expect(school!.preschoolPrograms).not.toContain('nursery');
        } else {
          expect(school!.preschoolPrograms).toEqual(['nursery', 'lkg', 'ukg']);
        }

        // None of them should have fabricated pedagogy, daycare, or ratios
        expect(school!.preschoolProgramDetails).toBeUndefined();
      }
    });

    it('makes combined schools discoverable when filtering for target preschool', async () => {
      const response = await schoolService.getSchools({ target: 'preschool' });
      expect(response.status).toBe('success');
      const returnedIds = response.data.map((s) => s.id);

      // Both standalone preschools and combined schools should be returned
      expect(returnedIds).toContain('pre-001');
      expect(returnedIds).toContain('sch-001'); // Shriram Millennium
      expect(returnedIds).toContain('sch-002'); // PSBB Millennium
      expect(returnedIds).toContain('sch-003'); // Bala Vidya Mandir
    });
  });

  // 7. Full Search Flow & Dynamic Explanations Integration
  describe('Search Service Integration', () => {
    it('returns dynamic, truthful match reasons on search() results', async () => {
      const searchRes = await schoolService.search({
        filters: {
          ...DEFAULT_FILTERS,
          location: 'Anna Nagar',
          radiusKm: 12,
          budgetMax: 150000,
        },
      });

      expect(searchRes.status).toBe('success');
      expect(searchRes.data.schools.length).toBeGreaterThan(0);

      const topSchool = searchRes.data.schools[0];
      expect(topSchool.matchReasons).toBeDefined();
      expect(topSchool.matchReasons.length).toBeGreaterThanOrEqual(2);

      // Verify reasons are dynamically computed and not the static "Within your 8 km commute zone" for every school
      const distReason = topSchool.matchReasons.find((r) => r.matchedCriteria === 'distance');
      if (distReason) {
        expect(distReason.title).toContain('12 km');
      }
    });
  });
});
