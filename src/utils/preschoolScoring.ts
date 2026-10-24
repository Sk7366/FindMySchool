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
 * Checks whether an institution offers a requested grade.
 * Differentiates confirmed matches, confirmed mismatches, and unknown availability.
 */
export function checkGradeOfferings(school: School, requestedGrade: string): 'match' | 'mismatch' | 'unknown' {
  if (!requestedGrade || requestedGrade === 'Any Grade') {
    return 'match';
  }

  const raw = requestedGrade.trim().toLowerCase();

  // Normalize early childhood / preschool programs
  let targetProgram: PreschoolProgram | null = null;
  if (/playgroup|toddler/i.test(raw)) targetProgram = 'playgroup';
  else if (/pre-kg|nursery/i.test(raw)) targetProgram = 'nursery';
  else if (/\blkg\b|kindergarten 1|kg 1/i.test(raw)) targetProgram = 'lkg';
  else if (/\bukg\b|kindergarten 2|kg 2/i.test(raw)) targetProgram = 'ukg';

  // 1. If checking an early years program
  if (targetProgram) {
    if (school.preschoolPrograms && school.preschoolPrograms.length > 0) {
      return school.preschoolPrograms.includes(targetProgram) ? 'match' : 'mismatch';
    }

    // Inspect gradeLevels
    if (school.gradeLevels) {
      const min = (school.gradeLevels.min || '').toLowerCase();
      // If min is already a higher class (e.g. Class 1 or LKG)
      if (min.includes('class') || min.includes('grade')) {
        return 'mismatch';
      }
      if (min.includes('lkg') && (targetProgram === 'playgroup' || targetProgram === 'nursery')) {
        return 'mismatch';
      }
      if (min.includes('nursery') || min.includes('pre-kg')) {
        if (targetProgram === 'playgroup') return 'mismatch';
        return 'match';
      }
      if (min.includes('playgroup')) {
        return 'match';
      }
    }

    // Inspect text grades
    if (school.grades) {
      const gText = school.grades.toLowerCase();
      if (targetProgram === 'playgroup' && /playgroup|toddler/i.test(gText)) return 'match';
      if (targetProgram === 'nursery' && /pre-kg|nursery/i.test(gText)) return 'match';
      if (targetProgram === 'lkg' && /\blkg\b/i.test(gText)) return 'match';
      if (targetProgram === 'ukg' && /\bukg\b/i.test(gText)) return 'match';
      if (/class 1 to|grade 1 to/i.test(gText)) return 'mismatch';
    }

    if (school.institutionType === 'school' && !school.preschoolPrograms?.length) {
      return 'mismatch';
    }

    return 'unknown';
  }

  // 2. If checking K-12 grades (Class 1 to Class 12)
  const classMatch = raw.match(/(?:class|grade)\s*(\d{1,2})/i);
  if (classMatch) {
    const classNum = parseInt(classMatch[1], 10);

    // Standalone preschools never offer Class 1–12
    if (school.institutionType === 'preschool') {
      return 'mismatch';
    }

    if (school.gradeLevels) {
      let minNum = 1;
      const minLower = (school.gradeLevels.min || '').toLowerCase();
      const minClassMatch = minLower.match(/(?:class|grade)\s*(\d{1,2})/i);
      if (minClassMatch) {
        minNum = parseInt(minClassMatch[1], 10);
      } else if (/playgroup|pre-kg|nursery|lkg|ukg/i.test(minLower)) {
        minNum = 1; // Covers primary upwards
      }

      let maxNum = 12;
      const maxLower = (school.gradeLevels.max || '').toLowerCase();
      const maxClassMatch = maxLower.match(/(?:class|grade)\s*(\d{1,2})/i);
      if (maxClassMatch) {
        maxNum = parseInt(maxClassMatch[1], 10);
      } else if (/ukg/i.test(maxLower)) {
        maxNum = 0;
      }

      if (classNum < minNum || classNum > maxNum) {
        return 'mismatch';
      }
      return 'match';
    }

    if (school.grades) {
      const gText = school.grades.toLowerCase();
      const spanMatch = gText.match(/(?:class|grade)\s*(\d{1,2})\s*to\s*(?:class|grade)\s*(\d{1,2})/i);
      if (spanMatch) {
        const spanMin = parseInt(spanMatch[1], 10);
        const spanMax = parseInt(spanMatch[2], 10);
        if (classNum >= spanMin && classNum <= spanMax) return 'match';
        return 'mismatch';
      }
      if (/class 12|grade 12/i.test(gText) && classNum <= 12) return 'match';
    }

    return 'unknown';
  }

  // Generic fallback text check
  if (school.grades && school.grades.toLowerCase().includes(raw)) {
    return 'match';
  }

  return 'unknown';
}

/**
 * Calculates a parent-friendly fit score (0-98) dynamically based on current user priorities.
 * Violations of key mandatory constraints (grade mismatch, severe budget overrun, distance out-of-range)
 * apply meaningful score penalties rather than clamping to an arbitrary floor.
 */
