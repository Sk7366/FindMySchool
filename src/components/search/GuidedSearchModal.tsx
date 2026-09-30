import React, { useState } from 'react';
import { X, Check, MapPin, GraduationCap, IndianRupee, BookOpen, Building2, Trophy, HeartHandshake } from 'lucide-react';
import { useSearch } from '../../context/SearchContext';
import { Curriculum, SchoolType } from '../../types/school';
import { useNavigate } from 'react-router-dom';

export type GuidedCategory = 'location' | 'grade' | 'budget' | 'curriculum' | 'schoolType' | 'activities' | 'special';

interface GuidedSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCategory?: GuidedCategory;
}

const CATEGORIES: { id: GuidedCategory; label: string; icon: React.FC<{ className?: string }> }[] = [
  { id: 'location', label: 'Location', icon: MapPin },
  { id: 'grade', label: 'Grade', icon: GraduationCap },
  { id: 'budget', label: 'Budget', icon: IndianRupee },
  { id: 'curriculum', label: 'Curriculum', icon: BookOpen },
  { id: 'schoolType', label: 'School Type', icon: Building2 },
  { id: 'activities', label: 'Facilities & Sports', icon: Trophy },
  { id: 'special', label: 'Special Needs', icon: HeartHandshake },
];

const CHENNAI_AREAS = [
  'Tambaram & GST Corridor',
  'OMR / Sholinganallur',
  'Adyar & Besant Nagar',
  'Porur & Manapakkam',
  'Anna Nagar & Mogappair',
];

const GRADES = [
  'Pre-KG', 'LKG', 'UKG',
  'Class 1', 'Class 2', 'Class 3', 'Class 4',
  'Class 5', 'Class 6', 'Class 7', 'Class 8',
  'Class 9', 'Class 10', 'Class 11', 'Class 12',
];

const CURRICULUMS: Curriculum[] = ['CBSE', 'ICSE', 'Cambridge (IGCSE)', 'IB World'];
const SCHOOL_TYPES: SchoolType[] = ['Co-educational', 'Day School', 'Day Boarding', 'Residential'];
const FACILITIES = [
  'Robotics & STEM Lab',
  'Swimming Pool',
  'Football Turf',
  'Cricket Academy & Nets',
  'Science Laboratories',
];

