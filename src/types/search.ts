import { Curriculum, SchoolType } from './school';

export interface SearchFilters {
  location: string;
  radiusKm: number;
  grade: string;
  budgetMax: number;
  budgetMin: number;
  curriculums: Curriculum[];
  schoolTypes: SchoolType[];
  requiredFacilities: string[];
  requiredActivities: string[];
  requiresTransport: boolean;
  requiresHostel: boolean;
  requiresSpecialNeeds: boolean;
}

export type SortField = 'best_match' | 'distance_asc' | 'fee_asc' | 'fee_desc' | 'rating_desc';

export interface SearchState {
  rawQuery: string;
  filters: SearchFilters;
  sortBy: SortField;
}
