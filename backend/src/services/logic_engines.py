from __future__ import annotations
from dataclasses import dataclass
from enum import Enum
from typing import Literal
import os

class SeverityGrade(str, Enum):
    CLEAR    = 'Clear'
    MILD     = 'Mild'
    MODERATE = 'Moderate'
    SEVERE   = 'Severe'

SkinTypeLabel = Literal['dry', 'balanced', 'oily']

@dataclass(frozen=True)
class SkinVector:
    p_dry:      float
    p_balanced: float
    p_oily:     float

    def to_dict(self) -> dict[str, float]:
        return {'p_dry': self.p_dry, 'p_balanced': self.p_balanced, 'p_oily': self.p_oily}

@dataclass(frozen=True)
class LesionCounts:
    comedone: int = 0
    papule:   int = 0
    pustule:  int = 0
    nodule:   int = 0

    @property
    def total(self) -> int:
        return self.comedone + self.papule + self.pustule + self.nodule

    @property
    def inflammatory(self) -> int:
        return self.papule + self.pustule + self.nodule

    @property
    def inflammatory_ratio(self) -> float:
        return self.inflammatory / self.total if self.total > 0 else 0.0

@dataclass(frozen=True)
class FusionResult:
    predicted_label:  SkinTypeLabel
    confidence:       float
    low_confidence:   bool          # True when max(fused_vector) < 0.60
    signal_source:    str           # 'fusion' | 'cnn_only' | 'questionnaire_only' | 'none'
    fused_vector:     dict[str, float]
    cnn_vector:       dict[str, float] | None
    ques_vector:      dict[str, float] | None

@dataclass(frozen=True)
class DecisionResult:
    observations:       list[str]
    active_ingredients: list[str]


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# TASK 2 — QUESTIONNAIRE PROCESSOR
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

RUBRIC: dict[str, list[tuple[int, int, int]]] = {
    'q1': [(3, 0, 0), (0, 3, 0), (0, 1, 2), (0, 0, 3)],
    'q2': [(1, 2, 0), (0, 2, 1), (0, 1, 2), (0, 0, 3)],
    'q3': [(3, 0, 0), (1, 2, 0), (0, 2, 1), (0, 1, 2)],
    'q4': [(2, 0, 1), (1, 1, 1), (0, 2, 0), (0, 3, 0)],
    'q5': [(0, 3, 0), (0, 2, 1), (0, 1, 2), (0, 0, 3)],
    'q6': [(0, 3, 0), (0, 2, 1), (0, 1, 2), (0, 0, 3)],
    'q7': [(3, 0, 0), (0, 3, 0), (0, 1, 2), (0, 0, 3)],
}

def score_questionnaire(responses: dict[str, int]) -> SkinVector:
    """
    Scores a completed 7-question skin profile questionnaire.
    
    Args:
        responses: dict mapping question ID ('q1'...'q7') to selected option index (0-3).
                   Skipped questions are simply absent from the dict — they contribute zero.
    
    Returns:
        SkinVector with p_dry, p_balanced, p_oily normalised to sum to 1.0.
        If total raw score is 0 (all questions unanswered), returns uniform distribution (0.333 each).
    
    This function is the single source of truth for questionnaire scoring.
    It must produce identical output for identical input — always.
    """
    raw = [0, 0, 0]  # [dry_total, balanced_total, oily_total]

    for q_id, r_idx in responses.items():
        if q_id not in RUBRIC:
            continue
        if not (0 <= r_idx <= 3):
            raise ValueError(f'Invalid response index {r_idx} for {q_id}: must be 0-3')
        scores = RUBRIC[q_id][r_idx]
        raw[0] += scores[0]
        raw[1] += scores[1]
        raw[2] += scores[2]

    total = sum(raw)
    if total == 0:
        return SkinVector(p_dry=0.333, p_balanced=0.333, p_oily=0.333)

    return SkinVector(
        p_dry=round(raw[0] / total, 6),
        p_balanced=round(raw[1] / total, 6),
        p_oily=round(raw[2] / total, 6),
    )


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# TASK 3 — SEVERITY ASSESSMENT ENGINE
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

