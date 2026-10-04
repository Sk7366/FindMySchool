import { School } from '../types/school';
import {
  ApiResponse,
  GetSchoolsParams,
  GetSchoolsResponse,
  GetSchoolByIdResponse,
  SearchRequest,
  SearchResponse,
  MatchRequest,
  MatchResponse,
  GetAreasResponse,
  GetFacilitiesResponse,
  ChennaiNeighbourhood,
  FacilitySummary,
} from '../types/api';
import { CHENNAI_SCHOOLS, CHENNAI_NEIGHBOURHOODS } from '../data/schools';
import { calculateSchoolFitScore } from '../utils/preschoolScoring';
import { apiClient } from './apiClient';
import { SearchFilters, EducationTargetType } from '../types/search';

export interface ISchoolService {
  getSchools(params?: GetSchoolsParams): Promise<GetSchoolsResponse>;
  getById(idOrSlug: string): Promise<GetSchoolByIdResponse>;
  search(request: SearchRequest): Promise<SearchResponse>;
  match(request: MatchRequest): Promise<MatchResponse>;
  compare(schoolIds: string[]): Promise<ApiResponse<School[]>>;
  getAreas(): Promise<GetAreasResponse>;
  getFacilities(): Promise<GetFacilitiesResponse>;

  // Synchronous convenience helpers for fast in-memory lookups
  getSchoolsSync(params?: GetSchoolsParams): School[];
  getByIdSync(idOrSlug: string): School | undefined;
  compareSync(schoolIds: string[]): School[];
  getAreasSync(): ChennaiNeighbourhood[];
}

/**
 * Filter mock schools in-memory
 */
function filterMockSchools(schools: School[], params?: GetSchoolsParams): School[] {
  if (!params) return schools;

  return schools.filter((school) => {
    // Target filter
    if (params.target && params.target !== 'all') {
      const isPreschool = school.institutionType === 'preschool';
      const isCombined = school.institutionType === 'combined';
      const isSchool = !school.institutionType || school.institutionType === 'school';

      if (params.target === 'preschool' && !isPreschool && !isCombined) return false;
      if (params.target === 'school' && !isSchool && !isCombined) return false;
      if (params.target === 'combined' && !isCombined) return false;
    }

    // Area filter
    if (params.area && params.area !== 'All Chennai') {
      const areaLower = params.area.toLowerCase();
      const schoolArea = (school.area + ' ' + (school.neighbourhood?.area || '')).toLowerCase();
      if (!schoolArea.includes(areaLower.split(' ')[0])) {
        if (school.distanceKm > 12) return false;
      }
    }

    // Curriculum
    if (params.curriculum) {
      if (!school.curriculum?.includes(params.curriculum)) return false;
    }

    // Pedagogy
    if (params.pedagogy) {
      if (!school.pedagogy?.includes(params.pedagogy)) return false;
    }

    // Budget
    if (params.maxBudget && school.annualFeeMin && school.annualFeeMin > params.maxBudget) {
      return false;
    }

    // Query text match
    if (params.q && params.q.trim()) {
      const q = params.q.toLowerCase().trim();
      const matchText = `${school.name} ${school.area} ${school.tagline} ${school.curriculum?.join(' ')} ${school.pedagogy?.join(' ')}`.toLowerCase();
      if (!matchText.includes(q)) return false;
    }

    return true;
  });
}

/**
 * MOCK IMPLEMENTATION (Active when VITE_USE_MOCK !== 'false')
 */
class MockSchoolService implements ISchoolService {
  async getSchools(params?: GetSchoolsParams): Promise<GetSchoolsResponse> {
    // Simulate brief network latency (30ms)
    await new Promise((r) => setTimeout(r, 30));
    const filtered = filterMockSchools(CHENNAI_SCHOOLS, params);

    return {
      status: 'success',
      data: filtered,
      meta: {
        total: filtered.length,
        page: params?.page || 1,
        pageSize: params?.pageSize || filtered.length,
      },
    };
  }

  async getById(idOrSlug: string): Promise<GetSchoolByIdResponse> {
    await new Promise((r) => setTimeout(r, 40));
    const target = idOrSlug.toLowerCase();
    const found = CHENNAI_SCHOOLS.find((s) => s.id === idOrSlug || s.slug.toLowerCase() === target);

    if (!found) {
      return {
        status: 'error',
        data: null as any,
        error: `Institution with identifier '${idOrSlug}' not found.`,
      };
    }

    return {
      status: 'success',
      data: found,
    };
  }

  async search(request: SearchRequest): Promise<SearchResponse> {
    await new Promise((r) => setTimeout(r, 50));
    const { filters = {}, sortBy = 'best_match' } = request;

    // Apply fit scoring and filters
    const scoredSchools = CHENNAI_SCHOOLS.map((school) => {
      const score = calculateSchoolFitScore(school, filters as SearchFilters);
      return {
        ...school,
        matchScore: score,
      };
    });

    const filtered = filterMockSchools(scoredSchools, {
      target: filters.educationTarget,
      area: filters.location,
      maxBudget: filters.budgetMax,
      q: request.query,
    });

    // Sort
    if (sortBy === 'best_match') {
      filtered.sort((a, b) => b.matchScore - a.matchScore);
    } else if (sortBy === 'distance_asc') {
      filtered.sort((a, b) => a.distanceKm - b.distanceKm);
    } else if (sortBy === 'fee_asc') {
      filtered.sort((a, b) => (a.annualFeeMin || 0) - (b.annualFeeMin || 0));
    } else if (sortBy === 'fee_desc') {
      filtered.sort((a, b) => (b.annualFeeMax || 0) - (a.annualFeeMax || 0));
    } else if (sortBy === 'rating_desc') {
      filtered.sort((a, b) => b.rating - a.rating);
    }

    return {
      status: 'success',
      data: {
        schools: filtered,
        totalMatches: filtered.length,
        filtersApplied: filters as SearchFilters,
      },
      meta: {
        total: filtered.length,
        executionTimeMs: 12,
      },
    };
  }

