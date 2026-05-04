"use client";

import { useState } from "react";
import { Share2, Download, ChevronDown, Pencil } from "lucide-react";
import Link from "next/link";

/* Mock data for demo */
const mockResult = {
  date: "April 14, 2026",
  severity: "moderate" as const,
  lesions: { comedone: 8, papule: 4, pustule: 2, nodule: 0 },
  skinType: { type: "Balanced", confidence: 72, imageScore: 0.61, questionnaireScore: 0.78 },
  env: { temp: "32°C", humidity: "68%", uv: "5.2", pm25: "42µg/m³", datetime: "Apr 14, 2026 · 9:42 AM" },
  observations: [
    { text: "Elevated UV exposure may increase post-inflammatory hyperpigmentation risk.", detail: "UV Index above 5 correlates with slower lesion healing.", citation: "AAD UV Guidelines, 2019" },
    { text: "Humidity above 60% may increase sebum production in oily zones.", detail: "Consider lightweight, non-comedogenic moisturizer.", citation: "Br J Dermatol, 2017" },
  ],
};

const lesionMeta = [
  { key: "comedone", abbr: "C", label: "Comedone", color: "#CBD5E1" },
  { key: "papule", abbr: "Pa", label: "Papule", color: "#FBBF24" },
  { key: "pustule", abbr: "Pu", label: "Pustule", color: "#F97316" },
  { key: "nodule", abbr: "N", label: "Nodule", color: "#F43F5E" },
];

const severityStyles: Record<string, string> = {
  clear: "badge-clear",
  mild: "badge-mild",
  moderate: "badge-moderate",
  severe: "badge-severe",
};

