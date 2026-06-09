"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Camera, FlaskConical, ChevronRight } from "lucide-react";
import Timeline from "@/components/dashboard/Timeline";
import LesionTrendChart from "@/components/dashboard/LesionTrendChart";
import SeverityTimeline from "@/components/dashboard/SeverityTimeline";
import { useAuthStore, useIngredientsStore } from "@/store";
import { useTrendData, useCheckins } from "@/hooks/useCheckins";
import { ROUTES } from "@/lib/routes";
import SkeletonTrendChart from "@/components/ui/skeletons/SkeletonTrendChart";

export default function DashboardPage() {
  const router = useRouter();
  const user = useAuthStore(s => s.user);
  const { ingredients } = useIngredientsStore();
  const { trendData, totalCheckins, mostRecent } = useTrendData();
  const { data, isLoading } = useCheckins(1);
  const checkins = data?.checkins || [];

  const [dateRange, setDateRange] = useState<"30" | "90" | "all">("30");

  const filterDataByRange = () => {
    if (dateRange === "all") return trendData;
    const days = parseInt(dateRange);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return trendData.filter(d => new Date(d.date) >= cutoff);
  };

  const filteredTrendData = filterDataByRange();
  const active_ingredientsCount = ingredients.filter(i => !i.discontinued_at).length;
  
  // Basic stats logic
  let mostCommonLesion = "None";
  if (totalCheckins > 0) {
    const sums = { comedone: 0, papule: 0, pustule: 0, nodule: 0 };
    trendData.forEach(d => {
      sums.comedone += d.comedone;
      sums.papule += d.papule;
      sums.pustule += d.pustule;
      sums.nodule += d.nodule;
    });
    const max = Object.entries(sums).reduce((a, b) => a[1] > b[1] ? a : b);
    if (max[1] > 0) mostCommonLesion = max[0].charAt(0).toUpperCase() + max[0].slice(1);
  }

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Greeting Section */}
      <div className="mb-8">
        <h1 className="font-display text-3xl md:text-4xl text-text-primary mb-2">
          Good morning, {user?.email ? user.email.split('@')[0] : 'there'}!
        </h1>
        <p className="text-sm font-medium text-text-tertiary">
          {totalCheckins} check-ins tracked · Skin type: {user?.skinTypeConfirmed || user?.skinTypePredicted || "Unknown"}
        </p>
      </div>

      {/* Onboarding Prompts */}
      {!user?.hasCompletedQuestionnaire && (
        <div className="bg-severity-moderate/10 border border-severity-moderate/20 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-sm text-severity-moderate font-medium">
            Complete your skin profile for more accurate results
          </p>
          <Link 
            href={ROUTES.QUESTIONNAIRE}
            className="shrink-0 text-xs font-semibold bg-white text-severity-moderate px-3 py-1.5 rounded-full border border-severity-moderate/20 hover:bg-severity-moderate/5 transition-colors"
          >
            Complete Profile →
          </Link>
        </div>
      )}

      {totalCheckins === 0 && user?.hasCompletedQuestionnaire && (
        <div className="bg-bg-surface border border-border-default rounded-xl p-6 sm:p-8 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full bg-bg-subtle flex items-center justify-center mb-4">
            <Camera size={32} className="text-text-tertiary" />
          </div>
          <h2 className="font-display text-2xl text-text-primary mb-2">Begin your first check-in</h2>
          <p className="text-sm text-text-tertiary max-w-sm mb-6">
            Take a photo of your skin to establish your baseline and start tracking changes over time.
          </p>
          <button
            onClick={() => router.push(ROUTES.CHECK_IN)}
            className="h-12 px-8 rounded-full bg-accent text-text-primary font-medium hover:bg-accent/90 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
          >
            Start Check-In
          </button>
        </div>
      )}

      {/* Main Layout Grid */}
      {totalCheckins > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column (Timeline) - 60% on desktop */}
          <div className="lg:col-span-7 order-2 lg:order-1">
            <Timeline />
          </div>

          {/* Right Column (Summary Cards) - 40% on desktop */}
          <div className="lg:col-span-5 order-1 lg:order-2 space-y-6">
            
            {/* Trend Card */}
            <div className="glass-panel p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-text-primary">Lesion Trend</h3>
                
                {/* Tab Group */}
                <div className="flex bg-bg-surface rounded-lg p-0.5 border border-border-default">
                  {(["30", "90", "all"] as const).map(range => (
                    <button
                      key={range}
                      onClick={() => setDateRange(range)}
                      className={`px-2.5 py-1 text-[10px] font-medium rounded-md transition-colors ${
                        dateRange === range ? "bg-white shadow-sm text-text-primary" : "text-text-tertiary hover:text-text-primary"
                      }`}
                    >
                      {range === "all" ? "All time" : `${range}d`}
                    </button>
                  ))}
                </div>
              </div>
              
              {isLoading ? (
                <SkeletonTrendChart />
              ) : (
                <LesionTrendChart data={filteredTrendData} compact />
              )}
            </div>

            {/* Severity Timeline */}
            <SeverityTimeline checkins={checkins} />

            {/* Quick Stats */}
            <div className="glass-panel p-5 grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-[10px] text-text-tertiary font-medium uppercase tracking-wider mb-1">Total</p>
                <p className="font-display text-xl text-text-primary">{totalCheckins}</p>
              </div>
              <div className="border-x border-border-default">
                <p className="text-[10px] text-text-tertiary font-medium uppercase tracking-wider mb-1">Common</p>
                <p className="font-display text-xl text-text-primary">{mostCommonLesion}</p>
              </div>
              <div>
                <p className="text-[10px] text-text-tertiary font-medium uppercase tracking-wider mb-1">Recent</p>
                <p className="font-display text-xl text-text-primary">{mostRecent?.severity_grade || "—"}</p>
              </div>
            </div>

            {/* Ingredients Link */}
            <Link 
              href={ROUTES.INGREDIENTS}
              className="flex items-center justify-between p-5 glass-panel hover:bg-bg-subtle/50 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-bg-surface border border-border-default flex items-center justify-center group-hover:bg-white transition-colors">
                  <FlaskConical size={20} className="text-text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-text-primary">Active Ingredients</p>
                  <p className="text-xs text-text-tertiary">{active_ingredientsCount} logged products</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-text-tertiary group-hover:text-text-primary transition-colors" />
            </Link>

          </div>
        </div>
      )}

      {/* Mobile FAB */}
      <button 
        onClick={() => router.push(ROUTES.CHECK_IN)}
        className="md:hidden fixed bottom-[88px] right-4 z-40 w-14 h-14 rounded-full bg-brand text-text-inverse flex items-center justify-center shadow-xl hover:bg-brand/90 transition-transform active:scale-95"
        aria-label="New Check-In"
      >
        <Camera size={24} />
      </button>
    </div>
  );
}
