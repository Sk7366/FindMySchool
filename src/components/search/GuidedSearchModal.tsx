import React, { useState } from 'react';
import { X, Check, MapPin, GraduationCap, IndianRupee, BookOpen, Building2, Trophy, HeartHandshake, Baby } from 'lucide-react';
import { useSearch } from '../../context/SearchContext';
import { Curriculum, SchoolType, PreschoolProgram } from '../../types/school';
import { useNavigate } from 'react-router-dom';
import { getCurriculumColor, getFacilityCategoryColor, getPedagogyColor } from '../../utils/categoryColors';

export type GuidedCategory = 'location' | 'preschool' | 'curriculum' | 'budget' | 'activities' | 'grade' | 'schoolType' | 'special';

interface GuidedSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCategory?: GuidedCategory;
}

const CATEGORIES: { id: GuidedCategory; label: string; icon: React.FC<{ className?: string }> }[] = [
  { id: 'location', label: 'Locality & Radius', icon: MapPin },
  { id: 'preschool', label: 'Early Years / Playschool', icon: Baby },
  { id: 'curriculum', label: 'Board / Curriculum', icon: BookOpen },
  { id: 'budget', label: 'Annual Budget', icon: IndianRupee },
  { id: 'activities', label: 'Sports & STEM', icon: Trophy },
  { id: 'grade', label: 'Grade Level', icon: GraduationCap },
  { id: 'schoolType', label: 'School Format', icon: Building2 },
  { id: 'special', label: 'Inclusive Support', icon: HeartHandshake },
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

const PRESCHOOL_PROGRAMS: { id: PreschoolProgram; label: string; ageRange: string }[] = [
  { id: 'playgroup', label: 'Playgroup / Toddler', ageRange: '1.5–2.5 years' },
  { id: 'nursery', label: 'Nursery / Pre-KG', ageRange: '2.5–3.5 years' },
  { id: 'lkg', label: 'LKG (Junior KG)', ageRange: '3.5–4.5 years' },
  { id: 'ukg', label: 'UKG (Senior KG)', ageRange: '4.5–6 years' },
];

const PEDAGOGIES = [
  'Montessori',
  'Play-way',
  'Reggio Emilia',
  'Waldorf-inspired',
  'Activity-based',
  'Traditional',
];

const GRADES = [
  'Any Grade',
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

  const togglePreschoolProgram = (prog: PreschoolProgram) => {
    const current = filters.preschool.programs || [];
    const next = current.includes(prog)
      ? current.filter((p) => p !== prog)
      : [...current, prog];
    updateFilters({
      educationTarget: next.length > 0 ? 'preschool' : filters.educationTarget,
      preschool: { ...filters.preschool, programs: next },
    });
  };

  const togglePedagogy = (ped: string) => {
    const current = filters.preschool.pedagogy || [];
    const next = current.includes(ped)
      ? current.filter((p) => p !== ped)
      : [...current, ped];
    updateFilters({
      educationTarget: next.length > 0 ? 'preschool' : filters.educationTarget,
      preschool: { ...filters.preschool, pedagogy: next },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-stone-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-[#FAF9F6] w-full max-w-2xl rounded-2xl border border-stone-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[90vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="guided-search-title"
      >
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-white">
          <div className="pr-2 min-w-0">
            <span className="text-[10px] font-bold text-teal-800 uppercase tracking-wider block">
              Structured Criteria Filter
            </span>
            <h2 id="guided-search-title" className="font-editorial text-base sm:text-lg font-bold text-stone-900 truncate">
              Configure Search Priorities
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors shrink-0"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Horizontal Tab Bar */}
        <div className="flex border-b border-stone-200 overflow-x-auto scrollbar-none px-2 sm:px-4 bg-[#F5F1E8]/70">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isCurrent = activeTab === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveTab(cat.id)}
                className={`py-3 px-3.5 text-xs font-bold whitespace-nowrap border-b-2 transition-all flex items-center gap-1.5 cursor-pointer min-h-[40px] shrink-0 ${
                  isCurrent
                    ? 'border-[#0D9488] text-[#0D9488] bg-white/60'
                    : 'border-transparent text-stone-600 hover:text-stone-900 hover:border-stone-300'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isCurrent ? 'text-[#0D9488]' : 'text-stone-500'}`} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 font-sans">
          
          {/* Location Tab */}
          {activeTab === 'location' && (
            <div className="space-y-4">
              <span className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                Select Chennai Educational Corridor
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {CHENNAI_AREAS.map((area) => (
                  <button
                    key={area}
                    type="button"
                    onClick={() => updateFilters({ location: area })}
                    className={`p-3 rounded-xl border text-left text-xs font-medium transition-all flex items-center justify-between cursor-pointer ${
                      filters.location === area
                        ? 'border-teal-600 bg-teal-50 text-teal-950 font-bold shadow-2xs'
                        : 'border-stone-200 bg-white text-stone-700 hover:border-stone-300 hover:bg-stone-50'
                    }`}
                  >
                    <span>{area}</span>
                    {filters.location === area && <Check className="w-4 h-4 text-teal-600 stroke-[3]" />}
                  </button>
                ))}
              </div>

              <div className="pt-4 border-t border-stone-200">
                <div className="flex justify-between text-xs mb-2">
                  <span className="font-bold text-stone-700">Acceptable Commute Radius</span>
                  <span className="font-bold text-teal-800">{filters.radiusKm} km</span>
                </div>
                <input
                  type="range"
                  min={2}
                  max={25}
                  value={filters.radiusKm}
                  onChange={(e) => updateFilters({ radiusKm: Number(e.target.value) })}
                  className="w-full accent-teal-600 cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* Preschool & Early Years Tab */}
          {activeTab === 'preschool' && (
            <div className="space-y-5">
              <div>
                <span className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Target Program
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {PRESCHOOL_PROGRAMS.map((prog) => {
                    const isSelected = filters.preschool.programs?.includes(prog.id);
                    return (
                      <button
                        key={prog.id}
                        type="button"
                        onClick={() => togglePreschoolProgram(prog.id)}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'border-amber-400 bg-amber-50/80 text-amber-950 shadow-2xs'
                            : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs">{prog.label}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-amber-700 stroke-[3]" />}
                        </div>
                        <span className="text-[11px] text-stone-500 mt-1">{prog.ageRange}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 border-t border-stone-100">
                <span className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                  Learning Approach / Pedagogy
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {PEDAGOGIES.map((ped) => {
                    const isSelected = filters.preschool.pedagogy?.includes(ped);
                    const pColor = getPedagogyColor(ped);
                    return (
                      <button
                        key={ped}
                        type="button"
                        onClick={() => togglePedagogy(ped)}
                        className={`p-2.5 rounded-xl border text-left text-xs font-bold transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? `${pColor.badge} shadow-2xs`
                            : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                        }`}
                      >
                        <span>{ped}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 border-t border-stone-100">
                <span className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                  Working Parent Logistics & Care
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <label className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-stone-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(filters.preschool.daycare)}
                      onChange={(e) => updateFilters({
                        educationTarget: 'preschool',
                        preschool: { ...filters.preschool, daycare: e.target.checked }
                      })}
                      className="w-4 h-4 text-teal-600 accent-teal-600 rounded"
                    />
                    <span className="font-semibold text-stone-800">Afternoon Daycare Available</span>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-stone-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(filters.preschool.outdoorPlay)}
                      onChange={(e) => updateFilters({
                        educationTarget: 'preschool',
                        preschool: { ...filters.preschool, outdoorPlay: e.target.checked }
                      })}
                      className="w-4 h-4 text-teal-600 accent-teal-600 rounded"
                    />
                    <span className="font-semibold text-stone-800">Outdoor Sand & Nature Play</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Curriculum Tab */}
          {activeTab === 'curriculum' && (
            <div className="space-y-4">
              <span className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                Select Primary Educational Boards (Grades 1–12)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {CURRICULUMS.map((curr) => {
                  const selected = filters.curriculums.includes(curr);
                  const cColor = getCurriculumColor(curr);
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
                      className={`p-3 rounded-xl border text-left text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                        selected
                          ? `${cColor.badge} shadow-2xs`
                          : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                      }`}
                    >
                      <span>{curr}</span>
                      {selected && <Check className="w-4 h-4 stroke-[3]" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Budget Tab */}
          {activeTab === 'budget' && (
            <div className="space-y-5">
              <div>
                <span className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Maximum Annual Tuition Budget
                </span>
                <p className="text-xs text-stone-500">
                  Excludes optional bus transport and one-time admission charges
                </p>
              </div>

              <div className="p-5 bg-white rounded-2xl border border-stone-200 text-center shadow-xs">
                <span className="text-2xl sm:text-3xl font-bold font-editorial text-amber-900 tabular-nums">
                  ₹{(filters.budgetMax / 100000).toFixed(1)} Lakh / year
                </span>
                <span className="block text-xs text-stone-500 mt-1">
                  (~₹{Math.round(filters.budgetMax / 12).toLocaleString('en-IN')}/month)
                </span>
              </div>

              <input
                type="range"
                min={30000}
                max={500000}
                step={10000}
                value={filters.budgetMax}
                onChange={(e) => updateFilters({ budgetMax: Number(e.target.value) })}
                className="w-full accent-amber-600 cursor-pointer"
              />
            </div>
          )}

          {/* Activities / STEM */}
          {activeTab === 'activities' && (
            <div className="space-y-4">
              <span className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                Select Campus Facilities
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {FACILITIES.map((facility) => {
                  const selected = filters.requiredFacilities.includes(facility);
                  const fColor = getFacilityCategoryColor('Sports & STEM', facility);
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
                      className={`p-3 rounded-xl border text-left text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                        selected
                          ? `${fColor.badge} shadow-2xs`
                          : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                      }`}
                    >
                      <span>{facility}</span>
                      {selected && <Check className="w-4 h-4 stroke-[3]" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Grade Level */}
          {activeTab === 'grade' && (
            <div className="space-y-4">
              <span className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                Select Classroom Entry Grade
              </span>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {GRADES.map((grade) => (
                  <button
                    key={grade}
                    type="button"
                    onClick={() => updateFilters({ grade })}
                    className={`p-2.5 rounded-xl border text-center text-xs font-bold transition-all cursor-pointer ${
                      filters.grade === grade
                        ? 'border-teal-600 bg-teal-50 text-teal-950 shadow-2xs'
                        : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    <span>{grade}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* School Type */}
          {activeTab === 'schoolType' && (
            <div className="space-y-4">
              <span className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                School Formats
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
                      className={`p-3 rounded-xl border text-left text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                        selected
                          ? 'border-[#0D9488] bg-teal-50 text-teal-950 font-bold shadow-2xs'
                          : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                      }`}
                    >
                      <span>{type}</span>
                      {selected && <Check className="w-4 h-4 text-teal-700 stroke-[3]" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Special Support */}
          {activeTab === 'special' && (
            <div className="space-y-4">
              <div className="p-5 bg-teal-50/70 rounded-2xl border border-teal-200">
                <h4 className="font-editorial text-sm font-bold text-teal-950 mb-1">
                  Inclusive Education & Learning Support (SEN)
                </h4>
                <p className="text-xs text-teal-900 leading-relaxed">
                  Only show schools verified to have certified remedial educators, occupational therapy partnerships, or structured Individualized Education Plans (IEPs).
                </p>
                <div className="mt-4">
                  <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-bold text-stone-900">
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
        <div className="px-5 sm:px-6 py-3.5 sm:py-4 border-t border-stone-200 bg-white flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-bold text-stone-600 hover:text-stone-900 cursor-pointer min-h-[44px] px-3 flex items-center"
          >
            Cancel
          </button>
          
          <button
            type="button"
            onClick={handleApplyAndSearch}
            className="flex-1 sm:flex-initial px-5 sm:px-6 py-2.5 min-h-[44px] bg-[#0D9488] hover:bg-[#115E59] text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center justify-center text-center"
          >
            Apply & View Matches
          </button>
        </div>
      </div>
    </div>
  );
};
