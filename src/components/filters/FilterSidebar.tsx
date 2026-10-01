import React from 'react';
import { RotateCcw, SlidersHorizontal, Check, ShieldCheck, MapPin, IndianRupee, BookOpen, Trophy } from 'lucide-react';
import { useSearch } from '../../context/SearchContext';
import { Curriculum, SchoolType } from '../../types/school';
import { getCurriculumColor, getFacilityCategoryColor } from '../../utils/categoryColors';

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
];
const GRADES = [
  'Any Grade',
  'Pre-KG',
  'LKG',
  'UKG',
  'Class 1',
  'Class 3',
  'Class 5',
  'Class 8',
  'Class 9',
  'Class 11',
];

interface FilterSidebarProps {
  onCloseMobile?: () => void;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({ onCloseMobile }) => {
  const { searchState, updateFilters, resetFilters, activeFilterCount } = useSearch();
  const { filters } = searchState;

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

  const toggleSchoolType = (type: SchoolType) => {
    const current = filters.schoolTypes;
    const next = current.includes(type)
      ? current.filter((t) => t !== type)
      : [...current, type];
    updateFilters({ schoolTypes: next });
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
          min={40000}
          max={500000}
          step={10000}
          value={filters.budgetMax}
          onChange={(e) => updateFilters({ budgetMax: Number(e.target.value) })}
          className="w-full accent-amber-600 h-1.5 bg-stone-200 rounded-lg cursor-pointer"
        />
        <div className="flex justify-between text-[11px] text-stone-500">
          <span>₹40k</span>
          <span>₹2.5L</span>
          <span>₹5.0L+</span>
        </div>
      </div>

      {/* Curriculum Checkboxes with Semantic Colors */}
      <div className="space-y-2.5 pt-2 border-t border-stone-100">
        <span className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
          Curriculum Board
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
          Target Grade
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

      {/* Special Needs & Transport Toggles */}
      <div className="space-y-2 pt-2 border-t border-stone-100">
        <span className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
          Care & Logistics
        </span>
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-xs font-medium text-stone-700 cursor-pointer p-1">
            <input
              type="checkbox"
              checked={filters.requiresTransport}
              onChange={(e) => updateFilters({ requiresTransport: e.target.checked })}
              className="w-4 h-4 text-teal-600 accent-teal-600 rounded cursor-pointer"
            />
            <span>Must have verified bus fleet</span>
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
    </aside>
  );
};
