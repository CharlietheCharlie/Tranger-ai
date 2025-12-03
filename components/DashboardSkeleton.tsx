export default function DashboardSkeleton() {
  return (
    <div className="h-full p-6 md:p-12 overflow-y-auto bg-[#F8FAFC]">
      <div className="max-w-6xl mx-auto">
        {/* Skeleton Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
          <div className="space-y-4 w-full md:w-auto">
            <div className="h-10 w-48 bg-slate-200 rounded-md animate-pulse" />
            <div className="h-6 w-64 bg-slate-200 rounded-md animate-pulse" />
          </div>
          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto items-center">
            <div className="relative w-full md:w-auto">
              <div className="w-full md:w-72 h-11 bg-slate-200 rounded-md animate-pulse" />
            </div>
            <div className="w-full md:w-32 h-11 bg-slate-200 rounded-md animate-pulse" />
          </div>
        </div>

        {/* Skeleton Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-[340px] bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden flex flex-col"
            >
              {/* Image Placeholder */}
              <div className="h-48 bg-slate-200 animate-pulse w-full" />

              {/* Content Placeholder */}
              <div className="p-5 space-y-4 flex-1">
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <div className="h-6 bg-slate-200 rounded w-2/3 animate-pulse" />
                    <div className="h-6 w-6 bg-slate-200 rounded-full animate-pulse" />
                  </div>
                  <div className="h-4 bg-slate-200 rounded w-1/2 animate-pulse" />
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-slate-200 animate-pulse" />
                  <div className="h-8 w-8 rounded-full bg-slate-200 animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
