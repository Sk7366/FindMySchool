import { MatchReason, School } from '../types/school';
import { SearchFilters } from '../types/search';
import { checkGradeOfferings } from './preschoolScoring';

export interface FormattedMatchExplanation {
  category: 'preference' | 'fact' | 'confirmation';
  tag: 'Matches your preference' | 'Verified factual information' | 'Information requiring confirmation';
  prefixLabel: string;
  tagBadgeClass: string;
  tagIconClass: string;
  title: string;
  detail?: string;
  actionAdvice?: string;
}

/**
 * Formats match reasons to clearly distinguish between:
 * 1. matched from user preferences (e.g., "Matches your preference: Montessori")
 * 2. verified factual information (e.g., "Listed fee: ₹80K/year")
 * 3. information requiring confirmation (e.g., "Confirm current fee with the institution.")
 */
export function formatMatchReason(reason: MatchReason): FormattedMatchExplanation {
  const isConfirm =
    reason.sourceType === 'needs_confirmation' ||
    reason.type === 'partial' ||
    reason.type === 'unverified' ||
    Boolean(reason.confirmationAction);

  const isPreference =
    reason.sourceType === 'preference' ||
    (!reason.sourceType &&
      (reason.matchedCriteria === 'budget' ||
        reason.matchedCriteria === 'distance' ||
        reason.matchedCriteria === 'curriculum' ||
        reason.matchedCriteria === 'philosophy'));

  if (isConfirm) {
    return {
      category: 'confirmation',
      tag: 'Information requiring confirmation',
      prefixLabel: 'Requires confirmation',
      tagBadgeClass: 'bg-amber-50 text-amber-950 border-amber-300',
      tagIconClass: 'text-amber-700',
      title: reason.title,
      detail: reason.description,
      actionAdvice:
        reason.confirmationAction ||
        (reason.matchedCriteria === 'budget'
          ? 'Confirm current fee circular with the school administration.'
          : reason.matchedCriteria === 'transport'
          ? 'Verify morning bus pickup and stop availability for your exact residence.'
          : 'Confirm this requirement directly with the institution.'),
    };
  }

  if (isPreference) {
    return {
      category: 'preference',
      tag: 'Matches your preference',
      prefixLabel: 'Matches your preference',
      tagBadgeClass: 'bg-teal-50 text-teal-950 border-teal-300',
      tagIconClass: 'text-teal-700',
      title: reason.title,
      detail: reason.description,
    };
  }

  return {
    category: 'fact',
    tag: 'Verified factual information',
    prefixLabel: 'Factual information',
    tagBadgeClass: 'bg-stone-100 text-stone-900 border-stone-300',
    tagIconClass: 'text-stone-600',
    title: reason.title,
    detail: reason.description,
  };
}

/**
 * Generates truthful, query-aware match reasons grounded strictly in active filters and the school's actual data.
 * Replaces hardcoded demo-scenario match reasons.
 */
