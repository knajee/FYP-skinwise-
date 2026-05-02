"use client";

import { useState } from "react";
import { SKIN_QUESTIONS } from "@/lib/constants";
import { Check, ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import type { SkinType } from "@/types";

export default function OnboardingPage() {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<(string | null)[]>(
    new Array(SKIN_QUESTIONS.length).fill(null)
  );
  const [completed, setCompleted] = useState(false);

  const question = SKIN_QUESTIONS[currentQ];
  const progress = ((currentQ + 1) / SKIN_QUESTIONS.length) * 100;

  function selectAnswer(value: string) {
    const updated = [...answers];
    updated[currentQ] = value;
    setAnswers(updated);
  }

  function goNext() {
    if (currentQ < SKIN_QUESTIONS.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      setCompleted(true);
    }
  }

  function goBack() {
    if (currentQ > 0) setCurrentQ(currentQ - 1);
  }

  // Determine result from answers
  function getResult(): SkinType {
    const counts = { dry: 0, balanced: 0, oily: 0 };
    answers.forEach((a) => {
      if (a && a in counts) counts[a as SkinType]++;
    });
    return (Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0] as SkinType);
  }

  if (completed) {
    const result = getResult();
    const labels: Record<SkinType, string> = {
      dry: "Dry",
      balanced: "Balanced",
      oily: "Oily",
    };

    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          {/* Animated pills */}
          <div className="flex justify-center gap-3 mb-8">
            {(["dry", "balanced", "oily"] as SkinType[]).map((type, i) => (
              <div
                key={type}
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-500 ${
                  type === result
                    ? "bg-accent/20 text-accent border border-accent/30 shadow-glow-teal scale-110"
                    : "bg-surface-2 text-slate-500 border border-transparent"
                }`}
                style={{ animationDelay: `${i * 200}ms` }}
              >
                {labels[type]}
              </div>
            ))}
          </div>

          <h1 className="font-display text-[28px] text-white mb-3">
            Your skin profile is ready.
          </h1>
          <p className="text-body text-slate-400 mb-8">
            Combined with your check-in image, this gives us a more accurate
            estimate.
          </p>
          <Link
            href="/check-in"
            className="inline-flex items-center bg-accent text-black font-medium text-sm h-11 px-6 rounded-lg hover:bg-accent-hover transition-colors duration-150 gap-2"
          >
            Take your first check-in
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas flex flex-col">
      {/* Progress bar */}
      <div className="relative">
        <div className="h-0.5 bg-white/[0.06] w-full" />
        <div
          className="absolute top-0 left-0 h-0.5 bg-accent transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
        <div className="max-w-[600px] mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="font-display text-lg text-white">
            SkinWISE
          </Link>
          <span className="text-micro font-mono text-slate-500">
            Question {currentQ + 1} of {SKIN_QUESTIONS.length}
          </span>
        </div>
      </div>

      {/* Question card */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-[600px] w-full card-surface-1 p-8 animate-fade-in-up">
          <div className="text-micro font-mono text-accent uppercase tracking-wider mb-4">
            Q{currentQ + 1} / {question.category}
          </div>
          <h2 className="font-display text-card-header text-white mb-6">
            {question.text}
          </h2>

          {/* Options */}
          <div className="space-y-3">
            {question.options.map((opt) => {
              const selected = answers[currentQ] === opt.value;
              return (
                <button
                  key={opt.label}
                  onClick={() => selectAnswer(opt.value)}
                  className={`w-full flex items-center justify-between px-5 py-3.5 rounded-lg text-left text-sm transition-all duration-150 ${
                    selected
                      ? "bg-accent/[0.08] border border-teal-500 text-white"
                      : "bg-surface-2 border border-transparent text-slate-300 hover:border-white/10 hover:bg-surface-3"
                  }`}
                >
                  <span>{opt.label}</span>
                  {selected && (
                    <Check size={16} className="text-accent flex-shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8">
            <button
              onClick={goBack}
              disabled={currentQ === 0}
              className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ArrowLeft size={16} />
              Back
            </button>
            <button
              onClick={goNext}
              disabled={answers[currentQ] === null}
              className="bg-accent text-black font-medium text-sm h-11 px-6 rounded-lg hover:bg-accent-hover transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {currentQ === SKIN_QUESTIONS.length - 1 ? "Complete" : "Continue"}
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
