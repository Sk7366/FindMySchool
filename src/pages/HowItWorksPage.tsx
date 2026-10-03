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
  Check,
  Building2,
  FlaskConical,
  SlidersHorizontal
} from 'lucide-react';
import { getCurriculumColor } from '../utils/categoryColors';
import { VerificationBadge } from '../components/common/VerificationBadge';
import { DataStatus } from '../types/school';

export const HowItWorksPage: React.FC = () => {
  const cbseColor = getCurriculumColor('CBSE');
  const cambridgeColor = getCurriculumColor('Cambridge');
  const ibColor = getCurriculumColor('IB World');
  const icseColor = getCurriculumColor('ICSE');

  const BADGE_EXAMPLES: { status: DataStatus; description: string; context: string }[] = [
    {
      status: 'verified',
      description: 'Information checked against a documented source.',
      context: 'Official government gazette circulars, board affiliation letters, or verified school fee notifications.'
    },
    {
      status: 'partially_verified',
      description: 'Some details checked against documentation; other sections awaiting confirmation.',
      context: 'Tuition confirmed via published schedule, but transport routes or optional activities await 2026 notification.'
    },
    {
      status: 'self_reported',
      description: 'Information supplied by the institution and not independently verified.',
      context: 'Classroom dimensions, student-teacher ratios, or pedagogy notes submitted directly by school administration.'
    },
    {
      status: 'demo',
      description: 'Fictional data used for this prototype.',
      context: 'Illustrative mock profiles populated to demonstrate interface features prior to full production census.'
    },
    {
      status: 'needs_confirmation',
      description: 'Information requires direct verification with the institution.',
      context: 'Specific bus pickup slots, mid-year seat vacancies, or individualized learning support availability.'
    },
  ];

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
            School discovery in India has long been dominated by commercial directories that sell top ranking spots to whoever bids the most. FindMySchool was built to give Chennai parents an uncompromised, explainable decision companion grounded in clear data provenance.
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
                Rather than an opaque single score, every recommendation clearly differentiates between items matched from user preferences (✓), verified factual details (✦), and points requiring on-site confirmation (ℹ).
              </p>
            </div>

            <div className="p-5 sm:p-6 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-800 font-editorial font-bold flex items-center justify-center text-sm border border-amber-200">
                3
              </div>
              <h3 className="font-editorial text-base font-bold text-stone-900">
                Clear Provenance, Not Manufactured Claims
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-sans">
                We never label unconfirmed or demo entries as audited. Every record explicitly displays its verification status and data source, giving parents an honest baseline.
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
                Schools cannot buy featured badges, sponsored ranks, or higher matching percentages. We exist solely to assist parents with transparent, objective data.
              </p>
            </div>
          </div>
        </section>

        {/* How a Match Score is Constructed Visual Example */}
        <section className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-9 shadow-xs space-y-6">
          <div>
            <span className="text-xs font-bold text-teal-800 uppercase tracking-wider">
              Transparent Scoring Architecture
            </span>
            <h2 className="font-editorial text-xl sm:text-2xl font-bold text-stone-900 mt-1">
              How a Match Score is Constructed
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 mt-1 font-sans">
              FindMySchool does not rank institutions in a static, one-size-fits-all league table. Instead, every score is calculated dynamically against the specific priorities you provide.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            
            {/* Visual Example Card */}
            <div className="md:col-span-6 lg:col-span-5">
              <div className="bg-[#FAF9F6] border border-stone-200/90 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
                
                {/* Score Header */}
                <div className="flex items-center justify-between pb-3 border-b border-stone-200/70">
                  <div>
                    <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
                      YOUR FIT
                    </span>
                    <span className="text-xs text-teal-800 font-semibold">
                      Sample Institution
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="font-editorial font-bold text-3xl sm:text-4xl text-stone-950 tabular-nums">
                      94%
                    </span>
                  </div>
                </div>

                {/* Score Breakdown Rows */}
                <div className="space-y-2.5 font-sans text-xs">
                  <div className="flex items-center justify-between py-1 border-b border-stone-100">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-600" />
                      <span className="text-stone-700 font-medium">Location fit</span>
                    </div>
                    <span className="font-bold text-stone-900 tabular-nums">24 / 25</span>
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-stone-100">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-600" />
                      <span className="text-stone-700 font-medium">Budget fit</span>
                    </div>
                    <span className="font-bold text-stone-900 tabular-nums">19 / 20</span>
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-stone-100">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-600" />
                      <span className="text-stone-700 font-medium">Learning approach</span>
                    </div>
                    <span className="font-bold text-stone-900 tabular-nums">20 / 20</span>
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-stone-100">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-600" />
                      <span className="text-stone-700 font-medium">Facilities</span>
                    </div>
                    <span className="font-bold text-stone-900 tabular-nums">16 / 20</span>
                  </div>

                  <div className="flex items-center justify-between py-1">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-600" />
                      <span className="text-stone-700 font-medium">Other preferences</span>
                    </div>
                    <span className="font-bold text-stone-900 tabular-nums">15 / 15</span>
                  </div>
                </div>

                {/* Score Total Footer */}
                <div className="pt-2.5 border-t border-stone-200/70 flex items-center justify-between text-xs">
                  <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                    Total Weighted Fit
                  </span>
                  <span className="font-bold text-teal-900 tabular-nums">
                    94 / 100
                  </span>
                </div>
              </div>
            </div>

            {/* Explanation & Principles */}
            <div className="md:col-span-6 lg:col-span-7 space-y-4 text-xs sm:text-sm text-stone-700 font-sans leading-relaxed">
              
              <div className="p-4 rounded-xl bg-teal-50/70 border border-teal-200/80 space-y-1.5">
                <div className="flex items-center gap-2 text-teal-950 font-bold text-xs uppercase tracking-wider">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                  <span>Driven by Your Choices</span>
                </div>
                <p className="text-stone-900 font-medium text-xs sm:text-sm leading-snug">
                  "Your fit is based on the priorities you choose. Changing those priorities can change the order of results."
                </p>
                <p className="text-stone-600 text-xs">
                  If you adjust your commute radius from 6 km to 15 km or switch your target board from CBSE to Cambridge, the scores recalculate instantly to reflect that new reality.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-1.5">
                <div className="flex items-center gap-2 text-amber-950 font-bold text-xs uppercase tracking-wider">
                  <Scale className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                  <span>An Important Distinction</span>
                </div>
                <p className="text-stone-900 font-semibold text-xs sm:text-sm leading-snug">
                  "Fit is not a quality rating. It reflects how closely an institution matches the preferences you provided."
                </p>
                <p className="text-stone-600 text-xs leading-relaxed">
                  This distinction is important. A score of 94% does not mean an institution is objectively the best school in Chennai or universally superior to a school with 78%. It simply means it aligns closely with the specific parameters you entered.
                </p>
              </div>

              <p className="text-stone-500 text-xs">
                Every family prioritizes differently—some need doorstep transit and full-day daycare, while others prioritize competitive exam preparation or expansive sports grounds. FindMySchool helps you find what fits <em>your</em> child, not someone else's definition of prestige.
              </p>
            </div>

          </div>
        </section>

        {/* Data Provenance & Verification Badge System Guide */}
        <section className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-9 shadow-xs space-y-6">
          <div>
            <span className="text-xs font-bold text-teal-800 uppercase tracking-wider">
              Data Trust & Integrity Framework
            </span>
            <h2 className="font-editorial text-xl sm:text-2xl font-bold text-stone-900 mt-1">
              Understanding Our Data Verification Badges
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 mt-1 font-sans">
              Every institution profile and card in FindMySchool carries an explicit badge indicating how its data was collected and verified. Hover or tap any badge to inspect its meaning.
            </p>
          </div>

          <div className="space-y-3 font-sans">
            {BADGE_EXAMPLES.map((item) => (
              <div
                key={item.status}
                className="p-4 rounded-2xl bg-[#FAF9F6] border border-stone-200/90 flex flex-col sm:flex-row sm:items-start justify-between gap-3"
              >
                <div className="space-y-1 sm:max-w-xs">
                  <div className="flex items-center gap-2">
                    <VerificationBadge status={item.status} size="md" showTooltip={true} />
                  </div>
                  <p className="text-xs text-stone-800 font-semibold mt-1">
                    {item.description}
                  </p>
                </div>
                <div className="text-xs text-stone-500 sm:max-w-md sm:text-right">
                  <span className="font-semibold text-stone-700 block text-[11px] uppercase tracking-wider">Context & Examples</span>
                  <span>{item.context}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-teal-50/70 border border-teal-200 text-xs text-teal-950 font-sans space-y-1.5">
            <div className="font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-teal-700" />
              <span>Transparent Match Explanations: How "Why this school matches" Works</span>
            </div>
            <p className="text-stone-700 leading-relaxed">
              When reviewing school match reasons, we strictly separate three distinct types of feedback:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
              <div className="p-2.5 rounded-lg bg-white border border-teal-200/80">
                <span className="font-bold text-teal-900 block text-[11px]">1. Matched from Preferences</span>
                <span className="text-stone-600 text-[11px]">E.g., "Matches your preference: Montessori" based directly on your search priorities.</span>
              </div>
              <div className="p-2.5 rounded-lg bg-white border border-stone-200">
                <span className="font-bold text-stone-900 block text-[11px]">2. Factual Information</span>
                <span className="text-stone-600 text-[11px]">E.g., "Listed fee: ₹80K/year" or verified lab facilities published on record.</span>
              </div>
              <div className="p-2.5 rounded-lg bg-white border border-amber-200/80">
                <span className="font-bold text-amber-900 block text-[11px]">3. Requires Confirmation</span>
                <span className="text-stone-600 text-[11px]">E.g., "Confirm current fee with the institution" or bus stop pickup timings.</span>
              </div>
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
