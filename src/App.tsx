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
    <SearchProvider>
      <ShortlistProvider>
        <ComparisonProvider>
          <BrowserRouter>
            <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-teal-100 selection:text-teal-900">
              
              {/* Global Navigation Header */}
              <Navbar onOpenAdvisor={() => handleOpenAdvisor()} />

              {/* Main Routing Content */}
              <main className="flex-1">
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
                    path="/how-it-works"
                    element={<HowItWorksPage />}
                  />
                  <Route
                    path="*"
                    element={<Navigate to="/" replace />}
                  />
                </Routes>
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
  );
}
