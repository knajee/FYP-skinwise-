"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import {
  Camera,
  Upload,
  Check,
  AlertTriangle,
  X,
  ArrowRight,
  Loader2,
  MapPin,
} from "lucide-react";
import type { GateStatus } from "@/types";

interface Gate {
  id: string;
  label: string;
  status: GateStatus;
  detail?: string;
}

export default function CheckInPage() {
  const [preview, setPreview] = useState<string | null>(null);
  const [gates, setGates] = useState<Gate[]>([]);
  const [gatesComplete, setGatesComplete] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const f = acceptedFiles[0];
    if (!f) return;
    setPreview(URL.createObjectURL(f));
    runQualityGates();
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpeg", ".jpg", ".png", ".webp"] },
    maxSize: 15 * 1024 * 1024,
    multiple: false,
  });

  function runQualityGates() {
    const initial: Gate[] = [
      { id: "face", label: "Face detected", status: "checking" },
      { id: "resolution", label: "Resolution check", status: "pending" },
      { id: "clarity", label: "Image clarity", status: "pending" },
      { id: "lighting", label: "Lighting check", status: "pending" },
    ];
    setGates(initial);

    // Simulate sequential gate checks
    const results: Gate[] = [
      { id: "face", label: "Face detected", status: "passed" },
      { id: "resolution", label: "Resolution: 1280×960", status: "passed" },
      { id: "clarity", label: "Image clarity", status: "warning", detail: "Slightly blurry — results may vary" },
      { id: "lighting", label: "Lighting", status: "passed" },
    ];

    results.forEach((gate, i) => {
      setTimeout(() => {
        setGates((prev) => prev.map((g) =>
          g.id === gate.id ? gate : g.id === results[i + 1]?.id ? { ...g, status: "checking" } : g
        ));
        if (i === results.length - 1) {
          setTimeout(() => setGatesComplete(true), 300);
        }
      }, 600 + i * 400);
    });
  }

  function handleAnalyze() {
    setAnalyzing(true);
    // Simulate inference delay then redirect
    setTimeout(() => {
      window.location.href = "/results/demo";
    }, 3000);
  }

  const GateIcon = ({ status }: { status: GateStatus }) => {
    switch (status) {
      case "checking":
        return <Loader2 size={14} className="text-accent animate-spin" />;
      case "passed":
        return <Check size={14} className="text-emerald-400" />;
      case "warning":
        return <AlertTriangle size={14} className="text-amber-400" />;
      case "failed":
        return <X size={14} className="text-rose-400" />;
      default:
        return <div className="w-3.5 h-3.5 rounded-full bg-white/10" />;
    }
  };

  return (
    <div className="max-w-container mx-auto">
      <div className="mb-6">
        <h1 className="font-display text-section text-white">New Check-In</h1>
        <p className="text-xs-body text-slate-400 mt-1">
          Upload a clear photo of your skin for analysis
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Upload zone */}
        <div className="space-y-4">
          {!preview ? (
            <div
              {...getRootProps()}
              className={`h-[480px] rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all duration-200 ${
                isDragActive
                  ? "border-accent bg-accent/[0.05] scale-[1.01]"
                  : "border-accent/30 bg-accent/[0.02] hover:border-accent/50"
              }`}
            >
              <input {...getInputProps()} />
              <Camera className="w-12 h-12 text-accent mb-4" strokeWidth={1.5} />
              <p className="font-display text-xl text-white mb-2">
                Drop your photo here
              </p>
              <p className="text-sm text-slate-400 mb-4">or click to select</p>

              {/* Mobile buttons */}
              <div className="flex gap-3 sm:hidden">
                <button className="bg-accent text-black text-sm font-medium h-11 px-5 rounded-lg flex items-center gap-2">
                  <Camera size={16} />
                  Take Photo
                </button>
                <button className="border border-white/10 text-white text-sm h-11 px-5 rounded-lg flex items-center gap-2">
                  <Upload size={16} />
                  Upload
                </button>
              </div>

              <p className="text-micro font-mono text-slate-500 mt-4">
                JPEG · PNG · WEBP · max 15MB
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Image preview */}
              <div className="relative rounded-xl overflow-hidden border border-white/[0.06]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={preview}
                  alt="Uploaded skin photo"
                  className="w-full h-auto max-h-[400px] object-cover"
                />
              </div>
              <p className="text-micro font-mono text-slate-400">
                Captured {new Date().toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })} · {new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
              </p>

              {/* Quality gates */}
              <div className="space-y-2">
                {gates.map((gate) => (
                  <div
                    key={gate.id}
                    className="flex items-center gap-3 py-2 animate-fade-in"
                  >
                    <GateIcon status={gate.status} />
                    <span className={`text-xs-body ${
                      gate.status === "passed" ? "text-white" :
                      gate.status === "warning" ? "text-amber-400" :
                      gate.status === "failed" ? "text-rose-400" : "text-slate-400"
                    }`}>
                      {gate.label}
                    </span>
                    {gate.detail && (
                      <span className="text-micro text-slate-500">
                        — {gate.detail}
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {/* EXIF location */}
              <div className="card-surface-2 p-3 flex items-center gap-2">
                <MapPin size={14} className="text-slate-500" />
                <span className="text-micro text-slate-400">
                  Location detected · Rawalpindi, PK · Rounded to city level for privacy
                </span>
              </div>

              {/* Environmental preview */}
              {gatesComplete && (
                <div className="grid grid-cols-4 gap-2 animate-fade-in-up">
                  {[
                    { icon: "🌡", value: "32°C" },
                    { icon: "💧", value: "68%" },
                    { icon: "☀", value: "UV 5.2" },
                    { icon: "🌫", value: "42µg" },
                  ].map((m) => (
                    <div key={m.icon} className="card-surface-2 py-2 px-3 text-center">
                      <div className="text-sm mb-0.5">{m.icon}</div>
                      <div className="text-micro font-mono text-white">{m.value}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Analyze button */}
              {gatesComplete && (
                <button
                  onClick={handleAnalyze}
                  disabled={analyzing}
                  className="w-full bg-accent text-black font-medium text-sm h-[52px] rounded-xl hover:bg-accent-hover transition-colors duration-150 flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {analyzing ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      Analyze Skin
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              )}
              {analyzing && (
                <p className="text-sm text-slate-400 text-center animate-fade-in">
                  Usually 4–6 seconds
                </p>
              )}
            </div>
          )}
        </div>

        {/* Right: Instructions */}
        <div className="card-surface-1 p-6 h-fit">
          <h3 className="text-card-header font-display text-white mb-4">
            Checklist for best results
          </h3>
          <div className="space-y-4">
            {[
              { text: "Use natural, even lighting", detail: "Avoid direct flash or harsh shadows" },
              { text: "Hold phone 30cm from face", detail: "Arms-length distance works well" },
              { text: "Clean, bare skin", detail: "Remove makeup and skincare products" },
              { text: "No filters or edits", detail: "Raw camera output gives best results" },
            ].map((item) => (
              <div key={item.text} className="flex gap-3">
                <Check size={16} className="text-accent mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-body text-white">{item.text}</p>
                  <p className="text-xs-body text-slate-500">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
