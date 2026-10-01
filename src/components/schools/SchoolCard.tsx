import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Star, 
  Bookmark, 
  Scale, 
  Check, 
  AlertTriangle, 
  ChevronRight, 
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
  Baby
} from 'lucide-react';
import { School } from '../../types/school';
import { useComparison } from '../../context/ComparisonContext';
import { useShortlist } from '../../context/ShortlistContext';
import { getCurriculumColor, getFacilityCategoryColor, getMatchScoreStyle, getPedagogyColor } from '../../utils/categoryColors';

interface SchoolCardProps {
  school: School;
  featured?: boolean;
}

export const SchoolCard: React.FC<SchoolCardProps> = ({ school }) => {
  const { toggleComparison, isComparing } = useComparison();
  const { toggleSave, isSaved } = useShortlist();
  const [imageError, setImageError] = useState(false);

  const compared = isComparing(school.id);
  const saved = isSaved(school.id);

  const isEarlyYears = school.institutionType === 'preschool';
  const isCombined = school.institutionType === 'combined';

  // Badge and Accent calculation
  const primaryBoard = school.curriculum[0] || (school.pedagogy?.[0] || 'Early Years');
  const boardColor = isEarlyYears && school.pedagogy?.[0]
    ? getPedagogyColor(school.pedagogy[0])
    : getCurriculumColor(primaryBoard);
  const scoreStyle = getMatchScoreStyle(school.matchScore);

  const formatFee = (amount: number) => {
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    }
    return `₹${(amount / 1000).toFixed(0)}k`;
  };

  // Helper to pick appropriate Lucide icon for facility
  const getFacilityIcon = (iconName: string, name: string) => {
    const n = (iconName + ' ' + name).toLowerCase();
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

  // Split match reasons into confirmed positives and items to verify
  const positiveReasons = school.matchReasons.filter((r) => r.type === 'positive');
  const verifyReasons = school.matchReasons.filter((r) => r.type === 'partial' || r.type === 'unverified');

  // SVG ring calculations (radius 16, circumference ~ 100.53)
  const radius = 16;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (school.matchScore / 100) * circumference;

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

        {/* Badges - semantic coloring */}
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
              {school.curriculum.slice(0, 1).map((board) => (
                <span
                  key={board}
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md shadow-2xs backdrop-blur-xs ${getCurriculumColor(board).badge}`}
                >
                  {board}
                </span>
              ))}
            </>
          ) : (
            school.curriculum.slice(0, 2).map((board) => {
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

        {/* Quick action: Save bookmark with 44px tap target */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            toggleSave(school.id);
          }}
          className={`absolute top-2.5 right-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 cursor-pointer ${
            saved
              ? 'bg-amber-500 text-white hover:bg-amber-600 shadow-md scale-105'
              : 'bg-white/95 text-stone-700 hover:text-amber-600 hover:bg-white shadow-2xs backdrop-blur-xs'
          }`}
          title={saved ? 'Remove from shortlist' : 'Save to shortlist'}
          aria-label={saved ? `Remove ${school.name} from shortlist` : `Save ${school.name} to shortlist`}
        >
          <Bookmark className={`w-4 h-4 transition-transform active:scale-90 ${saved ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Editorial Content Zone */}
      <div className="flex-1 p-4 sm:p-5 flex flex-col justify-between">
        <div>
          {/* Header Row: Identity & Fit Ring */}
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 pr-2">
              <div className="flex items-center gap-1.5 text-xs text-stone-500 font-medium mb-1">
                <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                <span className="truncate">{school.area}</span>
                <span>·</span>
                <span className="tabular-nums">{school.distanceKm} km</span>
              </div>

              <h2 className="font-editorial text-lg sm:text-xl font-bold text-stone-900 group-hover:text-teal-900 transition-colors leading-snug">
                <Link to={`/school/${school.slug}`} className="focus:outline-none focus-visible:underline">
                  {school.name}
                </Link>
              </h2>

              <p className="text-xs text-stone-600 mt-1 line-clamp-2 leading-relaxed font-sans">
                {school.tagline}
              </p>
            </div>

            {/* Circular Match Score Ring */}
            <div className="shrink-0 flex flex-col items-center">
              <div className="relative w-12 h-12 flex items-center justify-center">
                <svg className="w-12 h-12 -rotate-90" viewBox="0 0 40 40">
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
                  <span className="text-[12px] font-bold font-sans text-stone-900 tabular-nums leading-none">
                    {school.matchScore}%
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-semibold text-stone-600 mt-0.5">
                {scoreStyle.tier}
              </span>
            </div>
          </div>

          {/* Pricing & Key Metrics Bar */}
          <div className="mt-3.5 pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2.5 text-xs">
            <div>
              <span className="text-stone-500 text-[11px] block font-medium">
                {isEarlyYears ? 'Annual Fee' : 'Estimated Annual Tuition'}
              </span>
              <span className="font-bold text-stone-900 text-sm tabular-nums">
                {formatFee(school.annualFeeMin)} – {formatFee(school.annualFeeMax)}
              </span>
            </div>

            <div>
              <span className="text-stone-500 text-[11px] block font-medium">
                {isEarlyYears ? 'Caregiver Ratio' : 'Teacher Ratio'}
              </span>
              <span className="font-semibold text-stone-800 tabular-nums">
                {school.childToCaregiverRatio || school.studentTeacherRatio}
              </span>
            </div>

            <div>
              <span className="text-stone-500 text-[11px] block font-medium">
                {isEarlyYears ? 'Programs' : 'Grades'}
              </span>
              <span className="font-semibold text-stone-800">
                {isEarlyYears 
                  ? (school.preschoolPrograms?.map((p) => p.toUpperCase()).join(' · ') || 'Toddler to UKG')
                  : school.grades}
              </span>
            </div>

            {isEarlyYears && school.timings && (
              <div className="hidden lg:block">
                <span className="text-stone-500 text-[11px] block font-medium">Hours</span>
                <span className="font-semibold text-stone-800 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-stone-400" />
                  <span className="truncate max-w-[130px]">{school.timings}</span>
                </span>
              </div>
            )}

            <div className="flex items-center gap-1.5 text-stone-800 bg-[#F5F1E8]/70 px-2.5 py-1 rounded-lg border border-stone-200/70">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
              <span className="font-bold text-xs tabular-nums">{school.rating.toFixed(1)}</span>
              <span className="text-[11px] text-stone-500 font-medium">({school.reviewCount})</span>
            </div>
          </div>

          {/* Expressive Facility Iconography with consistent accent tokens */}
          <div className="mt-3 flex flex-wrap gap-1.5">
            {school.facilities.slice(0, 4).map((f) => {
              const fColor = getFacilityCategoryColor(f.category, f.name);
              const IconComp = getFacilityIcon(f.iconName, f.name);
              return (
                <div
                  key={f.id}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium border ${fColor.bg} ${fColor.text} ${fColor.border}`}
                  title={f.highlight || f.name}
                >
                  <IconComp className="w-3 h-3 shrink-0" />
                  <span className="truncate max-w-[130px]">{f.name}</span>
                </div>
              );
            })}
          </div>

          {/* "WHY THIS SCHOOL" Section - Visual Signature */}
          <div className="mt-3.5 p-3 sm:p-3.5 rounded-xl bg-[#FAF9F6] border border-stone-200/90 text-xs space-y-2">
            <div className="flex items-center justify-between pb-1 border-b border-stone-200/60">
              <div className="flex items-center gap-1.5 font-bold text-stone-800 text-[11px] tracking-wider uppercase">
                <Sparkles className="w-3 h-3 text-amber-600" />
                <span>
                  {isEarlyYears ? 'Why this preschool matches' : 'Why this school for your family'}
                </span>
              </div>
              <span className="text-[10px] text-teal-800 font-semibold bg-teal-50 px-2 py-0.2 rounded border border-teal-200">
                Fit with your priorities
              </span>
            </div>

            <div className="space-y-1.5 pt-0.5">
              {positiveReasons.slice(0, 2).map((reason) => (
                <div key={reason.id} className="flex items-start gap-2 text-stone-700 leading-snug">
                  <span className="w-4 h-4 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </span>
                  <span>
                    <strong className="font-semibold text-stone-900">{reason.title}</strong>
                    <span className="text-stone-500 text-[11px] hidden sm:inline"> — {reason.description}</span>
                  </span>
                </div>
              ))}

              {verifyReasons.length > 0 && (
                <div className="flex items-start gap-2 pt-1 border-t border-stone-200/40 text-stone-700 leading-snug">
                  <span className="w-4 h-4 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
                    <AlertTriangle className="w-2.5 h-2.5" />
                  </span>
                  <span>
                    <span className="font-bold text-amber-900 text-[11px]">
                      {isEarlyYears ? 'One thing to check: ' : 'One thing to verify: '}
                    </span>
                    <strong className="font-semibold text-stone-900">{verifyReasons[0].title}</strong>
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Toolbar with min 40px touch targets */}
        <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2.5">
          
          {/* Compare Toggle Button */}
          <button
            type="button"
            onClick={() => toggleComparison(school.id)}
            className={`min-h-[40px] inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 cursor-pointer ${
              compared
                ? 'bg-teal-50 text-teal-900 border border-teal-300 shadow-2xs'
                : 'text-stone-700 hover:text-stone-950 hover:bg-stone-50 border border-stone-200 bg-white'
            }`}
          >
            <Scale className={`w-3.5 h-3.5 ${compared ? 'text-teal-700' : 'text-stone-500'}`} />
            <span>{compared ? 'In Comparison (✓)' : 'Compare'}</span>
          </button>

          {/* Primary View Profile CTA */}
          <Link
            to={`/school/${school.slug}`}
            className="min-h-[40px] inline-flex items-center gap-1.5 text-xs font-bold text-white bg-[#0D9488] hover:bg-[#115E59] py-2 px-4 rounded-lg shadow-2xs hover:shadow-xs transition-all group/btn focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
          >
            <span>{isEarlyYears ? 'View Preschool Profile' : 'View School Profile'}</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </article>
  );
};