export default function ResultsPage() {
  const [showAnnotations, setShowAnnotations] = useState(true);
  const [showFusionDetail, setShowFusionDetail] = useState(false);
  const r = mockResult;

  return (
    <div className="max-w-container mx-auto">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2 text-xs-body text-slate-400">
          <Link href="/history" className="hover:text-white transition-colors">History</Link>
          <span>/</span>
          <span className="text-white">{r.date}</span>
        </div>
        <div className="flex gap-2">
          <button className="p-2 text-slate-400 hover:text-white transition-colors" aria-label="Share">
            <Share2 size={16} />
          </button>
          <button className="p-2 text-slate-400 hover:text-white transition-colors" aria-label="Download">
            <Download size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT: Image + Annotations */}
        <div className="space-y-4">
          {/* Annotated image */}
          <div className="relative rounded-xl overflow-hidden border border-white/[0.06] bg-surface-2 animate-scale-in">
            <svg viewBox="0 0 640 480" className="w-full" fill="none">
              <rect width="640" height="480" fill="#13151F" />
              <ellipse cx="320" cy="220" rx="140" ry="170" stroke="#1E293B" strokeWidth="1" fill="#0F1117" />
              {showAnnotations && (
                <>
                  {/* Comedone boxes */}
                  <rect x="250" y="130" width="35" height="35" rx="4" stroke="#CBD5E1" strokeWidth="2" />
                  <rect x="350" y="140" width="30" height="30" rx="4" stroke="#CBD5E1" strokeWidth="2" />
                  <rect x="280" y="100" width="25" height="25" rx="4" stroke="#CBD5E1" strokeWidth="2" />
                  <rect x="370" y="110" width="28" height="28" rx="4" stroke="#CBD5E1" strokeWidth="2" />
                  {/* Papule boxes */}
                  <rect x="290" y="210" width="40" height="35" rx="4" stroke="#FBBF24" strokeWidth="2" />
                  <rect x="340" y="230" width="32" height="30" rx="4" stroke="#FBBF24" strokeWidth="2" />
                  <rect x="260" y="260" width="30" height="28" rx="4" stroke="#FBBF24" strokeWidth="2" />
                  {/* Pustule boxes */}
                  <rect x="310" y="280" width="38" height="35" rx="4" stroke="#F97316" strokeWidth="2" />
                  <rect x="355" y="190" width="28" height="28" rx="4" stroke="#F97316" strokeWidth="2" strokeDasharray="6 3" />
                  <text x="387" y="195" fill="#F97316" fontSize="12" fontWeight="bold">?</text>
                </>
              )}
            </svg>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-3 flex-wrap">
            {lesionMeta.map((l) => (
              <div key={l.key} className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: l.color }} />
                <span className="text-micro font-mono text-slate-400" title={l.label}>
                  {l.abbr} {r.lesions[l.key as keyof typeof r.lesions]}
                </span>
              </div>
            ))}
          </div>

          {/* Annotations toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAnnotations(!showAnnotations)}
              className={`relative w-9 h-5 rounded-full transition-colors ${
                showAnnotations ? "bg-accent" : "bg-white/10"
              }`}
              role="switch"
              aria-checked={showAnnotations}
              aria-label="Show annotations"
            >
              <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                showAnnotations ? "left-[18px]" : "left-0.5"
              }`} />
            </button>
            <span className="text-xs-body text-slate-400">Show annotations</span>
          </div>

          {/* Severity badge */}
          <div className="flex justify-center">
            <span className={`${severityStyles[r.severity]} text-sm font-mono uppercase px-4 py-2 rounded-lg`}>
              {r.severity}
            </span>
          </div>

          {/* Disclaimer */}
          <div className="card-surface-2 p-4">
            <p className="text-micro italic text-slate-400">
              This severity grading is a wellness estimate based on detected lesions — not a clinical assessment.
            </p>
          </div>
        </div>

        {/* RIGHT: Insight Cards */}
        <div className="space-y-4">
          {/* Skin Profile */}
          <div className="card-surface-1 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-card-header font-display text-white">Skin Profile</h3>
              <button className="text-slate-400 hover:text-white transition-colors" aria-label="Edit">
                <Pencil size={14} />
              </button>
            </div>
            <p className="font-display text-section text-white mb-3">{r.skinType.type}</p>
            <div className="mb-2">
              <div className="w-full h-1 bg-white/[0.06] rounded-full overflow-hidden">
                <div className="h-full bg-accent rounded-full transition-all duration-700" style={{ width: `${r.skinType.confidence}%` }} />
              </div>
              <p className="text-micro font-mono text-slate-500 mt-1">{r.skinType.confidence}% confidence</p>
            </div>
            <button
              onClick={() => setShowFusionDetail(!showFusionDetail)}
              className="flex items-center gap-1 text-micro text-slate-400 hover:text-white transition-colors"
            >
              How we estimated this
              <ChevronDown size={12} className={`transition-transform ${showFusionDetail ? "rotate-180" : ""}`} />
            </button>
            {showFusionDetail && (
              <div className="mt-3 space-y-2 animate-fade-in">
                <div className="flex items-center justify-between text-xs-body">
                  <span className="text-slate-400">Image signal: Balanced</span>
                  <span className="font-mono text-slate-500">{r.skinType.imageScore}</span>
                </div>
                <div className="w-full h-1 bg-white/[0.06] rounded-full"><div className="h-full bg-accent/60 rounded-full" style={{ width: `${r.skinType.imageScore * 100}%` }} /></div>
                <div className="flex items-center justify-between text-xs-body">
                  <span className="text-slate-400">Questionnaire signal: Balanced</span>
                  <span className="font-mono text-slate-500">{r.skinType.questionnaireScore}</span>
                </div>
                <div className="w-full h-1 bg-white/[0.06] rounded-full"><div className="h-full bg-accent/60 rounded-full" style={{ width: `${r.skinType.questionnaireScore * 100}%` }} /></div>
              </div>
            )}
            <p className="text-micro font-mono text-slate-500 mt-3">Fusion · Image + Questionnaire</p>
          </div>

          {/* Environmental Snapshot */}
          <div className="card-surface-1 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-card-header font-display text-white">Conditions at capture</h3>
              <span className="text-micro text-slate-500">{r.env.datetime}</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: "🌡", value: r.env.temp, label: "Temperature" },
                { icon: "💧", value: r.env.humidity, label: "Humidity" },
                { icon: "☀", value: r.env.uv, label: "UV Index", warn: true },
                { icon: "🌫", value: r.env.pm25, label: "PM2.5" },
              ].map((m) => (
                <div key={m.label} className="card-surface-2 p-4 text-center">
                  <div className="text-lg mb-1">{m.icon}</div>
                  <div className={`font-display text-card-header ${m.warn ? "text-amber-400" : "text-white"}`}>{m.value}</div>
                  <div className="text-micro text-slate-400">{m.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Insights */}
          <div className="card-surface-1 p-6">
            <h3 className="text-card-header font-display text-white mb-4">Insights</h3>
            <div className="space-y-4">
              {r.observations.map((obs, i) => (
                <div key={i} className="flex gap-3 border-l-2 border-accent pl-4">
                  <div>
                    <p className="text-sm text-white">{obs.text}</p>
                    <p className="text-xs-body text-slate-400 mt-1">{obs.detail}</p>
                    <span className="text-[10px] font-mono text-slate-500 mt-1 inline-block">[{obs.citation}]</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Ingredients */}
          <div className="card-surface-1 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-card-header font-display text-white">Active ingredients</h3>
              <Link href="/ingredients" className="text-micro text-accent hover:underline">Manage ›</Link>
            </div>
            <div className="flex flex-wrap gap-2">
              {["Niacinamide", "Retinol", "Salicylic Acid"].map((name) => (
                <span key={name} className="bg-surface-2 text-xs-body text-slate-300 px-3 py-1.5 rounded-lg">
                  {name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
