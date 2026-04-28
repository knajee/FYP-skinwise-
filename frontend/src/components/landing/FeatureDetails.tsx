"use client";
import { useEffect, useRef, useState } from "react";

/* ─── Mock detection visual (SVG) ─── */
function DetectionVisual() {
  return (
    <div className="relative w-full aspect-[4/3] bg-surface-2 rounded-xl overflow-hidden border border-white/[0.06]">
      {/* Simulated face silhouette */}
      <svg viewBox="0 0 400 300" className="w-full h-full" fill="none">
        <rect width="400" height="300" fill="#13151F" />
        {/* Face oval */}
        <ellipse cx="200" cy="140" rx="90" ry="110" stroke="#1E293B" strokeWidth="1" fill="#0F1117" />
        {/* Detection boxes */}
        <rect x="155" y="90" width="28" height="28" rx="4" stroke="#CBD5E1" strokeWidth="1.5" strokeDasharray="0" opacity="0.8" />
        <rect x="215" y="95" width="22" height="22" rx="4" stroke="#CBD5E1" strokeWidth="1.5" opacity="0.8" />
        <rect x="180" y="140" width="32" height="26" rx="4" stroke="#FBBF24" strokeWidth="1.5" opacity="0.9" />
        <rect x="170" y="180" width="24" height="24" rx="4" stroke="#FBBF24" strokeWidth="1.5" opacity="0.9" />
        <rect x="225" y="155" width="20" height="20" rx="4" stroke="#F97316" strokeWidth="1.5" opacity="0.9" />
        {/* Confidence labels */}
        <text x="157" y="86" className="font-mono" fill="#CBD5E1" fontSize="8" opacity="0.7">C 0.91</text>
        <text x="217" y="91" className="font-mono" fill="#CBD5E1" fontSize="8" opacity="0.7">C 0.87</text>
        <text x="182" y="136" className="font-mono" fill="#FBBF24" fontSize="8" opacity="0.7">Pa 0.82</text>
        <text x="227" y="151" className="font-mono" fill="#F97316" fontSize="8" opacity="0.7">Pu 0.78</text>
      </svg>
      {/* Count overlay */}
      <div className="absolute bottom-3 left-3 flex gap-2">
        <span className="text-micro font-mono px-2 py-1 rounded bg-black/60 text-lesion-comedone">C 4</span>
        <span className="text-micro font-mono px-2 py-1 rounded bg-black/60 text-lesion-papule">Pa 2</span>
        <span className="text-micro font-mono px-2 py-1 rounded bg-black/60 text-lesion-pustule">Pu 1</span>
      </div>
    </div>
  );
}

/* ─── Skin type fusion visual ─── */
function FusionVisual() {
  return (
    <div className="w-full aspect-[4/3] bg-surface-2 rounded-xl overflow-hidden border border-white/[0.06] p-6 flex flex-col justify-center">
      <div className="flex items-center justify-between gap-3">
        {/* Questionnaire signal */}
        <div className="flex-1 card-surface-1 p-4 text-center">
          <div className="text-micro font-mono text-slate-500 mb-2">QUESTIONNAIRE</div>
          <div className="text-card-header font-display text-white">78%</div>
          <div className="text-micro text-slate-400">Balanced</div>
        </div>
        {/* Arrow */}
        <div className="flex flex-col items-center gap-1">
          <div className="w-8 h-px bg-accent/40" />
          <div className="text-micro font-mono text-accent">FUSION</div>
          <div className="w-8 h-px bg-accent/40" />
        </div>
        {/* Image signal */}
        <div className="flex-1 card-surface-1 p-4 text-center">
          <div className="text-micro font-mono text-slate-500 mb-2">IMAGE AI</div>
          <div className="text-card-header font-display text-white">61%</div>
          <div className="text-micro text-slate-400">Balanced</div>
        </div>
      </div>
      {/* Result */}
      <div className="mt-4 text-center">
        <div className="inline-flex items-center gap-2 badge-skin-type px-4 py-2 rounded-lg text-sm font-medium">
          <span className="w-2 h-2 rounded-full bg-teal-400" />
          Balanced · 72% confidence
        </div>
      </div>
    </div>
  );
}

