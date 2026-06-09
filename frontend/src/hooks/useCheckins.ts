"use client";

import { useQuery } from "@tanstack/react-query";
import { getCheckins, getCheckinDetail } from "@/lib/api";
import { useDashboardStore, useAuthStore } from "@/store";
import { transformCheckinsToTrendData, getSeverityDistribution } from "@/lib/trendUtils";

export function useCheckins(page: number = 1) {
  const user = useAuthStore(s => s.user);
  const setCheckins = useDashboardStore(s => s.setCheckins);
  
  return useQuery({
    queryKey: ["checkins", user?.id, page],
    queryFn: async () => {
      const data = await getCheckins(page);
      if (page === 1) {
        setCheckins(data.checkins, data.hasNextPage); // cache page 1 in store for immediate dashboard use
      }
      return data;
    },
    enabled: !!user?.id,
  });
}

export function useCheckinDetail(id: string | null) {
  return useQuery({
    queryKey: ["checkin", id],
    queryFn: () => getCheckinDetail(id!),
    enabled: !!id,
  });
}

export function useTrendData() {
  const checkins = useDashboardStore(s => s.checkins);
  
  // Compute derived data using the store's checkin cache
  const trendData = transformCheckinsToTrendData(checkins);
  const severityDistribution = getSeverityDistribution(checkins);
  
  return {
    trendData,
    severityDistribution,
    totalCheckins: checkins.length,
    mostRecent: checkins.length > 0 ? checkins[0] : null,
  };
}
