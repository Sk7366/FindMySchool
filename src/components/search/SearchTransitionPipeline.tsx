import React, { useState, useEffect } from 'react';
import { Search, Sparkles, Scale, Check, ArrowRight, CheckCircle2 } from 'lucide-react';

export interface SearchTransitionPipelineProps {
  query?: string;
  stageName?: string;
  extractedCriteriaCount?: number;
  evaluatedCount?: number;
  resultsCount: number;
  isInitialSearch?: boolean;
  onJumpToUnderstanding?: () => void;
  onOpenPriorityTuner?: () => void;
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
}) => {
  // Current active step during micro-transition: 1 -> 2 -> 3 -> 4
  const [activeStep, setActiveStep] = useState<number>(isInitialSearch ? 1 : 4);
  const [isAnimating, setIsAnimating] = useState<boolean>(isInitialSearch);

  useEffect(() => {
    if (!isInitialSearch) {
      setActiveStep(4);
      setIsAnimating(false);
      return;
    }

    // Intentional 4-step progressive micro-transition (total ~400ms)
    // Step 1: Search analyzed (0ms)
    setActiveStep(1);
    setIsAnimating(true);

    const t1 = setTimeout(() => {
      // Step 2: Understanding preferences (130ms)
      setActiveStep(2);
    }, 130);

    const t2 = setTimeout(() => {
      // Step 3: Matching priorities (260ms)
      setActiveStep(3);
    }, 260);

    const t3 = setTimeout(() => {
      // Step 4: Results ready (380ms)
      setActiveStep(4);
      setIsAnimating(false);
    }, 380);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [isInitialSearch, query]);

  const displayQuery = query?.trim()
    ? `"${query.slice(0, 36)}${query.length > 36 ? '…' : ''}"`
    : stageName;

  return (
    <div
      role="region"
      aria-label="Search to results transition pipeline"
      className="bg-white rounded-2xl border border-stone-200 shadow-2xs overflow-hidden mb-4 font-sans transition-all duration-300"
    >
      {/* Editorial Step Ribbon */}
      <div className="p-3.5 sm:p-4 bg-gradient-to-r from-[#FAF9F6] via-white to-[#FAF9F6] border-b border-stone-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-teal-600 animate-pulse" />
            <span className="text-[11px] font-bold text-teal-800 tracking-wider uppercase">
              Intentional Discovery Pipeline
            </span>
          </div>

          <div className="text-xs text-stone-500 font-medium flex items-center gap-1.5">
            <span>{isAnimating ? 'Processing your search...' : 'Search translated into verified matches'}</span>
          </div>
        </div>

        {/* 4 Interactive Flow Nodes */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3 mt-3">
          
          {/* STEP 1: SEARCH */}
          <div
            className={`p-2.5 sm:p-3 rounded-xl border transition-all duration-300 flex items-start gap-2.5 ${
              activeStep >= 1
                ? 'bg-teal-50/70 border-teal-200 text-teal-950'
                : 'bg-stone-50/50 border-stone-200 text-stone-400'
            }`}
          >
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold transition-colors ${
                activeStep >= 1
                  ? 'bg-teal-600 text-white shadow-2xs'
                  : 'bg-stone-200 text-stone-500'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800">
                  1. Search
                </span>
                {activeStep > 1 && <Check className="w-3 h-3 text-teal-700 stroke-[3]" />}
              </div>
              <p className="text-xs font-semibold text-stone-900 truncate mt-0.5" title={query || stageName}>
                {displayQuery}
              </p>
            </div>
          </div>

          {/* STEP 2: UNDERSTANDING */}
          <div
            onClick={onJumpToUnderstanding}
            className={`p-2.5 sm:p-3 rounded-xl border transition-all duration-300 flex items-start gap-2.5 cursor-pointer hover:border-teal-300 ${
              activeStep >= 2
                ? 'bg-sky-50/70 border-sky-200 text-sky-950'
                : 'bg-stone-50/50 border-stone-200 text-stone-400'
            }`}
          >
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold transition-colors ${
                activeStep >= 2
                  ? 'bg-sky-600 text-white shadow-2xs'
                  : 'bg-stone-200 text-stone-500'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-800">
                  2. Understanding
                </span>
                {activeStep > 2 && <Check className="w-3 h-3 text-sky-700 stroke-[3]" />}
              </div>
              <p className="text-xs font-semibold text-stone-900 truncate mt-0.5">
                {extractedCriteriaCount} Criteria Extracted
              </p>
            </div>
          </div>

          {/* STEP 3: MATCHING */}
          <div
            onClick={onOpenPriorityTuner}
            className={`p-2.5 sm:p-3 rounded-xl border transition-all duration-300 flex items-start gap-2.5 cursor-pointer hover:border-amber-300 ${
              activeStep >= 3
                ? 'bg-amber-50/70 border-amber-200 text-amber-950'
                : 'bg-stone-50/50 border-stone-200 text-stone-400'
            }`}
          >
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold transition-colors ${
                activeStep >= 3
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'bg-stone-200 text-stone-500'
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
                  3. Matching
                </span>
                {activeStep > 3 && <Check className="w-3 h-3 text-amber-700 stroke-[3]" />}
              </div>
              <p className="text-xs font-semibold text-stone-900 truncate mt-0.5">
                {evaluatedCount} Places Evaluated
              </p>
            </div>
          </div>

          {/* STEP 4: RESULTS */}
          <div
            className={`p-2.5 sm:p-3 rounded-xl border transition-all duration-300 flex items-start gap-2.5 ${
              activeStep >= 4
                ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950 shadow-2xs'
                : 'bg-stone-50/50 border-stone-200 text-stone-400'
            }`}
          >
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold transition-colors ${
                activeStep >= 4
                  ? 'bg-emerald-700 text-white shadow-2xs'
                  : 'bg-stone-200 text-stone-500'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                  4. Results
                </span>
                {activeStep >= 4 && <Check className="w-3 h-3 text-emerald-700 stroke-[3]" />}
              </div>
              <p className="text-xs font-bold text-stone-900 truncate mt-0.5">
                {resultsCount} Matching Places
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
