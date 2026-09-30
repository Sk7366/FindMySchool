import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { School } from '../../types/school';
import { MapPin, Navigation, Compass, Layers, Check } from 'lucide-react';

interface SchoolMapPreviewProps {
  schools: School[];
  selectedSchoolId?: string;
  onSelectSchool?: (schoolId: string) => void;
  radiusKm?: number;
}

export const SchoolMapPreview: React.FC<SchoolMapPreviewProps> = ({
  schools,
  selectedSchoolId,
  onSelectSchool,
  radiusKm = 10,
}) => {
  const [hoveredSchool, setHoveredSchool] = useState<School | null>(null);

  const activeSchool = schools.find((s) => s.id === selectedSchoolId) || hoveredSchool;

  return (
    <div className="relative w-full h-[520px] rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shadow-2xs flex flex-col">
      
      {/* Top Map Header Bar */}
      <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between pointer-events-none">
        <div className="bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-slate-200/90 shadow-2xs pointer-events-auto flex items-center gap-2">
          <Navigation className="w-3.5 h-3.5 text-teal-600" />
          <span className="text-xs font-semibold text-slate-800">
            Chennai Metropolitan Map
          </span>
          <span className="text-[11px] text-slate-600">· {schools.length} pins</span>
        </div>

        <div className="bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-slate-200/90 shadow-2xs pointer-events-auto flex items-center gap-1.5 text-xs text-slate-600">
          <Compass className="w-3.5 h-3.5 text-slate-500" />
          <span>Bay of Bengal East Coast</span>
        </div>
      </div>

      {/* SVG Canvas Map Surface */}
      <div className="relative flex-1 w-full h-full bg-[#f1f5f9] overflow-hidden select-none">
        
        {/* SVG Decorative Geographic Layer */}
        <svg className="w-full h-full absolute inset-0" preserveAspectRatio="none" viewBox="0 0 100 100">
          {/* Water Body: Bay of Bengal (East side) */}
          <path
            d="M 85,0 Q 88,40 92,70 L 90,100 L 100,100 L 100,0 Z"
            fill="#e0f2fe"
            stroke="#bae6fd"
            strokeWidth="0.5"
          />

          {/* Adyar River Estuary */}
          <path
            d="M 40,45 Q 60,42 86,42"
            fill="none"
            stroke="#bae6fd"
            strokeWidth="1.2"
            strokeDasharray="1 0.5"
          />

          {/* Major Arterial Roads: GST Road */}
          <path
            d="M 20,95 Q 35,65 50,45"
            fill="none"
            stroke="#cbd5e1"
            strokeWidth="1.2"
          />

          {/* OMR IT Expressway */}
          <path
            d="M 80,45 L 75,95"
            fill="none"
            stroke="#cbd5e1"
            strokeWidth="1.4"
          />

          {/* ECR Coast Road */}
          <path
            d="M 84,45 L 82,95"
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="1"
          />

          {/* Inner Ring Road */}
          <path
            d="M 30,20 Q 60,25 75,45"
            fill="none"
            stroke="#cbd5e1"
            strokeWidth="1"
          />

          {/* Commute Radius Circle Overlay centered around South Chennai / Tambaram */}
          <circle
            cx="65"
            cy="55"
            r={Math.min(35, radiusKm * 2.5)}
            fill="rgba(13, 148, 136, 0.05)"
            stroke="#0d9488"
            strokeWidth="0.75"
            strokeDasharray="2 2"
          />
        </svg>

        {/* Labels on Map */}
        <span className="absolute top-[18%] left-[45%] text-[10px] font-semibold text-slate-600 uppercase tracking-widest pointer-events-none">
          Central Chennai
        </span>
        <span className="absolute top-[48%] left-[76%] text-[10px] font-semibold text-slate-600 uppercase tracking-widest pointer-events-none">
          Adyar / OMR Hub
        </span>
        <span className="absolute top-[75%] left-[25%] text-[10px] font-semibold text-slate-600 uppercase tracking-widest pointer-events-none">
          Tambaram / GST
        </span>
        <span className="absolute top-[50%] right-[3%] text-[9px] font-bold text-sky-800 rotate-90 tracking-widest uppercase pointer-events-none">
          Bay of Bengal
        </span>

        {/* School Pin Markers */}
        {schools.map((school) => {
          const isSelected = school.id === selectedSchoolId;
          const isHovered = hoveredSchool?.id === school.id;

          return (
            <button
              key={school.id}
              type="button"
              onClick={() => onSelectSchool?.(school.id)}
              onMouseEnter={() => setHoveredSchool(school)}
              onMouseLeave={() => setHoveredSchool(null)}
              style={{
                left: `${school.coordinates.mapX}%`,
                top: `${school.coordinates.mapY}%`,
              }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 z-10 transition-transform duration-150 focus:outline-none focus:ring-2 focus:ring-teal-600 rounded-full cursor-pointer ${
                isSelected || isHovered ? 'scale-125 z-30' : 'hover:scale-110'
              }`}
              title={`${school.name} (${school.matchScore}% Match)`}
              aria-label={`${school.name} map pin`}
            >
              <div
                className={`relative flex items-center justify-center rounded-full text-white font-bold text-[10px] shadow-md ${
                  isSelected
                    ? 'w-7 h-7 bg-teal-800 ring-3 ring-teal-300'
                    : isHovered
                    ? 'w-7 h-7 bg-teal-700 ring-2 ring-teal-200'
                    : 'w-6 h-6 bg-teal-600'
                }`}
              >
                <span>{school.matchScore}</span>
                {isSelected && (
                  <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-500 border border-white" />
                )}
              </div>
            </button>
          );
        })}

        {/* Active School Floating Tooltip / Card preview */}
        {activeSchool && (
          <div className="absolute bottom-3 left-3 right-3 z-30 bg-white/95 backdrop-blur-md p-3 rounded-xl border border-slate-200 shadow-md flex items-center justify-between gap-3 animate-in fade-in duration-150">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-xs text-teal-800 font-semibold mb-0.5">
                <span>{activeSchool.matchScore}% Match</span>
                <span className="text-slate-600">·</span>
                <span className="text-slate-600">{activeSchool.distanceKm} km away</span>
              </div>
              <h4 className="text-sm font-bold text-slate-900 truncate">
                {activeSchool.name}
              </h4>
              <p className="text-xs text-slate-600 truncate">
                {activeSchool.area} · {activeSchool.curriculum.join(', ')} · ₹{(activeSchool.annualFeeMin / 100000).toFixed(1)}L/yr
              </p>
            </div>

            <Link
              to={`/school/${activeSchool.slug}`}
              className="shrink-0 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold transition-colors"
            >
              Profile
            </Link>
          </div>
        )}
      </div>

      {/* Map Bottom Legend */}
      <div className="bg-white border-t border-slate-200 px-4 py-2 flex items-center justify-between text-[11px] text-slate-600">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-600 inline-block" />
            <span>School Match %</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full border border-teal-600 border-dashed inline-block" />
            <span>Search Radius ({radiusKm} km)</span>
          </span>
        </div>
        <span className="text-slate-600">Click pin to inspect</span>
      </div>
    </div>
  );
};
