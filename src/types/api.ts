import { School, Facility, NeighbourhoodContext, Curriculum, SchoolType, PreschoolProgram, MatchReason } from './school';
import { SearchFilters, SearchPriorityWeights, SortField, EducationTargetType } from './search';

/**
 * Standard unified API response wrapper
 */
export interface ApiResponse<T> {
  data: T;
  meta?: {
    total?: number;
    page?: number;
    pageSize?: number;
    totalPages?: number;
    executionTimeMs?: number;
    filtersApplied?: Partial<SearchFilters>;
    [key: string]: any;
  };
  error?: string | null;
  status: 'success' | 'error';
}

/**
 * Standard API error structure
 */
export interface ApiErrorPayload {
  message: string;
  code?: string;
  statusCode?: number;
  details?: Record<string, any>;
}

// ==========================================
// 1. GET /schools
// ==========================================
export interface GetSchoolsParams {
  page?: number;
  pageSize?: number;
  target?: EducationTargetType;
  area?: string;
  curriculum?: Curriculum;
  pedagogy?: string;
  minBudget?: number;
  maxBudget?: number;
  grade?: string;
  sort?: SortField;
  q?: string;
}

export type GetSchoolsResponse = ApiResponse<School[]>;

// ==========================================
// 2. GET /schools/:id
// ==========================================
export interface GetSchoolByIdParams {
  idOrSlug: string;
}

export type GetSchoolByIdResponse = ApiResponse<School>;

// ==========================================
// 3. POST /search
// ==========================================
export interface SearchRequest {
  query?: string;
  filters?: Partial<SearchFilters>;
  sortBy?: SortField;
  page?: number;
  pageSize?: number;
}

export interface SearchResultData {
  schools: School[];
  totalMatches: number;
  understoodConcepts?: Array<{ id: string; label: string; color: string }>;
  filtersApplied: SearchFilters;
}

export type SearchResponse = ApiResponse<SearchResultData>;

// ==========================================
// 4. POST /match
// ==========================================
export interface MatchRequest {
  schoolIds: string[];
  filters: SearchFilters;
  weights?: SearchPriorityWeights;
}

export interface SchoolMatchResult {
  schoolId: string;
  score: number;
  tier: string;
  reasons: MatchReason[];
}

export interface MatchResultData {
  matches: SchoolMatchResult[];
  evaluatedCount: number;
}

export type MatchResponse = ApiResponse<MatchResultData>;

// ==========================================
// 5. GET /areas
// ==========================================
export interface ChennaiNeighbourhood {
  name: string;
  count: number;
  description: string;
  popularFor: string[];
}

export type GetAreasResponse = ApiResponse<ChennaiNeighbourhood[]>;

// ==========================================
// 6. GET /facilities
// ==========================================
export interface FacilitySummary {
  name: string;
  category: Facility['category'];
  iconName: string;
  count: number;
}

export type GetFacilitiesResponse = ApiResponse<FacilitySummary[]>;
