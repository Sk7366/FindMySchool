import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { School } from '../../types/school';
import { MapPin, Navigation, Compass, Layers, Check, ChevronRight } from 'lucide-react';
import { getCurriculumColor } from '../../utils/categoryColors';

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
    <div className="relative w-full h-[520px] rounded-2xl overflow-hidden border border-stone-200 bg-[#FAF9F6] shadow-sm flex flex-col font-sans">
      
      {/* Top Map Header Bar */}
      <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between pointer-events-none">
        <div className="bg-white/95 backdrop-blur-xs px-3.5 py-1.5 rounded-xl border border-stone-200 shadow-2xs pointer-events-auto flex items-center gap-2">
          <Navigation className="w-3.5 h-3.5 text-teal-700" />
          <span className="text-xs font-bold text-stone-800">
            Chennai Metropolitan Map
          </span>
          <span className="text-[11px] text-stone-500">· {schools.length} verified pins</span>
        </div>

        <div className="bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-stone-200 shadow-2xs pointer-events-auto flex items-center gap-1.5 text-xs text-stone-600 font-medium">
          <Compass className="w-3.5 h-3.5 text-stone-500" />
          <span>Bay of Bengal East Coast</span>
        </div>
      </div>

      {/* SVG Canvas Map Surface with warm parchment ground */}
      <div className="relative flex-1 w-full h-full bg-[#F5F1E8]/80 overflow-hidden select-none">
        
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
            stroke="#d6d3d1"
            strokeWidth="1.2"
          />

          {/* OMR IT Expressway */}
          <path
            d="M 80,45 L 75,95"
            fill="none"
            stroke="#d6d3d1"
            strokeWidth="1.4"
          />

          {/* ECR Coast Road */}
          <path
            d="M 84,45 L 82,95"
            fill="none"
            stroke="#e7e5e4"
            strokeWidth="1"
          />

          {/* Inner Ring Road */}
          <path
            d="M 30,20 Q 60,25 75,45"
            fill="none"
            stroke="#d6d3d1"
            strokeWidth="1"
          />

          {/* Commute Radius Circle Overlay centered around South Chennai / Tambaram */}
          <circle
            cx="65"
            cy="55"
            r={Math.min(35, radiusKm * 2.5)}
            fill="#0D9488"
            fillOpacity="0.06"
            stroke="#0D9488"
            strokeWidth="0.8"
            strokeDasharray="1.5 1.5"
          />
        </svg>

        {/* School Coordinate Markers */}
        {schools.map((school) => {
          const isSelected = selectedSchoolId === school.id;
          const isHovered = hoveredSchool?.id === school.id;
          const bColor = getCurriculumColor(school.curriculum[0]);

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
              className={`absolute -translate-x-1/2 -translate-y-1/2 transition-transform duration-200 cursor-pointer focus:outline-none z-10 ${
                isSelected || isHovered ? 'scale-125 z-30' : 'hover:scale-110'
              }`}
              title={`${school.name} (${school.area})`}
            >
              <div
                className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold shadow-md transition-all border ${
                  isSelected
                    ? 'bg-[#0D9488] text-white border-white ring-2 ring-teal-600/40'
                    : 'bg-white text-stone-900 border-stone-300'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-amber-300' : bColor.dot}`} />
                <span className="truncate max-w-[80px]">{school.name.split(' ')[0]}</span>
                <span className="opacity-90 tabular-nums">({school.matchScore}%)</span>
              </div>
            </button>
          );
        })}

        {/* Selected / Hovered School Popover Detail Card */}
        {activeSchool && (
          <div className="absolute bottom-3 left-3 right-3 z-30 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl border border-stone-200 shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-150 flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold text-teal-800 bg-teal-50 px-2 py-0.2 rounded border border-teal-200">
                  {activeSchool.matchScore}% Match
                </span>
                <span className="text-[11px] text-stone-500 font-medium">
                  {activeSchool.curriculum.join(', ')} · {activeSchool.distanceKm} km away
                </span>
              </div>
              <h4 className="font-editorial text-xs sm:text-sm font-bold text-stone-900 truncate">
                {activeSchool.name}
              </h4>
              <p className="text-[11px] text-stone-600 truncate mt-0.5">
                {activeSchool.area} · ₹{(activeSchool.annualFeeMin / 100000).toFixed(1)}L – {(activeSchool.annualFeeMax / 100000).toFixed(1)}L/yr
              </p>
            </div>

            <Link
              to={`/school/${activeSchool.slug}`}
              className="px-3.5 py-2 bg-[#0D9488] hover:bg-[#115E59] text-white rounded-xl text-xs font-bold shrink-0 transition-colors flex items-center gap-1"
            >
              <span>Profile</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
