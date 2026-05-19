from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional
from datetime import datetime
from uuid import UUID

class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    skinType: Optional[str] = None

class UserOut(UserBase):
    id: UUID
    is_active: bool
    is_superuser: bool
    
    skin_type_confirmed: Optional[str] = None
    skin_type_predicted: Optional[str] = None
    skin_type_confidence: Optional[float] = None
    skin_type_source: Optional[str] = None
    
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
