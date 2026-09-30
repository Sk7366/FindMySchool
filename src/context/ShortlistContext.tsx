import React, { createContext, useContext, useState, useEffect } from 'react';
import { CHENNAI_SCHOOLS } from '../data/schools';
import { School } from '../types/school';

interface ShortlistContextType {
  savedIds: string[];
  savedSchools: School[];
  toggleSave: (schoolId: string) => void;
  isSaved: (schoolId: string) => boolean;
  clearShortlist: () => void;
}

const ShortlistContext = createContext<ShortlistContextType | undefined>(undefined);

export const ShortlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [savedIds, setSavedIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('fms_shortlist');
      return stored ? JSON.parse(stored) : ['sch-001', 'sch-002'];
    } catch {
      return ['sch-001', 'sch-002'];
    }
  });

  useEffect(() => {
    localStorage.setItem('fms_shortlist', JSON.stringify(savedIds));
  }, [savedIds]);

  const toggleSave = (schoolId: string) => {
    setSavedIds((prev) =>
      prev.includes(schoolId) ? prev.filter((id) => id !== schoolId) : [...prev, schoolId]
    );
  };

  const isSaved = (schoolId: string) => savedIds.includes(schoolId);

  const clearShortlist = () => setSavedIds([]);

  const savedSchools = CHENNAI_SCHOOLS.filter((s) => savedIds.includes(s.id));

  return (
    <ShortlistContext.Provider
      value={{
        savedIds,
        savedSchools,
        toggleSave,
        isSaved,
        clearShortlist,
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
