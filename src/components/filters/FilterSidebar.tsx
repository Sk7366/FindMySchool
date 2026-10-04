import React from 'react';
import {
  RotateCcw,
  SlidersHorizontal,
  Check,
  MapPin,
  IndianRupee,
  BookOpen,
  Trophy,
  Baby,
  Building2,
  Sliders,
  ShieldCheck,
  Bus,
  Utensils,
  Clock,
  Languages,
  HeartHandshake,
  Sparkles,
  TreePine,
  School as SchoolIcon,
  Layers,
} from 'lucide-react';
import { useSearch } from '../../context/SearchContext';
import { Curriculum, SchoolType, PreschoolProgram } from '../../types/school';
import { getCurriculumColor, getFacilityCategoryColor, getPedagogyColor } from '../../utils/categoryColors';
import { PriorityTunerModal } from '../schools/PriorityTunerModal';

const CURRICULUM_OPTIONS: Curriculum[] = ['CBSE', 'ICSE', 'Cambridge (IGCSE)', 'IB World', 'State Board'];
const SCHOOL_TYPE_OPTIONS: SchoolType[] = ['Co-educational', 'Day School', 'Day Boarding', 'Residential'];
const FACILITY_OPTIONS = [
  'Robotics & STEM Lab',
  'Swimming Pool',
  'Football Turf',
  'Cricket Academy & Nets',
  'Science Laboratories',
];
const ACTIVITY_OPTIONS = [
  'Debate & MUN',
  'Robotics Club',
  'Performing Arts & Music',
  'Competitive Swimming',
  'Chess Academy',
];
const CHENNAI_AREAS = [
  'All Chennai',
  'Tambaram & GST Corridor',
  'OMR / Sholinganallur',
  'Adyar & Besant Nagar',
  'Porur & Manapakkam',
  'Anna Nagar & Mogappair',
  'Velachery & Guindy',
];
const GRADES = [
  'Any Grade',
  'Class 1',
  'Class 2',
  'Class 3',
  'Class 4',
  'Class 5',
  'Class 6',
  'Class 7',
  'Class 8',
  'Class 9',
  'Class 10',
  'Class 11',
  'Class 12',
];

const PRESCHOOL_PROGRAMS: { id: PreschoolProgram; label: string; ageRange: string }[] = [
  { id: 'playgroup', label: 'Playgroup', ageRange: '2–3 yrs' },
  { id: 'nursery', label: 'Nursery', ageRange: '3–4 yrs' },
  { id: 'lkg', label: 'LKG', ageRange: '4–5 yrs' },
  { id: 'ukg', label: 'UKG', ageRange: '5–6 yrs' },
];

const PEDAGOGIES = [
  'Montessori',
  'Play-way',
  'Reggio Emilia',
  'Waldorf-inspired',
  'Activity-based',
];

const PRESCHOOL_AGES = [
  { value: undefined, label: 'All' },
  { value: 2, label: '2 yrs' },
  { value: 3, label: '3 yrs' },
  { value: 4, label: '4 yrs' },
  { value: 5, label: '5 yrs' },
];

const PRESCHOOL_LANGUAGES = ['English', 'Tamil', 'Hindi'];
const SCHOOL_LANGUAGES = ['Tamil', 'Hindi', 'French', 'Sanskrit'];

