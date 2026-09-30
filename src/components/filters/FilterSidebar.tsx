import React from 'react';
import { RotateCcw, SlidersHorizontal, Check, ShieldCheck } from 'lucide-react';
import { useSearch } from '../../context/SearchContext';
import { Curriculum, SchoolType } from '../../types/school';

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
    <aside className="bg-white rounded-xl border border-slate-200/90 p-5 space-y-6 text-sm">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-teal-600" />
          <h3 className="font-semibold text-slate-900">Filters</h3>
          {activeFilterCount > 0 && (
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">
              {activeFilterCount}
            </span>
          )}
        </div>

        {activeFilterCount > 0 && (
          <button
            type="button"
            onClick={resetFilters}
            className="text-xs text-slate-600 hover:text-teal-700 flex items-center gap-1 font-medium transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset all</span>
          </button>
        )}
      </div>

      {/* Location Area */}
      <div className="space-y-2">
        <label htmlFor="filter-location-select" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
          Area / Locality
        </label>
        <select
          id="filter-location-select"
          value={filters.location}
          onChange={(e) => updateFilters({ location: e.target.value })}
          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white transition-all cursor-pointer"
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
          <label htmlFor="filter-radius-slider" className="font-semibold text-slate-700 uppercase tracking-wider">
            Max Commute Radius
          </label>
          <span className="font-bold text-teal-700 tabular-nums">{filters.radiusKm} km</span>
        </div>
        <input
          id="filter-radius-slider"
          type="range"
          min={2}
          max={25}
          step={1}
          value={filters.radiusKm}
          onChange={(e) => updateFilters({ radiusKm: Number(e.target.value) })}
          className="w-full accent-teal-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
        />
        <div className="flex justify-between text-[11px] text-slate-600">
          <span>2 km (Local)</span>
          <span>15 km</span>
          <span>25 km (Citywide)</span>
        </div>
      </div>

      {/* Grade Selector */}
      <div className="space-y-2">
        <label htmlFor="filter-grade-select" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
          Child's Entry Grade
        </label>
        <select
          id="filter-grade-select"
          value={filters.grade}
          onChange={(e) => updateFilters({ grade: e.target.value })}
          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white transition-all cursor-pointer"
        >
          {GRADES.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
      </div>

      {/* Annual Budget Slider */}
      <div className="space-y-2 pt-2 border-t border-slate-100">
        <div className="flex items-center justify-between text-xs">
          <label htmlFor="filter-budget-slider" className="font-semibold text-slate-700 uppercase tracking-wider">
            Max Annual Tuition
          </label>
          <span className="font-bold text-teal-700 tabular-nums">
            {formatLakhs(filters.budgetMax)}/yr
          </span>
        </div>
        <input
          id="filter-budget-slider"
          type="range"
          min={50000}
          max={300000}
          step={10000}
          value={filters.budgetMax}
          onChange={(e) => updateFilters({ budgetMax: Number(e.target.value) })}
          className="w-full accent-teal-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
        />
        <div className="flex justify-between text-[11px] text-slate-600">
          <span>₹50k</span>
          <span>₹1.5L</span>
          <span>₹3.0L+</span>
        </div>
      </div>

      {/* Curriculum Checkboxes */}
      <div className="space-y-2.5 pt-2 border-t border-slate-100">
        <span className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
          Curriculum
        </span>
        <div className="space-y-1">
          {CURRICULUM_OPTIONS.map((curriculum) => {
            const isChecked = filters.curriculums.includes(curriculum);
            return (
              <label
                key={curriculum}
                className="flex items-center gap-3 cursor-pointer text-slate-700 hover:text-slate-900 text-xs py-1.5 px-1 rounded-md hover:bg-slate-50 transition-colors select-none min-h-[38px]"
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggleCurriculum(curriculum)}
                  className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-slate-300 rounded-xs cursor-pointer accent-teal-600 shrink-0"
                />
                <span className={isChecked ? 'font-semibold text-slate-900' : ''}>{curriculum}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Priority Facilities */}
      <div className="space-y-2.5 pt-2 border-t border-slate-100">
        <span className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
          Must-Have Facilities
        </span>
        <div className="space-y-1">
          {FACILITY_OPTIONS.map((facility) => {
            const isChecked = filters.requiredFacilities.includes(facility);
            return (
              <label
                key={facility}
                className="flex items-center gap-3 cursor-pointer text-slate-700 hover:text-slate-900 text-xs py-1.5 px-1 rounded-md hover:bg-slate-50 transition-colors select-none min-h-[38px]"
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggleFacility(facility)}
                  className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-slate-300 rounded-xs cursor-pointer accent-teal-600 shrink-0"
                />
                <span className={isChecked ? 'font-semibold text-slate-900' : ''}>{facility}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Special Needs & Logistics Toggles */}
      <div className="space-y-2 pt-2 border-t border-slate-100">
        <span className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
          Specific Needs
        </span>
        
        <label className="flex items-center justify-between text-xs text-slate-700 cursor-pointer py-2 px-1 rounded-md hover:bg-slate-50 transition-colors select-none min-h-[40px]">
          <span>Inclusive Learning (SEN)</span>
          <input
            type="checkbox"
            checked={filters.requiresSpecialNeeds}
            onChange={(e) => updateFilters({ requiresSpecialNeeds: e.target.checked })}
            className="w-4 h-4 text-teal-600 accent-teal-600 rounded-xs cursor-pointer"
          />
        </label>

        <label className="flex items-center justify-between text-xs text-slate-700 cursor-pointer py-2 px-1 rounded-md hover:bg-slate-50 transition-colors select-none min-h-[40px]">
          <span>Hostel / Residential</span>
          <input
            type="checkbox"
            checked={filters.requiresHostel}
            onChange={(e) => updateFilters({ requiresHostel: e.target.checked })}
            className="w-4 h-4 text-teal-600 accent-teal-600 rounded-xs cursor-pointer"
          />
        </label>
      </div>

      {/* Verification notice */}
      <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-600 border border-slate-200/60 flex items-start gap-2">
        <ShieldCheck className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
        <span>Filters apply strictly to verified audit records. Unverified attributes are labeled transparently.</span>
      </div>

      {/* Mobile close apply button */}
      {onCloseMobile && (
        <div className="pt-2 md:hidden">
          <button
            type="button"
            onClick={onCloseMobile}
            className="w-full py-2.5 bg-teal-600 text-white rounded-lg font-semibold text-sm hover:bg-teal-700 transition-colors"
          >
            Apply Filters
          </button>
        </div>
      )}
    </aside>
  );
};
