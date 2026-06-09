"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Loader2, Sparkles } from "lucide-react";
import QuestionCard from "@/components/onboarding/QuestionCard";
import {
  QUESTIONS,
  scoreQuestionnaire,
  getSkinTypeLabelFromVector,
  type SkinVector,
} from "@/lib/questionnaire";
import { useCheckinStore, useAuthStore } from "@/store";
import { submitQuestionnaire } from "@/lib/api";
import { ROUTES } from "@/lib/routes";

/* ─── Probability Bar ─── */
function ProbabilityBar({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-text-primary">{label}</span>
        <span className="text-text-tertiary font-medium">
          {Math.round(value * 100)}%
        </span>
      </div>
      <div className="h-2.5 bg-bg-subtle/60 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{
            width: `${Math.round(value * 100)}%`,
            backgroundColor: color,
          }}
        />
      </div>
    </div>
  );
}

/* ─── Questionnaire Page ─── */
export default function QuestionnairePage() {
  const router = useRouter();

  // Zustand stores
  const setQuestionnaireVector = useCheckinStore(
    (s) => s.setQuestionnaireVector
  );
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  // Local state
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedVector, setCompletedVector] = useState<SkinVector | null>(
    null
  );
  const [showRestart, setShowRestart] = useState(false);

  const totalQuestions = QUESTIONS.length;
  const currentQuestion = QUESTIONS[currentStep];
  const hasAnsweredCurrent = responses[currentQuestion.id] !== undefined;
  const isLastStep = currentStep === totalQuestions - 1;

  // Check if already completed
  const alreadyCompleted = user?.hasCompletedQuestionnaire && !showRestart;

  /* ─── Handlers ─── */
  const handleSelect = useCallback(
    (optionIndex: number) => {
      setResponses((prev) => ({
        ...prev,
        [currentQuestion.id]: optionIndex,
      }));
    },
    [currentQuestion.id]
  );

  const goBack = () => {
    if (currentStep > 0) setCurrentStep((s) => s - 1);
  };

  const goNext = () => {
    if (!isLastStep) {
      setCurrentStep((s) => s + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    // 1. Score locally
    const vector = scoreQuestionnaire(responses);

    // 2. Store in checkin store
    setQuestionnaireVector(vector);

    // 3. Try submitting to backend (graceful — proceed even on failure)
    try {
      const payload = {
        q1: Number(responses['q1']),
        q2: Number(responses['q2']),
        q3: Number(responses['q3']),
        q4: Number(responses['q4']),
        q5: Number(responses['q5']),
        q6: Number(responses['q6']),
        q7: Number(responses['q7']),
      };
      await submitQuestionnaire(payload);
    } catch (error) {
      console.warn("[SkinWISE] Questionnaire API submit failed:", error);
    }

    // 4. Update auth store
    if (user) {
      setUser({ ...user, hasCompletedQuestionnaire: true });
    }

    // 5. Show success screen
    setCompletedVector(vector);
    setIsSubmitting(false);

    // 6. Navigate after brief delay
    setTimeout(() => {
      router.push(ROUTES.CHECK_IN);
    }, 2500);
  };

  const handleRestart = () => {
    setShowRestart(true);
    setCurrentStep(0);
    setResponses({});
    setCompletedVector(null);
  };

  /* ─── Already Completed Screen ─── */
  if (alreadyCompleted) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center glass-panel p-10">
          <div className="w-16 h-16 rounded-full bg-accent/15 flex items-center justify-center mx-auto mb-6">
            <Sparkles size={28} className="text-accent" />
          </div>
          <h1 className="font-display text-2xl text-text-primary mb-3">
            Profile complete
          </h1>
          <p className="text-sm text-text-tertiary mb-8 leading-relaxed">
            You&apos;ve already completed your skin profile questionnaire. Your
            responses are used to enhance every check-in analysis.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href={ROUTES.PROFILE}
              className="inline-flex items-center justify-center gap-2 bg-brand text-text-inverse font-medium text-sm h-11 px-6 rounded-card hover:bg-brand/90 transition-colors"
            >
              View Profile
            </Link>
            <button
              onClick={handleRestart}
              className="inline-flex items-center justify-center gap-2 border border-skin-charcoal text-text-primary font-medium text-sm h-11 px-6 rounded-card hover:bg-brand/5 transition-colors"
            >
              Start Over
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ─── Success / Completed Screen ─── */
  if (completedVector) {
    const label = getSkinTypeLabelFromVector(completedVector);

    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center animate-fade-in">
          {/* Skin type label */}
          <div className="mb-6">
            <span className="inline-block text-xs font-medium text-accent tracking-widest uppercase mb-3">
              Your skin profile
            </span>
            <h1 className="font-display text-hero text-text-primary">
              {label}
            </h1>
          </div>

          <p className="text-sm text-text-tertiary mb-8 leading-relaxed">
            Your skin profile has been created. This signal will be fused with
            image analysis for more accurate predictions.
          </p>

          {/* Probability bars */}
          <div className="glass-panel p-6 space-y-4 text-left mb-8">
            <ProbabilityBar
              label="Dry"
              value={completedVector.p_dry}
              color="var(--skin-amber)"
            />
            <ProbabilityBar
              label="Balanced"
              value={completedVector.p_balanced}
              color="var(--skin-sage)"
            />
            <ProbabilityBar
              label="Oily"
              value={completedVector.p_oily}
              color="var(--skin-sky)"
            />
          </div>

          {/* Auto-redirect indicator */}
          <div className="flex items-center justify-center gap-2 text-sm text-text-tertiary">
            <Loader2 size={14} className="animate-spin" />
            <span>Redirecting to your first check-in…</span>
          </div>
        </div>
      </div>
    );
  }

  /* ─── Wizard Flow ─── */
  const progressPercent = ((currentStep + 1) / totalQuestions) * 100;

  return (
    <div className="min-h-[70vh] flex flex-col">
      {/* Header with logo and progress */}
      <div className="px-4 md:px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between mb-4">
          <span className="font-display text-lg text-text-primary">
            Skin<span className="text-accent">WISE</span>
          </span>
          <span className="text-xs text-text-tertiary font-medium">
            Skin Profile Setup
          </span>
        </div>

        {/* Progress bar */}
        <div className="max-w-2xl mx-auto">
          <div
            className="h-1.5 bg-bg-subtle rounded-full overflow-hidden"
            role="progressbar"
            aria-valuenow={currentStep + 1}
            aria-valuemin={1}
            aria-valuemax={totalQuestions}
            aria-label={`Question ${currentStep + 1} of ${totalQuestions}`}
          >
            <div
              className="h-full bg-accent rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Question area */}
      <div className="flex-1 flex items-center justify-center px-4 md:px-6 py-8">
        <div className="max-w-2xl w-full glass-panel p-6 md:p-10">
          <QuestionCard
            key={currentQuestion.id}
            question={currentQuestion}
            questionIndex={currentStep}
            totalQuestions={totalQuestions}
            selectedOptionIndex={responses[currentQuestion.id] ?? null}
            onSelect={handleSelect}
          />

          {/* Navigation */}
          <div className="flex items-center justify-between mt-10 pt-6 border-t border-border-default">
            <button
              type="button"
              onClick={goBack}
              disabled={currentStep === 0}
              className="flex items-center gap-2 text-sm font-medium text-text-tertiary hover:text-text-primary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ArrowLeft size={16} />
              Back
            </button>

            <button
              type="button"
              onClick={goNext}
              disabled={!hasAnsweredCurrent || isSubmitting}
              className="flex items-center gap-2 bg-brand text-text-inverse font-medium text-sm h-11 px-6 rounded-card hover:bg-brand/90 transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isSubmitting && <Loader2 size={16} className="animate-spin" />}
              {isSubmitting
                ? "Analysing…"
                : isLastStep
                ? "Complete Profile"
                : "Next"}
              {!isSubmitting && <ArrowRight size={16} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
