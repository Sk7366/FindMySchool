import { School, PreschoolProgram } from '../types/school';
import { SearchFilters, SearchPriorityWeights } from '../types/search';

export const DEFAULT_PRESCHOOL_WEIGHTS: SearchPriorityWeights = {
  distance: 0.25,
  budget: 0.20,
  curriculumOrPedagogy: 0.15,
  programOrGrade: 0.20,
  facilities: 0.10,
  childcareOrCare: 0.10,
};

export const DEFAULT_SCHOOL_WEIGHTS: SearchPriorityWeights = {
  distance: 0.25,
  budget: 0.25,
  curriculumOrPedagogy: 0.25,
  programOrGrade: 0.10,
  facilities: 0.10,
  childcareOrCare: 0.05,
};

/**
 * Calculates a parent-friendly fit score (0-100) dynamically based on current user priorities
 */
export function calculateSchoolFitScore(school: School, filters: SearchFilters): number {
  const isPreschoolSearch = filters.educationTarget === 'preschool' || 
    (filters.preschool.programs && filters.preschool.programs.length > 0) ||
    Boolean(school.institutionType === 'preschool');

  const weights = filters.weights || (isPreschoolSearch ? DEFAULT_PRESCHOOL_WEIGHTS : DEFAULT_SCHOOL_WEIGHTS);

  // 1. Distance fit (0 to 1)
  let distanceScore = 1.0;
  if (filters.radiusKm > 0) {
    if (school.distanceKm <= filters.radiusKm) {
      // 1.0 down to 0.7 depending on closeness
      distanceScore = 1.0 - (school.distanceKm / (filters.radiusKm * 1.5)) * 0.3;
    } else {
      const overage = school.distanceKm - filters.radiusKm;
      distanceScore = Math.max(0.1, 0.7 - (overage / filters.radiusKm) * 0.6);
    }
  }

  // 2. Budget fit (0 to 1)
  let budgetScore = 1.0;
  if (filters.budgetMax > 0) {
    if (school.annualFeeMin <= filters.budgetMax) {
      budgetScore = 1.0;
    } else {
      const overageRatio = (school.annualFeeMin - filters.budgetMax) / filters.budgetMax;
      budgetScore = Math.max(0.2, 1.0 - overageRatio * 1.5);
    }
  }

  // 3. Program / Age / Grade fit (0 to 1)
  let programScore = 0.85; // default reasonable base
  if (isPreschoolSearch) {
    const requestedPrograms = filters.preschool.programs;
    if (requestedPrograms && requestedPrograms.length > 0) {
      const supportedPrograms = school.preschoolPrograms || [];
      const matchCount = requestedPrograms.filter((p) => supportedPrograms.includes(p)).length;
      programScore = matchCount > 0 ? (matchCount / requestedPrograms.length) * 0.3 + 0.7 : 0.4;
    } else if (filters.preschool.ageYears) {
      const age = filters.preschool.ageYears;
      if (school.ageRange && age >= school.ageRange.min && age <= school.ageRange.max) {
        programScore = 1.0;
      } else {
        programScore = 0.5;
      }
    }
  } else {
    // School grade fit
    if (filters.grade && filters.grade !== 'Any Grade') {
      programScore = 0.95;
    }
  }

  // 4. Pedagogy / Curriculum fit (0 to 1)
  let pedagogyScore = 0.85;
  if (isPreschoolSearch) {
    if (filters.preschool.pedagogy && filters.preschool.pedagogy.length > 0) {
      const schoolPedagogy = (school.pedagogy || []).map((p) => p.toLowerCase());
      const hasMatch = filters.preschool.pedagogy.some((req) => 
        schoolPedagogy.some((sp) => sp.includes(req.toLowerCase()))
      );
      pedagogyScore = hasMatch ? 1.0 : 0.4;
    }
  } else {
    if (filters.curriculums.length > 0) {
      const hasBoard = school.curriculum.some((c) => filters.curriculums.includes(c));
      pedagogyScore = hasBoard ? 1.0 : 0.3;
    }
  }

  // 5. Facilities fit (0 to 1)
  let facilityScore = 0.9;
  if (isPreschoolSearch) {
    let checks = 0;
    let passes = 0;
    if (filters.preschool.outdoorPlay) {
      checks++;
      if (school.outdoorPlay) passes++;
    }
    if (filters.preschool.indoorPlay) {
      checks++;
      if (school.indoorPlay) passes++;
    }
    facilityScore = checks > 0 ? passes / checks : 0.9;
  } else {
    if (filters.requiredFacilities.length > 0) {
      const schoolFacNames = school.facilities.map((f) => f.name.toLowerCase());
      const matched = filters.requiredFacilities.filter((rf) =>
        schoolFacNames.some((sfn) => sfn.includes(rf.toLowerCase()))
      ).length;
      facilityScore = matched / filters.requiredFacilities.length;
    }
  }

  // 6. Childcare & Care / Logistics (0 to 1)
  let careScore = 0.9;
  if (isPreschoolSearch) {
    let careChecks = 0;
    let carePasses = 0;
    if (filters.preschool.daycare) {
      careChecks++;
      if (school.daycare) carePasses++;
    }
    if (filters.preschool.extendedHours) {
      careChecks++;
      if (school.extendedHours) carePasses++;
    }
    if (filters.preschool.meals) {
      careChecks++;
      if (school.meals) carePasses++;
    }
    if (filters.preschool.transport) {
      careChecks++;
      if (school.hasTransport) carePasses++;
    }
    careScore = careChecks > 0 ? carePasses / careChecks : 0.9;
  } else {
    if (filters.requiresTransport && !school.hasTransport) {
      careScore = 0.5;
    }
  }

  // Weighted total
  const rawScore =
    distanceScore * weights.distance +
    budgetScore * weights.budget +
    pedagogyScore * weights.curriculumOrPedagogy +
    programScore * weights.programOrGrade +
    facilityScore * weights.facilities +
    careScore * weights.childcareOrCare;

  // Scale to 55 - 98 range for credible human realism
  const finalScore = Math.round(Math.min(98, Math.max(55, rawScore * 100)));
  return finalScore;
}
