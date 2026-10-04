import React, { useState, useMemo, useEffect } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Star,
  Bookmark,
  Scale,
  MapPin,
  ExternalLink,
  Phone,
  Mail,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Sparkles,
  ArrowLeft,
  Share2,
  Baby,
  Clock,
  School as SchoolIcon,
  TreePine,
  Layers,
  Check,
  Calendar,
  Utensils,
  Bus,
  HeartHandshake,
  X,
  Compass,
  Building2,
  BookOpen,
  Trophy,
  RotateCcw,
} from 'lucide-react';
import { CHENNAI_SCHOOLS } from '../data/schools';
import { useComparison } from '../context/ComparisonContext';
import { useShortlist } from '../context/ShortlistContext';
import { useSearch } from '../context/SearchContext';
import { getCurriculumColor, getFacilityCategoryColor, getMatchScoreStyle, getPedagogyColor } from '../utils/categoryColors';
import { VerificationBadge } from '../components/common/VerificationBadge';
import { formatMatchReason } from '../utils/matchProvenance';
import { ProfileSkeleton } from '../components/schools/ProfileSkeleton';

type ProfileTab = 'overview' | 'programs' | 'academics' | 'fees' | 'facilities' | 'admissions' | 'neighbourhood';

interface SchoolProfilePageProps {
  onOpenAdvisorWithSchool?: (schoolName: string) => void;
}

