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
  CalendarCheck,
  Baby,
  Heart,
  Clock,
  ShieldCheck,
  Bus,
  Check
} from 'lucide-react';
import { useComparison } from '../context/ComparisonContext';
import { useSearch } from '../context/SearchContext';
import { CHENNAI_SCHOOLS } from '../data/schools';
import { School } from '../types/school';
import { getCurriculumColor, getMatchScoreStyle, getPedagogyColor } from '../utils/categoryColors';
import { VerificationBadge } from '../components/common/VerificationBadge';

export const ComparePage: React.FC = () => {
  const { comparisonSchools, removeFromComparison, toggleComparison, maxComparisonLimit, isDemoMode, loadDemoComparison, clearComparison } = useComparison();
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

  const formatFee = (amount?: number) => {
    if (typeof amount !== 'number' || isNaN(amount)) return '₹—';
    return `₹${(amount / 100000).toFixed(1)}L`;
  };

  const hasEarlyYears = comparisonSchools.some(
    (s) => s.institutionType === 'preschool' || s.institutionType === 'combined'
  );
  const allEarlyYears = comparisonSchools.length > 0 && comparisonSchools.every(
    (s) => s.institutionType === 'preschool'
  );

  if (comparisonSchools.length === 0) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] py-16 sm:py-24 px-4 text-center">
        <div className="max-w-md mx-auto bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-800 flex items-center justify-center mx-auto border border-teal-200">
            <Scale className="w-6 h-6" />
          </div>
          <h2 className="font-editorial text-2xl font-bold text-stone-900">
            No Institutions in Comparison
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-sans">
            Select 2 to 4 schools or preschools from your search results to compare fees, learning approaches, facilities, and commute distances side-by-side.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              to="/results"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#0D9488] hover:bg-[#115E59] text-white rounded-xl text-xs font-bold transition-colors min-h-[44px]"
            >
              <span>Explore Matching Institutions</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <button
              type="button"
              onClick={loadDemoComparison}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#F5F1E8] hover:bg-stone-200 text-stone-800 border border-stone-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer min-h-[44px]"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Try Sample Comparison (Demo)</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Active pair for mobile side-by-side view
  const schoolA = comparisonSchools[mobilePair[0]] || comparisonSchools[0] || {} as School;
  const schoolB = comparisonSchools[mobilePair[1]] || comparisonSchools[Math.min(1, comparisonSchools.length - 1)] || comparisonSchools[0] || {} as School;

  return (
    <div className="min-h-screen bg-[#FAF9F6] pb-24 text-stone-900">
      
      {/* Demo Mode Notice */}
      {isDemoMode && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-xs text-amber-950 font-sans">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Demo State:</strong> Showing 2 sample institutions for demonstration. These are not your saved institutions.
              </span>
            </div>
            <button
              type="button"
              onClick={clearComparison}
              className="font-bold underline hover:no-underline text-amber-900 cursor-pointer shrink-0"
            >
              Clear Demo Data
            </button>
          </div>
        </div>
      )}
      
      {/* Page Header */}
      <section className="bg-white border-b border-stone-200/90 py-5 sm:py-7 px-3.5 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-teal-700" />
              <h1 className="font-editorial text-xl sm:text-2xl font-bold text-stone-900 tracking-tight leading-snug">
                Compare Shortlisted Institutions
              </h1>
            </div>
            <p className="text-xs text-stone-600 mt-1 font-sans">
              Comparing {comparisonSchools.length} of {maxComparisonLimit} allowed institutions side-by-side against your family priorities.
              {hasEarlyYears && <span className="text-amber-800 font-semibold ml-1">· Includes Early Years criteria</span>}
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Highlight Differences toggle */}
            <label className="inline-flex items-center gap-2 text-xs font-semibold text-stone-700 cursor-pointer select-none py-1">
              <input
                type="checkbox"
                checked={highlightDifferencesOnly}
                onChange={(e) => setHighlightDifferencesOnly(e.target.checked)}
                className="rounded border-stone-300 text-teal-700 focus:ring-teal-500 w-4 h-4 cursor-pointer"
              />
              <span>Highlight differences</span>
            </label>

            {comparisonSchools.length < maxComparisonLimit && (
              <button
                type="button"
                onClick={() => setShowAddPicker(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Another ({comparisonSchools.length}/{maxComparisonLimit})</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* MOBILE COMPARISON MATRIX (block md:hidden) */}
      <div className="block md:hidden px-3.5 pt-4 space-y-4">
        
        {/* Mobile View Style Switcher */}
        {comparisonSchools.length >= 2 && (
          <div className="flex p-1 bg-stone-200/60 rounded-xl text-xs font-bold">
            <button
              type="button"
              onClick={() => setMobileViewStyle('cards')}
              className={`flex-1 py-1.5 text-center rounded-lg transition-all ${
                mobileViewStyle === 'cards' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-600'
              }`}
            >
              Metric Cards
            </button>
            <button
              type="button"
              onClick={() => setMobileViewStyle('side-by-side')}
              className={`flex-1 py-1.5 text-center rounded-lg transition-all flex items-center justify-center gap-1 ${
                mobileViewStyle === 'side-by-side' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-600'
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
            const isEarly = school.institutionType === 'preschool';
            const bColor = isEarly
              ? { badge: 'bg-amber-50 text-amber-900 border-amber-300' }
              : getCurriculumColor(school.curriculum?.[0]);

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
                  <div className="flex items-center gap-1.5 flex-wrap mb-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border inline-block ${bColor.badge}`}>
                      {school.matchScore}% Fit
                    </span>
                    <VerificationBadge
                      status={school.dataStatus || 'demo'}
                      lastVerifiedAt={school.lastVerifiedAt}
                      verificationSources={school.verificationSources}
                      size="sm"
                    />
                  </div>
                  <h3 className="font-editorial text-xs font-bold text-stone-900 line-clamp-2 leading-snug">
                    {school.name}
                  </h3>
                  <p className="text-[11px] text-stone-500 mt-0.5 truncate">{school.area}</p>
                  {isEarly && (
                    <span className="text-[10px] font-semibold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded inline-block mt-1">
                      Preschool
                    </span>
                  )}
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
                <strong>Your Benchmark:</strong> Max ₹{(((filters?.budgetMax || 150000)) / 100000).toFixed(1)}L/yr, Commute ≤ {filters?.radiusKm || 12} km
              </span>
            </div>

            {/* Money & Commute Card */}
            <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-2xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                <span className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                  <IndianRupee className="w-3.5 h-3.5 text-amber-600" />
                  <span>Fees & Commute</span>
                </span>
                <span className="text-[11px] text-stone-500 font-medium">Budget: ₹{(((filters?.budgetMax || 150000)) / 100000).toFixed(1)}L</span>
              </div>
              <div className="space-y-2.5">
                {comparisonSchools.map((s) => {
                  const fits = s.annualFeeMin <= (filters?.budgetMax || 150000);
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

            {/* Learning & Pedagogy Card */}
            <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-2xs space-y-3">
              <div className="pb-2 border-b border-stone-100">
                <span className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                  <span>Learning Approach & Structure</span>
                </span>
              </div>
              <div className="space-y-2.5">
                {comparisonSchools.map((s) => {
                  const isEarly = s.institutionType === 'preschool';
                  return (
                    <div key={s.id} className="p-2.5 rounded-xl bg-[#FAF9F6] border border-stone-200/70 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-stone-900 truncate">{s.name}</span>
                        <span className="text-[10px] text-stone-500 uppercase">{s.institutionType || 'School'}</span>
                      </div>
                      <div className="text-stone-700 text-[11px] space-y-0.5">
                        {isEarly ? (
                          <>
                            <div>Pedagogy: <strong className="text-stone-900">{s.pedagogy?.join(' · ') || 'Play-way'}</strong></div>
                            <div>Programs: <strong className="text-stone-900">{s.preschoolPrograms?.map((p) => String(p).toUpperCase()).join(', ') || 'Playgroup to UKG'}</strong></div>
                            <div>Care Ratio: <strong className="text-stone-900">{s.childToCaregiverRatio || '1:8'}</strong></div>
                          </>
                        ) : (
                          <>
                            <div>Board: <strong className="text-stone-900">{s.curriculum?.join(', ') || 'Independent'}</strong></div>
                            <div>Grades: <strong className="text-stone-900">{s.grades}</strong></div>
                            <div>Ratio: <strong className="text-stone-900 tabular-nums">{s.studentTeacherRatio}</strong></div>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Early Years Logistics (if any preschool present) */}
            {hasEarlyYears && (
              <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-2xs space-y-3">
                <div className="pb-2 border-b border-stone-100">
                  <span className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Baby className="w-3.5 h-3.5 text-amber-600" />
                    <span>Early Childhood Care & Timings</span>
                  </span>
                </div>
                <div className="space-y-2.5">
                  {comparisonSchools.map((s) => (
                    <div key={s.id} className="p-2.5 rounded-xl bg-[#FAF9F6] border border-stone-200/70 text-xs space-y-1">
                      <span className="font-bold text-stone-900 block truncate">{s.name}</span>
                      <div className="grid grid-cols-2 gap-1 text-[11px] text-stone-700">
                        <span>Daycare: <strong className="text-stone-900">{s.daycare ? '✓ Available' : 'Half-day'}</strong></span>
                        <span>Outdoor Play: <strong className="text-stone-900">{s.outdoorPlay ? '✓ Yes' : 'Indoor'}</strong></span>
                        <span>Hot Meals: <strong className="text-stone-900">{s.meals ? '✓ Kitchen' : 'Home Tiffin'}</strong></span>
                        <span>CCTV: <strong className="text-stone-900">{s.cctvSecurity ? '✓ App Access' : 'Internal'}</strong></span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Facilities & Fleet Card */}
            <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-2xs space-y-3">
              <div className="pb-2 border-b border-stone-100">
                <span className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-violet-600" />
                  <span>Facilities & Transport</span>
                </span>
              </div>
              <div className="space-y-2.5">
                {comparisonSchools.map((s) => {
                  const hasPool = (s.facilities || []).some((f) => f.name?.toLowerCase().includes('swimming'));
                  const hasRobotics = (s.facilities || []).some((f) => f.name?.toLowerCase().includes('robotics'));
                  return (
                    <div key={s.id} className="p-2.5 rounded-xl bg-[#FAF9F6] border border-stone-200/70 text-xs space-y-1.5">
                      <span className="font-bold text-stone-900 block truncate">{s.name}</span>
                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <span className={`inline-flex items-center gap-1 ${hasPool ? 'text-teal-800 font-bold' : 'text-stone-500'}`}>
                          {hasPool ? '✓ Swimming Pool' : s.institutionType === 'preschool' ? 'Splash / Sensory Play' : '✕ No Pool'}
                        </span>
                        <span className={`inline-flex items-center gap-1 ${hasRobotics ? 'text-violet-800 font-bold' : 'text-stone-500'}`}>
                          {hasRobotics ? '✓ STEM / Robotics' : s.institutionType === 'preschool' ? 'Early STEM' : 'Standard Labs'}
                        </span>
                      </div>
                      <div className="text-[11px] text-stone-600">
                        Transport: Up to {s.transportRadiusKm} km radius
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
                <span className="font-bold text-stone-700 block">Select institutions to compare:</span>
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
                  <span className="text-[10px] text-stone-500 uppercase">{schoolA.institutionType || 'School'}</span>
                </div>
                <div className="px-1">
                  <span className="text-[10px] text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded font-bold">
                    {schoolB.matchScore}% Fit
                  </span>
                  <h4 className="font-editorial font-bold text-xs text-stone-900 mt-1 line-clamp-1">{schoolB.name}</h4>
                  <span className="text-[10px] text-stone-500 uppercase">{schoolB.institutionType || 'School'}</span>
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

              {/* Learning / Pedagogy / Board */}
              <div className="p-3">
                <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block text-center mb-1">
                  Learning Approach / Board
                </span>
                <div className="grid grid-cols-2 divide-x divide-stone-100 text-center font-semibold text-stone-800">
                  <div className="px-1 text-[11px]">
                    {schoolA.pedagogy?.join(', ') || schoolA.curriculum?.join(', ') || 'Early Years'}
                  </div>
                  <div className="px-1 text-[11px]">
                    {schoolB.pedagogy?.join(', ') || schoolB.curriculum?.join(', ') || 'Early Years'}
                  </div>
                </div>
              </div>

              {/* Ratio */}
              <div className="p-3">
                <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block text-center mb-1">
                  Caregiver / Teacher Ratio
                </span>
                <div className="grid grid-cols-2 divide-x divide-stone-100 text-center font-bold text-stone-900">
                  <div>{schoolA.childToCaregiverRatio || schoolA.studentTeacherRatio}</div>
                  <div>{schoolB.childToCaregiverRatio || schoolB.studentTeacherRatio}</div>
                </div>
              </div>

              {/* Daycare / Working Parent Support */}
              <div className="p-3">
                <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block text-center mb-1">
                  Daycare & Extended Care
                </span>
                <div className="grid grid-cols-2 divide-x divide-stone-100 text-center font-semibold text-stone-800">
                  <div>{schoolA.daycare ? '✓ Available' : 'Half-day'}</div>
                  <div>{schoolB.daycare ? '✓ Available' : 'Half-day'}</div>
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
                  const isEarly = school.institutionType === 'preschool';
                  const bColor = isEarly
                    ? { badge: 'bg-amber-50 text-amber-900 border-amber-300' }
                    : getCurriculumColor(school.curriculum?.[0]);

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
                          <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border inline-block ${bColor.badge}`}>
                              {school.matchScore}% Match
                            </span>
                            <VerificationBadge
                              status={school.dataStatus || 'demo'}
                              lastVerifiedAt={school.lastVerifiedAt}
                              verificationSources={school.verificationSources}
                              size="sm"
                            />
                          </div>
                          <h3 className="font-editorial text-sm font-bold text-stone-900 leading-snug line-clamp-2">
                            <Link to={`/school/${school.slug}`} className="hover:text-teal-800">
                              {school.name}
                            </Link>
                          </h3>
                          <p className="text-[11px] text-stone-500 mt-0.5 font-sans">
                            {school.area}
                          </p>
                          <span className="text-[10px] font-semibold text-stone-600 bg-stone-100 px-2 py-0.5 rounded inline-block mt-1 uppercase">
                            {school.institutionType === 'combined' ? 'Preschool + K–12' : school.institutionType === 'preschool' ? 'Early Years Center' : 'K–12 School'}
                          </span>
                        </div>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody className="divide-y divide-stone-100 font-sans">
              
              {/* SECTION: ACADEMICS & PEDAGOGY 📚 */}
              <tr className="bg-blue-50/50 font-bold">
                <td colSpan={comparisonSchools.length + 1} className="py-2.5 px-5 text-xs text-blue-900 sticky left-0 z-10 bg-blue-50/80 border-r border-blue-100">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">📚</span>
                    <span className="uppercase tracking-wider">Learning Philosophy & Stages</span>
                  </div>
                </td>
              </tr>

              <tr>
                <td className="p-3.5 px-5 font-bold text-stone-700 sticky left-0 bg-white z-10 border-r border-stone-200">
                  Learning Pedagogy / Approach
                </td>
                {comparisonSchools.map((s) => (
                  <td key={s.id} className="p-3.5 px-5 border-l border-stone-100 font-bold text-stone-900">
                    {s.pedagogy && s.pedagogy.length > 0 ? (
                      <span className="text-teal-900 bg-teal-50 px-2 py-0.5 rounded border border-teal-200 inline-block font-semibold">
                        {s.pedagogy.join(', ')}
                      </span>
                    ) : (
                      <span>Experiential Academic</span>
                    )}
                  </td>
                ))}
              </tr>

              <tr>
                <td className="p-3.5 px-5 font-bold text-stone-700 sticky left-0 bg-white z-10 border-r border-stone-200">
                  Offered Stages & Grades
                </td>
                {comparisonSchools.map((s) => (
                  <td key={s.id} className="p-3.5 px-5 border-l border-stone-100 text-stone-800">
                    {s.institutionType === 'preschool' ? (
                      <div>
                        <span className="font-bold text-amber-900 block">
                          Ages {s.ageRange?.min ?? 2}–{s.ageRange?.max ?? 6} yrs
                        </span>
                        <span className="text-[11px] text-stone-600">
                          {s.preschoolPrograms?.map((p) => String(p).toUpperCase()).join(' · ') || 'Preschool Programs'}
                        </span>
                      </div>
                    ) : s.institutionType === 'combined' ? (
                      <div>
                        <span className="font-bold text-stone-900 block">{s.grades}</span>
                        <span className="text-[11px] text-teal-800 font-semibold">Includes Early Years wing</span>
                      </div>
                    ) : (
                      <span className="font-bold text-stone-900">{s.grades}</span>
                    )}
                  </td>
                ))}
              </tr>

              <tr>
                <td className="p-3.5 px-5 font-bold text-stone-700 sticky left-0 bg-white z-10 border-r border-stone-200">
                  Affiliated Board / Structure
                </td>
                {comparisonSchools.map((s) => (
                  <td key={s.id} className="p-3.5 px-5 border-l border-stone-100 font-semibold text-stone-900">
                    {s.institutionType === 'preschool' ? (
                      <span className="text-stone-500 italic">Early Childhood Foundation (No Board Required)</span>
                    ) : (
                      s.curriculum?.join(', ') || 'Independent'
                    )}
                  </td>
                ))}
              </tr>

              <tr>
                <td className="p-3.5 px-5 font-bold text-stone-700 sticky left-0 bg-white z-10 border-r border-stone-200">
                  Caregiver / Teacher Ratio
                </td>
                {comparisonSchools.map((s) => (
                  <td key={s.id} className="p-3.5 px-5 border-l border-stone-100 tabular-nums font-bold text-stone-900">
                    {s.childToCaregiverRatio || s.studentTeacherRatio}
                  </td>
                ))}
              </tr>

              {/* SECTION: EARLY CHILDHOOD CARE & LOGISTICS (Shown when preschool or combined present) */}
              {hasEarlyYears && (
                <>
                  <tr className="bg-amber-50/50 font-bold">
                    <td colSpan={comparisonSchools.length + 1} className="py-2.5 px-5 text-xs text-amber-950 sticky left-0 z-10 bg-amber-50/80 border-r border-amber-100">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">🧸</span>
                        <span className="uppercase tracking-wider">Early Childhood Care & Daily Logistics</span>
                      </div>
                    </td>
                  </tr>

                  <tr>
                    <td className="p-3.5 px-5 font-bold text-stone-700 sticky left-0 bg-white z-10 border-r border-stone-200">
                      Daycare & Extended Hours
                    </td>
                    {comparisonSchools.map((s) => (
                      <td key={s.id} className="p-3.5 px-5 border-l border-stone-100">
                        {s.daycare ? (
                          <span className="inline-flex items-center gap-1.5 text-teal-800 font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                            <span>{s.extendedHours ? 'Extended Daycare (to 6:00 PM)' : 'Afternoon Daycare'}</span>
                          </span>
                        ) : (
                          <span className="text-stone-500">Half-Day Only</span>
                        )}
                      </td>
                    ))}
                  </tr>

                  <tr>
                    <td className="p-3.5 px-5 font-bold text-stone-700 sticky left-0 bg-white z-10 border-r border-stone-200">
                      Standard Timings
                    </td>
                    {comparisonSchools.map((s) => (
                      <td key={s.id} className="p-3.5 px-5 border-l border-stone-100 text-stone-800 font-medium">
                        {s.timings || '8:30 AM – 2:30 PM'}
                      </td>
                    ))}
                  </tr>

                  <tr>
                    <td className="p-3.5 px-5 font-bold text-stone-700 sticky left-0 bg-white z-10 border-r border-stone-200">
                      Outdoor Nature & Play Yard
                    </td>
                    {comparisonSchools.map((s) => (
                      <td key={s.id} className="p-3.5 px-5 border-l border-stone-100">
                        {s.outdoorPlay ? (
                          <span className="inline-flex items-center gap-1.5 text-emerald-800 font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Dedicated Sand / Mud Play Yard</span>
                          </span>
                        ) : (
                          <span className="text-stone-500">Indoor Activity Area</span>
                        )}
                      </td>
                    ))}
                  </tr>

                  <tr>
                    <td className="p-3.5 px-5 font-bold text-stone-700 sticky left-0 bg-white z-10 border-r border-stone-200">
                      Hot Meals & Nutrition
                    </td>
                    {comparisonSchools.map((s) => (
                      <td key={s.id} className="p-3.5 px-5 border-l border-stone-100">
                        {s.meals ? (
                          <span className="inline-flex items-center gap-1.5 text-teal-800 font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                            <span>Nutritious Kitchen Meals Included</span>
                          </span>
                        ) : (
                          <span className="text-stone-500">Home-packed Snack/Tiffin</span>
                        )}
                      </td>
                    ))}
                  </tr>

                  <tr>
                    <td className="p-3.5 px-5 font-bold text-stone-700 sticky left-0 bg-white z-10 border-r border-stone-200">
                      CCTV & Security
                    </td>
                    {comparisonSchools.map((s) => (
                      <td key={s.id} className="p-3.5 px-5 border-l border-stone-100">
                        {s.cctvSecurity ? (
                          <span className="inline-flex items-center gap-1.5 text-teal-800 font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                            <span>Parent Mobile App CCTV Access</span>
                          </span>
                        ) : (
                          <span className="text-stone-500">Internal Security Monitoring</span>
                        )}
                      </td>
                    ))}
                  </tr>
                </>
              )}

              {/* SECTION: MONEY & LOCATION ₹ */}
              <tr className="bg-amber-50/50 font-bold">
                <td colSpan={comparisonSchools.length + 1} className="py-2.5 px-5 text-xs text-amber-900 sticky left-0 z-10 bg-amber-50/80 border-r border-amber-100">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">₹</span>
                    <span className="uppercase tracking-wider">Fees & Commute Realities</span>
                  </div>
                </td>
              </tr>

              {/* Annual Tuition Row */}
              <tr className={highlightDifferencesOnly ? 'bg-amber-50/30' : ''}>
                <td className="p-3.5 px-5 font-bold text-stone-700 sticky left-0 bg-white z-10 border-r border-stone-200">
                  Annual Tuition Range
                </td>
                {comparisonSchools.map((s) => {
                  const fitsBudget = s.annualFeeMin <= (filters?.budgetMax || 150000);
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
                <td className="p-3.5 px-5 font-bold text-stone-700 sticky left-0 bg-white z-10 border-r border-stone-200">
                  Commute from Search Hub
                </td>
                {comparisonSchools.map((s) => {
                  const targetRadius = filters?.radiusKm || 12;
                  const fitsRadius = s.distanceKm <= targetRadius;
                  return (
                    <td key={s.id} className="p-3.5 px-5 border-l border-stone-100">
                      <span className="font-bold text-stone-900 tabular-nums">{s.distanceKm} km</span>
                      <span className={`block text-[11px] mt-0.5 font-medium ${fitsRadius ? 'text-teal-800' : 'text-stone-500'}`}>
                        {fitsRadius ? '✓ Within target radius' : `+${(s.distanceKm - targetRadius).toFixed(1)} km outside`}
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
                    <span className="uppercase tracking-wider">Campus Facilities & Van Fleet</span>
                  </div>
                </td>
              </tr>

              {/* Swimming Pool Check */}
              <tr>
                <td className="p-3.5 px-5 font-bold text-stone-700 sticky left-0 bg-white z-10 border-r border-stone-200">
                  Swimming / Water Play
                </td>
                {comparisonSchools.map((s) => {
                  const hasPool = (s.facilities || []).some((f) => f.name?.toLowerCase().includes('swimming'));
                  const isEarly = s.institutionType === 'preschool';
                  return (
                    <td key={s.id} className="p-3.5 px-5 border-l border-stone-100">
                      {hasPool ? (
                        <span className="inline-flex items-center gap-1.5 text-sky-800 font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" />
                          <span>On-Campus Pool</span>
                        </span>
                      ) : isEarly ? (
                        <span className="text-stone-700 font-medium">Splash Pool / Sensory Troughs</span>
                      ) : (
                        <span className="text-stone-500">None / Off-site</span>
                      )}
                    </td>
                  );
                })}
              </tr>

              {/* Robotics & STEM */}
              <tr>
                <td className="p-3.5 px-5 font-bold text-stone-700 sticky left-0 bg-white z-10 border-r border-stone-200">
                  Robotics & Early STEM
                </td>
                {comparisonSchools.map((s) => {
                  const hasRobotics = (s.facilities || []).some((f) => f.name?.toLowerCase().includes('robotics'));
                  const isEarly = s.institutionType === 'preschool';
                  return (
                    <td key={s.id} className="p-3.5 px-5 border-l border-stone-100">
                      {hasRobotics ? (
                        <span className="inline-flex items-center gap-1.5 text-violet-800 font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5 text-violet-600" />
                          <span>Active STEM Lab</span>
                        </span>
                      ) : isEarly ? (
                        <span className="text-stone-700 font-medium">Early Sensorial STEM Materials</span>
                      ) : (
                        <span className="text-stone-500">Standard Labs</span>
                      )}
                    </td>
                  );
                })}
              </tr>

              {/* Transport Fleet */}
              <tr>
                <td className="p-3.5 px-5 font-bold text-stone-700 sticky left-0 bg-white z-10 border-r border-stone-200">
                  Transport Fleet (GPS)
                </td>
                {comparisonSchools.map((s) => (
                  <td key={s.id} className="p-3.5 px-5 border-l border-stone-100">
                    <span className="font-semibold text-stone-900">Up to {s.transportRadiusKm} km</span>
                    <span className="block text-[11px] text-stone-500">
                      {s.institutionType === 'preschool' ? 'Air-conditioned GPS Vans' : 'School Bus Fleet Available'}
                    </span>
                  </td>
                ))}
              </tr>

              {/* SECTION: ADMISSIONS & VERIFICATION → */}
              <tr className="bg-emerald-50/50 font-bold">
                <td colSpan={comparisonSchools.length + 1} className="py-2.5 px-5 text-xs text-emerald-900 sticky left-0 z-10 bg-emerald-50/80 border-r border-emerald-100">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">→</span>
                    <span className="uppercase tracking-wider">Admissions Status & Family Checkpoints</span>
                  </div>
                </td>
              </tr>

              <tr>
                <td className="p-3.5 px-5 font-bold text-stone-700 sticky left-0 bg-white z-10 border-r border-stone-200">
                  Data Provenance
                </td>
                {comparisonSchools.map((s) => (
                  <td key={s.id} className="p-3.5 px-5 border-l border-stone-100">
                    <VerificationBadge
                      status={s.dataStatus || 'demo'}
                      lastVerifiedAt={s.lastVerifiedAt}
                      verificationSources={s.verificationSources}
                      size="sm"
                    />
                    <span className="block text-[10px] text-stone-500 mt-1 font-sans">
                      {s.feeSource || 'Prototype demonstration profile'}
                    </span>
                  </td>
                ))}
              </tr>

              <tr>
                <td className="p-3.5 px-5 font-bold text-stone-700 sticky left-0 bg-white z-10 border-r border-stone-200">
                  2026-27 Cycle
                </td>
                {comparisonSchools.map((s) => (
                  <td key={s.id} className="p-3.5 px-5 border-l border-stone-100">
                    <span className={`px-2.5 py-0.5 rounded text-[11px] font-bold ${
                      s.admissionStatus?.includes('Open') ? 'bg-emerald-100 text-emerald-900' : 'bg-stone-100 text-stone-700'
                    }`}>
                      {s.admissionStatus || 'Admissions Enquire'}
                    </span>
                  </td>
                ))}
              </tr>

              <tr>
                <td className="p-3.5 px-5 font-bold text-stone-700 sticky left-0 bg-white z-10 border-r border-stone-200">
                  Things to Verify
                </td>
                {comparisonSchools.map((s) => (
                  <td key={s.id} className="p-3.5 px-5 border-l border-stone-100 text-[11px] text-stone-600 leading-snug">
                    {s.institutionType === 'preschool'
                      ? 'Confirm whether daycare pickup fits your work schedule and check child-to-caregiver ratio for your specific age group.'
                      : 'Verify transport route timings and confirm seat availability for your child\'s exact entry grade.'}
                  </td>
                ))}
              </tr>

              {/* Bottom Action links */}
              <tr className="bg-[#FAF9F6]">
                <td className="p-4 px-5 font-bold text-stone-700 sticky left-0 bg-[#FAF9F6] z-10 border-r border-stone-200">
                  Next Action
                </td>
                {comparisonSchools.map((s) => (
                  <td key={s.id} className="p-4 px-5 border-l border-stone-100">
                    <Link
                      to={`/school/${s.slug}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#0D9488] hover:text-[#115E59]"
                    >
                      <span>View Full Profile</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Add School Modal */}
      {showAddPicker && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-stone-200 max-w-lg w-full max-h-[85vh] flex flex-col shadow-xl">
            <div className="p-5 border-b border-stone-100 flex items-center justify-between">
              <h3 className="font-editorial text-lg font-bold text-stone-900">
                Add Institution to Comparison
              </h3>
              <button
                type="button"
                onClick={() => setShowAddPicker(false)}
                className="p-1.5 text-stone-400 hover:text-stone-800 rounded-full hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto divide-y divide-stone-100 space-y-2 flex-1">
              {availableToAdd.map((s) => (
                <div key={s.id} className="pt-2 pb-2 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-editorial text-xs font-bold text-stone-900 truncate">
                        {s.name}
                      </h4>
                      {s.institutionType === 'preschool' && (
                        <span className="text-[10px] bg-amber-50 text-amber-900 font-semibold px-1.5 py-0.5 rounded">
                          Preschool
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-stone-500">
                      {s.area} · {formatFee(s.annualFeeMin)}/yr
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      toggleComparison(s.id);
                      setShowAddPicker(false);
                    }}
                    className="px-3 py-1.5 bg-[#0D9488] hover:bg-[#115E59] text-white text-xs font-bold rounded-xl shrink-0 cursor-pointer"
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
