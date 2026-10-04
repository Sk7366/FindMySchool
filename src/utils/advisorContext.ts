import { School } from '../types/school';
import { SearchState, SearchFilters } from '../types/search';
import { schoolService } from '../services/schoolService';

export interface AdvisorContext {
  educationTarget: 'all' | 'preschool' | 'school' | 'combined';
  isEarlyYears: boolean;
  isK12: boolean;
  isCombined: boolean;
  ageYears?: number;
  programs: string[];
  grade?: string;
  location: string;
  radiusKm: number;
  budgetMax: number;
  budgetMin: number;
  pedagogies: string[];
  curriculums: string[];
  daycare: boolean;
  transport: boolean;
  specialNeeds: boolean;
  rawQuery?: string;
  shortlistedCount: number;
  shortlistedSchools: School[];
  comparisonCount: number;
  comparisonSchools: School[];
  contextSchool?: School;
  activeFilterCount: number;
  filteredCount: number;
  contextSummaryText: string;
  contextBadgeTags: string[];
}

export interface SuggestedAction {
  id: string;
  label: string;
  category: 'curriculum' | 'budget' | 'age' | 'comparison' | 'filters' | 'visit' | 'matching';
}

export interface AdvisorReply {
  text: string;
  checklist?: string[];
  caveats?: string[];
  suggestedFollowUps?: SuggestedAction[];
  actionTrigger?: 'adjust-radius' | 'adjust-budget' | 'open-tuner' | 'compare-nav' | 'clear-filters';
  actionTriggerLabel?: string;
}

/**
 * Builds a structured, live snapshot of the parent's current FindMySchool search context.
 */