export function calculateSchoolFitScore(school: School, filters: SearchFilters): number {
  const pFilters = filters.preschool || { programs: [], pedagogy: [] };
  const isPreschoolSearch =
    filters.educationTarget === 'preschool' ||
    (filters.educationTarget !== 'school' &&
      ((pFilters.programs && pFilters.programs.length > 0) ||
        Boolean(school.institutionType === 'preschool')));

  const weights = filters.weights || (isPreschoolSearch ? DEFAULT_PRESCHOOL_WEIGHTS : DEFAULT_SCHOOL_WEIGHTS);

  let isGradeMismatch = false;
  let isSevereBudgetOverrun = false;

  // 1. Distance fit (0 to 1)
  let distanceScore = 1.0;
  if (filters.radiusKm > 0) {
    const dist = school.distanceKm ?? 5;
    if (dist <= filters.radiusKm) {
      // 1.0 down to 0.70 based on proximity within target radius
      distanceScore = 1.0 - (dist / (filters.radiusKm * 1.5)) * 0.3;
    } else {
      // Meaningful penalty for exceeding commuter radius
      const overage = dist - filters.radiusKm;
      distanceScore = Math.max(0.05, 0.65 - (overage / filters.radiusKm) * 0.65);
    }
  }

  // 2. Budget fit (0 to 1) — Program-aware
  let budgetScore = 1.0;
  if (filters.budgetMax > 0) {
    if (isPreschoolSearch) {
      // Identify targeted preschool program
      let targetProgram: PreschoolProgram | undefined = pFilters.programs?.[0];
      if (!targetProgram && filters.grade) {
        const g = filters.grade.toLowerCase();
        if (g.includes('playgroup')) targetProgram = 'playgroup';
        else if (g.includes('pre-kg') || g.includes('nursery')) targetProgram = 'nursery';
        else if (g.includes('lkg')) targetProgram = 'lkg';
        else if (g.includes('ukg')) targetProgram = 'ukg';
      }

      // Check program-specific fee if available
      let programFee: number | undefined;
      if (school.preschoolProgramDetails && school.preschoolProgramDetails.length > 0) {
        if (targetProgram) {
          const detail = school.preschoolProgramDetails.find((d) => d.program === targetProgram);
          if (detail) {
            programFee = detail.annualFee ?? (detail.monthlyFee ? detail.monthlyFee * 12 : undefined);
          }
        }

        // If no single targeted program matched, take minimum program fee available
        if (programFee === undefined) {
          const fees = school.preschoolProgramDetails
            .map((d) => d.annualFee ?? (d.monthlyFee ? d.monthlyFee * 12 : undefined))
            .filter((f): f is number => typeof f === 'number' && f > 0);
          if (fees.length > 0) {
            programFee = Math.min(...fees);
          }
        }
      }

      if (programFee !== undefined) {
        if (programFee <= filters.budgetMax) {
          budgetScore = 1.0;
        } else {
          const overageRatio = (programFee - filters.budgetMax) / filters.budgetMax;
          if (overageRatio > 0.5) isSevereBudgetOverrun = true;
          budgetScore = Math.max(0.05, 1.0 - overageRatio * 1.5);
        }
      } else {
        // Program-specific fees are missing in the record.
        // Rule: If program-specific fees are missing, do not assume the school meets the budget.
        if (school.annualFeeMin) {
          if (school.annualFeeMin > filters.budgetMax) {
            const overageRatio = (school.annualFeeMin - filters.budgetMax) / filters.budgetMax;
            if (overageRatio > 0.5) isSevereBudgetOverrun = true;
            budgetScore = Math.max(0.05, 0.75 - overageRatio * 1.5);
          } else {
            // Headline fee is within budget, but program fee is unverified
            budgetScore = 0.55;
          }
        } else {
          budgetScore = 0.5; // Unknown fee
        }
      }
    } else {
      // Standard school search
      const feeMin = school.annualFeeMin;
      if (feeMin !== undefined) {
        if (feeMin <= filters.budgetMax) {
          budgetScore = 1.0;
        } else {
          const overageRatio = (feeMin - filters.budgetMax) / filters.budgetMax;
          if (overageRatio > 0.5) isSevereBudgetOverrun = true;
          budgetScore = Math.max(0.05, 1.0 - overageRatio * 1.5);
        }
      } else {
        budgetScore = 0.5;
      }
    }
  }

  // 3. Program / Age / Grade fit (0 to 1)
  let programScore = 0.85; // Reasonable baseline
  if (isPreschoolSearch) {
    const requestedPrograms = pFilters.programs;
    if (requestedPrograms && requestedPrograms.length > 0) {
      if (school.preschoolPrograms && school.preschoolPrograms.length > 0) {
        const matchCount = requestedPrograms.filter((p) => school.preschoolPrograms!.includes(p)).length;
        if (matchCount === requestedPrograms.length) {
          programScore = 1.0;
        } else if (matchCount > 0) {
          programScore = 0.5 + 0.5 * (matchCount / requestedPrograms.length);
        } else {
          // Confirmed mismatch
          programScore = 0.1;
          isGradeMismatch = true;
        }
      } else {
        // Check grade string or gradeLevels if structured preschool programs missing
        const anyMatch = requestedPrograms.some((rp) => checkGradeOfferings(school, rp) === 'match');
        const anyMismatch = requestedPrograms.every((rp) => checkGradeOfferings(school, rp) === 'mismatch');
        if (anyMatch) {
          programScore = 0.8;
        } else if (anyMismatch) {
          programScore = 0.1;
          isGradeMismatch = true;
        } else {
          programScore = 0.55; // Unknown availability
        }
      }
    } else if (pFilters.ageYears) {
      const age = pFilters.ageYears;
      if (school.ageRange) {
        if (age >= school.ageRange.min && age <= school.ageRange.max) {
          programScore = 1.0;
        } else {
          programScore = 0.15; // Age out of supported range
          isGradeMismatch = true;
        }
      } else {
        programScore = 0.6; // Unknown age bounds
      }
    } else if (filters.grade && filters.grade !== 'Any Grade') {
      const status = checkGradeOfferings(school, filters.grade);
      if (status === 'match') {
        programScore = 1.0;
      } else if (status === 'mismatch') {
        programScore = 0.1;
        isGradeMismatch = true;
      } else {
        programScore = 0.6;
      }
    }
  } else {
    // School grade fit
    if (filters.grade && filters.grade !== 'Any Grade') {
      const status = checkGradeOfferings(school, filters.grade);
      if (status === 'match') {
        programScore = 1.0;
      } else if (status === 'mismatch') {
        programScore = 0.1;
        isGradeMismatch = true;
      } else {
        programScore = 0.6;
      }
    }
  }

  // 4. Pedagogy / Curriculum fit (0 to 1)
  let pedagogyScore = 0.85;
  if (isPreschoolSearch) {
    if (pFilters.pedagogy && pFilters.pedagogy.length > 0) {
      const schoolPedagogy = (school.pedagogy || []).map((p) => (p || '').toLowerCase());
      if (schoolPedagogy.length > 0) {
        const hasMatch = pFilters.pedagogy.some((req) =>
          schoolPedagogy.some((sp) => sp.includes((req || '').toLowerCase()))
        );
        pedagogyScore = hasMatch ? 1.0 : 0.25;
      } else {
        pedagogyScore = 0.5; // Pedagogy not documented
      }
    }
  } else {
    const curriculums = filters.curriculums || [];
    if (curriculums.length > 0) {
      const schoolCurrs = school.curriculum || [];
      if (schoolCurrs.length > 0) {
        const hasBoard = schoolCurrs.some((c) => curriculums.includes(c));
        pedagogyScore = hasBoard ? 1.0 : 0.2;
      } else {
        pedagogyScore = 0.5;
      }
    }
  }

  // 5. Facilities fit (0 to 1)
  let facilityScore = 0.9;
  if (isPreschoolSearch) {
    let checks = 0;
    let passes = 0;
    if (pFilters.outdoorPlay) {
      checks++;
      if (school.outdoorPlay) passes++;
    }
    if (pFilters.indoorPlay) {
      checks++;
      if (school.indoorPlay) passes++;
    }
    facilityScore = checks > 0 ? passes / checks : 0.9;
  } else {
    const reqFac = filters.requiredFacilities || [];
    if (reqFac.length > 0) {
      const schoolFacNames = (school.facilities || []).map((f) => (f.name || '').toLowerCase());
      const matched = reqFac.filter((rf) =>
        schoolFacNames.some((sfn) => sfn.includes((rf || '').toLowerCase()))
      ).length;
      facilityScore = matched / reqFac.length;
    }
  }

  // 6. Childcare & Care / Logistics (0 to 1)
  let careScore = 0.9;
  if (isPreschoolSearch) {
    let careChecks = 0;
    let carePasses = 0;
    if (pFilters.daycare) {
      careChecks++;
      if (school.daycare) carePasses++;
    }
    if (pFilters.extendedHours) {
      careChecks++;
      if (school.extendedHours) carePasses++;
    }
    if (pFilters.meals) {
      careChecks++;
      if (school.meals) carePasses++;
    }
    if (pFilters.transport) {
      careChecks++;
      if (school.hasTransport) carePasses++;
    }
    careScore = careChecks > 0 ? carePasses / careChecks : 0.9;
  } else {
    if (filters.requiresTransport && !school.hasTransport) {
      careScore = 0.4;
    }
  }

  // Weighted total
  let rawScore =
    distanceScore * weights.distance +
    budgetScore * weights.budget +
    pedagogyScore * weights.curriculumOrPedagogy +
    programScore * weights.programOrGrade +
    facilityScore * weights.facilities +
    careScore * weights.childcareOrCare;

  // Apply constraint penalties for mandatory requirement violations
  if (isGradeMismatch) {
    // If the institution does not offer the requested grade, compatibility is fundamentally compromised
    rawScore *= 0.5;
  }
  if (isSevereBudgetOverrun) {
    rawScore *= 0.75;
  }

  // Realistic score scale (0 - 98) without arbitrary 55% floor
  const validScore = isNaN(rawScore) ? 0.5 : rawScore;
  const finalScore = Math.round(Math.min(98, Math.max(0, validScore * 100)));
  return finalScore;
}

