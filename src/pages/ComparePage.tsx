import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Scale,
  X,
  Plus,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Star,
  MapPin,
  ExternalLink,
  ChevronRight,
  ArrowRight,
  Sparkles,
  ArrowLeftRight,
  BookOpen,
  IndianRupee,
  Layers,
  CalendarCheck
} from 'lucide-react';
import { useComparison } from '../context/ComparisonContext';
import { useSearch } from '../context/SearchContext';
import { CHENNAI_SCHOOLS } from '../data/schools';
import { School } from '../types/school';
import { getCurriculumColor, getMatchScoreStyle } from '../utils/categoryColors';

export const ComparePage: React.FC = () => {
  const { comparisonSchools, removeFromComparison, toggleComparison, maxComparisonLimit } = useComparison();
  const { searchState } = useSearch();
  const { filters } = searchState;

  const [highlightDifferencesOnly, setHighlightDifferencesOnly] = useState(false);
  const [showAddPicker, setShowAddPicker] = useState(false);
  
  // Mobile side-by-side selected pair (indexes into comparisonSchools)
  const [mobilePair, setMobilePair] = useState<[number, number]>([0, Math.min(1, comparisonSchools.length - 1)]);
  const [mobileViewStyle, setMobileViewStyle] = useState<'cards' | 'side-by-side'>('cards');

  const availableToAdd = CHENNAI_SCHOOLS.filter(
    (s) => !comparisonSchools.some((c) => c.id === s.id)
  );

  const formatFee = (amount: number) => {
    return `₹${(amount / 100000).toFixed(1)}L`;
  };

  if (comparisonSchools.length === 0) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] py-16 sm:py-24 px-4 text-center">
        <div className="max-w-md mx-auto bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-800 flex items-center justify-center mx-auto border border-teal-200">
            <Scale className="w-6 h-6" />
          </div>
          <h2 className="font-editorial text-2xl font-bold text-stone-900">
            No Schools in Comparison
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-sans">
            Select 2 to 4 schools from your search results to compare fees, curriculums, facilities, and commute distances side-by-side.
          </p>
          <Link
            to="/results"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0D9488] hover:bg-[#115E59] text-white rounded-xl text-xs font-bold transition-colors min-h-[44px]"
          >
            <span>Explore Matching Schools</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    );
  }

  // Active pair for mobile side-by-side view
  const schoolA = comparisonSchools[mobilePair[0]] || comparisonSchools[0];
  const schoolB = comparisonSchools[mobilePair[1]] || comparisonSchools[Math.min(1, comparisonSchools.length - 1)];

  return (
    <div className="min-h-screen bg-[#FAF9F6] pb-24 text-stone-900">
      
      {/* Page Header */}
      <section className="bg-white border-b border-stone-200/90 py-5 sm:py-7 px-3.5 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-teal-700" />
              <h1 className="font-editorial text-xl sm:text-2xl font-bold text-stone-900 tracking-tight leading-snug">
                Compare Shortlisted Schools
              </h1>
            </div>
            <p className="text-xs text-stone-600 mt-1 font-sans">
              Comparing {comparisonSchools.length} of {maxComparisonLimit} allowed institutions side-by-side against your family priorities.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Highlight Differences toggle */}
            <label className="inline-flex items-center gap-2 text-xs font-semibold text-stone-700 cursor-pointer select-none py-1">
              <input
                type="checkbox"
                checked={highlightDifferencesOnly}
                onChange={(e) => setHighlightDifferencesOnly(e.target.checked)}
                className="w-4 h-4 text-teal-600 accent-teal-600 rounded cursor-pointer"
              />
              <span>Highlight differences</span>
            </label>

            {comparisonSchools.length < maxComparisonLimit && (
              <button
                type="button"
                onClick={() => setShowAddPicker(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#FAF9F6] hover:bg-[#F5F1E8] text-stone-800 border border-stone-200 rounded-xl text-xs font-bold transition-colors cursor-pointer min-h-[38px]"
              >
                <Plus className="w-3.5 h-3.5 text-teal-700" />
                <span>Add School</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* MOBILE-ONLY DEDICATED COMPARISON UI (md:hidden) */}
      <div className="md:hidden max-w-7xl mx-auto px-3.5 mt-5 space-y-4">
        
        {/* Mobile View Style Toggle */}
        {comparisonSchools.length >= 2 && (
          <div className="flex items-center justify-between bg-white p-1 rounded-xl border border-stone-200 text-xs">
            <button
              type="button"
              onClick={() => setMobileViewStyle('cards')}
              className={`flex-1 py-2 rounded-lg font-bold transition-all min-h-[38px] flex items-center justify-center gap-1.5 ${
                mobileViewStyle === 'cards'
                  ? 'bg-[#F5F1E8] text-teal-950 border border-teal-200/80 shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <span>Metric Cards</span>
              <span className="text-[10px] bg-white px-1.5 py-0.2 rounded-full font-mono border border-stone-200">
                All {comparisonSchools.length}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setMobileViewStyle('side-by-side')}
              className={`flex-1 py-2 rounded-lg font-bold transition-all min-h-[38px] flex items-center justify-center gap-1.5 ${
                mobileViewStyle === 'side-by-side'
                  ? 'bg-[#F5F1E8] text-teal-950 border border-teal-200/80 shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <ArrowLeftRight className="w-3.5 h-3.5 text-teal-700" />
              <span>Side-by-Side (2)</span>
            </button>
          </div>
        )}

        {/* Schools Carousel Header on Mobile */}
        <div className="grid grid-cols-2 gap-2.5">
          {comparisonSchools.map((school) => {
            const bColor = getCurriculumColor(school.curriculum[0]);
            return (
              <div
                key={school.id}
                className="bg-white p-3.5 rounded-2xl border border-stone-200 relative flex flex-col justify-between shadow-2xs"
              >
                <button
                  type="button"
                  onClick={() => removeFromComparison(school.id)}
                  className="absolute top-2 right-2 min-h-[32px] min-w-[32px] flex items-center justify-center text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100"
                  aria-label={`Remove ${school.name}`}
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="pr-4">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border inline-block mb-1.5 ${bColor.badge}`}>
                    {school.matchScore}% Fit
                  </span>
                  <h3 className="font-editorial text-xs font-bold text-stone-900 line-clamp-2 leading-snug">
                    {school.name}
                  </h3>
                  <p className="text-[11px] text-stone-500 mt-0.5 truncate">{school.area}</p>
                </div>

                <div className="mt-2.5 pt-2 border-t border-stone-100">
                  <Link
                    to={`/school/${school.slug}`}
                    className="text-[11px] font-bold text-teal-800 hover:text-teal-900 flex items-center gap-0.5"
                  >
                    <span>Profile</span>
                    <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            );
          })}

          {comparisonSchools.length < maxComparisonLimit && (
            <button
              type="button"
              onClick={() => setShowAddPicker(true)}
              className="p-4 rounded-2xl border border-dashed border-stone-300 bg-white/60 hover:bg-white text-stone-600 flex flex-col items-center justify-center gap-1 text-center min-h-[100px] transition-colors cursor-pointer"
            >
              <Plus className="w-5 h-5 text-teal-600" />
              <span className="text-xs font-bold text-stone-800">Add School</span>
              <span className="text-[10px] text-stone-400">Up to 4</span>
            </button>
          )}
        </div>

        {/* MOBILE VIEW MODE A: STACKED METRIC CARDS */}
        {mobileViewStyle === 'cards' && (
          <div className="space-y-4">
            
            {/* Benchmark Pill */}
            <div className="p-3.5 bg-[#F5F1E8] border border-stone-200 rounded-2xl text-xs text-stone-800 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Your Benchmark:</strong> {filters.grade}, Max ₹{(filters.budgetMax / 100000).toFixed(1)}L/yr, Radius ≤ {filters.radiusKm} km
              </span>
            </div>

            {/* Money & Location Card */}
            <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-2xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                <span className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                  <IndianRupee className="w-3.5 h-3.5 text-amber-600" />
                  <span>Money & Location</span>
                </span>
                <span className="text-[11px] text-stone-500 font-medium">Budget: ₹{(filters.budgetMax / 100000).toFixed(1)}L</span>
              </div>
              <div className="space-y-2.5">
                {comparisonSchools.map((s) => {
                  const fits = s.annualFeeMin <= filters.budgetMax;
                  return (
                    <div key={s.id} className="flex items-center justify-between text-xs py-1">
                      <div className="pr-2 min-w-0">
                        <span className="font-bold text-stone-900 block truncate">{s.name}</span>
                        <span className="text-[11px] text-stone-500">{s.distanceKm} km · {s.area}</span>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-bold text-stone-900 text-sm tabular-nums block">
                          {formatFee(s.annualFeeMin)} – {formatFee(s.annualFeeMax)}
                        </span>
                        <span className={`text-[10px] font-bold ${fits ? 'text-teal-800' : 'text-amber-800'}`}>
                          {fits ? '✓ Fits budget' : '△ Above budget'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Academics & Board Card */}
            <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-2xs space-y-3">
              <div className="pb-2 border-b border-stone-100">
                <span className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                  <span>Academics & Board</span>
                </span>
              </div>
              <div className="space-y-2.5">
                {comparisonSchools.map((s) => (
                  <div key={s.id} className="p-2.5 rounded-xl bg-[#FAF9F6] border border-stone-200/70 text-xs space-y-1">
                    <span className="font-bold text-stone-900 block truncate">{s.name}</span>
                    <div className="flex items-center justify-between text-stone-700">
                      <span>Board: <strong className="text-stone-900">{s.curriculum.join(', ')}</strong></span>
                      <span>Ratio: <strong className="text-stone-900 tabular-nums">{s.studentTeacherRatio}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Facilities Card */}
            <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-2xs space-y-3">
              <div className="pb-2 border-b border-stone-100">
                <span className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-violet-600" />
                  <span>Facilities & Athletics</span>
                </span>
              </div>
              <div className="space-y-2.5">
                {comparisonSchools.map((s) => {
                  const hasPool = s.facilities.some((f) => f.name.toLowerCase().includes('swimming'));
                  const hasRobotics = s.facilities.some((f) => f.name.toLowerCase().includes('robotics'));
                  return (
                    <div key={s.id} className="p-2.5 rounded-xl bg-[#FAF9F6] border border-stone-200/70 text-xs space-y-1.5">
                      <span className="font-bold text-stone-900 block truncate">{s.name}</span>
                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <span className={`inline-flex items-center gap-1 ${hasPool ? 'text-teal-800 font-bold' : 'text-stone-500'}`}>
                          {hasPool ? '✓ Swimming Pool' : '✕ No Pool'}
                        </span>
                        <span className={`inline-flex items-center gap-1 ${hasRobotics ? 'text-violet-800 font-bold' : 'text-stone-500'}`}>
                          {hasRobotics ? '✓ STEM / Robotics' : '✕ Basic Labs'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* MOBILE VIEW MODE B: DUAL-COLUMN SIDE-BY-SIDE */}
        {mobileViewStyle === 'side-by-side' && comparisonSchools.length >= 2 && (
          <div className="space-y-4">
            {comparisonSchools.length > 2 && (
              <div className="p-3 bg-white rounded-2xl border border-stone-200 text-xs space-y-2">
                <span className="font-bold text-stone-700 block">Select schools to compare side-by-side:</span>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={mobilePair[0]}
                    onChange={(e) => setMobilePair([Number(e.target.value), mobilePair[1]])}
                    className="p-2 border border-stone-200 rounded-xl text-xs font-semibold bg-[#FAF9F6] text-stone-900"
                  >
                    {comparisonSchools.map((s, idx) => (
                      <option key={s.id} value={idx} disabled={idx === mobilePair[1]}>
                        Slot 1: {s.name}
                      </option>
                    ))}
                  </select>
                  <select
                    value={mobilePair[1]}
                    onChange={(e) => setMobilePair([mobilePair[0], Number(e.target.value)])}
                    className="p-2 border border-stone-200 rounded-xl text-xs font-semibold bg-[#FAF9F6] text-stone-900"
                  >
                    {comparisonSchools.map((s, idx) => (
                      <option key={s.id} value={idx} disabled={idx === mobilePair[0]}>
                        Slot 2: {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Side-by-Side Dual Column Table */}
            <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-2xs divide-y divide-stone-100 text-xs">
              <div className="grid grid-cols-2 bg-[#FAF9F6] p-3 divide-x divide-stone-200 text-center">
                <div className="px-1">
                  <span className="text-[10px] text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded font-bold">
                    {schoolA.matchScore}% Fit
                  </span>
                  <h4 className="font-editorial font-bold text-xs text-stone-900 mt-1 line-clamp-1">{schoolA.name}</h4>
                </div>
                <div className="px-1">
                  <span className="text-[10px] text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded font-bold">
                    {schoolB.matchScore}% Fit
                  </span>
                  <h4 className="font-editorial font-bold text-xs text-stone-900 mt-1 line-clamp-1">{schoolB.name}</h4>
                </div>
              </div>

              {/* Tuition */}
              <div className="p-3">
                <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block text-center mb-1">
                  Annual Tuition
                </span>
                <div className="grid grid-cols-2 divide-x divide-stone-100 text-center font-bold text-stone-900">
                  <div>{formatFee(schoolA.annualFeeMin)}</div>
                  <div>{formatFee(schoolB.annualFeeMin)}</div>
                </div>
              </div>

              {/* Board */}
              <div className="p-3">
                <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block text-center mb-1">
                  Affiliated Board
                </span>
                <div className="grid grid-cols-2 divide-x divide-stone-100 text-center font-semibold text-stone-800">
                  <div>{schoolA.curriculum.join(', ')}</div>
                  <div>{schoolB.curriculum.join(', ')}</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* DESKTOP COMPARISON MATRIX (hidden md:block) */}
      <div className="hidden md:block max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="bg-white rounded-3xl border border-stone-200 overflow-x-auto shadow-sm">
          
          <table className="w-full text-xs text-left border-collapse min-w-[700px]">
            
            {/* Column Header: School Identity Cards */}
            <thead>
              <tr className="border-b border-stone-200 bg-[#FAF9F6]">
                <th className="p-5 w-56 shrink-0 font-bold text-stone-700 uppercase tracking-wider text-[11px] align-top sticky left-0 bg-[#FAF9F6] z-20 border-r border-stone-200">
                  Comparison Metric
                </th>
                {comparisonSchools.map((school) => {
                  const bColor = getCurriculumColor(school.curriculum[0]);
                  return (
                    <th key={school.id} className="p-5 w-64 align-top border-l border-stone-200">
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => removeFromComparison(school.id)}
                          className="absolute -top-1 -right-1 p-1 text-stone-400 hover:text-stone-800 rounded-full hover:bg-stone-200 transition-colors"
                          title="Remove from comparison"
                          aria-label={`Remove ${school.name}`}
                        >
                          <X className="w-4 h-4" />
                        </button>

                        <div className="pr-6">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border inline-block mb-1.5 ${bColor.badge}`}>
                            {school.matchScore}% Match
                          </span>
                          <h3 className="font-editorial text-sm font-bold text-stone-900 leading-snug line-clamp-2">
                            <Link to={`/school/${school.slug}`} className="hover:text-teal-800">
                              {school.name}
                            </Link>
                          </h3>
                          <p className="text-[11px] text-stone-500 mt-0.5 font-sans">
                            {school.area}
                          </p>
                        </div>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody className="divide-y divide-stone-100 font-sans">
              
              {/* SECTION: ACADEMICS 📚 */}
              <tr className="bg-blue-50/50 font-bold">
                <td colSpan={comparisonSchools.length + 1} className="py-2.5 px-5 text-xs text-blue-900 sticky left-0 z-10 bg-blue-50/80 border-r border-blue-100">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">📚</span>
                    <span className="uppercase tracking-wider">Academics & Board Structure</span>
                  </div>
                </td>
              </tr>

              <tr>
                <td className="p-3.5 px-5 font-bold text-stone-700 sticky left-0 bg-white z-10 border-r border-stone-200">Affiliated Boards</td>
                {comparisonSchools.map((s) => (
                  <td key={s.id} className="p-3.5 px-5 border-l border-stone-100 font-bold text-stone-900">
                    {s.curriculum.join(', ')}
                  </td>
                ))}
              </tr>

              <tr>
                <td className="p-3.5 px-5 font-bold text-stone-700 sticky left-0 bg-white z-10 border-r border-stone-200">Student-Teacher Ratio</td>
                {comparisonSchools.map((s) => (
                  <td key={s.id} className="p-3.5 px-5 border-l border-stone-100 tabular-nums font-bold text-stone-900">
                    {s.studentTeacherRatio}
                  </td>
                ))}
              </tr>

              {/* SECTION: MONEY & LOCATION ₹ */}
              <tr className="bg-amber-50/50 font-bold">
                <td colSpan={comparisonSchools.length + 1} className="py-2.5 px-5 text-xs text-amber-900 sticky left-0 z-10 bg-amber-50/80 border-r border-amber-100">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">₹</span>
                    <span className="uppercase tracking-wider">Money & Commute Realities</span>
                  </div>
                </td>
              </tr>

              {/* Annual Tuition Row */}
              <tr className={highlightDifferencesOnly ? 'bg-amber-50/30' : ''}>
                <td className="p-3.5 px-5 font-bold text-stone-700 sticky left-0 bg-white z-10 border-r border-stone-200">Annual Tuition Range</td>
                {comparisonSchools.map((s) => {
                  const fitsBudget = s.annualFeeMin <= filters.budgetMax;
                  return (
                    <td key={s.id} className="p-3.5 px-5 border-l border-stone-100">
                      <span className="font-bold text-stone-900 text-sm tabular-nums">
                        {formatFee(s.annualFeeMin)} – {formatFee(s.annualFeeMax)}
                      </span>
                      <span className={`block text-[11px] mt-0.5 font-bold ${fitsBudget ? 'text-teal-800' : 'text-amber-800'}`}>
                        {fitsBudget ? '✓ Fits your budget' : '△ Above budget'}
                      </span>
                    </td>
                  );
                })}
              </tr>

              {/* Commute Distance Row */}
              <tr>
                <td className="p-3.5 px-5 font-bold text-stone-700 sticky left-0 bg-white z-10 border-r border-stone-200">Commute from Search Hub</td>
                {comparisonSchools.map((s) => {
                  const fitsRadius = s.distanceKm <= filters.radiusKm;
                  return (
                    <td key={s.id} className="p-3.5 px-5 border-l border-stone-100">
                      <span className="font-bold text-stone-900 tabular-nums">{s.distanceKm} km</span>
                      <span className={`block text-[11px] mt-0.5 font-medium ${fitsRadius ? 'text-teal-800' : 'text-stone-500'}`}>
                        {fitsRadius ? '✓ Within target radius' : `+${(s.distanceKm - filters.radiusKm).toFixed(1)} km outside`}
                      </span>
                    </td>
                  );
                })}
              </tr>

              {/* SECTION: FACILITIES ◆ */}
              <tr className="bg-violet-50/50 font-bold">
                <td colSpan={comparisonSchools.length + 1} className="py-2.5 px-5 text-xs text-violet-900 sticky left-0 z-10 bg-violet-50/80 border-r border-violet-100">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">◆</span>
                    <span className="uppercase tracking-wider">Campus Facilities & Bus Fleet</span>
                  </div>
                </td>
              </tr>

              {/* Swimming Pool Check */}
              <tr>
                <td className="p-3.5 px-5 font-bold text-stone-700 sticky left-0 bg-white z-10 border-r border-stone-200">Swimming Pool</td>
                {comparisonSchools.map((s) => {
                  const hasPool = s.facilities.some((f) => f.name.toLowerCase().includes('swimming'));
                  return (
                    <td key={s.id} className="p-3.5 px-5 border-l border-stone-100">
                      {hasPool ? (
                        <span className="inline-flex items-center gap-1.5 text-sky-800 font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" />
                          <span>On-Campus Pool</span>
                        </span>
                      ) : (
                        <span className="text-stone-500">None / Off-site</span>
                      )}
                    </td>
                  );
                })}
              </tr>

              {/* Robotics & STEM */}
              <tr>
                <td className="p-3.5 px-5 font-bold text-stone-700 sticky left-0 bg-white z-10 border-r border-stone-200">Robotics & STEM Lab</td>
                {comparisonSchools.map((s) => {
                  const hasRobotics = s.facilities.some((f) => f.name.toLowerCase().includes('robotics'));
                  return (
                    <td key={s.id} className="p-3.5 px-5 border-l border-stone-100">
                      {hasRobotics ? (
                        <span className="inline-flex items-center gap-1.5 text-violet-800 font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5 text-violet-600" />
                          <span>Active STEM Lab</span>
                        </span>
                      ) : (
                        <span className="text-stone-500">Standard Labs</span>
                      )}
                    </td>
                  );
                })}
              </tr>

              {/* Transport Fleet */}
              <tr>
                <td className="p-3.5 px-5 font-bold text-stone-700 sticky left-0 bg-white z-10 border-r border-stone-200">GPS Bus Fleet</td>
                {comparisonSchools.map((s) => (
                  <td key={s.id} className="p-3.5 px-5 border-l border-stone-100">
                    <span className="font-semibold text-stone-900">Up to {s.transportRadiusKm} km</span>
                    <span className="block text-[11px] text-stone-500">
                      ₹{(s.transportFeeMin || 20000).toLocaleString('en-IN')}/yr est.
                    </span>
                  </td>
                ))}
              </tr>

              {/* SECTION: ADMISSIONS → */}
              <tr className="bg-emerald-50/50 font-bold">
                <td colSpan={comparisonSchools.length + 1} className="py-2.5 px-5 text-xs text-emerald-900 sticky left-0 z-10 bg-emerald-50/80 border-r border-emerald-100">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">→</span>
                    <span className="uppercase tracking-wider">Admissions Status & Decision</span>
                  </div>
                </td>
              </tr>

              <tr>
                <td className="p-3.5 px-5 font-bold text-stone-700 sticky left-0 bg-white z-10 border-r border-stone-200">2026-27 Cycle</td>
                {comparisonSchools.map((s) => (
                  <td key={s.id} className="p-3.5 px-5 border-l border-stone-100">
                    <span className={`px-2.5 py-0.5 rounded text-[11px] font-bold ${
                      s.admissionStatus.includes('Open') ? 'bg-emerald-100 text-emerald-900' : 'bg-stone-100 text-stone-700'
                    }`}>
                      {s.admissionStatus}
                    </span>
                  </td>
                ))}
              </tr>

              {/* Bottom Action links */}
              <tr className="bg-[#FAF9F6]">
                <td className="p-4 px-5 font-bold text-stone-700 sticky left-0 bg-[#FAF9F6] z-10 border-r border-stone-200">Next Action</td>
                {comparisonSchools.map((s) => (
                  <td key={s.id} className="p-4 px-5 border-l border-stone-100">
                    <Link
                      to={`/school/${s.slug}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#0D9488] hover:text-[#115E59]"
                    >
                      <span>View School Profile</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Add School Picker Modal */}
      {showAddPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-[#FAF9F6] w-full max-w-lg rounded-2xl border border-stone-200 shadow-xl overflow-hidden p-5 sm:p-6 space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 shrink-0">
              <h3 className="font-editorial font-bold text-stone-900 text-base">Add School to Comparison</h3>
              <button
                type="button"
                onClick={() => setShowAddPicker(false)}
                className="min-h-[44px] min-w-[44px] p-2 rounded-lg flex items-center justify-center text-stone-400 hover:text-stone-700 hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {availableToAdd.map((school) => {
                const bColor = getCurriculumColor(school.curriculum[0]);
                return (
                  <div
                    key={school.id}
                    className="p-3 bg-white rounded-xl border border-stone-200 hover:border-teal-400 flex items-center justify-between gap-3 transition-colors shadow-2xs"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${bColor.badge}`}>
                          {school.curriculum[0]}
                        </span>
                        <h4 className="font-editorial text-xs font-bold text-stone-900 truncate">
                          {school.name}
                        </h4>
                      </div>
                      <p className="text-[11px] text-stone-500 mt-0.5">
                        {school.area} · ₹{(school.annualFeeMin / 100000).toFixed(1)}L/yr
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        toggleComparison(school.id);
                        setShowAddPicker(false);
                      }}
                      className="px-3 py-1.5 bg-[#0D9488] hover:bg-[#115E59] text-white rounded-lg text-xs font-bold shrink-0 min-h-[36px]"
                    >
                      Add
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