export function buildAdvisorContext(
  searchState: SearchState,
  savedSchools: School[],
  comparisonSchools: School[],
  filteredSchools: School[],
  contextSchoolName?: string
): AdvisorContext {
  const { filters, rawQuery } = searchState;

  const isEarlyYears =
    filters.educationTarget === 'preschool' ||
    Boolean(filters.preschool?.programs && filters.preschool.programs.length > 0) ||
    Boolean(filters.preschool?.ageYears);

  const isCombined = filters.educationTarget === 'combined';
  const isK12 = !isEarlyYears || filters.educationTarget === 'school' || isCombined;

  // Find context school if passed by name
  let contextSchool: School | undefined;
  if (contextSchoolName) {
    contextSchool = schoolService.getByIdSync(contextSchoolName);
  }

  // Derive age
  let ageYears = filters.preschool?.ageYears;
  if (!ageYears && filters.preschool?.programs && filters.preschool.programs.length > 0) {
    if (filters.preschool.programs.includes('playgroup')) ageYears = 2;
    else if (filters.preschool.programs.includes('nursery')) ageYears = 3;
    else if (filters.preschool.programs.includes('lkg')) ageYears = 4;
    else if (filters.preschool.programs.includes('ukg')) ageYears = 5;
  }

  const pedagogies = filters.preschool?.pedagogy || [];
  const curriculums = filters.curriculums || [];
  const location = filters.location && filters.location !== 'All Chennai' ? filters.location : 'Chennai';

  // Build natural summary text
  let summary = '';
  const badges: string[] = [];

  if (contextSchool) {
    summary = `You're currently evaluating ${contextSchool.name} in ${contextSchool.area} (${
      contextSchool.institutionType === 'preschool'
        ? contextSchool.pedagogy?.join(' / ') || 'Early Years'
        : contextSchool.curriculum?.join(' / ') || 'K-12'
    }, ₹${((contextSchool.annualFeeMin || 0) / 100000).toFixed(1)}L–${((contextSchool.annualFeeMax || 0) / 100000).toFixed(1)}L/yr).`;
    badges.push(contextSchool.name);
    badges.push(contextSchool.area);
    if (contextSchool.annualFeeMin) {
      badges.push(`₹${(contextSchool.annualFeeMin / 100000).toFixed(1)}L/yr`);
    }
  } else if (isEarlyYears) {
    const agePart = ageYears ? `for a ${ageYears}-year-old` : 'for early childhood';
    const pedPart = pedagogies.length > 0 ? `${pedagogies.join(' / ')} preschool` : 'preschool';
    const locPart = location !== 'Chennai' ? `near ${location}` : 'in Chennai';
    summary = `You're currently looking for a ${pedPart} ${agePart} ${locPart}.`;

    if (ageYears) badges.push(`${ageYears} yrs old`);
    if (pedagogies.length > 0) badges.push(pedagogies[0]);
    badges.push(location);
    if (filters.budgetMax && filters.budgetMax < 350000) {
      badges.push(`≤ ₹${(filters.budgetMax / 100000).toFixed(1)}L`);
    }
  } else {
    const gradePart = filters.grade && filters.grade !== 'Any Grade' ? `for ${filters.grade}` : '';
    const currPart = curriculums.length > 0 ? `${curriculums.join(' or ')} school` : 'school';
    const locPart = location !== 'Chennai' ? `near ${location}` : 'in Chennai';
    summary = `You're currently looking for a ${currPart} ${gradePart} ${locPart}.`.replace(/\s+/g, ' ');

    if (filters.grade && filters.grade !== 'Any Grade') badges.push(filters.grade);
    if (curriculums.length > 0) badges.push(curriculums.join('/'));
    badges.push(location);
    if (filters.budgetMax && filters.budgetMax < 350000) {
      badges.push(`≤ ₹${(filters.budgetMax / 100000).toFixed(1)}L`);
    }
  }

  if (savedSchools.length > 0) {
    badges.push(`${savedSchools.length} shortlisted`);
  }
  if (comparisonSchools.length > 0) {
    badges.push(`${comparisonSchools.length} in compare`);
  }

  // Count active non-default filters
  let activeCount = 0;
  if (filters.location && filters.location !== 'All Chennai') activeCount++;
  if (filters.radiusKm && filters.radiusKm < 25) activeCount++;
  if (filters.budgetMax && filters.budgetMax < 350000) activeCount++;
  if (filters.grade && filters.grade !== 'Any Grade') activeCount++;
  if (filters.curriculums && filters.curriculums.length > 0) activeCount += filters.curriculums.length;
  if (filters.preschool?.programs && filters.preschool.programs.length > 0) activeCount += filters.preschool.programs.length;
  if (filters.preschool?.pedagogy && filters.preschool.pedagogy.length > 0) activeCount += filters.preschool.pedagogy.length;
  if (filters.preschool?.daycare) activeCount++;
  if (filters.requiresTransport) activeCount++;
  if (filters.requiresSpecialNeeds) activeCount++;

  return {
    educationTarget: filters.educationTarget,
    isEarlyYears,
    isK12,
    isCombined,
    ageYears,
    programs: filters.preschool?.programs || [],
    grade: filters.grade,
    location,
    radiusKm: filters.radiusKm || 12,
    budgetMax: filters.budgetMax || 250000,
    budgetMin: filters.budgetMin || 30000,
    pedagogies,
    curriculums,
    daycare: Boolean(filters.preschool?.daycare),
    transport: Boolean(filters.requiresTransport || filters.preschool?.transport),
    specialNeeds: Boolean(filters.requiresSpecialNeeds),
    rawQuery,
    shortlistedCount: savedSchools.length,
    shortlistedSchools: savedSchools,
    comparisonCount: comparisonSchools.length,
    comparisonSchools: comparisonSchools,
    contextSchool,
    activeFilterCount: activeCount,
    filteredCount: filteredSchools.length,
    contextSummaryText: summary,
    contextBadgeTags: badges,
  };
}

/**
 * Generates tailored action chips matching user specifications:
 * - Compare learning approaches
 * - Understand preschool/school fees
 * - What should I look for at this age?
 * - Help me compare my shortlisted options
 * - Adjust my search
 * - Why certain filters matter
 * - Questions to ask during a school visit
 */
