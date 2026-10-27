import { apiClient } from './apiClient';
import { SearchFilters } from '../types/search';
import { ParsedQueryData, ParseQueryResponse } from '../types/api';
import { PreschoolProgram, Curriculum } from '../types/school';

export interface ParseResult {
  filters: SearchFilters;
  source: 'llm' | 'local_fallback';
  clarificationNeeded?: string | null;
  confidence: 'high' | 'medium' | 'needs_clarification';
  mustHaves: string[];
  niceToHaves: string[];
  parsedData?: ParsedQueryData;
}

/**
 * Local deterministic regex-based query parser (reliable zero-dependency fallback)
 */
export function parseQueryLocally(query: string, baseFilters: SearchFilters): ParseResult {
  const lower = query.toLowerCase();
  const nextFilters: SearchFilters = {
    ...baseFilters,
    preschool: { ...baseFilters.preschool },
  };

  const mustHaves: string[] = [];
  const niceToHaves: string[] = [];

  // 1. Education target
  const hasPreschoolKeyword =
    lower.includes('preschool') ||
    lower.includes('playschool') ||
    lower.includes('playgroup') ||
    lower.includes('nursery') ||
    lower.includes('lkg') ||
    lower.includes('ukg') ||
    lower.includes('kindergarten') ||
    lower.includes('montessori') ||
    lower.includes('toddler') ||
    lower.includes('daycare') ||
    lower.includes('3-year') ||
    lower.includes('3 year') ||
    lower.includes('4-year') ||
    lower.includes('4 year') ||
    lower.includes('2-year') ||
    lower.includes('2 year');

  const cleanedForSchoolCheck = lower.replace(/\b(preschool|playschool|pre-school)\b/g, '');
  const hasSchoolKeyword =
    cleanedForSchoolCheck.includes('school') ||
    lower.includes('class') ||
    lower.includes('grade') ||
    lower.includes('cbse') ||
    lower.includes('icse') ||
    lower.includes('cambridge') ||
    lower.includes('igcse') ||
    lower.includes('high school') ||
    lower.includes('secondary');

  const isCombinedKeyword =
    lower.includes('combined') ||
    lower.includes('preschool and') ||
    lower.includes('preschool +') ||
    lower.includes('preschool to') ||
    lower.includes('preschool ->') ||
    lower.includes('preschool through') ||
    lower.includes('grade 1+') ||
    lower.includes('class 1+') ||
    lower.includes('grade 1 onwards') ||
    lower.includes('class 1 onwards') ||
    lower.includes('pre-kg to 12') ||
    lower.includes('pre-kg to class 12') ||
    lower.includes('k-12') ||
    (hasPreschoolKeyword && hasSchoolKeyword);

  if (isCombinedKeyword) {
    nextFilters.educationTarget = 'combined';
    mustHaves.push('Combined Campus (Preschool → School)');
  } else if (hasPreschoolKeyword) {
    nextFilters.educationTarget = 'preschool';
    mustHaves.push('Preschool / Early Years');
  } else if (hasSchoolKeyword) {
    nextFilters.educationTarget = 'school';
    mustHaves.push('K-12 School');
  }

  // 2. Chennai localities
  if (lower.includes('tambaram') || lower.includes('gst')) {
    nextFilters.location = 'Tambaram & GST Corridor';
    mustHaves.push('Location: Tambaram');
  } else if (lower.includes('omr') || lower.includes('sholinganallur') || lower.includes('karapakkam')) {
    nextFilters.location = 'OMR / Sholinganallur';
    mustHaves.push('Location: OMR');
  } else if (lower.includes('adyar') || lower.includes('besant nagar')) {
    nextFilters.location = 'Adyar & Besant Nagar';
    mustHaves.push('Location: Adyar');
  } else if (lower.includes('anna nagar') || lower.includes('mogappair')) {
    nextFilters.location = 'Anna Nagar & Mogappair';
    mustHaves.push('Location: Anna Nagar');
  } else if (lower.includes('porur') || lower.includes('manapakkam') || lower.includes('gerugambakkam')) {
    nextFilters.location = 'Porur & Manapakkam';
    mustHaves.push('Location: Porur');
  } else if (lower.includes('velachery') || lower.includes('guindy')) {
    nextFilters.location = 'Velachery & Guindy';
    mustHaves.push('Location: Velachery');
  }

  // 3. Budgets
  if (lower.includes('50k') || lower.includes('50,000') || lower.includes('50 thousand')) {
    nextFilters.budgetMax = 50000;
    mustHaves.push('Budget: Under ₹50,000');
  } else if (lower.includes('80,000') || lower.includes('80k') || lower.includes('80 thousand')) {
    nextFilters.budgetMax = 80000;
    mustHaves.push('Budget: Under ₹80,000');
  } else if (lower.includes('1 lakh') || lower.includes('1l') || lower.includes('1,00,000')) {
    nextFilters.budgetMax = 100000;
    mustHaves.push('Budget: Under ₹1 Lakh');
  } else if (lower.includes('1.2') || lower.includes('1.2l') || lower.includes('1.2 lakh')) {
    nextFilters.budgetMax = 125000;
    mustHaves.push('Budget: Under ₹1.25 Lakh');
  } else if (lower.includes('1.5') || lower.includes('1.5 lakh') || lower.includes('1.5l')) {
    nextFilters.budgetMax = 150000;
    mustHaves.push('Budget: Under ₹1.5 Lakh');
  } else if (lower.includes('2 lakh') || lower.includes('2l')) {
    nextFilters.budgetMax = 200000;
    mustHaves.push('Budget: Under ₹2 Lakh');
  }

  // 4. Age & Program
  let childAge: number | undefined;
  const ageMatch = lower.match(/(\d+)[ -]year[ -]old/) || lower.match(/(\d+)\s*years/);
  if (ageMatch && ageMatch[1]) {
    childAge = parseInt(ageMatch[1], 10);
    if (childAge <= 5) {
      nextFilters.preschool.ageYears = childAge;
      if (childAge <= 2.5) {
        nextFilters.preschool.programs = ['playgroup'];
      } else if (childAge <= 3.5) {
        nextFilters.preschool.programs = ['nursery'];
      } else if (childAge <= 4.5) {
        nextFilters.preschool.programs = ['lkg'];
      } else {
        nextFilters.preschool.programs = ['ukg'];
      }
      mustHaves.push(`Child: ${childAge} years old`);
    } else {
      nextFilters.preschool.ageYears = undefined;
      nextFilters.preschool.programs = [];
      const classNum = Math.min(Math.max(childAge - 5, 1), 12);
      nextFilters.grade = `Class ${classNum}`;
      if (nextFilters.educationTarget !== 'combined') {
        nextFilters.educationTarget = 'school';
      }
      mustHaves.push(`Grade: Class ${classNum} (${childAge}yo)`);
    }
  }

  // Explicit program
  const preschoolProgs: PreschoolProgram[] = [];
  if (lower.includes('playgroup') || lower.includes('toddler')) preschoolProgs.push('playgroup');
  if (lower.includes('nursery')) preschoolProgs.push('nursery');
  if (lower.includes('lkg') || lower.includes('junior kg')) preschoolProgs.push('lkg');
  if (lower.includes('ukg') || lower.includes('senior kg')) preschoolProgs.push('ukg');
  if (preschoolProgs.length > 0) {
    nextFilters.preschool.programs = preschoolProgs;
    mustHaves.push(`Program: ${preschoolProgs.join(', ')}`);
  }

  // Pedagogy
  const pedagogyList: string[] = [];
  if (lower.includes('montessori')) pedagogyList.push('Montessori');
  if (lower.includes('play-way') || lower.includes('play way') || lower.includes('playway')) pedagogyList.push('Play-way');
  if (lower.includes('reggio')) pedagogyList.push('Reggio Emilia');
  if (lower.includes('waldorf') || lower.includes('steiner')) pedagogyList.push('Waldorf-inspired');
  if (lower.includes('activity')) pedagogyList.push('Activity-based');
  if (pedagogyList.length > 0) {
    nextFilters.preschool.pedagogy = pedagogyList;
    mustHaves.push(`Pedagogy: ${pedagogyList.join(', ')}`);
  }

  // Daycare
  if (lower.includes('daycare') || lower.includes('day care') || lower.includes('creche')) {
    nextFilters.preschool.daycare = true;
    mustHaves.push('Daycare / Creche');
  }

  // Facilities
  const facilities: string[] = [];
  if (lower.includes('robotics') || lower.includes('stem')) facilities.push('Robotics & STEM Lab');
  if (lower.includes('swimming') || lower.includes('pool')) facilities.push('Swimming Pool');
  if (lower.includes('cricket')) facilities.push('Cricket Academy & Nets');
  if (lower.includes('football') || lower.includes('turf')) facilities.push('Football Turf');
  if (facilities.length > 0) {
    nextFilters.requiredFacilities = facilities;
    mustHaves.push(`Facilities: ${facilities.join(', ')}`);
  }

  // Preschool outdoor play
  if (lower.includes('outdoor play') || lower.includes('outdoor') || lower.includes('garden') || lower.includes('sand pit')) {
    nextFilters.preschool.outdoorPlay = true;
    niceToHaves.push('Outdoor Play Area');
  }

  // Curriculums
  const curriculums: Curriculum[] = [];
  if (lower.includes('cbse')) curriculums.push('CBSE');
  if (lower.includes('icse')) curriculums.push('ICSE');
  if (lower.includes('cambridge') || lower.includes('igcse')) curriculums.push('Cambridge (IGCSE)');
  if (lower.includes('ib') || lower.includes('international baccalaureate')) curriculums.push('IB World');
  if (curriculums.length > 0) {
    nextFilters.curriculums = curriculums;
    mustHaves.push(`Curriculum: ${curriculums.join(', ')}`);
  }

  // Explicit grade
  const gradeMatch = lower.match(/class\s*(\d+)/) || lower.match(/grade\s*(\d+)/);
  if (gradeMatch && gradeMatch[1]) {
    nextFilters.grade = `Class ${gradeMatch[1]}`;
    mustHaves.push(`Grade: Class ${gradeMatch[1]}`);
  }

  // Transport
  if (lower.includes('transport') || lower.includes('bus') || lower.includes('van')) {
    nextFilters.requiresTransport = true;
    nextFilters.preschool.transport = true;
    niceToHaves.push('Transport Available');
  }

  return {
    filters: nextFilters,
    source: 'local_fallback',
    confidence: 'high',
    mustHaves,
    niceToHaves,
  };
}

