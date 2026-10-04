import React from 'react';

export const SchoolCardSkeleton: React.FC = () => {
  return (
    <article
      aria-label="Loading institution details..."
      className="bg-white rounded-2xl border border-stone-200/90 overflow-hidden flex flex-col md:flex-row shadow-2xs animate-pulse"
    >
      {/* Visual / Media Zone Skeleton */}
      <div className="md:w-68 lg:w-72 shrink-0 bg-stone-200/80 aspect-16/10 md:aspect-auto min-h-[180px] md:min-h-full relative flex items-center justify-center">
        <div className="w-10 h-10 rounded-full bg-stone-300/70" />
      </div>

      {/* Content Body Skeleton */}
      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-3">
          {/* Top Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="h-5 w-24 bg-stone-200 rounded-md" />
            <div className="h-5 w-16 bg-stone-200 rounded-md" />
            <div className="h-5 w-28 bg-stone-200 rounded-md" />
          </div>

          {/* Title and Tagline */}
          <div className="space-y-1.5 pt-1">
            <div className="h-6 w-3/5 bg-stone-200 rounded-lg" />
            <div className="h-4 w-4/5 bg-stone-100 rounded-md" />
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
            <div className="h-16 bg-[#FAF9F6] border border-stone-200/60 rounded-xl p-2.5 space-y-1.5">
              <div className="h-2.5 w-14 bg-stone-200 rounded" />
              <div className="h-4 w-12 bg-stone-300 rounded" />
            </div>
            <div className="h-16 bg-[#FAF9F6] border border-stone-200/60 rounded-xl p-2.5 space-y-1.5">
              <div className="h-2.5 w-16 bg-stone-200 rounded" />
              <div className="h-4 w-16 bg-stone-300 rounded" />
            </div>
            <div className="h-16 bg-[#FAF9F6] border border-stone-200/60 rounded-xl p-2.5 space-y-1.5">
              <div className="h-2.5 w-14 bg-stone-200 rounded" />
              <div className="h-4 w-10 bg-stone-300 rounded" />
            </div>
            <div className="h-16 bg-[#FAF9F6] border border-stone-200/60 rounded-xl p-2.5 space-y-1.5">
              <div className="h-2.5 w-14 bg-stone-200 rounded" />
              <div className="h-4 w-14 bg-stone-300 rounded" />
            </div>
          </div>

          {/* Facilities Shimmer Pills */}
          <div className="flex items-center gap-1.5 pt-1">
            <div className="h-6 w-28 bg-stone-100 border border-stone-200/60 rounded-lg" />
            <div className="h-6 w-32 bg-stone-100 border border-stone-200/60 rounded-lg" />
            <div className="h-6 w-24 bg-stone-100 border border-stone-200/60 rounded-lg hidden sm:block" />
          </div>
        </div>

        {/* Card Bottom Actions */}
        <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-20 bg-stone-100 rounded-xl" />
            <div className="h-8 w-20 bg-stone-100 rounded-xl" />
          </div>
          <div className="h-8 w-28 bg-teal-100 rounded-xl" />
        </div>
      </div>
    </article>
  );
};
