"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Share2, Download, ChevronDown, Loader2, ArrowLeft,
  Thermometer, Droplets, Sun, Wind,
} from "lucide-react";
import dynamic from "next/dynamic";

import { getCheckinDetail } from "@/lib/api";
import { useAuthStore } from "@/store";
import { ROUTES } from "@/lib/routes";
import { env } from "@/lib/env";
import type { CheckinResult, Detection } from "@/store/types";

import SkinTypeResultCard from "@/components/skintype/SkinTypeResultCard";

const AnnotatedImage = dynamic(() => import("@/components/dashboard/AnnotatedImage"), { ssr: false });

const lesionMeta = [
  { key: "comedone", abbr: "C", label: "Comedone", color: "#94A3B8" },
  { key: "papule", abbr: "Pa", label: "Papule", color: "#3B82F6" },
  { key: "pustule", abbr: "Pu", label: "Pustule", color: "#EAB308" },
  { key: "nodule", abbr: "N", label: "Nodule", color: "#EF4444" },
];

const severityConfig: Record<string, { bg: string; text: string; border: string }> = {
  Clear:    { bg: "bg-accent/10",             text: "text-accent",            border: "border-accent/20" },
  Mild:     { bg: "bg-severity-mild/10",      text: "text-severity-mild",     border: "border-severity-mild/20" },
  Moderate: { bg: "bg-severity-moderate/10",  text: "text-severity-moderate", border: "border-severity-moderate/20" },
  Severe:   { bg: "bg-severity-severe/10",    text: "text-severity-severe",   border: "border-severity-severe/20" },
};

