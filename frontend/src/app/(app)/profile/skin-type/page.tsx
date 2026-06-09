"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { ArrowLeft, Clock, RotateCcw, AlertCircle } from "lucide-react";
import { useAuthStore } from "@/store";
import { getSkinTypeHistory } from "@/lib/api";
import { ROUTES } from "@/lib/routes";
import SkinTypeResultCard from "@/components/skintype/SkinTypeResultCard";

export default function SkinProfilePage() {
  const user = useAuthStore((s) => s.user);

  const { data: history, isLoading, isError } = useQuery({
    queryKey: ["skinTypeHistory"],
    queryFn: getSkinTypeHistory,
  });

  // Dummy result for the card, since we only have the confirmed label
  const mockResult = {
    predicted_label: user?.skinTypePredicted || "Balanced",
    confidence: user?.skinTypeConfidence || 0.8,
    low_confidence: false,
    signal_source: user?.skinTypeSource || "unknown",
    fused_vector: { p_dry: 0.33, p_balanced: 0.34, p_oily: 0.33 },
    cnn_vector: null,
    ques_vector: null,
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-bg-base/80 backdrop-blur-md border-b border-border-default px-4 py-3 md:px-6 md:py-4 flex items-center gap-4">
        <Link 
          href={ROUTES.PROFILE}
          className="p-2 text-text-tertiary hover:text-text-primary hover:bg-bg-subtle rounded-full transition-colors"
          aria-label="Back to Profile"
        >
          <ArrowLeft size={20} />
        </Link>
        <h1 className="font-display text-xl text-text-primary">Skin Profile</h1>
      </div>

      <div className="max-w-3xl mx-auto px-4 md:px-6 py-6 md:py-8 space-y-10">
        
        {/* Section 1: Current Skin Type */}
        <section>
          <h2 className="text-sm font-medium text-text-tertiary uppercase tracking-wider mb-4">Current Profile</h2>
          <SkinTypeResultCard
            result={mockResult}
            confirmedLabel={user?.skinTypeConfirmed || null}
          />
        </section>

        {/* Section 2: History Timeline */}
        <section>
          <h2 className="text-sm font-medium text-text-tertiary uppercase tracking-wider mb-4">Your Skin Type History</h2>
          
          <div className="glass-panel p-6">
            {isLoading ? (
              <div className="space-y-4 animate-pulse">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-bg-subtle shrink-0" />
                    <div className="flex-1 space-y-2 py-1">
                      <div className="h-4 bg-bg-subtle rounded w-1/3" />
                      <div className="h-3 bg-bg-subtle rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : isError ? (
              <div className="flex items-center gap-2 text-severity-severe text-sm bg-severity-severe/10 p-3 rounded-lg border border-severity-severe/20">
                <AlertCircle size={16} />
                Failed to load history.
              </div>
            ) : !history || history.length === 0 ? (
              <p className="text-sm text-text-tertiary italic text-center py-4">No history available yet.</p>
            ) : (
              <div className="space-y-6">
                {history.map((entry, index) => (
                  <div key={entry.id} className="relative flex gap-4">
                    {/* Timeline line */}
                    {index !== history.length - 1 && (
                      <div className="absolute left-4 top-8 bottom-[-24px] w-px bg-border-default" />
                    )}
                    
                    {/* Icon */}
                    <div className="relative z-10 w-8 h-8 rounded-full bg-bg-surface border border-border-default flex items-center justify-center shrink-0">
                      <Clock size={14} className="text-text-tertiary" />
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 pt-1.5 pb-2">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-text-primary">
                          {entry.previousValue ? `${entry.previousValue} → ${entry.newValue}` : `Set to ${entry.newValue}`}
                        </p>
                        <time className="text-xs text-text-tertiary">
                          {new Date(entry.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </time>
                      </div>
                      
                      <div className="flex items-center gap-2 mt-2">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-bg-subtle text-text-primary">
                          {entry.source}
                        </span>
                        {entry.confidence && (
                          <span className="text-[10px] text-text-tertiary">
                            {Math.round(entry.confidence * 100)}% confidence
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Section 3: Retake Questionnaire */}
        <section>
          <div className="bg-bg-surface border border-border-default rounded-xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-display text-lg text-text-primary mb-1">Update your baseline</h3>
              <p className="text-sm text-text-tertiary">Re-take the skin questionnaire if your skin behavior has fundamentally changed.</p>
            </div>
            <Link 
              href={ROUTES.QUESTIONNAIRE}
              className="shrink-0 flex items-center gap-2 px-4 h-10 rounded-card border border-border-default bg-bg-base text-text-primary text-sm font-medium hover:bg-bg-subtle transition-colors shadow-sm"
            >
              <RotateCcw size={16} />
              Retake Questionnaire
            </Link>
          </div>
        </section>
        
      </div>
    </div>
  );
}