def assess_severity(counts: LesionCounts) -> SeverityGrade:
    """
    Deterministic rule-based severity assessment.
    Rules applied in order — first match wins.
    
    Grade definitions:
      Clear    — total_count == 0
      Mild     — total <= 15 AND nodule == 0 AND inflammatory_ratio < 0.35
      Moderate — total <= 40 AND nodule <= 2 AND inflammatory_ratio < 0.65
      Severe   — total > 40 OR nodule >= 3 OR (total > 20 AND inflammatory_ratio >= 0.65)
    
    Where inflammatory_ratio = (papule + pustule + nodule) / total
    """
    if counts.total == 0:
        return SeverityGrade.CLEAR

    if (counts.nodule >= 3
            or counts.total > 40
            or (counts.total > 20 and counts.inflammatory_ratio >= 0.65)):
        return SeverityGrade.SEVERE

    if (counts.nodule >= 1
            or counts.total > 15
            or counts.inflammatory_ratio >= 0.35):
        return SeverityGrade.MODERATE

    return SeverityGrade.MILD


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# TASK 4 — FUSION LAYER
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

W_QUES: float = float(os.getenv('FUSION_W_QUESTIONNAIRE', '0.60'))
W_CNN:  float = float(os.getenv('FUSION_W_CNN',           '0.40'))

# Validate weights sum to 1.0 at startup — fast fail if misconfigured
assert abs((W_QUES + W_CNN) - 1.0) < 1e-6, (
    f'FUSION_W_QUESTIONNAIRE ({W_QUES}) + FUSION_W_CNN ({W_CNN}) must sum to 1.0'
)

def fuse_skin_type(
    cnn:  SkinVector | None,
    ques: SkinVector | None,
) -> FusionResult:
    """
    Combines CNN image inference and questionnaire scoring into a fused skin type estimate.
    
    Weights:  Questionnaire = 60% (W_QUES),  CNN = 40% (W_CNN)
    Rationale: Questionnaire captures longitudinal self-report; CNN captures current image signal.
               Questionnaire is weighted higher because specular reflectance frequently
               causes the CNN to misclassify oily skin (documented failure mode, JBO 2023).
    
    Graceful degradation — handles missing signals without failing:
      Both available  → weighted fusion (standard path)
      CNN only        → use CNN vector as-is, mark source='cnn_only'
      Ques only       → use questionnaire vector as-is, mark source='questionnaire_only'
      Neither         → uniform distribution (0.333 each), mark source='none'
    
    low_confidence flag is True when max(fused_vector) < 0.60.
    This triggers a UI warning prompting the user to re-take the questionnaire.
    """
    cnn_ok  = cnn is not None
    ques_ok = ques is not None

    if cnn_ok and ques_ok:
        fused = SkinVector(
            p_dry=      round(W_CNN * cnn.p_dry      + W_QUES * ques.p_dry,      6),
            p_balanced= round(W_CNN * cnn.p_balanced + W_QUES * ques.p_balanced, 6),
            p_oily=     round(W_CNN * cnn.p_oily     + W_QUES * ques.p_oily,     6),
        )
        source = 'fusion'
    elif cnn_ok:
        fused,  source = cnn,  'cnn_only' # type: ignore
    elif ques_ok:
        fused,  source = ques, 'questionnaire_only' # type: ignore
    else:
        fused  = SkinVector(p_dry=0.333, p_balanced=0.333, p_oily=0.333)
        source = 'none'

    fused_dict = fused.to_dict()
    label      = max(fused_dict, key=fused_dict.get).replace('p_', '')  # type: ignore[arg-type]
    confidence = max(fused_dict.values())

    return FusionResult(
        predicted_label=label,          # type: ignore[arg-type]
        confidence=confidence,
        low_confidence=confidence < 0.60,
        signal_source=source,
        fused_vector=fused_dict,
        cnn_vector=cnn.to_dict()  if cnn_ok  else None,
        ques_vector=ques.to_dict() if ques_ok else None,
    )


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# TASK 5 — DECISION ENGINE
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PROHIBITED_VOCAB: list[str] = [
    'diagnose', 'diagnosis', 'treat', 'treatment', 'cure',
    'prescription', 'clinical recommendation', 'medical advice',
    'you should use', 'recommended drug', 'see a doctor',
]

ENV_THRESHOLDS: dict[str, float] = {
    'high_temp':     28.0,   # °C — elevated temperature reference for sebum excretion
    'low_temp':      10.0,   # °C — cold dry conditions reference
    'high_humidity': 75.0,   # % — high humidity reference for C. acnes proliferation
    'low_humidity':  40.0,   # % — low humidity reference for TEWL (transepidermal water loss)
    'high_uv':        6.0,   # UV Index — pro-inflammatory cytokine upregulation threshold
    'high_pm25':     75.0,   # µg/m³ — particulate matter oxidative stress threshold
}