interface FilterSidebarProps {
  onCloseMobile?: () => void;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({ onCloseMobile }) => {
  const {
    searchState,
    updateFilters,
    setEducationTarget,
    clearAllFilters,
    activeFilterCount,
  } = useSearch();
  const { filters } = searchState;
  const [priorityTunerOpen, setPriorityTunerOpen] = React.useState(false);

  const isPreschoolMode = filters.educationTarget === 'preschool';
  const isSchoolMode = filters.educationTarget === 'school';
  const isCombinedOrAll = filters.educationTarget === 'all' || filters.educationTarget === 'combined';

  const toggleCurriculum = (curriculum: Curriculum) => {
    const current = filters.curriculums || [];
    const next = current.includes(curriculum)
      ? current.filter((c) => c !== curriculum)
      : [...current, curriculum];
    updateFilters({ curriculums: next });
  };

  const toggleSchoolType = (type: SchoolType) => {
    const current = filters.schoolTypes || [];
    const next = current.includes(type)
      ? current.filter((t) => t !== type)
      : [...current, type];
    updateFilters({ schoolTypes: next });
  };

  const toggleFacility = (facility: string) => {
    const current = filters.requiredFacilities || [];
    const next = current.includes(facility)
      ? current.filter((f) => f !== facility)
      : [...current, facility];
    updateFilters({ requiredFacilities: next });
  };

  const toggleActivity = (activity: string) => {
    const current = filters.requiredActivities || [];
    const next = current.includes(activity)
      ? current.filter((a) => a !== activity)
      : [...current, activity];
    updateFilters({ requiredActivities: next });
  };

  const togglePreschoolProgram = (prog: PreschoolProgram) => {
    const current = filters.preschool?.programs || [];
    const next = current.includes(prog)
      ? current.filter((p) => p !== prog)
      : [...current, prog];
    updateFilters({
      preschool: { ...(filters.preschool || {}), programs: next },
    });
  };

  const togglePedagogy = (ped: string) => {
    const current = filters.preschool?.pedagogy || [];
    const next = current.includes(ped)
      ? current.filter((p) => p !== ped)
      : [...current, ped];
    updateFilters({
      preschool: { ...(filters.preschool || {}), pedagogy: next },
    });
  };

  const togglePreschoolLanguage = (lang: string) => {
    const current = filters.preschool?.languages || [];
    const next = current.includes(lang)
      ? current.filter((l) => l !== lang)
      : [...current, lang];
    updateFilters({
      preschool: { ...(filters.preschool || {}), languages: next },
    });
  };

  const toggleSchoolLanguage = (lang: string) => {
    const current = filters.languages || [];
    const next = current.includes(lang)
      ? current.filter((l) => l !== lang)
      : [...current, lang];
    updateFilters({ languages: next });
  };

  const formatLakhs = (val: number) => {
    return `₹${(val / 100000).toFixed(1)}L`;
  };

  return (
    <aside className="bg-white rounded-2xl border border-stone-200/90 p-5 space-y-6 text-sm shadow-xs font-sans">
      
      {/* Header with Title and Reset */}
      <div className="flex items-center justify-between pb-3 border-b border-stone-100">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-teal-700" />
          <h3 className="font-editorial text-base font-bold text-stone-900">Decision Filters</h3>
          {activeFilterCount > 0 && (
            <span className="text-[11px] font-bold px-2 py-0.2 rounded-full bg-teal-100 text-teal-800 border border-teal-200">
              {activeFilterCount}
            </span>
          )}
        </div>

        {activeFilterCount > 0 && (
          <button
            type="button"
            onClick={clearAllFilters}
            className="text-xs text-stone-500 hover:text-teal-800 flex items-center gap-1 font-semibold transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Clear all</span>
          </button>
        )}
      </div>

      {/* Priority Tuner Trigger CTA */}
      <div className="p-3 rounded-xl bg-[#F5F1E8] border border-stone-200 flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-stone-900 block">Priority Tuner</span>
          <span className="text-[11px] text-stone-600">Weight distance, budget & approach</span>
        </div>
        <button
          type="button"
          onClick={() => setPriorityTunerOpen(true)}
          className="px-2.5 py-1.5 bg-white text-teal-900 border border-stone-200 rounded-lg text-xs font-bold hover:bg-stone-50 transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
        >
          <Sliders className="w-3 h-3 text-teal-700" />
          <span>Tune</span>
        </button>
      </div>

      {/* 1. Education Stage Target Segmented Control */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
          Education Type
        </label>
        <div className="grid grid-cols-3 gap-1 bg-[#FAF9F6] p-1 rounded-xl border border-stone-200 text-xs">
          <button
            type="button"
            onClick={() => setEducationTarget('preschool')}
            aria-pressed={filters.educationTarget === 'preschool'}
            className={`py-1.5 rounded-lg font-bold transition-all text-center cursor-pointer flex items-center justify-center gap-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 ${
              filters.educationTarget === 'preschool'
                ? 'bg-white text-amber-950 shadow-2xs border border-amber-300 font-bold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Baby className="w-3.5 h-3.5 text-amber-700" aria-hidden="true" />
            <span>Preschool</span>
          </button>
          <button
            type="button"
            onClick={() => setEducationTarget('school')}
            aria-pressed={filters.educationTarget === 'school'}
            className={`py-1.5 rounded-lg font-bold transition-all text-center cursor-pointer flex items-center justify-center gap-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 ${
              filters.educationTarget === 'school'
                ? 'bg-white text-teal-950 shadow-2xs border border-teal-300 font-bold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <SchoolIcon className="w-3.5 h-3.5 text-teal-700" aria-hidden="true" />
            <span>School</span>
          </button>
          <button
            type="button"
            onClick={() => setEducationTarget('all')}
            aria-pressed={filters.educationTarget === 'all' || filters.educationTarget === 'combined'}
            className={`py-1.5 rounded-lg font-bold transition-all text-center cursor-pointer flex items-center justify-center gap-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 ${
              filters.educationTarget === 'all' || filters.educationTarget === 'combined'
                ? 'bg-white text-stone-900 shadow-2xs border border-stone-300 font-bold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-stone-600" aria-hidden="true" />
            <span>Both</span>
          </button>
        </div>
      </div>

      {/* 2. Common Location Area */}
      <div className="space-y-2">
        <label htmlFor="filter-location-select" className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
          Area / Corridor
        </label>
        <select
          id="filter-location-select"
          value={filters.location}
          onChange={(e) => updateFilters({ location: e.target.value })}
          className="w-full bg-[#FAF9F6] border border-stone-200 rounded-xl px-3 py-2 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white transition-all cursor-pointer font-medium"
        >
          {CHENNAI_AREAS.map((area) => (
            <option key={area} value={area}>
              {area}
            </option>
          ))}
        </select>
      </div>

      {/* 3. Distance Radius Slider */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <label htmlFor="filter-radius-slider" className="font-bold text-stone-700 uppercase tracking-wider">
            Max Commute Radius
          </label>
          <span className="font-bold text-teal-800 tabular-nums">{filters.radiusKm} km</span>
        </div>
        <input
          id="filter-radius-slider"
          type="range"
          min={2}
          max={25}
          step={1}
          value={filters.radiusKm}
          aria-valuemin={2}
          aria-valuemax={25}
          aria-valuenow={filters.radiusKm}
          aria-valuetext={`${filters.radiusKm} kilometers commute radius`}
          onChange={(e) => updateFilters({ radiusKm: Number(e.target.value) })}
          className="w-full accent-teal-600 h-1.5 bg-stone-200 rounded-lg cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
        />
        <div className="flex justify-between text-[11px] text-stone-500">
          <span>2 km (Local)</span>
          <span>15 km</span>
          <span>25 km</span>
        </div>
      </div>

      {/* 4. Budget Slider */}
      <div className="space-y-2 pt-2 border-t border-stone-100">
        <div className="flex items-center justify-between text-xs">
          <label htmlFor="filter-budget-slider" className="font-bold text-stone-700 uppercase tracking-wider">
            Max Annual Tuition
          </label>
          <span className="font-bold text-amber-700 tabular-nums">{formatLakhs(filters.budgetMax)}</span>
        </div>
        <input
          id="filter-budget-slider"
          type="range"
          min={30000}
          max={450000}
          step={10000}
          value={filters.budgetMax}
          aria-valuemin={30000}
          aria-valuemax={450000}
          aria-valuenow={filters.budgetMax}
          aria-valuetext={`${formatLakhs(filters.budgetMax)} annual tuition`}
          onChange={(e) => updateFilters({ budgetMax: Number(e.target.value) })}
          className="w-full accent-amber-600 h-1.5 bg-stone-200 rounded-lg cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
        />
        <div className="flex justify-between text-[11px] text-stone-500">
          <span>₹30k</span>
          <span>₹2.0L</span>
          <span>₹4.5L+</span>
        </div>
      </div>

      {/* ========================================================
          MODE 1: PRESCHOOL & EARLY YEARS FILTERS
          Shown when educationTarget is 'preschool' or 'all'/'combined'
          ======================================================== */}
      {(isPreschoolMode || isCombinedOrAll) && (
        <div className={`space-y-4 pt-3 ${isCombinedOrAll ? 'p-3.5 bg-amber-50/50 rounded-2xl border border-amber-200/70' : 'pt-3 border-t border-stone-100'}`}>
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-950 uppercase tracking-wider">
            <Baby className="w-3.5 h-3.5 text-amber-700" />
            <span>{isCombinedOrAll ? 'Early Years & Daycare Criteria' : 'Preschool Criteria'}</span>
          </div>

          {/* Child Age Selector */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-stone-600 uppercase">Child Age</span>
            <div className="grid grid-cols-5 gap-1 bg-[#FAF9F6] p-1 rounded-xl border border-stone-200 text-xs">
              {PRESCHOOL_AGES.map((ageOpt) => {
                const isSelected = filters.preschool?.ageYears === ageOpt.value;
                return (
                  <button
                    key={ageOpt.label}
                    type="button"
                    onClick={() => updateFilters({
                      preschool: { ...(filters.preschool || {}), ageYears: ageOpt.value }
                    })}
                    className={`py-1.5 rounded-lg font-bold text-center transition-all cursor-pointer text-xs ${
                      isSelected
                        ? 'bg-amber-500 text-white shadow-2xs font-bold'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    {ageOpt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Target Program Checkboxes */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-stone-600 uppercase">Early Years Program</span>
            <div className="grid grid-cols-2 gap-1.5">
              {PRESCHOOL_PROGRAMS.map((prog) => {
                const isChecked = filters.preschool?.programs?.includes(prog.id);
                return (
                  <label
                    key={prog.id}
                    className={`flex items-center justify-between p-2 rounded-xl text-xs font-semibold cursor-pointer border transition-all ${
                      isChecked
                        ? 'bg-amber-100/90 border-amber-300 text-amber-950 shadow-2xs'
                        : 'bg-white border-stone-200 text-stone-700 hover:border-stone-300'
                    }`}
                  >
                    <div>
                      <span className="block font-bold">{prog.label}</span>
                      <span className="text-[10px] text-stone-500">{prog.ageRange}</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={Boolean(isChecked)}
                      onChange={() => togglePreschoolProgram(prog.id)}
                      className="w-3.5 h-3.5 text-amber-600 accent-amber-600 rounded cursor-pointer"
                    />
                  </label>
                );
              })}
            </div>
          </div>

          {/* Learning Approach / Pedagogy */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-stone-600 uppercase">Learning Approach</span>
            <div className="space-y-1">
              {PEDAGOGIES.map((ped) => {
                const isChecked = filters.preschool?.pedagogy?.includes(ped);
                const pColor = getPedagogyColor(ped);
                return (
                  <label
                    key={ped}
                    className={`flex items-center justify-between p-1.5 px-2.5 rounded-xl text-xs font-semibold cursor-pointer border transition-all ${
                      isChecked
                        ? `${pColor.badge} shadow-2xs`
                        : 'bg-white border-stone-200 text-stone-700 hover:border-stone-300'
                    }`}
                  >
                    <span>{ped}</span>
                    <input
                      type="checkbox"
                      checked={Boolean(isChecked)}
                      onChange={() => togglePedagogy(ped)}
                      className="w-3.5 h-3.5 text-amber-600 accent-amber-600 rounded cursor-pointer"
                    />
                  </label>
                );
              })}
            </div>
          </div>

          {/* Daycare & Timings */}
          <div className="space-y-2 pt-1 border-t border-stone-100">
            <span className="text-[11px] font-bold text-stone-600 uppercase block">Daycare & Hours</span>
            <label className="flex items-center gap-2 text-xs font-semibold text-stone-800 cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(filters.preschool?.daycare)}
                onChange={(e) => updateFilters({
                  preschool: { ...(filters.preschool || {}), daycare: e.target.checked }
                })}
                className="w-4 h-4 text-amber-600 accent-amber-600 rounded cursor-pointer"
              />
              <span>Afternoon Daycare Available</span>
            </label>

            <label className="flex items-center gap-2 text-xs font-semibold text-stone-800 cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(filters.preschool?.extendedHours || filters.preschool?.timing === 'extended')}
                onChange={(e) => updateFilters({
                  preschool: {
                    ...(filters.preschool || {}),
                    extendedHours: e.target.checked,
                    timing: e.target.checked ? 'extended' : undefined,
                  }
                })}
                className="w-4 h-4 text-amber-600 accent-amber-600 rounded cursor-pointer"
              />
              <span>Extended Hours (till 6:30 PM)</span>
            </label>
          </div>

          {/* Early Years Facilities: Outdoor play, Meals, Safety, Transport */}
          <div className="space-y-2 pt-1 border-t border-stone-100">
            <span className="text-[11px] font-bold text-stone-600 uppercase block">Care, Play & Safety</span>
            
            <label className="flex items-center gap-2 text-xs font-semibold text-stone-800 cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(filters.preschool?.outdoorPlay)}
                onChange={(e) => updateFilters({
                  preschool: { ...(filters.preschool || {}), outdoorPlay: e.target.checked }
                })}
                className="w-4 h-4 text-amber-600 accent-amber-600 rounded cursor-pointer"
              />
              <span className="flex items-center gap-1.5">
                <TreePine className="w-3.5 h-3.5 text-emerald-600" />
                <span>Outdoor Sand & Nature Play</span>
              </span>
            </label>

            <label className="flex items-center gap-2 text-xs font-semibold text-stone-800 cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(filters.preschool?.meals)}
                onChange={(e) => updateFilters({
                  preschool: { ...(filters.preschool || {}), meals: e.target.checked }
                })}
                className="w-4 h-4 text-amber-600 accent-amber-600 rounded cursor-pointer"
              />
              <span className="flex items-center gap-1.5">
                <Utensils className="w-3.5 h-3.5 text-amber-600" />
                <span>Nutritious Meals & Snacks</span>
              </span>
            </label>

            <label className="flex items-center gap-2 text-xs font-semibold text-stone-800 cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(filters.preschool?.transport)}
                onChange={(e) => updateFilters({
                  preschool: { ...(filters.preschool || {}), transport: e.target.checked },
                  requiresTransport: e.target.checked,
                })}
                className="w-4 h-4 text-amber-600 accent-amber-600 rounded cursor-pointer"
              />
              <span className="flex items-center gap-1.5">
                <Bus className="w-3.5 h-3.5 text-blue-600" />
                <span>School Van / Pickup Route</span>
              </span>
            </label>

            <label className="flex items-center gap-2 text-xs font-semibold text-stone-800 cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(filters.preschool?.cctvSecurity)}
                onChange={(e) => updateFilters({
                  preschool: { ...(filters.preschool || {}), cctvSecurity: e.target.checked }
                })}
                className="w-4 h-4 text-amber-600 accent-amber-600 rounded cursor-pointer"
              />
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                <span>CCTV Live Streaming & Security</span>
              </span>
            </label>
          </div>

          {/* Preschool Language Medium */}
          <div className="space-y-1.5 pt-1 border-t border-stone-100">
            <span className="text-[11px] font-bold text-stone-600 uppercase block">Language / Medium</span>
            <div className="flex flex-wrap gap-1.5">
              {PRESCHOOL_LANGUAGES.map((lang) => {
                const isSelected = filters.preschool?.languages?.includes(lang);
                return (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => togglePreschoolLanguage(lang)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-100 border-amber-300 text-amber-950 font-bold'
                        : 'bg-white border-stone-200 text-stone-600 hover:border-stone-300'
                    }`}
                  >
                    {lang}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODE 2: REGULAR SCHOOL FILTERS
          Shown when educationTarget is 'school' or 'all'/'combined'
          ======================================================== */}
      {(isSchoolMode || isCombinedOrAll) && (
        <div className={`space-y-4 pt-3 ${isCombinedOrAll ? 'p-3.5 bg-teal-50/40 rounded-2xl border border-teal-200/70' : 'pt-3 border-t border-stone-100'}`}>
          <div className="flex items-center gap-1.5 text-xs font-bold text-teal-950 uppercase tracking-wider">
            <SchoolIcon className="w-3.5 h-3.5 text-teal-700" />
            <span>{isCombinedOrAll ? 'School & Board Criteria' : 'School Criteria'}</span>
          </div>

          {/* Curriculum Board Checkboxes */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-stone-600 uppercase block">
              Curriculum Board (Grades 1–12)
            </span>
            <div className="space-y-1.5">
              {CURRICULUM_OPTIONS.map((curr) => {
                const isChecked = (filters.curriculums || []).includes(curr);
                const cColor = getCurriculumColor(curr);
                return (
                  <label
                    key={curr}
                    className={`flex items-center justify-between p-2 rounded-xl text-xs font-semibold cursor-pointer transition-all border ${
                      isChecked
                        ? `${cColor.badge} shadow-2xs font-bold`
                        : 'border-stone-200 bg-[#FAF9F6] text-stone-700 hover:border-stone-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleCurriculum(curr)}
                        className="w-4 h-4 text-teal-600 accent-teal-600 rounded cursor-pointer"
                      />
                      <span>{curr}</span>
                    </div>
                    {isChecked && <Check className="w-3.5 h-3.5" />}
                  </label>
                );
              })}
            </div>
          </div>

          {/* School Grade Level */}
          <div className="space-y-1.5">
            <label htmlFor="filter-grade-select" className="text-[11px] font-bold text-stone-600 uppercase block">
              School Grade Level
            </label>
            <select
              id="filter-grade-select"
              value={filters.grade}
              onChange={(e) => updateFilters({ grade: e.target.value })}
              className="w-full bg-[#FAF9F6] border border-stone-200 rounded-xl px-3 py-2 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white transition-all cursor-pointer font-medium"
            >
              {GRADES.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          {/* School Type */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-stone-600 uppercase block">School Type</span>
            <div className="grid grid-cols-2 gap-1.5">
              {SCHOOL_TYPE_OPTIONS.map((st) => {
                const isSelected = (filters.schoolTypes || []).includes(st);
                return (
                  <button
                    key={st}
                    type="button"
                    onClick={() => toggleSchoolType(st)}
                    className={`p-2 rounded-xl text-xs font-semibold border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-teal-100/90 border-teal-300 text-teal-950 font-bold shadow-2xs'
                        : 'bg-[#FAF9F6] border-stone-200 text-stone-700 hover:border-stone-300'
                    }`}
                  >
                    {st}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Essential Campus Facilities */}
          <div className="space-y-1.5 pt-1 border-t border-stone-100">
            <span className="text-[11px] font-bold text-stone-600 uppercase block">
              Essential Facilities
            </span>
            <div className="space-y-1.5">
              {FACILITY_OPTIONS.map((fac) => {
                const isChecked = (filters.requiredFacilities || []).includes(fac);
                const fColor = getFacilityCategoryColor('Sports & STEM', fac);
                return (
                  <label
                    key={fac}
                    className={`flex items-center justify-between p-2 rounded-xl text-xs font-semibold cursor-pointer transition-all border ${
                      isChecked
                        ? `${fColor.badge} shadow-2xs font-bold`
                        : 'border-stone-200 bg-[#FAF9F6] text-stone-700 hover:border-stone-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleFacility(fac)}
                        className="w-4 h-4 text-teal-600 accent-teal-600 rounded cursor-pointer"
                      />
                      <span>{fac}</span>
                    </div>
                    {isChecked && <Check className="w-3.5 h-3.5" />}
                  </label>
                );
              })}
            </div>
          </div>

          {/* Extracurricular Activities */}
          <div className="space-y-1.5 pt-1 border-t border-stone-100">
            <span className="text-[11px] font-bold text-stone-600 uppercase block">
              Extracurricular Activities
            </span>
            <div className="space-y-1.5">
              {ACTIVITY_OPTIONS.map((act) => {
                const isChecked = (filters.requiredActivities || []).includes(act);
                return (
                  <label
                    key={act}
                    className={`flex items-center justify-between p-2 rounded-xl text-xs font-semibold cursor-pointer transition-all border ${
                      isChecked
                        ? 'bg-blue-50 border-blue-300 text-blue-950 font-bold shadow-2xs'
                        : 'border-stone-200 bg-[#FAF9F6] text-stone-700 hover:border-stone-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleActivity(act)}
                        className="w-4 h-4 text-teal-600 accent-teal-600 rounded cursor-pointer"
                      />
                      <span>{act}</span>
                    </div>
                    {isChecked && <Check className="w-3.5 h-3.5" />}
                  </label>
                );
              })}
            </div>
          </div>

          {/* Logistics & Special Support */}
          <div className="space-y-2 pt-1 border-t border-stone-100">
            <span className="text-[11px] font-bold text-stone-600 uppercase block">
              Logistics & Special Support
            </span>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-semibold text-stone-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.requiresTransport}
                  onChange={(e) => updateFilters({ requiresTransport: e.target.checked })}
                  className="w-4 h-4 text-teal-600 accent-teal-600 rounded cursor-pointer"
                />
                <span className="flex items-center gap-1.5">
                  <Bus className="w-3.5 h-3.5 text-blue-600" />
                  <span>Transport Available (Bus / Doorstep)</span>
                </span>
              </label>

              <label className="flex items-center gap-2 text-xs font-semibold text-stone-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.requiresSpecialNeeds}
                  onChange={(e) => updateFilters({ requiresSpecialNeeds: e.target.checked })}
                  className="w-4 h-4 text-teal-600 accent-teal-600 rounded cursor-pointer"
                />
                <span className="flex items-center gap-1.5">
                  <HeartHandshake className="w-3.5 h-3.5 text-rose-600" />
                  <span>Special Educational Needs (IEP / Remedial)</span>
                </span>
              </label>
            </div>
          </div>

          {/* School Second Languages */}
          <div className="space-y-1.5 pt-1 border-t border-stone-100">
            <span className="text-[11px] font-bold text-stone-600 uppercase block">Second Language</span>
            <div className="flex flex-wrap gap-1.5">
              {SCHOOL_LANGUAGES.map((lang) => {
                const isSelected = (filters.languages || []).includes(lang);
                return (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => toggleSchoolLanguage(lang)}
                    aria-pressed={isSelected}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 ${
                      isSelected
                        ? 'bg-teal-100 border-teal-300 text-teal-950 font-bold'
                        : 'bg-white border-stone-200 text-stone-600 hover:border-stone-300'
                    }`}
                  >
                    {lang}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Done button on mobile drawer view */}
      {onCloseMobile && (
        <div className="pt-3 border-t border-stone-100">
          <button
            type="button"
            onClick={onCloseMobile}
            className="w-full min-h-[44px] py-2.5 bg-[#0D9488] hover:bg-[#115E59] active:bg-teal-900 text-white font-bold rounded-xl text-xs shadow-xs cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
            aria-label="Apply filters and close drawer"
          >
            Apply Filters & Close
          </button>
        </div>
      )}

      {/* Priority Tuner Modal */}
      <PriorityTunerModal
        isOpen={priorityTunerOpen}
        onClose={() => setPriorityTunerOpen(false)}
      />
    </aside>
  );
};
