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
} from 'lucide-react';
import { useComparison } from '../context/ComparisonContext';
import { useSearch } from '../context/SearchContext';
import { CHENNAI_SCHOOLS } from '../data/schools';
import { School } from '../types/school';

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
      <div className="min-h-screen bg-slate-50 py-16 sm:py-20 px-4 text-center">
        <div className="max-w-md mx-auto bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="w-12 h-12 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center mx-auto">
            <Scale className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 font-display">
            No Schools in Comparison
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Select 2 to 4 schools from your search results to compare fees, curriculums, facilities, and commute distances side-by-side.
          </p>
          <Link
            to="/results"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold transition-colors min-h-[44px]"
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
    <div className="min-h-screen bg-slate-50/70 pb-24">
      
      {/* Page Header */}
      <section className="bg-white border-b border-slate-200 py-4 sm:py-6 px-3.5 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-teal-600" />
              <h1 className="text-xl sm:text-2xl font-bold font-display text-slate-950 tracking-tight leading-snug">
                Compare Shortlisted Schools
              </h1>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              Evaluating {comparisonSchools.length} of {maxComparisonLimit} allowed institutions side-by-side against your family priorities.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Highlight Differences toggle */}
            <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer select-none py-1">
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
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition-colors cursor-pointer min-h-[38px]"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add School</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* MOBILE-ONLY DEDICATED COMPARISON UI (md:hidden) */}
      <div className="md:hidden max-w-7xl mx-auto px-3.5 mt-5 space-y-4">
        
        {/* Mobile View Style Toggle (if >= 2 schools) */}
        {comparisonSchools.length >= 2 && (
          <div className="flex items-center justify-between bg-white p-1 rounded-xl border border-slate-200 text-xs">
            <button
              type="button"
              onClick={() => setMobileViewStyle('cards')}
              className={`flex-1 py-2 rounded-lg font-semibold transition-all min-h-[38px] flex items-center justify-center gap-1.5 ${
                mobileViewStyle === 'cards'
                  ? 'bg-teal-50 text-teal-900 border border-teal-200 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Metric Cards</span>
              <span className="text-[10px] bg-slate-100 px-1.5 py-0.2 rounded-full font-mono">
                All {comparisonSchools.length}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setMobileViewStyle('side-by-side')}
              className={`flex-1 py-2 rounded-lg font-semibold transition-all min-h-[38px] flex items-center justify-center gap-1.5 ${
                mobileViewStyle === 'side-by-side'
                  ? 'bg-teal-50 text-teal-900 border border-teal-200 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowLeftRight className="w-3.5 h-3.5 text-teal-700" />
              <span>Side-by-Side (2)</span>
            </button>
          </div>
        )}

        {/* Schools Carousel Header on Mobile */}
        <div className="grid grid-cols-2 gap-2.5">
          {comparisonSchools.map((school, idx) => (
            <div
              key={school.id}
              className="bg-white p-3 rounded-xl border border-slate-200 relative flex flex-col justify-between shadow-2xs"
            >
              <button
                type="button"
                onClick={() => removeFromComparison(school.id)}
                className="absolute top-2 right-2 min-h-[32px] min-w-[32px] flex items-center justify-center text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100"
                aria-label={`Remove ${school.name}`}
              >
                <X className="w-4 h-4" />
              </button>

              <div className="pr-5">
                <span className="text-[10px] font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200 inline-block mb-1">
                  {school.matchScore}% Match
                </span>
                <h3 className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug">
                  {school.name}
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5 truncate">{school.area}</p>
              </div>

              <div className="mt-2.5 pt-2 border-t border-slate-100">
                <Link
                  to={`/school/${school.slug}`}
                  className="text-[11px] font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-0.5"
                >
                  <span>Profile</span>
                  <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}

          {comparisonSchools.length < maxComparisonLimit && (
            <button
              type="button"
              onClick={() => setShowAddPicker(true)}
              className="p-4 rounded-xl border border-dashed border-slate-300 bg-white/60 hover:bg-white text-slate-600 flex flex-col items-center justify-center gap-1 text-center min-h-[100px] transition-colors cursor-pointer"
            >
              <Plus className="w-5 h-5 text-teal-600" />
              <span className="text-xs font-semibold text-slate-800">Add School</span>
              <span className="text-[10px] text-slate-400">Up to 4 schools</span>
            </button>
          )}
        </div>

        {/* MOBILE VIEW MODE A: STACKED METRIC CARDS */}
        {mobileViewStyle === 'cards' && (
          <div className="space-y-4">
            
            {/* Benchmark Pill */}
            <div className="p-3 bg-teal-50 border border-teal-200/80 rounded-xl text-xs text-teal-950 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-teal-600 shrink-0" />
              <span>
                <strong>Your Benchmark:</strong> {filters.grade}, Max ₹{(filters.budgetMax / 100000).toFixed(1)}L/yr, Radius ≤ {filters.radiusKm} km
              </span>
            </div>

            {/* Metric 1: Annual Tuition */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">Annual Tuition</span>
                <span className="text-[11px] text-slate-500 font-medium">Cap: ₹{(filters.budgetMax / 100000).toFixed(1)}L</span>
              </div>
              <div className="space-y-2.5">
                {comparisonSchools.map((s) => {
                  const fits = s.annualFeeMin <= filters.budgetMax;
                  return (
                    <div key={s.id} className="flex items-center justify-between text-xs py-1">
                      <div className="pr-2 min-w-0">
                        <span className="font-semibold text-slate-900 block truncate">{s.name}</span>
                        <span className="text-[11px] text-slate-500">{s.area}</span>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-bold text-slate-900 text-sm tabular-nums block">
                          {formatFee(s.annualFeeMin)} – {formatFee(s.annualFeeMax)}
                        </span>
                        <span className={`text-[10px] font-semibold ${fits ? 'text-teal-700' : 'text-amber-700'}`}>
                          {fits ? '✓ Fits budget' : '△ Above budget'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Metric 2: Commute Distance */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">Commute Distance</span>
                <span className="text-[11px] text-slate-500 font-medium">Radius: ≤ {filters.radiusKm} km</span>
              </div>
              <div className="space-y-2.5">
                {comparisonSchools.map((s) => {
                  const fits = s.distanceKm <= filters.radiusKm;
                  return (
                    <div key={s.id} className="flex items-center justify-between text-xs py-1">
                      <div className="pr-2 min-w-0">
                        <span className="font-semibold text-slate-900 block truncate">{s.name}</span>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-bold text-slate-900 tabular-nums block">{s.distanceKm} km</span>
                        <span className={`text-[10px] font-semibold ${fits ? 'text-teal-700' : 'text-slate-500'}`}>
                          {fits ? '✓ In radius' : `+${(s.distanceKm - filters.radiusKm).toFixed(1)} km outside`}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Metric 3: Curriculum & Ratio */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3">
              <div className="pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">Curriculum & Student Ratio</span>
              </div>
              <div className="space-y-3">
                {comparisonSchools.map((s) => (
                  <div key={s.id} className="p-2.5 rounded-lg bg-slate-50/70 border border-slate-100 text-xs space-y-1">
                    <span className="font-bold text-slate-900 block truncate">{s.name}</span>
                    <div className="flex items-center justify-between text-slate-700">
                      <span>Board: <strong className="text-slate-900">{s.curriculum.join(', ')}</strong></span>
                      <span>Ratio: <strong className="text-slate-900 tabular-nums">{s.studentTeacherRatio}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Metric 4: Facilities (Pool, Robotics, Transport) */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3">
              <div className="pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">Campus Facilities & Bus</span>
              </div>
              <div className="space-y-3">
                {comparisonSchools.map((s) => {
                  const hasPool = s.facilities.some((f) => f.name.toLowerCase().includes('swimming'));
                  const hasRobotics = s.facilities.some((f) => f.name.toLowerCase().includes('robotics'));
                  return (
                    <div key={s.id} className="p-2.5 rounded-lg bg-slate-50/70 border border-slate-100 text-xs space-y-1.5">
                      <span className="font-bold text-slate-900 block truncate">{s.name}</span>
                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <span className={`inline-flex items-center gap-1 ${hasPool ? 'text-teal-800 font-semibold' : 'text-slate-500'}`}>
                          {hasPool ? '✓ Swimming Pool' : '✕ No Pool'}
                        </span>
                        <span className={`inline-flex items-center gap-1 ${hasRobotics ? 'text-teal-800 font-semibold' : 'text-slate-500'}`}>
                          {hasRobotics ? '✓ STEM / Robotics' : '✕ Basic Labs'}
                        </span>
                        <span className="text-slate-700 col-span-2">
                          Bus Fleet: Up to {s.transportRadiusKm} km (₹{(s.transportFeeMin || 20000).toLocaleString('en-IN')}/yr est.)
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Metric 5: Admissions Cycle */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3">
              <div className="pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">Admissions Status</span>
              </div>
              <div className="space-y-2">
                {comparisonSchools.map((s) => (
                  <div key={s.id} className="flex items-center justify-between text-xs py-1">
                    <span className="font-medium text-slate-900 truncate pr-2">{s.name}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold shrink-0 ${
                      s.admissionStatus.includes('Open') ? 'bg-teal-100 text-teal-800' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {s.admissionStatus}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* MOBILE VIEW MODE B: DUAL-COLUMN SIDE-BY-SIDE (Zero horizontal overflow) */}
        {mobileViewStyle === 'side-by-side' && comparisonSchools.length >= 2 && (
          <div className="space-y-4">
            
            {/* Pair Switcher if > 2 schools */}
            {comparisonSchools.length > 2 && (
              <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs space-y-2">
                <span className="font-semibold text-slate-700 block">Select schools to compare side-by-side:</span>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={mobilePair[0]}
                    onChange={(e) => setMobilePair([Number(e.target.value), mobilePair[1]])}
                    className="p-2 border border-slate-200 rounded-lg text-xs font-medium bg-slate-50 text-slate-900"
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
                    className="p-2 border border-slate-200 rounded-lg text-xs font-medium bg-slate-50 text-slate-900"
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

            {/* Side-by-Side Dual Column Table formatted specifically for mobile screens */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs divide-y divide-slate-100 text-xs">
              
              {/* Header Titles */}
              <div className="grid grid-cols-2 bg-slate-50 p-3 divide-x divide-slate-200 text-center">
                <div className="px-1">
                  <span className="text-[10px] text-teal-800 bg-teal-50 border border-teal-200 px-1.5 py-0.5 rounded font-bold">
                    {schoolA.matchScore}% Fit
                  </span>
                  <h4 className="font-bold text-slate-900 mt-1 line-clamp-2">{schoolA.name}</h4>
                </div>
                <div className="px-1">
                  <span className="text-[10px] text-teal-800 bg-teal-50 border border-teal-200 px-1.5 py-0.5 rounded font-bold">
                    {schoolB.matchScore}% Fit
                  </span>
                  <h4 className="font-bold text-slate-900 mt-1 line-clamp-2">{schoolB.name}</h4>
                </div>
              </div>

              {/* Annual Tuition */}
              <div className="p-3">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block text-center mb-2">
                  Annual Tuition
                </span>
                <div className="grid grid-cols-2 divide-x divide-slate-100 text-center">
                  <div className="px-2">
                    <span className="font-bold text-slate-900 block tabular-nums">
                      {formatFee(schoolA.annualFeeMin)} – {formatFee(schoolA.annualFeeMax)}
                    </span>
                    <span className={`text-[10px] font-semibold ${schoolA.annualFeeMin <= filters.budgetMax ? 'text-teal-700' : 'text-amber-700'}`}>
                      {schoolA.annualFeeMin <= filters.budgetMax ? '✓ Fits budget' : '△ Above'}
                    </span>
                  </div>
                  <div className="px-2">
                    <span className="font-bold text-slate-900 block tabular-nums">
                      {formatFee(schoolB.annualFeeMin)} – {formatFee(schoolB.annualFeeMax)}
                    </span>
                    <span className={`text-[10px] font-semibold ${schoolB.annualFeeMin <= filters.budgetMax ? 'text-teal-700' : 'text-amber-700'}`}>
                      {schoolB.annualFeeMin <= filters.budgetMax ? '✓ Fits budget' : '△ Above'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Commute Distance */}
              <div className="p-3">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block text-center mb-2">
                  Distance from Hub
                </span>
                <div className="grid grid-cols-2 divide-x divide-slate-100 text-center">
                  <div className="px-2">
                    <span className="font-bold text-slate-900 block tabular-nums">{schoolA.distanceKm} km</span>
                    <span className="text-[10px] text-slate-500">
                      {schoolA.distanceKm <= filters.radiusKm ? '✓ In radius' : 'Outside radius'}
                    </span>
                  </div>
                  <div className="px-2">
                    <span className="font-bold text-slate-900 block tabular-nums">{schoolB.distanceKm} km</span>
                    <span className="text-[10px] text-slate-500">
                      {schoolB.distanceKm <= filters.radiusKm ? '✓ In radius' : 'Outside radius'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Board & Ratio */}
              <div className="p-3">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block text-center mb-2">
                  Board & Class Ratio
                </span>
                <div className="grid grid-cols-2 divide-x divide-slate-100 text-center">
                  <div className="px-2">
                    <span className="font-semibold text-slate-900 block">{schoolA.curriculum.join(', ')}</span>
                    <span className="text-[10px] text-slate-600 tabular-nums">Ratio {schoolA.studentTeacherRatio}</span>
                  </div>
                  <div className="px-2">
                    <span className="font-semibold text-slate-900 block">{schoolB.curriculum.join(', ')}</span>
                    <span className="text-[10px] text-slate-600 tabular-nums">Ratio {schoolB.studentTeacherRatio}</span>
                  </div>
                </div>
              </div>

              {/* Swimming Pool & STEM */}
              <div className="p-3">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block text-center mb-2">
                  Pool & Robotics
                </span>
                <div className="grid grid-cols-2 divide-x divide-slate-100 text-center text-[11px]">
                  <div className="px-2 space-y-0.5">
                    <span className="block font-medium">
                      {schoolA.facilities.some(f => f.name.toLowerCase().includes('swimming')) ? '✓ Pool' : '✕ No pool'}
                    </span>
                    <span className="block text-slate-500">
                      {schoolA.facilities.some(f => f.name.toLowerCase().includes('robotics')) ? '✓ STEM Lab' : '✕ Basic'}
                    </span>
                  </div>
                  <div className="px-2 space-y-0.5">
                    <span className="block font-medium">
                      {schoolB.facilities.some(f => f.name.toLowerCase().includes('swimming')) ? '✓ Pool' : '✕ No pool'}
                    </span>
                    <span className="block text-slate-500">
                      {schoolB.facilities.some(f => f.name.toLowerCase().includes('robotics')) ? '✓ STEM Lab' : '✕ Basic'}
                    </span>
                  </div>
                </div>
              </div>

              {/* View Profile Action */}
              <div className="grid grid-cols-2 p-3 divide-x divide-slate-100 text-center bg-slate-50/50">
                <Link
                  to={`/school/${schoolA.slug}`}
                  className="text-xs font-semibold text-teal-700 hover:text-teal-800 py-1"
                >
                  View Profile →
                </Link>
                <Link
                  to={`/school/${schoolB.slug}`}
                  className="text-xs font-semibold text-teal-700 hover:text-teal-800 py-1"
                >
                  View Profile →
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* DESKTOP COMPARISON MATRIX (hidden md:block) */}
      <div className="hidden md:block max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="bg-white rounded-2xl border border-slate-200 overflow-x-auto shadow-2xs">
          
          <table className="w-full text-xs text-left border-collapse min-w-[700px]">
            
            {/* Column Header: School Identity Cards */}
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70">
                <th className="p-4 w-52 shrink-0 font-bold text-slate-800 uppercase tracking-wider text-[11px] align-top sticky left-0 bg-slate-50 z-20 border-r border-slate-200">
                  Comparison Metric
                </th>
                {comparisonSchools.map((school) => (
                  <th key={school.id} className="p-4 w-64 align-top border-l border-slate-200">
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => removeFromComparison(school.id)}
                        className="absolute -top-1 -right-1 p-1 text-slate-400 hover:text-slate-800 rounded-full hover:bg-slate-200 transition-colors"
                        title="Remove from comparison"
                        aria-label={`Remove ${school.name}`}
                      >
                        <X className="w-4 h-4" />
                      </button>

                      <div className="pr-6">
                        <span className="text-[10px] font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200 inline-block mb-1">
                          {school.matchScore}% Match
                        </span>
                        <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2">
                          <Link to={`/school/${school.slug}`} className="hover:text-teal-700">
                            {school.name}
                          </Link>
                        </h3>
                        <p className="text-[11px] text-slate-600 mt-0.5">
                          {school.area}
                        </p>
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              
              {/* SECTION: YOUR PRIORITIES BENCHMARK */}
              <tr className="bg-teal-50/40 font-semibold">
                <td colSpan={comparisonSchools.length + 1} className="py-2.5 px-4 text-xs text-teal-900 sticky left-0 z-10 bg-teal-50/80">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                    <span>Your Family Benchmark ({filters.grade}, Max ₹{(filters.budgetMax / 100000).toFixed(1)}L, Radius ≤ {filters.radiusKm} km)</span>
                  </div>
                </td>
              </tr>

              {/* Match Tier Row */}
              <tr>
                <td className="p-3.5 px-4 font-semibold text-slate-700 sticky left-0 bg-white z-10 border-r border-slate-200">Overall Fit Tier</td>
                {comparisonSchools.map((s) => (
                  <td key={s.id} className="p-3.5 px-4 border-l border-slate-100">
                    <span className="font-bold text-teal-800">{s.matchTier}</span>
                    <span className="block text-[11px] text-slate-600 mt-0.5">{s.matchScore}% calculated alignment</span>
                  </td>
                ))}
              </tr>

              {/* Annual Tuition Row */}
              <tr className={highlightDifferencesOnly ? 'bg-amber-50/30' : ''}>
                <td className="p-3.5 px-4 font-semibold text-slate-700 sticky left-0 bg-white z-10 border-r border-slate-200">Annual Tuition Range</td>
                {comparisonSchools.map((s) => {
                  const fitsBudget = s.annualFeeMin <= filters.budgetMax;
                  return (
                    <td key={s.id} className="p-3.5 px-4 border-l border-slate-100">
                      <span className="font-bold text-slate-900 text-sm tabular-nums">
                        {formatFee(s.annualFeeMin)} – {formatFee(s.annualFeeMax)}
                      </span>
                      <span className={`block text-[11px] mt-0.5 font-medium ${fitsBudget ? 'text-teal-700' : 'text-amber-700'}`}>
                        {fitsBudget ? '✓ Fits your budget' : '△ Above preferred limit'}
                      </span>
                    </td>
                  );
                })}
              </tr>

              {/* Commute Distance Row */}
              <tr>
                <td className="p-3.5 px-4 font-semibold text-slate-700 sticky left-0 bg-white z-10 border-r border-slate-200">Distance from Search Hub</td>
                {comparisonSchools.map((s) => {
                  const fitsRadius = s.distanceKm <= filters.radiusKm;
                  return (
                    <td key={s.id} className="p-3.5 px-4 border-l border-slate-100">
                      <span className="font-semibold text-slate-900 tabular-nums">{s.distanceKm} km</span>
                      <span className={`block text-[11px] mt-0.5 ${fitsRadius ? 'text-teal-700' : 'text-slate-600'}`}>
                        {fitsRadius ? '✓ Within target radius' : `+${(s.distanceKm - filters.radiusKm).toFixed(1)} km outside`}
                      </span>
                    </td>
                  );
                })}
              </tr>

              {/* SECTION: ACADEMICS & BOARD */}
              <tr className="bg-slate-50/80 font-semibold">
                <td colSpan={comparisonSchools.length + 1} className="py-2 px-4 text-[11px] uppercase tracking-wider text-slate-700 sticky left-0 z-10 bg-slate-50">
                  Curriculum & Academics
                </td>
              </tr>

              {/* Curriculums */}
              <tr>
                <td className="p-3.5 px-4 font-semibold text-slate-700 sticky left-0 bg-white z-10 border-r border-slate-200">Affiliated Boards</td>
                {comparisonSchools.map((s) => (
                  <td key={s.id} className="p-3.5 px-4 border-l border-slate-100 font-medium text-slate-900">
                    {s.curriculum.join(', ')}
                  </td>
                ))}
              </tr>

              {/* Student Teacher Ratio */}
              <tr>
                <td className="p-3.5 px-4 font-semibold text-slate-700 sticky left-0 bg-white z-10 border-r border-slate-200">Student-Teacher Ratio</td>
                {comparisonSchools.map((s) => (
                  <td key={s.id} className="p-3.5 px-4 border-l border-slate-100 tabular-nums font-semibold text-slate-800">
                    {s.studentTeacherRatio}
                  </td>
                ))}
              </tr>

              {/* SECTION: FACILITIES & SPORTS */}
              <tr className="bg-slate-50/80 font-semibold">
                <td colSpan={comparisonSchools.length + 1} className="py-2 px-4 text-[11px] uppercase tracking-wider text-slate-700 sticky left-0 z-10 bg-slate-50">
                  Facilities & Extracurriculars
                </td>
              </tr>

              {/* Swimming Pool Check */}
              <tr>
                <td className="p-3.5 px-4 font-semibold text-slate-700 sticky left-0 bg-white z-10 border-r border-slate-200">Swimming Pool</td>
                {comparisonSchools.map((s) => {
                  const hasPool = s.facilities.some((f) => f.name.toLowerCase().includes('swimming'));
                  return (
                    <td key={s.id} className="p-3.5 px-4 border-l border-slate-100">
                      {hasPool ? (
                        <span className="inline-flex items-center gap-1 text-teal-800 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                          <span>On-Campus Pool</span>
                        </span>
                      ) : (
                        <span className="text-slate-600">None / External</span>
                      )}
                    </td>
                  );
                })}
              </tr>

              {/* Robotics & STEM */}
              <tr>
                <td className="p-3.5 px-4 font-semibold text-slate-700 sticky left-0 bg-white z-10 border-r border-slate-200">Robotics & STEM Lab</td>
                {comparisonSchools.map((s) => {
                  const hasRobotics = s.facilities.some((f) => f.name.toLowerCase().includes('robotics'));
                  return (
                    <td key={s.id} className="p-3.5 px-4 border-l border-slate-100">
                      {hasRobotics ? (
                        <span className="inline-flex items-center gap-1 text-teal-800 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                          <span>Active Robotics Lab</span>
                        </span>
                      ) : (
                        <span className="text-slate-600">Elective / Basic</span>
                      )}
                    </td>
                  );
                })}
              </tr>

              {/* Transport Fleet */}
              <tr>
                <td className="p-3.5 px-4 font-semibold text-slate-700 sticky left-0 bg-white z-10 border-r border-slate-200">GPS Bus Fleet</td>
                {comparisonSchools.map((s) => (
                  <td key={s.id} className="p-3.5 px-4 border-l border-slate-100">
                    <span className="font-medium text-slate-900">Up to {s.transportRadiusKm} km</span>
                    <span className="block text-[11px] text-slate-600">
                      ₹{(s.transportFeeMin || 20000).toLocaleString('en-IN')}/yr est.
                    </span>
                  </td>
                ))}
              </tr>

              {/* Inclusive Needs */}
              <tr>
                <td className="p-3.5 px-4 font-semibold text-slate-700 sticky left-0 bg-white z-10 border-r border-slate-200">Special Needs (SEN)</td>
                {comparisonSchools.map((s) => (
                  <td key={s.id} className="p-3.5 px-4 border-l border-slate-100">
                    {s.hasSpecialNeedsSupport ? (
                      <span className="text-teal-800 font-medium">Certified Educators</span>
                    ) : (
                      <span className="text-slate-600">Standard Classrooms</span>
                    )}
                  </td>
                ))}
              </tr>

              {/* SECTION: ADMISSION & VERIFICATION */}
              <tr className="bg-slate-50/80 font-semibold">
                <td colSpan={comparisonSchools.length + 1} className="py-2 px-4 text-[11px] uppercase tracking-wider text-slate-700 sticky left-0 z-10 bg-slate-50">
                  Admissions Status & Source
                </td>
              </tr>

              <tr>
                <td className="p-3.5 px-4 font-semibold text-slate-700 sticky left-0 bg-white z-10 border-r border-slate-200">2026-27 Cycle</td>
                {comparisonSchools.map((s) => (
                  <td key={s.id} className="p-3.5 px-4 border-l border-slate-100">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                      s.admissionStatus.includes('Open') ? 'bg-teal-100 text-teal-800' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {s.admissionStatus}
                    </span>
                  </td>
                ))}
              </tr>

              {/* Bottom Action links */}
              <tr className="bg-slate-50/50">
                <td className="p-4 px-4 font-semibold text-slate-700 sticky left-0 bg-slate-50 z-10 border-r border-slate-200">Next Action</td>
                {comparisonSchools.map((s) => (
                  <td key={s.id} className="p-4 px-4 border-l border-slate-100">
                    <Link
                      to={`/school/${s.slug}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700 hover:text-teal-800"
                    >
                      <span>View Profile</span>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-lg rounded-2xl border border-slate-200 shadow-xl overflow-hidden p-5 sm:p-6 space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
              <h3 className="font-bold text-slate-900 text-base">Add School to Comparison</h3>
              <button
                type="button"
                onClick={() => setShowAddPicker(false)}
                className="min-h-[44px] min-w-[44px] p-2 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-2 pr-1 flex-1">
              {availableToAdd.map((school) => (
                <div
                  key={school.id}
                  className="p-3 rounded-lg border border-slate-200 flex items-center justify-between hover:bg-slate-50 transition-colors gap-2"
                >
                  <div className="min-w-0 pr-2">
                    <h4 className="text-xs font-bold text-slate-900 truncate">{school.name}</h4>
                    <p className="text-[11px] text-slate-600 truncate">
                      {school.area} · {school.curriculum.join(', ')} · ₹{(school.annualFeeMin / 100000).toFixed(1)}L/yr
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      toggleComparison(school.id);
                      setShowAddPicker(false);
                    }}
                    className="min-h-[38px] px-3.5 py-1.5 bg-teal-600 text-white rounded-lg text-xs font-semibold hover:bg-teal-700 shrink-0 cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

