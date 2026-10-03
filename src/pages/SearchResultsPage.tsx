import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useLocation, Link } from 'react-router-dom';
import {
  Filter,
  Map,
  List,
  Edit3,
  X,
  AlertCircle,
  RotateCcw,
  Search,
  Sliders,
  Baby,
  School as SchoolIcon,
  Layers,
  Bookmark,
  Sparkles,
  ArrowRight,
  MinusCircle,
  IndianRupee,
  Compass,
  SlidersHorizontal,
} from 'lucide-react';
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
  const [searchParams, setSearchParams] = useSearchParams();
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
    clearAllFilters,
    removeFilter,
    removeOneFilter,
    relaxBudget,
    increaseDistance,
    activeFilterCount,
  } = useSearch();

  const { savedSchools, isDemoMode, loadDemoShortlist, clearShortlist } = useShortlist();
  const { filters, sortBy, rawQuery } = searchState;

  const [selectedSchoolId, setSelectedSchoolId] = useState<string | null>(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'split' | 'map'>('list');
  const [quickQuery, setQuickQuery] = useState(rawQuery);
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

      const nextParams = new URLSearchParams(searchParams);
      nextParams.set('q', quickQuery.trim());
      setSearchParams(nextParams, { replace: true });
    }
  };

  const handleStageChange = (target: EducationTargetType) => {
    setEducationTarget(target);
    const nextParams = new URLSearchParams(searchParams);
    if (target === 'all') {
      nextParams.delete('target');
    } else {
      nextParams.set('target', target);
    }
    setSearchParams(nextParams, { replace: true });
  };

  const isPreschoolSearch = filters?.educationTarget === 'preschool' || 
    Boolean(filters?.preschool?.programs && filters.preschool.programs.length > 0);

  const stageName = filters.educationTarget === 'preschool'
    ? 'Preschool & Early Years'
    : filters.educationTarget === 'school'
    ? 'Regular School'
    : filters.educationTarget === 'combined'
    ? 'Preschool + School'
    : 'Preschool + School';

  const extractedCriteriaCount = useMemo(() => {
    let count = 0;
    if (filters.location && filters.location !== 'All Chennai') count++;
    if (filters.budgetMax && filters.budgetMax < 250000) count++;
    if (filters.radiusKm && filters.radiusKm < 20) count++;
    if (filters.grade && filters.grade !== 'Any Grade') count++;
    if (filters.curriculums && filters.curriculums.length > 0) count += filters.curriculums.length;
    if (filters.preschool?.programs && filters.preschool.programs.length > 0) count += filters.preschool.programs.length;
    if (filters.preschool?.pedagogy && filters.preschool.pedagogy.length > 0) count += filters.preschool.pedagogy.length;
    if (filters.preschool?.daycare) count++;
    if (filters.preschool?.outdoorPlay) count++;
    if (filters.requiresTransport) count++;
    if (filters.requiresSpecialNeeds) count++;
    return Math.max(count, 1);
  }, [filters]);

  // Construct individual removable active filter pills
  const activeFilterList = useMemo(() => {
    const items: { id: string; label: string; onRemove: () => void }[] = [];

    if (filters.location && filters.location !== 'All Chennai') {
      items.push({ id: 'loc', label: `Area: ${filters.location}`, onRemove: () => removeFilter('location') });
    }
    if (typeof filters.radiusKm === 'number' && filters.radiusKm < 20) {
      items.push({ id: 'rad', label: `≤ ${filters.radiusKm} km radius`, onRemove: () => removeFilter('radiusKm') });
    }
    if (typeof filters.budgetMax === 'number' && filters.budgetMax < 250000) {
      items.push({ id: 'bMax', label: `Tuition ≤ ₹${(filters.budgetMax / 100000).toFixed(1)}L`, onRemove: () => removeFilter('budgetMax') });
    }

    // School filters
    (filters.curriculums || []).forEach((c) => {
      items.push({ id: `curr-${c}`, label: `Board: ${c}`, onRemove: () => removeFilter('curriculum', c) });
    });
    if (filters.grade && filters.grade !== 'Any Grade') {
      items.push({ id: 'grd', label: `Grade: ${filters.grade}`, onRemove: () => removeFilter('grade') });
    }
    (filters.schoolTypes || []).forEach((st) => {
      items.push({ id: `st-${st}`, label: st, onRemove: () => removeFilter('schoolType', st) });
    });
    (filters.requiredFacilities || []).forEach((f) => {
      items.push({ id: `fac-${f}`, label: f, onRemove: () => removeFilter('facility', f) });
    });
    (filters.requiredActivities || []).forEach((a) => {
      items.push({ id: `act-${a}`, label: a, onRemove: () => removeFilter('activity', a) });
    });
    if (filters.requiresTransport) {
      items.push({ id: 'trans', label: 'Transport Available', onRemove: () => removeFilter('transport') });
    }
    if (filters.requiresSpecialNeeds) {
      items.push({ id: 'sn', label: 'Special Needs (IEP)', onRemove: () => removeFilter('specialNeeds') });
    }
    (filters.languages || []).forEach((l) => {
      items.push({ id: `lang-${l}`, label: `Lang: ${l}`, onRemove: () => removeFilter('language', l) });
    });

    // Preschool filters
    if (filters.preschool?.ageYears) {
      items.push({ id: 'pre-age', label: `Age: ${filters.preschool.ageYears} yrs`, onRemove: () => removeFilter('preschool_age') });
    }
    (filters.preschool?.programs || []).forEach((p) => {
      items.push({ id: `pre-prog-${p}`, label: `Program: ${p.toUpperCase()}`, onRemove: () => removeFilter('preschool_program', p) });
    });
    (filters.preschool?.pedagogy || []).forEach((ped) => {
      items.push({ id: `pre-ped-${ped}`, label: ped, onRemove: () => removeFilter('preschool_pedagogy', ped) });
    });
    if (filters.preschool?.daycare) {
      items.push({ id: 'pre-daycare', label: 'Daycare Preferred', onRemove: () => removeFilter('preschool_daycare') });
    }
    if (filters.preschool?.extendedHours || filters.preschool?.timing === 'extended') {
      items.push({ id: 'pre-ext', label: 'Extended Hours', onRemove: () => removeFilter('preschool_timing') });
    }
    if (filters.preschool?.outdoorPlay) {
      items.push({ id: 'pre-outdoor', label: 'Outdoor Play', onRemove: () => removeFilter('preschool_outdoorPlay') });
    }
    if (filters.preschool?.meals) {
      items.push({ id: 'pre-meals', label: 'Meals Provided', onRemove: () => removeFilter('preschool_meals') });
    }
    if (filters.preschool?.cctvSecurity) {
      items.push({ id: 'pre-cctv', label: 'CCTV Security', onRemove: () => removeFilter('preschool_cctv') });
    }
    (filters.preschool?.languages || []).forEach((l) => {
      items.push({ id: `pre-lang-${l}`, label: `Lang: ${l}`, onRemove: () => removeFilter('language', l) });
    });

    return items;
  }, [filters, removeFilter]);

  return (
    <div className="min-h-screen bg-[#FAF9F6] pb-24 text-stone-900 selection:bg-teal-100 selection:text-teal-900 font-sans">
      
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
                    : filters.educationTarget === 'combined' || filters.educationTarget === 'all'
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
                    : filters.educationTarget === 'preschool'
                    ? "Preschools that fit what you're looking for"
                    : filters.educationTarget === 'school'
                    ? "Schools that fit what you're looking for"
                    : "Institutions that fit what you're looking for"}
                </h1>
                <p className="text-xs sm:text-sm text-stone-600 font-sans">
                  {isSavedMode
                    ? "Institutions you've saved to compare or revisit."
                    : `${displaySchools.length} places match your current family priorities.`}
                </p>
              </div>

              {/* 3 Supported Modes: [Preschool & Early Years] [School] [Preschool + School] */}
              {!isSavedMode && (
                <div className="flex items-center gap-1.5 pt-1">
                  <span className="text-xs font-semibold text-stone-500 mr-1 hidden sm:inline">Education Type:</span>
                  <div className="inline-flex items-center bg-[#F5F1E8] p-0.5 rounded-xl border border-stone-200 text-xs">
                    <button
                      type="button"
                      onClick={() => handleStageChange('preschool')}
                      className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        filters.educationTarget === 'preschool'
                          ? 'bg-white text-amber-950 shadow-2xs border border-amber-300 font-bold'
                          : 'text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      <Baby className="w-3.5 h-3.5 text-amber-700" />
                      <span>Preschool & Early Years</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStageChange('school')}
                      className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        filters.educationTarget === 'school'
                          ? 'bg-white text-teal-950 shadow-2xs border border-teal-300 font-bold'
                          : 'text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      <SchoolIcon className="w-3.5 h-3.5 text-teal-700" />
                      <span>School</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStageChange('all')}
                      className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        filters.educationTarget === 'all' || filters.educationTarget === 'combined'
                          ? 'bg-white text-stone-900 shadow-2xs border border-stone-300 font-bold'
                          : 'text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      <Layers className="w-3.5 h-3.5 text-stone-600" />
                      <span>Preschool + School</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Removable Active Filter Pills & Clear All */}
              {!isSavedMode && activeFilterList.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-1.5 text-xs">
                  <span className="text-stone-500 font-semibold mr-0.5">Applied:</span>
                  {activeFilterList.map((item) => (
                    <span
                      key={item.id}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-white border border-stone-300 text-stone-800 shadow-2xs hover:border-stone-400 transition-colors"
                    >
                      <span>{item.label}</span>
                      <button
                        type="button"
                        onClick={item.onRemove}
                        className="text-stone-400 hover:text-rose-600 cursor-pointer p-0.5 rounded transition-colors"
                        title={`Remove ${item.label}`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  <button
                    type="button"
                    onClick={clearAllFilters}
                    className="text-xs text-teal-800 hover:text-teal-950 font-bold ml-1 cursor-pointer flex items-center gap-1 py-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Clear all</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPriorityTunerOpen(true)}
                    className="inline-flex items-center gap-1 text-teal-800 hover:text-teal-950 font-bold cursor-pointer ml-1 py-1"
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
            
            {/* Shortlist Demo State Banner */}
            {isSavedMode && isDemoMode && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 flex items-center justify-between gap-3 text-xs text-amber-950 font-sans shadow-2xs">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    <strong>Demo State:</strong> Showing sample shortlisted institutions for demonstration. These are not your saved items.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={clearShortlist}
                  className="font-bold underline hover:no-underline text-amber-900 cursor-pointer shrink-0"
                >
                  Clear Demo Data
                </button>
              </div>
            )}

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
            ) : isSavedMode ? (
              <div className="bg-white rounded-2xl border border-stone-200 p-8 sm:p-12 text-center space-y-4 shadow-xs">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-800 flex items-center justify-center mx-auto border border-amber-200">
                  <Bookmark className="w-7 h-7 text-amber-600" />
                </div>
                <div className="max-w-md mx-auto space-y-2">
                  <h3 className="font-editorial text-xl sm:text-2xl font-bold text-stone-900">
                    No Shortlisted Institutions
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-sans">
                    You haven't bookmarked any institutions yet. Click the "Save" action on any school or preschool card to keep track of your favorites here.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  <Link
                    to="/results"
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#0D9488] hover:bg-[#115E59] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer min-h-[44px]"
                  >
                    <span>Explore All Institutions</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <button
                    type="button"
                    onClick={loadDemoShortlist}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#F5F1E8] hover:bg-stone-200 text-stone-800 border border-stone-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer min-h-[44px]"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>Try Sample Shortlist (Demo)</span>
                  </button>
                </div>
              </div>
            ) : (
              /* EMPTY STATE WHEN FILTERS PRODUCE NO RESULTS */
              <div className="bg-white rounded-3xl border border-stone-200/90 p-8 sm:p-12 text-center space-y-6 shadow-xs max-w-2xl mx-auto">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto border border-amber-200">
                  <SlidersHorizontal className="w-7 h-7 text-amber-700" />
                </div>

                <div className="space-y-2">
                  <h3 className="font-editorial text-2xl font-bold text-stone-900 tracking-tight">
                    No institutions match all of these preferences.
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-sans max-w-md mx-auto">
                    Your current combination of location, fees, and specific preferences didn't return any matches. Try one of the options below to discover relevant institutions:
                  </p>
                </div>

                {/* Currently active filters so the user sees what's constraining the results */}
                {activeFilterList.length > 0 && (
                  <div className="p-3.5 bg-[#FAF9F6] border border-stone-200 rounded-xl space-y-2 text-left">
                    <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                      Active Preferences ({activeFilterList.length}):
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {activeFilterList.map((item) => (
                        <span
                          key={item.id}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-white border border-stone-300 text-stone-800 shadow-2xs"
                        >
                          <span>{item.label}</span>
                          <button
                            type="button"
                            onClick={item.onRemove}
                            className="text-stone-400 hover:text-rose-600 cursor-pointer p-0.5 rounded transition-colors"
                            title={`Remove ${item.label}`}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4 Required Actions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={removeOneFilter}
                    className="px-4 py-3 bg-white hover:bg-stone-50 border border-stone-300 text-stone-800 rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
                  >
                    <MinusCircle className="w-4 h-4 text-teal-700" />
                    <span>Remove one filter</span>
                  </button>

                  <button
                    type="button"
                    onClick={relaxBudget}
                    className="px-4 py-3 bg-white hover:bg-stone-50 border border-stone-300 text-stone-800 rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
                  >
                    <IndianRupee className="w-4 h-4 text-amber-700" />
                    <span>Relax budget</span>
                  </button>

                  <button
                    type="button"
                    onClick={increaseDistance}
                    className="px-4 py-3 bg-white hover:bg-stone-50 border border-stone-300 text-stone-800 rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
                  >
                    <Compass className="w-4 h-4 text-blue-700" />
                    <span>Increase distance</span>
                  </button>

                  <button
                    type="button"
                    onClick={clearAllFilters}
                    className="px-4 py-3 bg-[#0D9488] hover:bg-[#115E59] text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
                  >
                    <Sparkles className="w-4 h-4 text-white" />
                    <span>View all results</span>
                  </button>
                </div>
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
