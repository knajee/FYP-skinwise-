"use client";

import { useState } from "react";
import { Info, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SkinTypeResult } from "@/store/types";
import SkinTypeProbabilityBars from "./SkinTypeProbabilityBars";

interface SignalSourceBreakdownProps {
  result: SkinTypeResult;
}

export default function SignalSourceBreakdown({ result }: SignalSourceBreakdownProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="mt-4 border-t border-border-default pt-4">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 text-xs font-medium text-text-tertiary hover:text-text-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded"
        aria-expanded={isExpanded}
        aria-controls="signal-source-content"
      >
        <Info size={14} />
        How was this determined?
        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      <div
        id="signal-source-content"
        className={cn(
          "overflow-hidden transition-all duration-300 ease-in-out",
          isExpanded ? "max-h-[500px] opacity-100 mt-4" : "max-h-0 opacity-0"
        )}
      >
        <div className="p-4 bg-bg-surface rounded-xl border border-border-default space-y-4">
          {result.signal_source === "fusion" && result.ques_vector && result.cnn_vector ? (
            <>
              <div className="space-y-2">
                <p className="text-xs font-medium text-text-primary uppercase tracking-wider">Questionnaire (60%)</p>
                <SkinTypeProbabilityBars vector={result.ques_vector} compact />
              </div>
              <div className="w-full h-px bg-border-default/50" />
              <div className="space-y-2">
                <p className="text-xs font-medium text-text-primary uppercase tracking-wider">Image Analysis (40%)</p>
                <SkinTypeProbabilityBars vector={result.cnn_vector} compact />
              </div>
              <div className="w-full h-px bg-border-default/50" />
              <div className="space-y-2">
                <p className="text-xs font-medium text-accent uppercase tracking-wider">Combined Result</p>
                <SkinTypeProbabilityBars vector={result.fused_vector} compact highlightLabel={result.predicted_label} />
              </div>
            </>
          ) : result.signal_source === "cnn_only" && result.cnn_vector ? (
            <div className="space-y-3">
              <p className="text-sm text-text-tertiary italic">Questionnaire data not available — image analysis used only.</p>
              <SkinTypeProbabilityBars vector={result.cnn_vector} compact highlightLabel={result.predicted_label} />
            </div>
          ) : result.signal_source === "questionnaire_only" && result.ques_vector ? (
            <div className="space-y-3">
              <p className="text-sm text-text-tertiary italic">Image analysis not available — questionnaire result used.</p>
              <SkinTypeProbabilityBars vector={result.ques_vector} compact highlightLabel={result.predicted_label} />
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs font-medium text-accent uppercase tracking-wider">Combined Result</p>
              <SkinTypeProbabilityBars vector={result.fused_vector} compact highlightLabel={result.predicted_label} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
