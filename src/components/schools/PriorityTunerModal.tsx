import React from 'react';
import { Sliders, RotateCcw, X, Check } from 'lucide-react';
import { useSearch } from '../../context/SearchContext';
import { SearchPriorityWeights } from '../../types/search';
import { DEFAULT_PRESCHOOL_WEIGHTS, DEFAULT_SCHOOL_WEIGHTS } from '../../utils/preschoolScoring';

interface PriorityTunerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PriorityTunerModal: React.FC<PriorityTunerModalProps> = ({ isOpen, onClose }) => {
  const { searchState, updateFilters } = useSearch();
  const { filters } = searchState;

  const isPreschool = filters?.educationTarget === 'preschool' || 
    Boolean(filters?.preschool?.programs && filters.preschool.programs.length > 0);

  const defaultWeights = isPreschool ? DEFAULT_PRESCHOOL_WEIGHTS : DEFAULT_SCHOOL_WEIGHTS;
  const currentWeights: SearchPriorityWeights = filters.weights || defaultWeights;

  const [weights, setWeights] = React.useState<SearchPriorityWeights>(currentWeights);

  React.useEffect(() => {
    setWeights(filters.weights || defaultWeights);
  }, [filters.weights, isPreschool]);

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

  const handleSliderChange = (key: keyof SearchPriorityWeights, value: number) => {
    setWeights((prev) => ({
      ...prev,
      [key]: value / 100,
    }));
  };

  const handleApply = () => {
    updateFilters({ weights });
    onClose();
  };

  const handleReset = () => {
    setWeights(defaultWeights);
    updateFilters({ weights: undefined });
  };

  const priorityItems = isPreschool ? [
    { key: 'distance' as const, label: 'Proximity & Commute Radius', desc: 'Short travel time to prevent toddler fatigue', val: Math.round(weights.distance * 100) },
    { key: 'budget' as const, label: 'Annual Fee Budget', desc: 'Tuition within your comfortable range', val: Math.round(weights.budget * 100) },
    { key: 'programOrGrade' as const, label: 'Age & Program Alignment', desc: 'Playgroup, Nursery, LKG, or UKG fit', val: Math.round(weights.programOrGrade * 100) },
    { key: 'curriculumOrPedagogy' as const, label: 'Learning Approach (Montessori / Play-way)', desc: 'Pedagogical philosophy matching your home values', val: Math.round(weights.curriculumOrPedagogy * 100) },
    { key: 'childcareOrCare' as const, label: 'Daycare & Working Hours', desc: 'Extended timings, snacks, and caregiver ratio', val: Math.round(weights.childcareOrCare * 100) },
    { key: 'facilities' as const, label: 'Outdoor Play & Sensory Yard', desc: 'Sand pits, splash pool, and gross-motor areas', val: Math.round(weights.facilities * 100) },
  ] : [
    { key: 'distance' as const, label: 'Commute Buffer & Radius', desc: 'Radial distance from your Chennai home', val: Math.round(weights.distance * 100) },
    { key: 'budget' as const, label: 'Annual Tuition Budget', desc: 'Fit with maximum budget threshold', val: Math.round(weights.budget * 100) },
    { key: 'curriculumOrPedagogy' as const, label: 'Board Affiliation (CBSE / Cambridge / IB)', desc: 'Scholastic curriculum for long-term goals', val: Math.round(weights.curriculumOrPedagogy * 100) },
    { key: 'facilities' as const, label: 'Campus Facilities (Robotics / Pool / Turf)', desc: 'Dedicated laboratories and athletic infrastructure', val: Math.round(weights.facilities * 100) },
    { key: 'programOrGrade' as const, label: 'Target Grade Level', desc: 'Exact classroom entry grade availability', val: Math.round(weights.programOrGrade * 100) },
    { key: 'childcareOrCare' as const, label: 'Bus Fleet & SEN Support', desc: 'Doorstep GPS transport and remedial assistance', val: Math.round(weights.childcareOrCare * 100) },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-[#FAF9F6] w-full max-w-lg rounded-2xl border border-stone-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="priority-tuner-title"
      >
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-stone-200 flex items-center justify-between bg-white shrink-0">
          <div>
            <span className="text-[10px] font-bold text-teal-800 uppercase tracking-wider block">
              Tell us what matters most to you
            </span>
            <h2 id="priority-tuner-title" className="font-editorial text-base sm:text-lg font-bold text-stone-900">
              {isPreschool ? 'Preschool Priority Tuner' : 'School Priority Tuner'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sliders Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <p className="text-xs text-stone-600 leading-relaxed font-sans">
            Adjust the sliders below to prioritize what is non-negotiable for your child. The matching engine recalculates fits instantly.
          </p>

          <div className="space-y-4 pt-2">
            {priorityItems.map((item) => (
              <div key={item.key} className="bg-white p-3.5 rounded-xl border border-stone-200/80 shadow-2xs space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <label htmlFor={`slider-${item.key}`} className="font-bold text-stone-900 block cursor-pointer">
                      {item.label}
                    </label>
                    <span className="text-[11px] text-stone-500">{item.desc}</span>
                  </div>
                  <span className="font-bold text-teal-800 tabular-nums px-2 py-0.5 rounded bg-teal-50 border border-teal-200 text-xs">
                    {item.val}%
                  </span>
                </div>
                <input
                  id={`slider-${item.key}`}
                  type="range"
                  min={5}
                  max={45}
                  step={5}
                  value={item.val}
                  aria-label={`${item.label}: ${item.val}%`}
                  aria-valuemin={5}
                  aria-valuemax={45}
                  aria-valuenow={item.val}
                  aria-valuetext={`${item.val} percent`}
                  onChange={(e) => handleSliderChange(item.key, Number(e.target.value))}
                  className="w-full accent-teal-600 h-1.5 bg-stone-200 rounded-lg cursor-pointer"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 border-t border-stone-200 bg-white flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleReset}
            className="text-xs font-semibold text-stone-600 hover:text-stone-900 flex items-center justify-center gap-1.5 py-2 min-h-[44px] cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Defaults</span>
          </button>

          <button
            type="button"
            onClick={handleApply}
            className="px-5 py-2.5 min-h-[44px] bg-[#0D9488] hover:bg-[#115E59] text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Apply Priorities & Recalculate</span>
          </button>
        </div>
      </div>
    </div>
  );
};
