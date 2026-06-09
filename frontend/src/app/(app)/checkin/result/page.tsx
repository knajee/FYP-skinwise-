"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Share2, ArrowRight } from "lucide-react";
import { toast } from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";

import { useCheckinStore } from "@/store";
import { ROUTES } from "@/lib/routes";
import dynamic from "next/dynamic";

const AnnotatedImage = dynamic(() => import("@/components/dashboard/AnnotatedImage"), { ssr: false });
import LesionBreakdownCard from "@/components/dashboard/LesionBreakdownCard";
import SkeletonInsightPanel from "@/components/ui/skeletons/SkeletonInsightPanel";
import Badge from "@/components/ui/Badge";
import EnvironmentalSnapshotCard from "@/components/dashboard/EnvironmentalSnapshotCard";
import ObservationsPanel from "@/components/dashboard/ObservationsPanel";
import SkinTypeResultCard from "@/components/skintype/SkinTypeResultCard";
import { useAuthStore } from "@/store";

export default function InsightPanelPage() {
  const router = useRouter();
  const activeCheckin = useCheckinStore(s => s.activeCheckin);
  const user = useAuthStore(s => s.user);
  const result = activeCheckin.result;
  const captured_at = activeCheckin.exifCapturedAt || new Date().toISOString();
  const resetActiveCheckin = useCheckinStore(s => s.resetActiveCheckin);
  const queryClient = useQueryClient();
  
  // Use preview URL if available as fallback to actual uploaded URL if the result doesn't have one (though result should).
  // Assuming the result might have a processed image URL or we use the local preview for the session.
  const image_url = activeCheckin.imagePreviewUrl || "";

  useEffect(() => {
    // Redirect if there is no active result and we are not uploading
    if (!result && activeCheckin.uploadStatus === 'idle') {
      router.push(ROUTES.CHECK_IN);
    } else if (result) {
      // Invalidate the dashboard checkins list so it fetches the new one
      queryClient.invalidateQueries({ queryKey: ['checkins'] });
    }
  }, [result, router, queryClient, activeCheckin.uploadStatus]);

  if (!result) {
    return (
      <div className="min-h-screen pb-20">
        <SkeletonInsightPanel />
      </div>
    );
  }

  const handleStartAnother = () => {
    resetActiveCheckin();
    router.push(ROUTES.CHECK_IN);
  };

  const handleShare = () => {
    toast("PDF export coming in Phase 2", {
      icon: "📄"
    });
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-bg-base/80 backdrop-blur-md border-b border-border-default px-4 py-3 md:px-6 md:py-4 flex items-center justify-between">
        <h1 className="font-display text-xl text-text-primary">Check-in Results</h1>
        <button 
          onClick={handleShare}
          className="p-2 text-text-tertiary hover:text-text-primary hover:bg-bg-subtle rounded-full transition-colors"
          aria-label="Share or Export"
        >
          <Share2 size={20} />
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: 55% on desktop */}
          <div className="lg:col-span-7 space-y-6">
            <section aria-labelledby="image-analysis-heading">
              <h2 id="image-analysis-heading" className="sr-only">Image Analysis</h2>
              <AnnotatedImage 
                image_url={image_url} 
                detections={result.detections} 
                isLoading={activeCheckin.uploadStatus === 'processing'} 
              />
              <LesionBreakdownCard summary={result.lesion_summary} />
            </section>
          </div>

          {/* RIGHT COLUMN: 45% on desktop */}
          <div className="lg:col-span-5 space-y-6">
            <section aria-labelledby="severity-heading" className="glass-panel p-6">
              <h2 id="severity-heading" className="sr-only">Severity Assessment</h2>
              <Badge grade={result.severity_grade} variant="hero" />
            </section>

            <EnvironmentalSnapshotCard 
              snapshot={result.env_snapshot} 
              captured_at={captured_at} 
            />

            <SkinTypeResultCard 
              result={result.skin_type_result} 
              confirmedLabel={user?.skinTypeConfirmed || null} 
            />

            <ObservationsPanel 
              observations={result.observations} 
              active_ingredients={result.active_ingredients} 
            />
          </div>
        </div>
      </div>

      {/* Bottom Sticky Action Bar */}
      <div className="fixed bottom-0 inset-x-0 z-20 bg-bg-base/90 backdrop-blur-md border-t border-border-default p-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link 
            href={ROUTES.DASHBOARD}
            className="w-full sm:w-auto h-11 px-6 flex items-center justify-center rounded-card border border-skin-charcoal text-text-primary font-medium text-sm hover:bg-bg-subtle/50 transition-colors"
          >
            Back to Dashboard
          </Link>
          
          <div className="flex w-full sm:w-auto flex-col sm:flex-row gap-4">
            <button 
              onClick={handleStartAnother}
              className="w-full sm:w-auto h-11 px-6 flex items-center justify-center rounded-card border border-accent text-accent font-medium text-sm hover:bg-accent/10 transition-colors"
            >
              Start another check-in
            </button>
            <Link 
              href={ROUTES.INGREDIENTS}
              className="w-full sm:w-auto h-11 px-6 flex items-center justify-center gap-2 bg-brand text-text-inverse font-medium text-sm rounded-card hover:bg-brand/90 transition-colors shadow-sm"
            >
              Start tracking ingredients
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
