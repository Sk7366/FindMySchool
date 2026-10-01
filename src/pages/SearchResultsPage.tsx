import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, SlidersHorizontal, Map, List, ArrowUpDown, Edit3, X, Sparkles, AlertCircle, RotateCcw, Search } from 'lucide-react';
import { useSearch } from '../context/SearchContext';
import { useShortlist } from '../context/ShortlistContext';
import { SchoolCard } from '../components/schools/SchoolCard';
import { FilterSidebar } from '../components/filters/FilterSidebar';
import { SchoolMapPreview } from '../components/schools/SchoolMapPreview';
import { GuidedSearchModal } from '../components/search/GuidedSearchModal';
import { SortField } from '../types/search';
import { getCurriculumColor } from '../utils/categoryColors';

export const SearchResultsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const filterParam = searchParams.get('filter');

  const { searchState, filteredSchools, setSortBy, setRawQuery, applyNaturalLanguageQuery, resetFilters, activeFilterCount } = useSearch();
  const { savedSchools, savedIds } = useShortlist();

  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'split' | 'map'>('list');
  const [isEditingPreferences, setIsEditingPreferences] = useState(false);
  const [quickQuery, setQuickQuery] = useState(searchState.rawQuery || '');
  const [selectedSchoolId, setSelectedSchoolId] = useState<string | undefined>(filteredSchools[0]?.id);

  // Prevent background scrolling when mobile filter drawer is open
  useEffect(() => {
    if (showMobileFilters) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showMobileFilters]);

  // If URL has ?filter=saved, show saved shortlist items
  const isSavedMode = filterParam === 'saved';
  const displaySchools = isSavedMode ? savedSchools : filteredSchools;

  const handleQuickSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickQuery.trim()) {
      applyNaturalLanguageQuery(quickQuery);
    }
  };

  const { filters, sortBy } = searchState;

  return (
    <div className="min-h-screen bg-[#FAF9F6] pb-24 text-stone-900">
      
      {/* Search Header Banner */}
      <section className="bg-white border-b border-stone-200/90 py-5 sm:py-7 px-3.5 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          
          {/* Quick Search input form */}
          <form onSubmit={handleQuickSearchSubmit} className="max-w-3xl mb-5">
            <div className="relative flex items-center">
              <input
                type="text"
                value={quickQuery}
                onChange={(e) => setQuickQuery(e.target.value)}
                placeholder="Describe your requirements (e.g. CBSE near OMR under ₹1.5L with swimming)..."
                className="w-full bg-[#FAF9F6] border border-stone-300 hover:border-stone-400 focus:border-[#0D9488] focus:bg-white rounded-xl pl-4 pr-24 py-2.5 text-sm sm:text-base text-stone-900 focus:outline-none focus:ring-4 focus:ring-teal-700/10 transition-all shadow-2xs font-sans"
              />
              <button
                type="submit"
                className="absolute right-1.5 px-4 py-1.5 bg-[#0D9488] hover:bg-[#115E59] active:bg-teal-900 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer min-h-[36px]"
              >
                Search
              </button>
            </div>
          </form>

          {/* Results Summary and Active Filter Summary */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-editorial text-xl sm:text-2xl font-bold text-stone-900 tracking-tight leading-snug">
                  {isSavedMode
                    ? `${savedSchools.length} Shortlisted Schools`
                    : `${displaySchools.length} Schools Matched for Your Family`}
                </h1>
                {isSavedMode && (
                  <span className="text-xs bg-amber-50 text-amber-900 px-2.5 py-0.5 rounded-full font-bold border border-amber-200">
                    Saved in browser
                  </span>
                )}
              </div>

              {!isSavedMode && (
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs text-stone-600 mt-2 font-medium">
                  {filters.grade && (
                    <span className="bg-[#F5F1E8] px-2.5 py-0.5 rounded-md border border-stone-200 font-semibold text-stone-800">
                      Grade: {filters.grade}
                    </span>
                  )}
                  {filters.curriculums.map((c) => {
                    const cColor = getCurriculumColor(c);
                    return (
                      <span key={c} className={`px-2.5 py-0.5 rounded-md font-bold text-[11px] border ${cColor.badge}`}>
                        {c}
                      </span>
                    );
                  })}
                  <span className="bg-amber-50 text-amber-900 px-2.5 py-0.5 rounded-md border border-amber-200 font-semibold">
                    ≤ ₹{(filters.budgetMax / 100000).toFixed(1)}L/yr
                  </span>
                  <span className="bg-teal-50 text-teal-900 px-2.5 py-0.5 rounded-md border border-teal-200 font-semibold">
                    ≤ {filters.radiusKm} km radius
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsEditingPreferences(true)}
                    className="inline-flex items-center gap-1 text-teal-800 hover:text-teal-950 font-bold cursor-pointer ml-1 py-0.5"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Change filters</span>
                  </button>
                </div>
              )}
            </div>

            {/* View Mode & Sort Controls */}
            <div className="flex items-center gap-2 self-stretch sm:self-auto justify-between sm:justify-start flex-wrap pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-100">
              
              {/* Desktop View Switcher (List vs Split Map) */}
              <div className="hidden lg:flex items-center bg-[#F5F1E8] p-0.5 rounded-xl border border-stone-200 text-xs">
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    viewMode === 'list'
                      ? 'bg-white text-stone-900 shadow-2xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <List className="w-3.5 h-3.5" />
                  <span>List</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('split')}
                  className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    viewMode === 'split'
                      ? 'bg-white text-stone-900 shadow-2xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <Map className="w-3.5 h-3.5" />
                  <span>Split Map</span>
                </button>
              </div>

              {/* Mobile Filter Sheet Trigger */}
              <button
                type="button"
                onClick={() => setShowMobileFilters(true)}
                className="md:hidden inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-stone-200 rounded-xl text-xs font-bold text-stone-800 shadow-2xs cursor-pointer hover:bg-stone-50 min-h-[40px]"
                aria-label="Open filter options"
              >
                <Filter className="w-3.5 h-3.5 text-teal-700" />
                <span>Filters</span>
                {activeFilterCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-teal-100 text-teal-900 font-bold text-[10px] border border-teal-200">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {/* Mobile Map Toggle */}
              <button
                type="button"
                onClick={() => setViewMode(viewMode === 'map' ? 'list' : 'map')}
                className="lg:hidden inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-stone-200 rounded-xl text-xs font-bold text-stone-800 shadow-2xs cursor-pointer hover:bg-stone-50 min-h-[40px]"
              >
                <Map className="w-3.5 h-3.5 text-teal-700" />
                <span>{viewMode === 'map' ? 'List View' : 'Map View'}</span>
              </button>

              {/* Sort By Dropdown */}
              <div className="flex items-center gap-1.5 text-xs">
                <label htmlFor="search-sort-select" className="text-stone-500 font-bold hidden sm:inline">Sort:</label>
                <select
                  id="search-sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortField)}
                  className="bg-white border border-stone-200 hover:border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-800 font-bold focus:outline-none focus:ring-2 focus:ring-teal-600 cursor-pointer shadow-2xs transition-colors min-h-[40px]"
                >
                  <option value="best_match">Best match</option>
                  <option value="distance_asc">Nearest commute</option>
                  <option value="fee_asc">Fees: Low to high</option>
                  <option value="fee_desc">Fees: High to low</option>
                  <option value="rating_desc">Parent rating</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 mt-6">
        
        {/* Mobile Fullscreen Map view if toggled */}
        {viewMode === 'map' && (
          <div className="lg:hidden mb-6">
            <SchoolMapPreview
              schools={displaySchools}
              selectedSchoolId={selectedSchoolId}
              onSelectSchool={(id) => setSelectedSchoolId(id)}
              radiusKm={filters.radiusKm}
            />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 items-start">
          
          {/* Desktop Filter Sidebar */}
          <div className="hidden md:block md:col-span-4 lg:col-span-3 sticky top-20">
            <FilterSidebar />
          </div>

          {/* Results List Area */}
          <div className={`md:col-span-8 ${viewMode === 'split' ? 'lg:col-span-5' : 'lg:col-span-9'} space-y-4`}>
            
            {displaySchools.length > 0 ? (
              displaySchools.map((school) => (
                <div
                  key={school.id}
                  onMouseEnter={() => setSelectedSchoolId(school.id)}
                >
                  <SchoolCard school={school} />
                </div>
              ))
            ) : (
              <div className="bg-white rounded-2xl border border-stone-200 p-8 sm:p-12 text-center space-y-4 shadow-xs">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto border border-amber-200">
                  <AlertCircle className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="font-editorial text-lg sm:text-xl font-bold text-stone-900">
                    No schools match your exact criteria
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto mt-1 leading-relaxed">
                    Try expanding your commute radius (e.g. from {filters.radiusKm} km to 15 km) or broadening the fee bracket to see nearby institutions.
                  </p>
                </div>
                <div className="pt-2 flex justify-center gap-3">
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold cursor-pointer min-h-[44px]"
                  >
                    Reset All Filters
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingPreferences(true)}
                    className="px-5 py-2.5 bg-[#0D9488] hover:bg-[#115E59] text-white rounded-xl text-xs font-bold cursor-pointer min-h-[44px]"
                  >
                    Adjust Filter Values
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Desktop Split Map Preview */}
          {viewMode === 'split' && (
            <div className="hidden lg:block lg:col-span-4 sticky top-20">
              <SchoolMapPreview
                schools={displaySchools}
                selectedSchoolId={selectedSchoolId}
                onSelectSchool={(id) => setSelectedSchoolId(id)}
                radiusKm={filters.radiusKm}
              />
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filters Bottom Drawer Sheet */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 md:hidden bg-stone-900/50 backdrop-blur-xs flex flex-col justify-end animate-in fade-in duration-200">
          <div className="bg-[#FAF9F6] rounded-t-3xl max-h-[85vh] overflow-y-auto p-5 shadow-2xl border-t border-stone-200 animate-in slide-in-from-bottom duration-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-teal-700" />
                <h3 className="font-editorial text-base font-bold text-stone-900">Refine Search Priorities</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowMobileFilters(false)}
                className="min-h-[40px] min-w-[40px] p-2 rounded-lg text-stone-500 hover:text-stone-900 flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <FilterSidebar onCloseMobile={() => setShowMobileFilters(false)} />
          </div>
        </div>
      )}

      {/* Guided Search Modal Component */}
      <GuidedSearchModal
        isOpen={isEditingPreferences}
        onClose={() => setIsEditingPreferences(false)}
      />
    </div>
  );
};