  async match(request: MatchRequest): Promise<MatchResponse> {
    await new Promise((r) => setTimeout(r, 40));
    const { schoolIds, filters, weights } = request;
    const targetSchools = CHENNAI_SCHOOLS.filter((s) => schoolIds.includes(s.id));

    const effectiveFilters: SearchFilters = weights ? { ...filters, weights } : filters;

    const matches = targetSchools.map((school) => {
      const score = calculateSchoolFitScore(school, effectiveFilters);
      const tier = score >= 90 ? 'Strong fit' : score >= 75 ? 'Good match' : score >= 60 ? 'Moderate fit' : 'Partial fit';
      return {
        schoolId: school.id,
        score,
        tier,
        reasons: school.matchReasons || [],
      };
    });

    return {
      status: 'success',
      data: {
        matches,
        evaluatedCount: matches.length,
      },
    };
  }

  async compare(schoolIds: string[]): Promise<ApiResponse<School[]>> {
    await new Promise((r) => setTimeout(r, 30));
    const matched = CHENNAI_SCHOOLS.filter((s) => schoolIds.includes(s.id));
    return {
      status: 'success',
      data: matched,
      meta: { total: matched.length },
    };
  }

  async getAreas(): Promise<GetAreasResponse> {
    return {
      status: 'success',
      data: CHENNAI_NEIGHBOURHOODS,
      meta: { total: CHENNAI_NEIGHBOURHOODS.length },
    };
  }

  async getFacilities(): Promise<GetFacilitiesResponse> {
    const facilityCounts: Record<string, { count: number; category: any; iconName: string }> = {};

    CHENNAI_SCHOOLS.forEach((s) => {
      (s.facilities || []).forEach((f) => {
        if (!facilityCounts[f.name]) {
          facilityCounts[f.name] = { count: 0, category: f.category, iconName: f.iconName };
        }
        facilityCounts[f.name].count++;
      });
    });

    const list: FacilitySummary[] = Object.entries(facilityCounts).map(([name, item]) => ({
      name,
      category: item.category,
      iconName: item.iconName,
      count: item.count,
    }));

    return {
      status: 'success',
      data: list,
      meta: { total: list.length },
    };
  }

  // Synchronous convenience helpers
  getSchoolsSync(params?: GetSchoolsParams): School[] {
    return filterMockSchools(CHENNAI_SCHOOLS, params);
  }

  getByIdSync(idOrSlug: string): School | undefined {
    const target = idOrSlug.toLowerCase();
    return CHENNAI_SCHOOLS.find((s) => s.id === idOrSlug || s.slug.toLowerCase() === target);
  }

  compareSync(schoolIds: string[]): School[] {
    return CHENNAI_SCHOOLS.filter((s) => schoolIds.includes(s.id));
  }

  getAreasSync(): ChennaiNeighbourhood[] {
    return CHENNAI_NEIGHBOURHOODS;
  }
}

/**
 * REAL BACKEND IMPLEMENTATION (Structurally ready when VITE_USE_MOCK === 'false')
 */
class RealSchoolService implements ISchoolService {
  async getSchools(params?: GetSchoolsParams): Promise<GetSchoolsResponse> {
    return apiClient.get<School[]>('/schools', params);
  }

  async getById(idOrSlug: string): Promise<GetSchoolByIdResponse> {
    return apiClient.get<School>(`/schools/${encodeURIComponent(idOrSlug)}`);
  }

  async search(request: SearchRequest): Promise<SearchResponse> {
    return apiClient.post<SearchResponse['data']>('/search', request);
  }

  async match(request: MatchRequest): Promise<MatchResponse> {
    return apiClient.post<MatchResponse['data']>('/match', request);
  }

  async compare(schoolIds: string[]): Promise<ApiResponse<School[]>> {
    return apiClient.get<School[]>('/schools/compare', { ids: schoolIds.join(',') });
  }

  async getAreas(): Promise<GetAreasResponse> {
    return apiClient.get<ChennaiNeighbourhood[]>('/areas');
  }

  async getFacilities(): Promise<GetFacilitiesResponse> {
    return apiClient.get<FacilitySummary[]>('/facilities');
  }

  // Fallbacks for synchronous access if called in real mode
  getSchoolsSync(params?: GetSchoolsParams): School[] {
    return filterMockSchools(CHENNAI_SCHOOLS, params);
  }

  getByIdSync(idOrSlug: string): School | undefined {
    const target = idOrSlug.toLowerCase();
    return CHENNAI_SCHOOLS.find((s) => s.id === idOrSlug || s.slug.toLowerCase() === target);
  }

  compareSync(schoolIds: string[]): School[] {
    return CHENNAI_SCHOOLS.filter((s) => schoolIds.includes(s.id));
  }

  getAreasSync(): ChennaiNeighbourhood[] {
    return CHENNAI_NEIGHBOURHOODS;
  }
}

export const mockSchoolService = new MockSchoolService();
export const realSchoolService = new RealSchoolService();

// Determine service mode via VITE_USE_MOCK
const isMock = import.meta.env.VITE_USE_MOCK !== 'false';
export const schoolService: ISchoolService = isMock ? mockSchoolService : realSchoolService;
