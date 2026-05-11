"use client";

import { useRouter } from "next/navigation";
import { Camera } from "lucide-react";
import { format } from "date-fns";
import CheckinCard from "./CheckinCard";
import { useQueryClient } from "@tanstack/react-query";
import { useCheckins } from "@/hooks/useCheckins";
import { getCheckinDetail } from "@/lib/api";
import { ROUTES } from "@/lib/routes";
import { CheckinSummary } from "@/store/types";
import SkeletonCheckinCard from "@/components/ui/skeletons/SkeletonCheckinCard";
import EmptyState from "@/components/ui/EmptyState";
import InlineError from "@/components/ui/InlineError";

export default function Timeline() {
  const router = useRouter();
  const queryClient = useQueryClient();
  
  // Basic implementation. In a real app, you'd use useInfiniteQuery from TanStack.
  // We'll simulate pagination with a simple limit for now to keep it clean.
  const { data, isLoading, isError } = useCheckins(1); 
  const checkins = data?.checkins || [];

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <SkeletonCheckinCard key={i} />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <InlineError message="Failed to load check-ins." />
    );
  }

  if (checkins.length === 0) {
    return (
      <EmptyState
        icon={Camera}
        title="No check-ins yet"
        description="Start your first check-in to begin tracking your skin's progress."
        action={{ label: "Start Check-In", onClick: () => router.push(ROUTES.CHECK_IN) }}
        className="glass-panel"
      />
    );
  }

  // Group by month
  const grouped: Record<string, CheckinSummary[]> = {};
  checkins.forEach(c => {
    const month = format(new Date(c.capturedAt), "MMMM yyyy");
    if (!grouped[month]) grouped[month] = [];
    grouped[month].push(c);
  });

  return (
    <div className="space-y-8">
      {Object.entries(grouped).map(([month, monthCheckins]) => (
        <div key={month} className="space-y-3">
          <h4 className="text-[11px] font-semibold text-text-tertiary uppercase tracking-widest pl-2">
            {month}
          </h4>
          <div className="space-y-3">
            {monthCheckins.map(checkin => (
              <CheckinCard 
                key={checkin.id} 
                checkin={checkin} 
                onClick={() => router.push(ROUTES.RESULTS(checkin.id))} 
                onMouseEnter={() => {
                  queryClient.prefetchQuery({
                    queryKey: ["checkin", checkin.id],
                    queryFn: () => getCheckinDetail(checkin.id)
                  });
                }}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
