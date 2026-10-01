import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Search, 
  Sparkles, 
  MapPin, 
  GraduationCap, 
  IndianRupee, 
  BookOpen, 
  Trophy, 
  HeartHandshake, 
  ArrowRight, 
  Mic, 
  Compass, 
  Check, 
  SlidersHorizontal, 
  ChevronRight, 
  Baby, 
  School as SchoolIcon, 
  Layers 
} from 'lucide-react';
import { useSearch } from '../context/SearchContext';
import { GuidedSearchModal, GuidedCategory } from '../components/search/GuidedSearchModal';
import { SchoolCard } from '../components/schools/SchoolCard';
import { CHENNAI_SCHOOLS } from '../data/schools';
import { CHENNAI_HUBS } from '../utils/categoryColors';
import { EducationTargetType } from '../types/search';

const PRESCHOOL_PROMPTS = [
  "Find a Montessori preschool for my 3-year-old near Velachery with daycare.",
  "Looking for a safe nursery near Anna Nagar with outdoor play.",
  "Toddler playschool with low ratio and extended hours near Porur.",
  "Preschool with certified early years educators and sand pit in Adyar.",
];

const SCHOOL_PROMPTS = [
  "Find a CBSE school for my 8-year-old near Anna Nagar under ₹1.5 lakh.",
  "Looking for a school with strong sports facilities near OMR.",
  "Cambridge IGCSE school with robotics lab near Velachery under ₹2L.",
  "ICSE day school with swimming pool and low student-teacher ratio near Tambaram.",
];

const COMBINED_PROMPTS = [
  "Find a school that offers preschool through Grade 12 near OMR.",
  "Early years through Class 12 campus with CBSE and daycare near Porur.",
  "Nursery to Grade 12 school with green campus and swimming near Adyar.",
  "Preschool through Grade 12 Cambridge academy with sports turf near Tambaram.",
];

const ALL_PROMPTS = [
  "Find a Montessori preschool for my 3-year-old near Velachery with daycare.",
  "Find a CBSE school for my 8-year-old near Anna Nagar under ₹1.5 lakh.",
  "Looking for a safe nursery near Anna Nagar with outdoor play.",
  "Find a school that offers preschool through Grade 12 near OMR.",
];

