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
} from 'lucide-react';
import { CHENNAI_SCHOOLS } from '../data/schools';
import { useComparison } from '../context/ComparisonContext';
import { useShortlist } from '../context/ShortlistContext';
import { useSearch } from '../context/SearchContext';

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
      <div className="min-h-screen bg-slate-50 py-24 px-4 text-center">
        <div className="max-w-md mx-auto bg-white p-8 rounded-2xl border border-slate-200">
          <h2 className="text-xl font-bold text-slate-900 mb-2">School Not Found</h2>
          <p className="text-xs text-slate-600 mb-6">
            The school you are looking for is either unlisted or may have been renamed in our 2026 directory.
          </p>
          <Link
            to="/results"
            className="px-4 py-2 bg-teal-600 text-white rounded-lg text-xs font-semibold hover:bg-teal-700 transition-colors"
          >
            Back to School Results
          </Link>
        </div>
      </div>
    );
  }

  const compared = isComparing(school.id);
  const saved = isSaved(school.id);

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
    <div className="min-h-screen bg-slate-50/70 pb-24">
      
      {/* Top Breadcrumb & Quick Actions Bar */}
      <div className="bg-white border-b border-slate-200 py-3 px-3.5 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <Link
            to="/results"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-teal-700 transition-colors shrink-0 py-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to results</span>
          </Link>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer min-h-[38px]"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{copiedLink ? 'Copied' : 'Share'}</span>
            </button>

            <button
              type="button"
              onClick={() => toggleSave(school.id)}
              className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer min-h-[38px] ${
                saved
                  ? 'bg-teal-600 text-white shadow-2xs hover:bg-teal-700'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${saved ? 'fill-current' : ''}`} />
              <span>
                {saved ? 'Saved' : 'Save'}
                <span className="hidden xs:inline">{saved ? ' in Shortlist' : ' School'}</span>
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="bg-white border-b border-slate-200 py-6 sm:py-8 px-3.5 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          
          {/* Main Info (Col 7) */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Unboxed Metadata (Zero-Pill Discipline) */}
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-600">
              <span className="font-semibold text-teal-800">{school.curriculum.join(' & ')}</span>
              <span aria-hidden="true">·</span>
              <span>{school.grades}</span>
              <span aria-hidden="true">·</span>
              <span>Est. {school.establishedYear}</span>
              <span aria-hidden="true">·</span>
              <span className="flex items-center gap-1 text-slate-700">
                <MapPin className="w-3 h-3 text-slate-600" />
                <span>{school.area}, Chennai</span>
              </span>
            </div>

            <h1 className="font-display font-extrabold text-2xl xs:text-3xl sm:text-4xl text-slate-950 tracking-tight leading-tight">
              {school.name}
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {school.tagline}
            </p>

            {/* Quick Metrics Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 pt-2">
              <div className="p-2.5 sm:p-3 rounded-lg bg-slate-50 border border-slate-200/70">
                <span className="text-[11px] text-slate-600 block">Match Score</span>
                <span className="font-bold text-teal-800 text-sm sm:text-base tabular-nums">
                  {school.matchScore}% Fit
                </span>
                <span className="text-[10px] text-slate-600 block">{school.matchTier}</span>
              </div>

              <div className="p-2.5 sm:p-3 rounded-lg bg-slate-50 border border-slate-200/70">
                <span className="text-[11px] text-slate-600 block">Est. Annual Tuition</span>
                <span className="font-bold text-slate-900 text-sm sm:text-base tabular-nums">
                  ₹{(school.annualFeeMin / 100000).toFixed(1)}L – {(school.annualFeeMax / 100000).toFixed(1)}L
                </span>
                <span className="text-[10px] text-slate-600 block">Grade specific</span>
              </div>

              <div className="p-2.5 sm:p-3 rounded-lg bg-slate-50 border border-slate-200/70">
                <span className="text-[11px] text-slate-600 block">Student:Teacher</span>
                <span className="font-bold text-slate-900 text-sm sm:text-base tabular-nums">
                  {school.studentTeacherRatio}
                </span>
                <span className="text-[10px] text-slate-600 block">Class average</span>
              </div>

              <div className="p-2.5 sm:p-3 rounded-lg bg-slate-50 border border-slate-200/70">
                <span className="text-[11px] text-slate-600 block">Distance</span>
                <span className="font-bold text-slate-900 text-sm sm:text-base tabular-nums">
                  {school.distanceKm} km
                </span>
                <span className="text-[10px] text-slate-600 block">From search hub</span>
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-3 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => toggleComparison(school.id)}
                className={`w-full sm:w-auto px-4 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer min-h-[42px] ${
                  compared
                    ? 'bg-teal-50 text-teal-800 border border-teal-300'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Scale className="w-3.5 h-3.5" />
                <span>{compared ? 'In Comparison Matrix' : 'Compare School'}</span>
              </button>

              <button
                type="button"
                onClick={() => onOpenAdvisorWithSchool?.(school.name)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-lg text-xs font-semibold bg-teal-50 text-teal-800 border border-teal-200 hover:bg-teal-100 flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs min-h-[42px]"
              >
                <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                <span>Ask Advisor About This School</span>
              </button>

              <a
                href={school.website}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-4 py-2.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 flex items-center justify-center gap-1.5 transition-colors min-h-[42px]"
              >
                <span>Visit Official Website</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Photo Gallery Visual (Col 5) */}
          <div className="lg:col-span-5 space-y-2">
            <div className="aspect-16/10 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 relative group">
              <img
                src={school.photos[selectedPhotoIndex]?.url || school.photos[0]?.url}
                alt={school.photos[selectedPhotoIndex]?.caption || school.name}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-102"
              />
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950/80 via-slate-900/40 to-transparent p-3 text-white">
                <span className="text-xs font-medium block">
                  {school.photos[selectedPhotoIndex]?.caption}
                </span>
                <span className="text-[11px] text-slate-300">
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
                  className={`aspect-16/10 rounded-md overflow-hidden border-2 transition-all cursor-pointer ${
                    selectedPhotoIndex === idx
                      ? 'border-teal-600 ring-1 ring-teal-600'
                      : 'border-transparent opacity-70 hover:opacity-100'
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
      <div className="sticky top-16 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 flex overflow-x-auto scrollbar-none gap-1 sm:gap-2 py-1">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'academics', label: 'Academics & Board' },
            { id: 'fees', label: 'Fee Transparency' },
            { id: 'facilities', label: 'Facilities & Sports' },
            { id: 'admissions', label: 'Admissions & Dates' },
            { id: 'neighbourhood', label: 'Commute & Locality' },
          ].map((tab) => {
            const isCurrent = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as ProfileTab)}
                className={`py-3 px-3 sm:px-4 text-xs font-semibold whitespace-nowrap border-b-2 transition-all cursor-pointer min-h-[44px] flex items-center shrink-0 ${
                  isCurrent
                    ? 'border-teal-600 text-teal-800 bg-teal-50/40'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
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
            
            {/* Why This School Matches Section */}
            <div className="bg-white rounded-xl border border-slate-200/90 p-4 sm:p-6 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 mb-4 gap-2">
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-display">
                    Why this school matches your family preferences
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Compared against: {searchState.filters.grade}, CBSE/Cambridge, Tambaram/OMR commute, and ₹1.2L annual fee target
                  </p>
                </div>
                <span className="text-xs font-semibold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-md border border-teal-200 self-start sm:self-auto">
                  {school.matchScore}% Match
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {school.matchReasons.map((reason) => (
                  <div
                    key={reason.id}
                    className={`p-3.5 rounded-lg border flex items-start gap-3 ${
                      reason.type === 'positive'
                        ? 'border-teal-200/80 bg-teal-50/40 text-teal-950'
                        : reason.type === 'partial'
                        ? 'border-amber-200/80 bg-amber-50/40 text-amber-950'
                        : 'border-slate-200 bg-slate-50 text-slate-900'
                    }`}
                  >
                    {reason.type === 'positive' && (
                      <CheckCircle2 className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                    )}
                    {reason.type === 'partial' && (
                      <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    )}
                    {reason.type === 'unverified' && (
                      <HelpCircle className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <h4 className="text-xs font-bold">{reason.title}</h4>
                      <p className="text-xs mt-0.5 opacity-90 leading-relaxed">
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
                <div className="bg-white rounded-xl border border-slate-200/90 p-6 shadow-2xs">
                  <h3 className="text-base font-bold text-slate-900 font-display mb-3">
                    About {school.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {school.description}
                  </p>

                  <div className="mt-6 pt-5 border-t border-slate-100">
                    <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-2">
                      Teaching & Pedagogical Philosophy
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed italic bg-slate-50 p-3.5 rounded-lg border border-slate-100">
                      "{school.teachingPhilosophy}"
                    </p>
                  </div>
                </div>

                {/* Inclusive Education Support */}
                {school.hasSpecialNeedsSupport && (
                  <div className="bg-white rounded-xl border border-slate-200/90 p-6 shadow-2xs">
                    <h3 className="text-base font-bold text-slate-900 font-display mb-2 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-teal-600" />
                      <span>Inclusive Education & Learning Support</span>
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {school.specialNeedsDescription || 'Dedicated resource rooms and remedial facilitators available for mild learning variations.'}
                    </p>
                  </div>
                )}
              </div>

              {/* Sidebar Quick Facts */}
              <div className="space-y-4">
                <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs space-y-3">
                  <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider pb-2 border-b border-slate-100">
                    Key School Disclosures
                  </h4>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-50">
                      <span className="text-slate-600">Verification Status</span>
                      <span className="font-semibold text-teal-800">{school.verificationStatus}</span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-slate-50">
                      <span className="text-slate-600">Established Year</span>
                      <span className="font-medium text-slate-900 tabular-nums">{school.establishedYear}</span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-slate-50">
                      <span className="text-slate-600">Affiliation Code</span>
                      <span className="font-mono text-slate-800">TN-CBSE-1930{school.id.slice(-2)}</span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-slate-50">
                      <span className="text-slate-600">School Type</span>
                      <span className="font-medium text-slate-900">{school.schoolType.join(', ')}</span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-slate-50">
                      <span className="text-slate-600">School Bus Radius</span>
                      <span className="font-medium text-slate-900 tabular-nums">Up to {school.transportRadiusKm} km</span>
                    </div>

                    <div className="flex justify-between py-1">
                      <span className="text-slate-600">Hostel / Boarding</span>
                      <span className="font-medium text-slate-900">{school.hasHostel ? 'Yes' : 'Day School Only'}</span>
                    </div>
                  </div>
                </div>

                {/* Direct Contact info */}
                <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs space-y-3">
                  <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider pb-2 border-b border-slate-100">
                    Campus Admissions Desk
                  </h4>
                  <div className="space-y-2 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-600" />
                      <span>{school.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-600" />
                      <span>{school.email}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-600 shrink-0 mt-0.5" />
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
          <div className="bg-white rounded-xl border border-slate-200/90 p-6 shadow-2xs space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 font-display">
                Academic Rigour & Curriculum Structure
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                Accredited boards: {school.curriculum.join(', ')} · Cohort Ratio: {school.studentTeacherRatio}
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-slate-800 uppercase tracking-wider">
                Key Scholastic Highlights
              </h4>
              <ul className="space-y-2">
                {school.academicHighlights.map((highlight, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <h4 className="text-xs font-semibold text-slate-800 uppercase tracking-wider mb-2">
                Extracurricular Enrichment Clubs
              </h4>
              <div className="flex flex-wrap gap-2">
                {school.extracurriculars.map((activity) => (
                  <span
                    key={activity}
                    className="px-3 py-1 bg-slate-50 border border-slate-200 rounded-md text-xs font-medium text-slate-800"
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
          <div className="bg-white rounded-xl border border-slate-200/90 p-6 shadow-2xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
              <div>
                <h3 className="text-base font-bold text-slate-900 font-display">
                  Audited Fee Breakdown (2025-2026 Academic Year)
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Source: {school.feeSource} · Last audited {school.lastAuditedDate}
                </p>
              </div>

              <div className="text-xs text-teal-800 font-semibold bg-teal-50 px-2.5 py-1 rounded border border-teal-200 self-start sm:self-auto">
                Verified with Parent Receipts
              </div>
            </div>

            {/* Desktop Fee Table (Hidden on small mobile screens) */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-700 uppercase tracking-wider font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-4">Fee Component</th>
                    <th className="py-2.5 px-4">Frequency</th>
                    <th className="py-2.5 px-4">Estimated Amount</th>
                    <th className="py-2.5 px-4">Notes / Disclosures</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="py-3 px-4 font-semibold text-slate-900">Tuition & Term Fee</td>
                    <td className="py-3 px-4 text-slate-600">Annual (Quarterly splits)</td>
                    <td className="py-3 px-4 font-bold text-teal-800 tabular-nums">
                      {formatFee(school.annualFeeMin)} – {formatFee(school.annualFeeMax)}
                    </td>
                    <td className="py-3 px-4 text-slate-600">Covers core academics, laboratory access, and library.</td>
                  </tr>

                  <tr>
                    <td className="py-3 px-4 font-semibold text-slate-900">One-Time Admission Fee</td>
                    <td className="py-3 px-4 text-slate-600">One-Time (Non-refundable)</td>
                    <td className="py-3 px-4 font-medium text-slate-900 tabular-nums">
                      {formatFee(school.admissionFee)}
                    </td>
                    <td className="py-3 px-4 text-slate-600">Payable upon admission confirmation.</td>
                  </tr>

                  {school.transportFeeMin && (
                    <tr>
                      <td className="py-3 px-4 font-semibold text-slate-900">School Bus Transport</td>
                      <td className="py-3 px-4 text-slate-600">Optional / Annual</td>
                      <td className="py-3 px-4 font-medium text-slate-900 tabular-nums">
                        {formatFee(school.transportFeeMin)} – {formatFee(school.transportFeeMax || 0)}
                      </td>
                      <td className="py-3 px-4 text-slate-600">Tiered based on radial km distance from campus gate.</td>
                    </tr>
                  )}

                  <tr>
                    <td className="py-3 px-4 font-semibold text-slate-900">Books & Uniform Kit</td>
                    <td className="py-3 px-4 text-slate-600">Annual (Direct vendor)</td>
                    <td className="py-3 px-4 font-medium text-slate-900 tabular-nums">
                      ~₹9,000 – ₹15,000
                    </td>
                    <td className="py-3 px-4 text-slate-600">Estimate based on NCERT / Cambridge textbook bundles.</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Mobile Fee Cards (< 640px) */}
            <div className="sm:hidden space-y-3">
              <div className="p-3.5 rounded-xl border border-slate-200/90 bg-slate-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-xs">Tuition & Term Fee</span>
                  <span className="text-[10px] text-teal-800 bg-teal-50 px-2 py-0.5 rounded font-medium border border-teal-200">
                    Annual / Splits
                  </span>
                </div>
                <div className="text-base font-bold text-teal-800 tabular-nums">
                  {formatFee(school.annualFeeMin)} – {formatFee(school.annualFeeMax)}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Covers core academics, laboratory access, and library.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200/90 bg-slate-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-xs">One-Time Admission Fee</span>
                  <span className="text-[10px] text-slate-700 bg-slate-100 px-2 py-0.5 rounded font-medium border border-slate-200">
                    One-Time
                  </span>
                </div>
                <div className="text-sm font-semibold text-slate-900 tabular-nums">
                  {formatFee(school.admissionFee)}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Payable upon admission confirmation (non-refundable).
                </p>
              </div>

              {school.transportFeeMin && (
                <div className="p-3.5 rounded-xl border border-slate-200/90 bg-slate-50/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs">School Bus Transport</span>
                    <span className="text-[10px] text-slate-700 bg-slate-100 px-2 py-0.5 rounded font-medium border border-slate-200">
                      Optional / Annual
                    </span>
                  </div>
                  <div className="text-sm font-semibold text-slate-900 tabular-nums">
                    {formatFee(school.transportFeeMin)} – {formatFee(school.transportFeeMax || 0)}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Tiered based on radial distance from campus gate.
                  </p>
                </div>
              )}

              <div className="p-3.5 rounded-xl border border-slate-200/90 bg-slate-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-xs">Books & Uniform Kit</span>
                  <span className="text-[10px] text-slate-700 bg-slate-100 px-2 py-0.5 rounded font-medium border border-slate-200">
                    Direct Vendor
                  </span>
                </div>
                <div className="text-sm font-semibold text-slate-900 tabular-nums">
                  ~₹9,000 – ₹15,000
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Estimate based on curriculum textbooks and uniforms.
                </p>
              </div>
            </div>

            <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-200/80 text-xs text-amber-900 space-y-1">
              <span className="font-bold block">Important Parent Note on Fee Transparency:</span>
              <p className="leading-relaxed">
                Schools in Tamil Nadu are regulated under the Private Schools Fee Determination Committee. While tuition fees follow notified ceilings, elective activity fees and bus fees vary. Always request the itemized fee voucher prior to signing the admission acceptance form.
              </p>
            </div>
          </div>
        )}

        {/* FACILITIES TAB */}
        {activeTab === 'facilities' && (
          <div className="bg-white rounded-xl border border-slate-200/90 p-4 sm:p-6 shadow-2xs space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 font-display">
                Campus Infrastructure & Sporting Facilities
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                Verified on-campus facilities for STEM innovation, athletics, and performing arts.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {school.facilities.map((fac) => (
                <div
                  key={fac.id}
                  className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 flex items-start gap-3"
                >
                  <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-slate-900">{fac.name}</h4>
                      <span className="text-[10px] text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                        {fac.category}
                      </span>
                    </div>
                    {fac.highlight && (
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {fac.highlight}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ADMISSIONS TAB */}
        {activeTab === 'admissions' && (
          <div className="bg-white rounded-xl border border-slate-200/90 p-4 sm:p-6 shadow-2xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
              <div>
                <h3 className="text-base font-bold text-slate-900 font-display">
                  Admissions Cycle 2026-2027
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Application timelines, minimum age eligibility, and document requirements.
                </p>
              </div>

              <span className={`text-xs font-semibold px-3 py-1 rounded-md self-start sm:self-auto ${
                school.admissionStatus.includes('Open')
                  ? 'bg-teal-100 text-teal-800'
                  : 'bg-amber-100 text-amber-800'
              }`}>
                {school.admissionStatus}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200/80">
                <span className="text-xs font-bold text-slate-900 block mb-1">
                  Application Window
                </span>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Deadline: <strong className="text-slate-900">{school.admissionDeadline}</strong>
                </p>
              </div>

              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200/80">
                <span className="text-xs font-bold text-slate-900 block mb-1">
                  Age Cutoff Standard (Tamil Nadu)
                </span>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Child must complete 3 years as of July 31, 2026 for Pre-KG / LKG entry.
                </p>
              </div>
            </div>

            <div className="pt-2">
              <h4 className="text-xs font-semibold text-slate-800 uppercase tracking-wider mb-2">
                Mandatory Application Documents
              </h4>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
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
          <div className="bg-white rounded-xl border border-slate-200/90 p-6 shadow-2xs space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 font-display">
                Neighbourhood & Commute Context
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                Traffic patterns, transit links, and arterial road access around {school.area}.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200/80">
                <span className="text-[11px] text-slate-600 block">Commute Traffic</span>
                <span className="text-sm font-bold text-slate-900">{school.neighbourhood.trafficIntensity}</span>
              </div>

              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200/80">
                <span className="text-[11px] text-slate-600 block">Nearest Public Transit</span>
                <span className="text-sm font-semibold text-slate-900">{school.neighbourhood.nearestTransit}</span>
              </div>

              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200/80">
                <span className="text-[11px] text-slate-600 block">Surrounding Localities</span>
                <span className="text-xs font-medium text-slate-700">
                  {school.neighbourhood.neighbouringLocalities.join(', ')}
                </span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700 leading-relaxed">
              <strong className="text-slate-900 block mb-1">Local Commute Advisory:</strong>
              {school.neighbourhood.commuteNote}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
