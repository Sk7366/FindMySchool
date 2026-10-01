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
  Calendar,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Bus,
  Sparkles,
  ChevronRight,
  Info,
  Clock,
  ArrowLeft,
  Share2,
  Check,
  Building,
  GraduationCap,
  Waves,
  Cpu,
  Trophy,
  BookOpen
} from 'lucide-react';
import { CHENNAI_SCHOOLS } from '../data/schools';
import { useComparison } from '../context/ComparisonContext';
import { useShortlist } from '../context/ShortlistContext';
import { useSearch } from '../context/SearchContext';
import { getCurriculumColor, getFacilityCategoryColor, getMatchScoreStyle } from '../utils/categoryColors';

type ProfileTab = 'overview' | 'academics' | 'fees' | 'facilities' | 'admissions' | 'neighbourhood';

interface SchoolProfilePageProps {
  onOpenAdvisorWithSchool?: (schoolName: string) => void;
}

export const SchoolProfilePage: React.FC<SchoolProfilePageProps> = ({ onOpenAdvisorWithSchool }) => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { toggleComparison, isComparing } = useComparison();
  const { toggleSave, isSaved } = useShortlist();
  const { searchState } = useSearch();

  const [activeTab, setActiveTab] = useState<ProfileTab>('overview');
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);

  const school = CHENNAI_SCHOOLS.find((s) => s.slug === slug);

  if (!school) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] py-24 px-4 text-center">
        <div className="max-w-md mx-auto bg-white p-8 rounded-2xl border border-stone-200 shadow-sm">
          <h2 className="font-editorial text-2xl font-bold text-stone-900 mb-2">School Not Listed</h2>
          <p className="text-xs text-stone-600 mb-6">
            The school you are looking for is either unlisted or may have been updated in our 2026 directory.
          </p>
          <Link
            to="/results"
            className="px-5 py-2.5 bg-[#0D9488] text-white rounded-xl text-xs font-bold hover:bg-[#115E59] transition-colors"
          >
            Back to School Results
          </Link>
        </div>
      </div>
    );
  }

  const compared = isComparing(school.id);
  const saved = isSaved(school.id);

  const primaryBoard = school.curriculum[0] || 'CBSE';
  const boardColor = getCurriculumColor(primaryBoard);
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
            <span>Back to results</span>
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
                {saved ? 'Saved in Shortlist' : 'Save School'}
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
            
            {/* Semantic Board Badges & Accents */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {school.curriculum.map((c) => {
                const cColor = getCurriculumColor(c);
                return (
                  <span key={c} className={`font-bold px-2.5 py-0.5 rounded-md text-[11px] border ${cColor.badge}`}>
                    {c}
                  </span>
                );
              })}
              <span className="text-stone-400">·</span>
              <span className="font-semibold text-stone-600">{school.grades}</span>
              <span className="text-stone-400">·</span>
              <span className="text-stone-600">Est. {school.establishedYear}</span>
              <span className="text-stone-400">·</span>
              <span className="flex items-center gap-1 text-stone-700 font-medium">
                <MapPin className="w-3.5 h-3.5 text-stone-400" />
                <span>{school.area}, Chennai</span>
              </span>
            </div>

            <h1 className="font-editorial text-2xl xs:text-3xl sm:text-4xl lg:text-5xl text-stone-900 tracking-tight leading-tight">
              {school.name}
            </h1>

            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-sans max-w-2xl">
              {school.tagline}
            </p>

            {/* Quick Metrics Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
              <div className="p-3 rounded-xl bg-[#FAF9F6] border border-stone-200/80">
                <span className="text-[11px] text-stone-500 font-medium block">Match Score</span>
                <span className={`font-bold text-sm sm:text-base tabular-nums ${scoreStyle.textColor}`}>
                  {school.matchScore}% Fit
                </span>
                <span className="text-[10px] text-stone-500 block">{school.matchTier}</span>
              </div>

              <div className="p-3 rounded-xl bg-[#FAF9F6] border border-stone-200/80">
                <span className="text-[11px] text-stone-500 font-medium block">Est. Annual Tuition</span>
                <span className="font-bold text-stone-900 text-sm sm:text-base tabular-nums">
                  ₹{(school.annualFeeMin / 100000).toFixed(1)}L – {(school.annualFeeMax / 100000).toFixed(1)}L
                </span>
                <span className="text-[10px] text-stone-500 block">Grade specific</span>
              </div>

              <div className="p-3 rounded-xl bg-[#FAF9F6] border border-stone-200/80">
                <span className="text-[11px] text-stone-500 font-medium block">Student:Teacher</span>
                <span className="font-bold text-stone-900 text-sm sm:text-base tabular-nums">
                  {school.studentTeacherRatio}
                </span>
                <span className="text-[10px] text-stone-500 block">Audited ratio</span>
              </div>

              <div className="p-3 rounded-xl bg-[#FAF9F6] border border-stone-200/80">
                <span className="text-[11px] text-stone-500 font-medium block">Commute Radius</span>
                <span className="font-bold text-stone-900 text-sm sm:text-base tabular-nums">
                  {school.distanceKm} km
                </span>
                <span className="text-[10px] text-teal-800 font-semibold block">Bus fleet verified</span>
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
                <span>{compared ? 'In Comparison Matrix (✓)' : 'Compare School'}</span>
              </button>

              <button
                type="button"
                onClick={() => onOpenAdvisorWithSchool?.(school.name)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold bg-[#F5F1E8] text-teal-950 border border-teal-200/80 hover:bg-teal-50 flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs min-h-[42px]"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Ask Advisor About This School</span>
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
                src={school.photos[selectedPhotoIndex]?.url || school.photos[0]?.url}
                alt={school.photos[selectedPhotoIndex]?.caption || school.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
              />
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-stone-950/80 via-stone-900/40 to-transparent p-3.5 text-white">
                <span className="text-xs font-semibold block font-sans">
                  {school.photos[selectedPhotoIndex]?.caption}
                </span>
                <span className="text-[11px] text-stone-300">
                  {school.photos[selectedPhotoIndex]?.category} · Photo {selectedPhotoIndex + 1} of {school.photos.length}
                </span>
              </div>
            </div>

            {/* Thumbnail selector */}
            <div className="grid grid-cols-4 gap-2">
              {school.photos.map((photo, idx) => (
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
            { id: 'overview', label: 'Overview' },
            { id: 'academics', label: 'Academics & Board' },
            { id: 'fees', label: 'Fee Transparency' },
            { id: 'facilities', label: 'Campus Facilities' },
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
        
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-6 sm:space-y-8">
            
            {/* Why This School Matches Section - Softly Tinted Editorial Panel */}
            <div className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-7 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-stone-100 gap-2">
                <div>
                  <span className="text-[11px] font-bold text-teal-800 uppercase tracking-wider block mb-1">
                    Explainable Matching Analysis
                  </span>
                  <h3 className="font-editorial text-lg sm:text-xl font-bold text-stone-900">
                    Why this school fits your family requirements
                  </h3>
                </div>
                <span className={`text-xs font-bold px-3 py-1 rounded-full border self-start sm:self-auto ${scoreStyle.badge}`}>
                  {school.matchScore}% Match Fit
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {school.matchReasons.map((reason) => (
                  <div
                    key={reason.id}
                    className={`p-4 rounded-xl border flex items-start gap-3 ${
                      reason.type === 'positive'
                        ? 'border-teal-200/90 bg-teal-50/50 text-teal-950'
                        : reason.type === 'partial'
                        ? 'border-amber-200/90 bg-amber-50/50 text-amber-950'
                        : 'border-stone-200 bg-[#FAF9F6] text-stone-900'
                    }`}
                  >
                    {reason.type === 'positive' && (
                      <CheckCircle2 className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                    )}
                    {reason.type === 'partial' && (
                      <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    )}
                    {reason.type === 'unverified' && (
                      <HelpCircle className="w-4 h-4 text-stone-500 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <h4 className="text-xs font-bold">{reason.title}</h4>
                      <p className="text-xs mt-0.5 opacity-90 leading-relaxed font-sans">
                        {reason.description}
                      </p>
                    </div>
                  </div>
                ))}
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
                      Teaching & Pedagogical Philosophy
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
                      <span>Inclusive Education & Learning Support (SEN)</span>
                    </h3>
                    <p className="text-xs sm:text-sm text-teal-900 leading-relaxed font-sans">
                      {school.specialNeedsDescription || 'Dedicated resource rooms and certified remedial facilitators available for mild learning variations.'}
                    </p>
                  </div>
                )}
              </div>

              {/* Sidebar Quick Facts */}
              <div className="space-y-4">
                <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-3">
                  <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider pb-2 border-b border-stone-100">
                    Key School Disclosures
                  </h4>

                  <div className="space-y-2 text-xs font-sans">
                    <div className="flex justify-between py-1 border-b border-stone-50">
                      <span className="text-stone-500">Audit Status</span>
                      <span className="font-bold text-teal-800">{school.verificationStatus}</span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-stone-50">
                      <span className="text-stone-500">Established Year</span>
                      <span className="font-bold text-stone-900 tabular-nums">{school.establishedYear}</span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-stone-50">
                      <span className="text-stone-500">School Type</span>
                      <span className="font-semibold text-stone-900">{school.schoolType.join(', ')}</span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-stone-50">
                      <span className="text-stone-500">Bus Radius</span>
                      <span className="font-semibold text-stone-900 tabular-nums">Up to {school.transportRadiusKm} km</span>
                    </div>

                    <div className="flex justify-between py-1">
                      <span className="text-stone-500">Boarding Facility</span>
                      <span className="font-semibold text-stone-900">{school.hasHostel ? 'Available' : 'Day School Only'}</span>
                    </div>
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

        {/* ACADEMICS TAB */}
        {activeTab === 'academics' && (
          <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="pb-3 border-b border-stone-100">
              <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider">
                Pedagogy & Curriculum
              </span>
              <h3 className="font-editorial text-xl font-bold text-stone-900 mt-1">
                Academic Framework & Board Affiliation
              </h3>
              <p className="text-xs text-stone-600 mt-1 font-sans">
                Accredited boards: {school.curriculum.join(', ')} · Average Student-Teacher Cohort: {school.studentTeacherRatio}
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                Scholastic Achievements & Milestones
              </h4>
              <ul className="space-y-2.5">
                {school.academicHighlights.map((highlight, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-stone-700">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-4 border-t border-stone-100">
              <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider mb-2.5">
                Extracurricular Enrichment & Activity Clubs
              </h4>
              <div className="flex flex-wrap gap-2">
                {school.extracurriculars.map((activity) => (
                  <span
                    key={activity}
                    className="bg-[#F5F1E8] text-stone-800 font-semibold px-3 py-1 rounded-lg text-xs border border-stone-200"
                  >
                    {activity}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* FEES TAB */}
        {activeTab === 'fees' && (
          <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-stone-100 gap-2">
              <div>
                <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">
                  Transparent Cost Audit
                </span>
                <h3 className="font-editorial text-xl font-bold text-stone-900 mt-1">
                  Itemized Fee Breakdown
                </h3>
                <p className="text-xs text-stone-600 mt-0.5 font-sans">
                  Source: {school.feeSource} · Last audited {school.lastAuditedDate}
                </p>
              </div>

              <div className="text-xs text-teal-800 font-bold bg-teal-50 px-3 py-1 rounded-full border border-teal-200 self-start sm:self-auto">
                Verified with Parent Receipts
              </div>
            </div>

            {/* Desktop Fee Table */}
            <div className="hidden sm:block overflow-x-auto">
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
                    <td className="py-3.5 px-4 font-bold text-stone-900">Tuition & Term Fee</td>
                    <td className="py-3.5 px-4 text-stone-600">Annual (Quarterly splits)</td>
                    <td className="py-3.5 px-4 font-bold text-teal-800 tabular-nums">
                      {formatFee(school.annualFeeMin)} – {formatFee(school.annualFeeMax)}
                    </td>
                    <td className="py-3.5 px-4 text-stone-600">Covers core academics, laboratory access, and library.</td>
                  </tr>

                  <tr>
                    <td className="py-3.5 px-4 font-bold text-stone-900">One-Time Admission Fee</td>
                    <td className="py-3.5 px-4 text-stone-600">One-Time (Non-refundable)</td>
                    <td className="py-3.5 px-4 font-bold text-stone-900 tabular-nums">
                      {formatFee(school.admissionFee)}
                    </td>
                    <td className="py-3.5 px-4 text-stone-600">Payable upon admission confirmation.</td>
                  </tr>

                  {school.transportFeeMin && (
                    <tr>
                      <td className="py-3.5 px-4 font-bold text-stone-900">School Bus Transport</td>
                      <td className="py-3.5 px-4 text-stone-600">Optional / Annual</td>
                      <td className="py-3.5 px-4 font-semibold text-stone-900 tabular-nums">
                        {formatFee(school.transportFeeMin)} – {formatFee(school.transportFeeMax || 0)}
                      </td>
                      <td className="py-3.5 px-4 text-stone-600">Tiered based on radial km distance from campus gate.</td>
                    </tr>
                  )}

                  <tr>
                    <td className="py-3.5 px-4 font-bold text-stone-900">Books & Uniform Kit</td>
                    <td className="py-3.5 px-4 text-stone-600">Annual (Direct vendor)</td>
                    <td className="py-3.5 px-4 font-semibold text-stone-900 tabular-nums">
                      ~₹9,000 – ₹15,000
                    </td>
                    <td className="py-3.5 px-4 text-stone-600">Estimate based on NCERT / Cambridge textbook bundles.</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Mobile Fee Cards */}
            <div className="sm:hidden space-y-3">
              <div className="p-4 rounded-xl border border-stone-200 bg-[#FAF9F6] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-stone-900 text-xs">Tuition & Term Fee</span>
                  <span className="text-[10px] text-teal-800 bg-teal-50 px-2 py-0.5 rounded font-bold border border-teal-200">
                    Annual / Splits
                  </span>
                </div>
                <div className="text-base font-bold text-teal-800 tabular-nums">
                  {formatFee(school.annualFeeMin)} – {formatFee(school.annualFeeMax)}
                </div>
                <p className="text-xs text-stone-600 leading-relaxed font-sans">
                  Covers core academics, laboratory access, and library.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-stone-200 bg-[#FAF9F6] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-stone-900 text-xs">One-Time Admission Fee</span>
                  <span className="text-[10px] text-stone-700 bg-stone-100 px-2 py-0.5 rounded font-bold border border-stone-200">
                    One-Time
                  </span>
                </div>
                <div className="text-sm font-bold text-stone-900 tabular-nums">
                  {formatFee(school.admissionFee)}
                </div>
                <p className="text-xs text-stone-600 leading-relaxed font-sans">
                  Payable upon admission confirmation (non-refundable).
                </p>
              </div>
            </div>

            <div className="p-4 bg-amber-50/70 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
              <span className="font-bold block">Important Parent Note on Fee Transparency:</span>
              <p className="leading-relaxed font-sans">
                Schools in Tamil Nadu are regulated under the Private Schools Fee Determination Committee. While tuition fees follow notified ceilings, elective activity fees and bus fees vary. Always request the itemized fee voucher prior to signing the admission acceptance form.
              </p>
            </div>
          </div>
        )}

        {/* FACILITIES TAB */}
        {activeTab === 'facilities' && (
          <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="pb-3 border-b border-stone-100">
              <span className="text-[11px] font-bold text-violet-800 uppercase tracking-wider">
                Infrastructure & Athletics
              </span>
              <h3 className="font-editorial text-xl font-bold text-stone-900 mt-1">
                Campus Infrastructure & Sporting Facilities
              </h3>
              <p className="text-xs text-stone-600 mt-1 font-sans">
                Verified on-campus facilities for STEM innovation, athletics, and performing arts.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {school.facilities.map((fac) => {
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
                school.admissionStatus.includes('Open')
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                  : 'bg-amber-50 text-amber-900 border-amber-200'
              }`}>
                {school.admissionStatus}
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
                  Age Cutoff Standard (Tamil Nadu)
                </span>
                <p className="text-xs text-stone-600 leading-relaxed font-sans">
                  Child must complete 3 years as of July 31, 2026 for Pre-KG / LKG entry.
                </p>
              </div>
            </div>

            <div className="pt-2">
              <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider mb-2.5">
                Mandatory Application Documents
              </h4>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-stone-700">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                  <span>Original Municipal Birth Certificate</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                  <span>Residential Address Proof (Aadhaar / Passport)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                  <span>Immunization & Medical Records</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                  <span>Transfer Certificate (for Class 2 onwards)</span>
                </li>
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
                <span className="text-sm font-bold text-stone-900">{school.neighbourhood.trafficIntensity}</span>
              </div>

              <div className="p-4 rounded-xl bg-[#FAF9F6] border border-stone-200">
                <span className="text-[11px] text-stone-500 font-medium block">Nearest Transit</span>
                <span className="text-sm font-semibold text-stone-900">{school.neighbourhood.nearestTransit}</span>
              </div>

              <div className="p-4 rounded-xl bg-[#FAF9F6] border border-stone-200">
                <span className="text-[11px] text-stone-500 font-medium block">Surrounding Localities</span>
                <span className="text-xs font-semibold text-stone-700">
                  {school.neighbourhood.neighbouringLocalities.join(', ')}
                </span>
              </div>
            </div>

            <div className="p-4 bg-teal-50/50 rounded-xl border border-teal-200/80 text-xs text-teal-950 leading-relaxed font-sans">
              <strong className="text-teal-900 block mb-1">Local Commute Advisory:</strong>
              {school.neighbourhood.commuteNote}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
