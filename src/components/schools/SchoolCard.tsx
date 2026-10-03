import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Star, 
  Bookmark, 
  Scale, 
  Check, 
  AlertTriangle, 
  ChevronRight, 
  ChevronDown,
  ChevronUp,
  School as SchoolIcon, 
  MapPin, 
  Waves, 
  Cpu, 
  Trophy, 
  BookOpen, 
  Drama, 
  Music, 
  HeartHandshake, 
  FlaskConical, 
  Sparkles,
  TreePine,
  Clock,
  Baby,
  ShieldCheck,
  Building2,
  Users
} from 'lucide-react';
import { School, Facility } from '../../types/school';
import { useComparison } from '../../context/ComparisonContext';
import { useShortlist } from '../../context/ShortlistContext';
import { useSearch } from '../../context/SearchContext';
import { getCurriculumColor, getFacilityCategoryColor, getMatchScoreStyle, getPedagogyColor } from '../../utils/categoryColors';
import { VerificationBadge } from '../common/VerificationBadge';
import { formatMatchReason } from '../../utils/matchProvenance';
import { SearchFilters } from '../../types/search';

interface SchoolCardProps {
  school: School;
  featured?: boolean;
}

/**
 * Prioritizes facilities that directly relate to the user's search query or active filters.
 * Returns the top 3-4 most relevant facilities.
 */
