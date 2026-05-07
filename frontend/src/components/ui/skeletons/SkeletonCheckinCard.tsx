import Skeleton from "@/components/ui/Skeleton";

export default function SkeletonCheckinCard() {
  return (
    <div className="flex gap-4 p-4 rounded-xl bg-bg-surface border border-border-default">
      {/* Thumbnail */}
      <Skeleton className="shrink-0 w-24 h-24 rounded-lg" />
      
      {/* Content */}
      <div className="flex-1 py-1 flex flex-col justify-between">
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-2">
            <Skeleton className="h-6 w-1/2 rounded" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
          
          <div className="flex gap-2">
            <Skeleton className="h-4 w-10 rounded" />
            <Skeleton className="h-4 w-10 rounded" />
            <Skeleton className="h-4 w-10 rounded" />
            <Skeleton className="h-4 w-10 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}
