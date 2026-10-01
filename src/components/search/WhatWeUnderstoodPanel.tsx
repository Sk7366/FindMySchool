import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Edit3, 
  X, 
  Sliders, 
  ChevronDown, 
  ChevronUp, 
  Baby, 
  MapPin, 
  IndianRupee, 
  BookOpen, 
  Heart, 
  TreePine, 
  Bus,
  Sparkles,
  School as SchoolIcon
} from 'lucide-react';
import { useSearch } from '../../context/SearchContext';
import { PreschoolProgram, Curriculum } from '../../types/school';

interface WhatWeUnderstoodPanelProps {
  onOpenPriorityTuner: () => void;
}

export const WhatWeUnderstoodPanel: React.FC<WhatWeUnderstoodPanelProps> = ({ onOpenPriorityTuner }) => {
  const { searchState, updateFilters, setEducationTarget } = useSearch();
  const { filters, rawQuery } = searchState;
  const [isExpanded, setIsExpanded] = useState(true);
  const [editingField, setEditingField] = useState<string | null>(null);

  const isPreschool = filters?.educationTarget === 'preschool' || 
    Boolean(filters?.preschool?.programs && filters.preschool.programs.length > 0) ||
    Boolean(filters?.preschool?.ageYears);

  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-2xs overflow-hidden transition-all mb-4">
      {/* Header bar */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-4 sm:px-5 flex items-center justify-between cursor-pointer hover:bg-stone-50/70 transition-colors select-none"
      >
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-teal-600 animate-pulse" />
            <h3 className="font-editorial text-sm sm:text-base font-bold text-stone-900">
              Here's what we understood from your search
            </h3>
          </div>

          {/* Calm, parent-friendly confidence pill */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-[11px] font-semibold text-teal-900">
            <CheckCircle2 className="w-3.5 h-3.5 text-teal-700" />
            <span>We're fairly confident we understood your preferences</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-stone-400">
          <span className="text-xs font-semibold text-stone-500 hidden sm:inline">
            {isExpanded ? 'Hide details' : 'Review & adjust'}
          </span>
          {isExpanded ? <ChevronUp className="w-4 h-4 text-stone-600" /> : <ChevronDown className="w-4 h-4 text-stone-600" />}
        </div>
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-1 border-t border-stone-100 font-sans space-y-4">
          <p className="text-xs text-stone-600 leading-relaxed">
            Based on what you told us, we extracted these requirements. Every item can be adjusted or removed to refine your matches:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* MUST-HAVES */}
            <div className="bg-[#FAF9F6] p-3.5 sm:p-4 rounded-xl border border-stone-200/80 space-y-3">
              <div className="flex items-center justify-between pb-1.5 border-b border-stone-200/60">
                <span className="text-[11px] font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-600" />
                  <span>Must-Haves</span>
                </span>
                <span className="text-[10px] text-stone-500 font-medium">Non-negotiable</span>
              </div>

              <div className="space-y-2 text-xs">
                {/* Child Age / Stage */}
                {isPreschool ? (
                  <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-stone-200/60">
                    <div className="flex items-center gap-2">
                      <Baby className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                      <div>
                        <span className="font-bold text-stone-900">
                          {filters.preschool?.ageYears ? `Child: ${filters.preschool.ageYears} years old` : 'Child: Early Years'}
                        </span>
                        {filters.preschool?.programs && filters.preschool.programs.length > 0 && (
                          <span className="block text-[11px] text-stone-500 uppercase">
                            Program: {filters.preschool.programs.join(', ')}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditingField(editingField === 'program' ? null : 'program')}
                      className="text-teal-800 hover:text-teal-950 font-semibold text-[11px] flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-stone-200/60">
                    <div className="flex items-center gap-2">
                      <SchoolIcon className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                      <div>
                        <span className="font-bold text-stone-900">Grade: {filters.grade || 'Any Grade'}</span>
                        <span className="block text-[11px] text-stone-500">Entry cohort</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditingField(editingField === 'grade' ? null : 'grade')}
                      className="text-teal-800 hover:text-teal-950 font-semibold text-[11px] flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                  </div>
                )}

                {/* Inline Program selector if editing */}
                {editingField === 'program' && (
                  <div className="p-2.5 bg-amber-50/60 rounded-lg border border-amber-200 space-y-1.5">
                    <span className="text-[11px] font-bold text-amber-950 block">Select Program:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {(['playgroup', 'nursery', 'lkg', 'ukg'] as PreschoolProgram[]).map((p) => {
                        const isSelected = filters.preschool?.programs?.includes(p);
                        return (
                          <button
                            key={p}
                            type="button"
                            onClick={() => {
                              const current = filters.preschool?.programs || [];
                              const updated = isSelected ? current.filter((x) => x !== p) : [...current, p];
                              updateFilters({ preschool: { programs: updated } });
                            }}
                            className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase transition-all ${
                              isSelected ? 'bg-amber-600 text-white shadow-2xs' : 'bg-white border border-stone-200 text-stone-700'
                            }`}
                          >
                            {p}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Location */}
                <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-stone-200/60">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                    <div>
                      <span className="font-bold text-stone-900">Area: {filters.location || 'All Chennai'}</span>
                      <span className="block text-[11px] text-stone-500">Within {filters.radiusKm || 12} km radius</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditingField(editingField === 'location' ? null : 'location')}
                    className="text-teal-800 hover:text-teal-950 font-semibold text-[11px] flex items-center gap-1 cursor-pointer"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Edit</span>
                  </button>
                </div>

                {/* Inline Location selector if editing */}
                {editingField === 'location' && (
                  <div className="p-2.5 bg-teal-50/60 rounded-lg border border-teal-200 space-y-1.5">
                    <span className="text-[11px] font-bold text-teal-950 block">Preferred Area:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {['All Chennai', 'Velachery', 'Anna Nagar', 'OMR / Karapakkam', 'Tambaram', 'Adyar / Besant Nagar'].map((loc) => (
                        <button
                          key={loc}
                          type="button"
                          onClick={() => {
                            updateFilters({ location: loc });
                            setEditingField(null);
                          }}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                            filters.location === loc ? 'bg-teal-700 text-white' : 'bg-white border border-stone-200 text-stone-700'
                          }`}
                        >
                          {loc}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Budget */}
                <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-stone-200/60">
                  <div className="flex items-center gap-2">
                    <IndianRupee className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                    <div>
                      <span className="font-bold text-stone-900">
                        Budget: Under ₹{(((filters.budgetMax || 150000)) / 1000).toFixed(0)}k/year
                      </span>
                      <span className="block text-[11px] text-stone-500">Annual ceiling cap</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditingField(editingField === 'budget' ? null : 'budget')}
                    className="text-teal-800 hover:text-teal-950 font-semibold text-[11px] flex items-center gap-1 cursor-pointer"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Edit</span>
                  </button>
                </div>

                {/* Inline Budget selector if editing */}
                {editingField === 'budget' && (
                  <div className="p-2.5 bg-amber-50/60 rounded-lg border border-amber-200 space-y-1.5">
                    <span className="text-[11px] font-bold text-amber-950 block">Max Annual Fee:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {[50000, 80000, 100000, 150000, 200000].map((b) => (
                        <button
                          key={b}
                          type="button"
                          onClick={() => {
                            updateFilters({ budgetMax: b });
                            setEditingField(null);
                          }}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                            filters.budgetMax === b ? 'bg-amber-600 text-white' : 'bg-white border border-stone-200 text-stone-700'
                          }`}
                        >
                          ₹{(b / 1000).toFixed(0)}k/yr
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Outdoor play requirement if set as must-have */}
                {filters.preschool?.outdoorPlay && (
                  <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50/70 border border-emerald-200">
                    <div className="flex items-center gap-2">
                      <TreePine className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                      <span className="font-bold text-emerald-950">Outdoor Play Yard: Must-have</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => updateFilters({ preschool: { outdoorPlay: false } })}
                      className="text-stone-400 hover:text-stone-700"
                      title="Remove requirement"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* NICE-TO-HAVES & PREFERENCES */}
            <div className="bg-[#FAF9F6] p-3.5 sm:p-4 rounded-xl border border-stone-200/80 space-y-3">
              <div className="flex items-center justify-between pb-1.5 border-b border-stone-200/60">
                <span className="text-[11px] font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-teal-600" />
                  <span>Nice-to-Haves & Preferences</span>
                </span>
                <span className="text-[10px] text-stone-500 font-medium">Soft priorities</span>
              </div>

              <div className="space-y-2 text-xs">
                {/* Learning Approach / Pedagogy or Curriculum */}
                {isPreschool ? (
                  <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-stone-200/60">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                      <div>
                        <span className="font-bold text-stone-900">
                          Learning Approach: {filters.preschool?.pedagogy && filters.preschool.pedagogy.length > 0 ? filters.preschool.pedagogy.join(', ') : 'Any Pedagogy'}
                        </span>
                        <span className="block text-[11px] text-stone-500">Montessori, Play-way, etc.</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditingField(editingField === 'pedagogy' ? null : 'pedagogy')}
                      className="text-teal-800 hover:text-teal-950 font-semibold text-[11px] flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-stone-200/60">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                      <div>
                        <span className="font-bold text-stone-900">
                          Curriculum: {filters.curriculums?.join(', ') || 'Any Curriculum'}
                        </span>
                        <span className="block text-[11px] text-stone-500">Board preference</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditingField(editingField === 'curriculum' ? null : 'curriculum')}
                      className="text-teal-800 hover:text-teal-950 font-semibold text-[11px] flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                  </div>
                )}

                {/* Inline Pedagogy selector if editing */}
                {editingField === 'pedagogy' && (
                  <div className="p-2.5 bg-blue-50/60 rounded-lg border border-blue-200 space-y-1.5">
                    <span className="text-[11px] font-bold text-blue-950 block">Select Pedagogy:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {['Montessori', 'Play-way', 'Reggio Emilia', 'Activity-based', 'Waldorf-inspired', 'Traditional'].map((ped) => {
                        const isSelected = filters.preschool?.pedagogy?.includes(ped);
                        return (
                          <button
                            key={ped}
                            type="button"
                            onClick={() => {
                              const cur = filters.preschool?.pedagogy || [];
                              const updated = isSelected ? cur.filter((x) => x !== ped) : [...cur, ped];
                              updateFilters({ preschool: { pedagogy: updated } });
                            }}
                            className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                              isSelected ? 'bg-blue-700 text-white' : 'bg-white border border-stone-200 text-stone-700'
                            }`}
                          >
                            {ped}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Daycare preference */}
                <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-stone-200/60">
                  <div className="flex items-center gap-2">
                    <Heart className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                    <div>
                      <span className="font-bold text-stone-900">
                        Daycare & Extended Hours: {filters.preschool?.daycare ? 'Preferred' : 'Optional'}
                      </span>
                      <span className="block text-[11px] text-stone-500">Working parent schedule</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => updateFilters({ preschool: { daycare: !filters.preschool?.daycare } })}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors cursor-pointer ${
                      filters.preschool?.daycare ? 'bg-teal-700 text-white' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                    }`}
                  >
                    {filters.preschool?.daycare ? '✓ Preferred' : '+ Add'}
                  </button>
                </div>

                {/* Transport preference */}
                <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-stone-200/60">
                  <div className="flex items-center gap-2">
                    <Bus className="w-3.5 h-3.5 text-stone-700 shrink-0" />
                    <div>
                      <span className="font-bold text-stone-900">
                        Transport: {filters.requiresTransport ? 'Required' : 'Optional / Self-Drop'}
                      </span>
                      <span className="block text-[11px] text-stone-500">School bus or AC van fleet</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => updateFilters({ requiresTransport: !filters.requiresTransport })}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors cursor-pointer ${
                      filters.requiresTransport ? 'bg-stone-800 text-white' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                    }`}
                  >
                    {filters.requiresTransport ? '✓ Required' : '+ Add'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Footer tuner trigger */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-2 border-t border-stone-100 gap-2">
            <span className="text-xs text-stone-500">
              Looking for something different? Adjust weights or search in plain English above.
            </span>
            <button
              type="button"
              onClick={onOpenPriorityTuner}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-800 hover:text-teal-950 cursor-pointer self-start sm:self-auto"
            >
              <Sliders className="w-3.5 h-3.5 text-teal-700" />
              <span>Tune priority balance & weights →</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
