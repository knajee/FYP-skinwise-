import pytest
from src.services.logic_engines import (
    SkinVector,
    LesionCounts,
    SeverityGrade,
    score_questionnaire,
    assess_severity,
    fuse_skin_type,
    run_decision_engine,
    _validate_observation
)

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# QUESTIONNAIRE TESTS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

def test_score_all_dry():
    responses = {'q1': 0, 'q2': 0, 'q3': 0, 'q4': 0, 'q5': 0, 'q6': 0, 'q7': 0}
    result = score_questionnaire(responses)
    assert result.p_dry > result.p_balanced
    assert result.p_dry > result.p_oily

def test_score_all_oily():
    responses = {'q1': 3, 'q2': 3, 'q3': 3, 'q4': 3, 'q5': 3, 'q6': 3, 'q7': 3}
    result = score_questionnaire(responses)
    assert result.p_oily > result.p_dry
    assert result.p_oily > result.p_balanced

def test_score_empty_responses():
    result = score_questionnaire({})
    assert result == SkinVector(0.333, 0.333, 0.333)

def test_score_vector_sums_to_one():
    responses = {'q1': 1, 'q2': 2, 'q3': 1, 'q7': 3}
    result = score_questionnaire(responses)
    assert abs((result.p_dry + result.p_balanced + result.p_oily) - 1.0) < 1e-4

def test_invalid_response_index_raises():
    with pytest.raises(ValueError):
        score_questionnaire({'q1': 4})


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# SEVERITY TESTS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

def test_severity_clear():
    counts = LesionCounts(0, 0, 0, 0)
    assert assess_severity(counts) == SeverityGrade.CLEAR

def test_severity_mild():
    counts = LesionCounts(comedone=5, papule=2, pustule=0, nodule=0)
    assert assess_severity(counts) == SeverityGrade.MILD

def test_severity_moderate_by_nodule():
    counts = LesionCounts(comedone=3, papule=2, pustule=1, nodule=1)
    assert assess_severity(counts) == SeverityGrade.MODERATE

def test_severity_moderate_by_ratio():
    counts = LesionCounts(comedone=2, papule=5, pustule=4, nodule=0)
    assert assess_severity(counts) == SeverityGrade.MODERATE

def test_severity_severe_by_nodule_count():
    counts = LesionCounts(comedone=5, papule=3, pustule=2, nodule=3)
    assert assess_severity(counts) == SeverityGrade.SEVERE

def test_severity_severe_by_total():
    counts = LesionCounts(comedone=30, papule=8, pustule=4, nodule=0)
    assert assess_severity(counts) == SeverityGrade.SEVERE

def test_severity_severe_by_combined():
    counts = LesionCounts(comedone=5, papule=10, pustule=8, nodule=0)
    assert assess_severity(counts) == SeverityGrade.SEVERE


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# FUSION TESTS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

def test_fusion_both_signals():
    cnn = SkinVector(p_dry=0.1, p_balanced=0.2, p_oily=0.7)
    ques = SkinVector(p_dry=0.5, p_balanced=0.3, p_oily=0.2)
    # W_QUES=0.6, W_CNN=0.4
    result = fuse_skin_type(cnn=cnn, ques=ques)
    assert result.signal_source == 'fusion'
    assert result.fused_vector['p_dry'] == round((0.4 * 0.1) + (0.6 * 0.5), 6)
    assert result.fused_vector['p_balanced'] == round((0.4 * 0.2) + (0.6 * 0.3), 6)
    assert result.fused_vector['p_oily'] == round((0.4 * 0.7) + (0.6 * 0.2), 6)

def test_fusion_cnn_only():
    cnn = SkinVector(p_dry=0.8, p_balanced=0.1, p_oily=0.1)
    result = fuse_skin_type(cnn=cnn, ques=None)
    assert result.signal_source == 'cnn_only'
    assert result.fused_vector == cnn.to_dict()

def test_fusion_ques_only():
    ques = SkinVector(p_dry=0.2, p_balanced=0.2, p_oily=0.6)
    result = fuse_skin_type(cnn=None, ques=ques)
    assert result.signal_source == 'questionnaire_only'
    assert result.fused_vector == ques.to_dict()

def test_fusion_neither():
    result = fuse_skin_type(cnn=None, ques=None)
    assert result.signal_source == 'none'
    assert result.fused_vector['p_dry'] == 0.333

def test_fusion_low_confidence_flag():
    # max value 0.50
    ques = SkinVector(0.50, 0.25, 0.25)
    cnn = SkinVector(0.50, 0.25, 0.25)
    result = fuse_skin_type(cnn=cnn, ques=ques)
    assert result.low_confidence is True

def test_fusion_high_confidence_flag():
    # max value 0.80
    ques = SkinVector(0.80, 0.10, 0.10)
    cnn = SkinVector(0.80, 0.10, 0.10)
    result = fuse_skin_type(cnn=cnn, ques=ques)
    assert result.low_confidence is False


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# DECISION ENGINE TESTS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

def test_no_observations_when_env_all_none():
    env = {'temperature': None, 'humidity': None, 'uv_index': None, 'pm25': None}
    result = run_decision_engine('balanced', SeverityGrade.MILD, env, [])
    assert result.observations == []

def test_high_temp_oily_generates_observation():
    env = {'temperature': 30.0, 'humidity': None, 'uv_index': None, 'pm25': None}
    result = run_decision_engine('oily', SeverityGrade.CLEAR, env, [])
    assert len(result.observations) >= 1
    assert '28' in result.observations[0]

def test_high_uv_generates_observation():
    env = {'temperature': None, 'humidity': None, 'uv_index': 8.0, 'pm25': None}
    result = run_decision_engine('balanced', SeverityGrade.CLEAR, env, [])
    assert any('UV' in obs for obs in result.observations)

def test_high_pm25_generates_observation():
    env = {'temperature': None, 'humidity': None, 'uv_index': None, 'pm25': 90.0}
    result = run_decision_engine('dry', SeverityGrade.CLEAR, env, [])
    assert any('PM2.5' in obs or 'particulate' in obs for obs in result.observations)

def test_prohibited_vocab_in_output_raises():
    with pytest.raises(ValueError):
        _validate_observation("This will diagnose your condition.")

def test_decision_result_has_ingredients():
    ingredients = ['Niacinamide', 'Salicylic Acid']
    env = {'temperature': None, 'humidity': None, 'uv_index': None, 'pm25': None}
    result = run_decision_engine('balanced', SeverityGrade.CLEAR, env, ingredients)
    assert result.active_ingredients == ingredients