/* ─── Environmental chart visual ─── */
function EnvironmentalVisual() {
  return (
    <div className="w-full aspect-[4/3] bg-surface-2 rounded-xl overflow-hidden border border-white/[0.06] p-6 flex flex-col justify-center">
      {/* Mini metric cards */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {[
          { icon: "🌡", value: "32°C", label: "Temperature" },
          { icon: "💧", value: "68%", label: "Humidity" },
          { icon: "☀", value: "UV 5.2", label: "UV Index", warn: true },
          { icon: "🌫", value: "42µg", label: "PM2.5" },
        ].map((m) => (
          <div key={m.label} className="card-surface-1 p-3 text-center">
            <div className="text-sm mb-1">{m.icon}</div>
            <div className={`text-emphasis font-display ${m.warn ? "text-amber-400" : "text-white"}`}>{m.value}</div>
            <div className="text-micro text-slate-500">{m.label}</div>
          </div>
        ))}
      </div>
      {/* Mini trend lines */}
      <svg viewBox="0 0 200 40" className="w-full h-8" fill="none">
        <polyline points="0,30 30,25 60,28 90,15 120,18 150,10 180,20 200,12" stroke="#2DD4BF" strokeWidth="1.5" opacity="0.6" />
        <polyline points="0,35 30,32 60,30 90,28 120,25 150,22 180,20 200,18" stroke="#F59E0B" strokeWidth="1.5" opacity="0.4" />
      </svg>
    </div>
  );
}

/* ─── Animated counter hook ─── */
function useCountUp(target: number, duration = 1200) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStarted(true); },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    let start = 0;
    const step = target / (duration / 16);
    const interval = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(interval); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(interval);
  }, [started, target, duration]);

  return { count, ref };
}

/* ─── Feature sections ─── */
const sections = [
  {
    id: "detection",
    badge: "LESION DETECTION",
    title: "Every lesion, classified and counted.",
    description:
      "Our YOLOv8-based model identifies and classifies skin lesions into clinical subtypes — comedones, papules, pustules, and nodules — with bounding box precision and confidence scoring.",
    Visual: DetectionVisual,
    counters: [
      { value: 4, label: "Comedones" },
      { value: 2, label: "Papules" },
      { value: 1, label: "Pustule" },
    ],
  },
  {
    id: "fusion",
    badge: "SKIN TYPE FUSION",
    title: "Two signals. One accurate estimate.",
    description:
      "We combine image-based analysis with a clinically-informed questionnaire to produce a fused skin type estimate — more accurate than either signal alone.",
    Visual: FusionVisual,
    counters: null,
  },
  {
    id: "environmental",
    badge: "ENVIRONMENTAL CONTEXT",
    title: "Your skin doesn't exist in a vacuum.",
    description:
      "Every check-in captures UV index, humidity, temperature, and air quality at the moment of capture — building a correlation map between your environment and skin condition.",
    Visual: EnvironmentalVisual,
    counters: null,
  },
];

function CounterRow({ counters }: { counters: { value: number; label: string }[] }) {
  return (
    <div className="flex gap-4 mt-6">
      {counters.map((c) => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const { count, ref } = useCountUp(c.value);
        return (
          <div key={c.label} ref={ref} className="flex items-baseline gap-1.5">
            <span className="text-section font-display text-accent">{count}</span>
            <span className="text-xs-body text-slate-400">{c.label}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function FeatureDetails() {
  return (
    <section id="how-it-works" className="py-24 lg:py-32">
      <div className="max-w-container mx-auto px-6 space-y-24 lg:space-y-32">
        {sections.map((s, i) => {
          const reversed = i % 2 === 1;
          return (
            <div
              key={s.id}
              className={`flex flex-col ${
                reversed ? "lg:flex-row-reverse" : "lg:flex-row"
              } items-center gap-12 lg:gap-16`}
            >
              {/* Visual */}
              <div className="w-full lg:w-1/2">
                <s.Visual />
              </div>
              {/* Text */}
              <div className="w-full lg:w-1/2">
                <div className="text-micro font-mono text-accent uppercase tracking-wider mb-3">
                  {s.badge}
                </div>
                <h2 className="font-display text-section text-white mb-4 text-balance">
                  {s.title}
                </h2>
                <p className="text-body text-slate-400 leading-relaxed">
                  {s.description}
                </p>
                {s.counters && <CounterRow counters={s.counters} />}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
