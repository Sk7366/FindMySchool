import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Search, 
  Sparkles, 
  MapPin, 
  GraduationCap, 
  IndianRupee, 
  BookOpen, 
  Building2, 
  Trophy, 
  HeartHandshake, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  Mic, 
  Compass, 
  Check, 
  SlidersHorizontal,
  ChevronRight,
  School as SchoolIcon,
  TreePine,
  Waves,
  Building
} from 'lucide-react';
import { useSearch } from '../context/SearchContext';
import { GuidedSearchModal, GuidedCategory } from '../components/search/GuidedSearchModal';
import { SchoolCard } from '../components/schools/SchoolCard';
import { CHENNAI_SCHOOLS } from '../data/schools';
import { CHENNAI_HUBS } from '../utils/categoryColors';

const EXAMPLE_SEARCHES = [
  "CBSE schools near Tambaram under ₹1.2 lakh",
  "Schools with robotics lab and swimming near OMR",
  "Cambridge IGCSE schools near Adyar with sports",
  "ICSE schools near Porur for Class 6",
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
  const [isListening, setIsListening] = useState(false);

  // Dynamic Concept Detection preview
  const detectedConcepts = useMemo(() => {
    const q = localQuery.toLowerCase();
    const concepts: { id: string; label: string; color: string; icon: string }[] = [];
    
    // Curriculum detection
    if (q.includes('cbse')) {
      concepts.push({ id: 'c-cbse', label: 'Curriculum: CBSE', color: 'bg-blue-50 text-blue-900 border-blue-200', icon: 'Book' });
    } else if (q.includes('cambridge') || q.includes('igcse')) {
      concepts.push({ id: 'c-camb', label: 'Curriculum: Cambridge', color: 'bg-rose-50 text-rose-900 border-rose-200', icon: 'Book' });
    } else if (q.includes('ib') || q.includes('international baccalaureate')) {
      concepts.push({ id: 'c-ib', label: 'Curriculum: IB World', color: 'bg-violet-50 text-violet-900 border-violet-200', icon: 'Book' });
    } else if (q.includes('icse')) {
      concepts.push({ id: 'c-icse', label: 'Curriculum: ICSE', color: 'bg-emerald-50 text-emerald-900 border-emerald-200', icon: 'Book' });
    }

    // Budget detection
    if (q.includes('1 lakh') || q.includes('1l') || q.includes('1.2') || q.includes('budget') || q.includes('under') || q.includes('₹')) {
      concepts.push({ id: 'c-budget', label: 'Budget Cap: ₹1.2L/yr', color: 'bg-amber-50 text-amber-900 border-amber-200', icon: 'Rupee' });
    }

    // Location detection
    if (q.includes('tambaram')) {
      concepts.push({ id: 'c-tamb', label: 'Hub: Tambaram / GST', color: 'bg-teal-50 text-teal-900 border-teal-200', icon: 'Pin' });
    } else if (q.includes('omr')) {
      concepts.push({ id: 'c-omr', label: 'Hub: OMR / Sholinganallur', color: 'bg-teal-50 text-teal-900 border-teal-200', icon: 'Pin' });
    } else if (q.includes('adyar')) {
      concepts.push({ id: 'c-adyar', label: 'Hub: Adyar & Besant Nagar', color: 'bg-teal-50 text-teal-900 border-teal-200', icon: 'Pin' });
    } else if (q.includes('porur')) {
      concepts.push({ id: 'c-porur', label: 'Hub: Porur Corridor', color: 'bg-teal-50 text-teal-900 border-teal-200', icon: 'Pin' });
    } else if (q.includes('anna nagar')) {
      concepts.push({ id: 'c-annanagar', label: 'Hub: Anna Nagar', color: 'bg-teal-50 text-teal-900 border-teal-200', icon: 'Pin' });
    } else if (q.includes('velachery')) {
      concepts.push({ id: 'c-vel', label: 'Hub: Velachery', color: 'bg-teal-50 text-teal-900 border-teal-200', icon: 'Pin' });
    }

    // Facilities detection
    if (q.includes('robot') || q.includes('stem')) {
      concepts.push({ id: 'c-robot', label: 'STEM: Robotics Lab', color: 'bg-violet-50 text-violet-900 border-violet-200', icon: 'Cpu' });
    }
    if (q.includes('swim')) {
      concepts.push({ id: 'c-swim', label: 'Facility: Swimming Pool', color: 'bg-sky-50 text-sky-900 border-sky-200', icon: 'Waves' });
    }
    if (q.includes('sport') || q.includes('turf') || q.includes('football')) {
      concepts.push({ id: 'c-sport', label: 'Sports: Synthetic Turf', color: 'bg-sky-50 text-sky-900 border-sky-200', icon: 'Trophy' });
    }

    return concepts;
  }, [localQuery]);

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

  const handleSimulateVoice = () => {
    setIsListening(true);
    setTimeout(() => {
      setIsListening(false);
      setLocalQuery("CBSE schools near Tambaram under ₹1.2 lakh with swimming pool");
    }, 1200);
  };

  // Top 3 featured schools for instant proof on homepage
  const featuredSchools = CHENNAI_SCHOOLS.slice(0, 3);

  return (
    <div className="min-h-screen bg-[#FAF9F6] pb-24 text-stone-900 selection:bg-teal-100 selection:text-teal-900">
      
      {/* Editorial Hero Section */}
      <section className="relative pt-8 pb-16 sm:pt-14 sm:pb-24 overflow-hidden border-b border-stone-200/80 bg-[#FAF9F6]">
        
        {/* Soft Organic Architectural Backdrop Elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-[#F5F1E8] via-[#FAF9F6] to-transparent rounded-full -translate-y-1/3 translate-x-1/4 pointer-events-none opacity-80" />
        <div className="absolute top-1/2 left-0 w-[420px] h-[420px] bg-gradient-to-tr from-teal-50/50 via-[#FAF9F6] to-transparent rounded-full -translate-y-1/2 -translate-x-1/4 pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div className="text-center max-w-3xl mx-auto">
            
            {/* Quiet Editorial Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F5F1E8] border border-stone-200 text-xs font-semibold text-stone-700 mb-6 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-[#0D9488]" />
              <span>Independent School Discovery for Chennai Families</span>
              <span className="text-stone-400">·</span>
              <span className="text-teal-800 font-bold">100% Unsponsored</span>
            </div>

            {/* Display Heading: Fraunces / Editorial Serif */}
            <h1 className="font-editorial text-3xl xs:text-4xl sm:text-5xl lg:text-6xl text-stone-900 tracking-tight leading-[1.12]">
              Discover schools that truly fit your child.
            </h1>

            {/* Supporting Copy */}
            <p className="mt-4 text-base sm:text-lg text-stone-600 max-w-2xl mx-auto leading-relaxed font-sans">
              Tell us what matters to your family. Compare verified curriculum choices, realistic commute buffers, and transparent fee schedules across Chennai.
            </p>
          </div>

          {/* SIGNATURE NATURAL-LANGUAGE SEARCH BOX */}
          <div className="mt-8 sm:mt-10 max-w-3xl mx-auto">
            <div className="bg-white/95 rounded-2xl border border-stone-300/90 hover:border-stone-400 focus-within:border-[#0D9488] focus-within:ring-4 focus-within:ring-teal-700/10 p-3.5 sm:p-4 shadow-md transition-all text-left flex flex-col gap-3">
              
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-800 flex items-center justify-center shrink-0 mt-0.5 border border-teal-200/70">
                  <Search className="w-4 h-4 text-[#0D9488]" />
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
                    placeholder="e.g. CBSE schools within 8 km of Tambaram under ₹1.2 lakh with swimming and robotics..."
                    className="w-full text-sm sm:text-base text-stone-900 placeholder:text-stone-400 focus:outline-none resize-none bg-transparent leading-relaxed font-sans"
                  />
                </div>

                {/* Voice / Mic input trigger */}
                <button
                  type="button"
                  onClick={handleSimulateVoice}
                  title="Voice search prompt"
                  className={`min-h-[40px] min-w-[40px] rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                    isListening
                      ? 'bg-rose-50 text-rose-600 border border-rose-200 animate-pulse'
                      : 'bg-stone-50 text-stone-600 hover:text-stone-900 hover:bg-stone-100 border border-stone-200/80'
                  }`}
                  aria-label="Simulate voice search"
                >
                  <Mic className="w-4 h-4" />
                </button>
              </div>

              {/* Dynamic Detected Concepts Bar: What we understood */}
              {detectedConcepts.length > 0 && (
                <div className="pt-2 border-t border-stone-100 flex flex-wrap items-center gap-1.5 animate-in fade-in duration-200">
                  <span className="text-[11px] font-bold text-stone-600 uppercase tracking-wider mr-1">
                    What we understood:
                  </span>
                  {detectedConcepts.map((concept) => (
                    <span
                      key={concept.id}
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${concept.color}`}
                    >
                      <Check className="w-3 h-3 stroke-[3]" />
                      <span>{concept.label}</span>
                    </span>
                  ))}
                </div>
              )}

              {/* Search Box Footer Actions */}
              <div className="pt-2.5 border-t border-stone-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="text-xs text-stone-500 flex items-center gap-1.5 font-medium">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Clear facts, parent audits & verified fee disclosures</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setGuidedModalOpen(true)}
                    className="sm:hidden px-3 py-2 text-xs font-semibold text-stone-700 bg-stone-100 rounded-xl hover:bg-stone-200 transition-colors flex items-center justify-center gap-1.5 min-h-[44px]"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5 text-stone-600" />
                    <span>Filters</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSearchSubmit}
                    className="flex-1 sm:flex-initial px-6 py-2.5 bg-[#0D9488] hover:bg-[#115E59] active:bg-teal-900 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs hover:shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap min-h-[44px]"
                  >
                    <span>See schools that match your priorities</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Prompts */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-1.5 text-xs">
              <span className="font-semibold text-stone-500 mr-1">Popular searches:</span>
              {EXAMPLE_SEARCHES.map((example) => (
                <button
                  key={example}
                  type="button"
                  onClick={() => handleExampleClick(example)}
                  className="px-2.5 py-1 rounded-md bg-[#F5F1E8] hover:bg-stone-200/70 text-stone-700 text-[11px] font-medium transition-colors cursor-pointer border border-stone-200/80"
                >
                  "{example}"
                </button>
              ))}
            </div>
          </div>

          {/* Guided Category Quick Launchers */}
          <div className="mt-8 pt-6 border-t border-stone-200/80 max-w-4xl mx-auto">
            <span className="block text-center text-xs font-bold text-stone-600 uppercase tracking-wider mb-3">
              Not sure what to look for? We can help:
            </span>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => handleOpenGuidedCategory('location')}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-teal-200/80 bg-teal-50/70 hover:bg-teal-100/70 text-xs font-semibold text-teal-900 transition-colors cursor-pointer min-h-[40px]"
              >
                <MapPin className="w-3.5 h-3.5 text-teal-700" />
                <span>Locality & Radius</span>
              </button>

              <button
                type="button"
                onClick={() => handleOpenGuidedCategory('curriculum')}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-blue-200/80 bg-blue-50/70 hover:bg-blue-100/70 text-xs font-semibold text-blue-900 transition-colors cursor-pointer min-h-[40px]"
              >
                <BookOpen className="w-3.5 h-3.5 text-blue-700" />
                <span>CBSE / Cambridge / IB</span>
              </button>

              <button
                type="button"
                onClick={() => handleOpenGuidedCategory('budget')}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-amber-200/80 bg-amber-50/70 hover:bg-amber-100/70 text-xs font-semibold text-amber-900 transition-colors cursor-pointer min-h-[40px]"
              >
                <IndianRupee className="w-3.5 h-3.5 text-amber-700" />
                <span>Annual Fee Budget</span>
              </button>

              <button
                type="button"
                onClick={() => handleOpenGuidedCategory('activities')}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-violet-200/80 bg-violet-50/70 hover:bg-violet-100/70 text-xs font-semibold text-violet-900 transition-colors cursor-pointer min-h-[40px]"
              >
                <Trophy className="w-3.5 h-3.5 text-violet-700" />
                <span>Robotics & Pool</span>
              </button>

              <button
                type="button"
                onClick={() => handleOpenGuidedCategory('grade')}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 text-xs font-semibold text-stone-700 transition-colors cursor-pointer min-h-[40px]"
              >
                <GraduationCap className="w-3.5 h-3.5 text-stone-600" />
                <span>Grade Level</span>
              </button>

              <button
                type="button"
                onClick={() => handleOpenGuidedCategory('special')}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 text-xs font-semibold text-stone-700 transition-colors cursor-pointer min-h-[40px]"
              >
                <HeartHandshake className="w-3.5 h-3.5 text-stone-600" />
                <span>Special Needs (SEN)</span>
              </button>
            </div>
          </div>

          {/* TASTEFUL EDITORIAL SVG ILLUSTRATION: Minimalist Architectural Colonnade & Chennai Foliage */}
          <div className="mt-12 max-w-4xl mx-auto rounded-2xl bg-gradient-to-b from-[#F5F1E8]/90 to-white border border-stone-200/80 p-6 sm:p-8 shadow-xs relative overflow-hidden">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
              <div className="max-w-md text-left space-y-2">
                <span className="text-[11px] font-bold text-teal-800 tracking-wider uppercase flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-teal-600" />
                  <span>Grounded in Chennai Realities</span>
                </span>
                <h3 className="font-editorial text-xl sm:text-2xl font-bold text-stone-900 leading-snug">
                  Audited campus disclosures, verified bus corridors, and zero marketing hype.
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed font-sans">
                  From GST corridor campuses to shaded Adyar institutions, evaluate schools on verifiable parent evidence.
                </p>
                <div className="pt-1 flex items-center gap-4 text-xs font-semibold text-stone-700">
                  <span className="flex items-center gap-1 text-teal-800">
                    <Check className="w-3.5 h-3.5 text-teal-600 stroke-[3]" />
                    <span>Real parent fee receipts</span>
                  </span>
                  <span className="flex items-center gap-1 text-teal-800">
                    <Check className="w-3.5 h-3.5 text-teal-600 stroke-[3]" />
                    <span>Radial commute checks</span>
                  </span>
                </div>
              </div>

              {/* Minimalist Editorial Illustration SVG */}
              <div className="w-full md:w-72 lg:w-80 shrink-0 h-44 relative flex items-center justify-center">
                <svg
                  viewBox="0 0 340 180"
                  className="w-full h-full drop-shadow-xs"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Subtle map coordinate arcs */}
                  <circle cx="170" cy="190" r="140" stroke="#E7E5E4" strokeWidth="1" strokeDasharray="3 3" />
                  <circle cx="170" cy="190" r="100" stroke="#0D9488" strokeWidth="1" strokeOpacity="0.2" />
                  <circle cx="170" cy="190" r="60" stroke="#0D9488" strokeWidth="1" strokeOpacity="0.3" />

                  {/* Ground Base Line */}
                  <line x1="20" y1="150" x2="320" y2="150" stroke="#78716C" strokeWidth="1.5" />

                  {/* School Architectural Colonnade */}
                  {/* Main portico */}
                  <polygon points="120,80 170,55 220,80" fill="#D97706" fillOpacity="0.15" stroke="#B45309" strokeWidth="1.2" />
                  <rect x="126" y="80" width="88" height="6" fill="#F5F5F4" stroke="#78716C" strokeWidth="1" />
                  
                  {/* Columns */}
                  <line x1="134" y1="86" x2="134" y2="150" stroke="#78716C" strokeWidth="2" strokeLinecap="round" />
                  <line x1="152" y1="86" x2="152" y2="150" stroke="#78716C" strokeWidth="2" strokeLinecap="round" />
                  <line x1="170" y1="86" x2="170" y2="150" stroke="#78716C" strokeWidth="2" strokeLinecap="round" />
                  <line x1="188" y1="86" x2="188" y2="150" stroke="#78716C" strokeWidth="2" strokeLinecap="round" />
                  <line x1="206" y1="86" x2="206" y2="150" stroke="#78716C" strokeWidth="2" strokeLinecap="round" />

                  {/* Arches between columns */}
                  <path d="M 134 100 Q 143 92 152 100" stroke="#0D9488" strokeWidth="1.2" fill="none" />
                  <path d="M 152 100 Q 161 92 170 100" stroke="#0D9488" strokeWidth="1.2" fill="none" />
                  <path d="M 170 100 Q 179 92 188 100" stroke="#0D9488" strokeWidth="1.2" fill="none" />
                  <path d="M 188 100 Q 197 92 206 100" stroke="#0D9488" strokeWidth="1.2" fill="none" />

                  {/* Arch doorway in centre */}
                  <path d="M 160 150 V 122 Q 170 112 180 122 V 150 Z" fill="#0D9488" fillOpacity="0.2" stroke="#0D9488" strokeWidth="1.2" />

                  {/* Left School Wing with Windows */}
                  <rect x="54" y="96" width="66" height="54" fill="#FAF9F6" stroke="#78716C" strokeWidth="1.2" />
                  <rect x="62" y="106" width="12" height="14" rx="2" fill="#3B82F6" fillOpacity="0.15" stroke="#3B82F6" strokeWidth="1" />
                  <rect x="80" y="106" width="12" height="14" rx="2" fill="#3B82F6" fillOpacity="0.15" stroke="#3B82F6" strokeWidth="1" />
                  <rect x="98" y="106" width="12" height="14" rx="2" fill="#3B82F6" fillOpacity="0.15" stroke="#3B82F6" strokeWidth="1" />

                  {/* Right School Wing with Science/Robotics Cupola */}
                  <rect x="220" y="96" width="66" height="54" fill="#FAF9F6" stroke="#78716C" strokeWidth="1.2" />
                  <rect x="230" y="106" width="12" height="14" rx="2" fill="#8B5CF6" fillOpacity="0.15" stroke="#8B5CF6" strokeWidth="1" />
                  <rect x="248" y="106" width="12" height="14" rx="2" fill="#8B5CF6" fillOpacity="0.15" stroke="#8B5CF6" strokeWidth="1" />
                  <rect x="266" y="106" width="12" height="14" rx="2" fill="#8B5CF6" fillOpacity="0.15" stroke="#8B5CF6" strokeWidth="1" />

                  {/* Modern Cupola / Observatory Dome */}
                  <path d="M 240 96 A 13 13 0 0 1 266 96 Z" fill="#8B5CF6" fillOpacity="0.2" stroke="#8B5CF6" strokeWidth="1.2" />

                  {/* Lush Chennai Rain Tree / Banyan Tree Canopy on Left */}
                  <path d="M 40 150 C 40 135 44 125 44 115" stroke="#57534E" strokeWidth="2.5" strokeLinecap="round" />
                  <path d="M 44 115 C 40 100 24 100 24 88 C 24 74 44 70 50 62 C 58 52 74 52 82 62 C 90 70 86 86 86 96 C 86 108 70 114 62 120" fill="#10B981" fillOpacity="0.18" stroke="#059669" strokeWidth="1.2" />

                  {/* Foliage on Right */}
                  <path d="M 296 150 C 296 138 292 128 294 120" stroke="#57534E" strokeWidth="2.5" strokeLinecap="round" />
                  <circle cx="298" cy="98" r="22" fill="#10B981" fillOpacity="0.18" stroke="#059669" strokeWidth="1.2" />
                  <circle cx="310" cy="112" r="16" fill="#0D9488" fillOpacity="0.15" stroke="#0D9488" strokeWidth="1.2" />

                  {/* Stylized Students Reading Under Canopy */}
                  {/* Student 1 */}
                  <circle cx="106" cy="136" r="3.5" fill="#44403C" />
                  <path d="M 106 140 C 103 144 102 147 101 150" stroke="#44403C" strokeWidth="1.5" />
                  {/* Open Book */}
                  <polygon points="108,145 113,142 118,145 113,148" fill="#F59E0B" stroke="#D97706" strokeWidth="0.8" />

                  {/* Student 2 */}
                  <circle cx="118" cy="137" r="3.5" fill="#44403C" />
                  <path d="M 118 141 C 120 145 121 147 122 150" stroke="#44403C" strokeWidth="1.5" />

                  {/* Compass / Location Pin Marker in sky */}
                  <g transform="translate(164, 25)">
                    <circle cx="6" cy="6" r="5" fill="#0D9488" />
                    <circle cx="6" cy="6" r="2" fill="white" />
                  </g>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED MATCHES SNAPSHOT */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 sm:mt-16">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 pb-3 border-b border-stone-200 gap-2">
          <div>
            <span className="text-xs font-bold text-teal-800 uppercase tracking-wider">
              Schools Worth Looking Into
            </span>
            <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight mt-0.5">
              Schools that fit what parents are looking for
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 mt-1 font-sans">
              These schools seem closest to common family priorities: Class 5, CBSE or Cambridge, and under ₹1.2L annual fees.
            </p>
          </div>
          <Link
            to="/results"
            className="text-xs sm:text-sm font-bold text-teal-800 hover:text-teal-900 flex items-center gap-1 group py-1"
          >
            <span>Browse all 12 verified campuses</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="space-y-4">
          {featuredSchools.map((school) => (
            <SchoolCard key={school.id} school={school} featured />
          ))}
        </div>
      </section>

      {/* EXPLORE BY CHENNAI AREA: Curated Educational Hubs */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 sm:mt-24">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-3 border-b border-stone-200 gap-2">
          <div>
            <span className="text-xs font-bold text-teal-800 uppercase tracking-wider">
              Neighbourhood Discovery
            </span>
            <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight mt-0.5">
              Explore Chennai by Educational Corridors
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-2xl font-sans">
              Commute reality defines family happiness. Explore distinct school ecosystems across Chennai's premier residential sectors.
            </p>
          </div>
          <Link
            to="/results"
            className="text-xs sm:text-sm font-bold text-teal-800 hover:text-teal-900 flex items-center gap-1 shrink-0 py-1"
          >
            <span>View City Map</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* 6 Curated Neighborhood Hub Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {CHENNAI_HUBS.map((hub) => (
            <Link
              key={hub.name}
              to={`/results?location=${encodeURIComponent(hub.queryParam)}`}
              className={`group bg-white p-5 rounded-2xl border ${hub.color.border} hover:shadow-md transition-all duration-200 flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${hub.color.badge}`}>
                    {hub.schoolCount} Audited Schools
                  </span>
                  <span className="text-[11px] font-medium text-stone-500 tabular-nums">
                    Avg ~ {hub.avgFee}
                  </span>
                </div>

                <h3 className="font-editorial text-lg font-bold text-stone-900 group-hover:text-teal-900 transition-colors leading-tight">
                  {hub.name}
                </h3>
                
                <p className="text-xs text-stone-600 mt-1.5 leading-relaxed font-sans">
                  {hub.tagline}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-semibold text-stone-700 group-hover:text-teal-900">
                <span className="flex items-center gap-1.5">
                  <MapPin className={`w-3.5 h-3.5 ${hub.color.iconColor}`} />
                  <span>Explore this zone</span>
                </span>
                <ChevronRight className="w-4 h-4 text-stone-400 group-hover:translate-x-1 group-hover:text-teal-700 transition-all" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* DECISION FRAMEWORK / HOW IT WORKS */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 sm:mt-24">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold text-teal-800 uppercase tracking-wider">
            Decision Framework
          </span>
          <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight mt-1">
            How FindMySchool Works
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-stone-600 leading-relaxed font-sans">
            A calm, structured methodology to eliminate marketing noise and protect your family's peace of mind.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          
          <div className="bg-[#FAF9F6] p-5 sm:p-6 rounded-2xl border border-stone-200/90 shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-900 font-editorial font-bold text-lg flex items-center justify-center">
              01
            </div>
            <h3 className="font-editorial text-base font-bold text-stone-900">
              State family priorities
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed font-sans">
              Describe your child in plain conversational language or choose firm boundaries: budget caps, commute limits, and robotics.
            </p>
          </div>

          <div className="bg-[#FAF9F6] p-5 sm:p-6 rounded-2xl border border-stone-200/90 shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-900 font-editorial font-bold text-lg flex items-center justify-center">
              02
            </div>
            <h3 className="font-editorial text-base font-bold text-stone-900">
              See relevant schools
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed font-sans">
              We review verified school disclosures across CBSE, ICSE, Cambridge, and IB institutions across Chennai.
            </p>
          </div>

          <div className="bg-[#FAF9F6] p-5 sm:p-6 rounded-2xl border border-stone-200/90 shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-violet-100 text-violet-900 font-editorial font-bold text-lg flex items-center justify-center">
              03
            </div>
            <h3 className="font-editorial text-base font-bold text-stone-900">
              See why each school matches
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed font-sans">
              Every school card clearly points out verified fits, trade-offs, and things you may want to check directly with the school.
            </p>
          </div>

          <div className="bg-[#FAF9F6] p-5 sm:p-6 rounded-2xl border border-stone-200/90 shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 font-editorial font-bold text-lg flex items-center justify-center">
              04
            </div>
            <h3 className="font-editorial text-base font-bold text-stone-900">
              Compare & apply with calm
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed font-sans">
              Review side-by-side fee schedules, student-teacher ratios, and monsoon transit realities to make confident shortlists.
            </p>
          </div>
        </div>
      </section>

      {/* TRUST & TRANSPARENCY PLEDGE */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 sm:mt-24">
        <div className="bg-stone-900 rounded-3xl text-white p-7 sm:p-12 relative overflow-hidden shadow-xl">
          
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-teal-600/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-2xl relative z-10 space-y-4">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-400 uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>Our Transparency Pledge to Parents</span>
            </div>
            <h2 className="font-editorial text-2xl sm:text-3xl font-bold tracking-tight text-white leading-tight">
              No sponsored rankings. No hidden admission commissions.
            </h2>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-sans">
              Conventional education portals rank whichever school purchases premium advertising packages. FindMySchool is grounded entirely in audited fee receipts, notified circulars under the Tamil Nadu Fee Committee, and honest trade-off indicators.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                <span className="text-stone-300">
                  <strong className="text-white block font-sans">Audited Fee Receipts:</strong> Every fee breakdown clearly lists source documents and verified quarterly splits.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                <span className="text-stone-300">
                  <strong className="text-white block font-sans">Explainable Matches:</strong> You always know exactly why a school was recommended for your child.
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
