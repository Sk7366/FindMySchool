import { GoogleGenAI, Type, Schema } from '@google/genai';
import { ParsedQueryData } from '../types/api';
import { Curriculum, PreschoolProgram } from '../types/school';

const CHENNAI_NEIGHBOURHOOD_MAP: Record<string, string> = {
  velachery: 'Velachery & Guindy',
  guindy: 'Velachery & Guindy',
  'anna nagar': 'Anna Nagar & Mogappair',
  mogappair: 'Anna Nagar & Mogappair',
  adyar: 'Adyar & Besant Nagar',
  'besant nagar': 'Adyar & Besant Nagar',
  omr: 'OMR / Sholinganallur',
  sholinganallur: 'OMR / Sholinganallur',
  karapakkam: 'OMR / Sholinganallur',
  thoraipakkam: 'OMR / Sholinganallur',
  porur: 'Porur & Manapakkam',
  manapakkam: 'Porur & Manapakkam',
  gerugambakkam: 'Porur & Manapakkam',
  ramapuram: 'Porur & Manapakkam',
  tambaram: 'Tambaram & GST Corridor',
  'gst road': 'Tambaram & GST Corridor',
  chromepet: 'Tambaram & GST Corridor',
  pallavaram: 'Tambaram & GST Corridor',
};

const VALID_CURRICULUMS: Curriculum[] = [
  'CBSE',
  'ICSE',
  'Cambridge (IGCSE)',
  'IB World',
  'State Board',
];

const VALID_PEDAGOGIES = [
  'Montessori',
  'Play-way',
  'Reggio Emilia',
  'Waldorf-inspired',
  'Activity-based',
];

const VALID_PROGRAMS: PreschoolProgram[] = ['playgroup', 'nursery', 'lkg', 'ukg'];

const queryExtractionSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    educationTarget: {
      type: Type.STRING,
      enum: ['all', 'preschool', 'school', 'combined'],
      description: 'Stage target: preschool (under 6 / nursery / KG / daycare), school (Grade 1-12), combined (campus offering preschool through Grade 1+ / K-12), or all',
    },
    childAge: {
      type: Type.NUMBER,
      description: 'Age of child in years if specified (e.g. 3, 4, 8)',
    },
    requestedProgram: {
      type: Type.STRING,
      enum: ['playgroup', 'nursery', 'lkg', 'ukg'],
      description: 'Preschool program level if specified',
    },
    grade: {
      type: Type.STRING,
      description: 'School grade if specified or clearly deduced (e.g. Class 1, Class 3, Class 11)',
    },
    location: {
      type: Type.STRING,
      description: 'Chennai locality or neighborhood mentioned (e.g. Velachery, Anna Nagar, OMR, Adyar, Porur, Tambaram)',
    },
    radiusKm: {
      type: Type.NUMBER,
      description: 'Commute radius in km if specified (e.g. 5, 10, 15, 25)',
    },
    budgetMin: {
      type: Type.NUMBER,
      description: 'Minimum annual fee in INR if specified',
    },
    budgetMax: {
      type: Type.NUMBER,
      description: 'Maximum annual fee in INR if specified (e.g. 50k -> 50000, 1.5L -> 150000)',
    },
    curriculum: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Curriculums mentioned: CBSE, ICSE, Cambridge (IGCSE), IB World, State Board',
    },
    pedagogy: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Learning approach: Montessori, Play-way, Reggio Emilia, Waldorf-inspired, Activity-based',
    },
    facilities: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Required facilities such as Robotics & STEM Lab, Swimming Pool, Cricket Academy & Nets, Football Turf, AC Classrooms',
    },
    daycare: {
      type: Type.BOOLEAN,
      description: 'True if daycare, creche, or full-day care was requested',
    },
    preferredTimings: {
      type: Type.STRING,
      enum: ['morning', 'full_day', 'extended'],
      description: 'Preferred preschool timings if mentioned',
    },
    mustHavePreferences: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Non-negotiable constraints extracted from the query',
    },
    niceToHavePreferences: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Secondary preferences or optional desires',
    },
    clarificationNeeded: {
      type: Type.STRING,
      description: 'Explanation if the query has conflicting requirements (e.g. 3yo child in Class 10) or ambiguous intent',
    },
    confidence: {
      type: Type.STRING,
      enum: ['high', 'medium', 'needs_clarification'],
      description: 'Confidence in extracting unambiguous search parameters',
    },
  },
  required: ['educationTarget', 'mustHavePreferences', 'niceToHavePreferences', 'confidence'],
};

