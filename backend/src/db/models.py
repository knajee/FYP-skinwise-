import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, Float, Integer, ForeignKey, DateTime, JSON, Text, Uuid
from sqlalchemy.orm import relationship
from src.db.database import Base

def get_utc_now():
    return datetime.now(timezone.utc)

class User(Base):
    __tablename__ = "users"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    
    skin_type_confirmed = Column(String(50), nullable=True)
    skin_type_predicted = Column(String(50), nullable=True)
    skin_type_confidence = Column(Float, nullable=True)
    skin_type_source = Column(String(50), nullable=True)
    
    created_at = Column(DateTime(timezone=True), default=get_utc_now)
    updated_at = Column(DateTime(timezone=True), default=get_utc_now, onupdate=get_utc_now)
    deleted_at = Column(DateTime(timezone=True), nullable=True)

    questionnaire_responses = relationship("QuestionnaireResponse", back_populates="user", cascade="all, delete-orphan")
    skin_type_history = relationship("SkinTypeHistory", back_populates="user", cascade="all, delete-orphan")
    checkins = relationship("Checkin", back_populates="user", cascade="all, delete-orphan")
    ingredients = relationship("Ingredient", back_populates="user", cascade="all, delete-orphan")

class QuestionnaireResponse(Base):
    __tablename__ = "questionnaire_responses"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(Uuid(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    answers = Column(JSON, nullable=False) # Store the key-value answers
    p_dry = Column(Float, nullable=False)
    p_balanced = Column(Float, nullable=False)
    p_oily = Column(Float, nullable=False)
    
    # CNN and Fused vectors
    cnn_p_dry = Column(Float, nullable=True)
    cnn_p_balanced = Column(Float, nullable=True)
    cnn_p_oily = Column(Float, nullable=True)
    
    fused_p_dry = Column(Float, nullable=True)
    fused_p_balanced = Column(Float, nullable=True)
    fused_p_oily = Column(Float, nullable=True)
    
    predicted_label = Column(String(50), nullable=True)
    signal_source = Column(String(50), nullable=True)
    is_active = Column(Boolean, default=True)
    
    created_at = Column(DateTime(timezone=True), default=get_utc_now)

    user = relationship("User", back_populates="questionnaire_responses")

class SkinTypeHistory(Base):
    __tablename__ = "skin_type_history"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(Uuid(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    previous_value = Column(String(50), nullable=True)
    new_value = Column(String(50), nullable=False)
    source = Column(String(100), nullable=False) # e.g., 'Model prediction' or 'You adjusted this'
    confidence = Column(Float, nullable=True)
    
    timestamp = Column(DateTime(timezone=True), default=get_utc_now)

    user = relationship("User", back_populates="skin_type_history")

class Checkin(Base):
    __tablename__ = "checkins"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(Uuid(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    image_url = Column(String(1024), nullable=True)
    severity_grade = Column(String(50), nullable=False)
    
    lesion_count_total = Column(Integer, default=0)
    lesion_count_comedone = Column(Integer, default=0)
    lesion_count_papule = Column(Integer, default=0)
    lesion_count_pustule = Column(Integer, default=0)
    lesion_count_nodule = Column(Integer, default=0)
    
    env_uv_index = Column(Float, nullable=True)
    env_temperature = Column(Float, nullable=True)
    env_humidity = Column(Float, nullable=True)
    env_pm25 = Column(Float, nullable=True)
    
    captured_at = Column(DateTime(timezone=True), default=get_utc_now)
    created_at = Column(DateTime(timezone=True), default=get_utc_now)
    
    observations = Column(JSON, nullable=False)
    
    env_data_source = Column(String(50), nullable=True)
    model_version = Column(String(100), nullable=True)
    inference_ms = Column(Integer, nullable=True)
    image_hash = Column(String(64), nullable=True)
    lat_rounded = Column(Float, nullable=True)
    lng_rounded = Column(Float, nullable=True)

    user = relationship("User", back_populates="checkins")
    lesion_detections = relationship("LesionDetection", back_populates="checkin", cascade="all, delete-orphan")

class LesionDetection(Base):
    __tablename__ = "lesion_detections"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    checkin_id = Column(Uuid(as_uuid=True), ForeignKey("checkins.id", ondelete="CASCADE"), nullable=False)
    
    class_id = Column(Integer, nullable=False, default=0)
    class_name = Column(String(50), nullable=False)
    confidence = Column(Float, nullable=False)
    
    # Normalized coordinates [0-1]
    bbox_x = Column(Float, nullable=False)
    bbox_y = Column(Float, nullable=False)
    bbox_w = Column(Float, nullable=False)
    bbox_h = Column(Float, nullable=False)
    
    low_conf = Column(Boolean, default=False)

    checkin = relationship("Checkin", back_populates="lesion_detections")

class Ingredient(Base):
    __tablename__ = "ingredients"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(Uuid(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    name = Column(String(255), nullable=False)
    category = Column(String(100), nullable=True)
    concentration = Column(String(100), nullable=True)
    frequency = Column(String(100), nullable=True)
    
    started_at = Column(DateTime(timezone=True), default=get_utc_now)
    discontinued_at = Column(DateTime(timezone=True), nullable=True)
    
    created_at = Column(DateTime(timezone=True), default=get_utc_now)
    updated_at = Column(DateTime(timezone=True), default=get_utc_now, onupdate=get_utc_now)

    user = relationship("User", back_populates="ingredients")
