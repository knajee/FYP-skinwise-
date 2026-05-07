import Skeleton from "@/components/ui/Skeleton";

export default function SkeletonIngredientCard() {
  return (
    <div className="glass-panel p-5">
      <div className="flex justify-between items-start mb-3">
        <Skeleton className="w-20 h-5 rounded" />
        <div className="flex gap-2">
          <Skeleton className="w-6 h-6 rounded-full" />
          <Skeleton className="w-6 h-6 rounded-full" />
        </div>
      </div>
      <Skeleton className="w-3/4 h-7 rounded mb-3" />
      <div className="flex gap-2 mb-3">
        <Skeleton className="w-16 h-6 rounded-full" />
        <Skeleton className="w-20 h-6 rounded-full" />
      </div>
      <Skeleton className="w-1/2 h-4 rounded" />
    </div>
  );
}