export function generateDynamicMatchReasons(
  school: School,
  filters?: SearchFilters,
  _rawQuery?: string
): MatchReason[] {
  const reasons: MatchReason[] = [];
  const pFilters = filters?.preschool;
  const isPreschoolSearch =
    filters?.educationTarget === 'preschool' ||
    Boolean(pFilters?.programs?.length) ||
    school.institutionType === 'preschool';

  // 1. Distance & Locality
  if (filters?.radiusKm && filters.radiusKm > 0) {
    if (typeof school.distanceKm === 'number') {
      if (school.distanceKm <= filters.radiusKm) {
        reasons.push({
          id: `${school.id}-dyn-dist`,
          type: 'positive',
          sourceType: 'preference',
          matchedCriteria: 'distance',
          title: `Within your ${filters.radiusKm} km search radius`,
          description: `Located ~${school.distanceKm.toFixed(1)} km away in ${school.area}.`,
        });
      } else {
        const overage = (school.distanceKm - filters.radiusKm).toFixed(1);
        reasons.push({
          id: `${school.id}-dyn-dist-over`,
          type: 'partial',
          sourceType: 'needs_confirmation',
          matchedCriteria: 'distance',
          title: `Distance (~${school.distanceKm} km) exceeds ${filters.radiusKm} km radius`,
          description: `Located in ${school.area}, ~${overage} km beyond your specified target zone.`,
          confirmationAction: 'Check daily travel times and school bus pickup routes.',
        });
      }
    }
  } else if (filters?.location && filters.location !== 'All Chennai') {
    const locKey = filters.location.toLowerCase().split(' ')[0];
    const matchArea = `${school.area} ${school.neighbourhood?.area || ''}`.toLowerCase();
    if (matchArea.includes(locKey)) {
      reasons.push({
        id: `${school.id}-dyn-loc`,
        type: 'positive',
        sourceType: 'preference',
        matchedCriteria: 'distance',
        title: `Located in ${school.area}`,
        description: `Directly matches your location preference (${filters.location}).`,
      });
    }
  }

  // 2. Budget / Fee evaluation (program-aware for preschools)
  if (filters?.budgetMax && filters.budgetMax > 0) {
    if (isPreschoolSearch) {
      let targetProgram = pFilters?.programs?.[0];
      if (!targetProgram && filters?.grade) {
        const g = filters.grade.toLowerCase();
        if (g.includes('playgroup')) targetProgram = 'playgroup';
        else if (g.includes('pre-kg') || g.includes('nursery')) targetProgram = 'nursery';
        else if (g.includes('lkg')) targetProgram = 'lkg';
        else if (g.includes('ukg')) targetProgram = 'ukg';
      }

      let matchedDetail = targetProgram && school.preschoolProgramDetails
        ? school.preschoolProgramDetails.find((d) => d.program === targetProgram)
        : school.preschoolProgramDetails?.[0];

      if (matchedDetail) {
        const fee = matchedDetail.annualFee ?? (matchedDetail.monthlyFee ? matchedDetail.monthlyFee * 12 : undefined);
        if (fee !== undefined) {
          if (fee <= filters.budgetMax) {
            reasons.push({
              id: `${school.id}-dyn-fee`,
              type: 'positive',
              sourceType: 'preference',
              matchedCriteria: 'budget',
              title: `Program fee fits your ₹${(filters.budgetMax / 100000).toFixed(1)}L budget`,
              description: `${matchedDetail.displayName || matchedDetail.program.toUpperCase()} fee is listed at ₹${fee.toLocaleString('en-IN')}/year.`,
            });
          } else {
            const diff = fee - filters.budgetMax;
            reasons.push({
              id: `${school.id}-dyn-fee-over`,
              type: 'partial',
              sourceType: 'needs_confirmation',
              matchedCriteria: 'budget',
              title: `Program fee exceeds ₹${(filters.budgetMax / 100000).toFixed(1)}L target`,
              description: `${matchedDetail.displayName || matchedDetail.program.toUpperCase()} fee is ₹${fee.toLocaleString('en-IN')}/year (₹${diff.toLocaleString('en-IN')} over budget).`,
              confirmationAction: 'Confirm instalment plans and sibling concessions with the school.',
            });
          }
        }
      } else {
        // Program-specific fee is missing in the record
        if (school.annualFeeMin && school.annualFeeMin > filters.budgetMax) {
          reasons.push({
            id: `${school.id}-dyn-fee-high`,
            type: 'partial',
            sourceType: 'needs_confirmation',
            matchedCriteria: 'budget',
            title: `Headline fee exceeds ₹${(filters.budgetMax / 100000).toFixed(1)}L budget`,
            description: `Starting tuition is ₹${school.annualFeeMin.toLocaleString('en-IN')}/year; early years specific fees are unlisted.`,
            confirmationAction: 'Request official early-years fee circular from the institution.',
          });
        } else {
          reasons.push({
            id: `${school.id}-dyn-fee-unver`,
            type: 'unverified',
            sourceType: 'needs_confirmation',
            matchedCriteria: 'budget',
            title: 'Preschool program fees require confirmation',
            description: `Program-specific early childhood fees are not published in catalog data (school base: ₹${school.annualFeeMin ? (school.annualFeeMin / 100000).toFixed(1) + 'L' : 'unlisted'}).`,
            confirmationAction: 'Verify preschool fee schedule directly with the admissions office.',
          });
        }
      }
    } else {
      // Standard K-12 school fee check
      if (typeof school.annualFeeMin === 'number') {
        if (school.annualFeeMin <= filters.budgetMax) {
          reasons.push({
            id: `${school.id}-dyn-fee`,
            type: 'positive',
            sourceType: 'preference',
            matchedCriteria: 'budget',
            title: `Tuition fits your ₹${(filters.budgetMax / 100000).toFixed(1)}L annual budget`,
            description: `Starting tuition of ₹${school.annualFeeMin.toLocaleString('en-IN')}/year is within your limit.`,
          });
        } else {
          reasons.push({
            id: `${school.id}-dyn-fee-over`,
            type: 'partial',
            sourceType: 'needs_confirmation',
            matchedCriteria: 'budget',
            title: `Starting tuition exceeds ₹${(filters.budgetMax / 100000).toFixed(1)}L budget`,
            description: `Starting tuition is listed at ₹${school.annualFeeMin.toLocaleString('en-IN')}/year.`,
            confirmationAction: 'Confirm complete fee schedule and optional cost components.',
          });
        }
      } else {
        reasons.push({
          id: `${school.id}-dyn-fee-none`,
          type: 'unverified',
          sourceType: 'needs_confirmation',
          matchedCriteria: 'budget',
          title: 'Tuition fees unlisted',
          description: 'Official fee breakdown is not published in catalog records.',
          confirmationAction: 'Inquire directly with admissions for fee details.',
        });
      }
    }
  }

  // 3. Curriculum or Early Childhood Pedagogy
  if (pFilters?.pedagogy && pFilters.pedagogy.length > 0 && isPreschoolSearch) {
    const schoolPeds = (school.pedagogy || []).map((p) => p.toLowerCase());
    const matched = pFilters.pedagogy.filter((req) =>
      schoolPeds.some((sp) => sp.includes(req.toLowerCase()))
    );
    if (matched.length > 0) {
      reasons.push({
        id: `${school.id}-dyn-ped`,
        type: 'positive',
        sourceType: 'preference',
        matchedCriteria: 'philosophy',
        title: `Follows ${matched.join(' & ')} methodology`,
        description: `Classrooms use child-centric ${matched.join(', ')} approaches.`,
      });
    } else if (school.pedagogy && school.pedagogy.length > 0) {
      reasons.push({
        id: `${school.id}-dyn-ped-alt`,
        type: 'partial',
        sourceType: 'needs_confirmation',
        matchedCriteria: 'philosophy',
        title: `Offers ${school.pedagogy.join(' · ')} methodology`,
        description: `Follows ${school.pedagogy.join(', ')} rather than requested ${pFilters.pedagogy.join(', ')}.`,
      });
    } else {
      reasons.push({
        id: `${school.id}-dyn-ped-unver`,
        type: 'unverified',
        sourceType: 'needs_confirmation',
        matchedCriteria: 'philosophy',
        title: 'Teaching approach unverified',
        description: 'Specific early childhood methodology is not documented in catalog data.',
        confirmationAction: 'Ask about the daily learning methodology and routine during your campus visit.',
      });
    }
  } else if (filters?.curriculums && filters.curriculums.length > 0 && !isPreschoolSearch) {
    const matched = filters.curriculums.filter((c) => school.curriculum?.includes(c));
    if (matched.length > 0) {
      reasons.push({
        id: `${school.id}-dyn-curr`,
        type: 'positive',
        sourceType: 'preference',
        matchedCriteria: 'curriculum',
        title: `Offers ${matched.join(' & ')} curriculum`,
        description: `Affiliated with your requested board (${matched.join(', ')}).`,
      });
    } else if (school.curriculum && school.curriculum.length > 0) {
      reasons.push({
        id: `${school.id}-dyn-curr-alt`,
        type: 'partial',
        sourceType: 'needs_confirmation',
        matchedCriteria: 'curriculum',
        title: `Offers ${school.curriculum.join(' & ')} board`,
        description: `School teaches ${school.curriculum.join(', ')} instead of requested ${filters.curriculums.join(', ')}.`,
      });
    }
  }

  // 4. Grade / Preschool Program
  if (pFilters?.programs && pFilters.programs.length > 0) {
    const supported = school.preschoolPrograms || [];
    const matched = pFilters.programs.filter((p) => supported.includes(p));
    if (matched.length > 0) {
      reasons.push({
        id: `${school.id}-dyn-prog`,
        type: 'positive',
        sourceType: 'preference',
        matchedCriteria: 'philosophy',
        title: `Enrolling for ${matched.map((m) => m.toUpperCase()).join(' & ')}`,
        description: `Offers verified early-childhood program(s) for your target age level.`,
      });
    } else if (supported.length > 0) {
      reasons.push({
        id: `${school.id}-dyn-prog-mismatch`,
        type: 'partial',
        sourceType: 'needs_confirmation',
        matchedCriteria: 'philosophy',
        title: `Requested program not offered`,
        description: `Offers ${supported.map((s) => s.toUpperCase()).join(', ')} rather than requested ${pFilters.programs.map((p) => p.toUpperCase()).join(', ')}.`,
        confirmationAction: 'Verify admission age cutoffs with the admissions team.',
      });
    } else {
      reasons.push({
        id: `${school.id}-dyn-prog-unver`,
        type: 'unverified',
        sourceType: 'needs_confirmation',
        matchedCriteria: 'philosophy',
        title: 'Preschool program availability unconfirmed',
        description: 'Specific early-years program offerings are not confirmed in catalog records.',
        confirmationAction: 'Confirm with admissions whether early-childhood grades are currently admitting.',
      });
    }
  } else if (filters?.grade && filters.grade !== 'Any Grade') {
    const status = checkGradeOfferings(school, filters.grade);
    if (status === 'match') {
      reasons.push({
        id: `${school.id}-dyn-grd`,
        type: 'positive',
        sourceType: 'preference',
        matchedCriteria: 'philosophy',
        title: `Offers ${filters.grade}`,
        description: `Grade coverage spans ${school.grades || 'requested levels'}.`,
      });
    } else if (status === 'mismatch') {
      reasons.push({
        id: `${school.id}-dyn-grd-mismatch`,
        type: 'partial',
        sourceType: 'needs_confirmation',
        matchedCriteria: 'philosophy',
        title: `${filters.grade} not offered`,
        description: `School grades span ${school.grades || 'different levels'}, which does not include ${filters.grade}.`,
      });
    } else {
      reasons.push({
        id: `${school.id}-dyn-grd-unver`,
        type: 'unverified',
        sourceType: 'needs_confirmation',
        matchedCriteria: 'philosophy',
        title: `Grade ${filters.grade} availability unconfirmed`,
        description: `Admissions status for ${filters.grade} is not confirmed in catalog data.`,
        confirmationAction: `Check with the school if admissions are open for ${filters.grade}.`,
      });
    }
  }

  // 5. Daycare
  if (pFilters?.daycare) {
    if (school.daycare === true) {
      reasons.push({
        id: `${school.id}-dyn-daycare`,
        type: 'positive',
        sourceType: 'verified_fact',
        matchedCriteria: 'facility',
        title: 'Daycare facility available',
        description: `Childcare with rest and supervised playtime (${school.timings || 'campus schedule'}).`,
      });
    } else if (school.daycare === false) {
      reasons.push({
        id: `${school.id}-dyn-daycare-none`,
        type: 'partial',
        sourceType: 'needs_confirmation',
        matchedCriteria: 'facility',
        title: 'No daycare service offered',
        description: 'Operates morning school sessions only without full-day daycare.',
        confirmationAction: 'Check for independent daycare options in the immediate neighbourhood.',
      });
    } else {
      reasons.push({
        id: `${school.id}-dyn-daycare-unver`,
        type: 'unverified',
        sourceType: 'needs_confirmation',
        matchedCriteria: 'facility',
        title: 'Daycare provision unverified',
        description: 'Daycare availability is not documented in institutional records.',
        confirmationAction: 'Contact the school to verify if after-hours daycare is offered.',
      });
    }
  }

  // 6. Transport
  if (filters?.requiresTransport || pFilters?.transport) {
    if (school.hasTransport === true) {
      reasons.push({
        id: `${school.id}-dyn-trans`,
        type: 'positive',
        sourceType: 'verified_fact',
        matchedCriteria: 'transport',
        title: 'School bus fleet operational',
        description: `Bus routes cover up to ~${school.transportRadiusKm || 15} km radius across Chennai.`,
      });
    } else if (school.hasTransport === false) {
      reasons.push({
        id: `${school.id}-dyn-trans-none`,
        type: 'partial',
        sourceType: 'needs_confirmation',
        matchedCriteria: 'transport',
        title: 'No school transport provided',
        description: 'Institution does not run dedicated buses; parents arrange independent transport.',
        confirmationAction: 'Verify private van or carpool networks in your area.',
      });
    } else {
      reasons.push({
        id: `${school.id}-dyn-trans-unver`,
        type: 'unverified',
        sourceType: 'needs_confirmation',
        matchedCriteria: 'transport',
        title: 'Transport availability unconfirmed',
        description: 'Bus route availability is unlisted in catalog records.',
        confirmationAction: 'Check route and stop availability for your specific locality.',
      });
    }
  }

  // 7. Required facilities
  if (filters?.requiredFacilities && filters.requiredFacilities.length > 0) {
    const facs = school.facilities || [];
    for (const reqFac of filters.requiredFacilities) {
      const matchedFac = facs.find((f) => f.name.toLowerCase().includes(reqFac.toLowerCase()));
      if (matchedFac && matchedFac.available) {
        reasons.push({
          id: `${school.id}-dyn-fac-${matchedFac.id}`,
          type: 'positive',
          sourceType: 'verified_fact',
          matchedCriteria: 'facility',
          title: `Equipped with ${matchedFac.name}`,
          description: matchedFac.highlight || 'Verified campus infrastructure.',
        });
      } else {
        reasons.push({
          id: `${school.id}-dyn-fac-miss-${reqFac.replace(/\s+/g, '-').toLowerCase()}`,
          type: 'partial',
          sourceType: 'needs_confirmation',
          matchedCriteria: 'facility',
          title: `No verified ${reqFac}`,
          description: `No verified ${reqFac} listed in school facility records.`,
          confirmationAction: `Confirm ${reqFac} availability directly with school.`,
        });
      }
    }
  }

  // 8. Fallback to genuine school facts if fewer than 2 match reasons generated
  if (reasons.length < 2) {
    if (school.curriculum && school.curriculum.length > 0) {
      reasons.push({
        id: `${school.id}-base-curr`,
        type: 'positive',
        sourceType: 'verified_fact',
        matchedCriteria: 'curriculum',
        title: `Affiliated with ${school.curriculum.join(' & ')}`,
        description: `Established institution offering ${school.grades || 'comprehensive grades'}.`,
      });
    } else if (school.pedagogy && school.pedagogy.length > 0) {
      reasons.push({
        id: `${school.id}-base-ped`,
        type: 'positive',
        sourceType: 'verified_fact',
        matchedCriteria: 'philosophy',
        title: `Follows ${school.pedagogy.join(' · ')} methodology`,
        description: `Early-years curriculum tailored for ${school.grades || 'preschool ages'}.`,
      });
    }

    if (school.facilities && school.facilities.length > 0 && reasons.length < 2) {
      const topFac = school.facilities[0];
      reasons.push({
        id: `${school.id}-base-fac`,
        type: 'positive',
        sourceType: 'verified_fact',
        matchedCriteria: 'facility',
        title: `Features ${topFac.name}`,
        description: topFac.highlight || 'Documented campus facility.',
      });
    }

    if (reasons.length < 2) {
      reasons.push({
        id: `${school.id}-base-loc`,
        type: 'positive',
        sourceType: 'verified_fact',
        matchedCriteria: 'distance',
        title: `Campus in ${school.area}`,
        description: school.neighbourhood?.commuteNote || `${school.city || 'Chennai'} campus.`,
      });
    }
  }

  return reasons.slice(0, 4);
}

