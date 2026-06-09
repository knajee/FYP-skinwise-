"use client";

import { useState } from "react";
import { Pencil, AlertTriangle, Undo2 } from "lucide-react";
import type { SkinTypeResult } from "@/store/types";
import SkinTypeProbabilityBars from "./SkinTypeProbabilityBars";
import SignalSourceBreakdown from "./SignalSourceBreakdown";
import SkinTypeOverrideModal from "./SkinTypeOverrideModal";
import { updateSkinType } from "@/lib/api";
import { useAuthStore } from "@/store";
import toast from "react-hot-toast";

interface SkinTypeResultCardProps {
  result: SkinTypeResult;
  confirmedLabel: string | null;
  onOverride?: (newLabel: string) => void;
}

export default function SkinTypeResultCard({
  result,
  confirmedLabel,
  onOverride,
}: SkinTypeResultCardProps) {
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const setUser = useAuthStore((s) => s.setUser);
  const user = useAuthStore((s) => s.user);

  const displayLabel = confirmedLabel || result.predicted_label;
  const isOverridden = confirmedLabel !== null && confirmedLabel !== result.predicted_label;

  const handleOverride = async (newLabel: string) => {
    setIsUpdating(true);
    try {
      const updatedUser = await updateSkinType(newLabel);
      if (user) {
        setUser({ ...user, skinTypeConfirmed: newLabel });
      } else {
        setUser(updatedUser);
      }
      toast.success(`Skin type updated to ${newLabel}`);
      setShowOverrideModal(false);
      if (onOverride) onOverride(newLabel);
    } catch (error) {
      console.error(error);
      toast.error("Failed to update skin type");
    } finally {
      setIsUpdating(false);
    }
  };

  const resetToModel = async () => {
    await handleOverride(result.predicted_label);
  };

  return (
    <section className="glass-panel p-6 relative" aria-labelledby="skintype-heading">
      <div className="flex items-start justify-between mb-2">
        <h2 id="skintype-heading" className="text-xs font-medium text-text-tertiary uppercase tracking-wider">
          Skin Profile
        </h2>
        <button
          onClick={() => setShowOverrideModal(true)}
          disabled={isUpdating}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-text-primary bg-bg-surface hover:bg-bg-subtle border border-border-default transition-colors disabled:opacity-50"
          aria-label="Edit skin type"
        >
          <Pencil size={12} />
          Edit
        </button>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <h3 className="font-display text-4xl text-text-primary">
          {displayLabel}
        </h3>
        {isOverridden && (
          <button
            onClick={resetToModel}
            disabled={isUpdating}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-severity-mild/10 border border-severity-mild/20 text-severity-mild text-[10px] font-medium hover:bg-severity-mild/20 transition-colors"
            title="Reset to model prediction"
          >
            <Undo2 size={12} />
            You adjusted this
          </button>
        )}
      </div>

      {result.low_confidence && !isOverridden && (
        <div className="flex items-start gap-2 p-3 mb-6 rounded-xl bg-severity-moderate/10 border border-severity-moderate/20 text-xs text-severity-moderate font-medium">
          <AlertTriangle size={16} className="shrink-0 mt-0.5" />
          <p>
            Low confidence — image analysis was uncertain. We recommend completing the questionnaire for a more accurate result.
          </p>
        </div>
      )}

      <SkinTypeProbabilityBars vector={result.fused_vector} highlightLabel={displayLabel} />

      <SignalSourceBreakdown result={result} />

      {showOverrideModal && (
        <SkinTypeOverrideModal
          currentLabel={displayLabel}
          onConfirm={handleOverride}
          onClose={() => setShowOverrideModal(false)}
        />
      )}
    </section>
  );
}
