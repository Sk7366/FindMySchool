import { Curriculum, SchoolType, EducationStage, PreschoolProgram, InstitutionType } from './school';

export type EducationTargetType = 'all' | 'preschool' | 'school' | 'combined';

export interface PreschoolFilters {
  programs: PreschoolProgram[];
  ageYears?: number; // e.g. 3 for "3-year-old"
  pedagogy: string[]; // e.g. 'Montessori', 'Play-way', 'Reggio Emilia', 'Waldorf-inspired', 'Activity-based'
  feeRange?: 'under_50k' | '50k_100k' | '100k_150k' | 'above_150k';
  daycare?: boolean;
  timing?: 'morning' | 'full_day' | 'extended';
  extendedHours?: boolean;
  meals?: boolean;
  transport?: boolean;
  cctvSecurity?: boolean;
  medicalFirstAid?: boolean;
  outdoorPlay?: boolean;
  indoorPlay?: boolean;
  languages?: string[];
}

export interface SearchPriorityWeights {
  distance: number;
  budget: number;
  curriculumOrPedagogy: number;
  programOrGrade: number;
  facilities: number;
  childcareOrCare: number;
}

export interface SearchFilters {
  // General
  location: string;
  radiusKm: number;
  budgetMax: number;
  budgetMin: number;
  educationTarget: EducationTargetType; // 'all' | 'preschool' | 'school' | 'combined'

  // K-12 specific
  grade: string;
  curriculums: Curriculum[];
  schoolTypes: SchoolType[];
  requiredFacilities: string[];
  requiredActivities: string[];
  requiresTransport: boolean;
  requiresHostel: boolean;
  requiresSpecialNeeds: boolean;

  // Preschool specific
  preschool: PreschoolFilters;

  // Configurable weights for priority tuning
  weights?: SearchPriorityWeights;
}

export type UpdateFiltersPayload = Partial<Omit<SearchFilters, 'preschool'>> & {
  preschool?: Partial<PreschoolFilters>;
};

export type SortField = 'best_match' | 'distance_asc' | 'fee_asc' | 'fee_desc' | 'rating_desc';

export interface SearchState {
  rawQuery: string;
  filters: SearchFilters;
  sortBy: SortField;
}
