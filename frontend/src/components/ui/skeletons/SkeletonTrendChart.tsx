import Skeleton from "@/components/ui/Skeleton";

export default function SkeletonTrendChart() {
  return (
    <div className="w-full flex flex-col gap-4">
      <Skeleton className="w-full h-[200px] rounded-xl relative overflow-hidden">
        {/* Suggest axis lines */}
        <div className="absolute inset-x-0 bottom-4 h-px bg-white/20" />
        <div className="absolute inset-x-0 bottom-1/2 h-px bg-white/20" />
        <div className="absolute inset-x-0 top-4 h-px bg-white/20" />
      </Skeleton>
      <div className="flex justify-center gap-3">
        <Skeleton className="w-12 h-6 rounded-full" />
        <Skeleton className="w-12 h-6 rounded-full" />
        <Skeleton className="w-12 h-6 rounded-full" />
      </div>
    </div>
  );
}
