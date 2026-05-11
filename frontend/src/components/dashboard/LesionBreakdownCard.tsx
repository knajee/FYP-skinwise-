"use client";

import { CheckCircle2 } from "lucide-react";
import type { CheckinResult } from "@/store/types";

interface LesionBreakdownCardProps {
  summary: CheckinResult['lesionSummary'];
}

export default function LesionBreakdownCard({ summary }: LesionBreakdownCardProps) {
  if (summary.total === 0) {
    return (
      <div className="glass-panel p-6 flex flex-col items-center justify-center text-center space-y-3 mt-4">
        <CheckCircle2 size={32} className="text-accent" />
        <p className="font-medium text-text-primary">No lesions detected in this check-in.</p>
      </div>
    );
  }

  const inflammatoryRatioPct = (summary.inflammatoryRatio * 100).toFixed(0);

  return (
    <div className="glass-panel p-6 mt-4 animate-fade-in-up">
      <dl className="grid grid-cols-2 gap-4 mb-6">
        {/* Comedone */}
        <div className="p-4 rounded-xl border border-border-default bg-bg-surface">
          <dt className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-slate-400" aria-hidden="true" />
            <span className="text-xs font-medium text-text-tertiary uppercase tracking-wider">Comedone</span>
          </dt>
          <dd className="font-display text-3xl text-text-primary">{summary.comedone}</dd>
        </div>
        {/* Papule */}
        <div className="p-4 rounded-xl border border-border-default bg-bg-surface">
          <dt className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-blue-500" aria-hidden="true" />
            <span className="text-xs font-medium text-text-tertiary uppercase tracking-wider">Papule</span>
          </dt>
          <dd className="font-display text-3xl text-text-primary">{summary.papule}</dd>
        </div>
        {/* Pustule */}
        <div className="p-4 rounded-xl border border-border-default bg-bg-surface">
          <dt className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-yellow-500" aria-hidden="true" />
            <span className="text-xs font-medium text-text-tertiary uppercase tracking-wider">Pustule</span>
          </dt>
          <dd className="font-display text-3xl text-text-primary">{summary.pustule}</dd>
        </div>
        {/* Nodule */}
        <div className="p-4 rounded-xl border border-border-default bg-bg-surface">
          <dt className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-red-500" aria-hidden="true" />
            <span className="text-xs font-medium text-text-tertiary uppercase tracking-wider">Nodule</span>
          </dt>
          <dd className="font-display text-3xl text-text-primary">{summary.nodule}</dd>
        </div>
      </dl>

      <div className="space-y-3 border-t border-border-default pt-4">
        <p className="text-sm font-medium text-text-tertiary">
          Total lesions detected: <span className="text-text-primary font-semibold">{summary.total}</span>
        </p>
        
        <div className="group relative" title="Papules + Pustules + Nodules as a percentage of all detected lesions">
          <div className="flex items-center justify-between text-sm mb-1.5">
            <span className="font-medium text-text-primary cursor-help underline decoration-dotted decoration-skin-muted underline-offset-2">
              Inflammatory burden
            </span>
            <span className="font-semibold text-severity-severe">{inflammatoryRatioPct}%</span>
          </div>
          <div className="h-2 w-full bg-border-default rounded-full overflow-hidden">
            <div 
              className="h-full bg-severity-severe transition-all duration-1000 ease-out" 
              style={{ width: `${inflammatoryRatioPct}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
