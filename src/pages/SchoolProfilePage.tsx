import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
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
  Check
} from 'lucide-react';
import { CHENNAI_SCHOOLS } from '../data/schools';
import { useComparison } from '../context/ComparisonContext';
import { useShortlist } from '../context/ShortlistContext';
import { getCurriculumColor, getFacilityCategoryColor, getMatchScoreStyle, getPedagogyColor } from '../utils/categoryColors';
import { VerificationBadge } from '../components/common/VerificationBadge';
import { formatMatchReason } from '../utils/matchProvenance';

type ProfileTab = 'overview' | 'programs' | 'academics' | 'fees' | 'facilities' | 'admissions' | 'neighbourhood';

interface SchoolProfilePageProps {
  onOpenAdvisorWithSchool?: (schoolName: string) => void;
}

export const SchoolProfilePage: React.FC<SchoolProfilePageProps> = ({ onOpenAdvisorWithSchool }) => {
  const { slug } = useParams<{ slug: string }>();
  const { toggleComparison, isComparing } = useComparison();
  const { toggleSave, isSaved } = useShortlist();

  const school = CHENNAI_SCHOOLS.find((s) => s.slug === slug);

  const isEarlyYears = school?.institutionType === 'preschool';
  const isCombined = school?.institutionType === 'combined';

  const [activeTab, setActiveTab] = useState<ProfileTab>(isEarlyYears ? 'programs' : 'overview');
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!school) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] py-24 px-4 text-center">
        <div className="max-w-md mx-auto bg-white p-8 rounded-2xl border border-stone-200 shadow-sm">
          <h2 className="font-editorial text-2xl font-bold text-stone-900 mb-2">Institution Not Listed</h2>
          <p className="text-xs text-stone-600 mb-6">
            The school or preschool you are looking for is either unlisted or may have been updated in our 2026 directory.
          </p>
          <Link
            to="/results"
            className="px-5 py-2.5 bg-[#0D9488] text-white rounded-xl text-xs font-bold hover:bg-[#115E59] transition-colors"
          >
            Back to Directory
          </Link>
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

  const formatFee = (amount: number) => {
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} Lakh`;
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] pb-24 text-stone-900">
      
      {/* Top Breadcrumb & Quick Actions Bar */}
      <div className="bg-white border-b border-stone-200/90 py-3.5 px-3.5 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <Link
            to="/results"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-teal-900 transition-colors shrink-0 py-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to discovery</span>
          </Link>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-200 text-xs font-semibold text-stone-700 hover:bg-[#FAF9F6] transition-colors cursor-pointer min-h-[38px]"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{copiedLink ? 'Copied' : 'Share'}</span>
            </button>

            <button
              type="button"
              onClick={() => toggleSave(school.id)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer min-h-[38px] ${
                saved
                  ? 'bg-amber-500 text-white shadow-2xs hover:bg-amber-600'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${saved ? 'fill-current' : ''}`} />
              <span>
                {saved ? 'Saved in Shortlist' : 'Save to Shortlist'}
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
                    Preschool & Playschool
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

            {/* Quick Metrics Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
              <div className="p-3 rounded-xl bg-[#FAF9F6] border border-stone-200/80">
                <span className="text-[11px] text-stone-500 font-medium block">Fit with Priorities</span>
                <span className={`font-bold text-sm sm:text-base tabular-nums ${scoreStyle.textColor}`}>
                  {school.matchScore}% Fit
                </span>
                <span className="text-[10px] text-stone-500 block">{scoreStyle.tier}</span>
              </div>

              <div className="p-3 rounded-xl bg-[#FAF9F6] border border-stone-200/80">
                <span className="text-[11px] text-stone-500 font-medium block">
                  {isEarlyYears ? 'Annual Fee' : 'Est. Annual Tuition'}
                </span>
                <span className="font-bold text-stone-900 text-sm sm:text-base tabular-nums">
                  ₹{(school.annualFeeMin / 100000).toFixed(1)}L – {(school.annualFeeMax / 100000).toFixed(1)}L
                </span>
                <span className="text-[10px] text-stone-500 block">{isEarlyYears ? 'Program specific' : 'Grade specific'}</span>
              </div>

              <div className="p-3 rounded-xl bg-[#FAF9F6] border border-stone-200/80">
                <span className="text-[11px] text-stone-500 font-medium block">
                  {isEarlyYears ? 'Caregiver Ratio' : 'Student:Teacher'}
                </span>
                <span className="font-bold text-stone-900 text-sm sm:text-base tabular-nums">
                  {school.childToCaregiverRatio || school.studentTeacherRatio}
                </span>
                <span className="text-[10px] text-stone-500 block">Reported cohort</span>
              </div>

              <div className="p-3 rounded-xl bg-[#FAF9F6] border border-stone-200/80">
                <span className="text-[11px] text-stone-500 font-medium block">Commute Radius</span>
                <span className="font-bold text-stone-900 text-sm sm:text-base tabular-nums">
                  {school.distanceKm} km
                </span>
                <span className="text-[10px] text-stone-600 font-medium block">Transport info available</span>
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-3 flex flex-col sm:flex-row sm:items-center gap-2.5">
              <button
                type="button"
                onClick={() => toggleComparison(school.id)}
                className={`w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer min-h-[42px] ${
                  compared
                    ? 'bg-teal-50 text-teal-900 border border-teal-300'
                    : 'bg-white border border-stone-200 text-stone-800 hover:bg-stone-50'
                }`}
              >
                <Scale className="w-3.5 h-3.5" />
                <span>{compared ? 'In Comparison Matrix (✓)' : 'Compare Institution'}</span>
              </button>

              <button
                type="button"
                onClick={() => onOpenAdvisorWithSchool?.(school.name)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold bg-[#F5F1E8] text-teal-950 border border-teal-200/80 hover:bg-teal-50 flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs min-h-[42px]"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Ask Advisor About This Place</span>
              </button>

              <a
                href={school.website}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold text-stone-600 hover:text-stone-900 hover:bg-stone-100 flex items-center justify-center gap-1.5 transition-colors min-h-[42px]"
              >
                <span>Official Prospectus</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Photo Gallery Visual (Col 5) */}
          <div className="lg:col-span-5 space-y-2.5">
            <div className="aspect-16/10 rounded-2xl overflow-hidden border border-stone-200 bg-stone-100 relative group shadow-sm">
              <img
                src={school.photos?.[selectedPhotoIndex]?.url || school.photos?.[0]?.url || ''}
                alt={school.photos?.[selectedPhotoIndex]?.caption || school.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
              />
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-stone-950/80 via-stone-900/40 to-transparent p-3.5 text-white">
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
                  <img src={photo.url} alt={photo.caption} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Sticky Tab Navigation Bar */}
      <div className="sticky top-16 z-30 bg-[#FAF9F6]/95 backdrop-blur-md border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 flex overflow-x-auto scrollbar-none gap-1 sm:gap-2 py-1.5">
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
                onClick={() => setActiveTab(tab.id as ProfileTab)}
                className={`py-2.5 px-3.5 sm:px-4 text-xs font-bold whitespace-nowrap rounded-xl transition-all cursor-pointer min-h-[42px] flex items-center shrink-0 ${
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

      {/* Tab Panels */}
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 mt-6 sm:mt-8">
        
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
                    <span className="text-[11px] text-stone-500">Contact school for exact timings and seat availability.</span>
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
                            {school.ageRange ? `Ages ${school.ageRange.min}–${school.ageRange.max} yrs` : '1.5–6 yrs'}
                          </span>
                        </div>

                        <div className="flex justify-between py-1 border-b border-stone-50">
                          <span className="text-stone-500">Programs Offered</span>
                          <span className="font-semibold text-stone-900 text-right">
                            {school.preschoolPrograms?.map((p) => p.toUpperCase()).join(', ') || 'Playgroup, Nursery, LKG, UKG'}
                          </span>
                        </div>

                        <div className="flex justify-between py-1 border-b border-stone-50">
                          <span className="text-stone-500">Learning Approach</span>
                          <span className="font-semibold text-stone-900 text-right">
                            {school.pedagogy?.join(' · ') || 'Play-way & Montessori'}
                          </span>
                        </div>

                        <div className="flex justify-between py-1 border-b border-stone-50">
                          <span className="text-stone-500">Annual Fees</span>
                          <span className="font-bold text-stone-900 tabular-nums">
                            ₹{(school.annualFeeMin / 1000).toFixed(0)}k – ₹{(school.annualFeeMax / 1000).toFixed(0)}k/yr
                          </span>
                        </div>

                        <div className="flex justify-between py-1 border-b border-stone-50">
                          <span className="text-stone-500">Timings</span>
                          <span className="font-semibold text-stone-900">{school.timings || '8:30 AM – 1:30 PM'}</span>
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
                            {school.hasTransport ? `AC Vans (up to ${school.transportRadiusKm} km)` : 'Parent Drop'}
                          </span>
                        </div>

                        <div className="flex justify-between py-1">
                          <span className="text-stone-500">Location</span>
                          <span className="font-semibold text-stone-900">{school.area}, Chennai</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex justify-between py-1 border-b border-stone-50">
                          <span className="text-stone-500">Affiliated Board</span>
                          <span className="font-semibold text-stone-900">{school.curriculum?.join(', ') || 'Independent / State Recognized'}</span>
                        </div>

                        <div className="flex justify-between py-1 border-b border-stone-50">
                          <span className="text-stone-500">Grades Offered</span>
                          <span className="font-semibold text-stone-900">{school.grades}</span>
                        </div>

                        <div className="flex justify-between py-1 border-b border-stone-50">
                          <span className="text-stone-500">Annual Tuition</span>
                          <span className="font-bold text-stone-900 tabular-nums">
                            ₹{(school.annualFeeMin / 100000).toFixed(1)}L – {(school.annualFeeMax / 100000).toFixed(1)}L/yr
                          </span>
                        </div>

                        <div className="flex justify-between py-1 border-b border-stone-50">
                          <span className="text-stone-500">Location</span>
                          <span className="font-semibold text-stone-900">{school.area}, Chennai</span>
                        </div>

                        <div className="flex justify-between py-1 border-b border-stone-50">
                          <span className="text-stone-500">Campus Facilities</span>
                          <span className="font-semibold text-stone-900 text-right truncate max-w-[140px]">
                            {(school.facilities || []).slice(0, 3).map((f) => f.name).join(', ')}
                          </span>
                        </div>

                        <div className="flex justify-between py-1 border-b border-stone-50">
                          <span className="text-stone-500">Student:Teacher</span>
                          <span className="font-semibold text-stone-900 tabular-nums">{school.studentTeacherRatio}</span>
                        </div>

                        <div className="flex justify-between py-1">
                          <span className="text-stone-500">Transport Radius</span>
                          <span className="font-semibold text-stone-900 tabular-nums">Up to {school.transportRadiusKm} km</span>
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
                      <span>{school.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-stone-500" />
                      <span>{school.email}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="w-3.5 h-3.5 text-stone-500 shrink-0 mt-0.5" />
                      <span>{school.address}</span>
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
                  Source: {school.feeSource || 'Prototype demonstration profile'} · Provenance: {school.dataStatus ? school.dataStatus.replace('_', ' ') : 'demo data'}
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
      </div>
    </div>
  );
};
