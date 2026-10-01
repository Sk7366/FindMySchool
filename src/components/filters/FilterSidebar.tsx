import React from 'react';
import { RotateCcw, SlidersHorizontal, Check, MapPin, IndianRupee, BookOpen, Trophy, Baby, Building2, Sliders } from 'lucide-react';
import { useSearch } from '../../context/SearchContext';
import { Curriculum, SchoolType, PreschoolProgram } from '../../types/school';
import { getCurriculumColor, getFacilityCategoryColor, getPedagogyColor } from '../../utils/categoryColors';
import { PriorityTunerModal } from '../schools/PriorityTunerModal';

const CURRICULUM_OPTIONS: Curriculum[] = ['CBSE', 'ICSE', 'Cambridge (IGCSE)', 'IB World'];
const SCHOOL_TYPE_OPTIONS: SchoolType[] = ['Co-educational', 'Day School', 'Day Boarding', 'Residential'];
const FACILITY_OPTIONS = [
  'Robotics & STEM Lab',
  'Swimming Pool',
  'Football Turf',
  'Cricket Academy & Nets',
  'Science Laboratories',
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
  'Class 3',
  'Class 5',
  'Class 8',
  'Class 9',
  'Class 11',
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

interface FilterSidebarProps {
  onCloseMobile?: () => void;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({ onCloseMobile }) => {
  const { searchState, updateFilters, setEducationTarget, resetFilters, activeFilterCount } = useSearch();
  const { filters } = searchState;
  const [priorityTunerOpen, setPriorityTunerOpen] = React.useState(false);

  const isPreschoolMode = filters.educationTarget === 'preschool';
  const isSchoolMode = filters.educationTarget === 'school';
  const isAllOrCombined = filters.educationTarget === 'all' || filters.educationTarget === 'combined';

  const toggleCurriculum = (curriculum: Curriculum) => {
    const current = filters.curriculums;
    const next = current.includes(curriculum)
      ? current.filter((c) => c !== curriculum)
      : [...current, curriculum];
    updateFilters({ curriculums: next });
  };

  const toggleFacility = (facility: string) => {
    const current = filters.requiredFacilities;
    const next = current.includes(facility)
      ? current.filter((f) => f !== facility)
      : [...current, facility];
    updateFilters({ requiredFacilities: next });
  };

  const togglePreschoolProgram = (prog: PreschoolProgram) => {
    const current = filters.preschool.programs || [];
    const next = current.includes(prog)
      ? current.filter((p) => p !== prog)
      : [...current, prog];
    updateFilters({
      preschool: { ...filters.preschool, programs: next },
    });
  };

  const togglePedagogy = (ped: string) => {
    const current = filters.preschool.pedagogy || [];
    const next = current.includes(ped)
      ? current.filter((p) => p !== ped)
      : [...current, ped];
    updateFilters({
      preschool: { ...filters.preschool, pedagogy: next },
    });
  };

  const formatLakhs = (val: number) => {
    return `₹${(val / 100000).toFixed(1)}L`;
  };

  return (
    <aside className="bg-white rounded-2xl border border-stone-200/90 p-5 space-y-6 text-sm shadow-xs">
      
      {/* Header */}
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
            onClick={resetFilters}
            className="text-xs text-stone-500 hover:text-teal-800 flex items-center gap-1 font-semibold transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
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

      {/* Education Stage Target Segmented Control */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
          Education Stage
        </label>
        <div className="grid grid-cols-3 gap-1 bg-[#FAF9F6] p-1 rounded-xl border border-stone-200 text-xs">
          <button
            type="button"
            onClick={() => setEducationTarget('all')}
            className={`py-1.5 rounded-lg font-bold transition-all text-center cursor-pointer ${
              filters.educationTarget === 'all'
                ? 'bg-white text-stone-900 shadow-2xs border border-stone-200'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setEducationTarget('preschool')}
            className={`py-1.5 rounded-lg font-bold transition-all text-center cursor-pointer ${
              filters.educationTarget === 'preschool'
                ? 'bg-white text-amber-950 shadow-2xs border border-amber-200 font-bold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Preschool
          </button>
          <button
            type="button"
            onClick={() => setEducationTarget('school')}
            className={`py-1.5 rounded-lg font-bold transition-all text-center cursor-pointer ${
              filters.educationTarget === 'school'
                ? 'bg-white text-teal-950 shadow-2xs border border-teal-200 font-bold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            School
          </button>
        </div>
      </div>

      {/* Location Area */}
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

      {/* Radius Slider */}
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
          onChange={(e) => updateFilters({ radiusKm: Number(e.target.value) })}
          className="w-full accent-teal-600 h-1.5 bg-stone-200 rounded-lg cursor-pointer"
        />
        <div className="flex justify-between text-[11px] text-stone-500">
          <span>2 km (Local)</span>
          <span>15 km</span>
          <span>25 km</span>
        </div>
      </div>

      {/* Budget Slider */}
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
          onChange={(e) => updateFilters({ budgetMax: Number(e.target.value) })}
          className="w-full accent-amber-600 h-1.5 bg-stone-200 rounded-lg cursor-pointer"
        />
        <div className="flex justify-between text-[11px] text-stone-500">
          <span>₹30k</span>
          <span>₹2.0L</span>
          <span>₹4.5L+</span>
        </div>
      </div>

      {/* PRESCHOOL-SPECIFIC FILTERS (Shown in Preschool or All mode) */}
      {(isPreschoolMode || isAllOrCombined) && (
        <div className="space-y-4 pt-3 border-t border-stone-100 bg-[#FAF9F6]/80 p-3 rounded-xl border border-amber-200/70">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-950 uppercase tracking-wider">
            <Baby className="w-3.5 h-3.5 text-amber-700" />
            <span>Early Years / Preschool Criteria</span>
          </div>

          {/* Program Checkboxes */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-stone-600 uppercase">Target Program</span>
            <div className="grid grid-cols-2 gap-1.5">
              {PRESCHOOL_PROGRAMS.map((prog) => {
                const isChecked = filters.preschool.programs?.includes(prog.id);
                return (
                  <label
                    key={prog.id}
                    className={`flex items-center justify-between p-2 rounded-lg text-xs font-semibold cursor-pointer border transition-all ${
                      isChecked
                        ? 'bg-amber-100/80 border-amber-300 text-amber-950 shadow-2xs'
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
                      className="w-3.5 h-3.5 text-amber-600 accent-amber-600 rounded"
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
                const isChecked = filters.preschool.pedagogy?.includes(ped);
                const pColor = getPedagogyColor(ped);
                return (
                  <label
                    key={ped}
                    className={`flex items-center justify-between p-1.5 px-2.5 rounded-lg text-xs font-semibold cursor-pointer border transition-all ${
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
                      className="w-3.5 h-3.5 text-teal-600 accent-teal-600 rounded"
                    />
                  </label>
                );
              })}
            </div>
          </div>

          {/* Daycare & Outdoor Play */}
          <div className="space-y-1.5 pt-1">
            <label className="flex items-center gap-2 text-xs font-semibold text-stone-800 cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(filters.preschool.daycare)}
                onChange={(e) => updateFilters({
                  preschool: { ...filters.preschool, daycare: e.target.checked }
                })}
                className="w-4 h-4 text-teal-600 accent-teal-600 rounded"
              />
              <span>Afternoon Daycare Available</span>
            </label>

            <label className="flex items-center gap-2 text-xs font-semibold text-stone-800 cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(filters.preschool.outdoorPlay)}
                onChange={(e) => updateFilters({
                  preschool: { ...filters.preschool, outdoorPlay: e.target.checked }
                })}
                className="w-4 h-4 text-teal-600 accent-teal-600 rounded"
              />
              <span>Outdoor Sand & Nature Play</span>
            </label>
          </div>
        </div>
      )}

      {/* K-12 SPECIFIC FILTERS (Shown in School or All mode) */}
      {(!isPreschoolMode || isAllOrCombined) && (
        <>
          {/* Curriculum Checkboxes with Semantic Colors */}
          <div className="space-y-2.5 pt-2 border-t border-stone-100">
            <span className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
              Curriculum Board (Grades 1–12)
            </span>
            <div className="space-y-1.5">
              {CURRICULUM_OPTIONS.map((curr) => {
                const isChecked = filters.curriculums.includes(curr);
                const cColor = getCurriculumColor(curr);
                return (
                  <label
                    key={curr}
                    className={`flex items-center justify-between p-2 rounded-xl text-xs font-semibold cursor-pointer transition-all border ${
                      isChecked
                        ? `${cColor.badge} shadow-2xs`
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

          {/* Target Grade Selector */}
          <div className="space-y-2 pt-2 border-t border-stone-100">
            <label htmlFor="filter-grade-select" className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
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

          {/* Facilities & Sports with Semantic Color Indicators */}
          <div className="space-y-2 pt-2 border-t border-stone-100">
            <span className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
              Essential Facilities
            </span>
            <div className="space-y-1.5">
              {FACILITY_OPTIONS.map((fac) => {
                const isChecked = filters.requiredFacilities.includes(fac);
                const fColor = getFacilityCategoryColor('Sports & STEM', fac);
                return (
                  <label
                    key={fac}
                    className={`flex items-center justify-between p-2 rounded-xl text-xs font-semibold cursor-pointer transition-all border ${
                      isChecked
                        ? `${fColor.badge} shadow-2xs`
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
        </>
      )}

      {/* Care & Logistics */}
      <div className="space-y-2 pt-2 border-t border-stone-100">
        <span className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
          Logistics & Special Support
        </span>
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-xs font-medium text-stone-700 cursor-pointer p-1">
            <input
              type="checkbox"
              checked={filters.requiresTransport}
              onChange={(e) => updateFilters({ requiresTransport: e.target.checked })}
              className="w-4 h-4 text-teal-600 accent-teal-600 rounded cursor-pointer"
            />
            <span>Must have verified bus / van fleet</span>
          </label>

          <label className="flex items-center gap-2 text-xs font-medium text-stone-700 cursor-pointer p-1">
            <input
              type="checkbox"
              checked={filters.requiresSpecialNeeds}
              onChange={(e) => updateFilters({ requiresSpecialNeeds: e.target.checked })}
              className="w-4 h-4 text-teal-600 accent-teal-600 rounded cursor-pointer"
            />
            <span>Special Educational Needs (IEP / Remedial)</span>
          </label>
        </div>
      </div>

      {/* Done button on mobile drawer view */}
      {onCloseMobile && (
        <div className="pt-3 border-t border-stone-100">
          <button
            type="button"
            onClick={onCloseMobile}
            className="w-full py-2.5 bg-[#0D9488] text-white font-bold rounded-xl text-xs shadow-xs"
          >
            Apply Filters
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
