import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { SearchState, SearchFilters, SortField, EducationTargetType, UpdateFiltersPayload, SavedSearch, RecentSearch } from '../types/search';
import { School, Curriculum, SchoolType, PreschoolProgram } from '../types/school';
import { CHENNAI_SCHOOLS } from '../data/schools';
import { calculateSchoolFitScore } from '../utils/preschoolScoring';

export const DEFAULT_FILTERS: SearchFilters = {
  location: 'All Chennai',
  radiusKm: 25,
  budgetMin: 30000,
  budgetMax: 350000,
  educationTarget: 'all',

  // K-12 defaults (clean initial state without pre-populated criteria)
  grade: 'Any Grade',
  curriculums: [],
  schoolTypes: [],
  requiredFacilities: [],
  requiredActivities: [],
  requiresTransport: false,
  requiresHostel: false,
  requiresSpecialNeeds: false,

  // Preschool defaults
  preschool: {
    programs: [],
    pedagogy: [],
    daycare: false,
    outdoorPlay: false,
  },
};

interface SearchContextType {
  searchState: SearchState;
  setSearchState: React.Dispatch<React.SetStateAction<SearchState>>;
  updateFilters: (partial: UpdateFiltersPayload) => void;
  setEducationTarget: (target: EducationTargetType) => void;
  setRawQuery: (query: string) => void;
  setSortBy: (sortBy: SortField) => void;
  resetFilters: () => void;
  applyNaturalLanguageQuery: (query: string) => void;
  filteredSchools: School[];
  totalMatches: number;
  activeFilterCount: number;

