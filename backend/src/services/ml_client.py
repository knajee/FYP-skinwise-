import httpx
from dataclasses import dataclass

ML_WORKER_URL = 'http://localhost:8001'

CONF_THRESHOLDS: dict[int, float] = {0: 0.45, 1: 0.45, 2: 0.45, 3: 0.55}
CLASS_NAMES:     dict[int, str]   = {0: 'comedone', 1: 'papule', 2: 'pustule', 3: 'nodule'}
MAX_DETECTIONS:  int              = 150

@dataclass
class DetectionItem:
    class_id:   int
    class_name: str
    bbox_x:     float   # normalised 0-1 (centre x)
    bbox_y:     float   # normalised 0-1 (centre y)
    bbox_w:     float   # normalised 0-1
    bbox_h:     float   # normalised 0-1
    confidence: float
    low_conf:   bool    # True when 0.45 <= confidence < 0.60

@dataclass
class MLWorkerResult:
    detections:  list[DetectionItem]
    p_dry:       float
    p_balanced:  float
    p_oily:      float
    inference_ms: int

async def call_ml_worker(image_bytes: bytes) -> MLWorkerResult:
    """
    POSTs image bytes to internal ML Worker.
    Worker runs YOLOv8s (lesion detection) and MobileNetV2 (skin type CNN) concurrently.
    Timeout is 10 seconds — covers P95 inference time of 5.5s with buffer.
    Raises httpx.HTTPError on failure — caller must handle.
    """
    import time
    start = time.monotonic()

    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.post(
            f'{ML_WORKER_URL}/predict',
            files={'file': ('image.jpg', image_bytes, 'image/jpeg')},
        )
        resp.raise_for_status()

    elapsed_ms = int((time.monotonic() - start) * 1000)
    data       = resp.json()

    # ── Parse detections from ML Worker response ───────────────────────────
    raw_detections: list[dict] = data.get('detections', [])
    parsed: list[DetectionItem] = []

    for det in raw_detections[:MAX_DETECTIONS]:
        class_id   = int(det['class_id'])
        confidence = float(det['confidence'])
        threshold  = CONF_THRESHOLDS.get(class_id, 0.45)

        if confidence < threshold:
            continue   # below class-specific threshold — discard

        parsed.append(DetectionItem(
            class_id=class_id,
            class_name=CLASS_NAMES.get(class_id, 'unknown'),
            bbox_x=float(det['bbox_x']),
            bbox_y=float(det['bbox_y']),
            bbox_w=float(det['bbox_w']),
            bbox_h=float(det['bbox_h']),
            confidence=confidence,
            low_conf=(0.45 <= confidence < 0.60),
        ))

    skin_type: dict = data.get('skin_type', {})

    return MLWorkerResult(
        detections=parsed,
        p_dry=float(skin_type.get('p_dry', 0.333)),
        p_balanced=float(skin_type.get('p_balanced', 0.333)),
        p_oily=float(skin_type.get('p_oily', 0.333)),
        inference_ms=elapsed_ms,
    )
