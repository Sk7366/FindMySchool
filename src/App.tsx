import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SearchProvider } from './context/SearchContext';
import { ShortlistProvider } from './context/ShortlistContext';
import { ComparisonProvider } from './context/ComparisonContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { HomePage } from './pages/HomePage';
import { SearchResultsPage } from './pages/SearchResultsPage';
import { SchoolProfilePage } from './pages/SchoolProfilePage';
import { ComparePage } from './pages/ComparePage';
import { HowItWorksPage } from './pages/HowItWorksPage';
import { SchoolAdvisorModal } from './components/advisor/SchoolAdvisorModal';
import { ErrorBoundary } from './components/common/ErrorBoundary';

export default function App() {
  const [advisorOpen, setAdvisorOpen] = useState(false);
  const [advisorSchoolContext, setAdvisorSchoolContext] = useState<string | undefined>(undefined);

  const handleOpenAdvisor = (schoolName?: string) => {
    setAdvisorSchoolContext(schoolName);
    setAdvisorOpen(true);
  };

  const handleCloseAdvisor = () => {
    setAdvisorOpen(false);
    setAdvisorSchoolContext(undefined);
  };

  return (
    <ErrorBoundary>
      <SearchProvider>
        <ShortlistProvider>
          <ComparisonProvider>
            <BrowserRouter>
              <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-stone-900 selection:bg-teal-100 selection:text-teal-900">
                {/* Skip to Main Content Link for Keyboard Accessibility */}
                <a
                  href="#main-content"
                  className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#0D9488] focus:text-white focus:rounded-xl focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-white text-xs font-bold"
                >
                  Skip to main content
                </a>

                {/* Global Navigation Header */}
                <Navbar onOpenAdvisor={() => handleOpenAdvisor()} />

                {/* Main Routing Content */}
                <main id="main-content" tabIndex={-1} className="flex-1 focus:outline-none">
                  <ErrorBoundary>
                    <Routes>
                      <Route
                        path="/"
                        element={<HomePage onOpenAdvisor={() => handleOpenAdvisor()} />}
                      />
                      <Route
                        path="/search"
                        element={<SearchResultsPage />}
                      />
                      <Route
                        path="/results"
                        element={<SearchResultsPage />}
                      />
                      <Route
                        path="/school/:slug"
                        element={
                          <SchoolProfilePage
                            onOpenAdvisorWithSchool={(name) => handleOpenAdvisor(name)}
                          />
                        }
                      />
                      <Route
                        path="/compare"
                        element={<ComparePage />}
                      />
                      <Route
                        path="/preschools"
                        element={<Navigate to="/results?target=preschool" replace />}
                      />
                      <Route
                        path="/shortlist"
                        element={<Navigate to="/results?filter=saved" replace />}
                      />
                      <Route
                        path="/how-it-works"
                        element={<HowItWorksPage />}
                      />
                      <Route
                        path="*"
                        element={<Navigate to="/" replace />}
                      />
                    </Routes>
                  </ErrorBoundary>
                </main>

                {/* Global Footer */}
                <Footer />

                {/* Global Floating AI School Advisor Dialog */}
                <SchoolAdvisorModal
                  isOpen={advisorOpen}
                  onClose={handleCloseAdvisor}
                  contextSchoolName={advisorSchoolContext}
                />
              </div>
            </BrowserRouter>
          </ComparisonProvider>
        </ShortlistProvider>
      </SearchProvider>
    </ErrorBoundary>
  );
}
