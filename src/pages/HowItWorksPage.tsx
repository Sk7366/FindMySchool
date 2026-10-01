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
  Compass,
  Check
} from 'lucide-react';
import { getCurriculumColor } from '../utils/categoryColors';

export const HowItWorksPage: React.FC = () => {
  const cbseColor = getCurriculumColor('CBSE');
  const cambridgeColor = getCurriculumColor('Cambridge');
  const ibColor = getCurriculumColor('IB World');
  const icseColor = getCurriculumColor('ICSE');

  return (
    <div className="min-h-screen bg-[#FAF9F6] pb-24 text-stone-900">
      
      {/* Hero Header */}
      <section className="bg-white border-b border-stone-200/90 py-10 sm:py-16 px-3.5 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F5F1E8] border border-stone-200 text-xs font-semibold text-stone-700">
            <ShieldCheck className="w-4 h-4 text-teal-700 shrink-0" />
            <span>Methodology & Transparency Manifesto</span>
          </div>

          <h1 className="font-editorial text-3xl xs:text-4xl sm:text-5xl text-stone-900 tracking-tight leading-tight">
            How FindMySchool Evaluates Schools
          </h1>
          <p className="text-sm sm:text-base text-stone-600 max-w-2xl mx-auto leading-relaxed font-sans">
            School discovery in India has long been dominated by commercial directories that sell top ranking spots to whoever bids the most. FindMySchool was built to give Chennai parents an uncompromised, explainable decision companion.
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-3.5 sm:px-6 lg:px-8 mt-10 sm:mt-14 space-y-10 sm:space-y-14">
        
        {/* Core Principles */}
        <section className="space-y-5">
          <div>
            <span className="text-xs font-bold text-teal-800 uppercase tracking-wider">
              Parent-First Guarantees
            </span>
            <h2 className="font-editorial text-xl sm:text-2xl font-bold text-stone-900 mt-0.5">
              The 4 Pillars of Explainable School Matching
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div className="p-5 sm:p-6 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-2.5">
              <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-800 font-editorial font-bold flex items-center justify-center text-sm border border-teal-200">
                1
              </div>
              <h3 className="font-editorial text-base font-bold text-stone-900">
                Hard Constraints are Sacred
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-sans">
                If your maximum budget is ₹1.2 lakh or your commute limit is 8 km, a school that costs ₹3.5 lakh or is 18 km away will never be promoted into your results, regardless of branding.
              </p>
            </div>

            <div className="p-5 sm:p-6 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-800 font-editorial font-bold flex items-center justify-center text-sm border border-blue-200">
                2
              </div>
              <h3 className="font-editorial text-base font-bold text-stone-900">
                Every Match Must Be Explainable
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-sans">
                Rather than an opaque single number, every recommendation itemizes verified fits (✓), partial trade-offs (△), and items requiring on-site parent confirmation (ℹ).
              </p>
            </div>

            <div className="p-5 sm:p-6 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-800 font-editorial font-bold flex items-center justify-center text-sm border border-amber-200">
                3
              </div>
              <h3 className="font-editorial text-base font-bold text-stone-900">
                Audited Fee Receipts, Not Guesswork
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-sans">
                We independently verify fee structures from parent fee receipts and officially notified circulars under the Tamil Nadu Private Schools Fee Determination Committee.
              </p>
            </div>

            <div className="p-5 sm:p-6 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-2.5">
              <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-800 font-editorial font-bold flex items-center justify-center text-sm border border-rose-200">
                4
              </div>
              <h3 className="font-editorial text-base font-bold text-stone-900">
                Zero Commercial Placement Bias
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-sans">
                Schools cannot buy featured badges, sponsored ranks, or higher matching percentages. We exist solely to assist parents with objective data.
              </p>
            </div>
          </div>
        </section>

        {/* Educational Boards in Tamil Nadu Guide with Semantic Colors */}
        <section className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-9 shadow-xs space-y-6">
          <div>
            <span className="text-xs font-bold text-teal-800 uppercase tracking-wider">
              Educational Boards Guide
            </span>
            <h2 className="font-editorial text-xl sm:text-2xl font-bold text-stone-900 mt-1">
              Comparing Boards in Tamil Nadu
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 mt-1 font-sans">
              A quick reference to help families align curricula with their child's long-term educational journey.
            </p>
          </div>

          <div className="space-y-4 text-xs font-sans">
            {/* CBSE */}
            <div className="p-5 rounded-2xl bg-[#FAF9F6] border border-blue-200/90 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${cbseColor.badge}`}>
                    CBSE
                  </span>
                  <h3 className="font-editorial text-sm sm:text-base font-bold text-stone-900">
                    Central Board of Secondary Education
                  </h3>
                </div>
                <span className="font-bold text-blue-900 text-xs">National Exam Alignment</span>
              </div>
              <p className="text-stone-600 leading-relaxed text-xs sm:text-sm">
                Standardized nationwide curriculum aligned with NCERT textbooks. Ideal for families preparing for national competitive exams (JEE, NEET, CUET, NDA) and families with transferable careers across Indian states. Focuses on factual mastery and structured assessments.
              </p>
            </div>

            {/* Cambridge */}
            <div className="p-5 rounded-2xl bg-[#FAF9F6] border border-rose-200/90 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${cambridgeColor.badge}`}>
                    Cambridge (IGCSE)
                  </span>
                  <h3 className="font-editorial text-sm sm:text-base font-bold text-stone-900">
                    Cambridge Assessment International Education
                  </h3>
                </div>
                <span className="font-bold text-rose-900 text-xs">Global Analytical Focus</span>
              </div>
              <p className="text-stone-600 leading-relaxed text-xs sm:text-sm">
                International curriculum prioritizing conceptual inquiry, research coursework, English articulation, and practical science investigations. Highly regarded for overseas university admissions and analytical thinkers.
              </p>
            </div>

            {/* IB World */}
            <div className="p-5 rounded-2xl bg-[#FAF9F6] border border-violet-200/90 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${ibColor.badge}`}>
                    IB World
                  </span>
                  <h3 className="font-editorial text-sm sm:text-base font-bold text-stone-900">
                    International Baccalaureate (PYP / MYP / DP)
                  </h3>
                </div>
                <span className="font-bold text-violet-900 text-xs">Inquiry & Global Citizenship</span>
              </div>
              <p className="text-stone-600 leading-relaxed text-xs sm:text-sm">
                Transdisciplinary inquiry-based education emphasizing independent research (Extended Essay), Theory of Knowledge (TOK), and Community Activity Service (CAS). Best suited for self-directed learners aiming for world-class liberal arts and global careers.
              </p>
            </div>

            {/* ICSE */}
            <div className="p-5 rounded-2xl bg-[#FAF9F6] border border-emerald-200/90 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${icseColor.badge}`}>
                    ICSE / ISC
                  </span>
                  <h3 className="font-editorial text-sm sm:text-base font-bold text-stone-900">
                    Council for the Indian School Certificate Examinations
                  </h3>
                </div>
                <span className="font-bold text-emerald-900 text-xs">Exhaustive Literature & Breadth</span>
              </div>
              <p className="text-stone-600 leading-relaxed text-xs sm:text-sm">
                Known for deep syllabus breadth, exhaustive English literature requirements, and balanced humanities and science subjects. Excellent foundation for civil services, management, and literature.
              </p>
            </div>
          </div>
        </section>

        {/* Parent Verification Checklist */}
        <section className="bg-stone-900 text-white rounded-3xl p-6 sm:p-10 space-y-5 shadow-xl">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
            <h2 className="font-editorial text-lg sm:text-xl font-bold text-white">
              Parent Checklist When Visiting a Campus in Person
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-sans">
            Before signing an admission acceptance or transferring non-refundable registration fees, verify these 4 critical items on site:
          </p>

          <ul className="space-y-3 text-xs sm:text-sm text-stone-200 font-sans">
            <li className="flex items-start gap-2.5">
              <Check className="w-4 h-4 text-teal-400 shrink-0 mt-0.5 stroke-[3]" />
              <span>
                <strong className="text-white">Gate-to-Gate Bus Timing:</strong> Speak with the transport coordinator to confirm exact morning pick-up timing at your specific residence. Pick-ups before 6:45 AM lead to young child commute fatigue.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <Check className="w-4 h-4 text-teal-400 shrink-0 mt-0.5 stroke-[3]" />
              <span>
                <strong className="text-white">Itemized Incidental Fee List:</strong> Ask for an itemized circular covering activity kits, sports uniforms, caution deposits, and mandatory school tours.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <Check className="w-4 h-4 text-teal-400 shrink-0 mt-0.5 stroke-[3]" />
              <span>
                <strong className="text-white">Primary Teacher Stability:</strong> Inquire about teacher retention over the past 3 years. High turnover in primary years directly impacts reading foundation.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <Check className="w-4 h-4 text-teal-400 shrink-0 mt-0.5 stroke-[3]" />
              <span>
                <strong className="text-white">Full-Time Counsellors:</strong> Confirm if student wellness facilitators and SEN educators are permanent on-campus faculty or merely occasional visiting consultants.
              </span>
            </li>
          </ul>

          <div className="pt-4 border-t border-stone-800 flex justify-end">
            <Link
              to="/results"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[#0D9488] hover:bg-[#115E59] text-white font-bold rounded-xl text-xs sm:text-sm transition-colors min-h-[44px]"
            >
              <span>Explore Matching Schools</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};
