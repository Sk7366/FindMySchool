import React, { createContext, useContext, useState, useEffect } from 'react';
import { CHENNAI_SCHOOLS } from '../data/schools';
import { School } from '../types/school';

interface ShortlistContextType {
  savedIds: string[];
  savedSchools: School[];
  toggleSave: (schoolId: string) => void;
  isSaved: (schoolId: string) => boolean;
  clearShortlist: () => void;
  isDemoMode: boolean;
  loadDemoShortlist: () => void;
}

const ShortlistContext = createContext<ShortlistContextType | undefined>(undefined);

export const ShortlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [savedIds, setSavedIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('fms_shortlist');
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
      return localStorage.getItem('fms_shortlist_is_demo') === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('fms_shortlist', JSON.stringify(savedIds));
      if (savedIds.length === 0 && isDemoMode) {
        setIsDemoMode(false);
        localStorage.removeItem('fms_shortlist_is_demo');
      }
    } catch {
      // ignore storage errors
    }
  }, [savedIds, isDemoMode]);

  const loadDemoShortlist = () => {
    setSavedIds(['sch-001', 'sch-002']);
    setIsDemoMode(true);
    try {
      localStorage.setItem('fms_shortlist_is_demo', 'true');
    } catch {}
  };

  const toggleSave = (schoolId: string) => {
    setSavedIds((prev) => {
      const next = prev.includes(schoolId) ? prev.filter((id) => id !== schoolId) : [...prev, schoolId];
      if (isDemoMode) {
        setIsDemoMode(false);
        try {
          localStorage.removeItem('fms_shortlist_is_demo');
        } catch {}
      }
      return next;
    });
  };

  const isSaved = (schoolId: string) => savedIds.includes(schoolId);

  const clearShortlist = () => {
    setSavedIds([]);
    setIsDemoMode(false);
    try {
      localStorage.removeItem('fms_shortlist_is_demo');
    } catch {}
  };

  const savedSchools = CHENNAI_SCHOOLS.filter((s) => savedIds.includes(s.id));

  return (
    <ShortlistContext.Provider
      value={{
        savedIds,
        savedSchools,
        toggleSave,
        isSaved,
        clearShortlist,
        isDemoMode,
        loadDemoShortlist,
      }}
    >
      {children}
    </ShortlistContext.Provider>
  );
};

export const useShortlist = () => {
  const ctx = useContext(ShortlistContext);
  if (!ctx) throw new Error('useShortlist must be used within ShortlistProvider');
  return ctx;
};
