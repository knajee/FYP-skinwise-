"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Question } from "@/lib/questionnaire";

/* ─── Props ─── */
interface QuestionCardProps {
  question: Question;
  questionIndex: number;
  totalQuestions: number;
  selectedOptionIndex: number | null;
  onSelect: (index: number) => void;
}

/* ─── Component ─── */
export default function QuestionCard({
  question,
  questionIndex,
  totalQuestions,
  selectedOptionIndex,
  onSelect,
}: QuestionCardProps) {
  return (
    <div className="animate-fade-in">
      {/* Question number pill */}
      <div className="mb-4">
        <span className="inline-block text-xs font-medium text-text-tertiary tracking-widest uppercase">
          {questionIndex + 1} of {totalQuestions}
        </span>
      </div>

      {/* Question text */}
      <h2 className="font-display text-2xl text-text-primary leading-snug mb-2">
        {question.question}
      </h2>

      {/* Clinical signal */}
      <p className="text-sm italic text-text-tertiary mb-8">
        {question.clinicalSignal}
      </p>

      {/* Option cards — 2×2 grid on desktop, 1 column on mobile */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3" role="group" aria-label={question.question}>
        {question.options.map((option, idx) => {
          const isSelected = selectedOptionIndex === idx;
          return (
            <button
              key={idx}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onSelect(idx)}
              className={cn(
                "relative text-left px-4 py-4 rounded-xl border transition-all duration-200",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-skin-sage",
                isSelected
                  ? "border-skin-charcoal bg-bg-subtle font-semibold text-text-primary shadow-card"
                  : "border-border-default bg-bg-surface text-text-primary/80 hover:bg-bg-subtle/40 hover:border-skin-charcoal/20"
              )}
            >
              <span className="block text-sm leading-relaxed pr-8">
                {option}
              </span>
              {isSelected && (
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2">
                  <Check
                    size={18}
                    className="text-accent"
                    strokeWidth={2.5}
                    aria-hidden="true"
                  />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
