"use client";

import { Suspense, ReactNode } from "react";
import Sidebar from "@/components/layout/Sidebar";
import BottomTabs from "@/components/layout/BottomTabs";
import Header from "@/components/layout/Header";
import PageLoader from "@/components/layout/PageLoader";
import RouteTransition from "@/components/layout/RouteTransition";
import ErrorBoundary from "@/components/layout/ErrorBoundary";
import WellnessDisclaimer from "@/components/legal/WellnessDisclaimer";
import OfflineBanner from "@/components/layout/OfflineBanner";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-bg-base">
      {/* Desktop Sidebar (hidden on mobile) */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 md:ml-[240px]">
        {/* Mobile Header (hidden on desktop) */}
        <Header />

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto relative">
          <OfflineBanner />
          <ErrorBoundary>
            <Suspense fallback={<PageLoader />}>
              <RouteTransition>
                <div className="flex flex-col min-h-full px-4 md:px-6 pt-4 md:pt-6 pb-24 md:pb-6">
                  {children}
                  {/* ASSERTION: WellnessDisclaimer is rendered unconditionally on all authenticated pages */}
                  <WellnessDisclaimer />
                </div>
              </RouteTransition>
            </Suspense>
          </ErrorBoundary>
        </main>
      </div>

      {/* Mobile Bottom Tabs (hidden on desktop) */}
      <BottomTabs />
    </div>
  );
}
