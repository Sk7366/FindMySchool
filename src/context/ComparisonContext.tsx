import React, { createContext, useContext, useState, useEffect } from 'react';
import { CHENNAI_SCHOOLS } from '../data/schools';
import { School } from '../types/school';

interface ComparisonContextType {
  comparisonIds: string[];
  comparisonSchools: School[];
  toggleComparison: (schoolId: string) => boolean; // returns true if added, false if removed or limit reached
  isComparing: (schoolId: string) => boolean;
  removeFromComparison: (schoolId: string) => void;
  clearComparison: () => void;
  maxComparisonLimit: number;
  isDemoMode: boolean;
  loadDemoComparison: () => void;
}

const ComparisonContext = createContext<ComparisonContextType | undefined>(undefined);

export const ComparisonProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [comparisonIds, setComparisonIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('fms_comparison');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed.filter((id): id is string => typeof id === 'string');
        }
      }
      return [];
    } catch {
      return [];
    }
  });

  const [isDemoMode, setIsDemoMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem('fms_comparison_is_demo') === 'true';
    } catch {
      return false;
    }
  });

  const maxComparisonLimit = 4;

  useEffect(() => {
    try {
      localStorage.setItem('fms_comparison', JSON.stringify(comparisonIds));
      if (comparisonIds.length === 0 && isDemoMode) {
        setIsDemoMode(false);
        localStorage.removeItem('fms_comparison_is_demo');
      }
    } catch {
      // ignore storage errors
    }
  }, [comparisonIds, isDemoMode]);

  const loadDemoComparison = () => {
    setComparisonIds(['sch-001', 'sch-002']);
    setIsDemoMode(true);
    try {
      localStorage.setItem('fms_comparison_is_demo', 'true');
    } catch {}
  };

  const toggleComparison = (schoolId: string): boolean => {
    if (comparisonIds.includes(schoolId)) {
      setComparisonIds((prev) => prev.filter((id) => id !== schoolId));
      return false;
    }
    if (comparisonIds.length >= maxComparisonLimit) {
      return false;
    }
    // If user adds manually, clear demo flag
    if (isDemoMode) {
      setIsDemoMode(false);
      try {
        localStorage.removeItem('fms_comparison_is_demo');
      } catch {}
    }
    setComparisonIds((prev) => [...prev, schoolId]);
    return true;
  };

  const isComparing = (schoolId: string) => comparisonIds.includes(schoolId);

  const removeFromComparison = (schoolId: string) => {
    setComparisonIds((prev) => prev.filter((id) => id !== schoolId));
  };

  const clearComparison = () => {
    setComparisonIds([]);
    setIsDemoMode(false);
    try {
      localStorage.removeItem('fms_comparison_is_demo');
    } catch {}
  };

  const comparisonSchools = CHENNAI_SCHOOLS.filter((s) => comparisonIds.includes(s.id));

  return (
    <ComparisonContext.Provider
      value={{
        comparisonIds,
        comparisonSchools,
        toggleComparison,
        isComparing,
        removeFromComparison,
        clearComparison,
        maxComparisonLimit,
        isDemoMode,
        loadDemoComparison,
      }}
    >
      {children}
    </ComparisonContext.Provider>
  );
};

export const useComparison = () => {
  const ctx = useContext(ComparisonContext);
  if (!ctx) throw new Error('useComparison must be used within ComparisonProvider');
  return ctx;
};
