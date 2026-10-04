import React from 'react';
import { ArrowLeft, Share2, Bookmark, Scale } from 'lucide-react';

export const ProfileSkeleton: React.FC = () => {
  return (
    <div
      role="status"
      aria-label="Loading institution profile..."
      className="min-h-screen bg-[#FAF9F6] pb-24 text-stone-900 font-sans animate-pulse"
    >
      {/* 1. SKELETON HEADER: Breadcrumb & Top Actions Bar */}
      <div className="bg-white border-b border-stone-200/90 py-3.5 px-3.5 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 py-1">
            <ArrowLeft className="w-3.5 h-3.5 text-stone-300" />
            <div className="h-4 w-28 bg-stone-200 rounded" />
          </div>

          <div className="flex items-center gap-2">
            <div className="h-8 w-16 sm:w-20 bg-stone-100 rounded-xl" />
            <div className="h-8 w-16 sm:w-20 bg-stone-100 rounded-xl" />
            <div className="h-8 w-20 sm:w-24 bg-stone-100 rounded-xl" />
          </div>
        </div>
      </div>

      {/* 1. SKELETON HEADER: Hero Title, Meta Badges & Photo Gallery */}
      <section className="bg-white border-b border-stone-200/90 py-7 sm:py-9 px-3.5 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Info */}
          <div className="lg:col-span-7 space-y-4">
            {/* Meta Tags Row */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="h-5 w-28 bg-amber-100 rounded-md" />
              <div className="h-5 w-20 bg-stone-200 rounded-md" />
              <div className="h-5 w-24 bg-stone-200 rounded-md" />
              <div className="h-5 w-32 bg-stone-200 rounded-md" />
            </div>

            {/* School Title */}
            <div className="space-y-2 pt-1">
              <div className="h-10 sm:h-12 w-4/5 bg-stone-200 rounded-xl" />
              <div className="h-4 sm:h-5 w-3/5 bg-stone-100 rounded-md" />
            </div>

            {/* 3. SKELETON QUICK FACTS: 4 Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="p-3 rounded-xl bg-[#FAF9F6] border border-stone-200/80 space-y-2">
                  <div className="h-3 w-16 bg-stone-200 rounded" />
                  <div className="h-6 w-20 bg-stone-300 rounded" />
                  <div className="h-2.5 w-24 bg-stone-200 rounded" />
                </div>
              ))}
            </div>

            {/* 3. SKELETON QUICK FACTS: Priority Details Grid */}
            <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-stone-200/90 space-y-3">
              <div className="h-3.5 w-36 bg-stone-300 rounded" />
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="space-y-1.5">
                    <div className="h-2.5 w-16 bg-stone-200 rounded" />
                    <div className="h-4 w-24 bg-stone-300 rounded" />
                    <div className="h-2 w-16 bg-stone-200 rounded" />
                  </div>
                ))}
              </div>
            </div>

            {/* Primary Action Buttons */}
            <div className="pt-2 flex flex-wrap gap-2.5">
              <div className="h-11 w-36 bg-teal-600/30 rounded-xl" />
              <div className="h-11 w-28 bg-stone-200 rounded-xl" />
              <div className="h-11 w-24 bg-stone-200 rounded-xl" />
            </div>
          </div>

          {/* Photo Gallery Skeleton */}
          <div className="lg:col-span-5 space-y-2.5">
            <div className="aspect-16/10 rounded-2xl bg-stone-200 border border-stone-300 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-stone-300/80" />
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="aspect-16/10 rounded-lg bg-stone-200" />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Tab Navigation Skeleton */}
      <div className="bg-[#FAF9F6] border-b border-stone-200 py-2 px-3.5 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex gap-2 overflow-x-auto scrollbar-none">
          {['Overview & Fit', 'Academics', 'Fee Transparency', 'Facilities', 'Admissions', 'Commute'].map((t, idx) => (
            <div
              key={t}
              className={`h-9 px-4 rounded-xl flex items-center shrink-0 ${
                idx === 0 ? 'bg-teal-700/20 w-32' : 'bg-stone-200/70 w-24'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Main Skeleton Sections */}
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 mt-6 sm:mt-8 space-y-8">
        
        {/* 2. SKELETON MATCH SECTION */}
        <section className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div className="space-y-1">
              <div className="h-3 w-32 bg-teal-200 rounded" />
              <div className="h-6 w-64 bg-stone-300 rounded" />
            </div>
            <div className="h-8 w-24 bg-teal-100 rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="p-4 rounded-xl border border-stone-200 bg-[#FAF9F6] space-y-2">
                <div className="h-4 w-20 bg-teal-100 rounded" />
                <div className="h-5 w-44 bg-stone-300 rounded" />
                <div className="h-3.5 w-full bg-stone-200 rounded" />
                <div className="h-3.5 w-4/5 bg-stone-200 rounded" />
              </div>
            ))}
          </div>
        </section>

        {/* 4. SKELETON FACILITIES SECTION */}
        <section className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div className="space-y-1">
              <div className="h-3 w-28 bg-stone-200 rounded" />
              <div className="h-6 w-56 bg-stone-300 rounded" />
            </div>
            <div className="h-8 w-32 bg-stone-100 rounded-xl" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="p-4 rounded-xl border border-stone-200/80 bg-[#FAF9F6] space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-stone-200" />
                  <div className="h-4 w-28 bg-stone-300 rounded" />
                </div>
                <div className="h-3 w-full bg-stone-200 rounded" />
              </div>
            ))}
          </div>
        </section>

        {/* 5. SKELETON ADMISSIONS SECTION */}
        <section className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div className="space-y-1">
              <div className="h-3 w-28 bg-stone-200 rounded" />
              <div className="h-6 w-60 bg-stone-300 rounded" />
            </div>
            <div className="h-7 w-28 bg-amber-100 rounded-full" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-4 rounded-xl border border-stone-200 bg-[#FAF9F6] space-y-2">
                <div className="h-3 w-16 bg-stone-200 rounded" />
                <div className="h-5 w-32 bg-stone-300 rounded" />
                <div className="h-3 w-full bg-stone-100 rounded" />
              </div>
            ))}
          </div>

          {/* Fee Table Skeleton */}
          <div className="pt-2 space-y-2">
            <div className="h-10 bg-stone-100 rounded-lg" />
            <div className="h-10 bg-stone-50 rounded-lg" />
            <div className="h-10 bg-stone-50 rounded-lg" />
          </div>
        </section>

        {/* 6. SKELETON LOCATION SECTION */}
        <section className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div className="space-y-1">
              <div className="h-3 w-24 bg-stone-200 rounded" />
              <div className="h-6 w-52 bg-stone-300 rounded" />
            </div>
            <div className="h-7 w-28 bg-stone-100 rounded-xl" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-[#FAF9F6] border border-stone-200 space-y-3">
              <div className="h-4 w-32 bg-stone-300 rounded" />
              <div className="h-3 w-full bg-stone-200 rounded" />
              <div className="h-3 w-4/5 bg-stone-200 rounded" />
              <div className="h-12 w-full bg-stone-100 rounded-lg" />
            </div>
            <div className="h-48 rounded-xl bg-stone-200 border border-stone-300 flex items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-stone-300" />
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};