export function getSuggestedActions(context: AdvisorContext): SuggestedAction[] {
  const actions: SuggestedAction[] = [];

  // 1. Learning approaches
  if (context.isEarlyYears) {
    actions.push({
      id: 'learning-approaches',
      label: 'Compare learning approaches',
      category: 'curriculum',
    });
  } else {
    actions.push({
      id: 'learning-approaches',
      label: 'Compare boards (CBSE vs Cambridge)',
      category: 'curriculum',
    });
  }

  // 2. Fees
  actions.push({
    id: 'understand-fees',
    label: context.isEarlyYears ? 'Understand preschool fees' : 'Understand school fees',
    category: 'budget',
  });

  // 3. Age or Grade priorities
  actions.push({
    id: 'age-priorities',
    label: context.ageYears
      ? `What to look for at age ${context.ageYears}?`
      : context.grade && context.grade !== 'Any Grade'
      ? `What to look for in ${context.grade}?`
      : 'What should I look for at this age?',
    category: 'age',
  });

  // 4. Shortlisted / Comparison support
  if (context.shortlistedCount > 0) {
    actions.push({
      id: 'compare-shortlist',
      label: `Help me compare my ${context.shortlistedCount} shortlisted option${context.shortlistedCount > 1 ? 's' : ''}`,
      category: 'comparison',
    });
  } else if (context.comparisonCount > 0) {
    actions.push({
      id: 'compare-shortlist',
      label: `Compare the ${context.comparisonCount} institutions in my matrix`,
      category: 'comparison',
    });
  } else {
    actions.push({
      id: 'compare-shortlist',
      label: 'Help me compare my shortlisted options',
      category: 'comparison',
    });
  }

  // 5. Adjust my search
  actions.push({
    id: 'adjust-search',
    label: 'Adjust my search',
    category: 'filters',
  });

  // 6. Why certain filters matter
  actions.push({
    id: 'why-filters-matter',
    label: 'Why certain filters matter',
    category: 'filters',
  });

  // 7. Questions for visit
  actions.push({
    id: 'visit-questions',
    label: 'Questions to ask during a school visit',
    category: 'visit',
  });

  // 8. How priorities affect matching
  actions.push({
    id: 'how-matching-works',
    label: 'How priorities affect matching',
    category: 'matching',
  });

  return actions;
}

/**
 * Grounded decision logic strictly following the prompt:
 * - Does not claim an institution is objectively the best
 * - Does not invent school facts, fees, or verification
 * - When information is unavailable: "I don't have enough information to confirm that. You may want to check with the institution."
 * - Explains why filters matter, differences, verification points, and visit checklists.
 */
