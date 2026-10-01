import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import { Filter, Map, List, Edit3, X, AlertCircle, RotateCcw, Search, Sliders, Baby, School as SchoolIcon, Layers } from 'lucide-react';
import { useSearch } from '../context/SearchContext';
import { useShortlist } from '../context/ShortlistContext';
import { SchoolCard } from '../components/schools/SchoolCard';
import { FilterSidebar } from '../components/filters/FilterSidebar';
import { SchoolMapPreview } from '../components/schools/SchoolMapPreview';
import { PriorityTunerModal } from '../components/schools/PriorityTunerModal';
import { WhatWeUnderstoodPanel } from '../components/search/WhatWeUnderstoodPanel';
import { SearchTransitionPipeline } from '../components/search/SearchTransitionPipeline';
import { SortField, EducationTargetType } from '../types/search';
import { getCurriculumColor, getPedagogyColor } from '../utils/categoryColors';

export const SearchResultsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const {
    searchState,
    filteredSchools,
    updateFilters,
    setEducationTarget,
    setSortBy,
    setRawQuery,
    applyNaturalLanguageQuery,
    resetFilters,
    activeFilterCount,
  } = useSearch();

  const { savedSchools } = useShortlist();
  const { filters, sortBy, rawQuery } = searchState;

  const [selectedSchoolId, setSelectedSchoolId] = useState<string | null>(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'split' | 'map'>('list');
  const [quickQuery, setQuickQuery] = useState(rawQuery);
  const [isEditingPreferences, setIsEditingPreferences] = useState(false);
  const [priorityTunerOpen, setPriorityTunerOpen] = useState(false);
  const [isFreshSearch, setIsFreshSearch] = useState<boolean>(() => Boolean(location.state?.fromSearch));

  // Sync query params if passed in URL
  useEffect(() => {
    const qParam = searchParams.get('q');
    const locParam = searchParams.get('location');
    const currParam = searchParams.get('curriculum');
    const targetParam = searchParams.get('target') as EducationTargetType;
    const progParam = searchParams.get('program');

    if (qParam && qParam !== rawQuery) {
      setRawQuery(qParam);
      applyNaturalLanguageQuery(qParam);
    }
    
    const filterUpdates: any = {};
    if (locParam) filterUpdates.location = locParam;
    if (currParam) filterUpdates.curriculums = [currParam as any];
    if (targetParam && ['all', 'preschool', 'school', 'combined'].includes(targetParam)) {
      filterUpdates.educationTarget = targetParam;
    }
    if (progParam) filterUpdates.preschool = { programs: [progParam as any] };

    if (Object.keys(filterUpdates).length > 0) {
      updateFilters(filterUpdates);
    }
  }, [searchParams]);

  // Sync quickQuery input if rawQuery changes
  useEffect(() => {
    setQuickQuery(rawQuery);
  }, [rawQuery]);

  const isSavedMode = searchParams.get('view') === 'saved' || searchParams.get('filter') === 'saved';
  const displaySchools = isSavedMode ? savedSchools : filteredSchools;

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickQuery.trim()) {
      setIsFreshSearch(true);
      setRawQuery(quickQuery);
      applyNaturalLanguageQuery(quickQuery);
    }
  };

  const isPreschoolSearch = filters?.educationTarget === 'preschool' || 
    Boolean(filters?.preschool?.programs && filters.preschool.programs.length > 0);

  const stageName = filters.educationTarget === 'preschool'
    ? 'Preschool & Early Years'
    : filters.educationTarget === 'school'
    ? 'Regular School'
    : filters.educationTarget === 'combined'
    ? 'Preschool + School'
    : 'All Stages';

  const extractedCriteriaCount = useMemo(() => {
    let count = 0;
    if (filters.location) count++;
    if (filters.budgetMax && filters.budgetMax < 250000) count++;
    if (filters.radiusKm && filters.radiusKm < 20) count++;
    if (filters.grade) count++;
    if (filters.curriculums && filters.curriculums.length > 0) count += filters.curriculums.length;
    if (filters.preschool?.programs && filters.preschool.programs.length > 0) count += filters.preschool.programs.length;
    if (filters.preschool?.pedagogy && filters.preschool.pedagogy.length > 0) count += filters.preschool.pedagogy.length;
    if (filters.preschool?.daycare) count++;
    if (filters.preschool?.outdoorPlay) count++;
    if (filters.requiresTransport) count++;
    if (filters.requiresSpecialNeeds) count++;
    return Math.max(count, 1);
  }, [filters]);

  return (
    <div className="min-h-screen bg-[#FAF9F6] pb-24 text-stone-900 selection:bg-teal-100 selection:text-teal-900">
      
      {/* Top Search & Active Filters Header */}
      <section className="bg-white border-b border-stone-200/90 py-5 sm:py-6 px-3.5 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-4">
          
          {/* Quick Search Input */}
          <form onSubmit={handleQuickSearch} className="max-w-3xl">
            <div className="relative flex items-center">
              <input
                type="text"
                value={quickQuery}
                onChange={(e) => setQuickQuery(e.target.value)}
                placeholder={
                  filters.educationTarget === 'preschool'
                    ? "Describe in your own words (e.g. Find a Montessori preschool for my 3-year-old near Velachery with daycare)..."
                    : filters.educationTarget === 'combined'
                    ? "Describe in your own words (e.g. Find a school that offers preschool through Grade 12 near OMR)..."
                    : "Describe in your own words (e.g. Find a CBSE school for my 8-year-old near Anna Nagar under ₹1.5 lakh)..."
                }
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

          {/* Results Summary, Stage Switcher, and Sort Controls */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1">
            <div className="space-y-2">
              <div className="space-y-1">
                <span className="text-xs font-bold text-teal-800 uppercase tracking-wider block">
                  Based on your priorities
                </span>
                <h1 className="font-editorial text-xl sm:text-2xl lg:text-3xl font-bold text-stone-900 tracking-tight leading-snug">
                  {isSavedMode
                    ? `${savedSchools.length} Shortlisted Institutions`
                    : isPreschoolSearch
                    ? "Preschools that fit what you're looking for"
                    : "Schools that fit what you're looking for"}
                </h1>
                <p className="text-xs sm:text-sm text-stone-600 font-sans">
                  {isSavedMode
                    ? "Institutions you've saved to compare or revisit."
                    : `${displaySchools.length} places match your current family priorities.`}
                </p>
              </div>

              {/* EDUCATION TARGET TABS: [All] [Preschools] [Schools] */}
              {!isSavedMode && (
                <div className="flex items-center gap-1.5 pt-1">
                  <span className="text-xs font-semibold text-stone-500 mr-1 hidden sm:inline">Stage:</span>
                  <div className="inline-flex items-center bg-[#F5F1E8] p-0.5 rounded-xl border border-stone-200 text-xs">
                    <button
                      type="button"
                      onClick={() => setEducationTarget('all')}
                      className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        filters.educationTarget === 'all'
                          ? 'bg-white text-stone-900 shadow-2xs'
                          : 'text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      <Layers className="w-3.5 h-3.5 text-stone-500" />
                      <span>All Places</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setEducationTarget('preschool')}
                      className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        filters.educationTarget === 'preschool'
                          ? 'bg-white text-amber-950 shadow-2xs border border-amber-200/80 font-bold'
                          : 'text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      <Baby className="w-3.5 h-3.5 text-amber-600" />
                      <span>Preschools & Early Years</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setEducationTarget('school')}
                      className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        filters.educationTarget === 'school'
                          ? 'bg-white text-teal-950 shadow-2xs border border-teal-200/80 font-bold'
                          : 'text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      <SchoolIcon className="w-3.5 h-3.5 text-teal-700" />
                      <span>Regular Schools</span>
                    </button>
                  </div>
                </div>
              )}

              {/* What We Understood Criteria Chips */}
              {!isSavedMode && (
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs text-stone-600 pt-1 font-medium">
                  <span className="text-stone-500 font-semibold mr-0.5">Looking for:</span>

                  {filters.preschool?.ageYears && (
                    <span className="bg-amber-100 text-amber-950 px-2.5 py-0.5 rounded-md border border-amber-300 font-bold text-[11px]">
                      Child: {filters.preschool.ageYears} yrs old
                    </span>
                  )}

                  {filters.preschool?.programs && filters.preschool.programs.map((prog) => (
                    <span key={prog} className="bg-amber-50 text-amber-900 px-2.5 py-0.5 rounded-md border border-amber-200 font-bold text-[11px] uppercase">
                      {prog}
                    </span>
                  ))}

                  {filters.preschool?.pedagogy && filters.preschool.pedagogy.map((ped) => {
                    const pColor = getPedagogyColor(ped);
                    return (
                      <span key={ped} className={`px-2.5 py-0.5 rounded-md font-bold text-[11px] border ${pColor.badge}`}>
                        {ped}
                      </span>
                    );
                  })}

                  {!isPreschoolSearch && filters.grade && (
                    <span className="bg-[#F5F1E8] px-2.5 py-0.5 rounded-md border border-stone-200 font-semibold text-stone-800">
                      {filters.grade}
                    </span>
                  )}

                  {!isPreschoolSearch && (filters.curriculums || []).map((c) => {
                    const cColor = getCurriculumColor(c);
                    return (
                      <span key={c} className={`px-2.5 py-0.5 rounded-md font-bold text-[11px] border ${cColor.badge}`}>
                        {c}
                      </span>
                    );
                  })}

                  <span className="bg-amber-50 text-amber-900 px-2.5 py-0.5 rounded-md border border-amber-200 font-semibold">
                    ≤ ₹{((filters.budgetMax || 150000) / 100000).toFixed(1)}L/yr
                  </span>
                  <span className="bg-teal-50 text-teal-900 px-2.5 py-0.5 rounded-md border border-teal-200 font-semibold">
                    ≤ {filters.radiusKm || 12} km radius
                  </span>

                  {filters.preschool?.daycare && (
                    <span className="bg-teal-50 text-teal-900 px-2 py-0.5 rounded-md border border-teal-200 font-semibold text-[11px]">
                      Daycare Preferred
                    </span>
                  )}

                  {filters.preschool?.outdoorPlay && (
                    <span className="bg-emerald-50 text-emerald-900 px-2 py-0.5 rounded-md border border-emerald-200 font-semibold text-[11px]">
                      Outdoor Play
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() => setPriorityTunerOpen(true)}
                    className="inline-flex items-center gap-1 text-teal-800 hover:text-teal-950 font-bold cursor-pointer ml-1 py-0.5"
                  >
                    <Sliders className="w-3 h-3 text-teal-700" />
                    <span>Tune priorities</span>
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
                  <option value="best_match">Fit with priorities</option>
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
              selectedSchoolId={selectedSchoolId || undefined}
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
            
            {/* Intentional Discovery Pipeline (Search → Understanding → Matching → Results) */}
            {!isSavedMode && (
              <SearchTransitionPipeline
                query={rawQuery}
                stageName={stageName}
                extractedCriteriaCount={extractedCriteriaCount}
                evaluatedCount={42}
                resultsCount={displaySchools.length}
                isInitialSearch={isFreshSearch}
                onJumpToUnderstanding={() => {
                  const el = document.getElementById('what-we-understood-section');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                onOpenPriorityTuner={() => setPriorityTunerOpen(true)}
              />
            )}

            {/* Interactive "What We Understood" Preferences Breakdown */}
            {!isSavedMode && (
              <div id="what-we-understood-section" className="transition-all duration-300">
                <WhatWeUnderstoodPanel onOpenPriorityTuner={() => setPriorityTunerOpen(true)} />
              </div>
            )}

            {displaySchools.length > 0 ? (
              <div className="space-y-4 animate-in fade-in duration-300">
                {displaySchools.map((school) => (
                  <div
                    key={school.id}
                    onMouseEnter={() => setSelectedSchoolId(school.id)}
                  >
                    <SchoolCard school={school} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-stone-200 p-8 sm:p-12 text-center space-y-4 shadow-xs">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto border border-amber-200">
                  <AlertCircle className="w-7 h-7" />
                </div>
                <div className="max-w-md mx-auto space-y-2">
                  <h3 className="font-editorial text-xl font-bold text-stone-900">
                    No places currently match all selected filters
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-sans">
                    Try broadening your commute radius, expanding your fee ceiling, or switching between Preschools and Schools.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0D9488] hover:bg-[#115E59] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer min-h-[44px]"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Reset All Filters</span>
                </button>
              </div>
            )}
          </div>

          {/* Split Map View (Desktop) */}
          {viewMode === 'split' && (
            <div className="hidden lg:block lg:col-span-4 sticky top-20">
              <SchoolMapPreview
                schools={displaySchools}
                selectedSchoolId={selectedSchoolId || undefined}
                onSelectSchool={(id) => setSelectedSchoolId(id)}
                radiusKm={filters.radiusKm}
              />
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 md:hidden bg-stone-900/50 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-xs bg-white h-full overflow-y-auto p-4 flex flex-col justify-between shadow-2xl animate-in slide-in-from-right duration-200">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-stone-200 mb-3">
                <h3 className="font-editorial font-bold text-base text-stone-900">Filters</h3>
                <button
                  type="button"
                  onClick={() => setShowMobileFilters(false)}
                  className="min-h-[44px] min-w-[44px] p-2 rounded-lg flex items-center justify-center text-stone-400 hover:text-stone-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <FilterSidebar onCloseMobile={() => setShowMobileFilters(false)} />
            </div>
          </div>
        </div>
      )}

      {/* Priority Tuner Modal */}
      <PriorityTunerModal
        isOpen={priorityTunerOpen}
        onClose={() => setPriorityTunerOpen(false)}
      />
    </div>
  );
};