interface HomePageProps {
  onOpenAdvisor: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onOpenAdvisor }) => {
  const navigate = useNavigate();
  const { searchState, setRawQuery, applyNaturalLanguageQuery, setEducationTarget } = useSearch();
  
  const [selectedTarget, setSelectedTarget] = useState<EducationTargetType>(searchState.filters.educationTarget || 'all');
  const [localQuery, setLocalQuery] = useState(searchState.rawQuery || '');
  const [guidedModalOpen, setGuidedModalOpen] = useState(false);
  const [selectedGuidedCategory, setSelectedGuidedCategory] = useState<GuidedCategory>('location');
  const [isListening, setIsListening] = useState(false);
  const [promptIndex, setPromptIndex] = useState(0);

  // Sync selected target with SearchContext
  const handleTargetChange = (target: EducationTargetType) => {
    setSelectedTarget(target);
    setEducationTarget(target);
    setPromptIndex(0);
  };

  // Dynamic Concept Detection preview
  const detectedConcepts = useMemo(() => {
    const q = localQuery.toLowerCase();
    const concepts: { id: string; label: string; color: string; icon: string }[] = [];
    
    // Preschool & Age detection
    if (q.includes('montessori')) {
      concepts.push({ id: 'c-mont', label: 'Approach: Montessori', color: 'bg-sky-50 text-sky-900 border-sky-200', icon: 'Baby' });
    } else if (q.includes('play-way') || q.includes('playway')) {
      concepts.push({ id: 'c-playway', label: 'Approach: Play-way', color: 'bg-emerald-50 text-emerald-900 border-emerald-200', icon: 'Baby' });
    } else if (q.includes('reggio')) {
      concepts.push({ id: 'c-reggio', label: 'Approach: Reggio Emilia', color: 'bg-violet-50 text-violet-900 border-violet-200', icon: 'Baby' });
    } else if (q.includes('waldorf')) {
      concepts.push({ id: 'c-waldorf', label: 'Approach: Waldorf-inspired', color: 'bg-amber-50 text-amber-900 border-amber-200', icon: 'Baby' });
    }

    if (q.includes('3-year') || q.includes('3 year')) {
      concepts.push({ id: 'c-age3', label: 'Child: 3 years old', color: 'bg-amber-100 text-amber-950 border-amber-300', icon: 'Baby' });
    } else if (q.includes('4-year') || q.includes('4 year')) {
      concepts.push({ id: 'c-age4', label: 'Child: 4 years old', color: 'bg-amber-100 text-amber-950 border-amber-300', icon: 'Baby' });
    } else if (q.includes('2-year') || q.includes('2 year')) {
      concepts.push({ id: 'c-age2', label: 'Child: 2 years old', color: 'bg-amber-100 text-amber-950 border-amber-300', icon: 'Baby' });
    }

    if (q.includes('nursery')) {
      concepts.push({ id: 'c-nurs', label: 'Program: Nursery', color: 'bg-amber-50 text-amber-900 border-amber-200', icon: 'Baby' });
    } else if (q.includes('playgroup')) {
      concepts.push({ id: 'c-pg', label: 'Program: Playgroup', color: 'bg-amber-50 text-amber-900 border-amber-200', icon: 'Baby' });
    } else if (q.includes('lkg')) {
      concepts.push({ id: 'c-lkg', label: 'Program: LKG', color: 'bg-amber-50 text-amber-900 border-amber-200', icon: 'Baby' });
    } else if (q.includes('ukg')) {
      concepts.push({ id: 'c-ukg', label: 'Program: UKG', color: 'bg-amber-50 text-amber-900 border-amber-200', icon: 'Baby' });
    }

    if (q.includes('daycare') || q.includes('extended hours')) {
      concepts.push({ id: 'c-daycare', label: 'Daycare: Preferred', color: 'bg-teal-50 text-teal-900 border-teal-200', icon: 'Heart' });
    }
    if (q.includes('outdoor play') || q.includes('sand pit') || q.includes('garden')) {
      concepts.push({ id: 'c-outdoor', label: 'Outdoor Play: Must-have', color: 'bg-emerald-50 text-emerald-900 border-emerald-200', icon: 'Tree' });
    }

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
    if (q.includes('50k') || q.includes('50,000') || q.includes('80,000') || q.includes('80k')) {
      concepts.push({ id: 'c-budget-pre', label: 'Budget: Under ₹80k/yr', color: 'bg-amber-50 text-amber-900 border-amber-200', icon: 'Rupee' });
    } else if (q.includes('1 lakh') || q.includes('1l') || q.includes('1.2') || q.includes('budget') || q.includes('under') || q.includes('₹')) {
      concepts.push({ id: 'c-budget', label: 'Budget Cap: ₹1.2L/yr', color: 'bg-amber-50 text-amber-900 border-amber-200', icon: 'Rupee' });
    }

    // Location detection
    if (q.includes('tambaram')) {
      concepts.push({ id: 'c-tamb', label: 'Hub: Tambaram / GST', color: 'bg-teal-50 text-teal-900 border-teal-200', icon: 'Pin' });
    } else if (q.includes('omr') || q.includes('sholinganallur') || q.includes('karapakkam')) {
      concepts.push({ id: 'c-omr', label: 'Hub: OMR Corridor', color: 'bg-teal-50 text-teal-900 border-teal-200', icon: 'Pin' });
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
    if (q.includes('transport') || q.includes('bus') || q.includes('van')) {
      concepts.push({ id: 'c-trans', label: 'Transport Available', color: 'bg-stone-100 text-stone-800 border-stone-200', icon: 'Bus' });
    }

    return concepts;
  }, [localQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (localQuery.trim()) {
      applyNaturalLanguageQuery(localQuery);
    }
    navigate('/results', { state: { fromSearch: true } });
  };

  const handleExampleClick = (example: string) => {
    setLocalQuery(example);
    applyNaturalLanguageQuery(example);
    navigate('/results', { state: { fromSearch: true } });
  };

  const handleOpenGuidedCategory = (category: GuidedCategory) => {
    setSelectedGuidedCategory(category);
    setGuidedModalOpen(true);
  };

  const handleSimulateVoice = () => {
    setIsListening(true);
    setTimeout(() => {
      setIsListening(false);
      if (selectedTarget === 'preschool') {
        setLocalQuery("Montessori preschool for my 3-year-old near Velachery with daycare");
      } else {
        setLocalQuery("CBSE schools near Tambaram under ₹1.2 lakh with swimming pool");
      }
    }, 1200);
  };

  // Filtered featured list based on target
  const featuredSchools = useMemo(() => {
    if (selectedTarget === 'preschool') {
      return CHENNAI_SCHOOLS.filter((s) => s.institutionType === 'preschool' || s.institutionType === 'combined').slice(0, 3);
    }
    if (selectedTarget === 'school') {
      return CHENNAI_SCHOOLS.filter((s) => !s.institutionType || s.institutionType === 'school' || s.institutionType === 'combined').slice(0, 3);
    }
    return CHENNAI_SCHOOLS.slice(0, 3);
  }, [selectedTarget]);

  const currentPrompts = selectedTarget === 'preschool'
    ? PRESCHOOL_PROMPTS
    : selectedTarget === 'school'
    ? SCHOOL_PROMPTS
    : selectedTarget === 'combined'
    ? COMBINED_PROMPTS
    : ALL_PROMPTS;

  // Rotate placeholder every 4.2 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setPromptIndex((prev) => (prev + 1) % currentPrompts.length);
    }, 4200);
    return () => clearInterval(timer);
  }, [currentPrompts.length]);

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
              <span>Independent School & Early Years Discovery for Chennai Families</span>
              <span className="text-stone-400">·</span>
              <span className="text-teal-800 font-bold">Designed for transparent discovery</span>
            </div>

            {/* Display Heading: Fraunces / Editorial Serif */}
            <h1 className="font-editorial text-3xl xs:text-4xl sm:text-5xl lg:text-6xl text-stone-900 tracking-tight leading-[1.12]">
              Discover schools & early years that truly fit your child.
            </h1>

            {/* Supporting Copy */}
            <p className="mt-4 text-base sm:text-lg text-stone-600 max-w-2xl mx-auto leading-relaxed font-sans">
              From toddler playschools and Montessori environments to premier K–12 academies, compare learning approaches, realistic commute buffers, and transparent fee disclosures across Chennai.
            </p>
          </div>

          {/* EDUCATION STAGE SELECTOR (What are you looking for?) */}
          <div className="mt-8 max-w-2xl mx-auto text-center">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block mb-1">
              What are you looking for?
            </span>
            <p className="text-xs sm:text-sm text-stone-600 mb-3 font-sans max-w-lg mx-auto leading-relaxed">
              You can describe what you're looking for in your own words. No need to understand filters or school terminology before searching.
            </p>
            <div className="grid grid-cols-3 gap-2 p-1.5 bg-white/90 rounded-2xl border border-stone-200/90 shadow-2xs">
              <button
                type="button"
                onClick={() => handleTargetChange('preschool')}
                className={`py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 cursor-pointer ${
                  selectedTarget === 'preschool'
                    ? 'bg-amber-50 text-amber-950 border border-amber-300 shadow-2xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                }`}
              >
                <Baby className={`w-4 h-4 ${selectedTarget === 'preschool' ? 'text-amber-700' : 'text-stone-400'}`} />
                <span>Preschool & Early Years</span>
              </button>

              <button
                type="button"
                onClick={() => handleTargetChange('school')}
                className={`py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 cursor-pointer ${
                  selectedTarget === 'school'
                    ? 'bg-teal-50 text-teal-950 border border-teal-300 shadow-2xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                }`}
              >
                <SchoolIcon className={`w-4 h-4 ${selectedTarget === 'school' ? 'text-teal-700' : 'text-stone-400'}`} />
                <span>Regular School</span>
              </button>

              <button
                type="button"
                onClick={() => handleTargetChange('combined')}
                className={`py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 cursor-pointer ${
                  selectedTarget === 'combined'
                    ? 'bg-[#F5F1E8] text-stone-950 border border-stone-300 shadow-2xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                }`}
              >
                <Layers className={`w-4 h-4 ${selectedTarget === 'combined' ? 'text-stone-800' : 'text-stone-400'}`} />
                <span>Preschool + School</span>
              </button>
            </div>
          </div>

          {/* SIGNATURE NATURAL-LANGUAGE SEARCH BOX */}
          <div className="mt-6 max-w-3xl mx-auto">
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
                    placeholder={`e.g. "${currentPrompts[promptIndex] || currentPrompts[0]}"`}
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
                  <span>Pedagogy listed in demo data & transparent disclosures</span>
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
                    <span>See places that match your priorities</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Prompts adapted to selected education stage */}
            <div className="mt-4 max-w-3xl mx-auto space-y-2">
              <div className="flex items-center justify-between px-1 text-xs text-stone-500 font-medium">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Search examples in everyday words:</span>
                </span>
                <span className="text-[11px] text-stone-400 hidden sm:inline">Click any example to search</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {currentPrompts.slice(0, 4).map((example) => (
                  <button
                    key={example}
                    type="button"
                    onClick={() => handleExampleClick(example)}
                    className="p-2.5 sm:p-3 rounded-xl bg-white/90 hover:bg-white text-stone-700 hover:text-teal-950 text-xs text-left font-medium transition-all cursor-pointer border border-stone-200/90 shadow-2xs hover:shadow-xs hover:border-teal-300 flex items-start gap-2 group"
                  >
                    <span className="text-teal-600 font-bold text-sm leading-none shrink-0 group-hover:translate-x-0.5 transition-transform">
                      “
                    </span>
                    <span className="flex-1 leading-snug font-sans">
                      {example}
                    </span>
                  </button>
                ))}
              </div>
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
                onClick={() => handleOpenGuidedCategory('preschool')}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-amber-200/80 bg-amber-50/70 hover:bg-amber-100/70 text-xs font-semibold text-amber-950 transition-colors cursor-pointer min-h-[40px]"
              >
                <Baby className="w-3.5 h-3.5 text-amber-700" />
                <span>Playschool & Montessori</span>
              </button>

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
                <span>Fee Budget</span>
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

          {/* Minimalist Editorial Illustration Banner */}
          <div className="mt-12 max-w-4xl mx-auto rounded-2xl bg-gradient-to-b from-[#F5F1E8]/90 to-white border border-stone-200/80 p-6 sm:p-8 shadow-xs relative overflow-hidden">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
              <div className="max-w-md text-left space-y-2">
                <span className="text-[11px] font-bold text-teal-800 tracking-wider uppercase flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-teal-600" />
                  <span>Grounded in Chennai Realities</span>
                </span>
                <h3 className="font-editorial text-xl sm:text-2xl font-bold text-stone-900 leading-snug">
                  Curated campus disclosures, listed early childhood ratios, and zero marketing hype.
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed font-sans">
                  From Montessori sensory gardens in Velachery to high-performing CBSE and Cambridge institutions across Chennai.
                </p>
                <div className="pt-1 flex items-center gap-4 text-xs font-semibold text-stone-700">
                  <span className="flex items-center gap-1 text-teal-800">
                    <Check className="w-3.5 h-3.5 text-teal-600 stroke-[3]" />
                    <span>Listed fee benchmarks</span>
                  </span>
                  <span className="flex items-center gap-1 text-teal-800">
                    <Check className="w-3.5 h-3.5 text-teal-600 stroke-[3]" />
                    <span>Daycare & bus reality checks</span>
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
                  <circle cx="170" cy="190" r="140" stroke="#E7E5E4" strokeWidth="1" strokeDasharray="3 3" />
                  <circle cx="170" cy="190" r="100" stroke="#0D9488" strokeWidth="1" strokeOpacity="0.2" />
                  <line x1="20" y1="150" x2="320" y2="150" stroke="#78716C" strokeWidth="1.5" />
                  <polygon points="120,80 170,55 220,80" fill="#D97706" fillOpacity="0.15" stroke="#B45309" strokeWidth="1.2" />
                  <rect x="126" y="80" width="88" height="6" fill="#F5F5F4" stroke="#78716C" strokeWidth="1" />
                  <line x1="134" y1="86" x2="134" y2="150" stroke="#78716C" strokeWidth="2" strokeLinecap="round" />
                  <line x1="152" y1="86" x2="152" y2="150" stroke="#78716C" strokeWidth="2" strokeLinecap="round" />
                  <line x1="170" y1="86" x2="170" y2="150" stroke="#78716C" strokeWidth="2" strokeLinecap="round" />
                  <line x1="188" y1="86" x2="188" y2="150" stroke="#78716C" strokeWidth="2" strokeLinecap="round" />
                  <line x1="206" y1="86" x2="206" y2="150" stroke="#78716C" strokeWidth="2" strokeLinecap="round" />
                  <path d="M 134 100 Q 143 92 152 100" stroke="#0D9488" strokeWidth="1.2" fill="none" />
                  <path d="M 152 100 Q 161 92 170 100" stroke="#0D9488" strokeWidth="1.2" fill="none" />
                  <path d="M 170 100 Q 179 92 188 100" stroke="#0D9488" strokeWidth="1.2" fill="none" />
                  <path d="M 188 100 Q 197 92 206 100" stroke="#0D9488" strokeWidth="1.2" fill="none" />
                  <rect x="54" y="96" width="66" height="54" fill="#FAF9F6" stroke="#78716C" strokeWidth="1.2" />
                  <rect x="62" y="106" width="12" height="14" rx="2" fill="#3B82F6" fillOpacity="0.15" stroke="#3B82F6" strokeWidth="1" />
                  <rect x="80" y="106" width="12" height="14" rx="2" fill="#3B82F6" fillOpacity="0.15" stroke="#3B82F6" strokeWidth="1" />
                  <rect x="98" y="106" width="12" height="14" rx="2" fill="#3B82F6" fillOpacity="0.15" stroke="#3B82F6" strokeWidth="1" />
                  <rect x="220" y="96" width="66" height="54" fill="#FAF9F6" stroke="#78716C" strokeWidth="1.2" />
                  <rect x="230" y="106" width="12" height="14" rx="2" fill="#8B5CF6" fillOpacity="0.15" stroke="#8B5CF6" strokeWidth="1" />
                  <rect x="248" y="106" width="12" height="14" rx="2" fill="#8B5CF6" fillOpacity="0.15" stroke="#8B5CF6" strokeWidth="1" />
                  <circle cx="298" cy="98" r="22" fill="#10B981" fillOpacity="0.18" stroke="#059669" strokeWidth="1.2" />
                  <circle cx="106" cy="136" r="3.5" fill="#44403C" />
                  <path d="M 106 140 C 103 144 102 147 101 150" stroke="#44403C" strokeWidth="1.5" />
                  <polygon points="108,145 113,142 118,145 113,148" fill="#F59E0B" stroke="#D97706" strokeWidth="0.8" />
                  <circle cx="118" cy="137" r="3.5" fill="#44403C" />
                  <path d="M 118 141 C 120 145 121 147 122 150" stroke="#44403C" strokeWidth="1.5" />
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
              {selectedTarget === 'preschool' ? 'Early Years Worth Looking Into' : 'Places Worth Looking Into'}
            </span>
            <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight mt-0.5">
              {selectedTarget === 'preschool' 
                ? 'Preschools aligned with parent requirements'
                : 'Institutions that fit what parents are looking for'}
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 mt-1 font-sans">
              {selectedTarget === 'preschool'
                ? 'Nursery, Playgroup and Kindergarten programs with listed caregiver ratios and safe play environments.'
                : 'Places matching common family priorities across Chennai corridors.'}
            </p>
          </div>
          <Link
            to={`/results${selectedTarget !== 'all' ? `?target=${selectedTarget}` : ''}`}
            className="text-xs sm:text-sm font-bold text-teal-800 hover:text-teal-900 flex items-center gap-1 group py-1"
          >
            <span>Browse all listed places</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="space-y-4">
          {featuredSchools.map((school) => (
            <SchoolCard key={school.id} school={school} featured />
          ))}
        </div>
      </section>

      {/* EXPLORE BY CHENNAI AREA */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 sm:mt-24">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-3 border-b border-stone-200 gap-2">
          <div>
            <span className="text-xs font-bold text-teal-800 uppercase tracking-wider">
              Neighbourhood Discovery
            </span>
            <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight mt-0.5">
              Explore Chennai Corridors: Schools + Preschools
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-2xl font-sans">
              Commute reality defines family peace. Discover playschools and K–12 academies across Chennai's premier residential sectors.
            </p>
          </div>
          <Link
            to="/results"
            className="text-xs sm:text-sm font-bold text-teal-800 hover:text-teal-900 flex items-center gap-1 shrink-0 py-1"
          >
            <span>View All Zones</span>
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
                    {hub.schoolCount} listed institutions
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
                  <span>Explore schools & preschools</span>
                </span>
                <ChevronRight className="w-4 h-4 text-stone-400 group-hover:translate-x-1 group-hover:text-teal-700 transition-all" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Guided Search Modal */}
      <GuidedSearchModal
        isOpen={guidedModalOpen}
        onClose={() => setGuidedModalOpen(false)}
        initialCategory={selectedGuidedCategory}
      />
    </div>
  );
};
