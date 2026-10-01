export type Curriculum = 'CBSE' | 'ICSE' | 'Cambridge (IGCSE)' | 'IB World' | 'State Board';

export type EducationStage =
  | 'playgroup'
  | 'preschool'
  | 'nursery'
  | 'lkg'
  | 'ukg'
  | 'primary'
  | 'middle'
  | 'secondary'
  | 'senior_secondary';

export type PreschoolProgram = 'playgroup' | 'nursery' | 'lkg' | 'ukg';

export type InstitutionType = 'school' | 'preschool' | 'combined';

export interface PreschoolProgramDetail {
  program: PreschoolProgram;
  displayName: string;
  ageRange: string;
  timings: string;
  monthlyFee?: number;
  annualFee?: number;
  ratio: string;
}

export type SchoolType = 'Co-educational' | 'All-Girls' | 'All-Boys' | 'Day School' | 'Day Boarding' | 'Residential';

export type VerificationStatus = 'Verified by School' | 'Parent Audited' | 'Awaiting 2026 Confirmation' | 'Demo Data';

export type DataStatus =
  | 'verified'
  | 'partially_verified'
  | 'self_reported'
  | 'demo'
  | 'needs_confirmation';

export type MatchSourceType = 'preference' | 'verified_fact' | 'needs_confirmation';

export interface FeeItem {
  title: string;
  amount: number;
  period: 'Annual' | 'One-Time' | 'Optional' | 'Monthly';
  isEstimate?: boolean;
  notes?: string;
}

export interface MatchReason {
  id: string;
  type: 'positive' | 'partial' | 'unverified';
  sourceType?: MatchSourceType;
  title: string;
  description: string;
  matchedCriteria: 'budget' | 'distance' | 'curriculum' | 'facility' | 'activity' | 'philosophy' | 'transport';
  confirmationAction?: string;
}

export interface Facility {
  id: string;
  name: string;
  category: 'Sports' | 'STEM & Tech' | 'Arts & Culture' | 'Wellness & Care' | 'Infrastructure';
  available: boolean;
  highlight?: string;
  iconName: string;
}

export interface SchoolReview {
  id: string;
  parentName: string;
  parentGrade: string;
  rating: number;
  verifiedParent: boolean;
  comment: string;
  date: string;
  aspects: {
    academics: number;
    teachers: number;
    sports: number;
    infrastructure: number;
  };
}

export interface NeighbourhoodContext {
  area: string;
  commuteNote: string;
  nearestTransit: string;
  trafficIntensity: 'Low' | 'Moderate' | 'Heavy during peak hours';
  neighbouringLocalities: string[];
  safeWalkingZones: boolean;
}

export interface School {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  area: string;
  city: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
    mapX: number; // Percentage coordinate for mock map visual
    mapY: number;
  };
  curriculum: Curriculum[];
  schoolType: SchoolType[];
  grades: string;
  gradeLevels: {
    min: string;
    max: string;
  };
  establishedYear: number;
  studentTeacherRatio: string;
  annualFeeMin: number;
  annualFeeMax: number;
  admissionFee: number;
  transportFeeMin?: number;
  transportFeeMax?: number;
  rating: number;
  reviewCount: number;
  distanceKm: number; // Relative to default search location (e.g., Tambaram / Chennai centre)
  matchScore: number; // 0 - 100
  matchTier: 'Exceptional fit' | 'Strong match' | 'Moderate match' | 'Partial fit';
  matchReasons: MatchReason[];
  facilities: Facility[];
  extracurriculars: string[];
  hasTransport: boolean;
  transportRadiusKm: number;
  hasHostel: boolean;
  hasSpecialNeedsSupport: boolean;
  specialNeedsDescription?: string;
  description: string;
  academicHighlights: string[];
  teachingPhilosophy: string;
  admissionStatus: 'Admissions Open 2026-27' | 'Applications Closed' | 'Waitlist Only' | 'Upcoming Cycle';
  admissionDeadline: string;
  verificationStatus: VerificationStatus;
  dataStatus?: DataStatus;
  lastVerifiedAt?: string;
  verificationSources?: string[];
  feeSource: string;
  lastAuditedDate: string;
  website: string;
  phone: string;
  email: string;
  photos: {
    url: string;
    caption: string;
    category: 'Campus' | 'Labs' | 'Sports' | 'Classrooms';
  }[];
  neighbourhood: NeighbourhoodContext;

  // Preschool & Early Years extensions (optional to maintain full backward compatibility)
  institutionType?: InstitutionType;
  educationStages?: EducationStage[];
  ageRange?: {
    min: number;
    max: number;
  };
  preschoolPrograms?: PreschoolProgram[];
  preschoolProgramDetails?: PreschoolProgramDetail[];
  pedagogy?: string[];
  daycare?: boolean;
  extendedHours?: boolean;
  meals?: boolean;
  outdoorPlay?: boolean;
  indoorPlay?: boolean;
  cctvSecurity?: boolean;
  medicalFirstAid?: boolean;
  timings?: string;
  monthlyFeeMin?: number;
  monthlyFeeMax?: number;
  languages?: string[];
  childToCaregiverRatio?: string;
  pottyTrainingRequired?: boolean;
}
