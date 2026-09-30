import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, Sparkles, MapPin, GraduationCap, IndianRupee, BookOpen, Building2, Trophy, HeartHandshake, CheckCircle2, ArrowRight, ShieldCheck, HelpCircle } from 'lucide-react';
import { useSearch } from '../context/SearchContext';
import { GuidedSearchModal, GuidedCategory } from '../components/search/GuidedSearchModal';
import { SchoolCard } from '../components/schools/SchoolCard';
import { CHENNAI_SCHOOLS, CHENNAI_NEIGHBOURHOODS } from '../data/schools';

const EXAMPLE_SEARCHES = [
  "CBSE schools near Tambaram under ₹1 lakh",
  "Schools with robotics and swimming near OMR",
  "Schools for Class 6 near Adyar",
  "Cambridge IGCSE schools near ECR with sports",
];

interface HomePageProps {
  onOpenAdvisor: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onOpenAdvisor }) => {
  const navigate = useNavigate();
  const { searchState, setRawQuery, applyNaturalLanguageQuery } = useSearch();
  const [localQuery, setLocalQuery] = useState(searchState.rawQuery || '');
  const [guidedModalOpen, setGuidedModalOpen] = useState(false);
  const [selectedGuidedCategory, setSelectedGuidedCategory] = useState<GuidedCategory>('location');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (localQuery.trim()) {
      applyNaturalLanguageQuery(localQuery);
    }
    navigate('/results');
  };

  const handleExampleClick = (example: string) => {
    setLocalQuery(example);
    applyNaturalLanguageQuery(example);
    navigate('/results');
  };

  const handleOpenGuidedCategory = (category: GuidedCategory) => {
    setSelectedGuidedCategory(category);
    setGuidedModalOpen(true);
  };

  // Top 3 featured schools for instant proof on homepage
  const featuredSchools = CHENNAI_SCHOOLS.slice(0, 3);

  return (
    <div className="min-h-screen bg-slate-50/60 pb-16">
      
      {/* Hero Section */}
      <section className="relative pt-8 pb-14 sm:pt-16 sm:pb-24 overflow-hidden border-b border-slate-200/80 bg-white">
        
        {/* Subtle geometric backdrop */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#0f766e_1px,transparent_1px)] [background-size:16px_16px]" />
        
        <div className="max-w-5xl mx-auto px-3.5 sm:px-6 lg:px-8 text-center relative z-10">
          
          {/* Quiet Trust Pill */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200/70 text-[11px] sm:text-xs font-semibold text-teal-800 mb-5 sm:mb-6 shadow-2xs max-w-full text-center">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-600 shrink-0" />
            <span className="truncate xs:whitespace-normal">Independent School Discovery for Chennai Families</span>
          </div>

          {/* Hero Heading in Syne Display font */}
          <h1 className="font-display font-extrabold text-2xl xs:text-3xl sm:text-5xl lg:text-6xl text-slate-950 tracking-tight leading-[1.14] max-w-3xl mx-auto">
            Find a school that fits your child.
          </h1>

          {/* Supporting Copy */}
          <p className="mt-3 sm:mt-5 text-sm sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Tell us what matters to your family. Discover schools that match your priorities, budget, location and preferences.
          </p>

          {/* Large AI-style Search Box */}
          <div className="mt-6 sm:mt-10 max-w-3xl mx-auto">
            <form
              onSubmit={handleSearchSubmit}
              className="bg-white rounded-2xl border border-slate-300 hover:border-slate-400 focus-within:border-teal-600 focus-within:ring-4 focus-within:ring-teal-600/10 p-3 sm:p-3.5 shadow-sm transition-all text-left flex flex-col gap-3"
            >
              <div className="flex items-start gap-2.5 sm:gap-3 px-1 pt-1">
                <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 mt-0.5 border border-teal-100">
                  <Search className="w-4 h-4 text-teal-700" />
                </div>
                <div className="flex-1 min-w-0">
                  <label htmlFor="hero-search-input" className="sr-only">
                    Search criteria in natural language
                  </label>
                  <textarea
                    id="hero-search-input"
                    value={localQuery}
                    onChange={(e) => setLocalQuery(e.target.value)}
                    rows={2}
                    placeholder="I'm looking for a CBSE school for my 10-year-old within 8 km of Tambaram, under ₹1.2 lakh/year, with strong robotics and sports facilities."
                    className="w-full text-base sm:text-base text-slate-900 placeholder:text-slate-400 focus:outline-none resize-none bg-transparent leading-relaxed"
                  />
                </div>
              </div>

              <div className="pt-2.5 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="text-xs text-slate-500 px-1 flex items-center gap-1.5 font-medium">
                  <Sparkles className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                  <span>Transparent matching engine with explainable criteria</span>
                </div>

                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-2.5 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white rounded-xl text-sm font-semibold shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 min-h-[44px]"
                >
                  <span>Find matching schools</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>

            <p className="mt-3 text-xs text-slate-500 text-center font-medium">
              No account required · Free to search · 100% transparent recommendations
            </p>
          </div>

          {/* Guided Search Chips */}
          <div className="mt-7 sm:mt-10 pt-5 sm:pt-6 border-t border-slate-200/70 max-w-3xl mx-auto">
            <span className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Prefer a guided search?
            </span>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => handleOpenGuidedCategory('location')}
                className="inline-flex items-center gap-1.5 px-3 py-2 sm:px-3.5 sm:py-2 rounded-lg border border-slate-200 bg-white hover:border-teal-500 hover:text-teal-900 text-xs font-semibold text-slate-700 shadow-2xs transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 min-h-[40px]"
              >
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                <span>Location</span>
              </button>

              <button
                type="button"
                onClick={() => handleOpenGuidedCategory('grade')}
                className="inline-flex items-center gap-1.5 px-3 py-2 sm:px-3.5 sm:py-2 rounded-lg border border-slate-200 bg-white hover:border-teal-500 hover:text-teal-900 text-xs font-semibold text-slate-700 shadow-2xs transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 min-h-[40px]"
              >
                <GraduationCap className="w-3.5 h-3.5 text-slate-500" />
                <span>Grade</span>
              </button>

              <button
                type="button"
                onClick={() => handleOpenGuidedCategory('budget')}
                className="inline-flex items-center gap-1.5 px-3 py-2 sm:px-3.5 sm:py-2 rounded-lg border border-slate-200 bg-white hover:border-teal-500 hover:text-teal-900 text-xs font-semibold text-slate-700 shadow-2xs transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 min-h-[40px]"
              >
                <IndianRupee className="w-3.5 h-3.5 text-slate-500" />
                <span>Budget</span>
              </button>

              <button
                type="button"
                onClick={() => handleOpenGuidedCategory('curriculum')}
                className="inline-flex items-center gap-1.5 px-3 py-2 sm:px-3.5 sm:py-2 rounded-lg border border-slate-200 bg-white hover:border-teal-500 hover:text-teal-900 text-xs font-semibold text-slate-700 shadow-2xs transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 min-h-[40px]"
              >
                <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                <span>Curriculum</span>
              </button>

              <button
                type="button"
                onClick={() => handleOpenGuidedCategory('schoolType')}
                className="inline-flex items-center gap-1.5 px-3 py-2 sm:px-3.5 sm:py-2 rounded-lg border border-slate-200 bg-white hover:border-teal-500 hover:text-teal-900 text-xs font-semibold text-slate-700 shadow-2xs transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 min-h-[40px]"
              >
                <Building2 className="w-3.5 h-3.5 text-slate-500" />
                <span>School Type</span>
              </button>

              <button
                type="button"
                onClick={() => handleOpenGuidedCategory('activities')}
                className="inline-flex items-center gap-1.5 px-3 py-2 sm:px-3.5 sm:py-2 rounded-lg border border-slate-200 bg-white hover:border-teal-500 hover:text-teal-900 text-xs font-semibold text-slate-700 shadow-2xs transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 min-h-[40px]"
              >
                <Trophy className="w-3.5 h-3.5 text-slate-500" />
                <span>Activities & Sports</span>
              </button>

              <button
                type="button"
                onClick={() => handleOpenGuidedCategory('special')}
                className="inline-flex items-center gap-1.5 px-3 py-2 sm:px-3.5 sm:py-2 rounded-lg border border-slate-200 bg-white hover:border-teal-500 hover:text-teal-900 text-xs font-semibold text-slate-700 shadow-2xs transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 min-h-[40px]"
              >
                <HeartHandshake className="w-3.5 h-3.5 text-slate-500" />
                <span>Special Needs</span>
              </button>
            </div>
          </div>

          {/* Example Searches */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs">
            <span className="font-semibold text-slate-500">Try asking:</span>
            {EXAMPLE_SEARCHES.map((example) => (
              <button
                key={example}
                type="button"
                onClick={() => handleExampleClick(example)}
                className="inline-flex items-center px-2.5 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 text-xs font-medium transition-colors cursor-pointer border border-slate-200/60 max-w-full text-left"
              >
                <span className="truncate max-w-[260px] xs:max-w-none">"{example}"</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Matches Snapshot */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 pb-3 border-b border-slate-200 gap-2">
          <div>
            <span className="text-xs font-semibold text-teal-800 uppercase tracking-wider">
              Curated Discovery
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight font-display mt-0.5">
              High-Match Schools in Chennai
            </h2>
          </div>
          <Link
            to="/results"
            className="text-xs sm:text-sm font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1"
          >
            <span>View all 12 verified institutions</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="space-y-4">
          {featuredSchools.map((school) => (
            <SchoolCard key={school.id} school={school} featured />
          ))}
        </div>
      </section>

      {/* Concise "How It Works" Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 sm:mt-24">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-semibold text-teal-800 uppercase tracking-wider">
            Decision Framework
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight font-display mt-1">
            How FindMySchool Works
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            A calm, structured methodology to eliminate marketing noise and protect your family's time.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="bg-white p-6 rounded-xl border border-slate-200/90 shadow-2xs">
            <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-800 font-display font-bold text-lg flex items-center justify-center mb-4">
              01
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1.5">
              Tell us what matters
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Describe your child in plain English or select hard boundaries: budget ceilings, commute limits, and sports.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200/90 shadow-2xs">
            <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-800 font-display font-bold text-lg flex items-center justify-center mb-4">
              02
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1.5">
              Discover relevant schools
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Our matching model compares factual disclosures across CBSE, ICSE, Cambridge, and IB institutions in Chennai.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200/90 shadow-2xs">
            <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-800 font-display font-bold text-lg flex items-center justify-center mb-4">
              03
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1.5">
              Understand why they match
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every result features clear explainability points: verified fits, partial trade-offs, and items requiring campus confirmation.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200/90 shadow-2xs">
            <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-800 font-display font-bold text-lg flex items-center justify-center mb-4">
              04
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1.5">
              Compare and shortlist
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Place schools side-by-side on fees, student-teacher ratios, and commute realities to make confident applications.
            </p>
          </div>
        </div>
      </section>

      {/* Chennai Neighbourhood Context Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 sm:mt-24">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 shadow-2xs">
          <div className="max-w-2xl mb-8">
            <span className="text-xs font-semibold text-teal-800 uppercase tracking-wider">
              Neighbourhood Context
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight font-display mt-1">
              School choice is also neighbourhood choice
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
              Chennai traffic and monsoon drainage vary significantly by zone. Discover key schooling corridors across the metropolitan area.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {CHENNAI_NEIGHBOURHOODS.slice(0, 3).map((hub) => (
              <div
                key={hub.name}
                className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-teal-400 transition-colors"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <h3 className="text-sm font-bold text-slate-900">{hub.name}</h3>
                  <span className="text-xs text-teal-800 font-semibold">{hub.count} Schools</span>
                </div>
                <p className="text-xs text-slate-600 mb-3 leading-relaxed">
                  {hub.description}
                </p>
                <div className="flex flex-wrap gap-1 text-[11px] text-slate-600">
                  {hub.popularFor.map((tag) => (
                    <span key={tag} className="bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-600">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
            <span>Want personalized advice on school commute times in your specific street?</span>
            <button
              type="button"
              onClick={onOpenAdvisor}
              className="text-teal-700 hover:text-teal-800 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              <span>Ask the School Advisor</span>
            </button>
          </div>
        </div>
      </section>

      {/* Trust & Transparency Guarantee */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 sm:mt-24">
        <div className="bg-slate-900 rounded-2xl text-white p-8 sm:p-12 relative overflow-hidden">
          <div className="max-w-2xl relative z-10">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-400 uppercase tracking-wider mb-2">
              <ShieldCheck className="w-4 h-4" />
              <span>Our Transparency Pledge</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-white mb-3">
              No sponsored rankings. No hidden affiliate kickbacks.
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed mb-6">
              Conventional school directories rank whichever institution purchases the most advertising banner space. FindMySchool is built on audited fee receipts, verified curriculum disclosures, and honest trade-off indicators.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                <span className="text-slate-200">
                  <strong className="text-white">Fee Audit Trails:</strong> Every fee breakdown clearly lists source documents and audit timestamps.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                <span className="text-slate-200">
                  <strong className="text-white">Explainable Matches:</strong> You always know exactly why a school was ranked high or low for your family.
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Guided Search Modal Component */}
      <GuidedSearchModal
        isOpen={guidedModalOpen}
        onClose={() => setGuidedModalOpen(false)}
        initialCategory={selectedGuidedCategory}
      />
    </div>
  );
};
