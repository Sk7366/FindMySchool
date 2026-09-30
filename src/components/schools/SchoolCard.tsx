import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Bookmark, Scale, Check, AlertTriangle, HelpCircle, ChevronRight, School as SchoolIcon, MapPin, Bus } from 'lucide-react';
import { School } from '../../types/school';
import { useComparison } from '../../context/ComparisonContext';
import { useShortlist } from '../../context/ShortlistContext';

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

  const formatFee = (amount: number) => {
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    }
    return `₹${(amount / 1000).toFixed(0)}k`;
  };

  return (
    <article className="group bg-white rounded-xl border border-slate-200 hover:border-slate-300 transition-all duration-200 overflow-hidden flex flex-col md:flex-row hover:shadow-xs">
      
      {/* Visual / Media Zone */}
      <div className="relative md:w-64 lg:w-72 shrink-0 bg-slate-100 aspect-16/10 md:aspect-auto">
        {!imageError && school.photos?.[0]?.url ? (
          <img
            src={school.photos[0].url}
            alt={`${school.name} campus building`}
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 p-4 text-center">
            <SchoolIcon className="w-10 h-10 text-slate-400 mb-2" />
            <span className="text-xs font-medium text-slate-600 line-clamp-1">{school.name}</span>
          </div>
        )}

        {/* Calm Unboxed Match Tag */}
        <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-md text-xs font-semibold text-slate-900 border border-slate-200/90 shadow-2xs flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-teal-600 inline-block" />
          <span className="tabular-nums">{school.matchScore}% Match</span>
          <span className="text-slate-500 font-normal">· {school.matchTier}</span>
        </div>

        {/* Quick action: Save bookmark with 44px tap target */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            toggleSave(school.id);
          }}
          className={`absolute top-2.5 right-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 cursor-pointer ${
            saved
              ? 'bg-teal-600 text-white hover:bg-teal-700 shadow-2xs'
              : 'bg-white/90 text-slate-700 hover:text-slate-900 hover:bg-white shadow-2xs backdrop-blur-xs'
          }`}
          title={saved ? 'Remove from shortlist' : 'Save to shortlist'}
          aria-label={saved ? `Remove ${school.name} from shortlist` : `Save ${school.name} to shortlist`}
        >
          <Bookmark className={`w-4 h-4 ${saved ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Main Content Zone */}
      <div className="p-4 sm:p-6 flex-1 flex flex-col justify-between">
        
        {/* Header and Unboxed Metadata */}
        <div>
          {/* Metadata strictly unboxed with · separators per design rules */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 mb-1.5 font-medium">
            <span className="font-semibold text-teal-800">{school.curriculum.join(' & ')}</span>
            <span aria-hidden="true">·</span>
            <span>{school.grades}</span>
            <span aria-hidden="true">·</span>
            <span>{school.schoolType[0]}</span>
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-1 text-slate-600">
              <MapPin className="w-3 h-3 text-slate-400" />
              <span>{school.distanceKm} km away</span>
            </span>
          </div>

          <h3 className="text-base sm:text-xl font-bold text-slate-950 tracking-tight leading-snug group-hover:text-teal-900 transition-colors">
            <Link to={`/school/${school.slug}`} className="focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 rounded">
              {school.name}
            </Link>
          </h3>
          <p className="text-xs text-slate-500 mt-1 line-clamp-1">
            {school.area}, {school.city}
          </p>

          {/* Pricing & Key Metrics Bar */}
          <div className="mt-3.5 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2.5 text-xs">
            <div>
              <span className="text-slate-500 text-[11px] block font-medium">Est. Annual Tuition</span>
              <span className="font-bold text-slate-900 text-sm tabular-nums">
                {formatFee(school.annualFeeMin)} – {formatFee(school.annualFeeMax)}
              </span>
            </div>

            <div className="hidden sm:block">
              <span className="text-slate-500 text-[11px] block font-medium">Teacher Ratio</span>
              <span className="font-semibold text-slate-800 tabular-nums">
                {school.studentTeacherRatio}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-slate-800 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200/60">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
              <span className="font-bold text-xs tabular-nums">{school.rating.toFixed(1)}</span>
              <span className="text-[11px] text-slate-500 font-medium">({school.reviewCount})</span>
            </div>
          </div>

          {/* "Why This School Matches" Section - Key Product Feature */}
          <div className="mt-4 p-3.5 rounded-lg bg-slate-50/90 border border-slate-200/70">
            <h4 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Why this school matches your search
            </h4>
            <ul className="space-y-1.5">
              {school.matchReasons.slice(0, 3).map((reason) => (
                <li key={reason.id} className="flex items-start gap-2 text-xs leading-relaxed">
                  {reason.type === 'positive' && (
                    <span className="w-4 h-4 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center shrink-0 mt-0.5" title="Matches your requirement">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </span>
                  )}
                  {reason.type === 'partial' && (
                    <span className="w-4 h-4 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5" title="Partial match / review needed">
                      <AlertTriangle className="w-2.5 h-2.5" />
                    </span>
                  )}
                  {reason.type === 'unverified' && (
                    <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 mt-0.5" title="Unverified / Confirm with school">
                      <HelpCircle className="w-2.5 h-2.5" />
                    </span>
                  )}
                  <span className="text-slate-700">
                    <strong className="font-semibold text-slate-900">{reason.title}</strong> — {reason.description}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Action Toolbar with min 40px touch targets */}
        <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between gap-2.5">
          
          {/* Compare Checkbox / Button */}
          <button
            type="button"
            onClick={() => toggleComparison(school.id)}
            className={`min-h-[40px] inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 cursor-pointer ${
              compared
                ? 'bg-teal-50 text-teal-800 border border-teal-300 shadow-2xs'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 bg-white'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>{compared ? 'In Comparison' : 'Compare'}</span>
          </button>

          {/* Primary View Profile CTA */}
          <Link
            to={`/school/${school.slug}`}
            className="min-h-[40px] inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 py-2 px-3.5 rounded-lg shadow-2xs transition-colors group/btn focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2"
          >
            <span>View Profile</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </article>
  );
};
