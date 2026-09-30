import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { SearchState, SearchFilters, SortField } from '../types/search';
import { School, Curriculum, SchoolType } from '../types/school';
import { CHENNAI_SCHOOLS } from '../data/schools';

const DEFAULT_FILTERS: SearchFilters = {
  location: 'Tambaram / South Chennai',
  radiusKm: 10,
  grade: 'Class 5',
  budgetMin: 40000,
  budgetMax: 140000,
  curriculums: ['CBSE'],
  schoolTypes: ['Co-educational'],
  requiredFacilities: ['Robotics & STEM Lab', 'Swimming Pool'],
  requiredActivities: [],
  requiresTransport: true,
  requiresHostel: false,
  requiresSpecialNeeds: false,
};

interface SearchContextType {
  searchState: SearchState;
  setSearchState: React.Dispatch<React.SetStateAction<SearchState>>;
  updateFilters: (partial: Partial<SearchFilters>) => void;
  setRawQuery: (query: string) => void;
  setSortBy: (sortBy: SortField) => void;
  resetFilters: () => void;
  applyNaturalLanguageQuery: (query: string) => void;
  filteredSchools: School[];
  totalMatches: number;
  activeFilterCount: number;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const SearchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [searchState, setSearchState] = useState<SearchState>(() => {
    const saved = localStorage.getItem('fms_search_state');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return {
      rawQuery: "CBSE school near Tambaram / OMR under ₹1.2 lakh/year with robotics and swimming",
      filters: DEFAULT_FILTERS,
      sortBy: 'best_match',
    };
  });

  useEffect(() => {
    localStorage.setItem('fms_search_state', JSON.stringify(searchState));
  }, [searchState]);

  const updateFilters = (partial: Partial<SearchFilters>) => {
    setSearchState((prev) => ({
      ...prev,
      filters: {
        ...prev.filters,
        ...partial,
      },
    }));
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
        grade: 'Any Grade',
        budgetMin: 40000,
        budgetMax: 350000,
        curriculums: [],
        schoolTypes: [],
        requiredFacilities: [],
        requiredActivities: [],
        requiresTransport: false,
        requiresHostel: false,
        requiresSpecialNeeds: false,
      },
      sortBy: 'best_match',
    });
  };

  // Natural language query processor that updates the structured filters
  const applyNaturalLanguageQuery = (query: string) => {
    const lower = query.toLowerCase();
    const newFilters = { ...searchState.filters };

    // Extract location
    if (lower.includes('tambaram')) {
      newFilters.location = 'Tambaram & GST Corridor';
    } else if (lower.includes('omr') || lower.includes('sholinganallur')) {
      newFilters.location = 'OMR / Sholinganallur';
    } else if (lower.includes('adyar')) {
      newFilters.location = 'Adyar & Besant Nagar';
    } else if (lower.includes('anna nagar')) {
      newFilters.location = 'Anna Nagar & Mogappair';
    } else if (lower.includes('porur')) {
      newFilters.location = 'Porur & Manapakkam';
    }

    // Extract budget
    if (lower.includes('1 lakh') || lower.includes('1l') || lower.includes('1,00,000')) {
      newFilters.budgetMax = 100000;
    } else if (lower.includes('1.2') || lower.includes('1.2l') || lower.includes('1.2 lakh')) {
      newFilters.budgetMax = 125000;
    } else if (lower.includes('1.5') || lower.includes('1.5 lakh')) {
      newFilters.budgetMax = 150000;
    } else if (lower.includes('2 lakh') || lower.includes('2l')) {
      newFilters.budgetMax = 200000;
    }

    // Extract curriculum
    const curriculums: Curriculum[] = [];
    if (lower.includes('cbse')) curriculums.push('CBSE');
    if (lower.includes('icse')) curriculums.push('ICSE');
    if (lower.includes('cambridge') || lower.includes('igcse')) curriculums.push('Cambridge (IGCSE)');
    if (lower.includes('ib') || lower.includes('international baccalaureate')) curriculums.push('IB World');
    if (curriculums.length > 0) {
      newFilters.curriculums = curriculums;
    }

    // Extract facilities
    const facilities: string[] = [];
    if (lower.includes('robotics') || lower.includes('stem')) facilities.push('Robotics & STEM Lab');
    if (lower.includes('swimming') || lower.includes('pool')) facilities.push('Swimming Pool');
    if (lower.includes('cricket')) facilities.push('Cricket Academy & Nets');
    if (lower.includes('football') || lower.includes('turf')) facilities.push('Football Turf');
    if (facilities.length > 0) {
      newFilters.requiredFacilities = facilities;
    }

    // Extract radius
    const kmMatch = lower.match(/(\d+)\s*km/);
    if (kmMatch && kmMatch[1]) {
      newFilters.radiusKm = parseInt(kmMatch[1], 10);
    }

    // Extract grade
    const gradeMatch = lower.match(/class\s*(\d+)/) || lower.match(/grade\s*(\d+)/);
    if (gradeMatch && gradeMatch[1]) {
      newFilters.grade = `Class ${gradeMatch[1]}`;
    }

    setSearchState({
      rawQuery: query,
      filters: newFilters,
      sortBy: 'best_match',
    });
  };

  // Filter and sort computation
  const filteredSchools = useMemo(() => {
    const { filters, sortBy } = searchState;

    const list = CHENNAI_SCHOOLS.filter((school) => {
      // Distance filter
      if (school.distanceKm > filters.radiusKm + 3) {
        // give small grace room for display matching
        return false;
      }

      // Budget filter (check if minimum fee <= budgetMax)
      if (filters.budgetMax > 0 && school.annualFeeMin > filters.budgetMax * 1.25) {
        return false;
      }

      // Curriculums filter (if any selected, school must support at least one)
      if (filters.curriculums.length > 0) {
        const hasCurriculum = school.curriculum.some((c) => filters.curriculums.includes(c));
        if (!hasCurriculum) return false;
      }

      // School type filter
      if (filters.schoolTypes.length > 0) {
        const hasType = school.schoolType.some((t) => filters.schoolTypes.includes(t));
        if (!hasType) return false;
      }

      // Special needs
      if (filters.requiresSpecialNeeds && !school.hasSpecialNeedsSupport) {
        return false;
      }

      // Hostel
      if (filters.requiresHostel && !school.hasHostel) {
        return false;
      }

      return true;
    });

    // Dynamic match score adjustment & sorting
    return list.sort((a, b) => {
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
    if (searchState.filters.curriculums.length > 0) count += searchState.filters.curriculums.length;
    if (searchState.filters.schoolTypes.length > 0) count += searchState.filters.schoolTypes.length;
    if (searchState.filters.requiredFacilities.length > 0) count += searchState.filters.requiredFacilities.length;
    if (searchState.filters.budgetMax < 300000) count += 1;
    if (searchState.filters.radiusKm < 20) count += 1;
    if (searchState.filters.requiresSpecialNeeds) count += 1;
    if (searchState.filters.requiresHostel) count += 1;
    return count;
  }, [searchState.filters]);

  return (
    <SearchContext.Provider
      value={{
        searchState,
        setSearchState,
        updateFilters,
        setRawQuery,
        setSortBy,
        resetFilters,
        applyNaturalLanguageQuery,
        filteredSchools,
        totalMatches: filteredSchools.length,
        activeFilterCount,
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
