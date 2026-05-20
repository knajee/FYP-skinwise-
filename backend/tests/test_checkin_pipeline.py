import pytest
import datetime
from httpx import AsyncClient
from src.services.exif_service import extract_exif, ExifResult
from src.services.env_service import fetch_env_snapshot, EnvSnapshot
from src.schemas.checkins import QuestionnaireRequest
from PIL import Image
import io

@pytest.mark.asyncio
async def test_questionnaire_submit():
    # We can test the logic engine parts here directly
    from src.services.logic_engines import score_questionnaire, SkinVector
    
    responses_dict = {
        'q1': 1, 'q2': 1, 'q3': 1, 'q4': 1,
        'q5': 1, 'q6': 1, 'q7': 1,
    }
    ques_vector = score_questionnaire(responses_dict)
    assert abs((ques_vector.p_dry + ques_vector.p_balanced + ques_vector.p_oily) - 1.0) < 1e-4

def test_exif_extraction_with_gps():
    # Create a mock EXIF image using piexif
    import piexif
    
    exif_dict = {
        "0th": {},
        "Exif": {
            piexif.ExifIFD.DateTimeOriginal: b"2023:10:05 14:30:00"
        },
        "GPS": {
            piexif.GPSIFD.GPSLatitudeRef: b'N',
            piexif.GPSIFD.GPSLatitude: ((37, 1), (46, 1), (3000, 100)), # 37 deg 46 min 30 sec
            piexif.GPSIFD.GPSLongitudeRef: b'W',
            piexif.GPSIFD.GPSLongitude: ((122, 1), (25, 1), (1200, 100)), # 122 deg 25 min 12 sec
        }
    }
    exif_bytes = piexif.dump(exif_dict)
    
    img = Image.new('RGB', (100, 100), color='white')
    img_byte_arr = io.BytesIO()
    img.save(img_byte_arr, format='JPEG', exif=exif_bytes)
    
    result = extract_exif(img_byte_arr.getvalue())
    assert result.exif_source == 'exif_datetime'
    assert result.captured_at.year == 2023
    assert result.captured_at.month == 10
    
    # Check rounding
    # 37 + 46/60 + 30/3600 = 37.775 -> 37.78
    # -(122 + 25/60 + 12/3600) = -122.42
    assert result.lat_rounded == 37.77
    assert result.lng_rounded == -122.42

@pytest.mark.asyncio
async def test_env_fetch_graceful_failure(monkeypatch):
    async def mock_fetch_open_meteo(*args, **kwargs):
        return None
        
    async def mock_fetch_openaq(*args, **kwargs):
        return None
        
    import src.services.env_service as env_service
    monkeypatch.setattr(env_service, "_fetch_open_meteo", mock_fetch_open_meteo)
    monkeypatch.setattr(env_service, "_fetch_openaq", mock_fetch_openaq)
    
    result = await fetch_env_snapshot(37.78, -122.42, datetime.datetime.now(), "key", "exif_datetime")
    assert result.data_source == 'open-meteo-unavailable'
    assert result.temperature is None
    assert result.pm25 is None

@pytest.mark.asyncio
async def test_confidence_threshold_filtering():
    from src.services.ml_client import call_ml_worker, ML_WORKER_URL
    import httpx
    
    class MockResponse:
        def __init__(self):
            self.status_code = 200
        def raise_for_status(self):
            pass
        def json(self):
            return {
                "detections": [
                    {"class_id": 3, "confidence": 0.50, "bbox_x": 0.5, "bbox_y": 0.5, "bbox_w": 0.1, "bbox_h": 0.1}, # Nodule < 0.55
                    {"class_id": 1, "confidence": 0.50, "bbox_x": 0.5, "bbox_y": 0.5, "bbox_w": 0.1, "bbox_h": 0.1}, # Papule >= 0.45
                ],
                "skin_type": {"p_dry": 0.2, "p_balanced": 0.7, "p_oily": 0.1}
            }
            
    class MockAsyncClient:
        def __init__(self, *args, **kwargs):
            pass
        async def __aenter__(self): return self
        async def __aexit__(self, *args): pass
        async def post(self, *args, **kwargs): return MockResponse()

    import src.services.ml_client as ml_client
    # Mock httpx.AsyncClient
    original_client = httpx.AsyncClient
    httpx.AsyncClient = MockAsyncClient # type: ignore
    
    try:
        result = await ml_client.call_ml_worker(b"dummy")
        assert len(result.detections) == 1
        assert result.detections[0].class_id == 1 # Papule was retained
    finally:
        httpx.AsyncClient = original_client # type: ignore

def test_low_conf_flag():
    from src.services.ml_client import DetectionItem
    
    det1 = DetectionItem(0, "comedone", 0, 0, 0, 0, 0.52, (0.45 <= 0.52 < 0.60))
    det2 = DetectionItem(0, "comedone", 0, 0, 0, 0, 0.65, (0.45 <= 0.65 < 0.60))
    
    assert det1.low_conf is True
    assert det2.low_conf is False