/**
 * Maps structured LLM parsed data into application SearchFilters
 */
export function mapParsedDataToFilters(
  parsed: ParsedQueryData,
  baseFilters: SearchFilters
): SearchFilters {
  const next: SearchFilters = {
    ...baseFilters,
    educationTarget: parsed.educationTarget || baseFilters.educationTarget,
    location: parsed.location || baseFilters.location,
    radiusKm: parsed.radiusKm && parsed.radiusKm > 0 ? parsed.radiusKm : baseFilters.radiusKm,
    budgetMin: parsed.budgetMin !== null && parsed.budgetMin !== undefined ? parsed.budgetMin : baseFilters.budgetMin,
    budgetMax: parsed.budgetMax !== null && parsed.budgetMax !== undefined ? parsed.budgetMax : baseFilters.budgetMax,
    curriculums: parsed.curriculum && parsed.curriculum.length > 0 ? parsed.curriculum : baseFilters.curriculums,
    grade: parsed.grade || baseFilters.grade,
    requiredFacilities: parsed.facilities && parsed.facilities.length > 0 ? parsed.facilities : baseFilters.requiredFacilities,
    preschool: {
      ...baseFilters.preschool,
      programs: parsed.requestedProgram ? [parsed.requestedProgram] : baseFilters.preschool?.programs || [],
      ageYears: parsed.childAge && parsed.childAge <= 5 ? parsed.childAge : baseFilters.preschool?.ageYears,
      pedagogy: parsed.pedagogy && parsed.pedagogy.length > 0 ? parsed.pedagogy : baseFilters.preschool?.pedagogy || [],
      daycare: parsed.daycare !== null && parsed.daycare !== undefined ? parsed.daycare : baseFilters.preschool?.daycare,
      timing: parsed.preferredTimings || baseFilters.preschool?.timing,
    },
  };

  return next;
}

