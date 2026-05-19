from pydantic import BaseModel, ConfigDict
from datetime import datetime, date
from typing import Literal

class QuestionnairePayload(BaseModel):
    q1: int   # 0-3
    q2: int
    q3: int
    q4: int
    q5: int
    q6: int
    q7: int

class QuestionnaireResponse(BaseModel):
    p_dry:      float
    p_balanced: float
    p_oily:     float
    predicted_label: str
    signal_source:   str

class DetectionPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    class_id:   int
    class_name: str
    bbox_x:     float
    bbox_y:     float
    bbox_w:     float
    bbox_h:     float
    confidence: float
    low_conf:   bool

class LesionSummary(BaseModel):
    comedone:          int
    papule:            int
    pustule:           int
    nodule:            int
    total:             int
    inflammatory_ratio: float

class SkinTypePublic(BaseModel):
    predicted_label:  str
    confidence:       float
    low_confidence:   bool
    signal_source:    str
    fused_vector:     dict[str, float]
    cnn_vector:       dict[str, float] | None
    ques_vector:      dict[str, float] | None

class EnvSnapshotPublic(BaseModel):
    temperature: float | None
    humidity:    float | None
    uv_index:    float | None
    pm25:        float | None
    data_source: str

class IngredientPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id:              str
    name:            str
    concentration:   str | None
    frequency:       str
    started_at:      date
    discontinued_at: date | None

class CheckinResult(BaseModel):
    """Full result returned to frontend after upload — matches frontend CheckinResult type."""
    checkin_id:        str
    image_url:         str | None
    captured_at:       datetime
    severity_grade:    Literal['Clear', 'Mild', 'Moderate', 'Severe']
    lesion_summary:    LesionSummary
    detections:        list[DetectionPublic]
    skin_type_result:  SkinTypePublic
    env_snapshot:      EnvSnapshotPublic | None
    observations:      list[str]
    active_ingredients: list[IngredientPublic]
    inference_ms:      int

class CheckinSummary(BaseModel):
    """Lightweight model for the paginated dashboard timeline."""
    model_config = ConfigDict(from_attributes=True)
    id:            str
    captured_at:   datetime
    severity_grade: str
    thumbnail_url:  str | None
    lesion_counts:  dict[str, int]   # {comedone, papule, pustule, nodule, total}
