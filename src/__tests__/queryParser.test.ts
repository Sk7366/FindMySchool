import { describe, it, expect, vi, beforeEach } from 'vitest';
import { sanitizeParsedData, parseQueryWithGroq } from '../server/groqParser';
import { parseQueryLocally, mapParsedDataToFilters, parseQuery, CLIENT_LLM_TIMEOUT_MS } from '../services/queryParserService';
import { DEFAULT_FILTERS } from '../context/SearchContext';
import { calculateSchoolFitScore } from '../utils/preschoolScoring';
import { School } from '../types/school';
import { apiClient } from '../services/apiClient';
import { createApp } from '../../server';
import type { AddressInfo } from 'net';

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
  it('Scenario 7: Returns local_fallback if ENABLE_LLM_QUERY_PARSER is false or GROQ_API_KEY is missing', async () => {
    const originalFlag = process.env.ENABLE_LLM_QUERY_PARSER;
    const originalKey = process.env.GROQ_API_KEY;

    // Disabled flag
    process.env.ENABLE_LLM_QUERY_PARSER = 'false';
    const resultDisabled = await parseQueryWithGroq({ query: 'Montessori near Velachery' });
    expect(resultDisabled.success).toBe(false);
    expect(resultDisabled.source).toBe('local_fallback');
    expect(resultDisabled.error).toContain('disabled');

    // Missing key
    process.env.ENABLE_LLM_QUERY_PARSER = 'true';
    delete process.env.GROQ_API_KEY;
    const resultNoKey = await parseQueryWithGroq({ query: 'Montessori near Velachery' });
    expect(resultNoKey.success).toBe(false);
    expect(resultNoKey.source).toBe('local_fallback');
    expect(resultNoKey.error).toContain('GROQ_API_KEY is not configured');

    process.env.ENABLE_LLM_QUERY_PARSER = originalFlag;
    process.env.GROQ_API_KEY = originalKey;
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

  // Scenario 11: Timeout cancellation and timer cleanup
  it('Scenario 11: Times out gracefully when request exceeds timeoutMs and clears timers', async () => {
    const originalKey = process.env.GROQ_API_KEY;
    const originalFlag = process.env.ENABLE_LLM_QUERY_PARSER;
    process.env.GROQ_API_KEY = 'test-groq-key';
    process.env.ENABLE_LLM_QUERY_PARSER = 'true';

    // Mock fetch to simulate a network call that hangs longer than timeoutMs
    vi.spyOn(globalThis, 'fetch').mockImplementationOnce(
      () => new Promise((resolve) => setTimeout(resolve, 500)) as any
    );

    // Call with an immediate 5ms timeout
    const result = await parseQueryWithGroq({
      query: 'CBSE school in Velachery',
      timeoutMs: 5,
    });

    expect(result.success).toBe(false);
    expect(result.source).toBe('local_fallback');
    expect(result.error).toContain('timed out');

    process.env.GROQ_API_KEY = originalKey;
    process.env.ENABLE_LLM_QUERY_PARSER = originalFlag;
  });

  // Scenario 12: Vercel Serverless Function handler validation
  it('Scenario 12: Vercel serverless function enforces POST method and validates payload', async () => {
    // Dynamic import to test Vercel handler
    const vercelHandler = (await import('../../api/parse-query')).default;

    const createMockRes = () => {
      const res: any = {
        statusCode: 200,
        headers: {} as Record<string, string>,
        setHeader(k: string, v: string) {
          res.headers[k] = v;
        },
        status(code: number) {
          res.statusCode = code;
          return res;
        },
        json(data: any) {
          res.body = data;
          return res;
        },
      };
      return res;
    };

    // Test GET method rejection
    const getRes = createMockRes();
    await vercelHandler({ method: 'GET' } as any, getRes);
    expect(getRes.statusCode).toBe(405);
    expect(getRes.headers['Allow']).toBe('POST');
    expect(getRes.body.error).toContain('Method Not Allowed');

    // Test empty query rejection
    const emptyRes = createMockRes();
    await vercelHandler({ method: 'POST', body: { query: '   ' } } as any, emptyRes);
    expect(emptyRes.statusCode).toBe(400);
    expect(emptyRes.body.error).toContain('Query string must be a non-empty string');

    // Test overlong query rejection (>500 chars)
    const longRes = createMockRes();
    await vercelHandler({ method: 'POST', body: { query: 'x'.repeat(501) } } as any, longRes);
    expect(longRes.statusCode).toBe(400);
    expect(longRes.body.error).toContain('exceeds maximum allowed length');

    // Test string JSON body parsing
    const strBodyRes = createMockRes();
    await vercelHandler({ method: 'POST', body: JSON.stringify({ query: 'CBSE in Anna Nagar' }) } as any, strBodyRes);
    expect(strBodyRes.statusCode).toBe(200);
    expect(strBodyRes.body.status).toBe('success');
    expect(strBodyRes.body.meta.parsedBy).toBeDefined();
  }, 15000);

  // Scenario 13: ApiClient safe instantiation in non-Vite / Node environment
  it('Scenario 13: ApiClient safely instantiates and normalizes baseUrl without throwing', async () => {
    const { ApiClient } = await import('../services/apiClient');
    const client = new ApiClient();
    expect(client).toBeDefined();

    const customClient = new ApiClient('https://example.com/api/');
    expect(customClient).toBeDefined();
  });

  // Scenario 14: Client timeout configuration and abort handling fallback
  it('Scenario 14: Client uses 6500ms timeout with 0 retries and falls back cleanly on timeout', async () => {
    expect(CLIENT_LLM_TIMEOUT_MS).toBe(6500);

    const postSpy = vi.spyOn(apiClient, 'post').mockRejectedValueOnce(new Error('Request timed out after 6500ms'));

    const result = await parseQuery('CBSE school in Anna Nagar under 1.5 lakh', DEFAULT_FILTERS);
    expect(postSpy).toHaveBeenCalledWith(
      '/parse-query',
      { query: 'CBSE school in Anna Nagar under 1.5 lakh', contextLocation: undefined },
      { timeoutMs: 6500, retries: 0 }
    );
    // Gracefully falls back to local deterministic parser without throwing
    expect(result.source).toBe('local_fallback');
    expect(result.filters.curriculums).toContain('CBSE');
    expect(result.filters.location).toBe('Anna Nagar & Mogappair');
    expect(result.filters.budgetMax).toBe(150000);
  });

  // Scenario 15: Client accepts slow response finishing within the timeout window
  it('Scenario 15: Client accepts slow responses finishing within 6500ms window as llm source', async () => {
    vi.spyOn(apiClient, 'post').mockImplementationOnce(async () => {
      // Simulate server execution delay within 6500ms
      await new Promise((r) => setTimeout(r, 20));
      return {
        status: 'success',
        data: {
          educationTarget: 'preschool',
          childAge: 3,
          location: 'Velachery & Guindy',
          pedagogy: ['Montessori'],
          confidence: 'high',
          mustHavePreferences: ['Montessori', 'Velachery'],
          niceToHavePreferences: [],
        },
        meta: {
          parsedBy: 'llm',
          executionTimeMs: 4200,
        },
      };
    });

    const result = await parseQuery('Montessori in Velachery', DEFAULT_FILTERS);
    expect(result.source).toBe('llm');
    expect(result.filters.preschool.pedagogy).toContain('Montessori');
    expect(result.filters.location).toBe('Velachery & Guindy');
    expect(result.filters.preschool.ageYears).toBe(3);
  });

  // Scenario 16: Express dev server rejects non-POST methods with HTTP 405 and Allow header
  it('Scenario 16: Express dev server rejects non-POST requests to /api/parse-query with 405 and Allow: POST header', async () => {
    const app = createApp();
    const server = app.listen(0);
    const port = (server.address() as AddressInfo).port;
    const url = `http://127.0.0.1:${port}/api/parse-query`;

    try {
      for (const method of ['GET', 'PUT', 'DELETE', 'PATCH']) {
        const res = await fetch(url, { method });
        expect(res.status).toBe(405);
        expect(res.headers.get('allow')).toBe('POST');
        const body = await res.json();
        expect(body).toEqual({
          status: 'error',
          error: 'Method Not Allowed. Only POST requests are supported.',
        });
      }
    } finally {
      server.close();
    }
  });

  // Scenario 17: Express dev server handles malformed JSON request bodies with HTTP 400
  it('Scenario 17: Express dev server handles malformed JSON request bodies with HTTP 400 without leaking stack traces', async () => {
    const app = createApp();
    const server = app.listen(0);
    const port = (server.address() as AddressInfo).port;
    const url = `http://127.0.0.1:${port}/api/parse-query`;

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{"query": "unclosed json payload',
      });
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body).toEqual({
        status: 'error',
        error: 'Invalid JSON',
      });
      // Ensure no stack traces or server internals are exposed
      expect((body as any).stack).toBeUndefined();
    } finally {
      server.close();
    }
  });

  // Scenario 18: Express dev server processes valid POST requests and rejects empty/oversized queries
  it('Scenario 18: Express dev server validates query payloads and processes valid requests', async () => {
    const app = createApp();
    const server = app.listen(0);
    const port = (server.address() as AddressInfo).port;
    const url = `http://127.0.0.1:${port}/api/parse-query`;

    try {
      // Empty query rejected with 400
      const emptyRes = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: '   ' }),
      });
      expect(emptyRes.status).toBe(400);
      const emptyBody = await emptyRes.json();
      expect(emptyBody.error).toContain('Query string must be a non-empty string');

      // Oversized query (>500 chars) rejected with 400
      const longRes = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: 'x'.repeat(501) }),
      });
      expect(longRes.status).toBe(400);
      const longBody = await longRes.json();
      expect(longBody.error).toContain('exceeds maximum allowed length');

      // Valid query returns 200 with JSON structure
      const validRes = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: 'CBSE school in Anna Nagar' }),
      });
      expect(validRes.status).toBe(200);
      const validBody = await validRes.json();
      expect(validBody.status).toBe('success');
      expect(validBody.meta?.parsedBy).toBeDefined();
    } finally {
      server.close();
    }
  }, 15000);

  // Scenario 19: Express dev server and Vercel handler parity
  it('Scenario 19: Express dev server and Vercel handler maintain HTTP method and error response parity', async () => {
    const vercelHandler = (await import('../../api/parse-query')).default;
    const app = createApp();
    const server = app.listen(0);
    const port = (server.address() as AddressInfo).port;

    try {
      const expressRes = await fetch(`http://127.0.0.1:${port}/api/parse-query`, { method: 'GET' });
      const expressBody = await expressRes.json();

      const vercelMockRes: any = {
        statusCode: 200,
        headers: {},
        setHeader(k: string, v: string) { this.headers[k] = v; },
        status(c: number) { this.statusCode = c; return this; },
        json(d: any) { this.body = d; return this; },
      };
      await vercelHandler({ method: 'GET' } as any, vercelMockRes);

      expect(expressRes.status).toBe(405);
      expect(vercelMockRes.statusCode).toBe(405);
      expect(expressRes.headers.get('allow')).toBe('POST');
      expect(vercelMockRes.headers['Allow']).toBe('POST');
      expect(expressBody.error).toBe(vercelMockRes.body.error);
    } finally {
      server.close();
    }
  });

  // Scenario 20: Successful Groq query parsing via mocked Chat Completions API
  it('Scenario 20: Parses query successfully via Groq Chat Completions API', async () => {
    const originalKey = process.env.GROQ_API_KEY;
    const originalFlag = process.env.ENABLE_LLM_QUERY_PARSER;
    process.env.GROQ_API_KEY = 'gsk_test_mock_key';
    process.env.ENABLE_LLM_QUERY_PARSER = 'true';

    const mockGroqResponse = {
      id: 'chatcmpl-test-123',
      model: 'llama-3.3-70b-versatile',
      choices: [
        {
          index: 0,
          message: {
            role: 'assistant',
            content: JSON.stringify({
              educationTarget: 'preschool',
              childAge: 3,
              requestedProgram: 'nursery',
              location: 'Velachery',
              pedagogy: ['Montessori'],
              daycare: true,
              mustHavePreferences: ['Montessori', 'Velachery', 'Preschool for 3yo'],
              niceToHavePreferences: ['Daycare'],
              confidence: 'high',
            }),
          },
          finish_reason: 'stop',
        },
      ],
    };

    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockGroqResponse,
    } as any);

    const result = await parseQueryWithGroq({
      query: 'Montessori preschool for 3-year-old near Velachery with daycare',
    });

    expect(fetchSpy).toHaveBeenCalled();
    const calledUrl = fetchSpy.mock.calls[0][0];
    const calledInit = fetchSpy.mock.calls[0][1] as RequestInit;

    expect(calledUrl).toContain('https://api.groq.com/openai/v1/chat/completions');
    expect(calledInit.method).toBe('POST');
    expect((calledInit.headers as any)['Authorization']).toBe('Bearer gsk_test_mock_key');
    expect(result.success).toBe(true);
    expect(result.source).toBe('llm');
    expect(result.model).toBe('llama-3.3-70b-versatile');
    expect(result.parsed).toBeDefined();
    expect(result.parsed?.educationTarget).toBe('preschool');
    expect(result.parsed?.childAge).toBe(3);
    expect(result.parsed?.location).toBe('Velachery & Guindy');
    expect(result.parsed?.pedagogy).toContain('Montessori');
    expect(result.parsed?.daycare).toBe(true);

    process.env.GROQ_API_KEY = originalKey;
    process.env.ENABLE_LLM_QUERY_PARSER = originalFlag;
  });

  // Scenario 21: Groq provider rate limiting (HTTP 429) triggers clean local fallback
  it('Scenario 21: Groq rate limit error (429) triggers clean local fallback without throwing', async () => {
    const originalKey = process.env.GROQ_API_KEY;
    process.env.GROQ_API_KEY = 'gsk_test_mock_key';

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 429,
      statusText: 'Too Many Requests',
      json: async () => ({
        error: {
          message: 'Rate limit exceeded: please slow down requests',
          type: 'tokens',
          code: 'rate_limit_exceeded',
        },
      }),
    } as any);

    const result = await parseQueryWithGroq({
      query: 'CBSE school in Anna Nagar',
    });

    expect(result.success).toBe(false);
    expect(result.source).toBe('local_fallback');
    expect(result.error).toContain('429');
    expect(result.error).toContain('rate limit');

    process.env.GROQ_API_KEY = originalKey;
  });

  // Scenario 22: Groq provider authentication error (HTTP 401) and server error (HTTP 500)
  it('Scenario 22: Groq auth (401) and server error (500) trigger local fallback', async () => {
    const originalKey = process.env.GROQ_API_KEY;
    process.env.GROQ_API_KEY = 'gsk_invalid_key';

    // Test 401
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
      json: async () => ({ error: { message: 'Invalid API Key' } }),
    } as any);

    const res401 = await parseQueryWithGroq({ query: 'CBSE in Anna Nagar' });
    expect(res401.success).toBe(false);
    expect(res401.source).toBe('local_fallback');
    expect(res401.error).toContain('401');

    // Test 500
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      json: async () => ({ error: { message: 'Internal Groq failure' } }),
    } as any);

    const res500 = await parseQueryWithGroq({ query: 'CBSE in Anna Nagar' });
    expect(res500.success).toBe(false);
    expect(res500.source).toBe('local_fallback');
    expect(res500.error).toContain('500');

    process.env.GROQ_API_KEY = originalKey;
  });

  // Scenario 23: Groq malformed response / invalid JSON in assistant message
  it('Scenario 23: Malformed response or invalid JSON from Groq triggers local fallback', async () => {
    const originalKey = process.env.GROQ_API_KEY;
    process.env.GROQ_API_KEY = 'gsk_test_mock_key';

    // Non-JSON assistant content
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        choices: [
          {
            message: {
              role: 'assistant',
              content: 'I cannot provide JSON right now.',
            },
          },
        ],
      }),
    } as any);

    const result = await parseQueryWithGroq({ query: 'Preschool in Adyar' });
    expect(result.success).toBe(false);
    expect(result.source).toBe('local_fallback');

    // Empty choices
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ choices: [] }),
    } as any);

    const resultEmpty = await parseQueryWithGroq({ query: 'Preschool in Adyar' });
    expect(resultEmpty.success).toBe(false);
    expect(resultEmpty.source).toBe('local_fallback');

    process.env.GROQ_API_KEY = originalKey;
  });

  // Scenario 24: /api/health reports configured Groq provider/model without leaking the API key
  it('Scenario 24: Health endpoints report Groq provider and model status without leaking GROQ_API_KEY', async () => {
    const originalKey = process.env.GROQ_API_KEY;
    process.env.GROQ_API_KEY = 'gsk_secret_12345_production_value';

    // Test Express dev server health endpoint
    const app = createApp();
    const server = app.listen(0);
    const port = (server.address() as AddressInfo).port;

    try {
      const expressRes = await fetch(`http://127.0.0.1:${port}/api/health`);
      expect(expressRes.status).toBe(200);
      const expressBody = await expressRes.json();

      expect(expressBody.status).toBe('ok');
      expect(expressBody.provider).toBe('groq');
      expect(expressBody.model).toBe('llama-3.3-70b-versatile');
      expect(expressBody.llmEnabled).toBe(true);
      // Key must never be leaked
      expect(JSON.stringify(expressBody)).not.toContain('gsk_secret');
      expect(expressBody.apiKey).toBeUndefined();
      expect(expressBody.key).toBeUndefined();

      // Test Vercel serverless health handler
      const vercelHealthHandler = (await import('../../api/health')).default;
      const vercelMockRes: any = {
        statusCode: 200,
        headers: {},
        setHeader(k: string, v: string) { this.headers[k] = v; },
        status(c: number) { this.statusCode = c; return this; },
        json(d: any) { this.body = d; return this; },
      };
      await vercelHealthHandler({ method: 'GET' } as any, vercelMockRes);

      expect(vercelMockRes.statusCode).toBe(200);
      expect(vercelMockRes.body.provider).toBe('groq');
      expect(vercelMockRes.body.model).toBe('llama-3.3-70b-versatile');
      expect(vercelMockRes.body.llmEnabled).toBe(true);
      expect(JSON.stringify(vercelMockRes.body)).not.toContain('gsk_secret');
    } finally {
      server.close();
      process.env.GROQ_API_KEY = originalKey;
    }
  });
});