export default function ResultsPage() {
  const params = useParams();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const [result, setResult] = useState<CheckinResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAnnotations, setShowAnnotations] = useState(true);

  const checkin_id = params.id as string;

  useEffect(() => {
    if (!checkin_id) return;

    const fetchResult = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getCheckinDetail(checkin_id);
        setResult(data);
      } catch (err: unknown) {
        const apiErr = err as { message?: string };
        setError(apiErr.message || "Failed to load check-in details.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchResult();
  }, [checkin_id]);

  /* ─── Loading State ─── */
  if (isLoading) {
    return (
      <div className="max-w-container mx-auto flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={32} className="animate-spin text-accent" />
          <p className="text-sm text-text-tertiary font-medium">Loading check-in results...</p>
        </div>
      </div>
    );
  }

  /* ─── Error State ─── */
  if (error || !result) {
    return (
      <div className="max-w-container mx-auto flex items-center justify-center min-h-[60vh]">
        <div className="glass-panel p-8 text-center max-w-md">
          <h2 className="font-display text-2xl text-text-primary mb-2">Could not load results</h2>
          <p className="text-sm text-text-tertiary mb-6">{error || "Check-in not found."}</p>
          <button
            onClick={() => router.push(ROUTES.DASHBOARD)}
            className="h-11 px-6 rounded-card bg-brand text-text-inverse text-sm font-medium hover:bg-brand/90 transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  /* ─── Derived values ─── */
  const s = result.lesion_summary;
  const sev = severityConfig[result.severity_grade] || severityConfig.Moderate;
  const capturedDate = new Date(result.captured_at).toLocaleString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  // Build image_url — resolve relative paths against the backend
  const image_url = result.image_url
    ? result.image_url.startsWith("http")
      ? result.image_url
      : `${env.apiUrl}${result.image_url}`
    : null;

  return (
    <div className="max-w-container mx-auto">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2 text-sm text-text-tertiary">
          <button
            onClick={() => router.push(ROUTES.DASHBOARD)}
            className="flex items-center gap-1 hover:text-text-primary transition-colors"
          >
            <ArrowLeft size={14} />
            Dashboard
          </button>
          <span>/</span>
          <span className="text-text-primary">{capturedDate}</span>
        </div>
        <div className="flex gap-2">
          <button className="p-2 text-text-tertiary hover:text-text-primary transition-colors" aria-label="Share">
            <Share2 size={16} />
          </button>
          <button className="p-2 text-text-tertiary hover:text-text-primary transition-colors" aria-label="Download">
            <Download size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT: Image + Annotations */}
        <div className="space-y-4">
          {/* Annotated Image from real detections */}
          {image_url ? (
            <AnnotatedImage
              image_url={image_url}
              detections={showAnnotations ? result.detections : []}
              isLoading={false}
            />
          ) : (
            <div className="aspect-square rounded-card bg-bg-subtle flex items-center justify-center">
              <p className="text-sm text-text-tertiary">Image not available</p>
            </div>
          )}

          {/* Lesion Legend */}
          <div className="flex items-center gap-3 flex-wrap">
            {lesionMeta.map((l) => {
              const count = s[l.key as keyof typeof s] as number;
              return (
                <div key={l.key} className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: l.color }} />
                  <span className="text-xs font-medium text-text-tertiary">
                    {l.abbr} {count}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Annotations toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAnnotations(!showAnnotations)}
              className={`relative w-9 h-5 rounded-full transition-colors ${
                showAnnotations ? "bg-accent" : "bg-bg-subtle border border-border-default"
              }`}
              role="switch"
              aria-checked={showAnnotations}
              aria-label="Show annotations"
            >
              <span
                className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
                  showAnnotations ? "left-[18px]" : "left-0.5"
                }`}
              />
            </button>
            <span className="text-sm text-text-tertiary">Show annotations</span>
          </div>

          {/* Severity badge */}
          <div className="flex justify-center">
            <span
              className={`${sev.bg} ${sev.text} ${sev.border} border text-sm font-medium uppercase px-4 py-2 rounded-lg tracking-wider`}
            >
              {result.severity_grade}
            </span>
          </div>

          {/* Disclaimer */}
          <div className="glass-panel p-4">
            <p className="text-xs italic text-text-tertiary">
              This severity grading is a wellness estimate based on detected lesions — not a clinical assessment.
            </p>
          </div>
        </div>

        {/* RIGHT: Insight Cards */}
        <div className="space-y-4">
          {/* Skin Profile (Real Data) */}
          <SkinTypeResultCard
            result={result.skin_type_result}
            confirmedLabel={user?.skinTypeConfirmed || null}
          />

          {/* Environmental Snapshot */}
          {result.env_snapshot && (
            <section className="glass-panel p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-medium text-text-tertiary uppercase tracking-wider">
                  Conditions at Capture
                </h3>
                <span className="text-xs text-text-tertiary">{capturedDate}</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  {
                    icon: <Thermometer size={18} />,
                    value: result.env_snapshot.temperature != null ? `${result.env_snapshot.temperature.toFixed(1)}°C` : "—",
                    label: "Temperature",
                  },
                  {
                    icon: <Droplets size={18} />,
                    value: result.env_snapshot.humidity != null ? `${result.env_snapshot.humidity.toFixed(0)}%` : "—",
                    label: "Humidity",
                  },
                  {
                    icon: <Sun size={18} />,
                    value: result.env_snapshot.uv_index != null ? result.env_snapshot.uv_index.toFixed(1) : "—",
                    label: "UV Index",
                    warn: (result.env_snapshot.uv_index ?? 0) >= 6,
                  },
                  {
                    icon: <Wind size={18} />,
                    value: result.env_snapshot.pm25 != null ? `${result.env_snapshot.pm25.toFixed(0)} µg/m³` : "—",
                    label: "PM2.5",
                  },
                ].map((m) => (
                  <div key={m.label} className="bg-bg-surface rounded-xl border border-border-default p-4 text-center">
                    <div className="flex justify-center mb-2 text-text-tertiary">{m.icon}</div>
                    <div className={`font-display text-xl ${m.warn ? "text-severity-moderate" : "text-text-primary"}`}>
                      {m.value}
                    </div>
                    <div className="text-xs text-text-tertiary mt-1">{m.label}</div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Observations / Insights */}
          {result.observations.length > 0 && (
            <section className="glass-panel p-6">
              <h3 className="text-xs font-medium text-text-tertiary uppercase tracking-wider mb-4">
                Insights
              </h3>
              <div className="space-y-4">
                {result.observations.map((obs, i) => (
                  <div key={i} className="flex gap-3 border-l-2 border-accent pl-4">
                    <p className="text-sm text-text-primary leading-relaxed">{obs}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Active Ingredients */}
          <section className="glass-panel p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-medium text-text-tertiary uppercase tracking-wider">
                Active Ingredients
              </h3>
              <Link href={ROUTES.INGREDIENTS} className="text-xs text-accent hover:underline">
                Manage ›
              </Link>
            </div>
            {result.active_ingredients.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {result.active_ingredients.map((ing) => (
                  <span
                    key={ing.id}
                    className="bg-bg-surface border border-border-default text-sm text-text-primary px-3 py-1.5 rounded-lg"
                  >
                    {ing.name}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-text-tertiary italic">No active ingredients logged for this check-in.</p>
            )}
          </section>

          {/* Inference Metadata */}
          <div className="flex items-center justify-center gap-4 text-[10px] text-text-tertiary font-medium uppercase tracking-wider">
            <span>Inference: {result.inference_ms}ms</span>
            <span>·</span>
            <span>Check-in ID: {result.checkin_id.slice(0, 8)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