export const GuidedSearchModal: React.FC<GuidedSearchModalProps> = ({
  isOpen,
  onClose,
  initialCategory = 'location',
}) => {
  const [activeTab, setActiveTab] = useState<GuidedCategory>(initialCategory);
  const { searchState, updateFilters } = useSearch();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const { filters } = searchState;

  const handleApplyAndSearch = () => {
    onClose();
    navigate('/results');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white w-full max-w-2xl rounded-xl sm:rounded-2xl border border-slate-200 shadow-xl overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[90vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="guided-search-title"
      >
        {/* Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="pr-2 min-w-0">
            <h2 id="guided-search-title" className="text-sm sm:text-base font-bold text-slate-900 truncate">
              Configure Search Priorities
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-600 mt-0.5 truncate">
              Refine your criteria to narrow down best-matching schools in Chennai
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Horizontal Tab Bar */}
        <div className="flex border-b border-slate-100 overflow-x-auto scrollbar-none px-2 sm:px-4 bg-slate-50/70">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isCurrent = activeTab === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveTab(cat.id)}
                className={`flex items-center gap-1.5 py-2.5 sm:py-3 px-3 sm:px-3.5 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors cursor-pointer min-h-[40px] shrink-0 ${
                  isCurrent
                    ? 'border-teal-600 text-teal-800 bg-white'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isCurrent ? 'text-teal-600' : 'text-slate-600'}`} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {activeTab === 'location' && (
            <div className="space-y-4">
              <span className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Select Locality Hub
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {CHENNAI_AREAS.map((area) => (
                  <button
                    key={area}
                    type="button"
                    onClick={() => updateFilters({ location: area })}
                    className={`p-3 rounded-lg border text-left text-xs font-medium transition-all flex items-center justify-between cursor-pointer ${
                      filters.location === area
                        ? 'border-teal-600 bg-teal-50/60 text-teal-900 font-semibold'
                        : 'border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <span>{area}</span>
                    {filters.location === area && <Check className="w-4 h-4 text-teal-600" />}
                  </button>
                ))}
              </div>

              <div className="pt-4 border-t border-slate-100">
                <div className="flex justify-between text-xs mb-2">
                  <span className="font-semibold text-slate-700">Acceptable Commute Radius</span>
                  <span className="font-bold text-teal-700">{filters.radiusKm} km</span>
                </div>
                <input
                  type="range"
                  min={3}
                  max={25}
                  value={filters.radiusKm}
                  onChange={(e) => updateFilters({ radiusKm: Number(e.target.value) })}
                  className="w-full accent-teal-600 cursor-pointer"
                />
              </div>
            </div>
          )}

          {activeTab === 'grade' && (
            <div className="space-y-3">
              <span className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Target Admission Grade for 2026-27
              </span>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {GRADES.map((grade) => (
                  <button
                    key={grade}
                    type="button"
                    onClick={() => updateFilters({ grade })}
                    className={`py-2 px-3 rounded-lg border text-center text-xs font-medium transition-all cursor-pointer ${
                      filters.grade === grade
                        ? 'border-teal-600 bg-teal-50 text-teal-800 font-bold shadow-2xs'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {grade}
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'budget' && (
            <div className="space-y-5">
              <div>
                <span className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Maximum Annual Tuition Budget
                </span>
                <p className="text-xs text-slate-600">
                  Excludes optional transport and one-time admission charges
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center">
                <span className="text-2xl font-bold text-teal-800 tabular-nums">
                  ₹{(filters.budgetMax / 100000).toFixed(1)} Lakh / year
                </span>
                <span className="block text-xs text-slate-600 mt-1">
                  (~₹{Math.round(filters.budgetMax / 12).toLocaleString('en-IN')}/month)
                </span>
              </div>

              <input
                type="range"
                min={50000}
                max={300000}
                step={10000}
                value={filters.budgetMax}
                onChange={(e) => updateFilters({ budgetMax: Number(e.target.value) })}
                className="w-full accent-teal-600 cursor-pointer"
              />

              <div className="grid grid-cols-3 gap-2">
                {[80000, 120000, 200000].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => updateFilters({ budgetMax: preset })}
                    className={`py-1.5 px-2 text-xs rounded border transition-colors cursor-pointer ${
                      filters.budgetMax === preset
                        ? 'border-teal-600 bg-teal-50 text-teal-800 font-semibold'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    ≤ ₹{(preset / 100000).toFixed(1)} Lakh
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'curriculum' && (
            <div className="space-y-3">
              <span className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Curriculum Boards
              </span>
              <div className="space-y-2">
                {CURRICULUMS.map((curr) => {
                  const selected = filters.curriculums.includes(curr);
                  return (
                    <button
                      key={curr}
                      type="button"
                      onClick={() => {
                        const next = selected
                          ? filters.curriculums.filter((c) => c !== curr)
                          : [...filters.curriculums, curr];
                        updateFilters({ curriculums: next });
                      }}
                      className={`w-full p-3 rounded-lg border text-left text-xs transition-colors flex items-center justify-between cursor-pointer ${
                        selected
                          ? 'border-teal-600 bg-teal-50 text-teal-900 font-semibold'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span>{curr}</span>
                      {selected && <Check className="w-4 h-4 text-teal-600" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'schoolType' && (
            <div className="space-y-3">
              <span className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Type of Institution
              </span>
              <div className="grid grid-cols-2 gap-2.5">
                {SCHOOL_TYPES.map((type) => {
                  const selected = filters.schoolTypes.includes(type);
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => {
                        const next = selected
                          ? filters.schoolTypes.filter((t) => t !== type)
                          : [...filters.schoolTypes, type];
                        updateFilters({ schoolTypes: next });
                      }}
                      className={`p-3 rounded-lg border text-xs text-left transition-colors flex items-center justify-between cursor-pointer ${
                        selected
                          ? 'border-teal-600 bg-teal-50 text-teal-900 font-semibold'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span>{type}</span>
                      {selected && <Check className="w-4 h-4 text-teal-600" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'activities' && (
            <div className="space-y-3">
              <span className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Priority Facilities & Athletics
              </span>
              <div className="space-y-2">
                {FACILITIES.map((facility) => {
                  const selected = filters.requiredFacilities.includes(facility);
                  return (
                    <button
                      key={facility}
                      type="button"
                      onClick={() => {
                        const next = selected
                          ? filters.requiredFacilities.filter((f) => f !== facility)
                          : [...filters.requiredFacilities, facility];
                        updateFilters({ requiredFacilities: next });
                      }}
                      className={`w-full p-3 rounded-lg border text-left text-xs transition-colors flex items-center justify-between cursor-pointer ${
                        selected
                          ? 'border-teal-600 bg-teal-50 text-teal-900 font-semibold'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span>{facility}</span>
                      {selected && <Check className="w-4 h-4 text-teal-600" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'special' && (
            <div className="space-y-4">
              <div className="p-4 bg-teal-50/60 rounded-xl border border-teal-200/80">
                <h4 className="text-xs font-bold text-teal-900 mb-1">
                  Inclusive Education & Learning Support (SEN)
                </h4>
                <p className="text-xs text-teal-800 leading-relaxed">
                  Only show schools verified to have certified remedial educators, occupational therapy partnerships, or structured Individualized Education Plans (IEPs).
                </p>
                <div className="mt-3">
                  <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-900">
                    <input
                      type="checkbox"
                      checked={filters.requiresSpecialNeeds}
                      onChange={(e) => updateFilters({ requiresSpecialNeeds: e.target.checked })}
                      className="w-4 h-4 text-teal-600 accent-teal-600 rounded cursor-pointer"
                    />
                    <span>Require verified special educational needs support</span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer min-h-[44px] px-3 flex items-center"
          >
            Cancel
          </button>
          
          <button
            type="button"
            onClick={handleApplyAndSearch}
            className="flex-1 sm:flex-initial px-4 sm:px-5 py-2.5 min-h-[44px] bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer flex items-center justify-center text-center"
          >
            Apply & View Matches
          </button>
        </div>
      </div>
    </div>
  );
};
