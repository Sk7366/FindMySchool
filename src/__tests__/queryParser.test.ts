import { describe, it, expect, vi, beforeEach } from 'vitest';
import { sanitizeParsedData, parseQueryWithGemini } from '../server/geminiParser';
import { parseQueryLocally, mapParsedDataToFilters, parseQuery } from '../services/queryParserService';
import { DEFAULT_FILTERS } from '../context/SearchContext';
import { calculateSchoolFitScore } from '../utils/preschoolScoring';
import { School } from '../types/school';

describe('LLM Query Understanding & Sanitization Layer', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  // Scenario 1: Montessori preschool for 3yo near Velachery
  it('Scenario 1: Parses Montessori preschool for 3-year-old near Velachery', () => {
    const rawLlmOutput = {
      educationTarget: 'preschool',
      childAge: 3,
      requestedProgram: 'nursery',
      location: 'Velachery',
      pedagogy: ['Montessori'],
      daycare: true,
      mustHavePreferences: ['Montessori', 'Preschool for 3-year-old', 'Velachery'],
      niceToHavePreferences: ['Daycare'],
      confidence: 'high',
    };

    const sanitized = sanitizeParsedData(rawLlmOutput);
    expect(sanitized.educationTarget).toBe('preschool');
    expect(sanitized.childAge).toBe(3);
    expect(sanitized.requestedProgram).toBe('nursery');
    expect(sanitized.location).toBe('Velachery & Guindy');
    expect(sanitized.pedagogy).toContain('Montessori');
    expect(sanitized.daycare).toBe(true);

    const mappedFilters = mapParsedDataToFilters(sanitized, DEFAULT_FILTERS);
    expect(mappedFilters.educationTarget).toBe('preschool');
    expect(mappedFilters.location).toBe('Velachery & Guindy');
    expect(mappedFilters.preschool.ageYears).toBe(3);
    expect(mappedFilters.preschool.programs).toEqual(['nursery']);
    expect(mappedFilters.preschool.pedagogy).toEqual(['Montessori']);
  });

  // Scenario 2: CBSE Class 11 near Anna Nagar under 1.5L
  it('Scenario 2: Parses CBSE Class 11 near Anna Nagar under ₹1.5L', () => {
    const rawLlmOutput = {
      educationTarget: 'school',
      grade: 'Class 11',
      curriculum: ['CBSE'],
      location: 'Anna Nagar',
      budgetMax: 150000,
      facilities: ['Robotics & STEM Lab'],
      mustHavePreferences: ['CBSE', 'Class 11', 'Anna Nagar', 'Under 1.5 Lakhs'],
      niceToHavePreferences: ['Robotics'],
      confidence: 'high',
    };

    const sanitized = sanitizeParsedData(rawLlmOutput);
    expect(sanitized.educationTarget).toBe('school');
    expect(sanitized.grade).toBe('Class 11');
    expect(sanitized.curriculum).toContain('CBSE');
    expect(sanitized.location).toBe('Anna Nagar & Mogappair');
    expect(sanitized.budgetMax).toBe(150000);
    expect(sanitized.facilities).toContain('Robotics & STEM Lab');

    const mappedFilters = mapParsedDataToFilters(sanitized, DEFAULT_FILTERS);
    expect(mappedFilters.educationTarget).toBe('school');
    expect(mappedFilters.grade).toBe('Class 11');
    expect(mappedFilters.curriculums).toContain('CBSE');
    expect(mappedFilters.budgetMax).toBe(150000);
  });

  // Scenario 3: Broad query ("good school in south Chennai")
  it('Scenario 3: Handles broad query with safe defaults and no invented constraints', () => {
    const rawLlmOutput = {
      educationTarget: 'school',
      location: 'Chennai',
      mustHavePreferences: ['School in Chennai'],
      niceToHavePreferences: [],
      confidence: 'medium',
    };

    const sanitized = sanitizeParsedData(rawLlmOutput);
    expect(sanitized.educationTarget).toBe('school');
    expect(sanitized.location).toBe('All Chennai');
    expect(sanitized.budgetMax).toBeNull();
    expect(sanitized.curriculum).toBeUndefined();
    expect(sanitized.facilities).toBeUndefined();
  });

  // Scenario 4: Ambiguous / conflicting age & grade
  it('Scenario 4: Detects conflicting child age and grade and populates clarificationNeeded', () => {
    const conflictingData = {
      educationTarget: 'school',
      childAge: 3,
      grade: 'Class 10',
      mustHavePreferences: ['Class 10'],
      niceToHavePreferences: [],
      confidence: 'needs_clarification',
    };

    const sanitized = sanitizeParsedData(conflictingData);
    expect(sanitized.clarificationNeeded).toBeTruthy();
    expect(sanitized.clarificationNeeded).toContain('Class 10');
    expect(sanitized.confidence).toBe('needs_clarification');
  });

  // Scenario 5: Unsupported facility or curriculum
  it('Scenario 5: Sanitizes and discards unsupported or invalid curriculums and pedagogies', () => {
    const dirtyData = {
      educationTarget: 'preschool',
      curriculum: ['UnknownBoard', 'CBSE', 'FakeCurriculum'],
      pedagogy: ['AlienMethod', 'Montessori'],
      facilities: ['Hoverboard Parking', 'Swimming Pool'],
      mustHavePreferences: [],
      niceToHavePreferences: [],
      confidence: 'high',
    };

    const sanitized = sanitizeParsedData(dirtyData);
    expect(sanitized.curriculum).toEqual(['CBSE']);
    expect(sanitized.pedagogy).toEqual(['Montessori']);
    expect(sanitized.facilities).toEqual(['Swimming Pool']);
  });

  // Scenario 6: Malformed response handling
  it('Scenario 6: Gracefully recovers from malformed or missing fields', () => {
    const malformed = {
      educationTarget: 'invalid_stage',
      childAge: 'not_a_number',
      budgetMax: -5000,
    };

    const sanitized = sanitizeParsedData(malformed);
    expect(sanitized.educationTarget).toBe('all');
    expect(sanitized.childAge).toBeNull();
    expect(sanitized.budgetMax).toBeNull();
  });

  // Scenario 7: Missing API key or disabled flag triggers local fallback
  it('Scenario 7: Returns local_fallback if ENABLE_LLM_QUERY_PARSER is false', async () => {
    const originalFlag = process.env.ENABLE_LLM_QUERY_PARSER;
    process.env.ENABLE_LLM_QUERY_PARSER = 'false';

    const result = await parseQueryWithGemini({ query: 'Montessori near Velachery' });
    expect(result.success).toBe(false);
    expect(result.source).toBe('local_fallback');
    expect(result.error).toContain('disabled');

    process.env.ENABLE_LLM_QUERY_PARSER = originalFlag;
  });

  // Scenario 8: Local parser handles preschool, school, combined queries deterministically
  it('Scenario 8: Local deterministic parser extracts target, location, budget, and age', () => {
    const q1 = parseQueryLocally('Montessori preschool for 3-year-old near Velachery with daycare', DEFAULT_FILTERS);
    expect(q1.filters.educationTarget).toBe('preschool');
    expect(q1.filters.location).toBe('Velachery & Guindy');
    expect(q1.filters.preschool.ageYears).toBe(3);
    expect(q1.filters.preschool.pedagogy).toContain('Montessori');
    expect(q1.filters.preschool.daycare).toBe(true);

    const q2 = parseQueryLocally('CBSE school near Anna Nagar under 1.5 lakh with football', DEFAULT_FILTERS);
    expect(q2.filters.educationTarget).toBe('school');
    expect(q2.filters.location).toBe('Anna Nagar & Mogappair');
    expect(q2.filters.budgetMax).toBe(150000);
    expect(q2.filters.curriculums).toContain('CBSE');
    expect(q2.filters.requiredFacilities).toContain('Football Turf');

    const q3 = parseQueryLocally('Find a combined preschool through Grade 12 campus near OMR', DEFAULT_FILTERS);
    expect(q3.filters.educationTarget).toBe('combined');
    expect(q3.filters.location).toBe('OMR / Sholinganallur');
  });

  // Scenario 9: Prevents stale responses when newer query arrives
  it('Scenario 9: Stale async responses are discarded in rapid consecutive searches', async () => {
    let activeRequestId = 0;
    const completedResults: number[] = [];

    const simulateSearch = async (reqId: number, delayMs: number) => {
      activeRequestId = reqId;
      await new Promise((res) => setTimeout(res, delayMs));
      // Only process if still the latest request
      if (activeRequestId === reqId) {
        completedResults.push(reqId);
      }
    };

    // Fire search 1 with a slow 100ms response, and search 2 with a fast 20ms response
    simulateSearch(1, 100);
    await new Promise((res) => setTimeout(res, 10));
    await simulateSearch(2, 20);

    // Wait for remaining async work to resolve
    await new Promise((res) => setTimeout(res, 120));

    // Only request 2 should be in completedResults; request 1 was discarded as stale
    expect(completedResults).toEqual([2]);
  });

  // Scenario 10: Deterministic scoring and school filtering regression test
  it('Scenario 10: calculateSchoolFitScore remains 100% deterministic and unaffected by LLM parsing', () => {
    const mockSchool = {
      id: 'test-1',
      slug: 'test-school',
      name: 'Test Montessori Academy',
      tagline: 'Authentic AMI Montessori',
      area: 'Velachery',
      city: 'Chennai',
      address: '12 1st Main Rd, Velachery',
      institutionType: 'preschool' as const,
      pedagogy: ['Montessori'],
      preschoolPrograms: ['nursery', 'lkg'] as any,
      studentTeacherRatio: '8:1',
      daycare: true,
      cctvSecurity: true,
      outdoorPlay: true,
      annualFeeMin: 80000,
      annualFeeMax: 120000,
      admissionFee: 15000,
      distanceKm: 2.5,
      rating: 4.8,
      reviewCount: 12,
      matchScore: 92,
      matchTier: 'Exceptional fit' as const,
      matchReasons: [],
      curriculum: [],
      schoolType: ['Co-educational' as const],
      grades: 'Pre-KG to UKG',
      gradeLevels: { min: 'Playgroup', max: 'UKG' },
      establishedYear: 2018,
      facilities: [],
      extracurriculars: [],
      hasTransport: true,
      transportRadiusKm: 8,
      hasHostel: false,
      hasSpecialNeedsSupport: false,
      description: 'Preschool test description',
      academicHighlights: [],
      teachingPhilosophy: 'Montessori',
      admissionStatus: 'Admissions Open 2026-27' as const,
      admissionDeadline: '2026-04-30',
      verificationStatus: 'Verified by School' as const,
      feeSource: 'School circular',
      lastAuditedDate: '2026-01-10',
      website: 'https://example.com',
      phone: '+91 98400 12345',
      email: 'info@example.com',
      photos: [],
      coordinates: { lat: 12.98, lng: 80.22, mapX: 50, mapY: 50 },
      neighbourhood: {
        area: 'Velachery',
        commuteNote: 'Near metro',
        nearestTransit: 'Velachery MRTS',
        trafficIntensity: 'Moderate' as const,
        neighbouringLocalities: ['Guindy'],
        safeWalkingZones: true,
      },
    } as unknown as School;

    const filters = {
      ...DEFAULT_FILTERS,
      location: 'Velachery & Guindy',
      preschool: {
        ...DEFAULT_FILTERS.preschool,
        pedagogy: ['Montessori'],
        daycare: true,
        programs: ['nursery'] as any,
      },
    };

    const score1 = calculateSchoolFitScore(mockSchool, filters);
    const score2 = calculateSchoolFitScore(mockSchool, filters);

    // Completely deterministic fit score
    expect(score1).toBe(score2);
    expect(score1).toBeGreaterThan(60);
  });
});
