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
  class_id: number;
  class_name: string;
  bbox_x: number;
  bbox_y: number;
  bbox_w: number;
  bbox_h: number;
  confidence: number;
  low_conf: boolean;
}

export interface SkinTypeResult {
  predicted_label: string;
  confidence: number;
  low_confidence: boolean;
  signal_source: string;
  fused_vector: { p_dry: number; p_balanced: number; p_oily: number };
  cnn_vector: { p_dry: number; p_balanced: number; p_oily: number } | null;
  ques_vector: { p_dry: number; p_balanced: number; p_oily: number } | null;
}

export interface EnvSnapshot {
  temperature: number | null;
  humidity: number | null;
  uv_index: number | null;
  pm25: number | null;
  data_source: string;
}

export interface Ingredient {
  id: string;
  name: string;
  concentration: string | null;
  frequency: string;
  started_at: string;
  discontinued_at: string | null;
  created_at: string;
}

export interface CheckinResult {
  checkin_id: string;
  image_url: string | null;
  captured_at: string;
  severity_grade: 'Clear' | 'Mild' | 'Moderate' | 'Severe';
  lesion_summary: {
    comedone: number;
    papule: number;
    pustule: number;
    nodule: number;
    total: number;
    inflammatory_ratio: number;
  };
  detections: Detection[];
  skin_type_result: SkinTypeResult;
  env_snapshot: EnvSnapshot | null;
  observations: string[];
  active_ingredients: Ingredient[];
  inference_ms: number;
}

export interface CheckinSummary {
  id: string;
  captured_at: string;
  severity_grade: string;
  thumbnail_url: string | null;
  lesion_counts: {
    comedone: number;
    papule: number;
    pustule: number;
    nodule: number;
    total: number;
  };
}
