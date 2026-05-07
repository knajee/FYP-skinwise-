import { create } from 'zustand';
import type { CheckinResult } from './types';

interface ActiveCheckin {
  imageFile: File | null;
  imagePreviewUrl: string | null;
  exifCapturedAt: string | null;
  exifLat: number | null;
  exifLng: number | null;
  geolocationLat: number | null;
  geolocationLng: number | null;
  qualityGates: {
    faceDetected: boolean | null;
    resolutionPassed: boolean | null;
    blurWarning: boolean;
    luminanceWarning: boolean;
  };
  questionnaireVector: { p_dry: number; p_balanced: number; p_oily: number } | null;
  uploadStatus: 'idle' | 'uploading' | 'processing' | 'complete' | 'error';
  errorMessage: string | null;
  result: CheckinResult | null;
}

interface CheckinState {
  activeCheckin: ActiveCheckin;
}

interface CheckinActions {
  setImageFile: (file: File, previewUrl: string) => void;
  setExifData: (data: { capturedAt: string | null; lat: number | null; lng: number | null }) => void;
  setGeolocation: (lat: number, lng: number) => void;
  setQualityGate: (gate: keyof ActiveCheckin['qualityGates'], value: boolean) => void;
  setQuestionnaireVector: (vector: { p_dry: number; p_balanced: number; p_oily: number }) => void;
  setUploadStatus: (status: ActiveCheckin['uploadStatus'], errorMessage?: string) => void;
  setResult: (result: CheckinResult) => void;
  resetActiveCheckin: () => void;
}

type CheckinStore = CheckinState & CheckinActions;

const initialCheckinState: ActiveCheckin = {
  imageFile: null,
  imagePreviewUrl: null,
  exifCapturedAt: null,
  exifLat: null,
  exifLng: null,
  geolocationLat: null,
  geolocationLng: null,
  qualityGates: {
    faceDetected: null,
    resolutionPassed: null,
    blurWarning: false,
    luminanceWarning: false,
  },
  questionnaireVector: null,
  uploadStatus: 'idle',
  errorMessage: null,
  result: null,
};

export const useCheckinStore = create<CheckinStore>((set) => ({
  activeCheckin: { ...initialCheckinState },

  setImageFile: (file, previewUrl) =>
    set((state) => ({
      activeCheckin: {
        ...state.activeCheckin,
        imageFile: file,
        imagePreviewUrl: previewUrl,
      },
    })),
    
  setExifData: (data) =>
    set((state) => ({
      activeCheckin: {
        ...state.activeCheckin,
        exifCapturedAt: data.capturedAt,
        exifLat: data.lat,
        exifLng: data.lng,
      },
    })),
    
  setGeolocation: (lat, lng) =>
    set((state) => ({
      activeCheckin: {
        ...state.activeCheckin,
        geolocationLat: lat,
        geolocationLng: lng,
      },
    })),
    
  setQualityGate: (gate, value) =>
    set((state) => ({
      activeCheckin: {
        ...state.activeCheckin,
        qualityGates: {
          ...state.activeCheckin.qualityGates,
          [gate]: value,
        },
      },
    })),
    
  setQuestionnaireVector: (vector) =>
    set((state) => ({
      activeCheckin: {
        ...state.activeCheckin,
        questionnaireVector: vector,
      },
    })),
    
  setUploadStatus: (status, errorMessage) =>
    set((state) => ({
      activeCheckin: {
        ...state.activeCheckin,
        uploadStatus: status,
        errorMessage: errorMessage ?? null,
      },
    })),
    
  setResult: (result) =>
    set((state) => ({
      activeCheckin: {
        ...state.activeCheckin,
        result,
      },
    })),
    
  resetActiveCheckin: () =>
    set(() => ({
      activeCheckin: { ...initialCheckinState },
    })),
}));