export const SchoolProfilePage: React.FC<SchoolProfilePageProps> = ({ onOpenAdvisorWithSchool }) => {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const { toggleComparison, isComparing } = useComparison();
  const { toggleSave, isSaved } = useShortlist();
  const { searchState } = useSearch();

  const [isLoading, setIsLoading] = useState<boolean>(() => searchParams.get('state') === 'loading');
  const [profileError, setProfileError] = useState<string | null>(() =>
    searchParams.get('state') === 'error' || searchParams.get('error') === 'true'
      ? 'Something went wrong while loading these results.'
      : null
  );

  // Fast simulated network load sequence (~260ms) on route change
  useEffect(() => {
    if (searchParams.get('state') === 'loading') {
      setIsLoading(true);
      return;
    }
    if (searchParams.get('state') === 'error' || searchParams.get('error') === 'true') {
      setProfileError('Something went wrong while loading these results.');
      return;
    }
    setProfileError(null);
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 260);
    return () => clearTimeout(timer);
  }, [slug, searchParams]);

  const school = CHENNAI_SCHOOLS.find((s) => s.slug === slug);

  const isEarlyYears = school?.institutionType === 'preschool';
  const isCombined = school?.institutionType === 'combined';

  const [activeTab, setActiveTab] = useState<ProfileTab>(isEarlyYears ? 'programs' : 'overview');
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isPlanVisitOpen, setIsPlanVisitOpen] = useState(false);
  const [mainImageError, setMainImageError] = useState(false);
  const [failedThumbnails, setFailedThumbnails] = useState<Record<number, boolean>>({});

  // Reset main image error if selected photo changes
  useEffect(() => {
    setMainImageError(false);
  }, [selectedPhotoIndex]);

  // Handle Escape key and body lock for Plan Visit modal
  useEffect(() => {
    if (!isPlanVisitOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsPlanVisitOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isPlanVisitOpen]);

  // Similar institutions: "Other places you may want to compare"
  const similarInstitutions = useMemo(() => {
    if (!school) return [];
    const isEarly = school.institutionType === 'preschool';
    return CHENNAI_SCHOOLS.filter((s) => {
      if (s.id === school.id) return false;
      if (isEarly) {
        return s.institutionType === 'preschool' || s.institutionType === 'combined';
      }
      return !s.institutionType || s.institutionType === 'school' || s.institutionType === 'combined';
    })
      .sort((a, b) => {
        const aSameArea = a.area === school.area ? 1 : 0;
        const bSameArea = b.area === school.area ? 1 : 0;
        return bSameArea - aSameArea || Math.abs(a.distanceKm - school.distanceKm) - Math.abs(b.distanceKm - school.distanceKm);
      })
      .slice(0, 3);
  }, [school]);

  // SKELETON PROFILE LOADING STATE
  if (isLoading) {
    return <ProfileSkeleton />;
  }

  // FRIENDLY ERROR STATE
  if (profileError) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center p-4 font-sans text-stone-900">
        <div className="max-w-md w-full bg-white rounded-3xl border border-stone-200 p-8 shadow-xs text-center space-y-5">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto border border-amber-200">
            <AlertTriangle className="w-7 h-7 text-amber-600" />
          </div>
          <div className="space-y-2">
            <h2 className="font-editorial text-2xl font-bold text-stone-900 tracking-tight">
              Something went wrong while loading these results.
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 font-sans leading-relaxed">
              We encountered an issue loading this institution profile. Please try again or return to search.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setProfileError(null);
                setIsLoading(true);
                setTimeout(() => setIsLoading(false), 260);
              }}
              className="px-5 py-2.5 bg-[#0D9488] hover:bg-[#115E59] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer min-h-[44px] flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Try again</span>
            </button>
            <Link
              to="/results"
              className="px-5 py-2.5 bg-[#F5F1E8] hover:bg-stone-200 text-stone-800 border border-stone-300 rounded-xl text-xs font-bold transition-colors cursor-pointer min-h-[44px] flex items-center justify-center"
            >
              Return to search
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!school) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] py-24 px-4 text-center font-sans">
        <div className="max-w-md mx-auto bg-white p-8 rounded-3xl border border-stone-200 shadow-xs space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto border border-amber-200">
            <AlertTriangle className="w-7 h-7 text-amber-600" />
          </div>
          <div className="space-y-2">
            <h2 className="font-editorial text-2xl font-bold text-stone-900">Institution Not Listed</h2>
            <p className="text-xs text-stone-600 font-sans">
              The school or preschool you are looking for is either unlisted or may have been updated in our directory.
            </p>
          </div>
          <div className="pt-2">
            <Link
              to="/results"
              className="inline-flex px-5 py-2.5 bg-[#0D9488] text-white rounded-xl text-xs font-bold hover:bg-[#115E59] transition-colors min-h-[44px] items-center"
            >
              Return to search
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const compared = isComparing(school.id);
  const saved = isSaved(school.id);

  const primaryBoard = school.curriculum?.[0] || (school.pedagogy?.[0] || 'Early Years');
  const boardColor = isEarlyYears && school.pedagogy?.[0]
    ? getPedagogyColor(school.pedagogy[0])
    : getCurriculumColor(primaryBoard);
  const scoreStyle = getMatchScoreStyle(school.matchScore);

  const formatFee = (amount?: number) => {
    if (typeof amount !== 'number' || isNaN(amount) || amount <= 0) {
      return 'Information not available';
    }
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} Lakh`;
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const dataStatusLabel = school.dataStatus === 'demo'
    ? 'Demo data'
    : school.lastVerifiedAt && school.lastVerifiedAt !== 'Demonstration catalog'
    ? `Last updated: ${school.lastVerifiedAt}`
    : 'Demo data';

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] pb-24 text-stone-900 font-sans selection:bg-teal-100 selection:text-teal-900">
      
      {/* Top Breadcrumb & Quick Actions Bar */}
      <div className="bg-white border-b border-stone-200/90 py-3 px-3.5 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <Link
            to="/results"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-teal-900 transition-colors shrink-0 py-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back<span className="hidden min-[400px]:inline"> to discovery</span></span>
          </Link>

          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border border-stone-200 text-xs font-semibold text-stone-700 hover:bg-[#FAF9F6] transition-colors cursor-pointer min-h-[38px]"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{copiedLink ? 'Copied' : 'Share'}</span>
            </button>

            {/* Save to Shortlist */}
            <button
              type="button"
              onClick={() => toggleSave(school.id)}
              className={`inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer min-h-[38px] ${
                saved
                  ? 'bg-amber-500 text-white shadow-2xs hover:bg-amber-600'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${saved ? 'fill-current' : ''}`} />
              <span>
                {saved ? 'Saved' : 'Save'}
              </span>
            </button>

            {/* Compare */}
            <button
              type="button"
              onClick={() => toggleComparison(school.id)}
              className={`inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer min-h-[38px] ${
                compared
                  ? 'bg-teal-700 text-white shadow-2xs hover:bg-teal-800'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
              <span>
                {compared ? 'Comparing' : 'Compare'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="bg-white border-b border-stone-200/90 py-7 sm:py-9 px-3.5 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Info (Col 7) */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Semantic Board / Pedagogy Badges & Accents */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {isEarlyYears ? (
                <>
                  <span className="font-bold px-2.5 py-0.5 rounded-md text-[11px] border bg-amber-50 text-amber-950 border-amber-300">
                    Preschool & Early Years
                  </span>
                  {school.pedagogy?.map((ped) => {
                    const pColor = getPedagogyColor(ped);
                    return (
                      <span key={ped} className={`font-bold px-2.5 py-0.5 rounded-md text-[11px] border ${pColor.badge}`}>
                        {ped}
                      </span>
                    );
                  })}
                </>
              ) : isCombined ? (
                <>
                  <span className="font-bold px-2.5 py-0.5 rounded-md text-[11px] border bg-teal-50 text-teal-950 border-teal-300">
                    Preschool + K–12 Campus
                  </span>
                  {(school.curriculum || []).map((c) => (
                    <span key={c} className={`font-bold px-2.5 py-0.5 rounded-md text-[11px] border ${getCurriculumColor(c).badge}`}>
                      {c}
                    </span>
                  ))}
                </>
              ) : (
                (school.curriculum || []).map((c) => {
                  const cColor = getCurriculumColor(c);
                  return (
                    <span key={c} className={`font-bold px-2.5 py-0.5 rounded-md text-[11px] border ${cColor.badge}`}>
                      {c}
                    </span>
                  );
                })
              )}

              <span className="text-stone-400">·</span>
              <span className="font-semibold text-stone-600">
                {isEarlyYears && school.ageRange ? `Ages ${school.ageRange.min}–${school.ageRange.max} yrs` : school.grades}
              </span>
              <span className="text-stone-400">·</span>
              <span className="text-stone-600">Est. {school.establishedYear}</span>
              <span className="text-stone-400">·</span>
              <span className="flex items-center gap-1 text-stone-700 font-medium">
                <MapPin className="w-3.5 h-3.5 text-stone-400" />
                <span>{school.area}, Chennai</span>
              </span>
              <span className="text-stone-400">·</span>
              <VerificationBadge
                status={school.dataStatus || 'demo'}
                lastVerifiedAt={school.lastVerifiedAt}
                verificationSources={school.verificationSources}
                size="md"
              />
            </div>

            <h1 className="font-editorial text-2xl xs:text-3xl sm:text-4xl lg:text-5xl text-stone-900 tracking-tight leading-tight">
              {school.name}
            </h1>

            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-sans max-w-2xl">
              {school.tagline}
            </p>

            {/* Combined Institution Visual Stage Callouts */}
            {isCombined && (
              <div className="p-3.5 rounded-xl bg-[#FAF9F6] border border-stone-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <Baby className="w-4 h-4 text-amber-600 shrink-0" />
                  <div>
                    <span className="font-bold text-stone-900 block">Early Years Wing</span>
                    <span className="text-stone-600">{school.preschoolPrograms?.map((p) => p.toUpperCase()).join(' · ')}</span>
                  </div>
                </div>
                <div className="h-4 w-px bg-stone-200 hidden sm:block" />
                <div className="flex items-center gap-2">
                  <SchoolIcon className="w-4 h-4 text-teal-700 shrink-0" />
                  <div>
                    <span className="font-bold text-stone-900 block">K–12 Academy</span>
                    <span className="text-stone-600">Grade 1 to Class 12 ({school.curriculum?.join(', ') || 'Standard Curriculum'})</span>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Metrics Cards with Explicit Data Provenance */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
              <div className="p-3 rounded-xl bg-[#FAF9F6] border border-stone-200/80">
                <span className="text-[11px] text-stone-500 font-medium block">Fit with Priorities</span>
                <span className={`font-bold text-sm sm:text-base tabular-nums ${scoreStyle.textColor}`}>
                  {school.matchScore}% Fit
                </span>
                <span className="text-[10px] text-teal-800 font-semibold block">Matches your priorities</span>
              </div>

              <div className="p-3 rounded-xl bg-[#FAF9F6] border border-stone-200/80">
                <span className="text-[11px] text-stone-500 font-medium block">
                  {isEarlyYears ? 'Annual Fee' : 'Est. Annual Tuition'}
                </span>
                <span className="font-bold text-stone-900 text-sm sm:text-base tabular-nums">
                  ₹{(school.annualFeeMin / 100000).toFixed(1)}L – {(school.annualFeeMax / 100000).toFixed(1)}L
                </span>
                <span className="text-[10px] text-stone-500 block truncate">
                  {dataStatusLabel}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#FAF9F6] border border-stone-200/80">
                <span className="text-[11px] text-stone-500 font-medium block">
                  {isEarlyYears ? 'Caregiver Ratio' : 'Student:Teacher'}
                </span>
                <span className="font-bold text-stone-900 text-sm sm:text-base tabular-nums">
                  {school.childToCaregiverRatio || school.studentTeacherRatio}
                </span>
                <span className="text-[10px] text-stone-500 block">
                  {dataStatusLabel}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#FAF9F6] border border-stone-200/80">
                <span className="text-[11px] text-stone-500 font-medium block">Commute Radius</span>
                <span className="font-bold text-stone-900 text-sm sm:text-base tabular-nums">
                  {school.distanceKm} km
                </span>
                <span className="text-[10px] text-stone-600 font-medium block">
                  {school.hasTransport ? `Van/Bus (≤${school.transportRadiusKm} km)` : 'Parent drop'}
                </span>
              </div>
            </div>

            {/* PRIORITY SPECIFICATIONS GRID: Preschool vs School prioritized fields */}
            <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-stone-200/90 space-y-2 text-xs">
              <span className="text-[11px] font-bold text-stone-700 uppercase tracking-wider block">
                {isEarlyYears ? 'Preschool Priority Details' : 'School Priority Details'}
              </span>

              {isEarlyYears ? (
                /* Preschool Prioritized Fields: Age range, Programs, Learning approach, Daycare, Timings, Ratio, Outdoor play, Meals, Transport */
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-stone-700">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-stone-500 uppercase font-semibold block">1. Age Range</span>
                    <span className="font-bold text-stone-900">
                      {school.ageRange ? `${school.ageRange.min}–${school.ageRange.max} yrs` : 'Information not available'}
                    </span>
                    <span className="text-[10px] text-stone-400 block font-normal">{dataStatusLabel}</span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-stone-500 uppercase font-semibold block">2. Programs</span>
                    <span className="font-bold text-stone-900 uppercase">
                      {school.preschoolPrograms && school.preschoolPrograms.length > 0
                        ? school.preschoolPrograms.join(', ')
                        : 'Information not available'}
                    </span>
                    <span className="text-[10px] text-stone-400 block font-normal">{dataStatusLabel}</span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-stone-500 uppercase font-semibold block">3. Learning Approach</span>
                    <span className="font-bold text-stone-900">
                      {school.pedagogy && school.pedagogy.length > 0
                        ? school.pedagogy.join(' · ')
                        : 'Information not available'}
                    </span>
                    <span className="text-[10px] text-stone-400 block font-normal">{dataStatusLabel}</span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-stone-500 uppercase font-semibold block">4. Daycare</span>
                    <span className="font-bold text-stone-900">
                      {school.daycare ? (school.extendedHours ? 'Extended (till 6:30 PM)' : 'Available (Afternoon)') : 'Half-day Only'}
                    </span>
                    <span className="text-[10px] text-stone-400 block font-normal">{dataStatusLabel}</span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-stone-500 uppercase font-semibold block">5. Timings</span>
                    <span className="font-bold text-stone-900">{school.timings || 'Information not available'}</span>
                    <span className="text-[10px] text-stone-400 block font-normal">{dataStatusLabel}</span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-stone-500 uppercase font-semibold block">6. Caregiver Ratio</span>
                    <span className="font-bold text-stone-900">{school.childToCaregiverRatio || 'Information not available'}</span>
                    <span className="text-[10px] text-stone-400 block font-normal">{dataStatusLabel}</span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-stone-500 uppercase font-semibold block">7. Outdoor Play</span>
                    <span className="font-bold text-stone-900">
                      {school.outdoorPlay ? 'Outdoor Sand & Nature Yard' : 'Indoor Activity Play'}
                    </span>
                    <span className="text-[10px] text-stone-400 block font-normal">{dataStatusLabel}</span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-stone-500 uppercase font-semibold block">8. Meals</span>
                    <span className="font-bold text-stone-900">
                      {school.meals ? 'Fresh Kitchen Meals & Snacks' : 'Home-packed Snacks'}
                    </span>
                    <span className="text-[10px] text-stone-400 block font-normal">{dataStatusLabel}</span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-stone-500 uppercase font-semibold block">9. Transport</span>
                    <span className="font-bold text-stone-900">
                      {school.hasTransport
                        ? `AC Vans (${school.transportRadiusKm ? `up to ${school.transportRadiusKm} km` : 'Transport Available'})`
                        : 'Parent Drop'}
                    </span>
                    <span className="text-[10px] text-stone-400 block font-normal">{dataStatusLabel}</span>
                  </div>
                </div>
              ) : (
                /* Regular School Prioritized Fields: Board, Grades, Fees, Academic programs, Activities, Facilities, Student support, Transport */
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-stone-700">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-stone-500 uppercase font-semibold block">1. Board</span>
                    <span className="font-bold text-stone-900">
                      {school.curriculum && school.curriculum.length > 0 ? school.curriculum.join(', ') : 'Information not available'}
                    </span>
                    <span className="text-[10px] text-stone-400 block font-normal">{dataStatusLabel}</span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-stone-500 uppercase font-semibold block">2. Grades</span>
                    <span className="font-bold text-stone-900">{school.grades || 'Information not available'}</span>
                    <span className="text-[10px] text-stone-400 block font-normal">{dataStatusLabel}</span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-stone-500 uppercase font-semibold block">3. Fees</span>
                    <span className="font-bold text-stone-900 tabular-nums">
                      {typeof school.annualFeeMin === 'number' && school.annualFeeMin > 0
                        ? `₹${(school.annualFeeMin / 100000).toFixed(1)}L – ${(school.annualFeeMax / 100000).toFixed(1)}L`
                        : 'Information not available'}
                    </span>
                    <span className="text-[10px] text-stone-400 block font-normal">{dataStatusLabel}</span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-stone-500 uppercase font-semibold block">4. Academic Programs</span>
                    <span className="font-bold text-stone-900 truncate block">
                      {school.academicHighlights?.[0] || 'Information not available'}
                    </span>
                    <span className="text-[10px] text-stone-400 block font-normal">{dataStatusLabel}</span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-stone-500 uppercase font-semibold block">5. Activities</span>
                    <span className="font-bold text-stone-900 truncate block">
                      {school.extracurriculars && school.extracurriculars.length > 0
                        ? school.extracurriculars.slice(0, 3).join(', ')
                        : 'Information not available'}
                    </span>
                    <span className="text-[10px] text-stone-400 block font-normal">{dataStatusLabel}</span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-stone-500 uppercase font-semibold block">6. Facilities</span>
                    <span className="font-bold text-stone-900 truncate block">
                      {school.facilities && school.facilities.length > 0
                        ? school.facilities.slice(0, 3).map((f) => f.name).join(', ')
                        : 'Information not available'}
                    </span>
                    <span className="text-[10px] text-stone-400 block font-normal">{dataStatusLabel}</span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-stone-500 uppercase font-semibold block">7. Student Support</span>
                    <span className="font-bold text-stone-900 truncate block">
                      {school.hasSpecialNeedsSupport ? 'Special Needs Resource & IEP' : 'Wellness & Counselling'}
                    </span>
                    <span className="text-[10px] text-stone-400 block font-normal">{dataStatusLabel}</span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-stone-500 uppercase font-semibold block">8. Transport</span>
                    <span className="font-bold text-stone-900">
                      {school.hasTransport
                        ? `Bus Fleet (${school.transportRadiusKm ? `≤${school.transportRadiusKm} km` : 'Transport Available'})`
                        : 'Independent Commute'}
                    </span>
                    <span className="text-[10px] text-stone-400 block font-normal">{dataStatusLabel}</span>
                  </div>
                </div>
              )}
            </div>

            {/* PRIMARY ACTIONS: Plan a visit (Most Prominent), Compare, Save */}
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center gap-2.5">
              
              {/* PRIMARY ACTION 1: Plan a Visit (Prominent bold teal CTA button) */}
              <button
                type="button"
                onClick={() => setIsPlanVisitOpen(true)}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-bold bg-[#0D9488] hover:bg-[#115E59] active:bg-teal-900 text-white flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md hover:shadow-lg ring-2 ring-teal-600/25 min-h-[42px]"
              >
                <Calendar className="w-4 h-4 text-white" />
                <span>Plan a visit</span>
              </button>

              {/* PRIMARY ACTION 2: Compare */}
              <button
                type="button"
                onClick={() => toggleComparison(school.id)}
                className={`w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer min-h-[42px] border ${
                  compared
                    ? 'bg-teal-50 text-teal-900 border-teal-300'
                    : 'bg-white border-stone-200 text-stone-800 hover:bg-stone-50'
                }`}
              >
                <Scale className="w-3.5 h-3.5 text-stone-600" />
                <span>{compared ? 'In Comparison Matrix (✓)' : 'Compare'}</span>
              </button>

              {/* PRIMARY ACTION 3: Save */}
              <button
                type="button"
                onClick={() => toggleSave(school.id)}
                className={`w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer min-h-[42px] border ${
                  saved
                    ? 'bg-amber-50 text-amber-950 border-amber-300'
                    : 'bg-white border-stone-200 text-stone-800 hover:bg-stone-50'
                }`}
              >
                <Bookmark className={`w-3.5 h-3.5 ${saved ? 'fill-amber-600 text-amber-600' : 'text-stone-600'}`} />
                <span>{saved ? 'Saved in Shortlist' : 'Save'}</span>
              </button>

              {/* School Advisor */}
              <button
                type="button"
                onClick={() => onOpenAdvisorWithSchool?.(school.name)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold bg-[#F5F1E8] text-teal-950 border border-teal-200/80 hover:bg-teal-50 flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs min-h-[42px]"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Ask Advisor</span>
              </button>

              {/* Official Prospectus Website */}
              <a
                href={school.website}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-3.5 py-2.5 rounded-xl text-xs font-bold text-stone-600 hover:text-stone-900 hover:bg-stone-100 flex items-center justify-center gap-1.5 transition-colors min-h-[42px]"
              >
                <span>Website</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Photo Gallery Visual (Col 5) */}
          <div className="lg:col-span-5 space-y-2.5">
            <div className="aspect-16/10 rounded-2xl overflow-hidden border border-stone-200 bg-stone-100 relative group shadow-sm">
              {!mainImageError && (school.photos?.[selectedPhotoIndex]?.url || school.photos?.[0]?.url) ? (
                <img
                  src={school.photos?.[selectedPhotoIndex]?.url || school.photos?.[0]?.url || ''}
                  alt={school.photos?.[selectedPhotoIndex]?.caption || school.name}
                  referrerPolicy="no-referrer"
                  onError={() => setMainImageError(true)}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#FAF9F6] to-[#F5F1E8] p-6 text-center">
                  {isEarlyYears ? (
                    <Baby className="w-12 h-12 text-stone-400 mb-2" />
                  ) : (
                    <SchoolIcon className="w-12 h-12 text-stone-400 mb-2" />
                  )}
                  <span className="text-sm font-editorial font-medium text-stone-700 line-clamp-1">{school.name}</span>
                  <span className="text-[11px] text-stone-400 mt-1">Campus photo placeholder</span>
                </div>
              )}
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-stone-950/80 via-stone-900/40 to-transparent p-3.5 text-white pointer-events-none">
                <span className="text-xs font-semibold block font-sans">
                  {school.photos?.[selectedPhotoIndex]?.caption || school.name}
                </span>
                <span className="text-[11px] text-stone-300">
                  {school.photos?.[selectedPhotoIndex]?.category || 'Campus'} · Photo {selectedPhotoIndex + 1} of {school.photos?.length || 1}
                </span>
              </div>
            </div>

            {/* Thumbnail selector */}
            <div className="grid grid-cols-4 gap-2">
              {(school.photos || []).map((photo, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedPhotoIndex(idx)}
                  className={`aspect-16/10 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                    selectedPhotoIndex === idx
                      ? 'border-[#0D9488] ring-2 ring-teal-600/30'
                      : 'border-transparent opacity-75 hover:opacity-100'
                  }`}
                >
                  {!failedThumbnails[idx] && photo.url ? (
                    <img
                      src={photo.url}
                      alt={photo.caption}
                      referrerPolicy="no-referrer"
                      onError={() => setFailedThumbnails((prev) => ({ ...prev, [idx]: true }))}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#FAF9F6] text-stone-400 text-[10px]">
                      {isEarlyYears ? <Baby className="w-4 h-4 text-stone-400" /> : <SchoolIcon className="w-4 h-4 text-stone-400" />}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Sticky Tab Navigation Bar */}
      <div className="sticky top-16 z-30 bg-[#FAF9F6]/95 backdrop-blur-md border-b border-stone-200">
        <div
          role="tablist"
          aria-label="School profile sections"
          className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 flex overflow-x-auto scrollbar-none gap-1 sm:gap-2 py-1.5"
        >
          {[
            ...(isEarlyYears || isCombined ? [{ id: 'programs', label: isEarlyYears ? 'Programs & Timings' : 'Early Years Programs' }] : []),
            { id: 'overview', label: 'Overview & Fit' },
            ...(!isEarlyYears ? [{ id: 'academics', label: 'Academics & Board' }] : []),
            { id: 'fees', label: 'Fee Transparency' },
            { id: 'facilities', label: isEarlyYears ? 'Play & Care Facilities' : 'Campus Facilities' },
            { id: 'admissions', label: 'Admissions 2026' },
            { id: 'neighbourhood', label: 'Commute & Corridor' },
          ].map((tab) => {
            const isCurrent = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isCurrent}
                aria-controls={`panel-${tab.id}`}
                id={`tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id as ProfileTab)}
                className={`py-2.5 px-3.5 sm:px-4 text-xs font-bold whitespace-nowrap rounded-xl transition-all cursor-pointer min-h-[44px] flex items-center shrink-0 ${
                  isCurrent
                    ? 'bg-[#0D9488] text-white shadow-2xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Tab Panels */}
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 mt-6 sm:mt-8 space-y-8">
        
        {/* PROGRAMS TAB (Preschool / Combined) */}
        {activeTab === 'programs' && (
          <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-stone-100 gap-2">
              <div>
                <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">
                  Early Childhood Cohorts
                </span>
                <h3 className="font-editorial text-xl font-bold text-stone-900 mt-1">
                  Programs, Age Groups & Daily Schedule
                </h3>
                <p className="text-xs text-stone-600 mt-0.5 font-sans">
                  Learning approach: {school.pedagogy?.join(' · ') || 'Activity-based & Montessori'} · Caregiver Ratio: {school.childToCaregiverRatio || '1:8'}
                </p>
              </div>

              {school.daycare && (
                <span className="text-xs font-bold text-teal-800 bg-teal-50 px-3 py-1 rounded-full border border-teal-200 self-start sm:self-auto">
                  ✓ Daycare & Nap Pods Available
                </span>
              )}
            </div>

            {/* Programs Table */}
            {school.preschoolProgramDetails && school.preschoolProgramDetails.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#FAF9F6] text-stone-700 uppercase tracking-wider font-bold border-b border-stone-200">
                    <tr>
                      <th className="py-3 px-4">Program</th>
                      <th className="py-3 px-4">Eligible Age</th>
                      <th className="py-3 px-4">Timing</th>
                      <th className="py-3 px-4">Care Ratio</th>
                      <th className="py-3 px-4">Tuition (Approx)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {school.preschoolProgramDetails.map((detail) => (
                      <tr key={detail.program} className="hover:bg-stone-50/60">
                        <td className="py-3.5 px-4 font-bold text-stone-900">
                          {detail.displayName}
                        </td>
                        <td className="py-3.5 px-4 text-stone-700 font-medium">
                          {detail.ageRange}
                        </td>
                        <td className="py-3.5 px-4 text-stone-700">
                          <span className="inline-flex items-center gap-1">
                            <Clock className="w-3 h-3 text-stone-400" />
                            <span>{detail.timings}</span>
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-stone-900">
                          {detail.ratio}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-teal-800 tabular-nums">
                          {detail.annualFee ? `₹${(detail.annualFee / 1000).toFixed(0)}k/yr` : 'Included'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {['playgroup', 'nursery', 'lkg', 'ukg'].map((p) => (
                  <div key={p} className="p-3.5 rounded-xl bg-[#FAF9F6] border border-stone-200 text-xs">
                    <span className="font-bold text-stone-900 uppercase block">{p}</span>
                    <span className="text-[11px] text-stone-500">Contact admissions desk for seat availability.</span>
                  </div>
                ))}
              </div>
            )}

            {/* Childcare & Working Parent Logistics */}
            <div className="p-4 rounded-xl bg-[#F5F1E8] border border-stone-200 space-y-2 text-xs">
              <span className="font-bold text-stone-900 uppercase tracking-wider block">
                Childcare, Meals & Security Specifications
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-stone-700">
                <span className="flex items-center gap-1.5 font-medium">
                  <Check className="w-3.5 h-3.5 text-teal-700 stroke-[3]" />
                  <span>{school.daycare ? 'Afternoon Daycare' : 'Half-Day Only'}</span>
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <Check className="w-3.5 h-3.5 text-teal-700 stroke-[3]" />
                  <span>{school.meals ? 'Fresh Kitchen Meals' : 'Home-Packed Meals'}</span>
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <Check className="w-3.5 h-3.5 text-teal-700 stroke-[3]" />
                  <span>{school.cctvSecurity ? 'Parent App CCTV Access' : 'Internal CCTV'}</span>
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <Check className="w-3.5 h-3.5 text-teal-700 stroke-[3]" />
                  <span>{school.outdoorPlay ? 'Nature Sand/Mud Yard' : 'Indoor Activity Play'}</span>
                </span>
              </div>
            </div>
          </div>
        )}

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-6 sm:space-y-8">
            
            {/* Why This Place Matches Section - Softly Tinted Editorial Panel */}
            <div className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-7 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-stone-100 gap-2">
                <div>
                  <span className="text-[11px] font-bold text-teal-800 uppercase tracking-wider block mb-1">
                    Explainable Matching Analysis
                  </span>
                  <h3 className="font-editorial text-lg sm:text-xl font-bold text-stone-900">
                    Why this institution matches your requirements
                  </h3>
                </div>
                <span className={`text-xs font-bold px-3 py-1 rounded-full border self-start sm:self-auto ${scoreStyle.badge}`}>
                  {school.matchScore}% Match Fit
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(school.matchReasons || []).map((reason) => {
                  const exp = formatMatchReason(reason);
                  return (
                    <div
                      key={reason.id}
                      className={`p-4 rounded-xl border flex items-start gap-3 ${
                        exp.category === 'preference'
                          ? 'border-teal-200/90 bg-teal-50/50 text-teal-950'
                          : exp.category === 'confirmation'
                          ? 'border-amber-200/90 bg-amber-50/50 text-amber-950'
                          : 'border-stone-200 bg-[#FAF9F6] text-stone-900'
                      }`}
                    >
                      {exp.category === 'preference' && (
                        <CheckCircle2 className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                      )}
                      {exp.category === 'confirmation' && (
                        <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                      )}
                      {exp.category === 'fact' && (
                        <Check className="w-4 h-4 text-stone-600 shrink-0 mt-0.5 stroke-[2.5]" />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${exp.tagBadgeClass}`}>
                            {exp.tag}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-stone-900">{exp.title}</h4>
                        <p className="text-xs mt-0.5 opacity-90 leading-relaxed font-sans text-stone-600">
                          {exp.detail}
                        </p>
                        {exp.actionAdvice && (
                          <div className="mt-2 pt-1.5 border-t border-amber-200/70 text-[11px] font-semibold text-amber-950 flex items-center gap-1">
                            <span className="font-bold">Next Step:</span>
                            <span>{exp.actionAdvice}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* School Profile Description & Philosophy */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-7 shadow-xs">
                  <h3 className="font-editorial text-lg font-bold text-stone-900 mb-3">
                    About {school.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-sans">
                    {school.description}
                  </p>

                  <div className="mt-6 pt-5 border-t border-stone-100">
                    <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider mb-2">
                      {isEarlyYears ? 'Pedagogical Philosophy & Learning Environment' : 'Teaching & Pedagogical Philosophy'}
                    </h4>
                    <p className="text-xs sm:text-sm text-stone-700 leading-relaxed italic bg-[#FAF9F6] p-4 rounded-xl border border-stone-200/70 font-sans">
                      "{school.teachingPhilosophy}"
                    </p>
                  </div>
                </div>

                {/* Inclusive Education Support */}
                {school.hasSpecialNeedsSupport && (
                  <div className="bg-white rounded-2xl border border-teal-200/80 bg-teal-50/20 p-6 shadow-xs">
                    <h3 className="font-editorial text-base font-bold text-teal-950 mb-2 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-teal-600" />
                      <span>Inclusive Care & Learning Support</span>
                    </h3>
                    <p className="text-xs sm:text-sm text-teal-900 leading-relaxed font-sans">
                      {school.specialNeedsDescription || 'Dedicated resource rooms and certified remedial facilitators available.'}
                    </p>
                  </div>
                )}
              </div>

              {/* Sidebar Quick Facts */}
              <div className="space-y-4">
                <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-3">
                  <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider pb-2 border-b border-stone-100">
                    {isEarlyYears ? 'Preschool Quick Facts' : 'School Quick Facts'}
                  </h4>

                  <div className="space-y-2 text-xs font-sans">
                    {isEarlyYears ? (
                      <>
                        <div className="flex justify-between py-1 border-b border-stone-50">
                          <span className="text-stone-500">Age Range</span>
                          <span className="font-semibold text-stone-900">
                            {school.ageRange ? `Ages ${school.ageRange.min}–${school.ageRange.max} yrs` : 'Information not available'}
                          </span>
                        </div>

                        <div className="flex justify-between py-1 border-b border-stone-50">
                          <span className="text-stone-500">Programs Offered</span>
                          <span className="font-semibold text-stone-900 text-right">
                            {school.preschoolPrograms && school.preschoolPrograms.length > 0
                              ? school.preschoolPrograms.map((p) => p.toUpperCase()).join(', ')
                              : 'Information not available'}
                          </span>
                        </div>

                        <div className="flex justify-between py-1 border-b border-stone-50">
                          <span className="text-stone-500">Learning Approach</span>
                          <span className="font-semibold text-stone-900 text-right">
                            {school.pedagogy && school.pedagogy.length > 0
                              ? school.pedagogy.join(' · ')
                              : 'Information not available'}
                          </span>
                        </div>

                        <div className="flex justify-between py-1 border-b border-stone-50">
                          <span className="text-stone-500">Annual Fees</span>
                          <span className="font-bold text-stone-900 tabular-nums">
                            {typeof school.annualFeeMin === 'number' && school.annualFeeMin > 0
                              ? `₹${(school.annualFeeMin / 1000).toFixed(0)}k – ₹${(school.annualFeeMax / 1000).toFixed(0)}k/yr`
                              : 'Information not available'}
                          </span>
                        </div>

                        <div className="flex justify-between py-1 border-b border-stone-50">
                          <span className="text-stone-500">Timings</span>
                          <span className="font-semibold text-stone-900">{school.timings || 'Information not available'}</span>
                        </div>

                        <div className="flex justify-between py-1 border-b border-stone-50">
                          <span className="text-stone-500">Daycare & Care</span>
                          <span className="font-semibold text-stone-900">
                            {school.daycare ? (school.extendedHours ? 'Extended (to 6:00 PM)' : 'Available (Afternoon)') : 'Half-day Only'}
                          </span>
                        </div>

                        <div className="flex justify-between py-1 border-b border-stone-50">
                          <span className="text-stone-500">Transport</span>
                          <span className="font-semibold text-stone-900">
                            {school.hasTransport
                              ? `AC Vans (${school.transportRadiusKm ? `up to ${school.transportRadiusKm} km` : 'Transport Available'})`
                              : 'Parent Drop'}
                          </span>
                        </div>

                        <div className="flex justify-between py-1">
                          <span className="text-stone-500">Location</span>
                          <span className="font-semibold text-stone-900">{school.area || 'Information not available'}, Chennai</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex justify-between py-1 border-b border-stone-50">
                          <span className="text-stone-500">Affiliated Board</span>
                          <span className="font-semibold text-stone-900">
                            {school.curriculum && school.curriculum.length > 0
                              ? school.curriculum.join(', ')
                              : 'Information not available'}
                          </span>
                        </div>

                        <div className="flex justify-between py-1 border-b border-stone-50">
                          <span className="text-stone-500">Grades Offered</span>
                          <span className="font-semibold text-stone-900">{school.grades || 'Information not available'}</span>
                        </div>

                        <div className="flex justify-between py-1 border-b border-stone-50">
                          <span className="text-stone-500">Annual Tuition</span>
                          <span className="font-bold text-stone-900 tabular-nums">
                            {typeof school.annualFeeMin === 'number' && school.annualFeeMin > 0
                              ? `₹${(school.annualFeeMin / 100000).toFixed(1)}L – ${(school.annualFeeMax / 100000).toFixed(1)}L/yr`
                              : 'Information not available'}
                          </span>
                        </div>

                        <div className="flex justify-between py-1 border-b border-stone-50">
                          <span className="text-stone-500">Location</span>
                          <span className="font-semibold text-stone-900">{school.area || 'Information not available'}, Chennai</span>
                        </div>

                        <div className="flex justify-between py-1 border-b border-stone-50">
                          <span className="text-stone-500">Campus Facilities</span>
                          <span className="font-semibold text-stone-900 text-right truncate max-w-[140px]">
                            {school.facilities && school.facilities.length > 0
                              ? school.facilities.slice(0, 3).map((f) => f.name).join(', ')
                              : 'Information not available'}
                          </span>
                        </div>

                        <div className="flex justify-between py-1 border-b border-stone-50">
                          <span className="text-stone-500">Student:Teacher</span>
                          <span className="font-semibold text-stone-900 tabular-nums">
                            {school.studentTeacherRatio || 'Information not available'}
                          </span>
                        </div>

                        <div className="flex justify-between py-1">
                          <span className="text-stone-500">Transport Radius</span>
                          <span className="font-semibold text-stone-900 tabular-nums">
                            {school.hasTransport
                              ? `Up to ${school.transportRadiusKm || 15} km`
                              : 'Information not available'}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Direct Contact info */}
                <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-3">
                  <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider pb-2 border-b border-stone-100">
                    Admissions Desk Contacts
                  </h4>
                  <div className="space-y-2.5 text-xs text-stone-700 font-sans">
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-stone-500" />
                      <span>{school.phone || 'Information not available'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-stone-500" />
                      <span>{school.email || 'Information not available'}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="w-3.5 h-3.5 text-stone-500 shrink-0 mt-0.5" />
                      <span>{school.address || 'Information not available'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ACADEMICS TAB (Schools only) */}
        {!isEarlyYears && activeTab === 'academics' && (
          <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="pb-3 border-b border-stone-100">
              <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider">
                Pedagogy & Curriculum
              </span>
              <h3 className="font-editorial text-xl font-bold text-stone-900 mt-1">
                Academic Framework & Board Affiliation
              </h3>
              <p className="text-xs text-stone-600 mt-1 font-sans">
                Accredited boards: {school.curriculum?.join(', ') || 'Independent'} · Average Student-Teacher Cohort: {school.studentTeacherRatio}
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                Scholastic Achievements & Milestones
              </h4>
              <ul className="space-y-2.5">
                {(school.academicHighlights || []).map((highlight, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-stone-700">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* FEES TAB */}
        {activeTab === 'fees' && (
          <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-stone-100 gap-2">
              <div>
                <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">
                  Transparent Fee Breakdown
                </span>
                <h3 className="font-editorial text-xl font-bold text-stone-900 mt-1">
                  Itemized Fee Breakdown
                </h3>
                <p className="text-xs text-stone-600 mt-0.5 font-sans">
                  Fee Source: <strong className="text-stone-800">{school.feeSource || 'Published circular'}</strong> · Status:{' '}
                  <strong className="text-stone-800">{school.dataStatus === 'demo' ? 'Demo data' : school.lastVerifiedAt ? `Last updated: ${school.lastVerifiedAt}` : 'Verified 2025-26'}</strong>
                </p>
              </div>

              <div className="self-start sm:self-auto">
                <VerificationBadge
                  status={school.dataStatus || 'demo'}
                  lastVerifiedAt={school.lastVerifiedAt}
                  verificationSources={school.verificationSources}
                  size="md"
                />
              </div>
            </div>

            {/* Desktop Fee Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#FAF9F6] text-stone-700 uppercase tracking-wider font-bold border-b border-stone-200">
                  <tr>
                    <th className="py-3 px-4">Fee Component</th>
                    <th className="py-3 px-4">Frequency</th>
                    <th className="py-3 px-4">Estimated Amount</th>
                    <th className="py-3 px-4">Notes / Disclosures</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  <tr>
                    <td className="py-3.5 px-4 font-bold text-stone-900">
                      {isEarlyYears ? 'Preschool Tuition & Activity Kit' : 'Tuition & Term Fee'}
                    </td>
                    <td className="py-3.5 px-4 text-stone-600">Annual (Quarterly splits)</td>
                    <td className="py-3.5 px-4 font-bold text-teal-800 tabular-nums">
                      {formatFee(school.annualFeeMin)} – {formatFee(school.annualFeeMax)}
                    </td>
                    <td className="py-3.5 px-4 text-stone-600">Covers sensory materials, classroom guides, and learning kits.</td>
                  </tr>

                  <tr>
                    <td className="py-3.5 px-4 font-bold text-stone-900">One-Time Registration Fee</td>
                    <td className="py-3.5 px-4 text-stone-600">One-Time (Non-refundable)</td>
                    <td className="py-3.5 px-4 font-bold text-stone-900 tabular-nums">
                      {formatFee(school.admissionFee)}
                    </td>
                    <td className="py-3.5 px-4 text-stone-600">Payable upon admission confirmation.</td>
                  </tr>

                  {school.transportFeeMin && (
                    <tr>
                      <td className="py-3.5 px-4 font-bold text-stone-900">Van / Bus Transport</td>
                      <td className="py-3.5 px-4 text-stone-600">Optional / Annual</td>
                      <td className="py-3.5 px-4 font-semibold text-stone-900 tabular-nums">
                        {formatFee(school.transportFeeMin)} – {formatFee(school.transportFeeMax || 0)}
                      </td>
                      <td className="py-3.5 px-4 text-stone-600">Doorstep pickup with female attendants and GPS.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* FACILITIES TAB */}
        {activeTab === 'facilities' && (
          <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="pb-3 border-b border-stone-100">
              <span className="text-[11px] font-bold text-violet-800 uppercase tracking-wider">
                {isEarlyYears ? 'Sensory & Play Infrastructure' : 'Campus Infrastructure & Sporting Facilities'}
              </span>
              <h3 className="font-editorial text-xl font-bold text-stone-900 mt-1">
                {isEarlyYears ? 'Play Areas, Nap Pods & Safety' : 'Campus Infrastructure & Sporting Facilities'}
              </h3>
              <p className="text-xs text-stone-600 mt-1 font-sans">
                Listed on-campus facilities for child growth, gross motor play, and wellness.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(school.facilities || []).map((fac) => {
                const fColor = getFacilityCategoryColor(fac.category, fac.name);
                return (
                  <div
                    key={fac.id}
                    className="p-4 rounded-xl bg-[#FAF9F6] border border-stone-200/80 flex items-start gap-3"
                  >
                    <div className={`w-8 h-8 rounded-lg ${fColor.bg} ${fColor.text} flex items-center justify-center shrink-0 border ${fColor.border}`}>
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-stone-900">{fac.name}</h4>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${fColor.badge}`}>
                          {fac.category}
                        </span>
                      </div>
                      {fac.highlight && (
                        <p className="text-xs text-stone-600 mt-1 leading-relaxed font-sans">
                          {fac.highlight}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ADMISSIONS TAB */}
        {activeTab === 'admissions' && (
          <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-stone-100 gap-2">
              <div>
                <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
                  Timeline & Eligibility
                </span>
                <h3 className="font-editorial text-xl font-bold text-stone-900 mt-1">
                  Admissions Cycle 2026-2027
                </h3>
                <p className="text-xs text-stone-600 mt-0.5 font-sans">
                  Application timelines, minimum age eligibility, and document requirements.
                </p>
              </div>

              <span className={`text-xs font-bold px-3 py-1 rounded-full border self-start sm:self-auto ${
                school.admissionStatus?.includes('Open')
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                  : 'bg-amber-50 text-amber-900 border-amber-200'
              }`}>
                {school.admissionStatus || 'Admissions Enquire'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-[#FAF9F6] border border-stone-200">
                <span className="text-xs font-bold text-stone-900 block mb-1">
                  Application Window
                </span>
                <p className="text-xs text-stone-600 leading-relaxed font-sans">
                  Deadline: <strong className="text-stone-900">{school.admissionDeadline}</strong>
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#FAF9F6] border border-stone-200">
                <span className="text-xs font-bold text-stone-900 block mb-1">
                  Age Cutoff Standard
                </span>
                <p className="text-xs text-stone-600 leading-relaxed font-sans">
                  {isEarlyYears
                    ? 'Playgroup entry from 1.5–2 years; Nursery entry requires completion of 2.5–3 years.'
                    : 'Child must complete 3 years as of July 31, 2026 for Pre-KG / LKG entry.'}
                </p>
              </div>
            </div>

            {/* Things to verify directly with institution */}
            <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-950 space-y-1.5">
              <span className="font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-700" />
                <span>Things to verify during your campus visit:</span>
              </span>
              <ul className="space-y-1 pl-5 list-disc text-stone-700">
                {isEarlyYears ? (
                  <>
                    <li>Confirm whether daycare pickup hours include emergency extension buffers.</li>
                    <li>Inspect diaper-changing and child washroom sanitation first-hand.</li>
                    <li>Ask about caregiver tenure and annual staff turnover in early years classrooms.</li>
                  </>
                ) : (
                  <>
                    <li>Confirm exact morning bus pickup timings at your residential gate.</li>
                    <li>Request the previous 3-year fee escalation record.</li>
                    <li>Check student-to-teacher ratio on primary school floors.</li>
                  </>
                )}
              </ul>
            </div>
          </div>
        )}

        {/* NEIGHBOURHOOD TAB */}
        {activeTab === 'neighbourhood' && (
          <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="pb-3 border-b border-stone-100">
              <span className="text-[11px] font-bold text-teal-800 uppercase tracking-wider">
                Commute Realities
              </span>
              <h3 className="font-editorial text-xl font-bold text-stone-900 mt-1">
                Neighbourhood & Arterial Transit
              </h3>
              <p className="text-xs text-stone-600 mt-1 font-sans">
                Traffic patterns, transit links, and arterial road access around {school.area}.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-[#FAF9F6] border border-stone-200">
                <span className="text-[11px] text-stone-500 font-medium block">Commute Traffic</span>
                <span className="text-sm font-bold text-stone-900">{school.neighbourhood?.trafficIntensity || 'Moderate'}</span>
              </div>

              <div className="p-4 rounded-xl bg-[#FAF9F6] border border-stone-200">
                <span className="text-[11px] text-stone-500 font-medium block">Nearest Transit</span>
                <span className="text-sm font-semibold text-stone-900">{school.neighbourhood?.nearestTransit || 'City transit corridors'}</span>
              </div>

              <div className="p-4 rounded-xl bg-[#FAF9F6] border border-stone-200">
                <span className="text-[11px] text-stone-500 font-medium block">Surrounding Localities</span>
                <span className="text-xs font-semibold text-stone-700">
                  {school.neighbourhood?.neighbouringLocalities?.join(', ') || school.area}
                </span>
              </div>
            </div>

            <div className="p-4 bg-teal-50/50 rounded-xl border border-teal-200/80 text-xs text-teal-950 leading-relaxed font-sans">
              <strong className="text-teal-900 block mb-1">Local Commute Advisory:</strong>
              {school.neighbourhood?.commuteNote || `Convenient access across ${school.area} and adjacent arterial sectors.`}
            </div>
          </div>
        )}

        {/* ========================================================
            "BEFORE YOU DECIDE" DECISION SUPPORT SECTION
            ======================================================== */}
        <section className="bg-white rounded-3xl border border-stone-200/90 p-6 sm:p-9 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-100 gap-2">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F5F1E8] border border-stone-200 text-xs font-bold text-stone-700 mb-1.5">
                <Scale className="w-3.5 h-3.5 text-teal-700" />
                <span>Parent Decision Support</span>
              </div>
              <h3 className="font-editorial text-2xl font-bold text-stone-900">
                Before you decide
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 font-sans mt-0.5">
                A grounded checklist balancing confirmed preferences against what needs on-site confirmation.
              </p>
            </div>

            <VerificationBadge
              status={school.dataStatus || 'demo'}
              lastVerifiedAt={school.lastVerifiedAt}
              verificationSources={school.verificationSources}
              size="md"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* What matches your priorities */}
            <div className="p-5 sm:p-6 rounded-2xl bg-teal-50/50 border border-teal-200/80 space-y-4">
              <div className="flex items-center gap-2 text-teal-950 font-bold text-xs uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4 text-teal-700 shrink-0" />
                <span>What matches your priorities</span>
              </div>

              <ul className="space-y-3.5 text-xs sm:text-sm text-stone-700 font-sans">
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-600 shrink-0 mt-1.5" />
                  <div>
                    <strong className="text-stone-900 block font-semibold">Location fits your preference</strong>
                    <span className="text-stone-600 text-xs">
                      Located in {school.area} ({school.distanceKm} km commute distance), within your Chennai travel radius.
                    </span>
                  </div>
                </li>

                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-600 shrink-0 mt-1.5" />
                  <div>
                    <strong className="text-stone-900 block font-semibold">Fee is within your stated budget</strong>
                    <span className="text-stone-600 text-xs">
                      Annual tuition of ₹{(school.annualFeeMin / 100000).toFixed(1)}L – ₹{(school.annualFeeMax / 100000).toFixed(1)}L aligns with your target fee threshold.
                    </span>
                  </div>
                </li>

                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-600 shrink-0 mt-1.5" />
                  <div>
                    <strong className="text-stone-900 block font-semibold">Offers the requested program</strong>
                    <span className="text-stone-600 text-xs">
                      {isEarlyYears
                        ? `Offers dedicated early years programs (${school.preschoolPrograms?.map((p) => p.toUpperCase()).join(', ') || 'Playgroup, Nursery, LKG, UKG'}) with ${school.pedagogy?.join(' & ') || 'Montessori'} approach.`
                        : `Provides ${school.curriculum?.join(', ') || 'CBSE'} board curriculum covering ${school.grades}.`}
                    </span>
                  </div>
                </li>

                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-600 shrink-0 mt-1.5" />
                  <div>
                    <strong className="text-stone-900 block font-semibold">Relevant facility available</strong>
                    <span className="text-stone-600 text-xs">
                      {isEarlyYears
                        ? `${school.daycare ? 'Afternoon daycare nap pods' : 'Active play bays'}, ${school.outdoorPlay ? 'shaded outdoor play yard' : 'activity space'}, and CCTV monitoring.`
                        : `${(school.facilities || []).slice(0, 3).map((f) => f.name).join(', ')} available on site.`}
                    </span>
                  </div>
                </li>
              </ul>
            </div>

            {/* Things to confirm */}
            <div className="p-5 sm:p-6 rounded-2xl bg-amber-50/50 border border-amber-200/80 space-y-4">
              <div className="flex items-center gap-2 text-amber-950 font-bold text-xs uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                <span>Things to confirm</span>
              </div>

              <ul className="space-y-3.5 text-xs sm:text-sm text-stone-700 font-sans">
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-600 shrink-0 mt-1.5" />
                  <div>
                    <strong className="text-stone-900 block font-semibold">Current fee</strong>
                    <span className="text-stone-600 text-xs">
                      Confirm official 2026-27 fee structure including books, uniforms, admission deposits, and optional daycare charges.
                    </span>
                  </div>
                </li>

                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-600 shrink-0 mt-1.5" />
                  <div>
                    <strong className="text-stone-900 block font-semibold">Seat availability</strong>
                    <span className="text-stone-600 text-xs">
                      Ask admissions coordinator if seats are currently open for your child's age group or grade before applying.
                    </span>
                  </div>
                </li>

                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-600 shrink-0 mt-1.5" />
                  <div>
                    <strong className="text-stone-900 block font-semibold">Admission timeline</strong>
                    <span className="text-stone-600 text-xs">
                      Verify application deadlines ({school.admissionDeadline}) and assessment/interaction windows.
                    </span>
                  </div>
                </li>

                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-600 shrink-0 mt-1.5" />
                  <div>
                    <strong className="text-stone-900 block font-semibold">Transport availability</strong>
                    <span className="text-stone-600 text-xs">
                      Confirm whether bus/van pickup routes reach your specific residential sector and check attendant coverage.
                    </span>
                  </div>
                </li>

                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-600 shrink-0 mt-1.5" />
                  <div>
                    <strong className="text-stone-900 block font-semibold">Exact timings</strong>
                    <span className="text-stone-600 text-xs">
                      Check exact morning arrival and afternoon dismissal hours ({school.timings || '8:30 AM – 1:30 PM'}), plus daycare extension buffers.
                    </span>
                  </div>
                </li>

                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-600 shrink-0 mt-1.5" />
                  <div>
                    <strong className="text-stone-900 block font-semibold">Any preference that comes from demo/unverified data</strong>
                    <span className="text-stone-600 text-xs">
                      {school.dataStatus === 'demo'
                        ? 'Fee and ratio figures are illustrative prototype data. Inspect campus facilities and staff qualifications directly on site.'
                        : school.dataStatus === 'partially_verified'
                        ? 'Transport routes and optional activity fees await 2026 circular verification. Verify with admissions desk.'
                        : 'Review child-to-caregiver ratios and staff turnover directly with the administration during your visit.'}
                    </span>
                  </div>
                </li>
              </ul>
            </div>

          </div>

          {/* Action callout connecting confirmation directly to Plan a Visit */}
          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FAF9F6] p-4 rounded-2xl border border-stone-200">
            <div className="text-xs text-stone-700">
              <strong className="text-stone-900 block font-semibold">Ready to confirm these details on site?</strong>
              <span>Schedule a campus walk-through or speak directly with admissions coordinators.</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsPlanVisitOpen(true)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#0D9488] hover:bg-[#115E59] text-white flex items-center gap-2 transition-all cursor-pointer shadow-sm min-h-[40px]"
              >
                <Calendar className="w-4 h-4 text-white" />
                <span>Plan a visit</span>
              </button>
            </div>
          </div>
        </section>

        {/* ========================================================
            "OTHER PLACES YOU MAY WANT TO COMPARE" (SIMILAR INSTITUTIONS)
            ======================================================== */}
        <section className="bg-white rounded-3xl border border-stone-200/90 p-6 sm:p-9 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-stone-100 gap-2">
            <div>
              <span className="text-[11px] font-bold text-teal-800 uppercase tracking-wider block mb-1">
                Comparative Discovery
              </span>
              <h3 className="font-editorial text-2xl font-bold text-stone-900">
                Other places you may want to compare
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 font-sans mt-0.5">
                Similar to your search and matches your priorities. Also worth considering for your child.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {similarInstitutions.map((item, idx) => {
              const badgeLabel = idx === 0
                ? 'Matches your priorities'
                : idx === 1
                ? 'Also worth considering'
                : 'Similar to your search';

              return (
              <div
                key={item.id}
                className="p-5 rounded-2xl bg-[#FAF9F6] border border-stone-200 hover:border-stone-300 transition-all flex flex-col justify-between space-y-4 group shadow-2xs hover:shadow-xs"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-50 text-teal-900 border border-teal-200">
                      {badgeLabel}
                    </span>
                    <span className="text-xs font-bold text-teal-800 tabular-nums">
                      {item.matchScore}% Fit
                    </span>
                  </div>

                  <h4 className="font-editorial font-bold text-base text-stone-900 group-hover:text-teal-800 transition-colors">
                    {item.name}
                  </h4>

                  <p className="text-xs text-stone-600 font-sans line-clamp-2">
                    {item.tagline}
                  </p>

                  <div className="pt-2 text-xs space-y-1 text-stone-700 font-sans border-t border-stone-200/70">
                    <div className="flex justify-between">
                      <span className="text-stone-500">Location</span>
                      <span className="font-medium text-stone-900">{item.area} ({item.distanceKm} km)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500">{item.institutionType === 'preschool' ? 'Approach' : 'Board'}</span>
                      <span className="font-medium text-stone-900">
                        {item.institutionType === 'preschool'
                          ? item.pedagogy?.[0] || 'Montessori'
                          : item.curriculum?.[0] || 'CBSE'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500">Fee Approx</span>
                      <span className="font-bold text-stone-900 tabular-nums">
                        ₹{(item.annualFeeMin / 100000).toFixed(1)}L/yr
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-2 border-t border-stone-200/70">
                  <Link
                    to={`/school/${item.slug}`}
                    className="flex-1 py-2 text-center rounded-xl bg-white hover:bg-stone-50 text-stone-900 text-xs font-bold border border-stone-200 transition-colors shadow-2xs"
                  >
                    View profile
                  </Link>
                  <button
                    type="button"
                    onClick={() => toggleComparison(item.id)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                      isComparing(item.id)
                        ? 'bg-teal-50 text-teal-900 border-teal-300'
                        : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    {isComparing(item.id) ? 'Comparing ✓' : 'Compare'}
                  </button>
                </div>
              </div>
            );
            })}
          </div>
        </section>

      </div>

      {/* ========================================================
          PLAN A VISIT INTERACTIVE MODAL
          ======================================================== */}
      {isPlanVisitOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="plan-visit-title"
            className="bg-white rounded-3xl border border-stone-200 shadow-2xl max-w-lg w-full p-6 sm:p-7 space-y-5 animate-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-800 flex items-center justify-center border border-teal-200">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h3 id="plan-visit-title" className="font-editorial text-lg font-bold text-stone-900">
                    Plan a Campus Visit
                  </h3>
                  <span className="text-[11px] text-stone-500 block truncate max-w-xs sm:max-w-sm">
                    {school.name}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPlanVisitOpen(false)}
                className="min-h-[44px] min-w-[44px] p-2 rounded-lg flex items-center justify-center text-stone-400 hover:text-stone-700 hover:bg-stone-100 cursor-pointer transition-colors"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Visit Coordination Contacts */}
            <div className="p-3.5 rounded-2xl bg-[#FAF9F6] border border-stone-200 space-y-2 text-xs">
              <span className="text-[11px] font-bold text-stone-700 uppercase tracking-wider block">
                Admissions Desk Visit Hours
              </span>
              <p className="text-stone-600 font-sans">
                Visits are typically hosted on weekdays between <strong>9:00 AM – 1:00 PM</strong> by appointment.
              </p>
              <div className="pt-1 flex flex-wrap gap-3 text-stone-800 font-medium">
                <a href={`tel:${school.phone}`} className="inline-flex items-center gap-1.5 hover:text-teal-800 font-bold">
                  <Phone className="w-3.5 h-3.5 text-teal-700" />
                  <span>{school.phone}</span>
                </a>
                <a href={`mailto:${school.email}`} className="inline-flex items-center gap-1.5 hover:text-teal-800 font-bold">
                  <Mail className="w-3.5 h-3.5 text-teal-700" />
                  <span>{school.email}</span>
                </a>
              </div>
            </div>

            {/* Checklist of What to Inspect */}
            <div className="space-y-2 text-xs">
              <span className="font-bold text-stone-900 uppercase tracking-wider block">
                Key Items to Verify During Your Visit
              </span>
              <ul className="space-y-2 pl-4 list-disc text-stone-700 font-sans">
                <li>
                  <strong>Classroom dynamics:</strong> Observe active student-teacher interaction and lighting/ventilation.
                </li>
                <li>
                  <strong>Restroom sanitation:</strong> Inspect toddler or primary school child washrooms first-hand.
                </li>
                <li>
                  <strong>Fee schedule:</strong> Request the official published circular for the 2026-27 session.
                </li>
                <li>
                  <strong>Transport route:</strong> Confirm bus/van stoppage timing at your apartment gate.
                </li>
              </ul>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setIsPlanVisitOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:text-stone-900 cursor-pointer"
              >
                Close
              </button>
              <a
                href={`tel:${school.phone}`}
                className="px-5 py-2.5 bg-[#0D9488] hover:bg-[#115E59] text-white rounded-xl text-xs font-bold transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Admissions Desk</span>
              </a>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