function getPrioritizedFacilities(
  school: School,
  rawQuery?: string,
  filters?: SearchFilters
): Facility[] {
  const query = (rawQuery || '').toLowerCase();
  const allFacilities = school.facilities || [];

  // Keywords that map to facility interests
  const scoringTerms: { pattern: RegExp; boost: number }[] = [];

  // When query or preschool filters mention daycare, prioritize Daycare & Extended hours
  if (query.includes('daycare') || filters?.preschool?.daycare) {
    scoringTerms.push({ pattern: /daycare|nap|sleep|infant|creche/i, boost: 60 });
    scoringTerms.push({ pattern: /extended|hours|timing/i, boost: 45 });
  }
  if (query.includes('extended') || filters?.preschool?.extendedHours) {
    scoringTerms.push({ pattern: /extended|hours|timing|evening/i, boost: 55 });
  }
  // Montessori / Reggio / Playway pedagogy facilities
  if (query.includes('montessori') || filters?.preschool?.pedagogy?.includes('Montessori')) {
    scoringTerms.push({ pattern: /montessori|sensory|activity lab|sensorial/i, boost: 65 });
  }
  // Outdoor play / sensory garden
  if (query.includes('outdoor') || query.includes('play') || query.includes('sand') || query.includes('garden') || filters?.preschool?.outdoorPlay) {
    scoringTerms.push({ pattern: /outdoor|garden|sand|turf|play/i, boost: 50 });
  }
  if (query.includes('swim') || query.includes('pool') || query.includes('aquatic') || filters?.requiredFacilities?.includes('Swimming Pool')) {
    scoringTerms.push({ pattern: /swim|pool|splash|aquatic/i, boost: 50 });
  }
  if (query.includes('robot') || query.includes('stem') || query.includes('tech') || query.includes('code') || filters?.requiredFacilities?.includes('Robotics & STEM Lab')) {
    scoringTerms.push({ pattern: /robot|stem|tech|arduino|maker|lego/i, boost: 50 });
  }
  if (query.includes('sport') || query.includes('turf') || query.includes('football') || query.includes('cricket') || filters?.requiredFacilities?.includes('Football Turf')) {
    scoringTerms.push({ pattern: /turf|football|sport|cricket|athletic|badminton|court/i, boost: 45 });
  }
  if (query.includes('science') || query.includes('lab') || filters?.requiredFacilities?.includes('Science Laboratories')) {
    scoringTerms.push({ pattern: /science|lab|physics|chemistry|biology/i, boost: 40 });
  }
  if (query.includes('art') || query.includes('music') || query.includes('drama') || query.includes('theatre') || filters?.requiredFacilities?.includes('Performing Arts Hall')) {
    scoringTerms.push({ pattern: /art|music|drama|theatre|auditorium|performing/i, boost: 40 });
  }
  if (query.includes('cctv') || query.includes('safe') || query.includes('security')) {
    scoringTerms.push({ pattern: /cctv|security|guard|stream/i, boost: 35 });
  }
  if (query.includes('counsel') || query.includes('wellness') || query.includes('sen') || query.includes('special needs') || filters?.requiresSpecialNeeds) {
    scoringTerms.push({ pattern: /wellness|counselling|psycholog|special|remedial/i, boost: 40 });
  }

  // Pool of candidate facilities
  const candidates: Facility[] = [...allFacilities];

  // If this is a preschool with extended hours or daycare and the query touches it, ensure synthetic items exist if not already present
  if (school.institutionType === 'preschool' || school.institutionType === 'combined') {
    const hasExtHoursInFac = candidates.some((f) => /extended|hours|timing/i.test(f.name));
    if (!hasExtHoursInFac && (school.extendedHours || query.includes('daycare') || query.includes('extended'))) {
      candidates.push({
        id: 'synth-ext-hours',
        name: 'Extended Hours',
        category: 'Wellness & Care',
        available: true,
        highlight: 'Full-day care with flexible evening pickups',
        iconName: 'Clock',
      });
    }

    const hasDaycareInFac = candidates.some((f) => /daycare|care|nap/i.test(f.name));
    if (!hasDaycareInFac && (school.daycare || query.includes('daycare'))) {
      candidates.push({
        id: 'synth-daycare',
        name: 'Daycare & Care Wing',
        category: 'Wellness & Care',
        available: true,
        highlight: 'Nurturing daycare with supervised rest pods',
        iconName: 'HeartHandshake',
      });
    }

    const hasMontessoriInFac = candidates.some((f) => /montessori/i.test(f.name));
    if (!hasMontessoriInFac && (school.pedagogy?.includes('Montessori') || query.includes('montessori'))) {
      candidates.push({
        id: 'synth-montessori',
        name: 'Montessori Activity Lab',
        category: 'STEM & Tech',
        available: true,
        highlight: 'Authentic child-paced sensory apparatus',
        iconName: 'Cpu',
      });
    }

    const hasOutdoorInFac = candidates.some((f) => /outdoor|garden|play/i.test(f.name));
    if (!hasOutdoorInFac && (school.outdoorPlay || query.includes('outdoor') || query.includes('play'))) {
      candidates.push({
        id: 'synth-outdoor',
        name: 'Outdoor Play Garden',
        category: 'Infrastructure',
        available: true,
        highlight: 'Shaded sand pit and gross motor play equipment',
        iconName: 'TreePine',
      });
    }
  }

  // Score each facility
  const scored = candidates.map((fac, originalIndex) => {
    let score = 10 - originalIndex; // Preserve original ordering as fallback
    const facText = `${fac.name} ${fac.highlight || ''} ${fac.category}`.toLowerCase();

    for (const term of scoringTerms) {
      if (term.pattern.test(facText)) {
        score += term.boost;
      }
    }
    return { facility: fac, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, 4).map((s) => s.facility);
}

export const SchoolCard: React.FC<SchoolCardProps> = ({ school }) => {
  const { toggleComparison, isComparing } = useComparison();
  const { toggleSave, isSaved } = useShortlist();
  const { searchState } = useSearch();
  const [imageError, setImageError] = useState(false);
  const [showAllReasons, setShowAllReasons] = useState(false);

  const compared = isComparing(school.id);
  const saved = isSaved(school.id);

  const isEarlyYears = school.institutionType === 'preschool';
  const isCombined = school.institutionType === 'combined';

  // Badge and Accent calculation
  const primaryBoard = school.curriculum?.[0] || (school.pedagogy?.[0] || 'Early Years');
  const boardColor = isEarlyYears && school.pedagogy?.[0]
    ? getPedagogyColor(school.pedagogy[0])
    : getCurriculumColor(primaryBoard);
  const scoreStyle = getMatchScoreStyle(school.matchScore);

  const formatFee = (amount?: number) => {
    const val = typeof amount === 'number' && !isNaN(amount) ? amount : 50000;
    if (val >= 100000) {
      return `₹${(val / 100000).toFixed(1)}L`;
    }
    return `₹${(val / 1000).toFixed(0)}k`;
  };

  // Helper to pick appropriate Lucide icon for facility
  const getFacilityIcon = (iconName: string, name: string) => {
    const n = ((iconName || '') + ' ' + (name || '')).toLowerCase();
    if (n.includes('tree') || n.includes('garden') || n.includes('sand')) return TreePine;
    if (n.includes('wave') || n.includes('swim') || n.includes('splash')) return Waves;
    if (n.includes('cpu') || n.includes('robot') || n.includes('maker') || n.includes('stem')) return Cpu;
    if (n.includes('trophy') || n.includes('turf') || n.includes('sport') || n.includes('cricket')) return Trophy;
    if (n.includes('flask') || n.includes('lab') || n.includes('science')) return FlaskConical;
    if (n.includes('drama') || n.includes('art') || n.includes('theatre') || n.includes('clay') || n.includes('atelier')) return Drama;
    if (n.includes('music') || n.includes('song')) return Music;
    if (n.includes('heart') || n.includes('wellness') || n.includes('care') || n.includes('daycare') || n.includes('nap')) return HeartHandshake;
    return BookOpen;
  };

  // Prioritize 3-4 facilities that directly relate to user's search
  const prioritizedFacilities = useMemo(() => {
    return getPrioritizedFacilities(school, searchState.rawQuery, searchState.filters);
  }, [school, searchState.rawQuery, searchState.filters]);

  // Match reasons management
  const allReasons = school.matchReasons || [];
  const allFormattedExplanations = useMemo(() => {
    return allReasons.map(formatMatchReason);
  }, [allReasons]);

  const visibleExplanations = showAllReasons
    ? allFormattedExplanations
    : allFormattedExplanations.slice(0, 2);

  // SVG ring calculations (radius 16, circumference ~ 100.53)
  const radius = 16;
  const circumference = 2 * Math.PI * radius;
  const safeScore = typeof school.matchScore === 'number' && !isNaN(school.matchScore) ? school.matchScore : 75;
  const strokeDashoffset = circumference - (safeScore / 100) * circumference;

  return (
    <article className="group relative bg-white rounded-2xl border border-stone-200/90 hover:border-stone-300 transition-all duration-300 overflow-hidden flex flex-col md:flex-row hover:shadow-md">
      
      {/* Top/Side subtle accent stripe based on primary curriculum / pedagogy */}
      <div 
        className={`hidden md:block w-1.5 shrink-0 ${boardColor.accentBar} opacity-90 transition-opacity group-hover:opacity-100`} 
        aria-hidden="true" 
      />
      <div 
        className={`md:hidden h-1.5 w-full shrink-0 ${boardColor.accentBar} opacity-90`} 
        aria-hidden="true" 
      />

      {/* Visual / Media Zone */}
      <div className="relative md:w-68 lg:w-72 shrink-0 bg-[#F5F1E8]/70 aspect-16/10 md:aspect-auto overflow-hidden">
        {!imageError && school.photos?.[0]?.url ? (
          <img
            src={school.photos[0].url}
            alt={`${school.name} campus building`}
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500 ease-out"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#FAF9F6] to-[#F5F1E8] p-4 text-center">
            {isEarlyYears ? (
              <Baby className="w-10 h-10 text-stone-400 mb-2" />
            ) : (
              <SchoolIcon className="w-10 h-10 text-stone-400 mb-2" />
            )}
            <span className="text-xs font-editorial font-medium text-stone-600 line-clamp-1">{school.name}</span>
          </div>
        )}

        {/* Subtle photo vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-stone-900/40 via-transparent to-black/10 pointer-events-none" />

        {/* Badges - semantic coloring without showing school-only info on preschools */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1">
          {isEarlyYears ? (
            <>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md shadow-2xs backdrop-blur-xs bg-amber-50/95 text-amber-950 border border-amber-200">
                Preschool & Early Years
              </span>
              {school.pedagogy?.slice(0, 1).map((ped) => {
                const pColor = getPedagogyColor(ped);
                return (
                  <span
                    key={ped}
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md shadow-2xs backdrop-blur-xs ${pColor.badge}`}
                  >
                    {ped}
                  </span>
                );
              })}
            </>
          ) : isCombined ? (
            <>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md shadow-2xs backdrop-blur-xs bg-teal-50/95 text-teal-950 border border-teal-200">
                Early Years + School
              </span>
              {(school.curriculum || []).slice(0, 1).map((board) => (
                <span
                  key={board}
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md shadow-2xs backdrop-blur-xs ${getCurriculumColor(board).badge}`}
                >
                  {board}
                </span>
              ))}
            </>
          ) : (
            (school.curriculum || []).slice(0, 2).map((board) => {
              const bColor = getCurriculumColor(board);
              return (
                <span
                  key={board}
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md shadow-2xs backdrop-blur-xs ${bColor.badge}`}
                >
                  {board}
                </span>
              );
            })
          )}
        </div>

        {/* Discreet image bookmark shortcut (Tertiary action) */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            toggleSave(school.id);
          }}
          className={`absolute top-2.5 right-2.5 min-h-[36px] min-w-[36px] flex items-center justify-center rounded-full transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 cursor-pointer ${
            saved
              ? 'bg-amber-500 text-white shadow-md scale-105'
              : 'bg-white/80 text-stone-700 hover:text-amber-600 hover:bg-white shadow-2xs backdrop-blur-xs'
          }`}
          title={saved ? 'Remove from shortlist' : 'Save to shortlist'}
          aria-label={saved ? `Remove ${school.name} from shortlist` : `Save ${school.name} to shortlist`}
        >
          <Bookmark className={`w-3.5 h-3.5 transition-transform active:scale-90 ${saved ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Editorial Content Zone */}
      <div className="flex-1 p-4 sm:p-5 flex flex-col justify-between">
        <div>
          {/* Header Row: Primary Information Dominance (1. Name, 2. Fit, 3. Location/Distance) */}
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 pr-2">
              
              {/* PRIMARY 3: Location / Distance + Provenance */}
              <div className="flex items-center gap-1.5 text-xs text-stone-600 font-semibold mb-1 flex-wrap">
                <span className="inline-flex items-center gap-1 text-stone-800">
                  <MapPin className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                  <span className="truncate">{school.area}</span>
                  <span className="text-stone-400">·</span>
                  <span className="tabular-nums font-bold text-stone-900">{school.distanceKm} km commute</span>
                </span>
                <span className="text-stone-300">·</span>
                <VerificationBadge
                  status={school.dataStatus || 'demo'}
                  lastVerifiedAt={school.lastVerifiedAt}
                  verificationSources={school.verificationSources}
                  size="sm"
                />
              </div>

              {/* PRIMARY 1: Institution Name (Dominant Heading) */}
              <h2 className="font-editorial text-xl sm:text-2xl font-bold text-stone-950 group-hover:text-teal-900 transition-colors leading-snug tracking-tight">
                <Link to={`/school/${school.slug}`} className="focus:outline-none focus-visible:underline">
                  {school.name}
                </Link>
              </h2>

              {/* Tagline */}
              <p className="text-xs text-stone-600 mt-1 line-clamp-2 leading-relaxed font-sans">
                {school.tagline}
              </p>
            </div>

            {/* PRIMARY 2: Fit with Priorities (Distinctive Circular Match Score Ring) */}
            <div className="shrink-0 flex flex-col items-center">
              <div className="relative w-13 h-13 flex items-center justify-center">
                <svg className="w-13 h-13 -rotate-90" viewBox="0 0 40 40">
                  <circle
                    cx="20"
                    cy="20"
                    r={radius}
                    className="stroke-stone-200"
                    strokeWidth="3.2"
                    fill="none"
                  />
                  <circle
                    cx="20"
                    cy="20"
                    r={radius}
                    stroke={scoreStyle.strokeColor}
                    strokeWidth="3.2"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    fill="none"
                    className="transition-all duration-700 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-[13px] font-bold font-sans text-stone-950 tabular-nums leading-none">
                    {school.matchScore}%
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-bold text-stone-700 mt-0.5 whitespace-nowrap">
                {scoreStyle.tier}
              </span>
            </div>
          </div>

          {/* PRIMARY 4 & 5: Fee & Age Range / Grades Bar (Visually dominant key metrics) */}
          <div className="mt-3.5 p-3 rounded-xl bg-[#FAF9F6] border border-stone-200/90 flex flex-wrap items-center justify-between gap-3 text-xs">
            
            {/* PRIMARY 4: Fee */}
            <div>
              <span className="text-stone-500 text-[11px] block font-semibold uppercase tracking-wider">
                {isEarlyYears ? 'Annual Preschool Fee' : 'Annual Tuition Fee'}
              </span>
              <span className="font-bold text-stone-950 text-base sm:text-lg tabular-nums">
                {formatFee(school.annualFeeMin)} – {formatFee(school.annualFeeMax)}
              </span>
              <span className="text-[10px] text-stone-500 block font-sans">
                {isEarlyYears ? 'Program specific' : 'Grade specific'}
              </span>
            </div>

            {/* PRIMARY 5: Age Range or Grades */}
            <div>
              <span className="text-stone-500 text-[11px] block font-semibold uppercase tracking-wider">
                {isEarlyYears ? 'Age Range' : isCombined ? 'Age / Grades' : 'Grade Levels'}
              </span>
              <span className="font-bold text-stone-950 text-base sm:text-lg">
                {isEarlyYears && school.ageRange
                  ? `Ages ${school.ageRange.min}–${school.ageRange.max} yrs`
                  : isCombined
                  ? `Ages ${school.ageRange?.min ?? 3}–18 yrs`
                  : school.grades}
              </span>
              <span className="text-[10px] text-stone-500 block font-sans">
                {isEarlyYears
                  ? 'Early Childhood'
                  : isCombined
                  ? 'Pre-KG to Class 12'
                  : 'Standard Grades'}
              </span>
            </div>

            {/* Caregiver or Teacher Ratio */}
            <div>
              <span className="text-stone-500 text-[11px] block font-semibold uppercase tracking-wider">
                {isEarlyYears ? 'Caregiver Ratio' : 'Teacher Ratio'}
              </span>
              <span className="font-bold text-stone-900 text-sm sm:text-base tabular-nums">
                {isEarlyYears ? (school.childToCaregiverRatio || '1:8') : (school.studentTeacherRatio || '1:16')}
              </span>
              <span className="text-[10px] text-stone-500 block font-sans">
                {isEarlyYears ? 'Per classroom guide' : 'Average class density'}
              </span>
            </div>

            {/* Parent Rating */}
            <div className="flex items-center gap-1.5 text-stone-800 bg-white px-2.5 py-1 rounded-lg border border-stone-200 self-center">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500 shrink-0" />
              <span className="font-bold text-xs tabular-nums">{(school.rating ?? 4.5).toFixed(1)}</span>
              <span className="text-[11px] text-stone-500 font-medium">({school.reviewCount ?? 0})</span>
            </div>
          </div>

          {/* COMBINED INSTITUTIONS: Clearly separate Early Years vs K–12 */}
          {isCombined && (
            <div className="mt-3 p-3 rounded-xl bg-white border border-stone-200/90 shadow-2xs space-y-2">
              <div className="flex items-center justify-between pb-1 border-b border-stone-100 text-[10px] font-bold uppercase tracking-wider text-stone-500">
                <span>Composite Campus Structure</span>
                <span className="text-teal-900 font-semibold bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                  Early Years + K–12 Academy
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                
                {/* Early Years Wing */}
                <div className="p-2.5 rounded-lg bg-amber-50/60 border border-amber-200/80 space-y-1">
                  <div className="flex items-center gap-1.5 text-amber-950 font-bold text-xs">
                    <Baby className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                    <span>Early Years Wing (Ages {school.ageRange?.min ?? 3}–{school.ageRange?.max ?? 6} yrs)</span>
                  </div>
                  <p className="text-[11px] text-stone-700">
                    Programs: <strong className="text-stone-900">{school.preschoolPrograms?.map((p) => p.toUpperCase()).join(' · ') || 'Pre-KG · LKG · UKG'}</strong>
                  </p>
                  <div className="flex items-center gap-2 text-[10px] text-stone-600 font-medium">
                    <span>Approach: {school.pedagogy?.join(' · ') || 'Montessori & Play-way'}</span>
                    {school.daycare && <span className="text-teal-800 font-bold">· Daycare available</span>}
                  </div>
                </div>

                {/* K–12 Academy */}
                <div className="p-2.5 rounded-lg bg-teal-50/60 border border-teal-200/80 space-y-1">
                  <div className="flex items-center gap-1.5 text-teal-950 font-bold text-xs">
                    <SchoolIcon className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                    <span>K–12 Academy ({school.grades || 'Classes 1–12'})</span>
                  </div>
                  <p className="text-[11px] text-stone-700">
                    Boards: <strong className="text-stone-900">{(school.curriculum || []).join(' · ') || 'CBSE'}</strong>
                  </p>
                  <div className="flex items-center gap-2 text-[10px] text-stone-600 font-medium">
                    <span>Teacher ratio: {school.studentTeacherRatio || '1:16'}</span>
                    <span>· Labs & Sports Turf</span>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* SECONDARY INFORMATION: Stage Divergence */}
          {/* 1. PRESCHOOL SPECIFIC FIELDS (Age range, Programs, Learning approach, Hours, Daycare) */}
          {isEarlyYears && (
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2 rounded-lg bg-white border border-stone-200">
                <span className="text-[10px] text-stone-500 font-semibold block uppercase">Programs</span>
                <span className="font-bold text-stone-900 block truncate" title={school.preschoolPrograms?.map(p => p.toUpperCase()).join(', ')}>
                  {school.preschoolPrograms?.map(p => p.toUpperCase()).join(' · ') || 'Toddler to UKG'}
                </span>
              </div>

              <div className="p-2 rounded-lg bg-white border border-stone-200">
                <span className="text-[10px] text-stone-500 font-semibold block uppercase">Learning Approach</span>
                <span className="font-bold text-stone-900 block truncate" title={school.pedagogy?.join(' · ')}>
                  {school.pedagogy?.join(' · ') || 'Montessori / Play-way'}
                </span>
              </div>

              <div className="p-2 rounded-lg bg-white border border-stone-200">
                <span className="text-[10px] text-stone-500 font-semibold block uppercase">Hours</span>
                <span className="font-bold text-stone-900 block truncate flex items-center gap-1">
                  <Clock className="w-3 h-3 text-stone-400 shrink-0" />
                  <span>{school.timings ? school.timings.split('(')[0].trim() : '8:30 AM – 1:30 PM'}</span>
                </span>
              </div>

              <div className="p-2 rounded-lg bg-white border border-stone-200">
                <span className="text-[10px] text-stone-500 font-semibold block uppercase">Daycare & Care</span>
                <span className={`font-bold block truncate ${school.daycare ? 'text-teal-800' : 'text-stone-600'}`}>
                  {school.daycare ? 'Daycare Available' : 'Half-day program'}
                </span>
              </div>
            </div>
          )}

          {/* 2. REGULAR SCHOOL SPECIFIC FIELDS (Board, Grades, Distance, Teacher ratio) */}
          {!isEarlyYears && !isCombined && (
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-stone-200 font-medium">
                <span className="text-[11px] text-stone-500">Board:</span>
                <strong className="text-stone-900">{(school.curriculum || []).join(' · ')}</strong>
              </div>

              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-stone-200 font-medium">
                <span className="text-[11px] text-stone-500">Grades:</span>
                <strong className="text-stone-900">{school.grades}</strong>
              </div>

              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-stone-200 font-medium">
                <span className="text-[11px] text-stone-500">Teacher Ratio:</span>
                <strong className="text-stone-900">{school.studentTeacherRatio || '1:16'}</strong>
              </div>

              {school.hasTransport && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-teal-50 border border-teal-200 font-medium text-teal-950">
                  <span>Transport fleet ({school.transportRadiusKm} km)</span>
                </div>
              )}
            </div>
          )}

          {/* 3. RELEVANT FACILITIES: Prioritized based directly on search context */}
          <div className="mt-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                Relevant Campus Facilities
              </span>
              <span className="text-[10px] text-stone-400">Prioritized by search match</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {prioritizedFacilities.map((f) => {
                const fColor = getFacilityCategoryColor(f.category, f.name);
                const IconComp = getFacilityIcon(f.iconName, f.name);
                return (
                  <div
                    key={f.id}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium border ${fColor.bg} ${fColor.text} ${fColor.border}`}
                    title={f.highlight || f.name}
                  >
                    <IconComp className="w-3 h-3 shrink-0" />
                    <span className="truncate max-w-[150px]">{f.name}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* "WHY THIS MATCHES" Section: Initial limit of 2 + "See more reasons" toggle */}
          <div className="mt-3.5 p-3 sm:p-3.5 rounded-xl bg-[#FAF9F6] border border-stone-200/90 text-xs space-y-2">
            <div className="flex items-center justify-between pb-1 border-b border-stone-200/60">
              <div className="flex items-center gap-1.5 font-bold text-stone-800 text-[11px] tracking-wider uppercase">
                <Sparkles className="w-3 h-3 text-amber-600 shrink-0" />
                <span>
                  {isEarlyYears ? 'Why this preschool matches' : 'Why this school matches your family'}
                </span>
              </div>
              <span className="text-[10px] text-teal-800 font-semibold bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                Fit with priorities
              </span>
            </div>

            <div className="space-y-2 pt-0.5">
              {visibleExplanations.map((exp, idx) => {
                const isConfirmation = exp.category === 'confirmation';
                return (
                  <div key={idx} className="flex items-start gap-2 text-stone-700 leading-snug">
                    <span
                      className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                        isConfirmation
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-teal-100 text-teal-800'
                      }`}
                    >
                      {isConfirmation ? (
                        <AlertTriangle className="w-2.5 h-2.5" />
                      ) : (
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline gap-1.5 flex-wrap">
                        <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border shrink-0 ${exp.tagBadgeClass}`}>
                          {exp.tag}
                        </span>
                        <strong className="font-semibold text-stone-900 text-xs">{exp.title}</strong>
                      </div>
                      {exp.detail && (
                        <p className="text-stone-500 text-[11px] mt-0.5 leading-tight">
                          {exp.actionAdvice || exp.detail}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* "See more reasons" button if more than 2 explanations exist */}
            {allFormattedExplanations.length > 2 && (
              <div className="pt-1 border-t border-stone-200/50 flex justify-end">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowAllReasons(!showAllReasons);
                  }}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-800 hover:text-teal-950 py-0.5 cursor-pointer focus:outline-none focus-visible:underline"
                >
                  <span>
                    {showAllReasons
                      ? 'Show fewer reasons'
                      : 'See more reasons'}
                  </span>
                  {showAllReasons ? (
                    <ChevronUp className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ACTION HIERARCHY: Primary ("View profile") > Secondary ("Compare") > Tertiary ("Save") */}
        <div className="mt-4 pt-3.5 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2.5">
          
          <div className="flex items-center gap-2">
            {/* SECONDARY ACTION: Compare (Clean outlined card button) */}
            <button
              type="button"
              onClick={() => toggleComparison(school.id)}
              className={`min-h-[42px] px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 cursor-pointer shadow-2xs ${
                compared
                  ? 'bg-teal-50 text-teal-900 border-teal-300'
                  : 'bg-white hover:bg-stone-50 text-stone-700 hover:text-stone-900 border-stone-200'
              }`}
            >
              <Scale className={`w-3.5 h-3.5 ${compared ? 'text-teal-700' : 'text-stone-500'}`} />
              <span>{compared ? 'In Comparison (✓)' : 'Compare'}</span>
            </button>

            {/* TERTIARY ACTION: Save (Quiet, understated button) */}
            <button
              type="button"
              onClick={() => toggleSave(school.id)}
              className={`min-h-[42px] px-3 py-2 rounded-xl text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                saved
                  ? 'text-amber-800 bg-amber-50 hover:bg-amber-100/80 border border-amber-200'
                  : 'text-stone-500 hover:text-stone-800 hover:bg-stone-100/80'
              }`}
              aria-label={saved ? `Remove ${school.name} from shortlist` : `Save ${school.name} to shortlist`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${saved ? 'fill-amber-600 text-amber-600' : 'text-stone-400'}`} />
              <span>{saved ? 'Saved' : 'Save'}</span>
            </button>
          </div>

          {/* PRIMARY ACTION: View Profile (Prominent bold teal CTA button) */}
          <Link
            to={`/school/${school.slug}`}
            className="min-h-[42px] px-5 py-2.5 bg-[#0D9488] hover:bg-[#115E59] active:bg-teal-900 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs hover:shadow-sm transition-all flex items-center gap-1.5 cursor-pointer group/cta focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
          >
            <span>View profile</span>
            <ChevronRight className="w-4 h-4 group-hover/cta:translate-x-0.5 transition-transform" />
          </Link>

        </div>
      </div>
    </article>
  );
};