export function getAdvisorResponse(
  queryOrActionId: string,
  context: AdvisorContext,
  filteredSchools: School[]
): AdvisorReply {
  const norm = queryOrActionId.toLowerCase().trim();

  // ----------------------------------------------------
  // ACTION 1: Compare learning approaches
  // ----------------------------------------------------
  if (norm === 'learning-approaches' || norm.includes('approach') || norm.includes('montessori') || norm.includes('board') || norm.includes('cbse vs') || norm.includes('curriculum')) {
    if (context.isEarlyYears) {
      return {
        text: `In early years education, the learning philosophy shapes your child's daily experience:

1. **Montessori Approach**:
• Focuses on child-led exploration with tactile, self-correcting apparatus (pink tower, sensorial cylinders).
• Mixed-age cohorts allow younger toddlers to learn naturally from older peers.
• Cultivates deep focus, independent self-dressing, and orderliness.

2. **Play-way & Activity-based**:
• Centers around imaginative storytelling, group singing, pretend role-play, and gross-motor games.
• Highly social with vibrant peer interactions to develop verbal vocabulary and confidence.

3. **Integrated Preschool Wings (K–12)**:
• Offers seamless continuation into Grade 1 without separate entrance procedures.
• Larger campus scale, but toddlers may share amenities with primary students.`,
        checklist: [
          'Verify whether the preschool has genuine Montessori apparatus shelves or just worksheets.',
          'Inquire about teacher Montessori diplomas (AMI / AMS / IMC certified).',
          'Ask how the school handles separation anxiety in the first 2 weeks.',
        ],
        caveats: [
          'Many commercial centers brand themselves as "Montessori" but rely heavily on formal pencil-and-paper homework.',
        ],
        suggestedFollowUps: [
          { id: 'understand-fees', label: 'Understand preschool fees', category: 'budget' },
          { id: 'age-priorities', label: 'What should I look for at this age?', category: 'age' },
          { id: 'visit-questions', label: 'Questions to ask during a school visit', category: 'visit' },
        ],
      };
    }

    return {
      text: `When evaluating school boards in Chennai, the key difference lies in pedagogical assessment and long-term trajectory:

1. **CBSE (Central Board of Secondary Education)**:
• Follows NCERT syllabus directly mapped to Indian national entrance exams (JEE, NEET, CUET).
• Systematic factual rigor with predictable, standardized testing frameworks.
• Highly accessible fee structures with extensive school availability across Chennai corridors.

2. **Cambridge (CAIE / IGCSE & A-Levels)**:
• Focuses on inquiry-driven analysis, practical coursework, essay writing, and global problem-solving.
• Flexible subject combinations allowing students to drop or pair disciplines freely.
• Well-suited for international university applications and holistic skill development.

3. **IB World (International Baccalaureate)**:
• Inquiry continuum (PYP, MYP, DP) prioritizing independent research and interdisciplinary thinking.
• Higher tuition tier requiring dedicated international library and laboratory ecosystems.`,
      checklist: [
        'Ask whether Cambridge/IB is offered as a full high school continuum or only up to Grade 8.',
        'Verify lab equipment accessibility for middle school students, not just Class 11 and 12.',
        'Request the school’s historical teacher retention rate in senior grades.',
      ],
      caveats: [
        'No board is universally superior; CBSE is optimized for Indian professional exams, while Cambridge/IB offers analytical breadth for global pathways.',
      ],
      suggestedFollowUps: [
        { id: 'understand-fees', label: 'Understand school fees', category: 'budget' },
        { id: 'why-filters-matter', label: 'Why certain filters matter', category: 'filters' },
        { id: 'visit-questions', label: 'Questions to ask during a school visit', category: 'visit' },
      ],
    };
  }

  // ----------------------------------------------------
  // ACTION 2: Understand fees
  // ----------------------------------------------------
  if (norm === 'understand-fees' || norm.includes('fee') || norm.includes('cost') || norm.includes('tuition') || norm.includes('hidden')) {
    const budgetText = context.budgetMax ? `₹${(context.budgetMax / 100000).toFixed(1)}L` : 'Disclosed';

    if (context.isEarlyYears) {
      return {
        text: `Preschool fee structures in Chennai have distinct components beyond the quoted headline figure (your budget target is up to ${budgetText}/year):

1. **Tuition & Program Charges**:
• Covers 2.5 to 3.5 hours of core morning preschool activities (typically ₹45,000–₹1,10,000/yr).

2. **Daycare & Extended Hours (Optional)**:
• If you need afternoon childcare (12:30 PM to 6:30 PM), centers charge an additional monthly stipend (₹3,000–₹7,000/month).

3. **Material, Snacks & Kit Fees**:
• Annual learning kit, Montessori apparatus maintenance, and fresh kitchen meals (₹8,000–₹22,000/yr).

4. **One-Time Registration**:
• Non-refundable admission charge (₹10,000–₹25,000).`,
        checklist: [
          'Request the official printed 2026-27 fee circular from the admissions coordinator.',
          'Ask if snacks/lunch are included or billed as separate quarterly meal plans.',
          'Confirm whether extended afternoon daycare requires a 30-day notice for pauses during summer.',
        ],
        caveats: [
          'Always verify if transport fees are adjusted for radial distance; van operators may charge extra for inner street pickups.',
        ],
        suggestedFollowUps: [
          { id: 'age-priorities', label: 'What should I look for at this age?', category: 'age' },
          { id: 'adjust-search', label: 'Adjust my search', category: 'filters' },
        ],
      };
    }

    return {
      text: `In private K–12 schools across Chennai, the total cost of ownership extends beyond the base scholastic tuition:

1. **Tuition Fee (Primary & Middle School)**:
• Headline tuition for your search range is ₹${(context.budgetMin / 100000).toFixed(1)}L–${budgetText}/year.

2. **Mandatory Incidental Expenses**:
• Uniforms, books, laboratory materials, and annual software licensing: ₹12,000–₹28,000/year.

3. **Commute & Fleet Surcharges**:
• AC bus fleets along corridors like OMR or GST cost ₹24,000–₹45,000/year depending on radial distance.

4. **One-Time Admission & Caution Deposit**:
• Non-refundable kit and establishment fund (₹25,000–₹60,000) + refundable caution deposit (₹15,000–₹35,000).`,
      checklist: [
        'Ask for the 3-year historical fee revision percentage (standard annual increase is 6%–10%).',
        'Check whether robotics, swimming, and special coaching are included in regular hours or charged as paid after-school clubs.',
        'Request confirmation on whether fees can be paid in 2 or 3 term installments.',
      ],
      caveats: [
        'Never pay non-refundable admissions fees before confirming school bus stoppage availability at your residential gate.',
      ],
      suggestedFollowUps: [
        { id: 'why-filters-matter', label: 'Why certain filters matter', category: 'filters' },
        { id: 'visit-questions', label: 'Questions to ask during a school visit', category: 'visit' },
      ],
    };
  }

  // ----------------------------------------------------
  // ACTION 3: What should I look for at this age?
  // ----------------------------------------------------
  if (norm === 'age-priorities' || norm.includes('this age') || norm.includes('age') || norm.includes('grade') || norm.includes('toddler')) {
    const age = context.ageYears;
    const grade = context.grade;

    if (age && age <= 2.5) {
      return {
        text: `For a toddler around **${age} years old** (Playgroup / Toddler Program):

• **Caregiver Ratio**: Insist on at least 1 adult for every 4–6 toddlers.
• **Warmth & Separation Ease**: The transition should be gentle, allowing parents or caregivers inside during week one.
• **Sensory & Gross-Motor Play**: Look for soft impact zones, clean indoor play pads, and sensory sand or water bays.
• **Sanitation**: Child-height washrooms with dedicated female attendants; potty training should never be a prerequisite.`,
        checklist: [
          'Verify diaper change and sanitation hygiene logs.',
          'Confirm that first aid kits and pediatric emergency contact tie-ups are active.',
          'Ensure classroom toys are non-toxic, wooden or food-grade plastics.',
        ],
        caveats: [
          'At 2 years old, formal academics or handwriting drills are developmentally inappropriate.',
        ],
        suggestedFollowUps: [
          { id: 'learning-approaches', label: 'Compare learning approaches', category: 'curriculum' },
          { id: 'visit-questions', label: 'Questions to ask during a school visit', category: 'visit' },
        ],
      };
    }

    if (age && age <= 4) {
      return {
        text: `For a **${age}-year-old** (Nursery / LKG stage):

• **Language & Social Immersion**: Daily storytelling, expressive vocabulary, and turn-taking games.
• **Outdoor Movement**: At least 45 minutes of daily outdoor sensory play in fresh air.
• **Independence**: Children learn to wash hands independently, open snack boxes, and pack up activity trays.
• **Screen-Free Environment**: Confirm that classrooms prioritize hands-on play rather than smartboards for toddlers.`,
        checklist: [
          'Observe if current children look relaxed, vocal, and engaged.',
          'Check whether classroom doors have anti-pinch finger guards.',
          'Ask how teachers guide behavioral disputes between peers.',
        ],
        caveats: [
          'Avoid institutions that conduct stressful formal screening interviews for 3-year-olds.',
        ],
        suggestedFollowUps: [
          { id: 'understand-fees', label: 'Understand preschool fees', category: 'budget' },
          { id: 'visit-questions', label: 'Questions to ask during a school visit', category: 'visit' },
        ],
      };
    }

    if (grade && (grade.includes('Class 1') || grade.includes('Class 2') || grade.includes('Class 3') || grade.includes('Class 4') || grade.includes('Class 5'))) {
      return {
        text: `For a primary school student in **${grade}**:

• **Foundational Reading & Numeracy**: Ensure emphasis is on conceptual understanding rather than competitive rote testing.
• **Commute Stamina**: Keep radial travel under 35 minutes; longer travel significantly exhausts primary grade stamina.
• **Sports & Physical Culture**: Look for dedicated timetable periods for swimming, athletics, and turf games.
• **Teacher Warmth**: Primary grade children thrive when teachers provide continuous encouraging feedback.`,
        checklist: [
          'Check average bag weight and homework policy.',
          'Verify the availability of a dedicated primary school library.',
          'Inquire about remedial learning support if a child needs extra help in reading or mathematics.',
        ],
        caveats: [
          'Heavy homework loads at primary level often indicate lack of classroom instructional time.',
        ],
        suggestedFollowUps: [
          { id: 'learning-approaches', label: 'Compare boards (CBSE vs Cambridge)', category: 'curriculum' },
          { id: 'why-filters-matter', label: 'Why certain filters matter', category: 'filters' },
        ],
      };
    }

    return {
      text: `Key age-appropriate factors to evaluate based on your child's stage:

1. **Early Years (Ages 1.5–5)**:
• Focus on emotional security, caregiver warmth, adult-to-child ratios (1:6 to 1:10), sensory play, and safety protocols.

2. **Primary School (Classes 1–5)**:
• Focus on foundational literacy, commute proximity, screen-to-play balance, and welcoming classroom environments.

3. **Middle & High School (Classes 6–12)**:
• Focus on laboratory infrastructure, board curriculum track records, sports turf facilities, and career guidance.`,
      checklist: [
        'Match school culture with your child’s temperament—quiet and observant vs highly energetic.',
        'Verify transport door-to-door commute time during morning rush hours.',
      ],
      suggestedFollowUps: [
        { id: 'learning-approaches', label: 'Compare learning approaches', category: 'curriculum' },
        { id: 'visit-questions', label: 'Questions to ask during a school visit', category: 'visit' },
      ],
    };
  }

  // ----------------------------------------------------
  // ACTION 4: Compare shortlisted options
  // ----------------------------------------------------
  if (norm === 'compare-shortlist' || norm.includes('shortlist') || norm.includes('compare') || norm.includes('comparison')) {
    const listToCompare = context.shortlistedSchools.length > 0
      ? context.shortlistedSchools
      : context.comparisonSchools.length > 0
      ? context.comparisonSchools
      : filteredSchools.slice(0, 3);

    if (listToCompare.length > 0) {
      const summaryList = listToCompare.slice(0, 4).map((s, idx) => {
        const approach = s.institutionType === 'preschool'
          ? s.pedagogy?.join(', ') || 'Early Years'
          : s.curriculum?.join(', ') || 'K-12';
        const fee = s.annualFeeMin ? `₹${(s.annualFeeMin / 100000).toFixed(1)}L–${(s.annualFeeMax / 100000).toFixed(1)}L/yr` : 'Disclosed in prospectus';
        return `${idx + 1}. **${s.name}** (${s.area})
   • **Curriculum / Approach**: ${approach}
   • **Tuition**: ${fee}
   • **Commute**: ~${s.distanceKm} km (${s.hasTransport ? 'Transport available' : 'Self drop'})
   • **Fit with your criteria**: ${s.matchScore}% fit`;
      }).join('\n\n');

      return {
        text: `Here is a factual comparison of ${listToCompare.length} institution${listToCompare.length > 1 ? 's' : ''} from your ${
          context.shortlistedSchools.length > 0 ? 'shortlist' : context.comparisonSchools.length > 0 ? 'comparison matrix' : 'top search results'
        }:

${summaryList}

**How to decide between them**:
• Check whether the daily commute route crosses peak congestion junctions along your daily travel path.
• Compare verified fee transparency versus institutions whose auxiliary costs need direct verification.`,
        checklist: [
          'Schedule visits on different days to observe drop-off and pickup logistics.',
          'Verify seat availability for your child’s exact entry grade before applying.',
        ],
        caveats: [
          'Higher fit percentages reflect alignment with your selected filters, not an objective stamp of superiority.',
        ],
        actionTrigger: 'compare-nav',
        actionTriggerLabel: 'Open Side-by-Side Comparison Matrix',
        suggestedFollowUps: [
          { id: 'visit-questions', label: 'Questions to ask during a school visit', category: 'visit' },
          { id: 'why-filters-matter', label: 'Why certain filters matter', category: 'filters' },
        ],
      };
    }

    return {
      text: `You currently do not have any institutions saved in your shortlist.

To compare schools objectively:
1. Browse your results and tap **"Compare"** on 2 to 4 school cards.
2. Tap **"Save"** to bookmark institutions to your personal shortlist.
3. Use the comparison matrix to contrast fees, commute buffers, and facilities side-by-side.`,
      checklist: [
        'Bookmark at least 2 distinct curriculum or approach choices to understand the contrasts.',
      ],
      suggestedFollowUps: [
        { id: 'adjust-search', label: 'Adjust my search', category: 'filters' },
        { id: 'learning-approaches', label: 'Compare learning approaches', category: 'curriculum' },
      ],
    };
  }

  // ----------------------------------------------------
  // ACTION 5: Adjust my search
  // ----------------------------------------------------
  if (norm === 'adjust-search' || norm.includes('adjust') || norm.includes('filter') || norm.includes('narrow') || norm.includes('expand')) {
    const totalCount = context.filteredCount;
    const radius = context.radiusKm;
    const budget = context.budgetMax;

    return {
      text: `Your current search has **${totalCount} matching institution${totalCount === 1 ? '' : 's'}** near **${context.location}** with **${context.activeFilterCount} active filters**.

**Search Diagnostic**:
• **Commute Buffer**: Set to **${radius} km**. In Chennai, expanding by 3–4 km often introduces established school options in adjacent residential corridors (e.g. Medavakkam for Tambaram, or Thiruvanmiyur for Adyar).
• **Budget Ceiling**: Set to **₹${(budget / 100000).toFixed(1)}L/year**.
• **Curriculum / Stage**: Focused on **${context.isEarlyYears ? 'Early Years / Preschool' : context.curriculums.join(', ') || 'All Boards'}**.

**Suggested Refinements**:
• If you need more options: Increase your radial distance to 15 km or relax the budget threshold slightly.
• If you have too many results: Add non-negotiables such as school bus transport, specific boards, or dedicated daycare hours.`,
      checklist: [
        'Use the "Tune Priorities" tool to adjust how heavily commute vs budget influences matching scores.',
      ],
      actionTrigger: 'open-tuner',
      actionTriggerLabel: 'Open Priority Tuner',
      suggestedFollowUps: [
        { id: 'how-matching-works', label: 'How priorities affect matching', category: 'matching' },
        { id: 'why-filters-matter', label: 'Why certain filters matter', category: 'filters' },
      ],
    };
  }

  // ----------------------------------------------------
  // ACTION 6: Why certain filters matter
  // ----------------------------------------------------
  if (norm === 'why-filters-matter' || norm.includes('why filters') || norm.includes('why certain') || norm.includes('commute matter')) {
    return {
      text: `Every filter you configure has a direct bearing on daily family life in Chennai:

1. **Commute Radius & Corridor Proximity**:
• Peak IT shifts on OMR and flyover merges along GST can double travel times during rains.
• A 10 km commute that appears manageable on a map can mean 50+ minutes on a school bus for a young child. Proximity preserves sleep and playtime.

2. **Annual Tuition vs Ancillary Costs**:
• Schools within the same tuition tier often differ significantly on auxiliary billing (uniforms, bus routes, activity levies, annual building development).

3. **Board / Pedagogy Alignment**:
• Choosing Montessori vs Play-way shapes your child's daily autonomy.
• Choosing CBSE vs Cambridge influences whether the academic focus centers on national competitive syllabus or broad inquiry coursework.

4. **Caregiver & Student-Teacher Ratio**:
• In early years, a 1:6 ratio ensures personal oversight during meals and diaper changes. In primary school, 1:25 ensures individual reading attention.`,
      checklist: [
        'Prioritize commute proximity for early years; older students have greater travel stamina.',
        'Check whether school bus stops directly at your apartment gate.',
      ],
      suggestedFollowUps: [
        { id: 'how-matching-works', label: 'How priorities affect matching', category: 'matching' },
        { id: 'adjust-search', label: 'Adjust my search', category: 'filters' },
      ],
    };
  }

  // ----------------------------------------------------
  // ACTION 7: How priorities affect matching
  // ----------------------------------------------------
  if (norm === 'how-matching-works' || norm.includes('matching') || norm.includes('score') || norm.includes('weights') || norm.includes('algorithm')) {
    return {
      text: `On FindMySchool, match scores represent **alignment with your stated preferences**, not a subjective quality ranking:

1. **No Universal Rankings**:
• A score of 94% fit does not mean a school is objectively superior to a 75% fit school. It simply means it satisfies more of YOUR specific parameters (budget, distance, board, facilities).

2. **Weighted Calculation**:
• Commute proximity, tuition budget, curriculum choice, and facilities each contribute a weighted percentage to the overall match score.

3. **Dynamic Recalculation**:
• When you use the Priority Tuner to emphasize short travel times over annual fees, the scoring model recalculates instantly to surface schools nearest your residence.`,
      checklist: [
        'Tune your priority sliders in the results page to see fits adjust live.',
        'Review the "Why this matches" breakdown on any school card for transparent provenance.',
      ],
      caveats: [
        'Never rely solely on a percentage score without inspecting school data disclosures directly.',
      ],
      actionTrigger: 'open-tuner',
      actionTriggerLabel: 'Open Priority Tuner',
      suggestedFollowUps: [
        { id: 'visit-questions', label: 'Questions to ask during a school visit', category: 'visit' },
        { id: 'adjust-search', label: 'Adjust my search', category: 'filters' },
      ],
    };
  }

  // ----------------------------------------------------
  // ACTION 8: Questions to ask during a school visit
  // ----------------------------------------------------
  if (norm === 'visit-questions' || norm.includes('visit') || norm.includes('questions to ask') || norm.includes('tour') || norm.includes('interview')) {
    return {
      text: `Here is a high-yield checklist of questions to ask during a campus visit:

1. **At the Admissions Desk**:
• "What is the total fee payable for the year, including admission kit, uniforms, and bus transport?"
• "What was the average fee revision percentage over the past 3 academic cycles?"
• "What is the exact withdrawal and refund policy if our family relocates?"

2. **During the Classroom Walkthrough**:
• "Can I see the classroom my child will sit in and observe a session in progress?"
• "What is the average teacher tenure at this branch?"
• "What is the school’s protocol when a child feels unwell, overwhelmed, or faces separation anxiety?"

3. **With the Transport Coordinator**:
• "What is the exact route number, bus attendant presence, and pickup timing for our apartment gate?"
• "Are school buses equipped with working GPS and speed governors?"`,
      checklist: [
        'Inspect toddler and primary child washrooms for hygiene and child-safe fixtures.',
        'Visit during morning arrival (8:00 AM) or afternoon dismissal to observe real traffic flow.',
      ],
      suggestedFollowUps: [
        { id: 'understand-fees', label: 'Understand fees', category: 'budget' },
        { id: 'compare-shortlist', label: 'Compare my options', category: 'comparison' },
      ],
    };
  }

  // ----------------------------------------------------
  // NEGATIVE CONSTRAINT: Refusing "best school" claims
  // ----------------------------------------------------
  if (norm.includes('best school') || norm.includes('which is best') || norm.includes('rank 1') || norm.includes('top school') || norm.includes('who is number one')) {
    const topMatches = filteredSchools.slice(0, 3);
    const topList = topMatches.map((s) => `• **${s.name}** (${s.area}): ${s.matchScore}% fit with your current filters`).join('\n');

    return {
      text: `FindMySchool does not rank institutions as objectively the "best" or issue sponsored top-school badges. 

Every child’s needs are distinct—a school with extensive robotics and Cambridge curriculum on OMR may be ideal for one family, but completely impractical for another requiring affordable neighborhood CBSE schooling in Tambaram.

Based strictly on your active search preferences, these institutions currently have the closest fit:
${topList}

You can evaluate their profiles, compare fees, and schedule campus visits to make a grounded decision.`,
      checklist: [
        'Evaluate whether the school’s culture matches your family routines and child’s personality.',
      ],
      suggestedFollowUps: [
        { id: 'compare-shortlist', label: 'Compare these options', category: 'comparison' },
        { id: 'how-matching-works', label: 'How priorities affect matching', category: 'matching' },
      ],
    };
  }

  // ----------------------------------------------------
  // SPECIFIC SCHOOL QUERY (Check directory)
  // ----------------------------------------------------
  const matchedSchool = schoolService.getSchoolsSync().find(
    (s) => norm.includes(s.name.toLowerCase()) || norm.includes(s.slug.toLowerCase())
  );

  if (matchedSchool) {
    const feeStr = matchedSchool.annualFeeMin
      ? `₹${(matchedSchool.annualFeeMin / 100000).toFixed(1)}L–${(matchedSchool.annualFeeMax / 100000).toFixed(1)}L/year`
      : 'Disclosed in prospectus';
    const currStr = matchedSchool.institutionType === 'preschool'
      ? matchedSchool.pedagogy?.join(' / ') || 'Early Years'
      : matchedSchool.curriculum?.join(' / ') || 'K-12';

    return {
      text: `**${matchedSchool.name}** (${matchedSchool.area}, Chennai):

• **Curriculum / Approach**: ${currStr}
• **Tuition Estimate**: ${feeStr}
• **Student-Teacher Ratio**: ${matchedSchool.studentTeacherRatio || 'Disclosed during admission'}
• **Commute Distance**: ~${matchedSchool.distanceKm} km from central hub (${matchedSchool.hasTransport ? 'Bus fleet available' : 'Self drop'})
• **Key Facilities**: ${matchedSchool.facilities.slice(0, 3).map((f) => f.name).join(', ')}
• **Data Status**: ${matchedSchool.dataStatus === 'verified' ? 'Verified with institutional disclosures' : 'Demonstration catalog entry'}`,
      checklist: [
        'Contact the admissions desk directly to verify 2026-27 seat availability for your grade.',
        'Request the bus route schedule for your specific residential sector.',
      ],
      suggestedFollowUps: [
        { id: 'visit-questions', label: 'Questions to ask during a school visit', category: 'visit' },
        { id: 'compare-shortlist', label: 'Compare with other schools', category: 'comparison' },
      ],
    };
  }

  // ----------------------------------------------------
  // FALLBACK FOR UNAVAILABLE / UNSUPPORTED INFORMATION
  // ----------------------------------------------------
  // When information is unavailable (e.g. teacher names, fee negotiation secrets, internal pass rates)
  return {
    text: `I don't have enough information to confirm that. You may want to check with the institution.

I can help you analyze how institutions align with your current search priorities, compare disclosed fee ranges, or prepare key questions for a campus visit.`,
    checklist: [
      'Inquire directly with the school administration during official inquiry hours.',
      'Check the official school website for published circulars.',
    ],
    suggestedFollowUps: [
      { id: 'visit-questions', label: 'Questions to ask during a school visit', category: 'visit' },
      { id: 'why-filters-matter', label: 'Why certain filters matter', category: 'filters' },
      { id: 'understand-fees', label: 'Understand fees', category: 'budget' },
    ],
  };
}
