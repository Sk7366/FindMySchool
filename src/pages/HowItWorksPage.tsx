import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
  AlertTriangle,
  Sparkles,
  BookOpen,
  MapPin,
  IndianRupee,
  Scale,
  ArrowRight,
} from 'lucide-react';

export const HowItWorksPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50/70 pb-24">
      
      {/* Hero Header */}
      <section className="bg-white border-b border-slate-200 py-8 sm:py-12 px-3.5 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200/80 text-[11px] sm:text-xs font-semibold text-teal-800">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-600 shrink-0" />
            <span>Methodology & Transparency Manifesto</span>
          </div>

          <h1 className="font-display font-extrabold text-2xl xs:text-3xl sm:text-4xl text-slate-950 tracking-tight leading-tight">
            How FindMySchool Evaluates Schools
          </h1>
          <p className="text-xs sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            School discovery in India has long been dominated by commercial directories that sell top ranking positions to whoever bids the most. Here is how FindMySchool takes an uncompromised, parent-first approach.
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-3.5 sm:px-6 lg:px-8 mt-8 sm:mt-12 space-y-8 sm:space-y-12">
        
        {/* Core Principles */}
        <section className="space-y-4">
          <h2 className="text-lg sm:text-xl font-bold font-display text-slate-900">
            The 4 Pillars of Explainable School Matching
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
            
            <div className="p-4 sm:p-5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2">
              <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 font-bold flex items-center justify-center text-sm">
                1
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                Hard Constraints are Sacred
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                If your maximum budget is ₹1.2 lakh or your commute tolerance is 8 km, a school that costs ₹3 lakh or is 18 km away should never be forced onto your shortlist, regardless of how prestigious its branding is.
              </p>
            </div>

            <div className="p-4 sm:p-5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2">
              <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 font-bold flex items-center justify-center text-sm">
                2
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                Every Match Must Be Explainable
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Rather than an opaque "Score: 9.8/10", every result highlights verified fits (✓), partial compromises (△), and items requiring parent confirmation with the school (ℹ).
              </p>
            </div>

            <div className="p-4 sm:p-5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2">
              <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 font-bold flex items-center justify-center text-sm">
                3
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                Audited Fee Receipts, Not Guesswork
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                We independently verify fee structures from parent fee receipts and officially notified circulars under the Tamil Nadu Private Schools Fee Determination Committee.
              </p>
            </div>

            <div className="p-4 sm:p-5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2">
              <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 font-bold flex items-center justify-center text-sm">
                4
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                Zero Commercial Placement Bias
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Schools cannot buy their way into recommendations, featured badges, or higher percentages. The platform exists solely to serve parents making life-defining decisions.
              </p>
            </div>
          </div>
        </section>

        {/* Educational Boards in India Guide */}
        <section className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-8 shadow-2xs space-y-5 sm:space-y-6">
          <div>
            <h2 className="text-lg sm:text-xl font-bold font-display text-slate-900">
              Understanding Educational Boards in Tamil Nadu
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              A quick reference guide to help parents align board philosophies with their child's long-term aspirations.
            </p>
          </div>

          <div className="space-y-3.5 sm:space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1.5">
                <h3 className="text-sm font-bold text-slate-900">CBSE (Central Board of Secondary Education)</h3>
                <span className="font-semibold text-teal-800 self-start sm:self-auto">Most Popular in India</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Standardized nationwide curriculum aligned with NCERT textbooks. Ideal for families preparing for national competitive exams (JEE, NEET, CUET, NDA) and families with transferable careers across Indian states. Focuses on factual mastery and structured assessments.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1.5">
                <h3 className="text-sm font-bold text-slate-900">Cambridge (IGCSE & A-Levels)</h3>
                <span className="font-semibold text-teal-800 self-start sm:self-auto">Global Analytical Focus</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                International curriculum designed by Cambridge Assessment International Education. Prioritizes conceptual application, research coursework, English articulation, and practical science investigations. Highly regarded for overseas university admissions.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1.5">
                <h3 className="text-sm font-bold text-slate-900">IB World (PYP, MYP, DP)</h3>
                <span className="font-semibold text-teal-800 self-start sm:self-auto">Inquiry & Global Citizenship</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Transdisciplinary inquiry-based education emphasizing independent research (Extended Essay), Theory of Knowledge (TOK), and Community Activity Service (CAS). Best suited for self-directed learners aiming for world-class liberal arts and global careers.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1.5">
                <h3 className="text-sm font-bold text-slate-900">ICSE / ISC</h3>
                <span className="font-semibold text-teal-800 self-start sm:self-auto">Comprehensive Literature & Science</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Known for deep syllabus breadth, exhaustive English literature requirements, and balanced humanities and science subjects. Excellent foundation for civil services, management, and literature.
              </p>
            </div>
          </div>
        </section>

        {/* Parent Verification Checklist */}
        <section className="bg-slate-900 text-white rounded-2xl p-5 sm:p-8 space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-teal-400 shrink-0" />
            <h2 className="text-base sm:text-lg font-bold font-display text-white">
              Parent Checklist When Visiting a School
            </h2>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Before signing an admission acceptance or transferring non-refundable registration fees, verify these 5 critical items in person:
          </p>

          <ul className="space-y-2.5 text-xs text-slate-200">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
              <span>
                <strong>Transport Gate-to-Gate Time:</strong> Speak with the school bus coordinator to confirm pick-up timing at your specific residence. Morning pick-ups before 6:45 AM cause severe fatigue for young children.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
              <span>
                <strong>Full Incidental Fee Disclosure:</strong> Ask for an itemized breakdown of uniforms, activity kits, caution deposits, and mandatory annual school trips.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
              <span>
                <strong>Teacher Attrition Rate:</strong> Inquire about how many primary teachers have been with the school for more than 3 years. High faculty turnover directly impacts young learners.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
              <span>
                <strong>Counselling & Inclusive Support:</strong> Check if counsellors and remedial educators are full-time campus staff or merely visiting external consultants.
              </span>
            </li>
          </ul>

          <div className="pt-4 border-t border-slate-800 flex justify-end">
            <Link
              to="/results"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-lg text-xs transition-colors min-h-[44px]"
            >
              <span>Explore Verified Schools Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};
