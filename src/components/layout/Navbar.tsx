import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sparkles, Scale, Bookmark, Menu, X, Search, ChevronRight } from 'lucide-react';
import { useComparison } from '../../context/ComparisonContext';
import { useShortlist } from '../../context/ShortlistContext';

interface NavbarProps {
  onOpenAdvisor?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAdvisor }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { comparisonIds } = useComparison();
  const { savedIds } = useShortlist();

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname, location.search]);

  // Handle Escape key to close mobile menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  // Prevent body scrolling when mobile menu drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 w-full bg-[#FAF9F6]/95 backdrop-blur-md border-b border-stone-200/80 transition-colors">
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
        
        {/* Zone 1: Wordmark */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <Link
            to="/"
            className="flex items-center gap-2.5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 rounded-sm"
          >
            <div className="w-8 h-8 rounded-lg bg-[#0D9488] flex items-center justify-center text-white font-editorial font-bold text-lg shadow-2xs group-hover:bg-[#115E59] transition-all transform group-hover:scale-105 shrink-0">
              F
            </div>
            <span className="font-editorial font-bold text-lg min-[360px]:text-xl sm:text-2xl tracking-tight text-stone-900 group-hover:text-teal-900 transition-colors">
              FindMySchool
            </span>
          </Link>
          <span className="hidden lg:inline-flex items-center gap-1 text-[11px] font-medium text-stone-600 bg-[#F5F1E8] px-2.5 py-0.5 rounded-full border border-stone-200/70">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            Chennai Edition
          </span>
        </div>

        {/* Zone 2: Navigation Links (Desktop) */}
        <nav className="hidden lg:flex items-center gap-3.5 xl:gap-6 text-sm font-medium text-stone-600 shrink-0">
          <Link
            to="/results?target=preschool"
            className={`relative py-1 whitespace-nowrap transition-colors hover:text-stone-900 ${
              location.search.includes('target=preschool') ? 'text-amber-950 font-bold' : ''
            }`}
          >
            <span>Preschools</span>
            {location.search.includes('target=preschool') && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-amber-500 rounded-full"></span>
            )}
          </Link>

          <Link
            to="/results?target=school"
            className={`relative py-1 whitespace-nowrap transition-colors hover:text-stone-900 ${
              location.search.includes('target=school') ? 'text-teal-950 font-bold' : ''
            }`}
          >
            <span>Schools</span>
            {location.search.includes('target=school') && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#0D9488] rounded-full"></span>
            )}
          </Link>

          <Link
            to="/results"
            className={`relative py-1 whitespace-nowrap transition-colors hover:text-stone-900 ${
              (isActive('/results') || isActive('/search')) && !location.search.includes('target=') ? 'text-teal-900 font-semibold' : ''
            }`}
          >
            <span>Explore</span>
            {(isActive('/results') || isActive('/search')) && !location.search.includes('target=') && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#0D9488] rounded-full"></span>
            )}
          </Link>

          <Link
            to="/how-it-works"
            className={`relative py-1 whitespace-nowrap transition-colors hover:text-stone-900 ${
              isActive('/how-it-works') ? 'text-teal-900 font-semibold' : ''
            }`}
          >
            <span>How It Works</span>
            {isActive('/how-it-works') && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#0D9488] rounded-full"></span>
            )}
          </Link>

          <Link
            to="/compare"
            className={`relative py-1 inline-flex items-center gap-1.5 whitespace-nowrap transition-colors hover:text-stone-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 rounded px-1 ${
              isActive('/compare') ? 'text-teal-900 font-semibold' : ''
            }`}
          >
            <Scale className="w-4 h-4 text-stone-500 shrink-0" />
            <span>Compare</span>
            {comparisonIds.length > 0 && (
              <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-teal-100 text-teal-800 border border-teal-200/80 shrink-0">
                {comparisonIds.length}
              </span>
            )}
            {isActive('/compare') && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#0D9488] rounded-full"></span>
            )}
          </Link>

          <Link
            to="/results?filter=saved"
            className="relative py-1 inline-flex items-center gap-1.5 whitespace-nowrap transition-colors hover:text-stone-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 rounded px-1"
          >
            <Bookmark className="w-4 h-4 text-stone-500 shrink-0" />
            <span>Shortlist</span>
            {savedIds.length > 0 && (
              <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-amber-100 text-amber-900 border border-amber-200/80 shrink-0">
                {savedIds.length}
              </span>
            )}
          </Link>
        </nav>

        {/* Zone 3: Primary Action & Advisor Trigger */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onOpenAdvisor}
            className="inline-flex items-center gap-1.5 px-3 py-2 sm:px-3.5 sm:py-2 text-xs sm:text-sm font-semibold text-teal-950 bg-[#F5F1E8] border border-teal-200/80 rounded-lg hover:bg-teal-50 hover:border-teal-300 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 cursor-pointer shadow-2xs min-h-[40px] sm:min-h-[42px] group whitespace-nowrap"
            aria-label="Open School Advisor"
          >
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600 group-hover:scale-110 transition-transform shrink-0" />
            <span className="whitespace-nowrap">
              <span className="hidden min-[420px]:inline">School </span>Advisor
            </span>
          </button>

          <Link
            to="/results"
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 lg:px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-[#0D9488] hover:bg-[#115E59] rounded-lg transition-all shadow-2xs hover:shadow-xs cursor-pointer min-h-[40px] sm:min-h-[42px] whitespace-nowrap shrink-0"
          >
            <Search className="w-3.5 h-3.5 shrink-0" />
            <span>Search</span>
          </Link>

          {/* Mobile menu button with 44px minimum tap target */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden min-h-[44px] min-w-[44px] p-2 flex items-center justify-center text-stone-700 hover:text-stone-950 rounded-lg hover:bg-stone-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer with Backdrop */}
      {mobileMenuOpen && (
        <div className="fixed inset-x-0 top-16 bottom-0 z-50 lg:hidden bg-stone-900/40 backdrop-blur-xs flex flex-col justify-start animate-in fade-in duration-150">
          <div className="bg-[#FAF9F6] border-b border-stone-200 px-4 pt-3 pb-6 space-y-4 shadow-xl animate-in slide-in-from-top-2 duration-150 max-h-[85vh] overflow-y-auto">
            
            {/* Quick Action Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1 pb-3 border-b border-stone-200/70">
              <Link
                to="/results"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 py-3 px-3 bg-[#0D9488] text-white rounded-xl text-xs font-semibold shadow-2xs hover:bg-[#115E59] transition-colors min-h-[44px]"
              >
                <Search className="w-4 h-4" />
                <span>Find Schools</span>
              </Link>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAdvisor?.();
                }}
                className="flex items-center justify-center gap-2 py-3 px-3 bg-[#F5F1E8] border border-teal-200/80 text-teal-950 rounded-xl text-xs font-semibold hover:bg-teal-50 transition-colors min-h-[44px]"
              >
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>School Advisor</span>
              </button>
            </div>

            {/* Navigation Links with min 44px touch targets */}
            <nav className="flex flex-col space-y-1">
              <Link
                to="/results?target=preschool"
                onClick={() => setMobileMenuOpen(false)}
                className={`min-h-[44px] px-3.5 py-2.5 rounded-lg text-sm font-semibold flex items-center justify-between transition-colors ${
                  location.search.includes('target=preschool') ? 'bg-[#F5F1E8] text-amber-950 border border-amber-200' : 'text-stone-700 hover:bg-stone-100'
                }`}
              >
                <span>Preschools & Early Years</span>
                <span className="text-xs font-medium text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  Playschools & Nursery
                </span>
              </Link>

              <Link
                to="/results?target=school"
                onClick={() => setMobileMenuOpen(false)}
                className={`min-h-[44px] px-3.5 py-2.5 rounded-lg text-sm font-semibold flex items-center justify-between transition-colors ${
                  location.search.includes('target=school') ? 'bg-[#F5F1E8] text-teal-900 border border-teal-200/60' : 'text-stone-700 hover:bg-stone-100'
                }`}
              >
                <span>Regular K–12 Schools</span>
                <span className="text-xs font-medium text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                  CBSE / Cambridge / IB
                </span>
              </Link>

              <Link
                to="/results"
                onClick={() => setMobileMenuOpen(false)}
                className={`min-h-[44px] px-3.5 py-2.5 rounded-lg text-sm font-semibold flex items-center justify-between transition-colors ${
                  isActive('/results') && !location.search.includes('target=') ? 'bg-[#F5F1E8] text-teal-900 border border-teal-200/60' : 'text-stone-700 hover:bg-stone-100'
                }`}
              >
                <span>Browse All Places</span>
                <span className="text-xs font-medium text-stone-600 bg-white px-2 py-0.5 rounded border border-stone-200">
                  Chennai Directory
                </span>
              </Link>

              <Link
                to="/compare"
                onClick={() => setMobileMenuOpen(false)}
                className={`min-h-[44px] px-3.5 py-2.5 rounded-lg text-sm font-semibold flex items-center justify-between transition-colors ${
                  isActive('/compare') ? 'bg-[#F5F1E8] text-teal-900 border border-teal-200/60' : 'text-stone-700 hover:bg-stone-100'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Scale className="w-4 h-4 text-stone-500" />
                  <span>Compare Schools</span>
                </div>
                {comparisonIds.length > 0 ? (
                  <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-teal-100 text-teal-900 border border-teal-200">
                    {comparisonIds.length} active
                  </span>
                ) : (
                  <ChevronRight className="w-4 h-4 text-stone-400" />
                )}
              </Link>

              <Link
                to="/results?filter=saved"
                onClick={() => setMobileMenuOpen(false)}
                className="min-h-[44px] px-3.5 py-2.5 rounded-lg text-sm font-semibold text-stone-700 hover:bg-stone-100 flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Bookmark className="w-4 h-4 text-stone-500" />
                  <span>Shortlisted Schools</span>
                </div>
                {savedIds.length > 0 ? (
                  <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                    {savedIds.length} saved
                  </span>
                ) : (
                  <ChevronRight className="w-4 h-4 text-stone-400" />
                )}
              </Link>

              <Link
                to="/how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className={`min-h-[44px] px-3.5 py-2.5 rounded-lg text-sm font-semibold flex items-center justify-between transition-colors ${
                  isActive('/how-it-works') ? 'bg-[#F5F1E8] text-teal-900 border border-teal-200/60' : 'text-stone-700 hover:bg-stone-100'
                }`}
              >
                <span>How FindMySchool Works</span>
                <ChevronRight className="w-4 h-4 text-stone-400" />
              </Link>
            </nav>

            <div className="pt-2 border-t border-stone-200/70 text-center">
              <span className="text-[11px] text-stone-500 font-medium">
                FindMySchool · Independent parent decision platform
              </span>
            </div>
          </div>
          
          {/* Backdrop click to close */}
          <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
        </div>
      )}
    </header>
  );
};

