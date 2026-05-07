export interface User {
  id: string;
  email: string;
  skinTypeConfirmed: string | null;
  skinTypePredicted: string | null;
  skinTypeConfidence: number | null;
  skinTypeSource: string | null;
  hasCompletedQuestionnaire: boolean;
}

export interface Detection {
  classId: number;
  className: string;
  bboxX: number;
  bboxY: number;
  bboxW: number;
  bboxH: number;
  confidence: number;
  lowConf: boolean;
}

export interface SkinTypeResult {
  predictedLabel: string;
  confidence: number;
  lowConfidence: boolean;
  signalSource: string;
  fusedVector: { p_dry: number; p_balanced: number; p_oily: number };
  cnnVector: { p_dry: number; p_balanced: number; p_oily: number } | null;
  quesVector: { p_dry: number; p_balanced: number; p_oily: number } | null;
}

export interface EnvSnapshot {
  temperature: number | null;
  humidity: number | null;
  uvIndex: number | null;
  pm25: number | null;
  dataSource: string;
}

export interface Ingredient {
  id: string;
  name: string;
  concentration: string | null;
  frequency: string;
  startedAt: string;
  discontinuedAt: string | null;
  createdAt: string;
}

export interface CheckinResult {
  checkinId: string;
  severityGrade: 'Clear' | 'Mild' | 'Moderate' | 'Severe';
  lesionSummary: {
    comedone: number;
    papule: number;
    pustule: number;
    nodule: number;
    total: number;
    inflammatoryRatio: number;
  };
  detections: Detection[];
  skinTypeResult: SkinTypeResult;
  envSnapshot: EnvSnapshot | null;
  observations: string[];
  activeIngredients: Ingredient[];
}

export interface CheckinSummary {
  id: string;
  capturedAt: string;
  severityGrade: string;
  thumbnailUrl: string | null;
  lesionCounts: {
    comedone: number;
    papule: number;
    pustule: number;
    nodule: number;
    total: number;
  };
}
