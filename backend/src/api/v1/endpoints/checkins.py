import hashlib, time, os
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, func, or_
from uuid import uuid4
import uuid

from src.db.database import get_db
from src.core.config import get_settings, Settings
from src.api.deps import get_current_user
from src.db.models import (
    User, QuestionnaireResponse as QuestionnaireResponseModel,
    Checkin as CheckinModel, LesionDetection as LesionDetectionModel,
    Ingredient as IngredientModel, SkinTypeHistory as SkinTypeHistoryModel
)
from src.schemas.checkins import (
    QuestionnairePayload, QuestionnaireResponse, CheckinResult, CheckinSummary,
    LesionSummary, DetectionPublic, SkinTypePublic, EnvSnapshotPublic, IngredientPublic
)
from src.services.logic_engines import (
    score_questionnaire, fuse_skin_type, assess_severity,
    run_decision_engine, LesionCounts, SkinVector, SeverityGrade
)
from src.services.exif_service import extract_exif
from src.services.env_service import fetch_env_snapshot, fetch_env_no_location
from src.services.ml_client import call_ml_worker

router = APIRouter(tags=['checkins'])

@router.post('/checkin/questionnaire', response_model=QuestionnaireResponse)
async def submit_questionnaire(
    body: QuestionnairePayload,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Submits the 7-question skin profile questionnaire and stores the scored result.
    Sets is_active=False on all previous questionnaire_responses rows for this user
    before inserting the new one.
    Returns the questionnaire probability vector immediately — used by the frontend
    to store in Zustand before the image upload step.
    """
    payload_dict = body.model_dump(exclude_unset=True)

    # Score using exact RUBRIC from logic_engines
    ques_vector: SkinVector = score_questionnaire(payload_dict)
    label = max(ques_vector.to_dict(), key=ques_vector.to_dict().get).replace('p_', '')

    # Deactivate previous questionnaire responses
    await db.execute(
        update(QuestionnaireResponseModel)
        .where(QuestionnaireResponseModel.user_id == uuid.UUID(str(current_user.id)))
        .values(is_active=False)
    )

    # Insert new response
    new_ques = QuestionnaireResponseModel(
        id=uuid4(),
        user_id=uuid.UUID(str(current_user.id)),
        answers=payload_dict,
        p_dry=ques_vector.p_dry,
        p_balanced=ques_vector.p_balanced,
        p_oily=ques_vector.p_oily,
        predicted_label=label,
        signal_source='questionnaire_only',
        is_active=True,
    )
    db.add(new_ques)
    await db.commit()

    return QuestionnaireResponse(
        p_dry=ques_vector.p_dry,
        p_balanced=ques_vector.p_balanced,
        p_oily=ques_vector.p_oily,
        predicted_label=label,
        signal_source='questionnaire_only',
    )


@router.post('/checkin/upload', response_model=CheckinResult)
async def upload_checkin(
    image: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    settings: Settings = Depends(get_settings),
):
    """
    Full check-in pipeline.
    """
    # ── Step 1: MIME validation (magic bytes) ──────────────────────────────
    ALLOWED_MIMES = {'image/jpeg', 'image/png', 'image/webp'}
    if image.content_type not in ALLOWED_MIMES:
        raise HTTPException(status_code=422, detail='Unsupported image format. Upload JPEG, PNG, or WEBP.')

    # ── Step 2: Read into memory — NEVER write to disk ────────────────────
    image_bytes = await image.read()
    if len(image_bytes) > 15 * 1024 * 1024:
        raise HTTPException(status_code=413, detail='Image exceeds 15MB limit.')

    # ── Step 3: SHA-256 deduplication hash ────────────────────────────────
    image_hash = hashlib.sha256(image_bytes).hexdigest()

    # ── Step 4: EXIF extraction (server-side authoritative) ───────────────
    exif = extract_exif(image_bytes)
    
    # Task 1: Environmental Fallback
    if getattr(exif, 'lat_rounded', None) is None or getattr(exif, 'lng_rounded', None) is None:
        exif.lat_rounded, exif.lng_rounded = 33.684, 73.048
    
    if not getattr(exif, 'captured_at', None):
        from datetime import datetime, timezone
        exif.captured_at = datetime.now(timezone.utc)

    # ── Step 5: Environmental data (concurrent Open-Meteo + OpenAQ) ───────
    openaq_key = getattr(settings, 'OPENAQ_API_KEY', '')
    env_snapshot = await fetch_env_snapshot(
        lat=exif.lat_rounded,
        lng=exif.lng_rounded,
        captured_at=exif.captured_at,
        openaq_api_key=openaq_key,
        exif_source=getattr(exif, 'exif_source', 'fallback'),
    )

    # ── Step 6: Save File & ML Worker inference ───────────────────────────
    image_filename = f"{uuid4()}.jpg"
    image_filepath = os.path.join("uploads", image_filename)
    with open(image_filepath, "wb") as f:
        f.write(image_bytes)
    image_url = f"/uploads/{image_filename}"

    try:
        ml_result = await call_ml_worker(image_bytes)
    except Exception as exc:
        raise HTTPException(
            status_code=503,
            detail='ML inference service temporarily unavailable. Please try again.'
        ) from exc

    # ── Step 7a: Fetch active questionnaire vector ─────────────────────────
    active_ques_result = await db.scalars(
        select(QuestionnaireResponseModel)
        .where(QuestionnaireResponseModel.user_id == uuid.UUID(str(current_user.id)))
        .order_by(QuestionnaireResponseModel.created_at.desc())
        .limit(1)
    )
    active_ques = active_ques_result.first()
    
    ques_vector = SkinVector(
        p_dry=float(active_ques.p_dry),
        p_balanced=float(active_ques.p_balanced),
        p_oily=float(active_ques.p_oily),
    ) if active_ques else None

    cnn_vector = SkinVector(
        p_dry=ml_result.p_dry,
        p_balanced=ml_result.p_balanced,
        p_oily=ml_result.p_oily,
    )

    # ── Step 7b: Fusion ────────────────────────────────────────────────────
    # CNN model is now live — pass real CNN vector from ML worker
    fusion = fuse_skin_type(cnn=cnn_vector, ques=ques_vector)

    # ── Step 7c: Lesion counts + severity ─────────────────────────────────
    counts = LesionCounts(
        comedone=sum(1 for d in ml_result.detections if d.class_name == 'comedone'),
        papule=  sum(1 for d in ml_result.detections if d.class_name == 'papule'),
        pustule= sum(1 for d in ml_result.detections if d.class_name == 'pustule'),
        nodule=  sum(1 for d in ml_result.detections if d.class_name == 'nodule'),
    )
    severity = assess_severity(counts)

    # ── Step 7d: Active ingredients ───────────────────────────────────────
    active_ingredients_rows = await db.scalars(
        select(IngredientModel)
        .where(
            IngredientModel.user_id == current_user.id,
            IngredientModel.started_at <= exif.captured_at.date(),
            or_(
                IngredientModel.discontinued_at == None,
                IngredientModel.discontinued_at >= exif.captured_at.date(),
            ),
        )
    )
    active_ingredients = list(active_ingredients_rows.all())

    # ── Step 7e: Decision engine ──────────────────────────────────────────
    env_dict = {
        'temperature': env_snapshot.temperature,
        'humidity':    env_snapshot.humidity,
        'uv_index':    env_snapshot.uv_index,
        'pm25':        env_snapshot.pm25,
    }
    decision = run_decision_engine(
        skin_type=fusion.predicted_label,
        severity=severity,
        env=env_dict,
        ingredient_names=[i.name for i in active_ingredients],
    )

    # ── Step 8: Update questionnaire row with CNN + fused vectors ─────────
    if active_ques:
        active_ques.cnn_p_dry       = ml_result.p_dry
        active_ques.cnn_p_balanced  = ml_result.p_balanced
        active_ques.cnn_p_oily      = ml_result.p_oily
        active_ques.fused_p_dry     = fusion.fused_vector['p_dry']
        active_ques.fused_p_balanced = fusion.fused_vector['p_balanced']
        active_ques.fused_p_oily    = fusion.fused_vector['p_oily']
        active_ques.signal_source   = fusion.signal_source

    # ── Step 9: Single DB transaction ─────────────────────────────────────
    checkin_id = uuid4()

    checkin_row = CheckinModel(
        id=checkin_id,
        user_id=uuid.UUID(str(current_user.id)),
        captured_at=exif.captured_at,
        lat_rounded=exif.lat_rounded,
        lng_rounded=exif.lng_rounded,
        image_hash=image_hash,
        image_url=image_url,
        env_temperature=env_snapshot.temperature,
        env_humidity=env_snapshot.humidity,
        env_uv_index=env_snapshot.uv_index,
        env_pm25=env_snapshot.pm25,
        env_data_source=env_snapshot.data_source,
        severity_grade=severity.value,
        model_version='yolov8s-v1.0_mobilenetv2-v1.0',  # increment on model updates
        inference_ms=ml_result.inference_ms,
        observations=decision.observations,
        lesion_count_total=counts.total,
        lesion_count_comedone=counts.comedone,
        lesion_count_papule=counts.papule,
        lesion_count_pustule=counts.pustule,
        lesion_count_nodule=counts.nodule,
    )
    db.add(checkin_row)

    for det in ml_result.detections:
        db.add(LesionDetectionModel(
            id=uuid4(),
            checkin_id=checkin_id,
            class_id=det.class_id,
            class_name=det.class_name,
            bbox_x=det.bbox_x,
            bbox_y=det.bbox_y,
            bbox_w=det.bbox_w,
            bbox_h=det.bbox_h,
            confidence=det.confidence,
            low_conf=det.low_conf,
        ))

    # Update user skin type fields
    previous_skin_type = current_user.skin_type_confirmed or current_user.skin_type_predicted
    current_user.skin_type_predicted  = fusion.predicted_label
    current_user.skin_type_confidence = fusion.confidence
    current_user.skin_type_source     = fusion.signal_source
    if current_user.skin_type_source != 'user_override':
        current_user.skin_type_confirmed = fusion.predicted_label

    # Insert skin_type_history row
    db.add(SkinTypeHistoryModel(
        id=uuid4(),
        user_id=uuid.UUID(str(current_user.id)),
        previous_value=previous_skin_type,
        new_value=fusion.predicted_label,
        source='model_prediction',
        confidence=fusion.confidence,
    ))

    await db.commit()

    # ── Step 10: Build and return response ────────────────────────────────
    return CheckinResult(
        checkin_id=str(checkin_row.id),
        image_url=image_url,
        captured_at=exif.captured_at,
        severity_grade=severity.value, # type: ignore
        lesion_summary=LesionSummary(
            comedone=counts.comedone,
            papule=counts.papule,
            pustule=counts.pustule,
            nodule=counts.nodule,
            total=counts.total,
            inflammatory_ratio=round(counts.inflammatory_ratio, 4),
        ),
        detections=[
            DetectionPublic(
                class_id=d.class_id, class_name=d.class_name,
                bbox_x=d.bbox_x, bbox_y=d.bbox_y,
                bbox_w=d.bbox_w, bbox_h=d.bbox_h,
                confidence=d.confidence, low_conf=d.low_conf,
            ) for d in ml_result.detections
        ],
        skin_type_result=SkinTypePublic(
            predicted_label=fusion.predicted_label,
            confidence=fusion.confidence,
            low_confidence=fusion.low_confidence,
            signal_source=fusion.signal_source,
            fused_vector=fusion.fused_vector,
            cnn_vector=fusion.cnn_vector,
            ques_vector=fusion.ques_vector,
        ),
        env_snapshot=EnvSnapshotPublic(
            temperature=env_snapshot.temperature,
            humidity=env_snapshot.humidity,
            uv_index=env_snapshot.uv_index,
            pm25=env_snapshot.pm25,
            data_source=env_snapshot.data_source,
        ),
        observations=decision.observations,
        active_ingredients=[IngredientPublic.model_validate(i) for i in active_ingredients],
        inference_ms=ml_result.inference_ms,
    )


@router.get('/checkins', response_model=dict)
async def list_checkins(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Paginated check-in timeline. Returns lightweight summaries — no detections array.
    Ordered reverse-chronological (most recent first).
    """
    offset = (page - 1) * page_size
    user_uuid = uuid.UUID(str(current_user.id))

    total_count = await db.scalar(
        select(func.count()).where(CheckinModel.user_id == user_uuid)
    )
    rows = await db.scalars(
        select(CheckinModel)
        .where(CheckinModel.user_id == user_uuid)
        .order_by(CheckinModel.captured_at.desc())
        .offset(offset)
        .limit(page_size)
    )
    checkins = list(rows.all())

    summaries = []
    for c in checkins:
        summaries.append({
            'id':            str(c.id),
            'captured_at':   c.captured_at.isoformat(),
            'severity_grade': c.severity_grade,
            'thumbnail_url': None,   # MinIO presigned URL — implement in Phase 2
            'lesion_counts': {
                'comedone': c.lesion_count_comedone,
                'papule':   c.lesion_count_papule,
                'pustule':  c.lesion_count_pustule,
                'nodule':   c.lesion_count_nodule,
                'total':    c.lesion_count_total,
            },
        })

    return {
        'checkins':    summaries,
        'total':       total_count or 0,
        'page':        page,
        'page_size':   page_size,
        'has_next':    (offset + page_size) < (total_count or 0),
    }


@router.get('/checkins/{checkin_id}', response_model=CheckinResult)
async def get_checkin_detail(
    checkin_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Returns full detail for a single historical check-in including all detections.
    Observations are not re-generated — they were stored at check-in time.
    """
    try:
        checkin_uuid = uuid.UUID(checkin_id)
        user_uuid = uuid.UUID(str(current_user.id))
    except ValueError:
        raise HTTPException(status_code=400, detail='Invalid checkin ID format.')

    from sqlalchemy.orm import selectinload

    row = await db.scalar(
        select(CheckinModel)
        .options(selectinload(CheckinModel.lesion_detections))
        .where(CheckinModel.id == checkin_uuid, CheckinModel.user_id == user_uuid)
    )
    if not row:
        raise HTTPException(status_code=404, detail='Check-in not found.')

    dets = row.lesion_detections
    
    # Fetch active ingredients at the time of checkin
    active_ingredients_rows = await db.scalars(
        select(IngredientModel)
        .where(
            IngredientModel.user_id == user_uuid,
            IngredientModel.started_at <= row.captured_at.date(),
            or_(
                IngredientModel.discontinued_at == None,
                IngredientModel.discontinued_at >= row.captured_at.date(),
            ),
        )
    )
    active_ingredients = list(active_ingredients_rows.all())

    # Reconstruct LesionSummary
    total = row.lesion_count_total
    inflammatory = row.lesion_count_papule + row.lesion_count_pustule + row.lesion_count_nodule
    inf_ratio = inflammatory / total if total > 0 else 0.0

    # For SkinTypePublic, fetch active questionnaire or use user fields
    active_ques_result = await db.scalars(
        select(QuestionnaireResponseModel)
        .where(
            QuestionnaireResponseModel.user_id == user_uuid,
            QuestionnaireResponseModel.is_active == True,
        )
        .order_by(QuestionnaireResponseModel.created_at.desc())
        .limit(1)
    )
    active_ques = active_ques_result.first()
    
    # Construct SkinTypePublic
    fused_vector = {'p_dry': 0.33, 'p_balanced': 0.34, 'p_oily': 0.33}
    cnn_vector = None
    ques_vector = None
    if active_ques:
        ques_vector = {'p_dry': active_ques.p_dry, 'p_balanced': active_ques.p_balanced, 'p_oily': active_ques.p_oily}
        if active_ques.fused_p_dry is not None:
            fused_vector = {'p_dry': active_ques.fused_p_dry, 'p_balanced': active_ques.fused_p_balanced, 'p_oily': active_ques.fused_p_oily}
        if active_ques.cnn_p_dry is not None:
            cnn_vector = {'p_dry': active_ques.cnn_p_dry, 'p_balanced': active_ques.cnn_p_balanced, 'p_oily': active_ques.cnn_p_oily}

    return CheckinResult(
        checkin_id=str(row.id),
        image_url=row.image_url,
        captured_at=row.captured_at,
        severity_grade=row.severity_grade,
        lesion_summary=LesionSummary(
            comedone=row.lesion_count_comedone,
            papule=row.lesion_count_papule,
            pustule=row.lesion_count_pustule,
            nodule=row.lesion_count_nodule,
            total=row.lesion_count_total,
            inflammatory_ratio=round(inf_ratio, 4),
        ),
        detections=[
            DetectionPublic(
                class_id=0, class_name=d.class_name,
                bbox_x=d.bbox_x, bbox_y=d.bbox_y,
                bbox_w=d.bbox_w, bbox_h=d.bbox_h,
                confidence=d.confidence, low_conf=d.low_conf,
            ) for d in dets
        ],
        skin_type_result=SkinTypePublic(
            predicted_label=current_user.skin_type_predicted or 'balanced',
            confidence=current_user.skin_type_confidence or 0.0,
            low_confidence=False,
            signal_source=current_user.skin_type_source or 'none',
            fused_vector=fused_vector,
            cnn_vector=cnn_vector,
            ques_vector=ques_vector,
        ),
        env_snapshot=EnvSnapshotPublic(
            temperature=row.env_temperature,
            humidity=row.env_humidity,
            uv_index=row.env_uv_index,
            pm25=row.env_pm25,
            data_source=row.env_data_source or 'open-meteo',
        ),
        observations=row.observations,
        active_ingredients=[IngredientPublic.model_validate(i) for i in active_ingredients],
        inference_ms=row.inference_ms or 0,
    )
