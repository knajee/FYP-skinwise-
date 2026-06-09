"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import { 
  Camera, Sun, ScanFace, Hand, Loader2, 
  CheckCircle2, XCircle, AlertTriangle, MapPin 
} from "lucide-react";

import { useCheckinStore } from "@/store";
import { checkResolution, checkLuminance, computeLaplacianVariance } from "@/lib/imageQuality";
import { extractExifData } from "@/lib/exifExtractor";
import { detectFace } from "@/lib/faceDetection";
import { requestGeolocation } from "@/lib/geolocation";
import { cn } from "@/lib/utils";

type UIState = 'IDLE' | 'VALIDATING' | 'PREVIEW' | 'ERROR';
type GateState = 'pending' | 'running' | 'pass' | 'fail' | 'warn';

interface ImageUploaderProps {
  onConfirm: (file: File) => void;
}

export default function ImageUploader({ onConfirm }: ImageUploaderProps) {
  const [uiState, setUiState] = useState<UIState>('IDLE');
  const [globalError, setGlobalError] = useState<string | null>(null);
  
  // Local state for gates during validation
  const [gateStates, setGateStates] = useState<{
    resolution: GateState;
    face: GateState;
    blur: GateState;
    luminance: GateState;
  }>({
    face: 'pending',
    resolution: 'pending',
    blur: 'pending',
    luminance: 'pending'
  });
  
  const [warningMessages, setWarningMessages] = useState<string[]>([]);
  const [tempFile, setTempFile] = useState<File | null>(null);
  const [tempPreviewUrl, setTempPreviewUrl] = useState<string | null>(null);

  // Store actions
  const setImageFile = useCheckinStore(s => s.setImageFile);
  const setExifData = useCheckinStore(s => s.setExifData);
  const setGeolocation = useCheckinStore(s => s.setGeolocation);
  const setQualityGate = useCheckinStore(s => s.setQualityGate);
  const activeCheckin = useCheckinStore(s => s.activeCheckin);

  const resetState = () => {
    setUiState('IDLE');
    setGlobalError(null);
    setWarningMessages([]);
    setGateStates({ face: 'pending', resolution: 'pending', blur: 'pending', luminance: 'pending' });
    setTempFile(null);
    if (tempPreviewUrl) URL.revokeObjectURL(tempPreviewUrl);
    setTempPreviewUrl(null);
  };

  const runGates = async (file: File) => {
    setUiState('VALIDATING');
    setGateStates(s => ({ ...s, face: 'running' }));
    
    // 1. Face Detection (Blocking)
    const hasFace = await detectFace(file);
    if (!hasFace) {
      setGateStates(s => ({ ...s, face: 'fail' }));
      setGlobalError("No face detected. Please ensure your face is clearly visible.");
      setUiState('ERROR');
      return;
    }
    setGateStates(s => ({ ...s, face: 'pass' }));
    setQualityGate('faceDetected', true);

    // 2. Resolution Check (Blocking)
    setGateStates(s => ({ ...s, resolution: 'running' }));
    const resResult = await checkResolution(file);
    if (!resResult.passed) {
      setGateStates(s => ({ ...s, resolution: 'fail' }));
      setGlobalError(`Image is too small (${resResult.width}x${resResult.height}). Minimum is 200x200.`);
      setUiState('ERROR');
      return;
    }
    setGateStates(s => ({ ...s, resolution: 'pass' }));
    setQualityGate('resolutionPassed', true);

    // 3. Blur & Luminance (Concurrent, Non-blocking warnings)
    setGateStates(s => ({ ...s, blur: 'running', luminance: 'running' }));
    const [blurVar, lumResult] = await Promise.all([
      computeLaplacianVariance(file),
      checkLuminance(file)
    ]);

    const isBlurry = blurVar < 100;
    setGateStates(s => ({ ...s, blur: isBlurry ? 'warn' : 'pass' }));
    setQualityGate('blurWarning', isBlurry);
    if (isBlurry) setWarningMessages(prev => [...prev, "Image is slightly blurry."]);

    setGateStates(s => ({ ...s, luminance: lumResult.passed ? 'pass' : 'warn' }));
    setQualityGate('luminanceWarning', !lumResult.passed);
    if (!lumResult.passed && lumResult.warning) {
      setWarningMessages(prev => [...prev, lumResult.warning!]);
    }

    // 4. Success — EXIF Extraction & Store Update
    const exifData = await extractExifData(file);
    setExifData(exifData);
    
    const previewUrl = URL.createObjectURL(file);
    setTempFile(file);
    setTempPreviewUrl(previewUrl);
    setImageFile(file, previewUrl);

    setUiState('PREVIEW');
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    const file = acceptedFiles[0];
    await runGates(file);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/jpeg': [], 'image/png': [], 'image/webp': [] },
    maxSize: 15728640, // 15MB
    multiple: false
  });

  const handleConfirm = async () => {
    if (!tempFile) return;

    // Check for EXIF GPS, if missing, request device location
    if (activeCheckin.exifLat === null || activeCheckin.exifLng === null) {
      const loc = await requestGeolocation();
      if (loc) {
        setGeolocation(loc.lat, loc.lng);
      }
    }
    
    onConfirm(tempFile);
  };

  /* ─── UI Renderers ─── */

  if (uiState === 'VALIDATING' || uiState === 'ERROR') {
    return (
      <div className="w-full glass-panel p-6 md:p-8 animate-fade-in text-center">
        <h3 className="font-display text-lg text-text-primary mb-6">
          Analysing Image Quality
        </h3>
        <div className="max-w-xs mx-auto space-y-4 text-left">
          <GateRow label="Face Detection" state={gateStates.face} />
          <GateRow label="Resolution Check" state={gateStates.resolution} />
          <GateRow label="Blur Analysis" state={gateStates.blur} />
          <GateRow label="Luminance Check" state={gateStates.luminance} />
        </div>

        {uiState === 'ERROR' && (
          <div className="mt-8 animate-fade-in-up">
            <div className="mb-4 p-3 rounded-xl bg-severity-severe/10 border border-severity-severe/20 text-sm text-severity-severe text-center">
              {globalError}
            </div>
            <button
              onClick={resetState}
              className="px-6 h-10 border border-border-default rounded-full text-sm font-medium hover:bg-bg-subtle transition-colors"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    );
  }

  if (uiState === 'PREVIEW' && tempPreviewUrl) {
    const hasLocation = activeCheckin.exifLat !== null || activeCheckin.geolocationLat !== null;
    const dateStr = activeCheckin.exifCapturedAt 
      ? new Date(activeCheckin.exifCapturedAt).toLocaleString(undefined, { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
      : "Current time";

    return (
      <div className="w-full animate-fade-in">
        <div className="relative max-w-[400px] mx-auto aspect-square rounded-card overflow-hidden bg-bg-subtle shadow-card">
          <Image src={tempPreviewUrl} alt="Preview" fill className="object-cover" />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
        </div>

        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {gateStates.face === 'pass' && <Badge icon={<ScanFace size={14} />} text="Face Detected" />}
          {gateStates.blur === 'warn' && <Badge icon={<AlertTriangle size={14} />} text="Blur Warning" warn />}
          {gateStates.luminance === 'warn' && <Badge icon={<AlertTriangle size={14} />} text="Luminance Warning" warn />}
        </div>

        <div className="max-w-[400px] mx-auto mt-6 glass-panel p-4 space-y-3 text-sm">
          <div className="flex items-center gap-3 text-text-tertiary">
            <Sun size={16} />
            <span>Captured {dateStr}</span>
          </div>
          <div className="flex items-center gap-3 text-text-tertiary">
            <MapPin size={16} />
            <span>{hasLocation ? "Location detected" : "No location in photo — will attempt device location"}</span>
          </div>
        </div>

        {warningMessages.length > 0 && (
          <div className="max-w-[400px] mx-auto mt-4 p-3 rounded-xl bg-severity-moderate/10 border border-severity-moderate/20 text-sm text-severity-moderate">
            <ul className="list-disc list-inside">
              {warningMessages.map((msg, i) => <li key={i}>{msg}</li>)}
            </ul>
          </div>
        )}

        <div className="max-w-[400px] mx-auto flex gap-3 mt-8">
          <button
            onClick={resetState}
            className="flex-1 h-11 rounded-card border border-border-default text-sm font-medium hover:bg-bg-subtle transition-colors"
          >
            Retake Photo
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 h-11 rounded-card bg-brand text-text-inverse text-sm font-medium hover:bg-brand/90 transition-colors shadow-sm"
          >
            Analyse Skin →
          </button>
        </div>
      </div>
    );
  }

  // IDLE State
  return (
    <div className="w-full">
      <div 
        {...getRootProps({
          role: "button",
          "aria-label": "Upload skin photo. Accepted formats: JPEG, PNG, WEBP. Maximum 15 megabytes."
        })} 
        className={cn(
          "h-[300px] flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-card cursor-pointer transition-all duration-200 text-center",
          isDragActive 
            ? "border-accent bg-bg-subtle/50" 
            : "border-border-default bg-bg-surface hover:bg-bg-subtle/20 hover:border-skin-charcoal/30"
        )}
      >
        <input {...getInputProps()} />
        <div className="w-16 h-16 rounded-full bg-bg-subtle flex items-center justify-center mb-4">
          <Camera size={28} className="text-text-primary/80" />
        </div>
        <h3 className="font-display text-xl text-text-primary mb-2">Drop your photo here</h3>
        <p className="text-text-primary/80 font-medium mb-1">or tap to select</p>
        <p className="text-xs text-text-tertiary">JPEG · PNG · WEBP · up to 15MB</p>
      </div>

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Tip icon={<Sun size={18} />} text="Natural daylight works best" />
        <Tip icon={<ScanFace size={18} />} text="Face centred in frame" />
        <Tip icon={<Hand size={18} />} text="Hold steady — avoid blur" />
      </div>
    </div>
  );
}

/* ─── Sub-components ─── */

function GateRow({ label, state }: { label: string; state: GateState }) {
  return (
    <div className="flex items-center gap-3 text-sm font-medium text-text-primary">
      <div className="w-5 flex justify-center">
        {state === 'pending' && <div className="w-2 h-2 rounded-full bg-border-default" />}
        {state === 'running' && <Loader2 size={16} className="text-accent animate-spin" />}
        {state === 'pass' && <CheckCircle2 size={18} className="text-accent" />}
        {state === 'warn' && <AlertTriangle size={18} className="text-severity-moderate" />}
        {state === 'fail' && <XCircle size={18} className="text-severity-severe" />}
      </div>
      <span className={state === 'pending' ? 'opacity-50' : 'opacity-100'}>{label}</span>
    </div>
  );
}

function Tip({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex flex-col items-center text-center p-4 rounded-xl bg-bg-surface border border-border-default">
      <div className="text-accent mb-2">{icon}</div>
      <span className="text-xs font-medium text-text-tertiary">{text}</span>
    </div>
  );
}

function Badge({ icon, text, warn }: { icon: React.ReactNode; text: string; warn?: boolean }) {
  return (
    <div className={cn(
      "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
      warn 
        ? "bg-severity-moderate/10 text-severity-moderate border border-severity-moderate/20" 
        : "bg-accent/10 text-accent border border-accent/20"
    )}>
      {icon}
      {text}
    </div>
  );
}
