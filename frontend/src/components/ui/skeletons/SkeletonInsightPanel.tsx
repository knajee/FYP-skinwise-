import Skeleton from "@/components/ui/Skeleton";

export default function SkeletonInsightPanel() {
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN */}
        <div className="lg:col-span-7 space-y-6">
          <Skeleton className="w-full aspect-[4/3] rounded-xl" />
          <Skeleton className="w-full h-40 rounded-xl" />
        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-5 space-y-6">
          <Skeleton className="w-full h-24 rounded-xl" />
          <Skeleton className="w-full h-32 rounded-xl" />
          <Skeleton className="w-full h-48 rounded-xl" />
          <Skeleton className="w-full h-64 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
