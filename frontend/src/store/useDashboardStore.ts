import { create } from 'zustand';
import type { CheckinSummary } from './types';

interface DashboardState {
  checkins: CheckinSummary[];
  currentPage: number;
  hasNextPage: boolean;
  isLoading: boolean;
  selectedCheckinId: string | null;
}

interface DashboardActions {
  setCheckins: (checkins: CheckinSummary[], hasNextPage: boolean) => void;
  appendCheckins: (checkins: CheckinSummary[]) => void;
  setSelectedCheckin: (id: string | null) => void;
  incrementPage: () => void;
  setLoading: (loading: boolean) => void;
}

type DashboardStore = DashboardState & DashboardActions;

export const useDashboardStore = create<DashboardStore>((set) => ({
  checkins: [],
  currentPage: 1,
  hasNextPage: false,
  isLoading: false,
  selectedCheckinId: null,

  setCheckins: (checkins, hasNextPage) => set({ checkins, hasNextPage }),
  
  appendCheckins: (checkins) =>
    set((state) => ({
      checkins: [...state.checkins, ...checkins],
    })),
    
  setSelectedCheckin: (id) => set({ selectedCheckinId: id }),
  
  incrementPage: () =>
    set((state) => ({ currentPage: state.currentPage + 1 })),
    
  setLoading: (loading) => set({ isLoading: loading }),
}));
