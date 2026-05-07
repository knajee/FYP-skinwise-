import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  children?: ReactNode;
}

export default function Skeleton({ className, children }: SkeletonProps) {
  return (
    <div className={cn("animate-pulse bg-bg-subtle/60 rounded-card", className)}>
      {children}
    </div>
  );
}
