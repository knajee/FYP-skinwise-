"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { Ingredient } from "@/store/types";
import { cn } from "@/lib/utils";

interface ObservationsPanelProps {
  observations: string[];
  activeIngredients: Ingredient[];
}

const PROHIBITED_WORDS = [
  "diagnose", "diagnosis", "treat", "treatment", "cure", 
  "prescription", "clinical recommendation", "medical advice"
];

function checkProhibitedVocab(text: string): boolean {
  const lowerText = text.toLowerCase();
  return PROHIBITED_WORDS.some(word => lowerText.includes(word));
}

export default function ObservationsPanel({ observations, activeIngredients }: ObservationsPanelProps) {
  const [expanded, setExpanded] = useState<Record<number, boolean>>({ 0: true, 1: true });

  const toggleExpand = (index: number) => {
    setExpanded(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const citationRegex = /\([A-Z][a-z]+ et al\.\)|\(\d{4}\)/g;

  return (
    <section aria-labelledby="observations-heading" className="glass-panel p-6">
      <h2 id="observations-heading" className="font-display text-lg text-text-primary mb-4">Insights & Observations</h2>
      
      {observations.length === 0 ? (
        <p className="text-sm text-text-tertiary italic mb-6">No environmental triggers identified for this check-in.</p>
      ) : (
        <div className="space-y-3 mb-8">
          {observations.map((obs, idx) => {
            const isExpanded = expanded[idx];
            
            // Compliance check
            const isProhibited = checkProhibitedVocab(obs);
            let displayObs = obs;
            if (isProhibited) {
              console.error("[SkinWISE Compliance] Prohibited vocabulary detected in observation:", obs);
              displayObs = "Observation unavailable due to compliance constraints.";
            }

            const isTruncated = displayObs.length > 80;
            const hasCitation = !isProhibited && citationRegex.test(displayObs);
            
            return (
              <div key={idx} className="border border-border-default rounded-xl bg-bg-surface overflow-hidden">
                <button
                  type="button"
                  onClick={() => toggleExpand(idx)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-bg-subtle/30 transition-colors"
                  aria-expanded={isExpanded}
                >
                  <span className="text-sm font-medium text-text-primary">
                    {isExpanded ? "Observation" : `${displayObs.substring(0, 80)}${isTruncated ? "..." : ""}`}
                  </span>
                  {isExpanded ? <ChevronUp size={16} className="text-text-tertiary" /> : <ChevronDown size={16} className="text-text-tertiary" />}
                </button>
                
                <div className={cn("px-4 pb-4 transition-all", isExpanded ? "block" : "hidden")}>
                  <p className="text-sm text-text-primary/80 leading-relaxed mb-3">{displayObs}</p>
                  {hasCitation && (
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-medium bg-accent/10 text-accent uppercase tracking-wider">
                      Clinical Source
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="border-t border-border-default pt-6">
        <h3 className="text-sm font-medium text-text-tertiary mb-3 uppercase tracking-wider">Active at time of check-in</h3>
        
        {activeIngredients.length === 0 ? (
          <p className="text-sm text-text-tertiary italic">No ingredients logged — add your skincare routine to track efficacy.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {activeIngredients.map((ing) => (
              <span key={ing.id} className="inline-flex items-center px-3 py-1.5 rounded-full bg-bg-subtle border border-skin-muted/20 text-xs font-medium text-text-primary">
                {ing.name} {ing.concentration ? `(${ing.concentration})` : ""}
              </span>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
