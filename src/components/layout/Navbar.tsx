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
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
        
        {/* Zone 1: Wordmark */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <Link
            to="/"
            className="flex items-center gap-2 group focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 rounded-sm"
          >
            <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center text-white font-display font-bold text-lg shadow-xs group-hover:bg-teal-700 transition-colors shrink-0">
              F
            </div>
            <span className="font-display font-bold text-lg sm:text-xl tracking-tight text-slate-900 group-hover:text-teal-900 transition-colors">
              FindMySchool
            </span>
          </Link>
          <span className="hidden lg:inline-block text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
            Chennai Edition
          </span>
        </div>

        {/* Zone 2: Navigation Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-7 text-sm font-medium text-slate-600">
          <Link
            to="/results"
            className={`transition-colors hover:text-slate-900 ${
              isActive('/results') || isActive('/search') ? 'text-teal-700 font-semibold' : ''
            }`}
          >
            Find Schools
          </Link>

          <Link
            to="/how-it-works"
            className={`transition-colors hover:text-slate-900 ${
              isActive('/how-it-works') ? 'text-teal-700 font-semibold' : ''
            }`}
          >
            How It Works
          </Link>

          <Link
            to="/compare"
            className={`inline-flex items-center gap-1.5 transition-colors hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 rounded px-1 ${
              isActive('/compare') ? 'text-teal-700 font-semibold' : ''
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>Compare</span>
            {comparisonIds.length > 0 && (
              <span className="ml-0.5 px-1.5 py-0.5 text-[11px] font-semibold rounded-full bg-teal-100 text-teal-800">
                {comparisonIds.length}
              </span>
            )}
          </Link>

          <Link
            to="/results?filter=saved"
            className="inline-flex items-center gap-1.5 transition-colors hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 rounded px-1"
          >
            <Bookmark className="w-4 h-4" />
            <span>Shortlist</span>
            {savedIds.length > 0 && (
              <span className="ml-0.5 px-1.5 py-0.5 text-[11px] font-semibold rounded-full bg-slate-100 text-slate-700">
                {savedIds.length}
              </span>
            )}
          </Link>
        </nav>

        {/* Zone 3: Primary Action & Advisor Trigger */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onOpenAdvisor}
            className="inline-flex items-center gap-1.5 px-2.5 py-2 sm:px-3.5 sm:py-2 text-xs sm:text-sm font-semibold text-teal-800 bg-teal-50 border border-teal-200/80 rounded-lg hover:bg-teal-100 hover:border-teal-300 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 cursor-pointer shadow-2xs min-h-[40px] sm:min-h-[42px]"
            aria-label="Open AI School Advisor"
          >
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-teal-600 shrink-0" />
            <span className="whitespace-nowrap">
              <span className="hidden min-[380px]:inline">School </span>Advisor
            </span>
          </button>

          <Link
            to="/results"
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors shadow-2xs cursor-pointer min-h-[40px] sm:min-h-[42px]"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search</span>
          </Link>

          {/* Mobile menu button with 44px minimum tap target */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden min-h-[44px] min-w-[44px] p-2 flex items-center justify-center text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer with Backdrop */}
      {mobileMenuOpen && (
        <div className="fixed inset-x-0 top-16 bottom-0 z-50 md:hidden bg-slate-900/40 backdrop-blur-xs flex flex-col justify-start animate-in fade-in duration-150">
          <div className="bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-4 shadow-xl animate-in slide-in-from-top-2 duration-150 max-h-[85vh] overflow-y-auto">
            
            {/* Quick Action Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1 pb-3 border-b border-slate-100">
              <Link
                to="/results"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 py-3 px-3 bg-teal-600 text-white rounded-xl text-xs font-semibold shadow-2xs hover:bg-teal-700 transition-colors min-h-[44px]"
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
                className="flex items-center justify-center gap-2 py-3 px-3 bg-teal-50 border border-teal-200/80 text-teal-800 rounded-xl text-xs font-semibold hover:bg-teal-100 transition-colors min-h-[44px]"
              >
                <Sparkles className="w-4 h-4 text-teal-600" />
                <span>School Advisor</span>
              </button>
            </div>

            {/* Navigation Links with min 44px touch targets */}
            <nav className="flex flex-col space-y-1">
              <Link
                to="/results"
                onClick={() => setMobileMenuOpen(false)}
                className={`min-h-[44px] px-3.5 py-2.5 rounded-lg text-sm font-semibold flex items-center justify-between transition-colors ${
                  isActive('/results') ? 'bg-teal-50 text-teal-900' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>Browse All Schools</span>
                <span className="text-xs font-medium text-teal-700 bg-teal-50/80 px-2 py-0.5 rounded border border-teal-100">
                  12 in Chennai
                </span>
              </Link>

              <Link
                to="/compare"
                onClick={() => setMobileMenuOpen(false)}
                className={`min-h-[44px] px-3.5 py-2.5 rounded-lg text-sm font-semibold flex items-center justify-between transition-colors ${
                  isActive('/compare') ? 'bg-teal-50 text-teal-900' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Scale className="w-4 h-4 text-slate-500" />
                  <span>Compare Schools</span>
                </div>
                {comparisonIds.length > 0 ? (
                  <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-teal-100 text-teal-800">
                    {comparisonIds.length} active
                  </span>
                ) : (
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                )}
              </Link>

              <Link
                to="/results?filter=saved"
                onClick={() => setMobileMenuOpen(false)}
                className="min-h-[44px] px-3.5 py-2.5 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Bookmark className="w-4 h-4 text-slate-500" />
                  <span>Shortlisted Schools</span>
                </div>
                {savedIds.length > 0 ? (
                  <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-slate-100 text-slate-800">
                    {savedIds.length} saved
                  </span>
                ) : (
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                )}
              </Link>

              <Link
                to="/how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className={`min-h-[44px] px-3.5 py-2.5 rounded-lg text-sm font-semibold flex items-center justify-between transition-colors ${
                  isActive('/how-it-works') ? 'bg-teal-50 text-teal-900' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>How FindMySchool Works</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </Link>
            </nav>

            <div className="pt-2 border-t border-slate-100 text-center">
              <span className="text-[11px] text-slate-500 font-medium">
                FindMySchool · Free independent parent decision platform
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

