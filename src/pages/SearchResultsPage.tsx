import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, SlidersHorizontal, Map, List, ArrowUpDown, Edit3, X, Sparkles, AlertCircle, RotateCcw } from 'lucide-react';
import { useSearch } from '../context/SearchContext';
import { useShortlist } from '../context/ShortlistContext';
import { SchoolCard } from '../components/schools/SchoolCard';
import { FilterSidebar } from '../components/filters/FilterSidebar';
import { SchoolMapPreview } from '../components/schools/SchoolMapPreview';
import { GuidedSearchModal } from '../components/search/GuidedSearchModal';
import { SortField } from '../types/search';

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

  // Build compact active search criteria string
  const criteriaParts: string[] = [];
  if (filters.grade) criteriaParts.push(filters.grade);
  if (filters.curriculums.length > 0) criteriaParts.push(filters.curriculums.join(' / '));
  if (filters.budgetMax) criteriaParts.push(`≤ ₹${(filters.budgetMax / 100000).toFixed(1)}L/yr`);
  if (filters.radiusKm) criteriaParts.push(`≤ ${filters.radiusKm} km`);
  if (filters.requiredFacilities.length > 0) {
    criteriaParts.push(filters.requiredFacilities.slice(0, 2).join(' · '));
  }

  return (
    <div className="min-h-screen bg-slate-50/70 pb-20">
      
      {/* Search Header Banner */}
      <section className="bg-white border-b border-slate-200 py-4 sm:py-6 px-3.5 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          
          {/* Quick Search input form */}
          <form onSubmit={handleQuickSearchSubmit} className="max-w-3xl mb-4 sm:mb-5">
            <div className="relative flex items-center">
              <input
                type="text"
                value={quickQuery}
                onChange={(e) => setQuickQuery(e.target.value)}
                placeholder="Modify search criteria in natural language..."
                className="w-full bg-slate-50 border border-slate-300 hover:border-slate-400 rounded-xl pl-3.5 sm:pl-4 pr-20 sm:pr-24 py-2.5 text-base sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white transition-all shadow-2xs font-medium"
              />
              <button
                type="submit"
                className="absolute right-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 min-h-[36px]"
              >
                Update
              </button>
            </div>
          </form>

          {/* Results Summary and Active Filter Summary */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 pt-1">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-2xl font-bold font-display text-slate-950 tracking-tight leading-snug">
                  {isSavedMode
                    ? `${savedSchools.length} Shortlisted Schools`
                    : `${displaySchools.length} schools match your requirements`}
                </h1>
                {isSavedMode && (
                  <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium border border-slate-200">
                    Saved in browser
                  </span>
                )}
              </div>

              {!isSavedMode && (
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs text-slate-600 mt-1.5 font-medium">
                  <span className="text-slate-700">
                    {criteriaParts.join(' · ')}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsEditingPreferences(true)}
                    className="inline-flex items-center gap-1 text-teal-700 hover:text-teal-800 font-semibold cursor-pointer ml-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 rounded py-0.5"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Edit preferences</span>
                  </button>
                </div>
              )}
            </div>

            {/* View Mode & Sort Controls */}
            <div className="flex items-center gap-2 self-stretch sm:self-auto justify-between sm:justify-start flex-wrap pt-1 sm:pt-0 border-t sm:border-t-0 border-slate-100">
              
              {/* Desktop View Switcher (List vs Split Map) */}
              <div className="hidden lg:flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1.5 rounded-md font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    viewMode === 'list'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <List className="w-3.5 h-3.5" />
                  <span>List</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('split')}
                  className={`px-3 py-1.5 rounded-md font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    viewMode === 'split'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Map className="w-3.5 h-3.5" />
                  <span>Map Preview</span>
                </button>
              </div>

              {/* Mobile Filter Sheet Trigger */}
              <button
                type="button"
                onClick={() => setShowMobileFilters(true)}
                className="md:hidden inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 shadow-2xs cursor-pointer hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 min-h-[40px]"
                aria-label="Open filter options"
              >
                <Filter className="w-3.5 h-3.5 text-teal-600" />
                <span>Filters</span>
                {activeFilterCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-teal-100 text-teal-800 font-bold text-[10px]">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {/* Mobile Map Toggle */}
              <button
                type="button"
                onClick={() => setViewMode(viewMode === 'map' ? 'list' : 'map')}
                className="lg:hidden inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 shadow-2xs cursor-pointer hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 min-h-[40px]"
              >
                <Map className="w-3.5 h-3.5 text-teal-600" />
                <span>{viewMode === 'map' ? 'List View' : 'Map View'}</span>
              </button>

              {/* Sort By Dropdown */}
              <div className="flex items-center gap-1.5 text-xs">
                <label htmlFor="search-sort-select" className="text-slate-500 font-medium hidden sm:inline">Sort:</label>
                <select
                  id="search-sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortField)}
                  className="bg-white border border-slate-200 hover:border-slate-300 rounded-lg px-2.5 py-2 text-xs text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-teal-600 cursor-pointer shadow-2xs transition-colors min-h-[40px]"
                >
                  <option value="best_match">Best match</option>
                  <option value="distance_asc">Nearest first</option>
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
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 mt-5 sm:mt-6">
        
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
          
          {/* Desktop Filter Sidebar (Col 3 or 4) */}
          <div className="hidden md:block md:col-span-4 lg:col-span-3 sticky top-20">
            <FilterSidebar />
          </div>

          {/* Results List Area (Col 8 or 9) */}
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
              <div className="bg-white rounded-xl border border-slate-200 p-8 sm:p-10 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center mx-auto">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    No schools match your exact criteria
                  </h3>
                  <p className="text-xs text-slate-600 max-w-md mx-auto mt-1">
                    Try expanding your commute radius (e.g. from {filters.radiusKm} km to 15 km) or increasing your fee bracket to find more schools.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditingPreferences(true)}
                  className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold cursor-pointer min-h-[44px]"
                >
                  Adjust Search Filters
                </button>
              </div>
            )}
          </div>

          {/* Desktop Split Map Preview (Col 4 when viewMode === 'split') */}
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

      {/* Mobile Drawer / Bottom Sheet for Filters with Sticky Header and Footer */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 md:hidden bg-slate-900/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-md h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
            
            {/* Sticky Drawer Header */}
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-200 bg-white sticky top-0 z-10 shrink-0">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-teal-600" />
                <span className="font-bold text-slate-900 text-base">Filter Schools</span>
                {activeFilterCount > 0 && (
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">
                    {activeFilterCount} active
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setShowMobileFilters(false)}
                className="min-h-[44px] min-w-[44px] p-2 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                aria-label="Close filters"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Filter Body */}
            <div className="flex-1 overflow-y-auto p-4">
              <FilterSidebar />
            </div>

            {/* Sticky Drawer Bottom Footer */}
            <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex items-center gap-2.5 shrink-0">
              {activeFilterCount > 0 && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowMobileFilters(false)}
                className="flex-1 min-h-[44px] py-2.5 px-4 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center justify-center"
              >
                Show {displaySchools.length} Matching Schools
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Preferences Modal */}
      <GuidedSearchModal
        isOpen={isEditingPreferences}
        onClose={() => setIsEditingPreferences(false)}
        initialCategory="location"
      />
    </div>
  );
};