export interface ParseQueryOptions {
  query: string;
  contextLocation?: string;
  timeoutMs?: number;
}

export interface ParseQueryResult {
  success: boolean;
  parsed?: ParsedQueryData;
  error?: string;
  source: 'llm' | 'local_fallback';
  model?: string;
  executionTimeMs: number;
}

/**
 * Normalizes and sanitizes model output against validated application domains
 */
export function sanitizeParsedData(raw: any): ParsedQueryData {
  let target = raw.educationTarget;
  if (!['all', 'preschool', 'school', 'combined'].includes(target)) {
    target = 'all';
  }

  // Location normalization
  let normalizedLocation: string | null = null;
  if (typeof raw.location === 'string' && raw.location.trim()) {
    const locLower = raw.location.toLowerCase().trim();
    for (const [key, mappedLoc] of Object.entries(CHENNAI_NEIGHBOURHOOD_MAP)) {
      if (locLower.includes(key) || key.includes(locLower)) {
        normalizedLocation = mappedLoc;
        break;
      }
    }
    if (!normalizedLocation && raw.location.toLowerCase().includes('chennai')) {
      normalizedLocation = 'All Chennai';
    }
  }

  // Curriculums sanitization
  const cleanCurriculums: Curriculum[] = [];
  if (Array.isArray(raw.curriculum)) {
    for (const c of raw.curriculum) {
      if (typeof c !== 'string') continue;
      const lowerC = c.toLowerCase();
      if (lowerC.includes('cbse')) cleanCurriculums.push('CBSE');
      else if (lowerC.includes('icse')) cleanCurriculums.push('ICSE');
      else if (lowerC.includes('cambridge') || lowerC.includes('igcse')) cleanCurriculums.push('Cambridge (IGCSE)');
      else if (lowerC.includes('ib') || lowerC.includes('baccalaureate')) cleanCurriculums.push('IB World');
      else if (lowerC.includes('state')) cleanCurriculums.push('State Board');
    }
  }

  // Pedagogy sanitization
  const cleanPedagogies: string[] = [];
  if (Array.isArray(raw.pedagogy)) {
    for (const p of raw.pedagogy) {
      if (typeof p !== 'string') continue;
      const match = VALID_PEDAGOGIES.find((vp) => vp.toLowerCase() === p.toLowerCase());
      if (match && !cleanPedagogies.includes(match)) {
        cleanPedagogies.push(match);
      }
    }
  }

  // Facilities sanitization
  const cleanFacilities: string[] = [];
  if (Array.isArray(raw.facilities)) {
    for (const f of raw.facilities) {
      if (typeof f !== 'string') continue;
      const fLower = f.toLowerCase();
      if ((fLower.includes('robot') || fLower.includes('stem')) && !cleanFacilities.includes('Robotics & STEM Lab')) {
        cleanFacilities.push('Robotics & STEM Lab');
      } else if (fLower.includes('swim') && !cleanFacilities.includes('Swimming Pool')) {
        cleanFacilities.push('Swimming Pool');
      } else if (fLower.includes('cricket') && !cleanFacilities.includes('Cricket Academy & Nets')) {
        cleanFacilities.push('Cricket Academy & Nets');
      } else if (fLower.includes('football') && !cleanFacilities.includes('Football Turf')) {
        cleanFacilities.push('Football Turf');
      } else if ((fLower.includes('transport') || fLower.includes('bus')) && !cleanFacilities.includes('Transport Available')) {
        cleanFacilities.push('Transport Available');
      }
    }
  }

  // Program sanitization
  let cleanProgram: PreschoolProgram | null = null;
  if (typeof raw.requestedProgram === 'string') {
    const progLower = raw.requestedProgram.toLowerCase() as PreschoolProgram;
    if (VALID_PROGRAMS.includes(progLower)) {
      cleanProgram = progLower;
    }
  }

  // Grade sanitization
  let cleanGrade: string | null = null;
  if (typeof raw.grade === 'string' && raw.grade.trim()) {
    const gMatch = raw.grade.match(/(?:class|grade)\s*(\d+)/i);
    if (gMatch && gMatch[1]) {
      cleanGrade = `Class ${gMatch[1]}`;
    } else if (raw.grade.toLowerCase().includes('any')) {
      cleanGrade = 'Any Grade';
    }
  }

  // Child age & grade conflict detection
  let clarificationNeeded = typeof raw.clarificationNeeded === 'string' ? raw.clarificationNeeded : null;
  const childAge = typeof raw.childAge === 'number' && !isNaN(raw.childAge) ? raw.childAge : null;

  if (childAge !== null && cleanGrade) {
    const classNum = parseInt(cleanGrade.replace(/[^0-9]/g, ''), 10);
    if (!isNaN(classNum)) {
      if (childAge <= 4 && classNum >= 1) {
        clarificationNeeded = `Your search specified a ${childAge}-year-old child and ${cleanGrade}. Class ${classNum} typically starts at age ${classNum + 5}. Please clarify whether you are seeking preschool/KG or elementary grade.`;
      }
    }
  }

  // Budget validation
  const budgetMin = typeof raw.budgetMin === 'number' && raw.budgetMin >= 0 ? raw.budgetMin : null;
  const budgetMax = typeof raw.budgetMax === 'number' && raw.budgetMax > 0 ? raw.budgetMax : null;

  return {
    educationTarget: target,
    childAge,
    requestedProgram: cleanProgram,
    grade: cleanGrade,
    location: normalizedLocation,
    radiusKm: typeof raw.radiusKm === 'number' && raw.radiusKm > 0 ? raw.radiusKm : null,
    budgetMin,
    budgetMax,
    curriculum: cleanCurriculums.length > 0 ? cleanCurriculums : undefined,
    pedagogy: cleanPedagogies.length > 0 ? cleanPedagogies : undefined,
    facilities: cleanFacilities.length > 0 ? cleanFacilities : undefined,
    daycare: typeof raw.daycare === 'boolean' ? raw.daycare : null,
    preferredTimings: ['morning', 'full_day', 'extended'].includes(raw.preferredTimings) ? raw.preferredTimings : null,
    mustHavePreferences: Array.isArray(raw.mustHavePreferences) ? raw.mustHavePreferences.filter((x: any) => typeof x === 'string') : [],
    niceToHavePreferences: Array.isArray(raw.niceToHavePreferences) ? raw.niceToHavePreferences.filter((x: any) => typeof x === 'string') : [],
    clarificationNeeded,
    confidence: ['high', 'medium', 'needs_clarification'].includes(raw.confidence) ? raw.confidence : (clarificationNeeded ? 'needs_clarification' : 'high'),
  };
}