  // Saved & Recent Searches
  recentSearches: RecentSearch[];
  savedSearches: SavedSearch[];
  addRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;
  saveCurrentSearch: (name?: string) => void;
  removeSavedSearch: (id: string) => void;
  clearSavedSearches: () => void;
  isDemoSearches: boolean;
  loadDemoSearches: () => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const SearchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [searchState, setSearchState] = useState<SearchState>(() => {
    const saved = localStorage.getItem('fms_search_state');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object' && parsed.filters) {
          const safeFilters: SearchFilters = {
            ...DEFAULT_FILTERS,
            ...parsed.filters,
            preschool: {
              ...DEFAULT_FILTERS.preschool,
              ...(parsed.filters.preschool || {}),
              programs: Array.isArray(parsed.filters.preschool?.programs) ? parsed.filters.preschool.programs : [],
              pedagogy: Array.isArray(parsed.filters.preschool?.pedagogy) ? parsed.filters.preschool.pedagogy : [],
            },
            curriculums: Array.isArray(parsed.filters.curriculums) ? parsed.filters.curriculums : DEFAULT_FILTERS.curriculums,
            schoolTypes: Array.isArray(parsed.filters.schoolTypes) ? parsed.filters.schoolTypes : DEFAULT_FILTERS.schoolTypes,
            requiredFacilities: Array.isArray(parsed.filters.requiredFacilities) ? parsed.filters.requiredFacilities : DEFAULT_FILTERS.requiredFacilities,
            requiredActivities: Array.isArray(parsed.filters.requiredActivities) ? parsed.filters.requiredActivities : [],
          };
          return {
            rawQuery: typeof parsed.rawQuery === 'string' ? parsed.rawQuery : '',
            filters: safeFilters,
            sortBy: parsed.sortBy || 'best_match',
          };
        }
      } catch (e) {
        // fallback
      }
    }
    // Clean initial first visit state: empty raw query and unconstrained defaults
    return {
      rawQuery: '',
      filters: DEFAULT_FILTERS,
      sortBy: 'best_match',
    };
  });

  // Recent searches: strictly empty on fresh first visit
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>(() => {
    try {
      const stored = localStorage.getItem('fms_recent_searches');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
      return [];
    } catch {
      return [];
    }
  });

  // Saved searches: strictly empty on fresh first visit
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>(() => {
    try {
      const stored = localStorage.getItem('fms_saved_searches');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
      return [];
    } catch {
      return [];
    }
  });

  const [isDemoSearches, setIsDemoSearches] = useState<boolean>(() => {
    try {
      return localStorage.getItem('fms_searches_is_demo') === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('fms_search_state', JSON.stringify(searchState));
    } catch {
      // ignore quota or private browsing errors
    }
  }, [searchState]);

  useEffect(() => {
    try {
      localStorage.setItem('fms_recent_searches', JSON.stringify(recentSearches));
      if (recentSearches.length === 0 && isDemoSearches) {
        setIsDemoSearches(false);
        localStorage.removeItem('fms_searches_is_demo');
      }
    } catch {}
  }, [recentSearches, isDemoSearches]);

  useEffect(() => {
    try {
      localStorage.setItem('fms_saved_searches', JSON.stringify(savedSearches));
    } catch {}
  }, [savedSearches]);

  const addRecentSearch = (query: string) => {
    if (!query || !query.trim()) return;
    const clean = query.trim();
    setRecentSearches((prev) => {
      const filtered = prev.filter((r) => r.query.toLowerCase() !== clean.toLowerCase());
      return [
        { id: `rs-${Date.now()}`, query: clean, timestamp: new Date().toISOString() },
        ...filtered,
      ].slice(0, 10);
    });
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    setIsDemoSearches(false);
    try {
      localStorage.removeItem('fms_searches_is_demo');
    } catch {}
  };

  const saveCurrentSearch = (name?: string) => {
    const query = searchState.rawQuery || 'All Chennai Institutions';
    const label = name || (searchState.rawQuery ? `"${searchState.rawQuery.slice(0, 32)}"` : 'Custom Search');
    const newSaved: SavedSearch = {
      id: `ss-${Date.now()}`,
      name: label,
      query: searchState.rawQuery,
      filters: { ...searchState.filters },
      createdAt: new Date().toISOString(),
    };
    setSavedSearches((prev) => [newSaved, ...prev]);
  };

  const removeSavedSearch = (id: string) => {
    setSavedSearches((prev) => prev.filter((s) => s.id !== id));
  };

  const clearSavedSearches = () => {
    setSavedSearches([]);
  };

  const loadDemoSearches = () => {
    setIsDemoSearches(true);
    setRecentSearches([
      { id: 'demo-rs-1', query: 'Montessori preschool near Velachery with daycare', timestamp: new Date().toISOString(), isDemo: true },
      { id: 'demo-rs-2', query: 'CBSE school near Anna Nagar under ₹1.5L with sports', timestamp: new Date().toISOString(), isDemo: true },
    ]);
    setSavedSearches([
      {
        id: 'demo-ss-1',
        name: 'Velachery Montessori + Daycare (Demo)',
        query: 'Montessori preschool near Velachery with daycare',
        filters: { ...DEFAULT_FILTERS, location: 'Velachery & Guindy', preschool: { programs: ['nursery'], pedagogy: ['Montessori'], daycare: true, outdoorPlay: true } },
        createdAt: new Date().toISOString(),
        isDemo: true,
      },
    ]);
    try {
      localStorage.setItem('fms_searches_is_demo', 'true');
    } catch {}
  };

  const updateFilters = (partial: UpdateFiltersPayload) => {
    setSearchState((prev) => {
      const currentPreschool = prev.filters?.preschool || DEFAULT_FILTERS.preschool;
      return {
        ...prev,
        filters: {
          ...prev.filters,
          ...partial,
          preschool: {
            ...currentPreschool,
            ...(partial.preschool || {}),
          },
        },
      };
    });
  };

  const setEducationTarget = (educationTarget: EducationTargetType) => {
    updateFilters({ educationTarget });
  };

  const setRawQuery = (rawQuery: string) => {
    setSearchState((prev) => ({ ...prev, rawQuery }));
  };

  const setSortBy = (sortBy: SortField) => {
    setSearchState((prev) => ({ ...prev, sortBy }));
  };

  const resetFilters = () => {
    setSearchState({
      rawQuery: '',
      filters: {
        location: 'All Chennai',
        radiusKm: 25,
        budgetMin: 30000,
        budgetMax: 350000,
        educationTarget: 'all',
        grade: 'Any Grade',
        curriculums: [],
        schoolTypes: [],
        requiredFacilities: [],
        requiredActivities: [],
        requiresTransport: false,
        requiresHostel: false,
        requiresSpecialNeeds: false,
        preschool: {
          programs: [],
          pedagogy: [],
          daycare: false,
          outdoorPlay: false,
        },
      },
      sortBy: 'best_match',
    });
  };

  // Natural language query processor that updates structured filters
  const applyNaturalLanguageQuery = (query: string) => {
    const lower = query.toLowerCase();
    const newFilters: SearchFilters = {
      ...searchState.filters,
      preschool: { ...searchState.filters.preschool },
    };

    // 1. Detect Education Target: Preschool vs School vs Combined
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

    const hasSchoolKeyword =
      lower.includes('class') ||
      lower.includes('grade') ||
      lower.includes('cbse') ||
      lower.includes('icse') ||
      lower.includes('cambridge') ||
      lower.includes('igcse') ||
      lower.includes('high school') ||
      lower.includes('secondary');

    if (lower.includes('preschool and') || lower.includes('preschool +') || lower.includes('grade 1 onwards') || (hasPreschoolKeyword && hasSchoolKeyword)) {
      newFilters.educationTarget = 'combined';
    } else if (hasPreschoolKeyword) {
      newFilters.educationTarget = 'preschool';
    } else if (hasSchoolKeyword) {
      newFilters.educationTarget = 'school';
    }

    // 2. Extract Location
    if (lower.includes('tambaram')) {
      newFilters.location = 'Tambaram & GST Corridor';
    } else if (lower.includes('omr') || lower.includes('sholinganallur') || lower.includes('karapakkam')) {
      newFilters.location = 'OMR / Sholinganallur';
    } else if (lower.includes('adyar') || lower.includes('besant nagar')) {
      newFilters.location = 'Adyar & Besant Nagar';
    } else if (lower.includes('anna nagar') || lower.includes('mogappair')) {
      newFilters.location = 'Anna Nagar & Mogappair';
    } else if (lower.includes('porur') || lower.includes('manapakkam') || lower.includes('gerugambakkam')) {
      newFilters.location = 'Porur & Manapakkam';
    } else if (lower.includes('velachery') || lower.includes('guindy')) {
      newFilters.location = 'Velachery & Guindy';
    }

    // 3. Extract Budget
    if (lower.includes('50k') || lower.includes('50,000') || lower.includes('50 thousand')) {
      newFilters.budgetMax = 50000;
    } else if (lower.includes('80,000') || lower.includes('80k') || lower.includes('80 thousand')) {
      newFilters.budgetMax = 80000;
    } else if (lower.includes('1 lakh') || lower.includes('1l') || lower.includes('1,00,000')) {
      newFilters.budgetMax = 100000;
    } else if (lower.includes('1.2') || lower.includes('1.2l') || lower.includes('1.2 lakh')) {
      newFilters.budgetMax = 125000;
    } else if (lower.includes('1.5') || lower.includes('1.5 lakh')) {
      newFilters.budgetMax = 150000;
    } else if (lower.includes('2 lakh') || lower.includes('2l')) {
      newFilters.budgetMax = 200000;
    }

    // 4. Preschool specific: Age and Programs
    const ageMatch = lower.match(/(\d+)[ -]year[ -]old/) || lower.match(/(\d+)\s*years/);
    if (ageMatch && ageMatch[1]) {
      const age = parseInt(ageMatch[1], 10);
      newFilters.preschool.ageYears = age;
      if (age <= 2.5) {
        newFilters.preschool.programs = ['playgroup'];
      } else if (age <= 3.5) {
        newFilters.preschool.programs = ['nursery'];
      } else if (age <= 4.5) {
        newFilters.preschool.programs = ['lkg'];
      } else {
        newFilters.preschool.programs = ['ukg'];
      }
    }

    const preschoolProgs: PreschoolProgram[] = [];
    if (lower.includes('playgroup') || lower.includes('toddler')) preschoolProgs.push('playgroup');
    if (lower.includes('nursery')) preschoolProgs.push('nursery');
    if (lower.includes('lkg') || lower.includes('junior kg')) preschoolProgs.push('lkg');
    if (lower.includes('ukg') || lower.includes('senior kg')) preschoolProgs.push('ukg');
    if (preschoolProgs.length > 0) {
      newFilters.preschool.programs = preschoolProgs;
    }

    // 5. Preschool specific: Learning Approach / Pedagogy
    const pedagogyList: string[] = [];
    if (lower.includes('montessori')) pedagogyList.push('Montessori');
    if (lower.includes('play-way') || lower.includes('play way') || lower.includes('playway')) pedagogyList.push('Play-way');
    if (lower.includes('reggio')) pedagogyList.push('Reggio Emilia');
    if (lower.includes('waldorf') || lower.includes('steiner')) pedagogyList.push('Waldorf-inspired');
    if (lower.includes('activity')) pedagogyList.push('Activity-based');
    if (pedagogyList.length > 0) {
      newFilters.preschool.pedagogy = pedagogyList;
    }

    // 6. Childcare & Daycare
    if (lower.includes('daycare') || lower.includes('day care') || lower.includes('creche')) {
      newFilters.preschool.daycare = true;
    }
    if (lower.includes('extended') || lower.includes('late hours') || lower.includes('working parent')) {
      newFilters.preschool.extendedHours = true;
    }
    if (lower.includes('meal') || lower.includes('snack') || lower.includes('food')) {
      newFilters.preschool.meals = true;
    }

    // 7. Facilities (Outdoor play, splash, robotics, swimming)
    if (lower.includes('outdoor play') || lower.includes('outdoor') || lower.includes('garden') || lower.includes('sand pit')) {
      newFilters.preschool.outdoorPlay = true;
    }
    if (lower.includes('indoor play') || lower.includes('soft play')) {
      newFilters.preschool.indoorPlay = true;
    }

    // K-12 facilities
    const facilities: string[] = [];
    if (lower.includes('robotics') || lower.includes('stem')) facilities.push('Robotics & STEM Lab');
    if (lower.includes('swimming') || lower.includes('pool')) facilities.push('Swimming Pool');
    if (lower.includes('cricket')) facilities.push('Cricket Academy & Nets');
    if (lower.includes('football') || lower.includes('turf')) facilities.push('Football Turf');
    if (facilities.length > 0) {
      newFilters.requiredFacilities = facilities;
    }

    // 8. Transport
    if (lower.includes('transport') || lower.includes('bus') || lower.includes('van')) {
      newFilters.requiresTransport = true;
      newFilters.preschool.transport = true;
    }

    // 9. Curriculum for K-12
    const curriculums: Curriculum[] = [];
    if (lower.includes('cbse')) curriculums.push('CBSE');
    if (lower.includes('icse')) curriculums.push('ICSE');
    if (lower.includes('cambridge') || lower.includes('igcse')) curriculums.push('Cambridge (IGCSE)');
    if (lower.includes('ib') || lower.includes('international baccalaureate')) curriculums.push('IB World');
    if (curriculums.length > 0) {
      newFilters.curriculums = curriculums;
    }

    // 10. Radius & Grade
    const kmMatch = lower.match(/(\d+)\s*km/);
    if (kmMatch && kmMatch[1]) {
      newFilters.radiusKm = parseInt(kmMatch[1], 10);
    }
    const gradeMatch = lower.match(/class\s*(\d+)/) || lower.match(/grade\s*(\d+)/);
    if (gradeMatch && gradeMatch[1]) {
      newFilters.grade = `Class ${gradeMatch[1]}`;
    }

    if (query.trim()) {
      addRecentSearch(query.trim());
    }

    setSearchState({
      rawQuery: query,
      filters: newFilters,
      sortBy: 'best_match',
    });
  };

  // Filter and dynamic scoring computation
  const filteredSchools = useMemo(() => {
    const { filters, sortBy } = searchState;

    const list = CHENNAI_SCHOOLS.filter((school) => {
      // 1. Education target filtering
      const isEarlyYearsInst = school.institutionType === 'preschool';
      const isCombined = school.institutionType === 'combined';
      const isStandardSchool = !school.institutionType || school.institutionType === 'school';

      if (filters.educationTarget === 'preschool') {
        if (!isEarlyYearsInst && !isCombined) return false;
      } else if (filters.educationTarget === 'school') {
        if (!isStandardSchool && !isCombined) return false;
      } else if (filters.educationTarget === 'combined') {
        if (!isCombined) return false;
      }

      // 2. Distance filter
      if (filters.radiusKm > 0 && school.distanceKm > filters.radiusKm + 4) {
        return false;
      }

      // 3. Location corridor filter (if not "All Chennai")
      if (filters.location && filters.location !== 'All Chennai') {
        const normLoc = filters.location.toLowerCase();
        const schoolArea = (school.area + ' ' + school.neighbourhood.area).toLowerCase();
        // Match key parts
        if (normLoc.includes('tambaram') && !schoolArea.includes('tambaram') && !schoolArea.includes('mudichur')) {
          if (school.distanceKm > 10) return false;
        } else if (normLoc.includes('omr') && !schoolArea.includes('omr') && !schoolArea.includes('sholinganallur') && !schoolArea.includes('karapakkam')) {
          if (school.distanceKm > 10) return false;
        } else if (normLoc.includes('adyar') && !schoolArea.includes('adyar') && !schoolArea.includes('besant')) {
          if (school.distanceKm > 10) return false;
        } else if (normLoc.includes('anna nagar') && !schoolArea.includes('anna nagar') && !schoolArea.includes('mogappair')) {
          if (school.distanceKm > 10) return false;
        } else if (normLoc.includes('porur') && !schoolArea.includes('porur') && !schoolArea.includes('gerugambakkam') && !schoolArea.includes('kolapakkam')) {
          if (school.distanceKm > 10) return false;
        } else if (normLoc.includes('velachery') && !schoolArea.includes('velachery') && !schoolArea.includes('guindy')) {
          if (school.distanceKm > 10) return false;
        }
      }

      // 4. Budget filter (minimum fee <= budgetMax with 20% grace)
      if (filters.budgetMax > 0 && school.annualFeeMin > filters.budgetMax * 1.25) {
        return false;
      }

      // 5. Preschool specific filters
      if (isEarlyYearsInst || (isCombined && filters.educationTarget === 'preschool')) {
        const pFilters = filters.preschool || DEFAULT_FILTERS.preschool;
        // Program filter
        if (pFilters.programs && pFilters.programs.length > 0) {
          const supported = school.preschoolPrograms || [];
          const hasProg = pFilters.programs.some((p) => supported.includes(p));
          if (!hasProg) return false;
        }

        // Pedagogy filter
        if (pFilters.pedagogy && pFilters.pedagogy.length > 0) {
          const supportedPedagogy = (school.pedagogy || []).map((p) => p.toLowerCase());
          const hasPedagogy = pFilters.pedagogy.some((req) =>
            supportedPedagogy.some((sp) => sp.includes(req.toLowerCase()))
          );
          if (!hasPedagogy) return false;
        }

        // Daycare filter
        if (pFilters.daycare && !school.daycare) {
          return false;
        }

        // Outdoor play filter
        if (pFilters.outdoorPlay && !school.outdoorPlay) {
          return false;
        }
      }

      // 6. Regular K-12 specific filters (only apply when not strictly filtering dedicated preschools)
      if (!isEarlyYearsInst && filters.educationTarget !== 'preschool') {
        const currs = filters.curriculums || [];
        if (currs.length > 0) {
          const hasCurriculum = (school.curriculum || []).some((c) => currs.includes(c));
          if (!hasCurriculum) return false;
        }

        const sTypes = filters.schoolTypes || [];
        if (sTypes.length > 0) {
          const hasType = (school.schoolType || []).some((t) => sTypes.includes(t));
          if (!hasType) return false;
        }

        if (filters.requiresSpecialNeeds && !school.hasSpecialNeedsSupport) {
          return false;
        }

        if (filters.requiresHostel && !school.hasHostel) {
          return false;
        }
      }

      return true;
    });

    // Compute dynamic fit score for each candidate school based on current priorities
    const scoredList = list.map((school) => {
      const dynamicScore = calculateSchoolFitScore(school, filters);
      return {
        ...school,
        matchScore: dynamicScore,
      };
    });

    // Dynamic sort
    return scoredList.sort((a, b) => {
      switch (sortBy) {
        case 'distance_asc':
          return a.distanceKm - b.distanceKm;
        case 'fee_asc':
          return a.annualFeeMin - b.annualFeeMin;
        case 'fee_desc':
          return b.annualFeeMax - a.annualFeeMax;
        case 'rating_desc':
          return b.rating - a.rating;
        case 'best_match':
        default:
          return b.matchScore - a.matchScore;
      }
    });
  }, [searchState]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    const f = searchState.filters || DEFAULT_FILTERS;
    if (f.educationTarget && f.educationTarget !== 'all') count += 1;
    if (f.curriculums?.length) count += f.curriculums.length;
    if (f.schoolTypes?.length) count += f.schoolTypes.length;
    if (f.requiredFacilities?.length) count += f.requiredFacilities.length;
    if (typeof f.budgetMax === 'number' && f.budgetMax < 250000) count += 1;
    if (typeof f.radiusKm === 'number' && f.radiusKm < 20) count += 1;
    if (f.requiresSpecialNeeds) count += 1;
    if (f.requiresHostel) count += 1;

    // Preschool count
    if (f.preschool?.programs?.length) count += f.preschool.programs.length;
    if (f.preschool?.pedagogy?.length) count += f.preschool.pedagogy.length;
    if (f.preschool?.daycare) count += 1;
    if (f.preschool?.outdoorPlay) count += 1;
    if (f.preschool?.ageYears) count += 1;

    return count;
  }, [searchState.filters]);

  return (
    <SearchContext.Provider
      value={{
        searchState,
        setSearchState,
        updateFilters,
        setEducationTarget,
        setRawQuery,
        setSortBy,
        resetFilters,
        applyNaturalLanguageQuery,
        filteredSchools,
        totalMatches: filteredSchools.length,
        activeFilterCount,
        recentSearches,
        savedSearches,
        addRecentSearch,
        clearRecentSearches,
        saveCurrentSearch,
        removeSavedSearch,
        clearSavedSearches,
        isDemoSearches,
        loadDemoSearches,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};
