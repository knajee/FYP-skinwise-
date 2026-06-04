// ─── Severity ───
export type SeverityGrade = "clear" | "mild" | "moderate" | "severe";

// ─── Lesion Classes ───
export type LesionClass = "comedone" | "papule" | "pustule" | "nodule";

export interface Detection {
  class_id: number;
  bbox_x: number;
  bbox_y: number;
  bbox_w: number;
  bbox_h: number;
  confidence: number;
  low_conf: boolean;
}

export interface InferenceResult {
  status: string;
  inference_ms: number;
  total_detections: number;
  detections: Detection[];
}

// ─── Skin Type ───
export type SkinType = "dry" | "balanced" | "oily";

export interface SkinProfile {
  skinType: SkinType;
  confidence: number;
  imageSignal?: { type: SkinType; score: number };
  questionnaireSignal?: { type: SkinType; score: number };
}

// ─── Environment ───
export interface EnvironmentalData {
  temperature: number;
  humidity: number;
  uv_index: number;
  pm25: number;
  city?: string;
  country?: string;
}

// ─── Check-in ───
export interface CheckIn {
  id: string;
  date: string;
  image_url: string;
  annotatedImageUrl?: string;
  severity: SeverityGrade;
  lesion_counts: Record<LesionClass, number>;
  skinProfile: SkinProfile;
  environmental: EnvironmentalData;
  observations: Observation[];
  ingredients: string[];
}

export interface Observation {
  text: string;
  detail?: string;
  citation?: string;
}

// ─── Ingredients ───
export type IngredientFrequency =
  | "daily"
  | "twice_daily"
  | "every_other_day"
  | "weekly";

export interface Ingredient {
  id: string;
  name: string;
  concentration?: string;
  frequency: IngredientFrequency;
  startDate: string;
  endDate?: string;
  active: boolean;
}

// ─── User ───
export interface User {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
  skinProfile?: SkinProfile;
  onboardingComplete: boolean;
  created_at: string;
}

// ─── Questionnaire ───
export interface QuestionOption {
  label: string;
  value: string;
}

export interface Question {
  id: string;
  category: string;
  text: string;
  options: QuestionOption[];
}

// ─── Quality Gate ───
export type GateStatus = "pending" | "checking" | "passed" | "warning" | "failed";

export interface QualityGate {
  id: string;
  label: string;
  status: GateStatus;
  detail?: string;
}

// ─── Navigation ───
export interface NavItem {
  label: string;
  href: string;
  icon: string;
  highlighted?: boolean;
}