/**
 * Server-side LLM query parser using @google/genai
 */
export async function parseQueryWithGemini(options: ParseQueryOptions): Promise<ParseQueryResult> {
  const startTime = Date.now();
  const { query, contextLocation, timeoutMs = 6000 } = options;

  // Feature flag check
  const isEnabled = process.env.ENABLE_LLM_QUERY_PARSER !== 'false';
  const apiKey = process.env.GEMINI_API_KEY;

  if (!isEnabled) {
    return {
      success: false,
      source: 'local_fallback',
      error: 'LLM query parsing is disabled via ENABLE_LLM_QUERY_PARSER flag',
      executionTimeMs: Date.now() - startTime,
    };
  }

  if (!apiKey || apiKey.trim() === '' || apiKey === 'MY_GEMINI_API_KEY') {
    return {
      success: false,
      source: 'local_fallback',
      error: 'GEMINI_API_KEY is not configured on the server',
      executionTimeMs: Date.now() - startTime,
    };
  }

  // Model selection: default to gemini-3.5-flash (operational model confirmed in environment audit)
  const modelName = process.env.GEMINI_MODEL || 'gemini-3.5-flash';

  const abortController = new AbortController();
  let timer: NodeJS.Timeout | null = null;

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const systemInstruction = `You are a precision search intent extractor for FindMySchool, an education discovery portal for Chennai, India.
Your responsibility:
1. Extract parent requirements into validated structured JSON.
2. DO NOT hallucinate, assume, or invent preferences not indicated in the query.
3. Understand Chennai neighborhood names (Velachery, Anna Nagar, Adyar, OMR, Porur, Tambaram, Guindy, Besant Nagar, Sholinganallur, Mogappair, etc.).
4. Differentiate between:
   - "preschool": early childhood under 6 yrs (Playgroup, Nursery, LKG, UKG, daycare)
   - "school": K-12 grades (Class 1 to 12, CBSE, ICSE, Cambridge/IGCSE, IB)
   - "combined": campus offering both preschool and primary/secondary (e.g. "preschool through grade 12", "playschool to class 12", "k-12")
5. For age:
   - <= 2.5 yrs -> playgroup
   - 2.5 - 3.5 yrs -> nursery
   - 3.5 - 4.5 yrs -> lkg
   - 4.5 - 5.5 yrs -> ukg
   - If child is 6+ years old without an explicit grade, calculate grade as Class (Age - 5), e.g., 8-year-old -> Class 3.
   - If parent explicitly stated a grade (e.g., "Class 11"), ALWAYS preserve the explicitly stated grade!
   - If age and grade blatantly conflict (e.g., 3-year-old and Class 10), populate clarificationNeeded explaining the contradiction.
6. Budgets:
   - Extract numeric amounts in INR.
   - "50k" -> 50000, "1.5L" / "1.5 lakh" -> 150000, "2L" -> 200000.
7. Return strictly valid JSON adhering to the provided schema.`;

    const userPrompt = contextLocation
      ? `Parent query: "${query}"\nUser location context: "${contextLocation}"`
      : `Parent query: "${query}"`;

    // Timeout via Promise.race with active AbortSignal cancellation
    const timeoutPromise = new Promise<never>((_, reject) => {
      timer = setTimeout(() => {
        abortController.abort();
        reject(new Error(`LLM parse request timed out after ${timeoutMs}ms`));
      }, timeoutMs);
    });

    const callPromise = ai.models.generateContent({
      model: modelName,
      contents: userPrompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: queryExtractionSchema,
        temperature: 0.1,
        abortSignal: abortController.signal,
      },
    });

    // Prevent unhandled promise rejection if abort completes after timeoutPromise settled
    callPromise.catch(() => {});

    const response = await Promise.race([callPromise, timeoutPromise]);
    const rawText = response.text;

    if (!rawText) {
      throw new Error('Empty response received from LLM');
    }

    const parsedJson = JSON.parse(rawText);
    const sanitized = sanitizeParsedData(parsedJson);

    return {
      success: true,
      parsed: sanitized,
      source: 'llm',
      model: modelName,
      executionTimeMs: Date.now() - startTime,
    };
  } catch (err: any) {
    const isTimeout =
      abortController.signal.aborted ||
      err?.name === 'AbortError' ||
      err?.message?.includes('timed out');

    return {
      success: false,
      source: 'local_fallback',
      error: isTimeout
        ? `LLM parse request timed out after ${timeoutMs}ms`
        : err?.message || 'Failed to parse query with LLM',
      executionTimeMs: Date.now() - startTime,
    };
  } finally {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  }
}