export const CLIENT_LLM_TIMEOUT_MS = 6500;

/**
 * Attempts to parse user query via backend Gemini API with strict timeout and fallback
 */
export async function parseQuery(
  query: string,
  baseFilters: SearchFilters,
  contextLocation?: string
): Promise<ParseResult> {
  if (!query || !query.trim()) {
    return {
      filters: baseFilters,
      source: 'local_fallback',
      confidence: 'high',
      mustHaves: [],
      niceToHaves: [],
    };
  }

  try {
    const response = await apiClient.post<ParsedQueryData | null>(
      '/parse-query',
      { query, contextLocation },
      { timeoutMs: CLIENT_LLM_TIMEOUT_MS, retries: 0 }
    );

    if (response?.data && response.meta?.parsedBy === 'llm') {
      const parsedData = response.data;
      const mappedFilters = mapParsedDataToFilters(parsedData, baseFilters);

      return {
        filters: mappedFilters,
        source: 'llm',
        clarificationNeeded: parsedData.clarificationNeeded,
        confidence: parsedData.confidence || 'high',
        mustHaves: parsedData.mustHavePreferences || [],
        niceToHaves: parsedData.niceToHavePreferences || [],
        parsedData,
      };
    }
  } catch (err) {
    // Graceful fallback to local parser
  }

  return parseQueryLocally(query, baseFilters);
}
