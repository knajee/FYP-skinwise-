"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { X, Camera, Cloud, Scan, Activity, AlertTriangle } from "lucide-react";
import { useAuthStore, useCheckinStore, useDashboardStore } from "@/store";
import { uploadCheckin } from "@/lib/api";
import { ROUTES } from "@/lib/routes";
import ImageUploader from "@/components/checkin/ImageUploader";

const processingMessages = [
  { text: "Extracting skin details from your photo...", icon: Camera },
  { text: "Fetching environmental conditions...", icon: Cloud },
  { text: "Analysing lesion types...", icon: Scan },
  { text: "Calculating your skin profile...", icon: Activity },
];

type CheckinStage = "upload" | "banner" | "processing" | "complete" | "error";

export default function CheckinPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const totalCheckins = useDashboardStore((s) => s.checkins.length);
  
  const { 
    setUploadStatus, 
    setResult, 
    activeCheckin
  } = useCheckinStore();

  const {
    exifCapturedAt, 
    exifLat, 
    exifLng, 
    geolocationLat, 
    geolocationLng, 
    questionnaireVector 
  } = activeCheckin;

  const [stage, setStage] = useState<CheckinStage>("upload");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [processingMsgIdx, setProcessingMsgIdx] = useState(0);

  // Auto-advance processing messages
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (stage === "processing") {
      interval = setInterval(() => {
        setProcessingMsgIdx((prev) => Math.min(prev + 1, processingMessages.length - 1));
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [stage]);

  const handleConfirmFile = (file: File) => {
    setSelectedFile(file);
    if (!user?.hasCompletedQuestionnaire) {
      setStage("banner");
    } else {
      startProcessing(file);
    }
  };

  const startProcessing = async (file: File) => {
    setStage("processing");
    setProcessingMsgIdx(0);
    setUploadStatus("uploading");

    try {
      const captured_at = exifCapturedAt || new Date().toISOString();
      const lat = exifLat !== null ? exifLat : geolocationLat;
      const lng = exifLng !== null ? exifLng : geolocationLng;

      const metadata = {
        captured_at,
        lat,
        lng,
        questionnaireVector,
      };

      const formData = new FormData();
      formData.append("image", file); // Fixed key to match FastAPI File(...)
      formData.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));

      const result = await uploadCheckin(formData);
      
      setResult(result);
      setUploadStatus("complete");
      setStage("complete");
      
      // Redirect to result immediately
      router.push(ROUTES.RESULTS(result.checkin_id));
    } catch (error: unknown) {
      const err = error as { status?: number; message?: string };
      setUploadStatus("error", err.message || "Unknown error");
      
      let msg = err.message || "An unexpected error occurred.";
      if (err.status === 413 && !err.message) msg = "The image file is too large. Please upload a smaller image.";
      else if (err.status && err.status >= 500 && !err.message) msg = "Our analysis servers are busy — please try again in a moment.";

      setErrorMessage(msg);
      setStage("error");
    }
  };

  return (
    <div className="flex flex-col animate-in fade-in duration-300 w-full">
      {/* Minimal Header */}
      <header className="h-16 px-4 md:px-6 flex items-center justify-between shrink-0">
        <Link href={ROUTES.DASHBOARD} className="font-display text-2xl text-text-primary tracking-tight">
          Skin<span className="text-accent">WISE</span>
        </Link>
        <button 
          onClick={() => router.push(ROUTES.DASHBOARD)}
          className="p-2 text-text-tertiary hover:text-text-primary hover:bg-bg-subtle rounded-full transition-colors"
          aria-label="Cancel check-in"
        >
          <X size={24} />
        </button>
      </header>

      <main className="flex-1 flex flex-col items-center max-w-3xl mx-auto w-full px-4 py-8">
        
        {/* STAGE: UPLOAD */}
        {stage === "upload" && (
          <div className="w-full flex flex-col items-center animate-fade-in space-y-6">
            <div className="text-center mb-4">
              <h1 className="font-display text-3xl text-text-primary mb-2">New Check-In</h1>
              {user?.hasCompletedQuestionnaire && totalCheckins > 0 ? (
                <p className="text-sm font-medium text-accent">Welcome back. Check-in #{totalCheckins + 1}</p>
              ) : (
                <p className="text-sm text-text-tertiary">Take or upload a clear photo of your skin.</p>
              )}
            </div>
            
            <div className="w-full max-w-xl">
              <ImageUploader onConfirm={handleConfirmFile} />
            </div>
          </div>
        )}

        {/* STAGE: BANNER (Questionnaire incomplete) */}
        {stage === "banner" && (
          <div className="w-full max-w-md mx-auto flex flex-col items-center justify-center text-center animate-fade-in mt-12">
            <div className="glass-panel p-8 flex flex-col items-center w-full">
              <div className="w-16 h-16 rounded-full bg-severity-moderate/10 flex items-center justify-center mb-6">
                <AlertTriangle size={32} className="text-severity-moderate" />
              </div>
              <h2 className="font-display text-2xl text-text-primary mb-4">Complete your profile</h2>
              <p className="text-sm text-text-tertiary mb-8">
                For best results, complete your Skin Profile first. The fusion AI uses this to give you more accurate insights.
              </p>
              
              <div className="w-full flex flex-col gap-3">
                <button 
                  onClick={() => router.push(ROUTES.QUESTIONNAIRE)}
                  className="w-full h-12 rounded-full bg-severity-moderate text-text-primary font-medium hover:bg-severity-moderate/90 transition-colors shadow-sm"
                >
                  Complete Profile Now →
                </button>
                <button 
                  onClick={() => startProcessing(selectedFile!)}
                  className="w-full h-12 rounded-full border border-border-default bg-transparent text-text-primary font-medium hover:bg-bg-subtle transition-colors"
                >
                  Skip and continue
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STAGE: PROCESSING */}
        {stage === "processing" && (
          <div className="flex-1 flex flex-col items-center justify-center animate-fade-in">
            {/* Custom Circular Progress Ring */}
            <div className="relative w-48 h-48 mb-8">
              <svg className="w-full h-full -rotate-90 animate-spin-slow" viewBox="0 0 100 100">
                <circle 
                  cx="50" cy="50" r="46" 
                  fill="transparent" 
                  stroke="var(--skin-warm)" 
                  strokeWidth="4" 
                />
                <circle 
                  cx="50" cy="50" r="46" 
                  fill="transparent" 
                  stroke="var(--skin-sage)" 
                  strokeWidth="4" 
                  strokeDasharray="289" 
                  strokeDashoffset="100" 
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-accent">
                {(() => {
                  const Icon = processingMessages[processingMsgIdx].icon;
                  return <Icon size={40} className="animate-pulse" />;
                })()}
              </div>
            </div>

            <div className="h-16 flex items-center justify-center">
              <p className="font-display text-xl text-text-primary text-center animate-fade-in transition-all" key={processingMsgIdx}>
                {processingMessages[processingMsgIdx].text}
              </p>
            </div>
            
            <p className="mt-4 text-sm text-text-tertiary italic opacity-80">
              This usually takes 5–8 seconds
            </p>
          </div>
        )}

        {/* STAGE: ERROR */}
        {stage === "error" && (
          <div className="flex-1 flex flex-col items-center justify-center animate-fade-in w-full max-w-md">
            <div className="glass-panel p-8 flex flex-col items-center text-center w-full">
              <div className="w-16 h-16 rounded-full bg-severity-severe/10 flex items-center justify-center mb-6">
                <AlertTriangle size={32} className="text-severity-severe" />
              </div>
              <h2 className="font-display text-2xl text-text-primary mb-4">Upload Failed</h2>
              <p className="text-sm text-text-tertiary mb-8">{errorMessage}</p>
              
              <div className="w-full flex flex-col gap-3">
                <button 
                  onClick={() => setStage("upload")}
                  className="w-full h-12 rounded-full bg-brand text-text-inverse font-medium hover:bg-brand/90 transition-colors shadow-sm"
                >
                  Try Again
                </button>
                <button 
                  onClick={() => router.push(ROUTES.DASHBOARD)}
                  className="w-full h-12 rounded-full bg-transparent text-text-tertiary font-medium hover:bg-bg-subtle hover:text-text-primary transition-colors"
                >
                  Go to Dashboard
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