def _validate_observation(text: str) -> str:
    """
    Runs every observation string through the prohibited vocabulary filter.
    Raises ValueError if any prohibited term is found (case-insensitive).
    Returns the original string unchanged if it passes.
    This is a server-side safety net enforcing the wellness regulatory posture.
    """
    lower = text.lower()
    for word in PROHIBITED_VOCAB:
        if word.lower() in lower:
            raise ValueError(
                f'Prohibited vocabulary "{word}" found in decision engine output. '
                f'Review observation copy immediately.'
            )
    return text


def run_decision_engine(
    skin_type:          str,           # 'dry' | 'balanced' | 'oily' (lowercase)
    severity:           SeverityGrade,
    env:                dict[str, float | None],  # keys: temperature, humidity, uv_index, pm25
    ingredient_names:   list[str],     # active ingredients at time of check-in
) -> DecisionResult:
    """
    Generates contextual wellness observations from skin type, severity grade,
    and environmental snapshot. All observations are correlational — never causal.
    
    env dict keys: 'temperature' (°C), 'humidity' (%), 'uv_index', 'pm25' (µg/m³)
    Any env value may be None (API failure) — rules requiring that value are simply skipped.
    
    Observations are framed as scientific correlations with citations, not advice.
    """
    obs: list[str] = []

    t   = env.get('temperature')
    h   = env.get('humidity')
    uv  = env.get('uv_index')
    pm  = env.get('pm25')

    # ── Temperature rules ──────────────────────────────────────────────────

    if skin_type == 'oily' and t is not None and t > ENV_THRESHOLDS['high_temp']:
        obs.append(_validate_observation(
            f'Elevated temperature is associated with increased sebum excretion rates '
            f'(Williams et al.). Your check-in was recorded at {round(t, 1)}°C — '
            f'above the {ENV_THRESHOLDS["high_temp"]}°C reference threshold.'
        ))

    if skin_type == 'dry' and t is not None and t < ENV_THRESHOLDS['low_temp']:
        obs.append(_validate_observation(
            f'Cold conditions ({round(t, 1)}°C) combined with a dry skin profile may '
            f'exacerbate barrier disruption. Research notes increased transepidermal water '
            f'loss in sub-{ENV_THRESHOLDS["low_temp"]}°C environments during winter months.'
        ))

    # ── Humidity rules ──────────────────────────────────────────────────────

    if h is not None and h > ENV_THRESHOLDS['high_humidity']:
        obs.append(_validate_observation(
            f'Ambient humidity was {round(h, 0):.0f}% at the time of this check-in. '
            f'High humidity has been associated with pilosebaceous unit swelling and '
            f'Cutibacterium acnes proliferation risk in research literature.'
        ))

    if skin_type == 'dry' and h is not None and h < ENV_THRESHOLDS['low_humidity']:
        obs.append(_validate_observation(
            f'Low ambient humidity ({round(h, 0):.0f}%) may accelerate transepidermal '
            f'water loss, which is particularly relevant to your dry skin profile. '
            f'The {ENV_THRESHOLDS["low_humidity"]}% level is commonly used as a reference '
            f'threshold in barrier function research.'
        ))

    # ── UV Index rules ──────────────────────────────────────────────────────

    if uv is not None and uv > ENV_THRESHOLDS['high_uv']:
        obs.append(_validate_observation(
            f'UV Index was {round(uv, 1)} at the time of this check-in. '
            f'High UV exposure has been associated with pro-inflammatory cytokine '
            f'upregulation in comedonal lesions (Suh et al. 2002).'
        ))

    # ── PM2.5 / Air Quality rules ───────────────────────────────────────────

    if pm is not None and pm > ENV_THRESHOLDS['high_pm25']:
        obs.append(_validate_observation(
            f'PM2.5 particulate matter was {round(pm, 0):.0f} µg/m³ at this check-in — '
            f'above the {ENV_THRESHOLDS["high_pm25"]} µg/m³ reference level. '
            f'Elevated particulate matter has been associated with oxidative stress '
            f'and skin barrier impairment in environmental skin research.'
        ))

    # ── Severity-specific rules ─────────────────────────────────────────────

    if severity == SeverityGrade.SEVERE and skin_type == 'oily':
        obs.append(_validate_observation(
            f'This check-in shows a high inflammatory lesion burden. '
            f'Tracking this pattern over the next 4 weeks may indicate whether '
            f'your current skincare routine is having a measurable effect on lesion counts.'
        ))

    if severity in (SeverityGrade.MODERATE, SeverityGrade.SEVERE):
        obs.append(_validate_observation(
            f'Your inflammatory lesion count is elevated in this check-in. '
            f'Consistent weekly tracking helps establish whether environmental or '
            f'ingredient factors are associated with changes in your lesion pattern.'
        ))

    return DecisionResult(
        observations=obs,
        active_ingredients=ingredient_names,
    )
