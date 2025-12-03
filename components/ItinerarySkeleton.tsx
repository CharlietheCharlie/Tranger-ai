export default function ItinerarySkeleton() {
  return (
    // Loading states - Itinerary Skeleton
    <div className="h-screen w-screen bg-[#F8FAFC] flex flex-col overflow-hidden text-slate-900 font-sans">
      {/* Skeleton Header */}
      <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-4 md:px-10 shrink-0 z-20">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-full bg-slate-200 animate-pulse" />
          <div className="space-y-2">
            <div className="h-5 w-48 bg-slate-200 rounded animate-pulse" />
            <div className="h-3 w-32 bg-slate-200 rounded animate-pulse" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-8 w-16 bg-slate-200 rounded-md animate-pulse hidden md:block" />
          <div className="h-10 w-10 rounded-full bg-slate-200 animate-pulse" />
          <div className="h-10 w-10 rounded-full bg-slate-200 animate-pulse" />
          <div className="ml-2 h-10 w-10 rounded-full bg-slate-200 animate-pulse" />
        </div>
      </header>

      {/* Skeleton Board */}
      <div className="flex-1 overflow-hidden relative flex p-4 md:p-6 gap-6">
        <div className="flex gap-4 md:gap-6 overflow-hidden w-full">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="min-w-[300px] md:min-w-[340px] flex flex-col gap-4 opacity-70"
            >
              {/* Day Header Skeleton */}
              <div className="h-14 w-full bg-white border border-slate-200 rounded-xl flex items-center px-4 gap-3 shadow-sm">
                <div className="h-8 w-8 bg-slate-100 rounded-full animate-pulse" />
                <div className="h-4 w-32 bg-slate-100 rounded animate-pulse" />
              </div>
              {/* Activity Cards Skeleton */}
              <div className="space-y-3">
                {[...Array(Math.max(2, 4 - i))].map((_, j) => (
                  <div
                    key={j}
                    className="h-32 w-full bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-sm"
                  >
                    <div className="flex justify-between">
                      <div className="h-4 w-24 bg-slate-100 rounded animate-pulse" />
                      <div className="h-4 w-8 bg-slate-100 rounded animate-pulse" />
                    </div>
                    <div className="h-4 w-3/4 bg-slate-100 rounded animate-pulse" />
                    <div className="flex gap-2 pt-2">
                      <div className="h-6 w-16 bg-slate-100 rounded-full animate-pulse" />
                      <div className="h-6 w-16 bg-slate-100 rounded-full animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
