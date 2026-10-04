import React, { useState, useMemo } from 'react';
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
  Check,
  MessageSquare,
  School as SchoolIcon,
  Trophy
} from 'lucide-react';
import { useComparison } from '../context/ComparisonContext';
import { useSearch } from '../context/SearchContext';
import { CHENNAI_SCHOOLS } from '../data/schools';
import { School } from '../types/school';
import { getCurriculumColor, getMatchScoreStyle, getPedagogyColor } from '../utils/categoryColors';
import { VerificationBadge } from '../components/common/VerificationBadge';

export const ComparePage: React.FC = () => {
  const {
    comparisonSchools,
    removeFromComparison,
    toggleComparison,
    maxComparisonLimit,
    isDemoMode,
    loadDemoComparison,
    clearComparison,
  } = useComparison();
  const { searchState } = useSearch();
  const { filters } = searchState;

  const [highlightDifferencesOnly, setHighlightDifferencesOnly] = useState(false);
  const [showAddPicker, setShowAddPicker] = useState(false);

  // Mobile side-by-side selected pair (indexes into comparisonSchools)
  const [mobilePair, setMobilePair] = useState<[number, number]>([
    0,
    Math.min(1, comparisonSchools.length - 1),
  ]);
  const [mobileViewStyle, setMobileViewStyle] = useState<'table' | 'cards' | 'side-by-side'>('table');

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
  const allEarlyYears =
    comparisonSchools.length > 0 &&
    comparisonSchools.every((s) => s.institutionType === 'preschool');

  // Difference detection helper
  const isDiff = (getter: (s: School) => any): boolean => {
    if (comparisonSchools.length <= 1) return false;
    const first = JSON.stringify(getter(comparisonSchools[0]));
    return comparisonSchools.some((s) => JSON.stringify(getter(s)) !== first);
  };

  // Neutral status helper
  const getNeutralSports = (s: School): string => {
    const hasSports =
      (s.facilities || []).some(
        (f) =>
          f.category?.toLowerCase().includes('sports') ||
          f.name?.toLowerCase().includes('pool') ||
          f.name?.toLowerCase().includes('ground') ||
          f.name?.toLowerCase().includes('court')
      ) || s.outdoorPlay;
    return hasSports ? 'Available' : 'Not available';
  };

  // Dynamic neutral questions generated based on actual differences
  const generatedQuestions = useMemo(() => {
    if (comparisonSchools.length === 0) return [];
    const questions: string[] = [];

    // 1. Fee difference
    const feeDiffers = isDiff((s) => s.annualFeeMin);
    if (feeDiffers) {
      questions.push(
        'Is the listed fee inclusive of all mandatory charges, such as activity kits, uniforms, and admission deposits?'
      );
    }

    // 2. Daycare / Timings difference
    const daycareDiffers = isDiff((s) => s.daycare) || isDiff((s) => s.extendedHours);
    const timingDiffers = isDiff((s) => s.timings);
    if (daycareDiffers || timingDiffers || comparisonSchools.some((s) => s.daycare)) {
      questions.push(
        'Does daycare operate until the time you need, and what are the arrangements for late afternoon pickups?'
      );
    }

    // 3. Transport difference
    const transportDiffers = isDiff((s) => s.hasTransport) || isDiff((s) => s.transportRadiusKm);
    if (transportDiffers || comparisonSchools.some((s) => s.hasTransport)) {
      questions.push(
        'Are transport routes available from your specific residential sector, and are female attendants assigned to each bus/van?'
      );
    }

    // 4. Learning approach / Board difference
    const approachDiffers =
      isDiff((s) => s.curriculum?.join(',')) || isDiff((s) => s.pedagogy?.join(','));
    if (approachDiffers) {
      questions.push(
        'How does the institution adapt its learning approach to each child’s individual developmental pace?'
      );
    }

    // 5. Ratio difference
    const ratioDiffers = isDiff((s) => s.childToCaregiverRatio || s.studentTeacherRatio);
    if (ratioDiffers) {
      questions.push(
        'What is the exact student-to-teacher or child-to-caregiver ratio in the specific cohort your child will enter?'
      );
    }

    // Fallbacks if fewer than 3 questions
    if (questions.length < 3) {
      questions.push(
        'What is the school’s policy on transition days or orientation sessions for new students?'
      );
    }
    if (questions.length < 3) {
      questions.push(
        'What additional extracurricular or after-school activities are included versus charged separately?'
      );
    }

    return questions.slice(0, 5);
  }, [comparisonSchools]);

  // Diff Badge component
  const DiffBadge: React.FC<{ different: boolean }> = ({ different }) => {
    if (!different) {
      return <span className="text-[10px] text-stone-400 font-medium">Same</span>;
    }
    return (
      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200 inline-block">
        Different
      </span>
    );
  };

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
            Select 2 to 4 schools or preschools from your search results to compare fees, learning
            approaches, facilities, and commute distances side-by-side.
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
  const schoolA =
    comparisonSchools[mobilePair[0]] || comparisonSchools[0] || ({} as School);
  const schoolB =
    comparisonSchools[mobilePair[1]] ||
    comparisonSchools[Math.min(1, comparisonSchools.length - 1)] ||
    comparisonSchools[0] ||
    ({} as School);

  return (
    <div className="min-h-screen bg-[#FAF9F6] pb-24 text-stone-900">
      {/* Demo Mode Notice */}
      {isDemoMode && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-xs text-amber-950 font-sans">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Demo State:</strong> Showing 2 sample institutions for demonstration.
                These are not your saved institutions.
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
              Comparing {comparisonSchools.length} of {maxComparisonLimit} allowed institutions
              side-by-side against your family priorities.
              {hasEarlyYears && (
                <span className="text-amber-800 font-semibold ml-1">
                  · Includes Early Years criteria
                </span>
              )}
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
                <span>
                  Add Another ({comparisonSchools.length}/{maxComparisonLimit})
                </span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ========================================================
          "BASED ON YOUR PRIORITIES" SECTION
          At the top of Compare, show user's current priorities and factor differences
          ======================================================== */}
      <section className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 mt-6">
        <div className="bg-white rounded-3xl border border-stone-200/90 p-5 sm:p-7 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-stone-100 gap-2">
            <div>
              <span className="text-[11px] font-bold text-teal-800 uppercase tracking-wider block mb-1">
                Parent-Centred Evaluation
              </span>
              <h3 className="font-editorial text-xl sm:text-2xl font-bold text-stone-900">
                Based on what matters to you
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 font-sans mt-0.5">
                Your stated priorities compared across institutions. Differences are highlighted
                neutrally without declaring a winner.
              </p>
            </div>
            <span className="text-[11px] text-stone-500 font-medium">
              5 Key Priorities Tracked
            </span>
          </div>

          {/* User Priorities Display: Location, Budget, Learning approach, Facilities, Activities */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            <div className="p-3 rounded-2xl bg-[#FAF9F6] border border-stone-200/90 text-xs space-y-0.5">
              <span className="text-[10px] text-stone-500 uppercase font-bold block">
                Location
              </span>
              <span className="font-bold text-stone-900 block truncate">
                {filters?.location || 'All Chennai'}
              </span>
              <span className="text-[10px] text-stone-500">
                ≤ {filters?.radiusKm || 12} km commute
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-[#FAF9F6] border border-stone-200/90 text-xs space-y-0.5">
              <span className="text-[10px] text-stone-500 uppercase font-bold block">Budget</span>
              <span className="font-bold text-stone-900 block tabular-nums">
                Up to ₹{((filters?.budgetMax || 150000) / 100000).toFixed(1)}L/yr
              </span>
              <span className="text-[10px] text-stone-500">Annual target</span>
            </div>

            <div className="p-3 rounded-2xl bg-[#FAF9F6] border border-stone-200/90 text-xs space-y-0.5">
              <span className="text-[10px] text-stone-500 uppercase font-bold block">
                Learning approach
              </span>
              <span className="font-bold text-stone-900 block truncate">
                {filters?.preschool?.pedagogy?.length
                  ? filters.preschool.pedagogy.join(', ')
                  : filters?.curriculums?.length
                  ? filters.curriculums.join(', ')
                  : 'All Approaches'}
              </span>
              <span className="text-[10px] text-stone-500">Curriculum / Pedagogy</span>
            </div>

            <div className="p-3 rounded-2xl bg-[#FAF9F6] border border-stone-200/90 text-xs space-y-0.5">
              <span className="text-[10px] text-stone-500 uppercase font-bold block">
                Facilities
              </span>
              <span className="font-bold text-stone-900 block truncate">
                {filters?.requiredFacilities?.length
                  ? filters.requiredFacilities.slice(0, 2).join(', ')
                  : 'Play & Lab Facilities'}
              </span>
              <span className="text-[10px] text-stone-500">Campus amenities</span>
            </div>

            <div className="p-3 rounded-2xl bg-[#FAF9F6] border border-stone-200/90 text-xs space-y-0.5 col-span-2 sm:col-span-1">
              <span className="text-[10px] text-stone-500 uppercase font-bold block">
                Activities
              </span>
              <span className="font-bold text-stone-900 block truncate">
                {filters?.requiredActivities?.length
                  ? filters.requiredActivities.slice(0, 2).join(', ')
                  : 'Sports & Arts'}
              </span>
              <span className="text-[10px] text-stone-500">Extracurriculars</span>
            </div>
          </div>

          {/* Priority Factors Comparison Table highlighting differences */}
          <div className="overflow-x-auto rounded-2xl border border-stone-200">
            <div className="md:hidden py-1.5 px-3 bg-teal-50/70 border-b border-teal-100 text-[11px] text-teal-900 font-semibold flex items-center justify-between">
              <span>Swipe horizontally to compare all</span>
              <span className="text-teal-700">← →</span>
            </div>
            <table className="w-full text-xs text-left min-w-[500px]">
              <thead className="bg-[#FAF9F6] text-stone-700 uppercase tracking-wider font-bold border-b border-stone-200 sticky top-0 z-20">
                <tr>
                  <th className="py-3 px-4 w-44 sticky left-0 bg-[#FAF9F6] z-30 border-r border-stone-200 shadow-[1px_0_0_0_#e7e5e4]">
                    Factor
                  </th>
                  {comparisonSchools.map((s) => (
                    <th key={s.id} className="py-3 px-4 font-bold text-stone-900 min-w-[140px]">
                      <span className="block truncate max-w-[170px]">{s.name}</span>
                    </th>
                  ))}
                  <th className="py-3 px-4 w-28 text-center min-w-[90px]">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-sans">
                {/* Distance */}
                <tr className={isDiff((s) => s.distanceKm) ? 'bg-amber-50/20' : ''}>
                  <td className={`py-3 px-4 font-bold text-stone-700 sticky left-0 z-10 border-r border-stone-200 shadow-[1px_0_0_0_#e7e5e4] ${isDiff((s) => s.distanceKm) ? 'bg-amber-50/95' : 'bg-white'}`}>
                    Distance
                  </td>
                  {comparisonSchools.map((s) => (
                    <td key={s.id} className="py-3 px-4 font-medium text-stone-900 tabular-nums">
                      {s.distanceKm} km
                    </td>
                  ))}
                  <td className="py-3 px-4 text-center">
                    <DiffBadge different={isDiff((s) => s.distanceKm)} />
                  </td>
                </tr>

                {/* Fee */}
                <tr className={isDiff((s) => s.annualFeeMin) ? 'bg-amber-50/20' : ''}>
                  <td className={`py-3 px-4 font-bold text-stone-700 sticky left-0 z-10 border-r border-stone-200 shadow-[1px_0_0_0_#e7e5e4] ${isDiff((s) => s.annualFeeMin) ? 'bg-amber-50/95' : 'bg-white'}`}>
                    Fee
                  </td>
                  {comparisonSchools.map((s) => (
                    <td key={s.id} className="py-3 px-4 font-bold text-stone-900 tabular-nums">
                      {formatFee(s.annualFeeMin)}
                    </td>
                  ))}
                  <td className="py-3 px-4 text-center">
                    <DiffBadge different={isDiff((s) => s.annualFeeMin)} />
                  </td>
                </tr>

                {/* Board / Approach */}
                <tr
                  className={
                    isDiff((s) => s.curriculum?.[0] || s.pedagogy?.[0]) ? 'bg-amber-50/20' : ''
                  }
                >
                  <td className={`py-3 px-4 font-bold text-stone-700 sticky left-0 z-10 border-r border-stone-200 shadow-[1px_0_0_0_#e7e5e4] ${isDiff((s) => s.curriculum?.[0] || s.pedagogy?.[0]) ? 'bg-amber-50/95' : 'bg-white'}`}>
                    Board / Approach
                  </td>
                  {comparisonSchools.map((s) => (
                    <td key={s.id} className="py-3 px-4 text-stone-800">
                      {s.institutionType === 'preschool'
                        ? s.pedagogy?.[0] || 'Montessori'
                        : s.curriculum?.[0] || 'CBSE'}
                    </td>
                  ))}
                  <td className="py-3 px-4 text-center">
                    <DiffBadge
                      different={isDiff((s) => s.curriculum?.[0] || s.pedagogy?.[0])}
                    />
                  </td>
                </tr>

                {/* Sports */}
                <tr className={isDiff((s) => getNeutralSports(s)) ? 'bg-amber-50/20' : ''}>
                  <td className={`py-3 px-4 font-bold text-stone-700 sticky left-0 z-10 border-r border-stone-200 shadow-[1px_0_0_0_#e7e5e4] ${isDiff((s) => getNeutralSports(s)) ? 'bg-amber-50/95' : 'bg-white'}`}>
                    Sports
                  </td>
                  {comparisonSchools.map((s) => (
                    <td key={s.id} className="py-3 px-4 text-stone-800">
                      {getNeutralSports(s)}
                    </td>
                  ))}
                  <td className="py-3 px-4 text-center">
                    <DiffBadge different={isDiff((s) => getNeutralSports(s))} />
                  </td>
                </tr>

                {/* Transport */}
                <tr className={isDiff((s) => s.hasTransport) ? 'bg-amber-50/20' : ''}>
                  <td className={`py-3 px-4 font-bold text-stone-700 sticky left-0 z-10 border-r border-stone-200 shadow-[1px_0_0_0_#e7e5e4] ${isDiff((s) => s.hasTransport) ? 'bg-amber-50/95' : 'bg-white'}`}>
                    Transport
                  </td>
                  {comparisonSchools.map((s) => (
                    <td key={s.id} className="py-3 px-4 text-stone-800">
                      {s.hasTransport ? 'Available' : 'Not available'}
                    </td>
                  ))}
                  <td className="py-3 px-4 text-center">
                    <DiffBadge different={isDiff((s) => s.hasTransport)} />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ========================================================
          MOBILE VIEW (Stacked Cards or Side-by-Side)
          ======================================================== */}
      <div className="block md:hidden px-3.5 pt-6 space-y-4">
        {/* Mobile View Style Switcher */}
        {comparisonSchools.length >= 2 && (
          <div className="flex p-1 bg-stone-200/60 rounded-xl text-xs font-bold gap-1">
            <button
              type="button"
              onClick={() => setMobileViewStyle('table')}
              className={`flex-1 py-2 text-center rounded-lg transition-all min-h-[44px] flex items-center justify-center gap-1 cursor-pointer ${
                mobileViewStyle === 'table' ? 'bg-white text-stone-900 shadow-2xs font-bold' : 'text-stone-600'
              }`}
            >
              <span>Scroll Table</span>
            </button>
            <button
              type="button"
              onClick={() => setMobileViewStyle('cards')}
              className={`flex-1 py-2 text-center rounded-lg transition-all min-h-[44px] flex items-center justify-center gap-1 cursor-pointer ${
                mobileViewStyle === 'cards' ? 'bg-white text-stone-900 shadow-2xs font-bold' : 'text-stone-600'
              }`}
            >
              <span>Metric Cards</span>
            </button>
            <button
              type="button"
              onClick={() => setMobileViewStyle('side-by-side')}
              className={`flex-1 py-2 text-center rounded-lg transition-all min-h-[44px] flex items-center justify-center gap-1 cursor-pointer ${
                mobileViewStyle === 'side-by-side'
                  ? 'bg-white text-stone-900 shadow-2xs font-bold'
                  : 'text-stone-600'
              }`}
            >
              <ArrowLeftRight className="w-3.5 h-3.5 text-teal-700" />
              <span>Dual (2)</span>
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
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border inline-block ${bColor.badge}`}
                    >
                      {school.matchScore}% Match
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
                    <span>View profile</span>
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

        {/* Mobile View Mode A: Metric Cards */}
        {mobileViewStyle === 'cards' && (
          <div className="space-y-4">
            {/* Preschool Factors Card (if early years present) */}
            {hasEarlyYears && (
              <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-2xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                  <span className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Baby className="w-3.5 h-3.5 text-amber-600" />
                    <span>Preschool Comparison (10 Factors)</span>
                  </span>
                  <DiffBadge different={isDiff((s) => s.pedagogy?.[0])} />
                </div>
                <div className="space-y-2.5 text-xs text-stone-700">
                  {comparisonSchools.map((s) => (
                    <div
                      key={s.id}
                      className="p-2.5 rounded-xl bg-[#FAF9F6] border border-stone-200/70 space-y-1.5"
                    >
                      <span className="font-bold text-stone-900 block truncate">{s.name}</span>
                      <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px]">
                        <div>
                          Age: <strong>{s.ageRange ? `${s.ageRange.min}–${s.ageRange.max} yrs` : 'Needs confirmation'}</strong>
                        </div>
                        <div>
                          Approach: <strong>{s.pedagogy?.[0] || 'Activity-based'}</strong>
                        </div>
                        <div>
                          Daycare: <strong>{s.daycare ? 'Available' : 'Not available'}</strong>
                        </div>
                        <div>
                          Outdoor: <strong>{s.outdoorPlay ? 'Available' : 'Not available'}</strong>
                        </div>
                        <div>
                          Meals: <strong>{s.meals ? 'Available' : 'Not available'}</strong>
                        </div>
                        <div>
                          Care Ratio: <strong>{s.childToCaregiverRatio || 'Information not available'}</strong>
                        </div>
                        <div>
                          Timings: <strong>{s.timings || 'Needs confirmation'}</strong>
                        </div>
                        <div>
                          Transport: <strong>{s.hasTransport ? `Available (≤${s.transportRadiusKm} km)` : 'Not available'}</strong>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* School Factors Card */}
            <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-2xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                <span className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                  <SchoolIcon className="w-3.5 h-3.5 text-teal-700" />
                  <span>School Comparison (8 Factors)</span>
                </span>
                <DiffBadge different={isDiff((s) => s.curriculum?.[0])} />
              </div>
              <div className="space-y-2.5 text-xs text-stone-700">
                {comparisonSchools.map((s) => (
                  <div
                    key={s.id}
                    className="p-2.5 rounded-xl bg-[#FAF9F6] border border-stone-200/70 space-y-1.5"
                  >
                    <span className="font-bold text-stone-900 block truncate">{s.name}</span>
                    <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px]">
                      <div>
                        Board: <strong>{s.curriculum?.join(', ') || (s.institutionType === 'preschool' ? 'Information not available' : 'CBSE')}</strong>
                      </div>
                      <div>
                        Grades: <strong>{s.grades || 'Information not available'}</strong>
                      </div>
                      <div>
                        Fee: <strong className="tabular-nums">{formatFee(s.annualFeeMin)}</strong>
                      </div>
                      <div>
                        Distance: <strong>{s.distanceKm} km</strong>
                      </div>
                      <div>
                        Transport: <strong>{s.hasTransport ? `Available (≤${s.transportRadiusKm} km)` : 'Not available'}</strong>
                      </div>
                      <div>
                        Support: <strong>{s.hasSpecialNeedsSupport ? 'Available' : 'Needs confirmation'}</strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Mobile View Mode B: Side-by-Side Dual Column Table */}
        {mobileViewStyle === 'side-by-side' && comparisonSchools.length >= 2 && (
          <div className="space-y-4">
            {comparisonSchools.length > 2 && (
              <div className="p-3 bg-white rounded-2xl border border-stone-200 text-xs space-y-2">
                <span className="font-bold text-stone-700 block">
                  Select pair to view side-by-side:
                </span>
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

            <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-2xs divide-y divide-stone-100 text-xs">
              <div className="grid grid-cols-2 bg-[#FAF9F6] p-3 divide-x divide-stone-200 text-center">
                <div className="px-1">
                  <h4 className="font-editorial font-bold text-xs text-stone-900 line-clamp-1">
                    {schoolA.name}
                  </h4>
                  <span className="text-[10px] text-stone-500 uppercase">
                    {schoolA.institutionType || 'School'}
                  </span>
                </div>
                <div className="px-1">
                  <h4 className="font-editorial font-bold text-xs text-stone-900 line-clamp-1">
                    {schoolB.name}
                  </h4>
                  <span className="text-[10px] text-stone-500 uppercase">
                    {schoolB.institutionType || 'School'}
                  </span>
                </div>
              </div>

              {/* Fee */}
              <div className="p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-bold text-stone-500 uppercase">Annual Tuition</span>
                  {schoolA.annualFeeMin !== schoolB.annualFeeMin && (
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-50 text-amber-900 border border-amber-200">Different</span>
                  )}
                </div>
                <div className="grid grid-cols-2 divide-x divide-stone-100 text-center font-bold text-stone-900">
                  <div>{formatFee(schoolA.annualFeeMin)}</div>
                  <div>{formatFee(schoolB.annualFeeMin)}</div>
                </div>
              </div>

              {/* Board / Approach */}
              <div className="p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-bold text-stone-500 uppercase">Board / Approach</span>
                  {(schoolA.curriculum?.[0] || schoolA.pedagogy?.[0]) !== (schoolB.curriculum?.[0] || schoolB.pedagogy?.[0]) && (
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-50 text-amber-900 border border-amber-200">Different</span>
                  )}
                </div>
                <div className="grid grid-cols-2 divide-x divide-stone-100 text-center font-medium text-stone-800">
                  <div className="text-[11px]">{schoolA.pedagogy?.[0] || schoolA.curriculum?.[0] || 'Information not available'}</div>
                  <div className="text-[11px]">{schoolB.pedagogy?.[0] || schoolB.curriculum?.[0] || 'Information not available'}</div>
                </div>
              </div>

              {/* Distance */}
              <div className="p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-bold text-stone-500 uppercase">Distance</span>
                  {schoolA.distanceKm !== schoolB.distanceKm && (
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-50 text-amber-900 border border-amber-200">Different</span>
                  )}
                </div>
                <div className="grid grid-cols-2 divide-x divide-stone-100 text-center font-semibold text-stone-900">
                  <div>{schoolA.distanceKm} km</div>
                  <div>{schoolB.distanceKm} km</div>
                </div>
              </div>

              {/* Transport */}
              <div className="p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-bold text-stone-500 uppercase">Transport</span>
                  {schoolA.hasTransport !== schoolB.hasTransport && (
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-50 text-amber-900 border border-amber-200">Different</span>
                  )}
                </div>
                <div className="grid grid-cols-2 divide-x divide-stone-100 text-center font-medium text-stone-800">
                  <div>{schoolA.hasTransport ? 'Available' : 'Not available'}</div>
                  <div>{schoolB.hasTransport ? 'Available' : 'Not available'}</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================
          FULL COMPARISON MATRIX (Horizontally scrollable on mobile)
          Preschool 10 factors + School 8 factors + Neutral labels
          ======================================================== */}
      <div className={`${mobileViewStyle === 'table' ? 'block' : 'hidden md:block'} max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 mt-6 sm:mt-8`}>
        {/* Mobile horizontal scroll hint */}
        <div className="md:hidden mb-2.5 py-1.5 px-3 bg-teal-50/80 border border-teal-100 rounded-xl text-[11px] text-teal-900 font-semibold flex items-center justify-between">
          <span>← Swipe horizontally to compare institutions →</span>
          <span className="text-teal-700 font-bold">{comparisonSchools.length} places</span>
        </div>
        <div className="bg-white rounded-3xl border border-stone-200 overflow-x-auto shadow-sm">
          <table className="w-full text-xs text-left border-collapse min-w-[620px]">
            {/* Column Header: School Identity Cards (Sticky on vertical scroll) */}
            <thead className="sticky top-16 z-20 bg-[#FAF9F6] shadow-2xs">
              <tr className="border-b border-stone-200 bg-[#FAF9F6]">
                <th className="p-4 sm:p-5 w-44 sm:w-60 min-w-[140px] sm:min-w-[200px] shrink-0 font-bold text-stone-700 uppercase tracking-wider text-[10px] sm:text-[11px] align-top sticky left-0 bg-[#FAF9F6] z-30 border-r border-stone-200 shadow-[1px_0_0_0_#e7e5e4]">
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
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded border inline-block ${bColor.badge}`}
                            >
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
                            {school.institutionType === 'combined'
                              ? 'Preschool + K–12'
                              : school.institutionType === 'preschool'
                              ? 'Early Years Center'
                              : 'K–12 School'}
                          </span>
                        </div>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody className="divide-y divide-stone-100 font-sans">
              {/* ========================================================
                  PRESCHOOL COMPARISON (10 FACTORS)
                  Age range, Programs, Learning approach, Fees, Timings,
                  Daycare, Outdoor play, Transport, Meals, Care ratio
                  ======================================================== */}
              <tr className="bg-amber-50/60 font-bold">
                <td
                  colSpan={comparisonSchools.length + 1}
                  className="py-2.5 px-5 text-xs text-amber-950 sticky left-0 z-10 bg-amber-50/80 border-r border-amber-200 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm">🧸</span>
                    <span className="uppercase tracking-wider">
                      Preschool Comparison (10 Core Factors)
                    </span>
                  </div>
                  <span className="text-[11px] text-amber-800 font-normal">
                    Early childhood priorities
                  </span>
                </td>
              </tr>

              {/* 1. Age Range */}
              <tr className={isDiff((s) => s.ageRange?.min) ? 'bg-amber-50/20' : ''}>
                <td className="p-3.5 px-5 font-bold text-stone-700 sticky left-0 bg-white z-10 border-r border-stone-200">
                  <div className="flex items-center justify-between">
                    <span>1. Age Range</span>
                    <DiffBadge different={isDiff((s) => s.ageRange?.min)} />
                  </div>
                </td>
                {comparisonSchools.map((s) => (
                  <td key={s.id} className="p-3.5 px-5 border-l border-stone-100 font-medium text-stone-900">
                    {s.ageRange ? `Ages ${s.ageRange.min}–${s.ageRange.max} yrs` : 'Needs confirmation'}
                  </td>
                ))}
              </tr>

              {/* 2. Programs */}
              <tr className={isDiff((s) => s.preschoolPrograms?.join(',')) ? 'bg-amber-50/20' : ''}>
                <td className="p-3.5 px-5 font-bold text-stone-700 sticky left-0 bg-white z-10 border-r border-stone-200">
                  <div className="flex items-center justify-between">
                    <span>2. Programs</span>
                    <DiffBadge different={isDiff((s) => s.preschoolPrograms?.join(','))} />
                  </div>
                </td>
                {comparisonSchools.map((s) => (
                  <td key={s.id} className="p-3.5 px-5 border-l border-stone-100 text-stone-800">
                    {s.preschoolPrograms && s.preschoolPrograms.length > 0
                      ? s.preschoolPrograms.map((p) => String(p).toUpperCase()).join(', ')
                      : 'Playgroup to UKG'}
                  </td>
                ))}
              </tr>

              {/* 3. Learning Approach */}
              <tr className={isDiff((s) => s.pedagogy?.join(',')) ? 'bg-amber-50/20' : ''}>
                <td className="p-3.5 px-5 font-bold text-stone-700 sticky left-0 bg-white z-10 border-r border-stone-200">
                  <div className="flex items-center justify-between">
                    <span>3. Learning Approach</span>
                    <DiffBadge different={isDiff((s) => s.pedagogy?.join(','))} />
                  </div>
                </td>
                {comparisonSchools.map((s) => (
                  <td key={s.id} className="p-3.5 px-5 border-l border-stone-100 text-stone-900 font-semibold">
                    {s.pedagogy && s.pedagogy.length > 0 ? (
                      <span className="text-teal-900 bg-teal-50 px-2 py-0.5 rounded border border-teal-200 inline-block font-semibold">
                        {s.pedagogy.join(', ')}
                      </span>
                    ) : (
                      'Activity-based / Montessori'
                    )}
                  </td>
                ))}
              </tr>

              {/* 4. Fees */}
              <tr className={isDiff((s) => s.annualFeeMin) ? 'bg-amber-50/20' : ''}>
                <td className="p-3.5 px-5 font-bold text-stone-700 sticky left-0 bg-white z-10 border-r border-stone-200">
                  <div className="flex items-center justify-between">
                    <span>4. Fees (Annual)</span>
                    <DiffBadge different={isDiff((s) => s.annualFeeMin)} />
                  </div>
                </td>
                {comparisonSchools.map((s) => (
                  <td key={s.id} className="p-3.5 px-5 border-l border-stone-100">
                    <span className="font-bold text-stone-900 tabular-nums">
                      {formatFee(s.annualFeeMin)} – {formatFee(s.annualFeeMax)}
                    </span>
                    <span className="block text-[10px] text-stone-500 mt-0.5">
                      {s.dataStatus === 'demo' ? 'Demo data' : 'Verified circular'}
                    </span>
                  </td>
                ))}
              </tr>

              {/* 5. Timings */}
              <tr className={isDiff((s) => s.timings) ? 'bg-amber-50/20' : ''}>
                <td className="p-3.5 px-5 font-bold text-stone-700 sticky left-0 bg-white z-10 border-r border-stone-200">
                  <div className="flex items-center justify-between">
                    <span>5. Timings</span>
                    <DiffBadge different={isDiff((s) => s.timings)} />
                  </div>
                </td>
                {comparisonSchools.map((s) => (
                  <td key={s.id} className="p-3.5 px-5 border-l border-stone-100 text-stone-800 font-medium">
                    {s.timings || '8:30 AM – 1:30 PM'}
                  </td>
                ))}
              </tr>

              {/* 6. Daycare */}
              <tr className={isDiff((s) => s.daycare) ? 'bg-amber-50/20' : ''}>
                <td className="p-3.5 px-5 font-bold text-stone-700 sticky left-0 bg-white z-10 border-r border-stone-200">
                  <div className="flex items-center justify-between">
                    <span>6. Daycare</span>
                    <DiffBadge different={isDiff((s) => s.daycare)} />
                  </div>
                </td>
                {comparisonSchools.map((s) => (
                  <td key={s.id} className="p-3.5 px-5 border-l border-stone-100">
                    {s.daycare ? (
                      <span className="font-semibold text-stone-900">
                        {s.extendedHours ? 'Available (to 6:30 PM)' : 'Available (Afternoon)'}
                      </span>
                    ) : (
                      <span className="text-stone-500 font-medium">Not available</span>
                    )}
                  </td>
                ))}
              </tr>

              {/* 7. Outdoor Play */}
              <tr className={isDiff((s) => s.outdoorPlay) ? 'bg-amber-50/20' : ''}>
                <td className="p-3.5 px-5 font-bold text-stone-700 sticky left-0 bg-white z-10 border-r border-stone-200">
                  <div className="flex items-center justify-between">
                    <span>7. Outdoor Play</span>
                    <DiffBadge different={isDiff((s) => s.outdoorPlay)} />
                  </div>
                </td>
                {comparisonSchools.map((s) => (
                  <td key={s.id} className="p-3.5 px-5 border-l border-stone-100">
                    {s.outdoorPlay ? (
                      <span className="font-semibold text-stone-900">
                        Available (Sand & nature yard)
                      </span>
                    ) : (
                      <span className="text-stone-500 font-medium">Not available</span>
                    )}
                  </td>
                ))}
              </tr>

              {/* 8. Transport */}
              <tr className={isDiff((s) => s.hasTransport) ? 'bg-amber-50/20' : ''}>
                <td className="p-3.5 px-5 font-bold text-stone-700 sticky left-0 bg-white z-10 border-r border-stone-200">
                  <div className="flex items-center justify-between">
                    <span>8. Transport</span>
                    <DiffBadge different={isDiff((s) => s.hasTransport)} />
                  </div>
                </td>
                {comparisonSchools.map((s) => (
                  <td key={s.id} className="p-3.5 px-5 border-l border-stone-100">
                    {s.hasTransport ? (
                      <span className="font-semibold text-stone-900">
                        Available (Vans ≤{s.transportRadiusKm} km)
                      </span>
                    ) : (
                      <span className="text-stone-500 font-medium">Not available</span>
                    )}
                  </td>
                ))}
              </tr>

              {/* 9. Meals */}
              <tr className={isDiff((s) => s.meals) ? 'bg-amber-50/20' : ''}>
                <td className="p-3.5 px-5 font-bold text-stone-700 sticky left-0 bg-white z-10 border-r border-stone-200">
                  <div className="flex items-center justify-between">
                    <span>9. Meals</span>
                    <DiffBadge different={isDiff((s) => s.meals)} />
                  </div>
                </td>
                {comparisonSchools.map((s) => (
                  <td key={s.id} className="p-3.5 px-5 border-l border-stone-100">
                    {s.meals ? (
                      <span className="font-semibold text-stone-900">
                        Available (Fresh kitchen snacks)
                      </span>
                    ) : (
                      <span className="text-stone-500 font-medium">Not available (Home-packed)</span>
                    )}
                  </td>
                ))}
              </tr>

              {/* 10. Child-to-caregiver Ratio */}
              <tr className={isDiff((s) => s.childToCaregiverRatio) ? 'bg-amber-50/20' : ''}>
                <td className="p-3.5 px-5 font-bold text-stone-700 sticky left-0 bg-white z-10 border-r border-stone-200">
                  <div className="flex items-center justify-between">
                    <span>10. Child-to-Caregiver Ratio</span>
                    <DiffBadge different={isDiff((s) => s.childToCaregiverRatio)} />
                  </div>
                </td>
                {comparisonSchools.map((s) => (
                  <td key={s.id} className="p-3.5 px-5 border-l border-stone-100 tabular-nums font-bold text-stone-900">
                    {s.childToCaregiverRatio || (s.studentTeacherRatio ? `${s.studentTeacherRatio} (School)` : 'Information not available')}
                  </td>
                ))}
              </tr>

              {/* ========================================================
                  SCHOOL COMPARISON (8 FACTORS)
                  Board, Grades, Fees, Distance, Facilities, Activities,
                  Transport, Student support
                  ======================================================== */}
              <tr className="bg-teal-50/60 font-bold">
                <td
                  colSpan={comparisonSchools.length + 1}
                  className="py-2.5 px-5 text-xs text-teal-950 sticky left-0 z-10 bg-teal-50/80 border-r border-teal-200 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm">🏫</span>
                    <span className="uppercase tracking-wider">
                      School Comparison (8 Core Factors)
                    </span>
                  </div>
                  <span className="text-[11px] text-teal-800 font-normal">
                    K–12 schooling criteria
                  </span>
                </td>
              </tr>

              {/* 1. Board */}
              <tr className={isDiff((s) => s.curriculum?.join(',')) ? 'bg-amber-50/20' : ''}>
                <td className="p-3.5 px-5 font-bold text-stone-700 sticky left-0 bg-white z-10 border-r border-stone-200">
                  <div className="flex items-center justify-between">
                    <span>1. Board</span>
                    <DiffBadge different={isDiff((s) => s.curriculum?.join(','))} />
                  </div>
                </td>
                {comparisonSchools.map((s) => (
                  <td key={s.id} className="p-3.5 px-5 border-l border-stone-100 font-semibold text-stone-900">
                    {s.curriculum && s.curriculum.length > 0
                      ? s.curriculum.join(', ')
                      : s.institutionType === 'preschool'
                      ? 'Information not available (Preschool)'
                      : 'CBSE'}
                  </td>
                ))}
              </tr>

              {/* 2. Grades */}
              <tr className={isDiff((s) => s.grades) ? 'bg-amber-50/20' : ''}>
                <td className="p-3.5 px-5 font-bold text-stone-700 sticky left-0 bg-white z-10 border-r border-stone-200">
                  <div className="flex items-center justify-between">
                    <span>2. Grades</span>
                    <DiffBadge different={isDiff((s) => s.grades)} />
                  </div>
                </td>
                {comparisonSchools.map((s) => (
                  <td key={s.id} className="p-3.5 px-5 border-l border-stone-100 text-stone-900 font-medium">
                    {s.grades || (s.ageRange ? `Ages ${s.ageRange.min}–${s.ageRange.max} yrs` : 'Information not available')}
                  </td>
                ))}
              </tr>

              {/* 3. Fees */}
              <tr className={isDiff((s) => s.annualFeeMin) ? 'bg-amber-50/20' : ''}>
                <td className="p-3.5 px-5 font-bold text-stone-700 sticky left-0 bg-white z-10 border-r border-stone-200">
                  <div className="flex items-center justify-between">
                    <span>3. Fees</span>
                    <DiffBadge different={isDiff((s) => s.annualFeeMin)} />
                  </div>
                </td>
                {comparisonSchools.map((s) => (
                  <td key={s.id} className="p-3.5 px-5 border-l border-stone-100 font-bold text-stone-900 tabular-nums">
                    {formatFee(s.annualFeeMin)} – {formatFee(s.annualFeeMax)}
                  </td>
                ))}
              </tr>

              {/* 4. Distance */}
              <tr className={isDiff((s) => s.distanceKm) ? 'bg-amber-50/20' : ''}>
                <td className="p-3.5 px-5 font-bold text-stone-700 sticky left-0 bg-white z-10 border-r border-stone-200">
                  <div className="flex items-center justify-between">
                    <span>4. Distance</span>
                    <DiffBadge different={isDiff((s) => s.distanceKm)} />
                  </div>
                </td>
                {comparisonSchools.map((s) => (
                  <td key={s.id} className="p-3.5 px-5 border-l border-stone-100 text-stone-900">
                    <span className="font-bold tabular-nums">{s.distanceKm} km</span>
                    <span className="text-stone-500 text-[11px] block">{s.area}</span>
                  </td>
                ))}
              </tr>

              {/* 5. Facilities */}
              <tr className={isDiff((s) => (s.facilities || []).length) ? 'bg-amber-50/20' : ''}>
                <td className="p-3.5 px-5 font-bold text-stone-700 sticky left-0 bg-white z-10 border-r border-stone-200">
                  <div className="flex items-center justify-between">
                    <span>5. Facilities</span>
                    <DiffBadge different={isDiff((s) => (s.facilities || []).length)} />
                  </div>
                </td>
                {comparisonSchools.map((s) => (
                  <td key={s.id} className="p-3.5 px-5 border-l border-stone-100 text-stone-800">
                    {s.facilities && s.facilities.length > 0
                      ? s.facilities.slice(0, 3).map((f) => f.name).join(', ')
                      : 'Not available'}
                  </td>
                ))}
              </tr>

              {/* 6. Activities */}
              <tr className={isDiff((s) => (s.extracurriculars || []).length) ? 'bg-amber-50/20' : ''}>
                <td className="p-3.5 px-5 font-bold text-stone-700 sticky left-0 bg-white z-10 border-r border-stone-200">
                  <div className="flex items-center justify-between">
                    <span>6. Activities</span>
                    <DiffBadge different={isDiff((s) => (s.extracurriculars || []).length)} />
                  </div>
                </td>
                {comparisonSchools.map((s) => (
                  <td key={s.id} className="p-3.5 px-5 border-l border-stone-100 text-stone-800">
                    {s.extracurriculars && s.extracurriculars.length > 0
                      ? s.extracurriculars.slice(0, 3).join(', ')
                      : 'Not available'}
                  </td>
                ))}
              </tr>

              {/* 7. Transport */}
              <tr className={isDiff((s) => s.hasTransport) ? 'bg-amber-50/20' : ''}>
                <td className="p-3.5 px-5 font-bold text-stone-700 sticky left-0 bg-white z-10 border-r border-stone-200">
                  <div className="flex items-center justify-between">
                    <span>7. Transport</span>
                    <DiffBadge different={isDiff((s) => s.hasTransport)} />
                  </div>
                </td>
                {comparisonSchools.map((s) => (
                  <td key={s.id} className="p-3.5 px-5 border-l border-stone-100">
                    {s.hasTransport ? (
                      <span className="font-semibold text-stone-900">
                        Available (≤{s.transportRadiusKm} km fleet)
                      </span>
                    ) : (
                      <span className="text-stone-500 font-medium">Not available</span>
                    )}
                  </td>
                ))}
              </tr>

              {/* 8. Student Support */}
              <tr className={isDiff((s) => s.hasSpecialNeedsSupport) ? 'bg-amber-50/20' : ''}>
                <td className="p-3.5 px-5 font-bold text-stone-700 sticky left-0 bg-white z-10 border-r border-stone-200">
                  <div className="flex items-center justify-between">
                    <span>8. Student Support</span>
                    <DiffBadge different={isDiff((s) => s.hasSpecialNeedsSupport)} />
                  </div>
                </td>
                {comparisonSchools.map((s) => (
                  <td key={s.id} className="p-3.5 px-5 border-l border-stone-100">
                    {s.hasSpecialNeedsSupport ? (
                      <span className="font-semibold text-stone-900">
                        Available (Resource room / IEP)
                      </span>
                    ) : s.institutionType === 'preschool' ? (
                      <span className="text-stone-600 font-medium">Needs confirmation</span>
                    ) : (
                      <span className="text-stone-700">Counseling & guidance</span>
                    )}
                  </td>
                ))}
              </tr>

              {/* ========================================================
                  ADMISSIONS & STATUS CHECKPOINTS
                  ======================================================== */}
              <tr className="bg-stone-100/70 font-bold">
                <td
                  colSpan={comparisonSchools.length + 1}
                  className="py-2.5 px-5 text-xs text-stone-800 sticky left-0 z-10 bg-stone-100/90 border-r border-stone-200"
                >
                  <span className="uppercase tracking-wider">
                    Admissions & Direct Actions
                  </span>
                </td>
              </tr>

              <tr>
                <td className="p-3.5 px-5 font-bold text-stone-700 sticky left-0 bg-white z-10 border-r border-stone-200">
                  Data Status
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
                      {s.dataStatus === 'demo' ? 'Demo data' : 'Verified schedule'}
                    </span>
                  </td>
                ))}
              </tr>

              <tr>
                <td className="p-3.5 px-5 font-bold text-stone-700 sticky left-0 bg-white z-10 border-r border-stone-200">
                  Admission Window
                </td>
                {comparisonSchools.map((s) => (
                  <td key={s.id} className="p-3.5 px-5 border-l border-stone-100">
                    <span
                      className={`px-2.5 py-0.5 rounded text-[11px] font-bold ${
                        s.admissionStatus?.includes('Open')
                          ? 'bg-emerald-100 text-emerald-900'
                          : 'bg-stone-100 text-stone-700'
                      }`}
                    >
                      {s.admissionStatus || 'Admissions Enquire'}
                    </span>
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

      {/* ========================================================
          "WHAT TO ASK" SECTION
          Questions to ask before deciding (3-5 neutral questions)
          ======================================================== */}
      <section className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 mt-8">
        <div className="bg-white rounded-3xl border border-stone-200/90 p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-stone-100">
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-800 flex items-center justify-center border border-teal-200">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-editorial text-xl font-bold text-stone-900">
                Questions to ask before deciding
              </h3>
              <p className="text-xs text-stone-600 font-sans">
                Neutral questions generated from the differences between these institutions to
                confirm directly with admissions desks or during your campus visit.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {generatedQuestions.map((q, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-[#FAF9F6] border border-stone-200 flex items-start gap-3 text-xs"
              >
                <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <div className="space-y-1">
                  <p className="text-stone-900 font-semibold leading-relaxed font-sans">
                    "{q}"
                  </p>
                  <span className="text-[10px] text-stone-500 block">
                    Suggested inquiry for campus visit or admissions consultation.
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

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
