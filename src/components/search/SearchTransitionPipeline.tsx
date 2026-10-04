import React, { useState, useEffect } from 'react';
import { Sparkles, Scale, CheckCircle2, Check, ArrowRight, ArrowDown } from 'lucide-react';

export interface SearchTransitionPipelineProps {
  query?: string;
  stageName?: string;
  extractedCriteriaCount?: number;
  evaluatedCount?: number;
  resultsCount: number;
  isInitialSearch?: boolean;
  onJumpToUnderstanding?: () => void;
  onOpenPriorityTuner?: () => void;
  onComplete?: () => void;
}

export const SearchTransitionPipeline: React.FC<SearchTransitionPipelineProps> = ({
  query,
  stageName = 'All Stages',
  extractedCriteriaCount = 3,
  evaluatedCount = 42,
  resultsCount,
  isInitialSearch = false,
  onJumpToUnderstanding,
  onOpenPriorityTuner,
  onComplete,
}) => {
  // 3-step sequence:
  // 1: Understanding your preferences
  // 2: Finding matching institutions
  // 3: Preparing your results
  const [activeStep, setActiveStep] = useState<number>(isInitialSearch ? 1 : 3);
  const [isAnimating, setIsAnimating] = useState<boolean>(isInitialSearch);

  useEffect(() => {
    if (!isInitialSearch) {
      setActiveStep(3);
      setIsAnimating(false);
      return;
    }

    // Short, polished sequence (keeps it fast, ~360ms total)
    // Step 1: Understanding your preferences (0ms)
    setActiveStep(1);
    setIsAnimating(true);

    const t1 = setTimeout(() => {
      // Step 2: Finding matching institutions (120ms)
      setActiveStep(2);
    }, 120);

    const t2 = setTimeout(() => {
      // Step 3: Preparing your results (240ms)
      setActiveStep(3);
    }, 240);

    const t3 = setTimeout(() => {
      setIsAnimating(false);
      onComplete?.();
    }, 360);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [isInitialSearch, query, onComplete]);

  return (
    <div
      role="region"
      aria-label="Search discovery sequence"
      className="bg-white rounded-2xl border border-stone-200/90 shadow-2xs overflow-hidden mb-4 font-sans transition-all duration-300"
    >
      {/* Editorial Header Ribbon */}
      <div className="p-3.5 sm:p-4 bg-gradient-to-r from-[#FAF9F6] via-white to-[#FAF9F6] border-b border-stone-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                isAnimating ? 'bg-teal-600 animate-pulse' : 'bg-emerald-600'
              }`}
            />
            <span className="text-[11px] font-bold text-teal-800 tracking-wider uppercase">
              {isAnimating ? 'Analyzing Preferences' : 'Search & Match Pipeline'}
            </span>
          </div>

          <div className="text-xs text-stone-500 font-medium flex items-center gap-1.5">
            <span>
              {isAnimating
                ? 'Translating priorities into verified recommendations...'
                : `${resultsCount} institutions matched against your criteria`}
            </span>
          </div>
        </div>

        {/* Short, polished 3-step sequence:
            Understanding your preferences
            ↓
            Finding matching institutions
            ↓
            Preparing your results */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 sm:gap-2.5 mt-3">
          
          {/* STEP 1: Understanding your preferences */}
          <div
            onClick={onJumpToUnderstanding}
            className={`flex-1 p-2.5 sm:p-3 rounded-xl border transition-all duration-200 flex items-center gap-2.5 cursor-pointer ${
              activeStep >= 1
                ? 'bg-sky-50/70 border-sky-300 text-sky-950 shadow-2xs'
                : 'bg-stone-50/50 border-stone-200 text-stone-400'
            }`}
          >
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold transition-colors ${
                activeStep > 1
                  ? 'bg-sky-600 text-white'
                  : activeStep === 1
                  ? 'bg-sky-600 text-white ring-2 ring-sky-300 ring-offset-1 animate-pulse'
                  : 'bg-stone-200 text-stone-500'
              }`}
            >
              {activeStep > 1 ? (
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-sky-800 block">
                Step 1
              </span>
              <p className="text-xs font-bold text-stone-900 truncate">
                Understanding your preferences
              </p>
              <span className="text-[10px] text-stone-500 block truncate">
                {extractedCriteriaCount} priority criteria identified
              </span>
            </div>
          </div>

          {/* Visual Sequence Separator (↓ on mobile, → on desktop) */}
          <div className="flex items-center justify-center py-0.5 md:py-0 text-stone-400 shrink-0">
            <ArrowDown className="w-3.5 h-3.5 md:hidden text-stone-400" />
            <ArrowRight className="w-3.5 h-3.5 hidden md:block text-stone-400" />
          </div>

          {/* STEP 2: Finding matching institutions */}
          <div
            onClick={onOpenPriorityTuner}
            className={`flex-1 p-2.5 sm:p-3 rounded-xl border transition-all duration-200 flex items-center gap-2.5 cursor-pointer ${
              activeStep >= 2
                ? 'bg-amber-50/70 border-amber-300 text-amber-950 shadow-2xs'
                : 'bg-stone-50/50 border-stone-200 text-stone-400'
            }`}
          >
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold transition-colors ${
                activeStep > 2
                  ? 'bg-amber-600 text-white'
                  : activeStep === 2
                  ? 'bg-amber-600 text-white ring-2 ring-amber-300 ring-offset-1 animate-pulse'
                  : 'bg-stone-200 text-stone-500'
              }`}
            >
              {activeStep > 2 ? (
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              ) : (
                <Scale className="w-3.5 h-3.5" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block">
                Step 2
              </span>
              <p className="text-xs font-bold text-stone-900 truncate">
                Finding matching institutions
              </p>
              <span className="text-[10px] text-stone-500 block truncate">
                {evaluatedCount} places evaluated in Chennai
              </span>
            </div>
          </div>

          {/* Visual Sequence Separator (↓ on mobile, → on desktop) */}
          <div className="flex items-center justify-center py-0.5 md:py-0 text-stone-400 shrink-0">
            <ArrowDown className="w-3.5 h-3.5 md:hidden text-stone-400" />
            <ArrowRight className="w-3.5 h-3.5 hidden md:block text-stone-400" />
          </div>

          {/* STEP 3: Preparing your results */}
          <div
            className={`flex-1 p-2.5 sm:p-3 rounded-xl border transition-all duration-200 flex items-center gap-2.5 ${
              activeStep >= 3
                ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950 shadow-2xs'
                : 'bg-stone-50/50 border-stone-200 text-stone-400'
            }`}
          >
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold transition-colors ${
                activeStep >= 3 && !isAnimating
                  ? 'bg-emerald-700 text-white shadow-2xs'
                  : activeStep === 3
                  ? 'bg-emerald-600 text-white ring-2 ring-emerald-300 ring-offset-1 animate-pulse'
                  : 'bg-stone-200 text-stone-500'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
                Step 3
              </span>
              <p className="text-xs font-bold text-stone-900 truncate">
                Preparing your results
              </p>
              <span className="text-[10px] text-stone-500 block truncate">
                {resultsCount} verified results ready
              </span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
